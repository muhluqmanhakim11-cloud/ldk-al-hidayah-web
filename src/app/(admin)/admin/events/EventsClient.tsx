"use client";

import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";
import { useState, useEffect, useMemo } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

export default function EventsClient({ periods, divisions, programs, userRole, userDivisionId }: any) {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterDivision, setFilterDivision] = useState(userRole === "ADMIN_BIDANG" ? String(userDivisionId) : "");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Default active period
  const activePeriod = useMemo(() => {
    return periods.find((p: any) => p.isActive) || periods[0];
  }, [periods]);

  // Form State
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    periodId: activePeriod?.id || 0,
    divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : 0,
    programId: 0,
    date: "",
    time: "",
    location: "",
    description: "",
    status: "PUBLISHED",
  });
  
  // UI Toggles
  const [showDetails, setShowDetails] = useState(false);
  const [showPeriodSelect, setShowPeriodSelect] = useState(false);
  const [showDivisionOverride, setShowDivisionOverride] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const isReadOnly = userRole === "KETUA";

  const fetchEvents = async () => {
    setFetchLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search) params.append("search", search);
      if (filterPeriod) params.append("periodId", filterPeriod);
      if (filterDivision) params.append("divisionId", filterDivision);
      if (filterProgram) params.append("programId", filterProgram);
      if (filterStatus) params.append("status", filterStatus);

      const res = await fetch(`/api/admin/events?${params.toString()}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, search, filterPeriod, filterDivision, filterProgram, filterStatus]);

  const columns = [
    { 
      header: "Kegiatan", 
      accessor: (row: any) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{row.name}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {row.program?.name || "Kegiatan Insidental"}
            </span>
            {row.division?.name && (
              <>
                <span>•</span>
                <span className="text-gray-500 dark:text-gray-400">{row.division.name}</span>
              </>
            )}
            {row.location && (
              <>
                <span>•</span>
                <span className="text-gray-500 dark:text-gray-400">📍 {row.location}</span>
              </>
            )}
          </div>
        </div>
      )
    },
    { 
      header: "Waktu & Tanggal", 
      accessor: (row: any) => (
        <div className="text-sm">
          <p className="font-medium text-gray-800 dark:text-gray-200">
            {row.date ? new Date(row.date).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
          </p>
          {row.time && <p className="text-xs text-gray-500 dark:text-gray-400">{row.time}</p>}
        </div>
      )
    },
    { 
      header: "Status", 
      accessor: (row: any) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block
          ${row.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800' : 
            row.status === 'COMPLETED' || row.status === 'DONE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
            row.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800' :
            row.status === 'UPCOMING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800' :
            row.status === 'ONGOING' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800' :
            'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700'}`}>
          {row.status}
        </span>
      )
    },
  ];

  const availableDivisions = useMemo(() => {
    return userRole === "ADMIN_BIDANG" ? divisions.filter((d: any) => d.id === userDivisionId) : divisions;
  }, [divisions, userRole, userDivisionId]);

  const availablePrograms = useMemo(() => {
    let progs = programs;
    if (userRole === "ADMIN_BIDANG") {
      progs = progs.filter((p: any) => p.divisionId === userDivisionId);
    }
    return progs;
  }, [programs, userRole, userDivisionId]);

  const openAddModal = () => {
    const selectedPeriodId = filterPeriod ? Number(filterPeriod) : (activePeriod?.id || periods[0]?.id || 0);
    const initialProgram = filterProgram ? programs.find((p: any) => p.id === Number(filterProgram)) : availablePrograms[0];
    const initialDivisionId = userRole === "ADMIN_BIDANG"
      ? userDivisionId
      : (filterDivision ? Number(filterDivision) : (initialProgram?.divisionId || availableDivisions[0]?.id || 0));

    setFormData({
      id: 0,
      name: "",
      periodId: selectedPeriodId,
      divisionId: initialDivisionId,
      programId: initialProgram ? initialProgram.id : 0,
      date: new Date().toISOString().split("T")[0],
      time: "",
      location: "",
      description: "",
      status: "PUBLISHED",
    });
    setError("");
    setShowDetails(false);
    setShowPeriodSelect(false);
    setShowDivisionOverride(false);
    setIsModalOpen(true);
  };

  const openEditModal = (row: any) => {
    setFormData({
      id: row.id,
      name: row.name,
      periodId: row.periodId,
      divisionId: row.divisionId || 0,
      programId: row.programId || 0,
      date: row.date ? row.date.split('T')[0] : "",
      time: row.time || "",
      location: row.location || "",
      description: row.description || "",
      status: row.status || "PUBLISHED",
    });
    setError("");
    setShowDetails(Boolean(row.location || row.description || (row.status && row.status !== "PUBLISHED")));
    setShowPeriodSelect(false);
    setShowDivisionOverride(false);
    setIsModalOpen(true);
  };

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProgId = Number(e.target.value);
    if (selectedProgId > 0) {
      const selectedProg = programs.find((p: any) => p.id === selectedProgId);
      setFormData(prev => ({
        ...prev,
        programId: selectedProgId,
        divisionId: selectedProg?.divisionId || prev.divisionId,
        periodId: selectedProg?.periodId || prev.periodId,
      }));
    } else {
      // Kegiatan insidental / Non-proker
      setFormData(prev => ({
        ...prev,
        programId: 0,
        divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : (prev.divisionId || availableDivisions[0]?.id || 0),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Nama kegiatan wajib diisi");
      return;
    }
    if (!formData.periodId) {
      setError("Periode kegiatan tidak valid");
      return;
    }
    if (!formData.divisionId) {
      setError("Bidang / Divisi penyelenggara wajib dipilih");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEditing = formData.id !== 0;
      const url = isEditing ? `/api/admin/events/${formData.id}` : "/api/admin/events";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        ...formData,
        periodId: Number(formData.periodId),
        divisionId: Number(formData.divisionId),
        programId: formData.programId && Number(formData.programId) > 0 ? Number(formData.programId) : null,
        date: formData.date || null,
        time: formData.time ? formData.time.trim() : null,
        location: formData.location ? formData.location.trim() : null,
        description: formData.description ? formData.description.trim() : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Terjadi kesalahan saat menyimpan");

      toast.success(isEditing ? "Kegiatan berhasil diperbarui" : "Kegiatan baru berhasil ditambahkan");
      setIsModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: any) => {
    if (!(await confirmDialog(`Hapus kegiatan "${row.name}"?`))) return;
    
    try {
      const res = await fetch(`/api/admin/events/${row.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menghapus");
      
      toast.success("Kegiatan berhasil dihapus");
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const currentPeriodObj = periods.find((p: any) => p.id === Number(formData.periodId)) || activePeriod;
  const currentDivisionObj = divisions.find((d: any) => d.id === Number(formData.divisionId));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2.5 items-center flex-1">
          <input 
            type="text" 
            placeholder="Cari kegiatan..." 
            className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-52"
            value={search} 
            onChange={e => setSearch(e.target.value)}
          />
          <select 
            className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
            value={filterPeriod} 
            onChange={e => setFilterPeriod(e.target.value)}
          >
            <option value="">Semua Periode</option>
            {periods.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.isActive ? "(Aktif)" : ""}
              </option>
            ))}
          </select>
          <select 
            className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" 
            value={filterDivision} 
            onChange={e => setFilterDivision(e.target.value)}
            disabled={userRole === "ADMIN_BIDANG"}
          >
            <option value="">Semua Bidang</option>
            {availableDivisions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select 
            className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none max-w-xs" 
            value={filterProgram} 
            onChange={e => setFilterProgram(e.target.value)}
          >
            <option value="">Semua Program</option>
            {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select 
            className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="UPCOMING">UPCOMING</option>
            <option value="ONGOING">ONGOING</option>
            <option value="DONE">DONE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        
        {!isReadOnly && (
          <button 
            type="button"
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kegiatan
          </button>
        )}
      </div>

      {fetchLoading ? (
        <div className="p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Memuat data kegiatan...</span>
        </div>
      ) : (
        <DataTable 
          data={data} 
          columns={columns} 
          onEdit={!isReadOnly ? openEditModal : undefined}
          onDelete={!isReadOnly ? handleDelete : undefined}
        />
      )}

      {/* Pagination controls */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm text-sm">
        <button 
          type="button"
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page === 1} 
          className="px-3.5 py-1.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          Sebelumnya
        </button>
        <span className="text-gray-600 dark:text-gray-400 font-medium">Halaman {page}</span>
        <button 
          type="button"
          onClick={() => setPage(p => p + 1)} 
          disabled={data.length < 50} 
          className="px-3.5 py-1.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          Selanjutnya
        </button>
      </div>

      {/* Simplified Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={formData.id ? "Edit Kegiatan" : "Tambah Kegiatan"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* 1. Header Ringkas Periode Otomatis */}
          <div className="bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-gray-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-gray-600 dark:text-gray-300">
                Periode: <strong className="text-gray-900 dark:text-gray-100 font-semibold">{currentPeriodObj?.name || "2026/2027"}</strong>
                {currentPeriodObj?.isActive && <span className="text-emerald-600 dark:text-emerald-400 ml-1 font-medium">(Aktif)</span>}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPeriodSelect(!showPeriodSelect)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {showPeriodSelect ? "Tutup" : "Ganti Periode"}
            </button>
          </div>

          {showPeriodSelect && (
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Pilih Periode Khusus</label>
              <select
                value={formData.periodId}
                onChange={e => setFormData({ ...formData, periodId: parseInt(e.target.value) })}
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {periods.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isActive ? "(Periode Aktif)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. Program Kerja (Pilihan Utama & Auto-Sync Bidang) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                Program Kerja Terkait
              </label>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                Otomatis menentukan Bidang
              </span>
            </div>
            <select
              value={formData.programId || 0}
              onChange={handleProgramChange}
              className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            >
              <option value="0">-- Kegiatan Insidental (Non-Proker) --</option>
              {availablePrograms.map((p: any) => {
                const divName = divisions.find((d: any) => d.id === p.divisionId)?.name;
                return (
                  <option key={p.id} value={p.id}>
                    {divName ? `[${divName}] ` : ""}{p.name}
                  </option>
                );
              })}
            </select>

            {/* Status Penyelenggara / Bidang */}
            {formData.programId > 0 ? (
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 rounded-lg text-xs">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <span>Bidang:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                    {currentDivisionObj?.name || "Tersinkron"}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium">
                    ✓ Otomatis
                  </span>
                </div>
                {userRole !== "ADMIN_BIDANG" && (
                  <button
                    type="button"
                    onClick={() => setShowDivisionOverride(!showDivisionOverride)}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-medium"
                  >
                    {showDivisionOverride ? "Kunci" : "Ubah Bidang"}
                  </button>
                )}
              </div>
            ) : null}

            {/* Jika Non-Proker atau override aktif, tampilkan dropdown Bidang */}
            {(formData.programId === 0 || showDivisionOverride) && (
              <div className="pt-1 animate-in fade-in duration-150">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Bidang / Divisi Penyelenggara <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.divisionId || ""}
                  onChange={e => setFormData({ ...formData, divisionId: parseInt(e.target.value) || 0 })}
                  disabled={userRole === "ADMIN_BIDANG"}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Pilih Bidang Penyelenggara</option>
                  {availableDivisions.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 3. Nama Kegiatan (Input Wajib) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Nama Kegiatan <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              placeholder="Contoh: Kajian Bulanan, Pelatihan Desain, Rapat Kerja..."
              className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors" 
            />
          </div>

          {/* 4. Tanggal & Waktu (Custom Input) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Tanggal Kegiatan
              </label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })} 
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Waktu Pelaksanaan
              </label>
              <input 
                type="text" 
                value={formData.time} 
                onChange={e => setFormData({ ...formData, time: e.target.value })} 
                placeholder="Contoh: 08:30 - 11:30 WIB / Ba'da Ashar" 
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors" 
              />
            </div>
          </div>

          {/* 5. Field Pelengkap di Balik Toggle Opsional */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-1"
            >
              <svg 
                className={`w-3.5 h-3.5 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span>{showDetails ? "Sembunyikan Lokasi & Detail Tambahan" : "+ Tambah Lokasi & Deskripsi (Opsional)"}</span>
            </button>

            {showDetails && (
              <div className="mt-2.5 p-3.5 bg-gray-50/80 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-xl space-y-3 animate-in fade-in duration-200">
                {/* Lokasi */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Lokasi Kegiatan
                  </label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={e => setFormData({ ...formData, location: e.target.value })} 
                    placeholder="Contoh: Masjid Al-Hidayah STMIK IKMI / Online Zoom"
                    className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Deskripsi Singkat Kegiatan
                  </label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    placeholder="Tuliskan catatan penting, target peserta, atau agenda kegiatan..."
                    rows={2} 
                    className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                {/* Status Kegiatan */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status Publikasi
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="PUBLISHED">PUBLISHED (Tampil di Website Publik)</option>
                    <option value="UPCOMING">UPCOMING (Segera Hadir)</option>
                    <option value="ONGOING">ONGOING (Sedang Berjalan)</option>
                    <option value="DONE">DONE (Selesai)</option>
                    <option value="COMPLETED">COMPLETED (Tuntas)</option>
                    <option value="DRAFT">DRAFT (Disimpan Internal)</option>
                    <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 6. Sticky Action Footer */}
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                formData.id ? "Simpan Perubahan" : "Simpan Kegiatan"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
