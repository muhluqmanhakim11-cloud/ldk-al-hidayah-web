"use client";

import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

type Division = {
  id: number;
  periodId: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  period?: { name: string };
};

type Period = { id: number; name: string };

export default function BidangClient({ initialData, periods, userRole }: { initialData: Division[], periods: Period[], userRole: string }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: 0, periodId: periods[0]?.id || 0, name: "", slug: "", description: "", isActive: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const columns = [
    { header: "Periode", accessor: (row: Division) => row.period?.name || "-" },
    { header: "Nama Bidang", accessor: "name" as keyof Division },
    { header: "Slug", accessor: "slug" as keyof Division },
    { 
      header: "Status", 
      accessor: (row: Division) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {row.isActive ? 'Aktif' : 'Nonaktif'}
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
      const url = isEditing ? `/api/admin/divisions/${formData.id}` : "/api/admin/divisions";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Terjadi kesalahan");

      setIsModalOpen(false);
      router.refresh();
      
      const periodName = periods.find(p => p.id === formData.periodId)?.name;
      const displayResult = { ...result, period: { name: periodName } };

      if (isEditing) {
        setData(data.map(d => d.id === formData.id ? displayResult : d));
      } else {
        setData([displayResult, ...data]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: Division) => {
    if (!(await confirmDialog(`Hapus bidang ${row.name}?`))) return;
    
    try {
      const res = await fetch(`/api/admin/divisions/${row.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      setData(data.filter(d => d.id !== row.id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      {isSuperAdmin && (
        <div className="mb-4">
          <button 
            onClick={() => { setFormData({ id: 0, periodId: periods[0]?.id || 0, name: "", slug: "", description: "", isActive: true }); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Tambah Bidang
          </button>
        </div>
      )}

      <DataTable 
        data={data} 
        columns={columns} 
        onEdit={isSuperAdmin ? (row) => { setFormData({ id: row.id, periodId: row.periodId, name: row.name, slug: row.slug, description: row.description || "", isActive: row.isActive }); setIsModalOpen(true); } : undefined}
        onDelete={isSuperAdmin ? handleDelete : undefined}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Bidang" : "Tambah Bidang"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium mb-1">Periode</label>
            <select required value={formData.periodId} onChange={e => setFormData({...formData, periodId: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2">
              <option value="">Pilih Periode</option>
              {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Bidang</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug (URL)</label>
            <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="contoh: dkm, kaderisasi" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded px-3 py-2" rows={3}></textarea>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
            <label htmlFor="isActive" className="text-sm font-medium">Aktif</label>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
