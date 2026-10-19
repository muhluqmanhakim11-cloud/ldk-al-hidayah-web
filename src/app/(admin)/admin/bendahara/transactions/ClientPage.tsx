"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, RefreshCw, Trash2, Printer, ArrowDownCircle, ArrowUpCircle, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import PrintHeader from "@/components/admin/PrintHeader";

const EMPTY_FORM = {
  type: "IN",
  category: "",
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  description: "",
  proofUrl: ""
};

export default function ClientPage() {
  const [data, setData] = useState<any[]>([]);
  const [rowOrder, setRowOrder] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/bendahara/transactions");
      const json = await res.json();
      setData(json);
      setRowOrder(json.map((_: any, i: number) => i));
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, type: "IN" });
    setIsFormOpen(true);
  };

  const openEditForm = (row: any) => {
    setEditingId(row.id);
    setFormData({
      type: row.type,
      category: row.category,
      amount: row.amount,
      date: new Date(row.date).toISOString().slice(0, 10),
      description: row.description,
      proofUrl: row.proofUrl || ""
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      const res = await fetch(`/api/admin/bendahara/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Berhasil dihapus");
        fetchData();
      } else {
        toast.error("Gagal menghapus transaksi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isEdit = editingId !== null;
      const url = isEdit
        ? `/api/admin/bendahara/transactions/${editingId}`
        : "/api/admin/bendahara/transactions";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          date: new Date(formData.date).toISOString()
        })
      });

      if (res.ok) {
        toast.success(isEdit ? "Transaksi berhasil diperbarui" : "Transaksi berhasil dicatat");
        setIsFormOpen(false);
        fetchData();
        setFormData({ ...EMPTY_FORM });
        setEditingId(null);
      } else {
        toast.error(isEdit ? "Gagal memperbarui transaksi" : "Gagal mencatat transaksi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  const orderedData = rowOrder.map(i => data[i]).filter(Boolean);

  const moveRow = (index: number, direction: -1 | 1) => {
    const newOrder = [...rowOrder];
    const target = index + direction;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setRowOrder(newOrder);
  };


  const columns = [
    { 
      header: "Tipe", 
      accessor: (row: any) => (
        row.type === "IN" ? (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold">
            <ArrowDownCircle size={14} /> Pemasukan
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold">
            <ArrowUpCircle size={14} /> Pengeluaran
          </span>
        )
      ) 
    },
    { header: "Tanggal", accessor: (row: any) => new Date(row.date).toLocaleDateString("id-ID") },
    { header: "Kategori", accessor: "category" },
    { header: "Keterangan", accessor: "description" },
    { 
      header: "Nominal", 
      accessor: (row: any) => (
        <span className={`font-semibold ${row.type === "IN" ? "text-green-600" : "text-red-600"}`}>
          {row.type === "IN" ? "+" : "-"}Rp {formatRupiah(row.amount)}
        </span>
      )
    },
    {
      header: "Aksi",
      accessor: (row: any, index: number) => (
        <div className="flex gap-1 items-center print:hidden">
          <button
            onClick={() => moveRow(index, -1)}
            disabled={index === 0}
            title="Naikan"
            className="text-gray-400 hover:text-blue-500 disabled:opacity-20 p-1 rounded transition-colors"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={() => moveRow(index, 1)}
            disabled={index === orderedData.length - 1}
            title="Turunkan"
            className="text-gray-400 hover:text-blue-500 disabled:opacity-20 p-1 rounded transition-colors"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={() => openEditForm(row)}
            title="Edit"
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 p-1 ml-1 rounded transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 p-1 ml-1">
            <Trash2 size={18} />
          </button>
        </div>
      ),
      printHidden: true
    }
  ];

  // Calculate stats
  const totalIn = data.filter(d => d.type === "IN").reduce((acc, curr) => acc + curr.amount, 0);
  const totalOut = data.filter(d => d.type === "OUT").reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIn - totalOut;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Buku Kas &amp; Transaksi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola data pemasukan dan pengeluaran</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={() => window.print()} className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm">
            <Printer size={20} /> Cetak Laporan
          </button>
          
          <button
            onClick={openAddForm}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm flex-1 sm:flex-none"
          >
            <Plus size={20} /> Catat Transaksi
          </button>
        </div>
      </div>
      
      {/* Stats Cards - Tampilan Layar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl"><ArrowDownCircle size={32} /></div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Pemasukan</p>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Rp {formatRupiah(totalIn)}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl"><ArrowUpCircle size={32} /></div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Pengeluaran</p>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Rp {formatRupiah(totalOut)}</h3>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-sm text-white flex items-center gap-4">
          <div>
            <p className="text-blue-100">Saldo Akhir</p>
            <h3 className="text-3xl font-bold">Rp {formatRupiah(balance)}</h3>
          </div>
        </div>
      </div>

      {/* Dokumen Kop & Ringkasan - Khusus Cetak */}
      <div className="hidden print:block">
        <PrintHeader title="Laporan Arus Kas LDK Al-Hidayah" />

        {/* Ringkasan Kas Rapi Khusus Dokumen Cetak */}
        <div className="mb-5 border border-gray-400 rounded-lg p-3 bg-gray-50 text-xs">
          <div className="grid grid-cols-3 divide-x divide-gray-300 text-center">
            <div className="px-2">
              <span className="text-gray-600 block text-[11px] font-medium">Total Pemasukan</span>
              <span className="text-sm font-bold text-green-700 mt-0.5 block">Rp {formatRupiah(totalIn)}</span>
            </div>
            <div className="px-2">
              <span className="text-gray-600 block text-[11px] font-medium">Total Pengeluaran</span>
              <span className="text-sm font-bold text-red-700 mt-0.5 block">Rp {formatRupiah(totalOut)}</span>
            </div>
            <div className="px-2">
              <span className="text-gray-600 block text-[11px] font-medium">Saldo Kas Akhir</span>
              <span className="text-sm font-bold text-blue-900 mt-0.5 block">Rp {formatRupiah(balance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Konten Tabel Transaksi */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 print:shadow-none print:border-none print:p-0">
        {isLoading ? (
          <div className="flex justify-center p-12 print:hidden"><RefreshCw className="animate-spin text-blue-500" /></div>
        ) : (
          <>
            <DataTable
              data={orderedData}
              columns={columns}
              searchPlaceholder="Cari transaksi..."
            />

            {/* Bagian Tanda Tangan Resmi (Print Only) */}
            <div className="hidden print:block mt-8 pt-4 break-inside-avoid page-break-inside-avoid">
              <div className="flex justify-center items-start gap-x-24 text-xs text-gray-900">
                <div className="text-center w-56">
                  <p className="font-medium text-gray-700">Mengetahui,</p>
                  <p className="font-bold text-gray-900 mt-1 uppercase tracking-wide">Ketua Umum LDK Al-Hidayah</p>
                  <div className="h-20"></div>
                  <p className="font-bold underline text-gray-900">( ........................................ )</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">NIM. ....................</p>
                </div>

                <div className="text-center w-56">
                  <p className="font-medium text-gray-700">
                    Cirebon, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="font-bold text-gray-900 mt-1 uppercase tracking-wide">Bendahara Umum LDK Al-Hidayah</p>
                  <div className="h-20"></div>
                  <p className="font-bold underline text-gray-900">( Latifah )</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">NIM. ....................</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingId(null); }}
        title={editingId !== null ? "Edit Transaksi" : "Catat Transaksi"}
      >
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe Transaksi</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})} 
                className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700"
              >
                <option value="IN">Pemasukan (+)</option>
                <option value="OUT">Pengeluaran (-)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
            <input type="text" placeholder="Contoh: Infaq Jumat, Operasional, dsb" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nominal (Rp)</label>
            <input
              type="number"
              required
              min="0"
              step="1"
              placeholder="Contoh: 50000"
              value={formData.amount === 0 ? "" : formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value === "" ? 0 : parseInt(e.target.value)})}
              className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan / Deskripsi</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700" rows={3}></textarea>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => { setIsFormOpen(false); setEditingId(null); }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : editingId !== null ? "Perbarui Transaksi" : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
