"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import PrintHeader from "@/components/admin/PrintHeader";
import { Printer } from "lucide-react";

export default function ClientPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/dkm/inventaris");
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
      const res = await fetch("/api/admin/dkm/inventaris", { method: "DELETE" });
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
      const res = await fetch(`/api/admin/dkm/inventaris/${id}`, { method: "DELETE" });
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

  const [formData, setFormData] = useState({
    kodeBarang: "",
    namaBarang: "",
    kondisi: "Baik",
    jumlah: 1,
    lokasi: "",
    tglAudit: new Date().toISOString().slice(0,10)
  });

  const columns = [
    { header: "Kode", accessor: "kodeBarang" },
    { header: "Nama Barang", accessor: "namaBarang" },
    { header: "Jumlah", accessor: "jumlah" },
    { header: "Kondisi", accessor: "kondisi" },
    { header: "Lokasi", accessor: "lokasi" },
    { header: "Tgl Audit", accessor: (row: any) => new Date(row.tglAudit).toLocaleDateString("id-ID") },
    {
      header: "Aksi",
      accessor: (row: any) => (
        <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 p-1 print:hidden">
          <Trash2 size={18} />
        </button>
      )
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/dkm/inventaris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tglAudit: new Date(formData.tglAudit).toISOString()
        })
      });
      if (res.ok) {
        toast.success("Data berhasil disimpan");
        setIsFormOpen(false);
        fetchData();
        setFormData({ kodeBarang: "", namaBarang: "", kondisi: "Baik", jumlah: 1, lokasi: "", tglAudit: new Date().toISOString().slice(0,10) });
      } else {
        toast.error("Gagal menyimpan data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventaris Musala</h1>
          <p className="text-gray-500 mt-1">Kelola data inventaris musala</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"><Printer size={20} /> Cetak PDF</button>
          
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
      
      <PrintHeader title="Laporan Inventaris Musala" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border-none print:p-0">
        {isLoading ? (
          <div className="flex justify-center p-12 print:hidden"><RefreshCw className="animate-spin text-blue-500" /></div>
        ) : (
          <>
            <DataTable
              data={data}
              columns={columns}
              searchPlaceholder="Cari data..."
            />
            {/* Signature Block for Print */}
            <div className="hidden print:flex justify-end mt-16 text-center">
              <div>
                <p>Bandung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="mt-2 font-bold">Ketua DKM Al-Hidayah</p>
                <div className="h-24"></div>
                <p className="underline font-bold">( ...................................... )</p>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Tambah Data Baru">
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Barang</label>
            <input type="text" required value={formData.kodeBarang} onChange={e => setFormData({...formData, kodeBarang: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
            <input type="text" required value={formData.namaBarang} onChange={e => setFormData({...formData, namaBarang: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
              <select value={formData.kondisi} onChange={e => setFormData({...formData, kondisi: e.target.value})} className="w-full border rounded-lg p-2">
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
              <input type="number" required min="1" value={formData.jumlah} onChange={e => setFormData({...formData, jumlah: parseInt(e.target.value)})} className="w-full border rounded-lg p-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Penyimpanan</label>
            <input type="text" required value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Audit</label>
            <input type="date" required value={formData.tglAudit} onChange={e => setFormData({...formData, tglAudit: e.target.value})} className="w-full border rounded-lg p-2" />
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
