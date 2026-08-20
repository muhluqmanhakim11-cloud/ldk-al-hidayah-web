"use client";

import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

type Member = {
  id: number;
  periodId: number;
  positionId: number;
  divisionId: number | null;
  name: string;
  nim: string | null;
  email: string | null;
  contact: string | null;
  period?: { name: string };
  position?: { name: string };
  division?: { name: string };
};

export default function PengurusClient({ initialData, periods, divisions, positions, userRole, userDivisionId }: any) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: 0, periodId: periods[0]?.id || 0, positionId: positions[0]?.id || 0, divisionId: "", name: "", nim: "", email: "", contact: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // KETUA is read-only
  const isReadOnly = userRole === "KETUA";

  const columns = [
    { header: "Nama", accessor: "name" as keyof Member },
    { header: "Jabatan", accessor: (row: Member) => row.position?.name || "-" },
    { header: "Bidang", accessor: (row: Member) => row.division?.name || "-" },
    { header: "NIM / Kontak", accessor: (row: Member) => <div className="text-xs text-gray-500">{row.nim || "-"} <br/> {row.contact || "-"}</div> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isEditing = formData.id !== 0;
      const url = isEditing ? `/api/admin/members/${formData.id}` : "/api/admin/members";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        ...formData,
        divisionId: formData.divisionId ? parseInt(formData.divisionId) : null
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Terjadi kesalahan");

      setIsModalOpen(false);
      router.refresh();
      
      const periodName = periods.find((p: any) => p.id === formData.periodId)?.name;
      const positionName = positions.find((p: any) => p.id === formData.positionId)?.name;
      const divisionName = payload.divisionId ? divisions.find((d: any) => d.id === payload.divisionId)?.name : null;
      
      const displayResult = { ...result, period: { name: periodName }, position: { name: positionName }, division: { name: divisionName } };

      if (isEditing) {
        setData(data.map((d: any) => d.id === formData.id ? displayResult : d));
      } else {
        setData([displayResult, ...data]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: Member) => {
    if (!(await confirmDialog(`Hapus pengurus ${row.name}?`))) return;
    
    try {
      const res = await fetch(`/api/admin/members/${row.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      setData(data.filter((d: any) => d.id !== row.id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ADMIN_BIDANG can only assign to their own division
  const availableDivisions = userRole === "ADMIN_BIDANG" ? divisions.filter((d: any) => d.id === userDivisionId) : divisions;

  return (
    <div>
      {!isReadOnly && (
        <div className="mb-4 flex gap-3">
          <button 
            onClick={async () => {
              if (!confirm("Peringatan Keras: Anda yakin ingin menghapus SEMUA data pengurus? Aksi ini tidak dapat dibatalkan!")) return;
              try {
                // Here we would call an endpoint to delete all. Let's create it if needed.
                const res = await fetch("/api/admin/members?action=deleteAll", { method: "DELETE" });
                if (res.ok) {
                  toast.success("Seluruh data berhasil dihapus");
                  router.refresh();
                } else {
                  toast.error("Gagal menghapus semua data");
                }
              } catch (error) {
                toast.error("Terjadi kesalahan jaringan");
              }
            }}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm font-medium"
          >
            Hapus Semua
          </button>
          <button 
            onClick={() => { setFormData({ id: 0, periodId: periods[0]?.id || 0, positionId: positions[0]?.id || 0, divisionId: userRole === "ADMIN_BIDANG" ? String(userDivisionId) : "", name: "", nim: "", email: "", contact: "" }); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            + Tambah Pengurus
          </button>
        </div>
      )}

      <DataTable 
        data={data} 
        columns={columns} 
        onEdit={!isReadOnly ? (row) => { setFormData({ id: row.id, periodId: row.periodId, positionId: row.positionId, divisionId: row.divisionId ? String(row.divisionId) : "", name: row.name, nim: row.nim || "", email: row.email || "", contact: row.contact || "" }); setIsModalOpen(true); } : undefined}
        onDelete={!isReadOnly ? handleDelete : undefined}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Pengurus" : "Tambah Pengurus"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Periode</label>
              <select required value={formData.periodId} onChange={e => setFormData({...formData, periodId: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2">
                {periods.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bidang / Divisi (Opsional)</label>
              <select 
                value={formData.divisionId} 
                onChange={e => setFormData({...formData, divisionId: e.target.value})} 
                className="w-full border rounded px-3 py-2"
                disabled={userRole === "ADMIN_BIDANG"}
              >
                <option value="">Tidak ada divisi (BPH)</option>
                {availableDivisions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jabatan</label>
              <select required value={formData.positionId} onChange={e => setFormData({...formData, positionId: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2">
                {positions.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium mb-1">NIM (Opsional)</label>
              <input type="text" value={formData.nim} onChange={e => setFormData({...formData, nim: e.target.value})} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No WhatsApp (Opsional)</label>
              <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="08..." />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email (Opsional)</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
