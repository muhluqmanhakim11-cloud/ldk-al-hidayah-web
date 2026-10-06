"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, Trash2, RefreshCw, Wallet } from "lucide-react";

export default function BudgetClientPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/bendahara/budget");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Gagal memuat data anggaran");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/bendahara/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount: parseInt(amount.replace(/\D/g, "")) }),
      });
      if (res.ok) {
        toast.success("Anggaran berhasil ditambahkan");
        setCategory("");
        setAmount("");
        fetchData();
      } else {
        toast.error("Gagal menambahkan anggaran");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus anggaran ini?")) return;
    try {
      const res = await fetch(`/api/admin/bendahara/budget/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Berhasil dihapus");
        fetchData();
      } else {
        toast.error("Gagal menghapus");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  const formatRupiah = (n: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Alokasi Anggaran</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola batas anggaran untuk setiap kategori pengeluaran</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 md:col-span-1 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Set Anggaran Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
              <input 
                type="text" required value={category} onChange={e => setCategory(e.target.value)}
                placeholder="Contoh: Dana Konsumsi"
                className="w-full border dark:border-slate-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batas Anggaran (Rp)</label>
              <input 
                type="text" required value={amount} 
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  setAmount(val ? parseInt(val).toLocaleString("id-ID") : "");
                }}
                placeholder="Contoh: 1.000.000"
                className="w-full border dark:border-slate-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Wallet size={18} /> {isSubmitting ? "Menyimpan..." : "Simpan Anggaran"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daftar Alokasi</h2>
            <button onClick={fetchData} className="text-gray-500 hover:text-blue-500"><RefreshCw size={18} /></button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-blue-500" /></div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Belum ada data anggaran</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium">Anggaran</th>
                    <th className="px-4 py-3 rounded-r-lg font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {data.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.category}</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold">{formatRupiah(item.amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
