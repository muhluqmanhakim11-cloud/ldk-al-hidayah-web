"use client";

import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";
import Image from "next/image";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

export default function GalleriesClient({ periods, divisions, events, userRole, userDivisionId }: any) {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<any>(null);
  
  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterDivision, setFilterDivision] = useState(userRole === "ADMIN_BIDANG" ? String(userDivisionId) : "");
  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState({ id: 0, title: "", periodId: periods[0]?.id || 0, divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : "", eventId: "", description: "", status: "PUBLISHED" });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload States
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const isReadOnly = userRole === "KETUA";

  const fetchGalleries = async () => {
    setFetchLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search) params.append("search", search);
      if (filterPeriod) params.append("periodId", filterPeriod);
      if (filterDivision) params.append("divisionId", filterDivision);
      if (filterStatus) params.append("status", filterStatus);

      const res = await fetch(`/api/admin/galleries?${params.toString()}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, [page, search, filterPeriod, filterDivision, filterStatus]);

  const columns = [
    { header: "Judul", accessor: (row: any) => (
      <div>
        <p className="font-medium text-gray-900 cursor-pointer text-blue-600 hover:underline" onClick={() => openDetail(row)}>{row.title}</p>
        <p className="text-xs text-gray-500">{row.images?.length || 0} Foto</p>
      </div>
    )},
    { header: "Event", accessor: (row: any) => row.event?.name || "-" },
    { 
      header: "Status", 
      accessor: (row: any) => (
        <span className={`px-2 py-1 rounded text-xs font-medium 
          ${row.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
            row.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700' :
            'bg-yellow-100 text-yellow-700'}`}>
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
      const url = isEditing ? `/api/admin/galleries/${formData.id}` : "/api/admin/galleries";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventId: formData.eventId ? parseInt(formData.eventId) : null
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Terjadi kesalahan");

      const targetGalleryId = result.id || formData.id;

      if (uploadFiles && uploadFiles.length > 0) {
        const form = new FormData();
        for (let i = 0; i < uploadFiles.length; i++) {
          form.append("images", uploadFiles[i]);
        }
        const uploadRes = await fetch(`/api/admin/galleries/${targetGalleryId}/images`, {
          method: "POST",
          body: form,
        });
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadResult.error || "Gagal mengunggah foto");
      }

      setUploadFiles(null);
      setIsModalOpen(false);
      fetchGalleries();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: any) => {
    if (!(await confirmDialog(`Hapus galeri ${row.title} beserta semua fotonya? Ini tidak dapat dikembalikan.`))) return;
    
    try {
      const res = await fetch(`/api/admin/galleries/${row.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      fetchGalleries();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFiles || uploadFiles.length === 0) return;

    setUploading(true);
    setError("");

    const form = new FormData();
    for (let i = 0; i < uploadFiles.length; i++) {
      form.append("images", uploadFiles[i]);
    }

    try {
      const res = await fetch(`/api/admin/galleries/${selectedGallery.id}/images`, {
        method: "POST",
        body: form,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal mengunggah foto");

      setUploadFiles(null);
      // Refresh detailed view
      const updatedGalleryRes = await fetch(`/api/admin/galleries?search=${selectedGallery.title}`); // hacky refresh
      fetchGalleries();
      
      const refreshSelf = await fetch(`/api/admin/galleries`);
      const refreshedJson = await refreshSelf.json();
      const updated = refreshedJson.find((g: any) => g.id === selectedGallery.id);
      if (updated) setSelectedGallery(updated);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!(await confirmDialog("Hapus foto ini?"))) return;
    try {
      const res = await fetch(`/api/admin/galleries/${selectedGallery.id}/images/${imageId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus foto");
      
      // Update local state
      setSelectedGallery({
        ...selectedGallery,
        images: selectedGallery.images.filter((img: any) => img.id !== imageId)
      });
      fetchGalleries();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openDetail = (row: any) => {
    setSelectedGallery(row);
    setIsDetailOpen(true);
  };

  const availableDivisions = userRole === "ADMIN_BIDANG" ? divisions.filter((d: any) => d.id === userDivisionId) : divisions;
  const availableEvents = formData.divisionId ? events.filter((e: any) => e.divisionId === Number(formData.divisionId)) : events;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <input 
            type="text" placeholder="Cari galeri..." 
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
          <select className="border rounded px-3 py-2 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
        
        {!isReadOnly && (
          <button 
            onClick={() => { setFormData({ id: 0, title: "", periodId: periods[0]?.id || 0, divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : "", eventId: "", description: "", status: "PUBLISHED" }); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap"
          >
            + Buat Galeri
          </button>
        )}
      </div>

      {fetchLoading ? (
        <div className="p-8 text-center text-gray-500 bg-white border rounded-lg shadow-sm">Loading data...</div>
      ) : (
        <DataTable 
          data={data} 
          columns={columns} 
          onEdit={!isReadOnly ? (row) => { setFormData({ id: row.id, title: row.title, periodId: row.periodId, divisionId: row.divisionId || "", eventId: row.eventId || "", description: row.description || "", status: row.status }); setIsModalOpen(true); } : undefined}
          onDelete={!isReadOnly ? handleDelete : undefined}
        />
      )}

      {/* Pagination controls */}
      <div className="flex justify-between items-center bg-white p-4 border rounded-lg shadow-sm">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Sebelumnnya</button>
        <span className="text-sm">Halaman {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={data.length < 50} className="px-3 py-1 border rounded disabled:opacity-50">Selanjutnya</button>
      </div>

      {/* Detail & Upload Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => { setIsDetailOpen(false); setSelectedGallery(null); }} title={selectedGallery?.title || "Galeri"}>
        <div className="space-y-6 text-black">
          {!isReadOnly && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Upload Foto (Maks 5MB per file)</h3>
              <form onSubmit={handleUpload} className="flex gap-2 flex-col sm:flex-row">
                <input 
                  type="file" multiple accept="image/*" 
                  onChange={(e) => setUploadFiles(e.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button type="submit" disabled={uploading || !uploadFiles} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 whitespace-nowrap">
                  {uploading ? "Mengunggah..." : "Upload"}
                </button>
              </form>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {selectedGallery?.images?.map((img: any) => (
              <div key={img.id} className="relative group border rounded overflow-hidden">
                <div className="relative w-full h-32">
                  <Image src={img.imageUrl} alt="gallery" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
                {!isReadOnly && (
                  <button onClick={() => handleDeleteImage(img.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Hapus
                  </button>
                )}
              </div>
            ))}
            {selectedGallery?.images?.length === 0 && <p className="text-gray-500 col-span-full">Belum ada foto.</p>}
          </div>
        </div>
      </Modal>

      {/* CRUD Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Galeri" : "Buat Galeri"}>
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
            <label className="block text-sm font-medium mb-1">Event / Kegiatan Terkait</label>
            <select value={formData.eventId} onChange={e => setFormData({...formData, eventId: e.target.value})} className="w-full border rounded px-3 py-2">
              <option value="">Tidak ada (Galeri Mandiri)</option>
              {availableEvents.map((ev: any) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Judul Galeri</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded px-3 py-2" rows={2}></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Foto (Opsional, Maks 5MB per file)</label>
            <input 
              type="file" multiple accept="image/*" 
              onChange={(e) => setUploadFiles(e.target.files)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
