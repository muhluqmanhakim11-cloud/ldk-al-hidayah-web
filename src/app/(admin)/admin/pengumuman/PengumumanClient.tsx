"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, Eye, Check, X, RefreshCw, Trash2 } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

interface Announcement {
  id: number;
  title: string;
  content: string;
  targetRole: string;
  isActive: boolean;
  createdAt: string;
}

interface Acknowledgment {
  id: number;
  isRead: boolean;
  replyMessage: string | null;
  repliedAt: string | null;
  user: {
    id: number;
    name: string;
    role: string;
  };
  division: {
    name: string;
  } | null;
}

export default function PengumumanClient() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("ALL");

  // Monitoring State
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [acks, setAcks] = useState<Acknowledgment[]>([]);
  const [isLoadingAcks, setIsLoadingAcks] = useState(false);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      setAnnouncements(data);
    } catch (error) {
      toast.error("Gagal memuat pengumuman");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, targetRole })
      });
      if (res.ok) {
        toast.success("Pengumuman berhasil dibuat");
        setIsFormOpen(false);
        setTitle("");
        setContent("");
        setTargetRole("ALL");
        fetchAnnouncements();
      } else {
        toast.error("Gagal membuat pengumuman");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAcks = async (id: number) => {
    setSelectedId(id);
    setIsLoadingAcks(true);
    setAcks([]);
    try {
      const res = await fetch(`/api/admin/announcements/${id}/acknowledgments`);
      const data = await res.json();
      setAcks(data);
    } catch (error) {
      toast.error("Gagal memuat laporan pembacaan");
    } finally {
      setIsLoadingAcks(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus pengumuman ini?")) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Pengumuman berhasil dihapus");
        fetchAnnouncements();
      } else {
        toast.error("Gagal menghapus pengumuman");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const columns: any[] = [
    { header: "Tanggal", accessor: (row: Announcement) => new Date(row.createdAt).toLocaleDateString("id-ID") },
    { header: "Judul", accessor: "title" },
    { header: "Target", accessor: (row: Announcement) => row.targetRole === "ALL" ? "Semua Divisi" : row.targetRole.replace("admin_", "").toUpperCase() },
    { header: "Status", accessor: (row: Announcement) => row.isActive ? <span className="px-2 py-1 bg-green-100 text-green-700 dark:text-green-400 rounded-full text-xs">Aktif</span> : <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">Selesai</span> },
    {
      header: "Aksi",
      accessor: (row: Announcement) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewAcks(row.id)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 dark:text-blue-300 transition-colors p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center gap-2"
            title="Lihat Laporan"
          >
            <Eye size={18} /> Laporan
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 dark:text-red-300 transition-colors p-2 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center gap-2"
            title="Hapus Pengumuman"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Pengumuman & Instruksi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola broadcast instruksi ke seluruh Admin Bidang</p>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex justify-center items-center gap-2 transition-all shadow-sm"
          >
            <Plus size={20} /> Buat Instruksi
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
        {isLoading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-blue-500" /></div>
        ) : (
          <DataTable
            data={announcements}
            columns={columns}
            searchPlaceholder="Cari instruksi..."
          />
        )}
      </div>

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Buat Instruksi Baru">
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Instruksi</label>
            <input required type="text" className="w-full border border-gray-300 dark:border-slate-600 p-2 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Divisi</label>
            <select className="w-full border border-gray-300 dark:border-slate-600 p-2 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
              <option value="ALL">Semua Divisi (ALL)</option>
              <option value="admin_dkm">DKM</option>
              <option value="admin_kaderisasi">Kaderisasi</option>
              <option value="admin_kominfo">Kominfo</option>
              <option value="admin_pensos">Pendidikan & Sosial</option>
              <option value="admin_seni_olahraga">Seni & Olahraga</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Isi Pesan</label>
            <textarea required rows={5} className="w-full border border-gray-300 dark:border-slate-600 p-2 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900" value={content} onChange={e => setContent(e.target.value)}></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
              {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />} Terbitkan
            </button>
          </div>
        </form>
      </Modal>

      {/* Monitoring Modal */}
      <Modal isOpen={selectedId !== null} onClose={() => setSelectedId(null)} title="Laporan Pembacaan">
        <div className="mt-4">
          {isLoadingAcks ? (
            <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-blue-500" /></div>
          ) : acks.length === 0 ? (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">Belum ada divisi yang membaca instruksi ini.</div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {acks.map(ack => (
                <div key={ack.id} className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">{ack.division?.name || 'Admin'}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{ack.user.name}</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border">
                      {new Date(ack.repliedAt || "").toLocaleString('id-ID')}
                    </span>
                  </div>
                  {ack.replyMessage ? (
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-300 border border-blue-100 mt-2">
                      <span className="font-semibold block mb-1">Balasan:</span>
                      {ack.replyMessage}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic flex items-center gap-1">
                      <Check size={14} className="text-green-500" /> Telah dibaca tanpa balasan
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
