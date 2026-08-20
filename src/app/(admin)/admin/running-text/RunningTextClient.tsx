"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/admin/Modal";

type RunningText = {
  id: number;
  text: string;
  isActive: boolean;
  orderIndex: number;
};

export default function RunningTextClient() {
  const [texts, setTexts] = useState<RunningText[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<RunningText>>({ id: 0, text: "", isActive: true, orderIndex: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/running-texts");
      const data = await res.json();
      setTexts(data);
    } catch (error) {
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = formData.id ? `/api/admin/running-texts/${formData.id}` : "/api/admin/running-texts";
      const method = formData.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(`Berhasil ${formData.id ? "diubah" : "ditambahkan"}`);
        setIsModalOpen(false);
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Terjadi kesalahan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const res = await fetch(`/api/admin/running-texts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Berhasil dihapus");
        fetchData();
      } else {
        toast.error("Gagal menghapus data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    }
  };

  const openAddModal = () => {
    setFormData({ id: 0, text: "", isActive: true, orderIndex: texts.length + 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (item: RunningText) => {
    setFormData(item);
    setIsModalOpen(true);
  };

  const toggleStatus = async (item: RunningText) => {
    try {
      const res = await fetch(`/api/admin/running-texts/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      if (res.ok) {
        fetchData();
      } else {
        toast.error("Gagal mengubah status");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
      <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
    </div>;
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-slate-950">
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">Daftar Running Text</h2>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus size={18} />
            <span>Tambah Teks</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-slate-950 border-b text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Teks</th>
                <th className="px-6 py-4 font-medium">Status Aktif</th>
                <th className="px-6 py-4 font-medium">Urutan</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {texts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Belum ada running text
                  </td>
                </tr>
              ) : (
                texts.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 dark:bg-slate-950">
                    <td className="px-6 py-4 font-medium">{item.text}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(item)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          item.isActive ? 'bg-green-100 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {item.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4">{item.orderIndex}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={formData.id ? "Edit Running Text" : "Tambah Running Text"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Teks / Pesan</label>
            <textarea 
              required 
              value={formData.text} 
              onChange={e => setFormData({...formData, text: e.target.value})} 
              className="w-full border rounded px-3 py-2" 
              rows={3}
              placeholder="Contoh: 🚀 Selamat datang di Website Resmi LDK Al-Hidayah..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Urutan Tampil (Opsional)</label>
            <input 
              type="number" 
              value={formData.orderIndex} 
              onChange={e => setFormData({...formData, orderIndex: parseInt(e.target.value) || 0})} 
              className="w-full border rounded px-3 py-2" 
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isActive" 
              checked={formData.isActive} 
              onChange={e => setFormData({...formData, isActive: e.target.checked})}
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
            />
            <label htmlFor="isActive" className="text-sm font-medium">Tampilkan teks ini</label>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
