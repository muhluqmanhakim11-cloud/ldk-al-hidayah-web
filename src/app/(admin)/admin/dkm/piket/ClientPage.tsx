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

  const [formData, setFormData] = useState({ tanggal: new Date().toISOString().slice(0,10), zonaArea: '', penanggungJawab: '', checklistTugas: '', statusKebersihan: 'Belum Selesai' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/dkm/piket");
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
      const res = await fetch("/api/admin/dkm/piket", { method: "DELETE" });
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
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      const res = await fetch(`/api/admin/dkm/piket/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Berhasil dihapus");
        fetchData();
      } else {
        toast.error("Gagal menghapus data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      // Convert dates to ISO string if exists
      if ('tanggal' in payload) payload.tanggal = new Date(payload.tanggal as string).toISOString();
      if ('tanggalPosting' in payload) payload.tanggalPosting = new Date(payload.tanggalPosting as string).toISOString();
      if ('jadwal' in payload) payload.jadwal = new Date(payload.jadwal as string).toISOString();

      const res = await fetch("/api/admin/dkm/piket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Data berhasil disimpan");
        setIsFormOpen(false);
        fetchData();
        setFormData({ tanggal: new Date().toISOString().slice(0,10), zonaArea: '', penanggungJawab: '', checklistTugas: '', statusKebersihan: 'Belum Selesai' });
      } else {
        toast.error("Gagal menyimpan data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [

    { header: "Tanggal", accessor: (row: any) => new Date(row.tanggal as string).toLocaleDateString("id-ID") },
    { header: "Zona Area", accessor: "zonaArea" },
    { header: "Penanggung Jawab", accessor: "penanggungJawab" },
    { header: "Status", accessor: (row: any) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${row.statusKebersihan === 'Selesai' ? 'bg-green-100 text-green-700 dark:text-green-400' : 'bg-red-100 text-red-700 dark:text-red-400'}`}>
        {row.statusKebersihan}
      </span>
    ) },

    {
      header: "Aksi",
      accessor: (row: any) => (
        <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 p-1">
          <Trash2 size={18} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Piket Kebersihan</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola data piket kebersihan</p>
        </div>
        <div className="flex flex-wrap gap-3">
          
          <button
            onClick={handleDeleteAll}
            className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium flex-1 sm:flex-none"
          >
            <Trash2 size={20} /> <span className="whitespace-nowrap">Hapus Semua</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm flex-1 sm:flex-none"
          >
            <Plus size={20} /> <span className="whitespace-nowrap">Tambah Data</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
        {isLoading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-blue-500" /></div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Cari data..."
          />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Tambah Data Baru">
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>

          <div><label className="block text-sm font-medium mb-1">Tanggal</label><input type="date" required value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Zona Area</label><input type="text" required placeholder="Misal: Area Dalam Musala" value={formData.zonaArea} onChange={e => setFormData({...formData, zonaArea: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Penanggung Jawab</label><input type="text" required value={formData.penanggungJawab} onChange={e => setFormData({...formData, penanggungJawab: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Checklist Tugas</label><textarea rows={3} value={formData.checklistTugas} onChange={e => setFormData({...formData, checklistTugas: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Status Kebersihan</label>
            <select value={formData.statusKebersihan} onChange={e => setFormData({...formData, statusKebersihan: e.target.value})} className="w-full border rounded-lg p-2">
              <option value="Belum Selesai">Belum Selesai</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
