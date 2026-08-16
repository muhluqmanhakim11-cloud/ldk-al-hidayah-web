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

  const [formData, setFormData] = useState({ topikLatihan: '', kategori: 'Seni/Hadrah/Taklim', jadwal: new Date().toISOString().slice(0,10), lokasi: '', pemateri: '', targetPeserta: '', status: 'Terjadwal' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/seni-olahraga/agenda");
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
      const res = await fetch("/api/admin/seni-olahraga/agenda", { method: "DELETE" });
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
      const res = await fetch(`/api/admin/seni-olahraga/agenda/${id}`, { method: "DELETE" });
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

      const res = await fetch("/api/admin/seni-olahraga/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Data berhasil disimpan");
        setIsFormOpen(false);
        fetchData();
        setFormData({ topikLatihan: '', kategori: 'Seni/Hadrah/Taklim', jadwal: new Date().toISOString().slice(0,10), lokasi: '', pemateri: '', targetPeserta: '', status: 'Terjadwal' });
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

    { header: "Jadwal", accessor: (row: any) => new Date(row.jadwal as string).toLocaleDateString("id-ID") },
    { header: "Topik Latihan", accessor: "topikLatihan" },
    { header: "Kategori", accessor: "kategori" },
    { header: "Lokasi", accessor: "lokasi" },
    { header: "Status", accessor: (row: any) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
        {row.status}
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agenda Latihan</h1>
          <p className="text-gray-500 mt-1">Kelola data agenda latihan</p>
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

          <div><label className="block text-sm font-medium mb-1">Topik Latihan</label><input type="text" required value={formData.topikLatihan} onChange={e => setFormData({...formData, topikLatihan: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} className="w-full border rounded-lg p-2">
              <option value="Seni/Hadrah/Taklim">Seni/Hadrah/Taklim</option>
              <option value="Olahraga">Olahraga</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Jadwal</label><input type="date" required value={formData.jadwal} onChange={e => setFormData({...formData, jadwal: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Lokasi</label><input type="text" required value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Pemateri / Pelatih</label><input type="text" required value={formData.pemateri} onChange={e => setFormData({...formData, pemateri: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Target Peserta</label><input type="text" value={formData.targetPeserta} onChange={e => setFormData({...formData, targetPeserta: e.target.value})} className="w-full border rounded-lg p-2" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2">
              <option value="Terjadwal">Terjadwal</option>
              <option value="Berlangsung">Berlangsung</option>
              <option value="Selesai">Selesai</option>
              <option value="Batal">Batal</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
