"use client";

import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

type Period = {
  id: number;
  name: string;
  isActive: boolean;
};

export default function PeriodeClient({ initialData, userRole }: { initialData: Period[], userRole: string }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: 0, name: "", isActive: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const columns = [
    { header: "Nama Periode", accessor: "name" as keyof Period },
    { 
      header: "Status", 
      accessor: (row: Period) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.isActive ? 'bg-green-100 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'}`}>
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
      const url = isEditing ? `/api/admin/periods/${formData.id}` : "/api/admin/periods";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, isActive: formData.isActive }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Terjadi kesalahan");

      setIsModalOpen(false);
      router.refresh(); // Refresh server component
      
      // Update local state temporarily for better UX
      if (isEditing) {
        setData(data.map(d => d.id === formData.id ? { ...d, ...result } : (result.isActive ? { ...d, isActive: false } : d)));
      } else {
        setData([result, ...(result.isActive ? data.map(d => ({...d, isActive: false})) : data)]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: Period) => {
    if (!(await confirmDialog(`Hapus periode ${row.name}?`))) return;
    
    try {
      const res = await fetch(`/api/admin/periods/${row.id}`, { method: "DELETE" });
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
            onClick={() => { setFormData({ id: 0, name: "", isActive: false }); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Tambah Periode
          </button>
        </div>
      )}

      <DataTable 
        data={data} 
        columns={columns} 
        onEdit={isSuperAdmin ? (row) => { setFormData({ id: row.id, name: row.name, isActive: row.isActive }); setIsModalOpen(true); } : undefined}
        onDelete={isSuperAdmin ? handleDelete : undefined}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Periode" : "Tambah Periode"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/30 p-2 rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium mb-1">Nama Periode (Contoh: 2026/2027)</label>
            <input 
              type="text" required 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" id="isActive"
              checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})}
            />
            <label htmlFor="isActive" className="text-sm font-medium">Jadikan Periode Aktif</label>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
