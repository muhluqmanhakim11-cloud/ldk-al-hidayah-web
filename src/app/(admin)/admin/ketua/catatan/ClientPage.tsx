"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, RefreshCw, Trash2, FileText } from "lucide-react";
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
      const res = await fetch("/api/admin/ketua/catatan");
      const json = await res.json();
      setData(json);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus catatan ini?")) return;
    try {
      const res = await fetch(`/api/admin/ketua/catatan/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Catatan berhasil dihapus");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menghapus catatan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/ketua/catatan", {
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
        const err = await res.json();
        toast.error(err.error || "Gagal menambah catatan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: "Tanggal", accessor: (row: any) => new Date(row.createdAt).toLocaleDateString("id-ID") },
    { header: "Judul Catatan", accessor: "title" },
    { header: "Isi Catatan", accessor: (row: any) => <div className="max-w-xs truncate">{row.content}</div> },
    { header: "Penulis", accessor: "authorName" },
    {
      header: "Aksi",
      accessor: (row: any) => (
        <div className="flex gap-2">
          {row.canDelete && (
            <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded" title="Hapus Catatan">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center space-x-3 mb-1">
             <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <FileText size={24} />
             </div>
             <h1 className="text-2xl font-bold text-gray-800">Catatan Ketua / Umum</h1>
          </div>
          <p className="text-gray-500 mt-1 ml-11">Simpan notulensi, instruksi, atau ide penting</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-medium"
          >
            <Plus size={20} /> Tulis Catatan
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {isLoading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-blue-500" /></div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Cari catatan..."
          />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Buat Catatan Baru">
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Judul Catatan</label>
            <input type="text" required placeholder="Misal: Notulensi Rapat Pleno" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Isi Catatan</label>
            <textarea required rows={5} placeholder="Tulis catatan lengkap di sini..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 font-medium transition-colors">
              {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : "Simpan Catatan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
