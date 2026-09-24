"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Loader2, Trash2, UploadCloud, CheckCircle2, XCircle } from "lucide-react";

interface UploadStatus {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  url?: string;
}

export default function HeroImagesAdmin() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadQueue, setUploadQueue] = useState<UploadStatus[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/admin/hero-images");
      const data = await res.json();
      setImages(data);
    } catch (e) {
      toast.error("Gagal memuat gambar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newQueue: UploadStatus[] = files.map((f) => ({
      file: f,
      status: "pending",
    }));
    setUploadQueue(newQueue);
  };

  const handleUploadAll = async () => {
    if (uploadQueue.length === 0) return toast.error("Pilih gambar terlebih dahulu");
    setUploading(true);

    const updatedQueue = [...uploadQueue];

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.status === "done") continue;

      // Mark as uploading
      updatedQueue[i] = { ...item, status: "uploading" };
      setUploadQueue([...updatedQueue]);

      try {
        // Step 1: Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("folder", "ldk-alhidayah/hero-images");
        const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Upload gagal");
        const { url } = await uploadRes.json();

        // Step 2: Save to database
        const saveRes = await fetch("/api/admin/hero-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url, isActive: true, orderIndex: images.length + i }),
        });
        if (!saveRes.ok) throw new Error("Simpan gagal");

        updatedQueue[i] = { ...item, status: "done", url };
      } catch (err) {
        updatedQueue[i] = { ...item, status: "error" };
      }

      setUploadQueue([...updatedQueue]);
    }

    setUploading(false);
    const successCount = updatedQueue.filter((i) => i.status === "done").length;
    const failCount = updatedQueue.filter((i) => i.status === "error").length;
    if (successCount > 0) toast.success(`${successCount} gambar berhasil ditambahkan!`);
    if (failCount > 0) toast.error(`${failCount} gambar gagal diunggah`);
    fetchImages();

    // Reset after a bit
    setTimeout(() => {
      setUploadQueue([]);
      const fi = document.getElementById("file-upload") as HTMLInputElement;
      if (fi) fi.value = "";
    }, 3000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus gambar ini?")) return;
    try {
      const res = await fetch(`/api/admin/hero-images/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Gambar berhasil dihapus");
        fetchImages();
      } else throw new Error();
    } catch (e) {
      toast.error("Gagal menghapus gambar");
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/hero-images/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) fetchImages();
    } catch (e) {
      toast.error("Gagal update status");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manajemen Hero Images (Background Slide)</h1>
        <p className="text-gray-600">Atur gambar background yang muncul di halaman utama.</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Gambar Sekaligus</h2>
        <div className="flex flex-col gap-4">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 rounded-xl p-8 cursor-pointer hover:bg-green-50 transition-colors gap-3"
          >
            <UploadCloud size={40} className="text-green-500" />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">Klik untuk pilih gambar</p>
              <p className="text-xs text-gray-500 mt-1">Bisa pilih banyak sekaligus • JPG, PNG, WEBP • Maks 5MB/file</p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Queue Preview */}
          {uploadQueue.length > 0 && (
            <div className="flex flex-col gap-2">
              {uploadQueue.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border text-sm">
                  <div className="w-12 h-10 relative rounded overflow-hidden bg-gray-200 shrink-0">
                    {item.url ? (
                      <Image src={item.url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <span className="flex-1 truncate text-gray-700">{item.file.name}</span>
                  <span className="shrink-0">
                    {item.status === "pending" && <span className="text-gray-400 text-xs">Menunggu...</span>}
                    {item.status === "uploading" && <Loader2 size={16} className="animate-spin text-blue-500" />}
                    {item.status === "done" && <CheckCircle2 size={16} className="text-green-500" />}
                    {item.status === "error" && <XCircle size={16} className="text-red-500" />}
                  </span>
                </div>
              ))}
            </div>
          )}

          {uploadQueue.length > 0 && (
            <button
              onClick={handleUploadAll}
              disabled={uploading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
              {uploading
                ? `Mengunggah ${uploadQueue.filter((i) => i.status === "done").length}/${uploadQueue.length}...`
                : `Upload ${uploadQueue.length} Gambar Sekarang`}
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-green-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {images.map((img) => (
            <div key={img.id} className="border rounded-xl overflow-hidden bg-white shadow-sm flex flex-col group">
              <div className="relative h-44 bg-gray-100">
                <Image src={img.imageUrl} alt="Hero" fill className="object-cover" />
              </div>
              <div className="p-3 flex items-center justify-between bg-gray-50 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={img.isActive}
                    onChange={() => toggleActive(img.id, img.isActive)}
                    className="w-4 h-4 accent-green-600"
                  />
                  <span className={`text-sm font-medium ${img.isActive ? "text-green-700" : "text-gray-400"}`}>
                    {img.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </label>
                <button onClick={() => handleDelete(img.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full text-center p-12 text-gray-500 border rounded-xl border-dashed">
              Belum ada gambar hero. Upload gambar pertama Anda di atas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
