"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { RefreshCw, Download, Filter } from "lucide-react";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function BarChart({ monthlyData }: { monthlyData: { month: string; in: number; out: number }[] }) {
  const maxVal = Math.max(...monthlyData.flatMap(d => [d.in, d.out]), 1);
  const formatK = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}jt` : n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`;
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-2 min-w-[400px] h-48 mt-4">
        {monthlyData.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: "160px" }}>
              <div
                className="bg-green-500 rounded-t-sm w-5 transition-all duration-500"
                style={{ height: `${(d.in / maxVal) * 100}%`, minHeight: d.in > 0 ? "4px" : "0" }}
                title={`Masuk: Rp${d.in.toLocaleString("id-ID")}`}
              />
              <div
                className="bg-red-400 rounded-t-sm w-5 transition-all duration-500"
                style={{ height: `${(d.out / maxVal) * 100}%`, minHeight: d.out > 0 ? "4px" : "0" }}
                title={`Keluar: Rp${d.out.toLocaleString("id-ID")}`}
              />
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{d.month}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Pemasukan</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Pengeluaran</span>
      </div>
    </div>
  );
}

export default function LaporanClientPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState("");
  const [filterType, setFilterType] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/bendahara/transactions");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const filtered = useMemo(() => {
    return data.filter(tx => {
      const d = new Date(tx.date);
      if (filterYear && d.getFullYear().toString() !== filterYear) return false;
      if (filterMonth && (d.getMonth() + 1).toString() !== filterMonth) return false;
      if (filterType && tx.type !== filterType) return false;
      return true;
    });
  }, [data, filterYear, filterMonth, filterType]);

  const totalIn = filtered.filter(d => d.type === "IN").reduce((a, b) => a + b.amount, 0);
  const totalOut = filtered.filter(d => d.type === "OUT").reduce((a, b) => a + b.amount, 0);
  const balance = totalIn - totalOut;

  // Monthly chart data (for selected year)
  const monthlyData = useMemo(() => {
    return MONTHS.map((name, i) => {
      const txMonth = data.filter(tx => {
        const d = new Date(tx.date);
        return d.getFullYear().toString() === filterYear && d.getMonth() === i;
      });
      return {
        month: name.slice(0, 3),
        in: txMonth.filter(t => t.type === "IN").reduce((a, b) => a + b.amount, 0),
        out: txMonth.filter(t => t.type === "OUT").reduce((a, b) => a + b.amount, 0),
      };
    });
  }, [data, filterYear]);

  // Category breakdown
  const catBreakdown = useMemo(() => {
    const map: Record<string, { in: number; out: number }> = {};
    filtered.forEach(tx => {
      if (!map[tx.category]) map[tx.category] = { in: 0, out: 0 };
      if (tx.type === "IN") map[tx.category].in += tx.amount;
      else map[tx.category].out += tx.amount;
    });
    return Object.entries(map).sort((a, b) => (b[1].in + b[1].out) - (a[1].in + a[1].out));
  }, [filtered]);

  const exportCSV = () => {
    const header = ["Tanggal", "Tipe", "Kategori", "Keterangan", "Nominal"];
    const rows = filtered.map(tx => [
      new Date(tx.date).toLocaleDateString("id-ID"),
      tx.type === "IN" ? "Pemasukan" : "Pengeluaran",
      tx.category,
      `"${tx.description}"`,
      tx.amount,
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-kas-${filterMonth || "all"}-${filterYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File CSV berhasil diunduh");
  };

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Laporan Keuangan</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Grafik dan ringkasan arus kas per periode</p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
        >
          <Download size={20} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-wrap gap-3 items-center">
        <Filter size={18} className="text-gray-400" />
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:bg-slate-800">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:bg-slate-800">
          <option value="">Semua Bulan</option>
          {MONTHS.map((m, i) => <option key={i} value={(i + 1).toString()}>{m}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:bg-slate-800">
          <option value="">Semua Tipe</option>
          <option value="IN">Pemasukan</option>
          <option value="OUT">Pengeluaran</option>
        </select>
        {(filterMonth || filterType) && (
          <button onClick={() => { setFilterMonth(""); setFilterType(""); }} className="text-xs text-red-500 hover:underline">Reset</button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-gray-500">Total Pemasukan</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatRupiah(totalIn)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-gray-500">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatRupiah(totalOut)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-sm text-white">
          <p className="text-blue-100 text-sm">Saldo Periode Ini</p>
          <p className="text-2xl font-bold mt-1">{formatRupiah(balance)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Grafik Arus Kas {filterYear}</h2>
        {isLoading ? (
          <div className="flex justify-center py-12"><RefreshCw className="animate-spin text-blue-500" /></div>
        ) : (
          <BarChart monthlyData={monthlyData} />
        )}
      </div>

      {/* Breakdown per Kategori */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Ringkasan per Kategori</h2>
        {catBreakdown.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Tidak ada data untuk periode ini.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {catBreakdown.map(([cat, val]) => (
              <div key={cat} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                <div className="flex gap-4 text-sm">
                  {val.in > 0 && <span className="text-green-600">+{formatRupiah(val.in)}</span>}
                  {val.out > 0 && <span className="text-red-600">-{formatRupiah(val.out)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
