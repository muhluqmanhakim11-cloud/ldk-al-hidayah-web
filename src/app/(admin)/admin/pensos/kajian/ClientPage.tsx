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

  const [formData, setFormData] = useState({ namaKelas: '', kategori: '', level: 'Pemula', noPertemuan: 1, deskripsiMateri: '', linkFile: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/pensos/kajian");
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
      const res = await fetch("/api/admin/pensos/kajian", { method: "DELETE" });
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
      const res = await fetch(`/api/admin/pensos/kajian/${id}`, { method: "DELETE" });
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

      const res = await fetch("/api/admin/pensos/kajian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Data berhasil disimpan");
        setIsFormOpen(false);
        fetchData();
        setFormData({ namaKelas: '', kategori: '', level: 'Pemula', noPertemuan: 1, deskripsiMateri: '', linkFile: '' });
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

    { header: "Nama Kelas", accessor: "namaKelas" },
    { header: "Kategori", accessor: "kategori" },
    { header: "Level", accessor: "level" },
    { header: "Pertemuan Ke-", accessor: "noPertemuan" },
    { header: "Modul", accessor: (row: any) => row.linkFile ? <a href={row.linkFile} target="_blank" className="text-blue-500 hover:underline">Lihat Modul</a> : '-' },

    {
      header: "Aksi",
      accessor: (row: any) => (
        <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 p-1">
          <Trash2 size={18} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Silabus Kajian & IT</h1>
          <p className="text-gray-500 mt-1">Kelola data silabus kajian & it</p>
        </div>
        <div className="flex gap-3">
          
          <button
            onClick={handleDeleteAll}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-medium"
          >
            <Trash2 size={20} /> Hapus Semua
          </button>
<button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus size={20} /> Tambah Data
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
            searchPlaceholder="Cari data..."
          />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Tambah Data Baru">
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>

          <div><label className="block text-sm font-medium mb-1">Nama Kelas</label><input type="text" required value={formData.namaKelas} onChange={e => setFormData({...formData, namaKelas: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Kategori</label><input type="text" required placeholder="Misal: IT / Tahsin" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} className="w-full border rounded-lg p-2" /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full border rounded-lg p-2">
                <option value="Pemula">Pemula</option>
                <option value="Menengah">Menengah</option>
                <option value="Lanjut">Lanjut</option>
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Nomor Pertemuan</label><input type="number" min="1" required value={formData.noPertemuan} onChange={e => setFormData({...formData, noPertemuan: parseInt(e.target.value)})} className="w-full border rounded-lg p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Deskripsi Materi</label><textarea rows={3} value={formData.deskripsiMateri} onChange={e => setFormData({...formData, deskripsiMateri: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Link File Silabus/Modul (URL)</label><input type="url" value={formData.linkFile} onChange={e => setFormData({...formData, linkFile: e.target.value})} className="w-full border rounded-lg p-2" /></div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
