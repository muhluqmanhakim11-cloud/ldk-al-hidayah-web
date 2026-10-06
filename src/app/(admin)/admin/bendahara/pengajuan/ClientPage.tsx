"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Check, X as XIcon, RefreshCw, Eye } from "lucide-react";
import { useSession } from "next-auth/react";

export default function PengajuanClientPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.realRole || session?.user?.role;
  const isBendaharaOrAdmin = ["super_admin", "admin_bendahara"].includes(role);

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form for non-bendahara
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review Modal
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/bendahara/fund-requests");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Gagal memuat data pengajuan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/bendahara/fund-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, amount: parseInt(amount.replace(/\D/g, "")) }),
      });
      if (res.ok) {
        toast.success("Pengajuan berhasil dikirim");
        setTitle("");
        setDescription("");
        setAmount("");
        fetchData();
      } else {
        toast.error("Gagal mengirim pengajuan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (action: "APPROVED" | "REJECTED") => {
    if (!selectedReq) return;
    setIsReviewing(true);
    try {
      const res = await fetch(`/api/admin/bendahara/fund-requests/${selectedReq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: reviewNote }),
      });
      if (res.ok) {
        toast.success(`Pengajuan di${action === 'APPROVED' ? 'setujui' : 'tolak'}`);
        setSelectedReq(null);
        setReviewNote("");
        fetchData();
      } else {
        toast.error("Gagal memproses pengajuan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsReviewing(false);
    }
  };

  const formatRupiah = (n: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Pengajuan Dana</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola dan tinjau pengajuan dana dari berbagai divisi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form (Only for non-bendahara or if they want to request too) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 md:col-span-1 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Buat Pengajuan Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Keperluan</label>
              <input 
                type="text" required value={title} onChange={e => setTitle(e.target.value)}
                className="w-full border dark:border-slate-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi Lengkap</label>
              <textarea 
                required value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="w-full border dark:border-slate-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nominal Dana (Rp)</label>
              <input 
                type="text" required value={amount} 
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  setAmount(val ? parseInt(val).toLocaleString("id-ID") : "");
                }}
                className="w-full border dark:border-slate-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-slate-800"
              />
            </div>
            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daftar Pengajuan</h2>
            <button onClick={fetchData} className="text-gray-500 hover:text-blue-500"><RefreshCw size={18} /></button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-blue-500" /></div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Belum ada pengajuan dana</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg font-medium">Judul</th>
                    <th className="px-4 py-3 font-medium">Nominal</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 rounded-r-lg font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {data.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{req.title}</p>
                        <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString("id-ID")}</p>
                      </td>
                      <td className="px-4 py-3 text-blue-600 font-semibold">{formatRupiah(req.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                          req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => setSelectedReq(req)} 
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={16} />
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

      {/* Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4">Detail Pengajuan</h3>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-500">Judul</p>
                <p className="font-medium">{selectedReq.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Deskripsi</p>
                <p className="font-medium whitespace-pre-wrap">{selectedReq.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nominal</p>
                <p className="font-bold text-lg text-blue-600">{formatRupiah(selectedReq.amount)}</p>
              </div>
              
              {selectedReq.status === 'PENDING' && isBendaharaOrAdmin && (
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium mb-1">Catatan Bendahara (Opsional)</label>
                  <textarea 
                    value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={2}
                    className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedReq(null)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium"
              >
                Tutup
              </button>
              {selectedReq.status === 'PENDING' && isBendaharaOrAdmin && (
                <>
                  <button 
                    onClick={() => handleReview('REJECTED')} disabled={isReviewing}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2.5 rounded-xl font-medium flex justify-center items-center gap-2"
                  >
                    <XIcon size={18} /> Tolak
                  </button>
                  <button 
                    onClick={() => handleReview('APPROVED')} disabled={isReviewing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium flex justify-center items-center gap-2"
                  >
                    <Check size={18} /> Setujui
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
