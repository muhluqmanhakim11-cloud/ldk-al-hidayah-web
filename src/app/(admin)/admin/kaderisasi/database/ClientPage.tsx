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

  const [formData, setFormData] = useState({ nim: '', nama: '', prodiAngkatan: '', gender: 'Ikhwan', noWa: '', divisi: '', statusKaderisasi: 'Aktif', skills: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/kaderisasi/database");
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
      const res = await fetch("/api/admin/kaderisasi/database", { method: "DELETE" });
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
      const res = await fetch(`/api/admin/kaderisasi/database/${id}`, { method: "DELETE" });
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

      const res = await fetch("/api/admin/kaderisasi/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Data berhasil disimpan");
        setIsFormOpen(false);
        fetchData();
        setFormData({ nim: '', nama: '', prodiAngkatan: '', gender: 'Ikhwan', noWa: '', divisi: '', statusKaderisasi: 'Aktif', skills: '' });
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

    { header: "NIM", accessor: "nim" },
    { header: "Nama", accessor: "nama" },
    { header: "Prodi/Angkt", accessor: "prodiAngkatan" },
    { header: "Gender", accessor: "gender" },
    { header: "Divisi", accessor: "divisi" },
    { header: "Status", accessor: (row: any) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${row.statusKaderisasi === 'Aktif' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
        {row.statusKaderisasi}
      </span>
    ) },

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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Database Kader</h1>
          <p className="text-gray-500 mt-1">Kelola data database kader</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          
          <button
            onClick={handleDeleteAll}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium flex-1 sm:flex-none"
          >
            <Trash2 size={20} /> Hapus Semua
          </button>
<button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm flex-1 sm:flex-none"
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

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">NIM</label><input type="text" required value={formData.nim} onChange={e => setFormData({...formData, nim: e.target.value})} className="w-full border rounded-lg p-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Nama Lengkap</label><input type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Prodi & Angkatan</label><input type="text" required placeholder="Misal: IF 2026" value={formData.prodiAngkatan} onChange={e => setFormData({...formData, prodiAngkatan: e.target.value})} className="w-full border rounded-lg p-2" /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border rounded-lg p-2">
                <option value="Ikhwan">Ikhwan</option>
                <option value="Akhwat">Akhwat</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">No. WA</label><input type="text" value={formData.noWa} onChange={e => setFormData({...formData, noWa: e.target.value})} className="w-full border rounded-lg p-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Divisi Penempatan</label><input type="text" value={formData.divisi} onChange={e => setFormData({...formData, divisi: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Status Kaderisasi</label><input type="text" value={formData.statusKaderisasi} onChange={e => setFormData({...formData, statusKaderisasi: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Skills / Keahlian</label><textarea rows={2} value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full border rounded-lg p-2" /></div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
