"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { UploadButton } from "@/components/UploadButton"; // Assume standard upload button exists, or just use text input
import { Loader2, Plus, Trash2, Edit } from "lucide-react";

export default function HeroImagesAdmin() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState("");

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

  const [uploading, setUploading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl) return toast.error("Silakan pilih file gambar");
    
    try {
      const res = await fetch("/api/admin/hero-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: newImageUrl, isActive: true, orderIndex: images.length }),
      });
      if (res.ok) {
        toast.success("Gambar berhasil ditambahkan");
        setNewImageUrl("");
        // Reset file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchImages();
      } else throw new Error();
    } catch (e) {
      toast.error("Gagal menambah gambar");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("File harus berupa gambar");
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Ukuran gambar maksimal 5MB");
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "ldk-alhidayah/hero-images");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setNewImageUrl(data.url);
      toast.success("Gambar berhasil diunggah, silakan klik Tambah");
    } catch (err) {
      toast.error("Gagal mengunggah gambar");
      e.target.value = ""; // Reset
    } finally {
      setUploading(false);
    }
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

      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Tambah Gambar Baru</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Pilih File Gambar</label>
            <input 
              id="file-upload"
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="w-full border rounded-md px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {newImageUrl && <p className="text-xs text-green-600 mt-2">✓ Gambar siap ditambahkan</p>}
          </div>
          <button 
            type="submit" 
            disabled={uploading || !newImageUrl}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto self-end"
          >
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            {uploading ? "Mengunggah..." : "Tambah Gambar"}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-green-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((img) => (
            <div key={img.id} className="border rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
              <div className="relative h-48 bg-gray-100">
                <Image src={img.imageUrl} alt="Hero" fill className="object-cover" />
              </div>
              <div className="p-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={img.isActive} 
                    onChange={() => toggleActive(img.id, img.isActive)}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm font-medium">Aktif</span>
                </div>
                <button onClick={() => handleDelete(img.id)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full text-center p-12 text-gray-500 border rounded-xl border-dashed">
              Belum ada gambar hero. Tambahkan gambar pertama Anda.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
