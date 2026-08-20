"use client";

import { useState, useEffect } from "react";
import { Megaphone, X, Check, Send } from "lucide-react";
import { toast } from "react-hot-toast";

interface Announcement {
  id: number;
  title: string;
  content: string;
  targetRole: string;
  createdAt: string;
}

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/admin/announcements/unread");
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setAnnouncement(data);
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    };

    fetchUnread();
  }, []);

  const handleAcknowledge = async () => {
    if (!announcement) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/announcements/${announcement.id}/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyMessage: showReplyForm ? replyMessage : undefined }),
      });

      if (res.ok) {
        setIsOpen(false);
        toast.success(showReplyForm ? "Balasan terkirim!" : "Pengumuman ditandai sudah dibaca");
        setTimeout(() => setAnnouncement(null), 300); // Wait for transition
      } else {
        toast.error("Gagal menyimpan respons");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !announcement) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Megaphone size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-0.5">Instruksi Ketua Umum</p>
            <h3 className="font-bold text-lg leading-tight">{announcement.title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">
            {announcement.content}
          </div>

          {showReplyForm && (
            <div className="mb-4 animate-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pesan Balasan / Tanggapan</label>
              <textarea
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900"
                rows={4}
                placeholder="Tulis tanggapan atau laporan Anda di sini..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 dark:bg-slate-950 px-6 py-4 border-t flex flex-col sm:flex-row gap-3 justify-end">
          {!showReplyForm ? (
            <>
              <button
                onClick={() => setShowReplyForm(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} /> Beri Tanggapan
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check size={16} /> Mengerti & Tutup
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyMessage("");
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:bg-slate-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={isSubmitting || !replyMessage.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={16} /> Kirim Respon
              </button>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}
