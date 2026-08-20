"use client";

import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

type Position = {
  id: number;
  name: string;
  level: number | null;
};

export default function JabatanClient({ initialData, userRole }: { initialData: Position[], userRole: string }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: 0, name: "", level: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const columns = [
    { header: "Level", accessor: "level" as keyof Position },
    { header: "Nama Jabatan", accessor: "name" as keyof Position },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isEditing = formData.id !== 0;
      const url = isEditing ? `/api/admin/positions/${formData.id}` : "/api/admin/positions";
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
      
      if (isEditing) {
        setData(data.map(d => d.id === formData.id ? result : d));
      } else {
        setData([...data, result].sort((a, b) => (a.level || 0) - (b.level || 0)));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: Position) => {
    if (!(await confirmDialog(`Hapus jabatan ${row.name}?`))) return;
    
    try {
      const res = await fetch(`/api/admin/positions/${row.id}`, { method: "DELETE" });
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
        <div className="mb-5 flex justify-end">
          <button 
            onClick={() => { setFormData({ id: 0, name: "", level: 0 }); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm w-full sm:w-auto"
          >
            + Tambah Jabatan
          </button>
        </div>
      )}

      <DataTable 
        data={data} 
        columns={columns} 
        onEdit={isSuperAdmin ? (row) => { setFormData({ id: row.id, name: row.name, level: row.level || 0 }); setIsModalOpen(true); } : undefined}
        onDelete={isSuperAdmin ? handleDelete : undefined}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Jabatan" : "Tambah Jabatan"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Nama Jabatan</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Contoh: Ketua, Sekretaris" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Level (Order Hierarki)</label>
            <input type="number" required value={formData.level} onChange={e => setFormData({...formData, level: parseInt(e.target.value)})} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-slate-950 p-2 rounded border border-gray-100 dark:border-slate-800">💡 Makin kecil angkanya, makin tinggi jabatannya (contoh: 1 = Pembina, 2 = Ketua).</p>
          </div>
          
          <div className="pt-4 border-t mt-4">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Menyimpan..." : "Simpan Jabatan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
