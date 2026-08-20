"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

export default function ClientPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/dkm/catatan");
      const json = await res.json();
      setData(json);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleDeleteAll = async () => {
    if (!confirm("Peringatan Keras: Anda yakin ingin menghapus SEMUA data di halaman ini? Aksi ini tidak dapat dibatalkan!")) return;
    try {
      const res = await fetch("/api/admin/dkm/catatan", { method: "DELETE" });
      if (res.ok) {
        toast.success("Seluruh data berhasil dihapus");
        fetchData();
      } else {
        toast.error("Gagal menghapus semua data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus catatan ini?")) return;
    try {
      const res = await fetch(`/api/admin/dkm/catatan/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Catatan berhasil dihapus");
        fetchData();
      } else {
        toast.error("Gagal menghapus catatan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/dkm/catatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Catatan berhasil ditambahkan");
        setIsFormOpen(false);
        fetchData();
        setFormData({ title: '', content: '' });
      } else {
        toast.error("Gagal menambah catatan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: "Tanggal", accessor: (row: any) => new Date(row.createdAt as string).toLocaleDateString("id-ID") },
    { header: "Judul Catatan", accessor: "title" },
    { header: "Isi Catatan", accessor: (row: any) => <div className="max-w-xs truncate">{row.content}</div> },
    { header: "Penulis", accessor: "authorName" },
    {
      header: "Aksi",
      accessor: (row: any) => (
        <div className="flex gap-2">
          {row.canDelete && (
            <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 p-1 bg-red-50 dark:bg-red-900/30 rounded" title="Hapus Catatan">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Catatan DKM</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Simpan notulensi, draf, atau ide internal divisi</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          
          <button
            onClick={handleDeleteAll}
            className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium flex-1 sm:flex-none"
          >
            <Trash2 size={20} /> Hapus Semua
          </button>
<button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm flex-1 sm:flex-none"
          >
            <Plus size={20} /> Tulis Catatan
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
        {isLoading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-blue-500" /></div>
        ) : (
          <DataTable data={data} columns={columns} searchPlaceholder="Cari catatan..." />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Buat Catatan Baru">
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Judul Catatan</label>
            <input type="text" required placeholder="Misal: Rapat Program" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Isi Catatan</label>
            <textarea required rows={5} placeholder="Tulis catatan di sini..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:bg-slate-700 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
              {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : "Simpan Catatan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
