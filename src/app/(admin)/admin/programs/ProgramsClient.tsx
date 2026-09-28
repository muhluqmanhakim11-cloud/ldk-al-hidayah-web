"use client";

import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableProgramItem } from "@/components/admin/SortableProgramItem";
import { Save, ArrowUpDown, X } from "lucide-react";

export default function ProgramsClient({ periods, divisions, userRole, userDivisionId }: any) {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isReordering, setIsReordering] = useState(false);
  const [reorderSaving, setReorderSaving] = useState(false);
  
  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterDivision, setFilterDivision] = useState(userRole === "ADMIN_BIDANG" ? String(userDivisionId) : "");
  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState({ id: 0, name: "", slug: "", periodId: periods[0]?.id || 0, divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : "", description: "", objective: "", schedule: "", customStatus: "", status: "PUBLISHED" });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const isReadOnly = userRole === "KETUA";

  const fetchPrograms = async () => {
    setFetchLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search) params.append("search", search);
      if (filterPeriod) params.append("periodId", filterPeriod);
      if (filterDivision) params.append("divisionId", filterDivision);
      if (filterStatus) params.append("status", filterStatus);

      const res = await fetch(`/api/admin/programs?${params.toString()}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [page, search, filterPeriod, filterDivision, filterStatus]);

  const columns = [
    { header: "Nama Program", accessor: "name" },
    { header: "Bidang", accessor: (row: any) => row.division?.name || "-" },
    { header: "Status / Keterangan", accessor: (row: any) => row.customStatus || "-" },
    { header: "Periode", accessor: (row: any) => row.period?.name || "-" },
    { 
      header: "Status Publikasi", 
      accessor: (row: any) => (
        <span className={`px-2 py-1 rounded text-xs font-medium 
          ${row.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:text-green-400' : 
            row.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 dark:text-blue-400' :
            row.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:text-red-400' :
            'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'}`}>
          {row.status}
        </span>
      )
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const saveReorder = async () => {
    setReorderSaving(true);
    try {
      const payload = data.map((item, index) => ({ id: item.id, orderIndex: index }));
      const res = await fetch("/api/admin/programs/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan urutan");
      toast.success("Urutan berhasil disimpan");
      setIsReordering(false);
      fetchPrograms();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReorderSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isEditing = formData.id !== 0;
      const url = isEditing ? `/api/admin/programs/${formData.id}` : "/api/admin/programs";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Terjadi kesalahan");

      setIsModalOpen(false);
      fetchPrograms();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: any) => {
    if (!(await confirmDialog(`Hapus program ${row.name}?`))) return;
    
    try {
      const res = await fetch(`/api/admin/programs/${row.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      fetchPrograms();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const availableDivisions = userRole === "ADMIN_BIDANG" ? divisions.filter((d: any) => d.id === userDivisionId) : divisions;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
          <input 
            type="text" placeholder="Cari program..." 
            className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-48 transition-all"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-auto bg-white dark:bg-slate-900 transition-all" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
            <option value="">Semua Periode</option>
            {periods.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select 
            className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-auto bg-white dark:bg-slate-900 transition-all disabled:bg-gray-50 dark:bg-slate-950" 
            value={filterDivision} onChange={e => setFilterDivision(e.target.value)}
            disabled={userRole === "ADMIN_BIDANG"}
          >
            <option value="">Semua Bidang</option>
            {availableDivisions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-auto bg-white dark:bg-slate-900 transition-all" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {!isReadOnly && !isReordering && (
              <button 
                onClick={() => setIsReordering(true)}
                className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <ArrowUpDown size={16} /> Atur Urutan
              </button>
            )}
            
            {isReordering && (
              <>
                <button 
                  onClick={() => { setIsReordering(false); fetchPrograms(); }}
                  className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <X size={16} /> Batal
                </button>
                <button 
                  onClick={saveReorder}
                  disabled={reorderSaving}
                  className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} /> {reorderSaving ? "Menyimpan..." : "Simpan Urutan"}
                </button>
              </>
            )}

            {!isReadOnly && !isReordering && (
              <button 
                onClick={() => { setFormData({ id: 0, name: "", slug: "", periodId: periods[0]?.id || 0, divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : "", description: "", objective: "", schedule: "", customStatus: "", status: "PUBLISHED" }); setIsModalOpen(true); }}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors whitespace-nowrap shadow-sm"
              >
                + Tambah Program
              </button>
            )}
          </div>
        )}
      </div>

      {fetchLoading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-900 border rounded-lg shadow-sm">Loading data...</div>
      ) : isReordering ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Atur Urutan Program Kerja</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tekan dan geser baris di bawah ini untuk mengurutkan program kerja.</p>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={data.map(d => d.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {data.map((program) => (
                  <SortableProgramItem key={program.id} id={program.id} program={program} />
                ))}
                {data.length === 0 && (
                  <div className="text-center p-8 text-gray-500 bg-gray-50 dark:bg-slate-800 rounded-lg border border-dashed">
                    Tidak ada program untuk diurutkan
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <DataTable 
          data={data} 
          columns={columns} 
          onEdit={!isReadOnly ? (row) => { setFormData({ id: row.id, name: row.name, slug: row.slug || "", periodId: row.periodId, divisionId: row.divisionId, description: row.description || "", objective: row.objective || "", schedule: row.schedule || "", customStatus: row.customStatus || "", status: row.status }); setIsModalOpen(true); } : undefined}
          onDelete={!isReadOnly ? handleDelete : undefined}
        />
      )}

      {/* Pagination controls */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border rounded-lg shadow-sm">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Sebelumnnya</button>
        <span className="text-sm">Halaman {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={data.length < 50} className="px-3 py-1 border rounded disabled:opacity-50">Selanjutnya</button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Program Kerja" : "Tambah Program Kerja"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/30 p-2 rounded">{error}</div>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Periode</label>
              <select required value={formData.periodId} onChange={e => setFormData({...formData, periodId: parseInt(e.target.value)})} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                <option value="">Pilih Periode</option>
                {periods.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Bidang / Divisi</label>
              <select 
                required 
                value={formData.divisionId} 
                onChange={e => setFormData({...formData, divisionId: parseInt(e.target.value)})} 
                className="w-full border rounded px-3 py-2"
                disabled={userRole === "ADMIN_BIDANG"}
              >
                <option value="">Pilih Bidang</option>
                {availableDivisions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Nama Program</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Slug (Opsional)</label>
              <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="contoh: program-1" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Tujuan</label>
            <input type="text" value={formData.objective} onChange={e => setFormData({...formData, objective: e.target.value})} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Deskripsi Singkat</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" rows={3}></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Jadwal / Waktu Pelaksanaan</label>
              <input type="text" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Contoh: September 2026" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Status / Keterangan (Opsional)</label>
              <input type="text" value={formData.customStatus} onChange={e => setFormData({...formData, customStatus: e.target.value})} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Contoh: Sedang Berjalan" />
            </div>
          </div>
          
          <div className="pt-4 border-t mt-4">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Menyimpan..." : "Simpan Program"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
