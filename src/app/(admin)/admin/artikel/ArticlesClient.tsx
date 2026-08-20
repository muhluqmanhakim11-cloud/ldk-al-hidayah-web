"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ArticlesClient({ divisions, userRole, userDivisionId }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterDivision, setFilterDivision] = useState(userRole === "ADMIN_BIDANG" ? String(userDivisionId) : "");

  const [formData, setFormData] = useState({
    id: 0,
    title: "",
    content: "",
    divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : "",
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const isReadOnly = userRole === "KETUA";

  const fetchArticles = async () => {
    setFetchLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterDivision) params.append("divisionId", filterDivision);

      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [search, filterDivision]);

  const columns = [
    { 
      header: "Cover", 
      accessor: (row: any) => row.coverImage ? 
        <div className="relative w-16 h-12 rounded overflow-hidden">
          <Image src={row.coverImage} alt={row.title} fill className="object-cover" />
        </div> : 
        <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No Image</div>
    },
    { 
      header: "Judul", 
      accessor: (row: any) => (
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-500">Oleh: {row.author?.name} • {new Date(row.createdAt).toLocaleDateString("id-ID")}</p>
        </div>
      )
    },
    { header: "Bidang", accessor: (row: any) => row.division?.name || "Umum / LDK" },
    { 
      header: "Status", 
      accessor: (row: any) => (
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
          PUBLISHED
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
      const url = isEditing ? `/api/admin/articles/${formData.id}` : "/api/admin/articles";
      const method = isEditing ? "PATCH" : "POST";

      const form = new FormData();
      form.append("title", formData.title);
      form.append("content", formData.content);
      if (formData.divisionId) form.append("divisionId", String(formData.divisionId));
      if (uploadFile) form.append("coverImage", uploadFile);

      const res = await fetch(url, {
        method,
        body: form,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Terjadi kesalahan");

      setIsModalOpen(false);
      setUploadFile(null);
      fetchArticles();
      toast.success("Berita berhasil disimpan!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: any) => {
    if (!(await confirmDialog(`Hapus artikel "${row.title}"?`))) return;
    
    try {
      const res = await fetch(`/api/admin/articles/${row.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      fetchArticles();
      toast.success("Artikel berhasil dihapus");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const availableDivisions = userRole === "ADMIN_BIDANG" ? divisions.filter((d: any) => d.id === userDivisionId) : divisions;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <input 
            type="text" placeholder="Cari artikel..." 
            className="border rounded px-3 py-2 text-sm"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select 
            className="border rounded px-3 py-2 text-sm" 
            value={filterDivision} onChange={e => setFilterDivision(e.target.value)}
            disabled={userRole === "ADMIN_BIDANG"}
          >
            <option value="">Semua Bidang / Umum</option>
            {availableDivisions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        
        {!isReadOnly && (
          <button 
            onClick={() => { 
              setFormData({ id: 0, title: "", content: "", divisionId: userRole === "ADMIN_BIDANG" ? userDivisionId : "" }); 
              setUploadFile(null);
              setIsModalOpen(true); 
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap"
          >
            + Buat Artikel
          </button>
        )}
      </div>

      {fetchLoading ? (
        <div className="p-8 text-center text-gray-500 bg-white border rounded-lg shadow-sm">Loading data...</div>
      ) : (
        <DataTable 
          data={data} 
          columns={columns} 
          onEdit={!isReadOnly ? (row) => { 
            setFormData({ id: row.id, title: row.title, content: row.content || "", divisionId: row.divisionId || "" }); 
            setUploadFile(null);
            setIsModalOpen(true); 
          } : undefined}
          onDelete={!isReadOnly ? handleDelete : undefined}
        />
      )}

      {/* CRUD Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Artikel" : "Buat Artikel Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul Artikel</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bidang / Divisi Terkait</label>
                <select 
                  value={formData.divisionId} 
                  onChange={e => setFormData({...formData, divisionId: e.target.value})} 
                  className="w-full border rounded px-3 py-2"
                  disabled={userRole === "ADMIN_BIDANG"}
                >
                  <option value="">Umum (LDK)</option>
                  {availableDivisions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Pilih "Umum" jika ini adalah berita LDK pusat.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gambar Cover (Opsional)</label>
                <input 
                  type="file" accept="image/*" 
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Konten Artikel</label>
              <textarea 
                required 
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})} 
                className="w-full border rounded px-3 py-2 h-64 font-sans" 
                placeholder="Tulis isi berita di sini..."
              ></textarea>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors">
              {loading ? "Menyimpan..." : (formData.id ? "Simpan Perubahan" : "Publish Artikel")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
