"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Plus, RefreshCw, Trash2, Printer, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import PrintHeader from "@/components/admin/PrintHeader";

export default function ClientPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "IN",
    category: "",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: "",
    proofUrl: ""
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/bendahara/transactions");
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
      const res = await fetch("/api/admin/bendahara/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString()
        })
      });
      if (res.ok) {
        toast.success("Transaksi berhasil dicatat");
        setIsFormOpen(false);
        fetchData();
        setFormData({
          type: "IN",
          category: "",
          amount: 0,
          date: new Date().toISOString().slice(0, 10),
          description: "",
          proofUrl: ""
        });
      } else {
        toast.error("Gagal mencatat transaksi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID").format(number * 1000);
  };

  // Drag state untuk posisi laporan print
  const [printPos, setPrintPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number; originX: number; originY: number }>({
    dragging: false, startX: 0, startY: 0, originX: 0, originY: 0
  });

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, originX: printPos.x, originY: printPos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      setPrintPos({
        x: dragRef.current.originX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.originY + (e.clientY - dragRef.current.startY),
      });
    };
    const onMouseUp = () => { dragRef.current.dragging = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

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
      accessor: (row: any) => (
        <div className="flex gap-2 print:hidden">
          <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 p-1">
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Buku Kas & Transaksi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola data pemasukan dan pengeluaran</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={() => window.print()} className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm">
            <Printer size={20} /> Cetak Laporan
          </button>
          
          <button
            onClick={() => {
              setFormData({ ...formData, type: "IN" });
              setIsFormOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm flex-1 sm:flex-none"
          >
            <Plus size={20} /> Catat Transaksi
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
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

      {/* Draggable wrapper untuk preview posisi laporan — hanya tampil di layar, bukan saat print */}
      <div
        className="print:hidden fixed z-50 cursor-grab active:cursor-grabbing select-none"
        style={{ left: `calc(50% + ${printPos.x}px)`, top: `calc(50% + ${printPos.y}px)`, transform: 'translate(-50%, -50%)', pointerEvents: 'none', display: 'none' }}
      />

      {/* Area laporan yang bisa di-drag posisinya (hanya efek visual di screen sebelum print) */}
      <div
        className="print:hidden relative"
        style={{ transform: `translate(${printPos.x}px, ${printPos.y}px)`, transition: dragRef.current.dragging ? 'none' : 'transform 0.15s ease', cursor: 'grab' }}
        onMouseDown={onMouseDown}
        title="Geser untuk mengatur posisi laporan"
      >
        <div className="absolute -top-6 left-0 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 print:hidden">
          <span>⠿</span> Geser untuk atur posisi laporan
        </div>
      </div>

      {/* Konten laporan utama (print & screen) */}
      <div
        style={{ position: 'relative', transform: `translate(${printPos.x}px, ${printPos.y}px)`, transition: dragRef.current.dragging ? 'none' : 'transform 0.15s ease' }}
        className="print:!transform-none print:!translate-x-0 print:!translate-y-0"
      >
        <div
          className="print:hidden absolute inset-0 z-10 cursor-grab active:cursor-grabbing rounded-2xl"
          style={{ background: 'transparent' }}
          onMouseDown={onMouseDown}
          title="⠿ Geser untuk mengatur posisi laporan"
        />
        <div className="flex items-center gap-2 mb-2 print:hidden">
          <span className="text-xs text-gray-400 dark:text-gray-500 select-none">⠿ Drag laporan untuk atur posisi</span>
          {(printPos.x !== 0 || printPos.y !== 0) && (
            <button
              onClick={() => setPrintPos({ x: 0, y: 0 })}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              Reset posisi
            </button>
          )}
        </div>

        <PrintHeader title="Laporan Arus Kas LDK Al-Hidayah" />

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 print:shadow-none print:border-none print:p-0">
          {isLoading ? (
            <div className="flex justify-center p-12 print:hidden"><RefreshCw className="animate-spin text-blue-500" /></div>
          ) : (
            <>
              <DataTable
                data={data}
                columns={columns}
                searchPlaceholder="Cari transaksi..."
              />
              {/* Signature Block for Print */}
              <div className="hidden print:flex justify-end mt-16 text-center">
                <div>
                  <p>Cirebon, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-2 font-bold">Bendahara LDK Al-Hidayah</p>
                  <div className="h-24"></div>
                  <p className="underline font-bold">( ...................................... )</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Catat Transaksi">
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
            <input type="number" required min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})} className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan / Deskripsi</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700" rows={3}></textarea>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Simpan Transaksi</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
