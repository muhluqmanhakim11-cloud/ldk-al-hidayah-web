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
  const [formData, setFormData] = useState({ 
    namaTokoh: '', kategori: 'Ulama / Kiai', tanggal: new Date().toISOString().slice(0,10), 
    tujuan: '', hasilKunjungan: '', pic: '', status: 'Terjadwal' 
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/pensos/kunjungan");
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
      const res = await fetch("/api/admin/pensos/kunjungan", { method: "DELETE" });
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
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    try {
      const res = await fetch(`/api/admin/pensos/kunjungan/${id}`, { method: "DELETE" });
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
      const payload = { ...formData, tanggal: new Date(formData.tanggal).toISOString() };
      const res = await fetch("/api/admin/pensos/kunjungan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Data berhasil ditambahkan");
        setIsFormOpen(false);
        fetchData();
        setFormData({ namaTokoh: '', kategori: 'Ulama / Kiai', tanggal: new Date().toISOString().slice(0,10), tujuan: '', hasilKunjungan: '', pic: '', status: 'Terjadwal' });
      } else {
        toast.error("Gagal menambah data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: "Tanggal", accessor: (row: any) => new Date(row.tanggal as string).toLocaleDateString("id-ID") },
    { header: "Nama Tokoh/Ulama", accessor: "namaTokoh" },
    { header: "Kategori", accessor: "kategori" },
    { header: "PIC", accessor: "pic" },
    { header: "Status", accessor: (row: any) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {row.status}
      </span>
    ) },
    {
      header: "Aksi",
      accessor: (row: any) => (
        <div className="flex gap-2">
          <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 p-1">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kunjungan Tokoh & Ulama</h1>
          <p className="text-gray-500 mt-1">Penjadwalan & rekaman kunjungan silaturahmi</p>
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
            <Plus size={20} /> Tambah Agenda
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {isLoading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-blue-500" /></div>
        ) : (
          <DataTable data={data} columns={columns} searchPlaceholder="Cari nama tokoh..." />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Tambah Agenda Kunjungan">
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Tokoh/Ulama</label>
            <input type="text" required value={formData.namaTokoh} onChange={e => setFormData({...formData, namaTokoh: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} className="w-full border rounded-lg p-2">
                <option value="Ulama / Kiai">Ulama / Kiai</option>
                <option value="Tokoh Masyarakat">Tokoh Masyarakat</option>
                <option value="Pejabat / Birokrat">Pejabat / Birokrat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input type="date" required value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="w-full border rounded-lg p-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tujuan / Agenda</label>
            <textarea required rows={2} value={formData.tujuan} onChange={e => setFormData({...formData, tujuan: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hasil Kunjungan (Opsional)</label>
            <textarea rows={2} value={formData.hasilKunjungan} onChange={e => setFormData({...formData, hasilKunjungan: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">PIC</label>
              <input type="text" required value={formData.pic} onChange={e => setFormData({...formData, pic: e.target.value})} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2">
                <option value="Terjadwal">Terjadwal</option>
                <option value="Selesai">Selesai</option>
                <option value="Batal">Batal</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
