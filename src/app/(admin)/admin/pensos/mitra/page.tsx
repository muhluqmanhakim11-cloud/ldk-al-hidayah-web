"use client";

import { useState, useEffect } from "react";

type Mitra = {
  id: number;
  nama: string;
  logoUrl: string;
  websiteUrl?: string | null;
  isActive: boolean;
  orderIndex: number;
};

export default function MitraPage() {
  const [list, setList] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nama: "", logoUrl: "", websiteUrl: "", orderIndex: 0 });
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pensos/mitra");
      if (res.ok) setList(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleUploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "ldk-alhidayah/mitra");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setForm(prev => ({ ...prev, logoUrl: data.url }));
      else alert(data.error || "Upload gagal");
    } catch {
      alert("Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.nama || !form.logoUrl) {
      alert("Nama dan logo wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/admin/pensos/mitra/${editId}` : "/api/admin/pensos/mitra";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isActive: true }),
      });
      if (res.ok) {
        await fetchList();
        setForm({ nama: "", logoUrl: "", websiteUrl: "", orderIndex: 0 });
        setEditId(null);
        setShowForm(false);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (m: Mitra) => {
    setEditId(m.id);
    setForm({ nama: m.nama, logoUrl: m.logoUrl, websiteUrl: m.websiteUrl || "", orderIndex: m.orderIndex });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus mitra ini?")) return;
    await fetch(`/api/admin/pensos/mitra/${id}`, { method: "DELETE" });
    fetchList();
  };

  const handleToggleActive = async (m: Mitra) => {
    await fetch(`/api/admin/pensos/mitra/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...m, isActive: !m.isActive }),
    });
    fetchList();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mitra Kami</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Logo mitra tampil otomatis di footer website publik.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ nama: "", logoUrl: "", websiteUrl: "", orderIndex: 0 }); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Mitra
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700 p-5 mb-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">
            {editId ? "Edit Mitra" : "Tambah Mitra Baru"}
          </h2>
          <div className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Logo Mitra</label>
              <div className="flex items-center gap-4">
                {form.logoUrl ? (
                  <div className="relative w-20 h-20 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden p-1">
                    <img src={form.logoUrl} alt="logo" className="max-w-full max-h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, logoUrl: "" }))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-600 flex items-center justify-center text-gray-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${uploading ? "bg-gray-100 text-gray-400 cursor-wait" : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100"}`}>
                  {uploading ? (
                    <><div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /> Mengunggah...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Pilih File</>
                  )}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadLogo(f); e.target.value = ""; }}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">PNG/JPG/WebP — Rekomendasi: logo transparan (PNG)</p>
            </div>

            {/* Nama */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Mitra</label>
              <input type="text" value={form.nama} onChange={e => setForm(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Contoh: STMIK IKMI Cirebon"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none dark:bg-slate-800 dark:text-gray-100"
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Link Website (opsional)</label>
              <input type="url" value={form.websiteUrl} onChange={e => setForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none dark:bg-slate-800 dark:text-gray-100"
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Urutan Tampil</label>
              <input type="number" value={form.orderIndex} min={0}
                onChange={e => setForm(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none dark:bg-slate-800 dark:text-gray-100"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving || uploading}
                className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</> : "Simpan"}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-5 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada mitra. Tambahkan logo mitra pertama!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {list.map(m => (
            <div key={m.id} className={`bg-white dark:bg-slate-900 rounded-xl border transition-all ${m.isActive ? "border-gray-100 dark:border-slate-700" : "border-dashed border-gray-200 dark:border-slate-700 opacity-60"}`}>
              <div className="p-4 flex items-center gap-4">
                {/* Logo preview */}
                <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 p-1 overflow-hidden">
                  <img src={m.logoUrl} alt={m.nama} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{m.nama}</p>
                  {m.websiteUrl && <p className="text-xs text-green-600 dark:text-green-400 truncate mt-0.5">{m.websiteUrl}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.isActive ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400"}`}>
                      {m.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                    <span className="text-xs text-gray-400">Urutan: {m.orderIndex}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => handleEdit(m)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleToggleActive(m)} className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 transition-colors" title={m.isActive ? "Nonaktifkan" : "Aktifkan"}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={m.isActive ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />{!m.isActive && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}</svg>
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
