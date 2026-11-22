"use client";

import { useState, useRef } from "react";
import { 
  Plus, Search, Edit3, Trash2, Eye, Heart, Film, 
  Upload, Link as LinkIcon, CheckCircle2, AlertCircle, 
  Play, Pause, Volume2, VolumeX, RefreshCw, Sparkles, ExternalLink, X
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDuration, getOptimizedVideoUrl, getVideoPosterUrl } from "@/lib/video-optimization";
import type { Reel } from "@/db/schema";

interface Props {
  initialReels: Reel[];
}

export default function ReelsClient({ initialReels }: Props) {
  const [reels, setReels] = useState<Reel[]>(initialReels);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form Fields
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [isLdkDai, setIsLdkDai] = useState(true);
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT" | "ARCHIVED">("PUBLISHED");
  const [videoSourceType, setVideoSourceType] = useState<"upload" | "url">("upload");

  // Preview Modal
  const [previewVideo, setPreviewVideo] = useState<Reel | null>(null);

  // Video input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Reels
  const filteredReels = reels.filter((r) => {
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.speaker && r.speaker.toLowerCase().includes(search.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  // Stats
  const totalViews = reels.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);
  const totalLikes = reels.reduce((acc, curr) => acc + (curr.likesCount || 0), 0);
  const totalPublished = reels.filter((r) => r.status === "PUBLISHED").length;

  const resetForm = () => {
    setTitle("");
    setSpeaker("");
    setIsLdkDai(true);
    setDescription("");
    setVideoUrl("");
    setThumbnailUrl("");
    setDuration(null);
    setOrderIndex(0);
    setStatus("PUBLISHED");
    setVideoSourceType("upload");
    setEditingReel(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reel: Reel) => {
    setEditingReel(reel);
    setTitle(reel.title);
    setSpeaker(reel.speaker || "");
    setIsLdkDai(reel.isLdkDai ?? true);
    setDescription(reel.description || "");
    setVideoUrl(reel.videoUrl);
    setThumbnailUrl(reel.thumbnailUrl || "");
    setDuration(reel.duration || null);
    setOrderIndex(reel.orderIndex || 0);
    setStatus(reel.status as any);
    setVideoSourceType("url");
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("File harus berupa video (MP4, WebM, MOV)");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 100MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Ambil upload signature dari server (request kecil < 1KB, aman dari limit Vercel)
      const sigRes = await fetch("/api/admin/reels/upload-signature", { method: "POST" });
      if (!sigRes.ok) {
        let errMessage = "Gagal meminta izin upload";
        try {
          const sigErr = await sigRes.json();
          if (sigErr?.error) errMessage = sigErr.error;
        } catch {
          // ignore
        }
        throw new Error(errMessage);
      }
      const sigData = await sigRes.json();
      const { signature, timestamp, apiKey, cloudName, folder } = sigData;

      // 2. Upload langsung dari browser ke API Cloudinary via XMLHttpRequest untuk tracking persentase nyata
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

      const result: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          try {
            const response = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(response);
            } else {
              reject(new Error(response?.error?.message || "Upload gagal"));
            }
          } catch {
            reject(new Error(`Server merespons status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Koneksi jaringan terputus saat mengunggah video"));
        };

        xhr.send(formData);
      });

      const secureUrl = result.secure_url;
      const optimized = getOptimizedVideoUrl(secureUrl);
      const poster = getVideoPosterUrl(secureUrl);

      setVideoUrl(optimized);
      if (!thumbnailUrl) {
        setThumbnailUrl(poster);
      }
      if (result.duration) {
        setDuration(Math.round(result.duration));
      }

      toast.success("Video berhasil diunggah & dikompresi otomatis!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Gagal mengunggah video");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveVideo = () => {
    setVideoUrl("");
    setThumbnailUrl("");
    setDuration(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Video berhasil dihapus");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul reels wajib diisi");
      return;
    }

    if (!videoUrl.trim()) {
      toast.error("Silakan unggah video atau masukkan URL video");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        speaker: speaker.trim() || null,
        isLdkDai,
        description: description.trim() || null,
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || null,
        duration: duration || null,
        orderIndex,
        status,
      };

      if (editingReel) {
        const res = await fetch(`/api/admin/reels/${editingReel.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memperbarui reels");

        setReels((prev) => prev.map((r) => (r.id === editingReel.id ? data.data : r)));
        toast.success("Reels dakwah berhasil diperbarui!");
      } else {
        const res = await fetch("/api/admin/reels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menambahkan reels");

        setReels((prev) => [data.data, ...prev]);
        toast.success("Reels dakwah berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Reels Dakwah ini?")) return;

    try {
      const res = await fetch(`/api/admin/reels/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menghapus");

      setReels((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reels dakwah berhasil dihapus");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus reels");
    }
  };

  const handleToggleStatus = async (reel: Reel) => {
    const nextStatus = reel.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/reels/${reel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah status");

      setReels((prev) => prev.map((r) => (r.id === reel.id ? data.data : r)));
      toast.success(`Status diubah ke ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-sm font-medium">Total Reels</span>
            <Film className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reels.length}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-sm font-medium">Terpublikasi</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalPublished}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-sm font-medium">Total Tayangan</span>
            <Eye className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalViews.toLocaleString()}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-sm font-medium">Total Likes</span>
            <Heart className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{totalLikes.toLocaleString()}</div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul, pembicara, deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3.5 py-2 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
          >
            <option value="ALL">Semua Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <a
            href="/reels"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Lihat Feed Reels
          </a>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-green-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Upload Reels Baru
          </button>
        </div>
      </div>

      {/* ── Reels Grid / Table ── */}
      {filteredReels.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Belum Ada Reels Dakwah</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            Mulai unggah video pendek dakwah untuk menyampaikan pesan kebaikan kepada jamaah.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Video Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredReels.map((reel) => {
            const isPublished = reel.status === "PUBLISHED";
            return (
              <div
                key={reel.id}
                className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Video Card Thumbnail */}
                <div 
                  className="relative aspect-[9/16] bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center"
                  onClick={() => setPreviewVideo(reel)}
                >
                  {reel.thumbnailUrl ? (
                    <img
                      src={reel.thumbnailUrl}
                      alt={reel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <video
                      src={reel.videoUrl}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-70 group-hover:opacity-90 transition-opacity" />

                  {/* Top Status & Duration */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                        isPublished
                          ? "bg-green-500/80 text-white"
                          : reel.status === "DRAFT"
                          ? "bg-amber-500/80 text-white"
                          : "bg-slate-500/80 text-white"
                      }`}
                    >
                      {reel.status}
                    </span>

                    {reel.duration && (
                      <span className="text-[11px] font-medium bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {formatDuration(reel.duration)}
                      </span>
                    )}
                  </div>

                  {/* Play Button Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-green-600 transition-all">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Stats Inside Thumbnail */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs text-white/90">
                    <div className="flex items-center gap-1.5 drop-shadow">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{reel.viewsCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 drop-shadow">
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span>{reel.likesCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm mb-1 leading-snug">
                      {reel.title}
                    </h4>
                    {reel.speaker && (
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                        {reel.speaker}
                      </p>
                    )}
                    {reel.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {reel.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleStatus(reel)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                        isPublished
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100"
                          : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100"
                      }`}
                    >
                      {isPublished ? "Jadikan Draft" : "Publikasikan"}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(reel)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit Reels"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(reel.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        title="Hapus Reels"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL TAMBAH / EDIT REELS ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {editingReel ? "Edit Reels Dakwah" : "Upload Reels Dakwah Baru"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Video otomatis dikompresi (720p HD) agar ringan & hemat kuota
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Pilihan Sumber Video */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Sumber Video Reels <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setVideoSourceType("upload")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                      videoSourceType === "upload"
                        ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-500"
                        : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSourceType("url")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                      videoSourceType === "url"
                        ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-500"
                        : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    Input Link Video URL
                  </button>
                </div>

                {videoSourceType === "upload" ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="video/mp4,video/webm,video/quicktime,video/mov"
                      className="hidden"
                    />
                    <div
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        isUploading
                          ? "border-green-400 bg-green-50/50 dark:bg-green-950/20"
                          : "border-gray-200 dark:border-slate-700 hover:border-green-500 hover:bg-green-50/30 dark:hover:bg-green-950/20"
                      }`}
                    >
                      {isUploading ? (
                        <div className="space-y-2">
                          <div className="w-8 h-8 mx-auto border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                            Mengunggah & Mengompresi Video... {uploadProgress}%
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
                            <div
                              className="bg-green-600 h-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Upload className="w-7 h-7 mx-auto text-gray-400" />
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Klik untuk memilih file video (MP4, MOV, WebM)
                          </p>
                          <p className="text-[11px] text-gray-400">
                            Maksimal 100MB. Sistem akan mengoptimasi video secara otomatis.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://.../video.mp4 atau link video Cloudinary"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}

                {/* Video Preview inside Modal */}
                {videoUrl && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl flex items-center justify-between gap-3 border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-24 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Video Berhasil Dipilih & Teroptimasi
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-xs">
                          {videoUrl}
                        </p>
                        {duration && (
                          <span className="text-[11px] text-gray-400 mt-1 inline-block">
                            Durasi: {formatDuration(duration)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tombol Hapus / Ganti Video */}
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0 border border-rose-200/60 dark:border-rose-900/40 active:scale-95"
                      title="Hapus video ini untuk memilih file lain"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus Video</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Judul & Pembicara */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Judul Reels Dakwah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Keutamaan Sholat Tepat Waktu"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Nama Pembicara / Da&apos;i (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ust. Luqman / Divisi Syiar"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
                  />
                  <label className="mt-2.5 flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isLdkDai}
                      onChange={(e) => setIsLdkDai(e.target.checked)}
                      className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      Tampilkan badge <span className="font-semibold text-green-600 dark:text-green-400">&ldquo;Da&apos;i LDK&rdquo;</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Deskripsi / Caption / Hashtags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Caption / Deskripsi & Hashtag
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan pesan dakwah, mutiara hikmah, atau hashtag #dakwah #pemudahijrah..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Status & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Status Publikasi
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
                  >
                    <option value="PUBLISHED">Published (Langsung Tayang di Feed)</option>
                    <option value="DRAFT">Draft (Disimpan Sementara)</option>
                    <option value="ARCHIVED">Archived (Diarsipkan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Urutan Tampil (Order Index)
                  </label>
                  <input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Custom Thumbnail (Opsional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  URL Thumbnail Cover (Opsional - Otomatis dibuat jika dikosongkan)
                </label>
                <input
                  type="url"
                  placeholder="https://.../cover.jpg"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-green-600/20 active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {editingReel ? "Simpan Perubahan" : "Publikasikan Reels"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL PREVIEW VIDEO ── */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            >
              ✕
            </button>
            <video
              src={previewVideo.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}

