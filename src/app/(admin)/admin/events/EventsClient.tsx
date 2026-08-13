"use client";

import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";
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

  const [formData, setFormData] = useState({ id: 0, name: "", periodId: periods[0]?.id || 0, divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : "", programId: programs[0]?.id || 0, date: "", time: "", location: "", description: "", status: "DRAFT" });
  
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
    { header: "Kegiatan", accessor: (row: any) => (
      <div>
        <p className="font-medium text-gray-900">{row.name}</p>
        <p className="text-xs text-gray-500">{row.program?.name}</p>
      </div>
    )},
    { header: "Tanggal", accessor: (row: any) => row.date ? new Date(row.date).toLocaleDateString('id-ID') : "-" },
    { 
      header: "Status", 
      accessor: (row: any) => (
        <span className={`px-2 py-1 rounded text-xs font-medium 
          ${row.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
            row.status === 'COMPLETED' || row.status === 'DONE' ? 'bg-blue-100 text-blue-700' :
            row.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
            row.status === 'UPCOMING' ? 'bg-yellow-100 text-yellow-700' :
            row.status === 'ONGOING' ? 'bg-purple-100 text-purple-700' :
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
      const url = isEditing ? `/api/admin/events/${formData.id}` : "/api/admin/events";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Terjadi kesalahan");

      setIsModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: any) => {
    if (!(await confirmDialog(`Hapus kegiatan ${row.name}?`))) return;
    
    try {
      const res = await fetch(`/api/admin/events/${row.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const availableDivisions = userRole === "ADMIN_BIDANG" ? divisions.filter((d: any) => d.id === userDivisionId) : divisions;
  const availablePrograms = formData.divisionId ? programs.filter((p: any) => p.divisionId === Number(formData.divisionId)) : programs;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <input 
            type="text" placeholder="Cari kegiatan..." 
            className="border rounded px-3 py-2 text-sm"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="border rounded px-3 py-2 text-sm" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
            <option value="">Semua Periode</option>
            {periods.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select 
            className="border rounded px-3 py-2 text-sm" 
            value={filterDivision} onChange={e => setFilterDivision(e.target.value)}
            disabled={userRole === "ADMIN_BIDANG"}
          >
            <option value="">Semua Bidang</option>
            {availableDivisions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="border rounded px-3 py-2 text-sm" value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
            <option value="">Semua Program</option>
            {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="border rounded px-3 py-2 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="UPCOMING">UPCOMING</option>
            <option value="ONGOING">ONGOING</option>
            <option value="DONE">DONE</option>
          </select>
        </div>
        
        {!isReadOnly && (
          <button 
            onClick={() => { setFormData({ id: 0, name: "", periodId: periods[0]?.id || 0, divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : "", programId: programs[0]?.id || 0, date: "", time: "", location: "", description: "", status: "DRAFT" }); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap"
          >
            + Tambah Kegiatan
          </button>
        )}
      </div>

      {fetchLoading ? (
        <div className="p-8 text-center text-gray-500 bg-white border rounded-lg shadow-sm">Loading data...</div>
      ) : (
        <DataTable 
          data={data} 
          columns={columns} 
          onEdit={!isReadOnly ? (row) => { setFormData({ id: row.id, name: row.name, periodId: row.periodId, divisionId: row.divisionId || "", programId: row.programId || "", date: row.date ? row.date.split('T')[0] : "", time: row.time || "", location: row.location || "", description: row.description || "", status: row.status }); setIsModalOpen(true); } : undefined}
          onDelete={!isReadOnly ? handleDelete : undefined}
        />
      )}

      {/* Pagination controls */}
      <div className="flex justify-between items-center bg-white p-4 border rounded-lg shadow-sm">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Sebelumnnya</button>
        <span className="text-sm">Halaman {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={data.length < 50} className="px-3 py-1 border rounded disabled:opacity-50">Selanjutnya</button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Kegiatan" : "Tambah Kegiatan"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Periode</label>
              <select required value={formData.periodId} onChange={e => setFormData({...formData, periodId: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2">
                <option value="">Pilih Periode</option>
                {periods.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bidang / Divisi</label>
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Program Kerja</label>
            <select required value={formData.programId} onChange={e => setFormData({...formData, programId: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2">
              <option value="">Pilih Program Kerja</option>
              {availablePrograms.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nama Kegiatan</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Waktu</label>
              <input type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="contoh: 08:00 - 12:00" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lokasi</label>
            <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Kegiatan</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded px-3 py-2" rows={2}></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded px-3 py-2">
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="ONGOING">ONGOING</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
