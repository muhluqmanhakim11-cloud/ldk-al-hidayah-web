"use client";

import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

export default function ProgramsClient({ periods, divisions, userRole, userDivisionId }: any) {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterDivision, setFilterDivision] = useState(userRole === "ADMIN_BIDANG" ? String(userDivisionId) : "");
  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState({ id: 0, name: "", slug: "", periodId: periods[0]?.id || 0, divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : "", description: "", objective: "", schedule: "", status: "PUBLISHED" });
  
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
    { header: "Periode", accessor: (row: any) => row.period?.name || "-" },
    { 
      header: "Status", 
      accessor: (row: any) => (
        <span className={`px-2 py-1 rounded text-xs font-medium 
          ${row.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
            row.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
            row.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'}`}>
          {row.status}
        </span>
      )
    },
  ];

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
      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
          <input 
            type="text" placeholder="Cari program..." 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-48 transition-all"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-auto bg-white transition-all" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
            <option value="">Semua Periode</option>
            {periods.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-auto bg-white transition-all disabled:bg-gray-50" 
            value={filterDivision} onChange={e => setFilterDivision(e.target.value)}
            disabled={userRole === "ADMIN_BIDANG"}
          >
            <option value="">Semua Bidang</option>
            {availableDivisions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-auto bg-white transition-all" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        
        {!isReadOnly && (
          <button 
            onClick={() => { setFormData({ id: 0, name: "", slug: "", periodId: periods[0]?.id || 0, divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : "", description: "", objective: "", schedule: "", status: "PUBLISHED" }); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors whitespace-nowrap shadow-sm w-full lg:w-auto"
          >
            + Tambah Program
          </button>
        )}
      </div>

      {fetchLoading ? (
        <div className="p-8 text-center text-gray-500 bg-white border rounded-lg shadow-sm">Loading data...</div>
      ) : (
        <DataTable 
          data={data} 
          columns={columns} 
          onEdit={!isReadOnly ? (row) => { setFormData({ id: row.id, name: row.name, slug: row.slug || "", periodId: row.periodId, divisionId: row.divisionId, description: row.description || "", objective: row.objective || "", schedule: row.schedule || "", status: row.status }); setIsModalOpen(true); } : undefined}
          onDelete={!isReadOnly ? handleDelete : undefined}
        />
      )}

      {/* Pagination controls */}
      <div className="flex justify-between items-center bg-white p-4 border rounded-lg shadow-sm">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Sebelumnnya</button>
        <span className="text-sm">Halaman {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={data.length < 50} className="px-3 py-1 border rounded disabled:opacity-50">Selanjutnya</button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Program Kerja" : "Tambah Program Kerja"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Periode</label>
              <select required value={formData.periodId} onChange={e => setFormData({...formData, periodId: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                <option value="">Pilih Periode</option>
                {periods.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Bidang / Divisi</label>
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
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Nama Program</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Slug (Opsional)</label>
              <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="contoh: program-1" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Tujuan</label>
            <input type="text" value={formData.objective} onChange={e => setFormData({...formData, objective: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Deskripsi Singkat</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" rows={3}></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Jadwal (Contoh: Setiap Bulan)</label>
              <input type="text" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
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
