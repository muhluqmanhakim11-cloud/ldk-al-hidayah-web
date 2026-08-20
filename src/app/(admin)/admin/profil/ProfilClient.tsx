"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type Profile = {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  orderIndex: number;
  status: string;
};

export default function ProfilClient() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({ id: 0, title: "", content: "", imageUrl: "", orderIndex: 0, status: "PUBLISHED" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/profiles");
      if (res.ok) {
        setProfiles(await res.json());
      }
    } catch (error) {
      toast.error("Gagal mengambil data profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const isEditing = formData.id !== 0;
      const url = isEditing ? `/api/admin/profiles/${formData.id}` : "/api/admin/profiles";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan");

      toast.success("Profil berhasil disimpan");
      setIsModalOpen(false);
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus bagian profil ini?")) return;

    try {
      const res = await fetch(`/api/admin/profiles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      
      toast.success("Profil berhasil dihapus");
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openAddModal = () => {
    setFormData({ id: 0, title: "", content: "", imageUrl: "", orderIndex: profiles.length + 1, status: "PUBLISHED" });
    setIsModalOpen(true);
  };

  const openEditModal = (profile: Profile) => {
    setFormData(profile);
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-center py-10">Memuat data...</div>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openAddModal} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
          + Tambah Bagian Profil
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-700 w-16">Urutan</th>
              <th className="p-4 font-semibold text-gray-700">Judul</th>
              <th className="p-4 font-semibold text-gray-700">Konten Singkat</th>
              <th className="p-4 font-semibold text-gray-700 w-32">Status</th>
              <th className="p-4 font-semibold text-gray-700 w-48 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Belum ada data profil</td></tr>
            ) : profiles.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-center">{p.orderIndex}</td>
                <td className="p-4 font-medium">{p.title}</td>
                <td className="p-4 text-sm text-gray-600 truncate max-w-xs">{p.content.substring(0, 100)}...</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-bold ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEditModal(p)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-sm">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{formData.id ? "Edit" : "Tambah"} Bagian Profil</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul Bagian (Contoh: Visi, Misi, Sejarah)</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logo / Gambar (Opsional)</label>
                <div className="flex items-center gap-4 mb-2">
                  {formData.imageUrl ? (
                    <div className="relative w-16 h-16 rounded overflow-hidden border border-gray-200">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 border border-gray-200">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                  )}
                  <label className="cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                    Pilih File (Choose File)
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        const uploadData = new FormData();
                        uploadData.append("file", file);
                        uploadData.append("folder", "ldk-alhidayah/profil");
                        
                        try {
                          const res = await fetch("/api/admin/upload", { method: "POST", body: uploadData });
                          const data = await res.json();
                          if (res.ok) {
                            setFormData(prev => ({ ...prev, imageUrl: data.url }));
                          } else {
                            toast.error(data.error || "Upload gagal");
                          }
                        } catch (err) {
                          toast.error("Terjadi kesalahan saat upload");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Konten (Bisa gunakan HTML/Teks biasa)</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border rounded px-3 py-2" rows={6}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nomor Urut Tampil</label>
                  <input required type="number" value={formData.orderIndex} onChange={e => setFormData({...formData, orderIndex: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                  {submitting ? "Menyimpan..." : "Simpan (Otomatis Publish)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
