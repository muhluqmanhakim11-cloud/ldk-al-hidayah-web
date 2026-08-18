"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, RefreshCw, Trash2, Key } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

export default function ClientPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', role: 'super_admin', password: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      setData(json);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus admin ini? (Aksi ini tidak dapat dibatalkan)")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User berhasil dihapus");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menghapus user");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("User berhasil ditambahkan");
        setIsFormOpen(false);
        fetchData();
        setFormData({ name: '', email: '', role: 'super_admin', password: '' });
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menambah user");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: "Nama Admin", accessor: "name" },
    { header: "Email Login", accessor: "email" },
    { header: "Role Akses", accessor: (row: any) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${row.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
        {row.role.replace('admin_', 'Admin ').toUpperCase()}
      </span>
    ) },
    { header: "Terdaftar", accessor: (row: any) => new Date(row.createdAt as string).toLocaleDateString("id-ID") },
    {
      header: "Aksi",
      accessor: (row: any) => (
        <div className="flex gap-2">
          <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded" title="Hapus User">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
          <p className="text-gray-500 mt-1">Kelola akun admin dan hak akses divisi</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm flex-1 sm:flex-none"
          >
            <Plus size={20} /> Tambah Admin
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {isLoading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-blue-500" /></div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Cari email atau nama admin..."
          />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Tambah Akun Admin Baru">
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Login</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded-lg p-2 pl-10" placeholder="Minimal 6 karakter" />
              <Key size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role / Hak Akses</label>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border rounded-lg p-2">
              <option value="super_admin">Super Admin (Akses Penuh)</option>
              <option value="admin_dkm">Admin Divisi DKM</option>
              <option value="admin_kaderisasi">Admin Divisi Kaderisasi</option>
              <option value="admin_kominfo">Admin Divisi Kominfo</option>
              <option value="admin_pensos">Admin Divisi Pensos</option>
              <option value="admin_seni_olahraga">Admin Divisi Seni & Olahraga</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
              {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : "Simpan Admin"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
