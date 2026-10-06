"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, Trash2, RefreshCw, HeartHandshake } from "lucide-react";

export default function DonaturClientPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/bendahara/donors");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Gagal memuat data donatur");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/bendahara/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, email, notes }),
      });
      if (res.ok) {
        toast.success("Donatur berhasil ditambahkan");
        setName(""); setContact(""); setEmail(""); setNotes("");
        fetchData();
      } else {
        toast.error("Gagal menambahkan donatur");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus data donatur ini?")) return;
    try {
      const res = await fetch(`/api/admin/bendahara/donors/${id}`, { method: "DELETE" });
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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Database Donatur</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola kontak donatur untuk keperluan funding dan pelaporan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Tambah Donatur</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap / Instansi</label>
              <input 
                type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full border dark:border-slate-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. WhatsApp / HP</label>
              <input 
                type="text" value={contact} onChange={e => setContact(e.target.value)}
                className="w-full border dark:border-slate-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Opsional)</label>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border dark:border-slate-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Tambahan</label>
              <textarea 
                value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full border dark:border-slate-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <HeartHandshake size={18} /> {isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daftar Donatur</h2>
            <button onClick={fetchData} className="text-gray-500 hover:text-blue-500"><RefreshCw size={18} /></button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-blue-500" /></div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Belum ada data donatur</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.map(item => (
                <div key={item.id} className="border dark:border-slate-700 p-4 rounded-xl hover:shadow-md transition-shadow bg-gray-50 dark:bg-slate-800/50 relative group">
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{item.name}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {item.contact && <p>📞 {item.contact}</p>}
                    {item.email && <p>✉️ {item.email}</p>}
                    {item.notes && <p className="mt-2 text-xs italic bg-white dark:bg-slate-900 p-2 rounded-lg border">"{item.notes}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
