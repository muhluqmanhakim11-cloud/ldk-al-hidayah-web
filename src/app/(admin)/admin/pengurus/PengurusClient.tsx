"use client";

import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import Image from "next/image";

type Member = {
  id: number;
  periodId: number;
  positionId: number;
  divisionId: number | null;
  name: string;
  nim: string | null;
  email: string | null;
  contact: string | null;
  photoUrl: string | null;
  period?: { name: string };
  position?: { name: string };
  division?: { name: string };
};

function HoverPhoto({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!photoUrl) return;
    setPos({ x: e.clientX, y: e.clientY });
    setShow(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!photoUrl) return;
    setPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => setShow(false);

  return (
    <>
      <span
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`font-medium ${photoUrl ? "cursor-pointer underline decoration-dotted decoration-green-500 underline-offset-2" : ""}`}
      >
        {name}
        {photoUrl && (
          <span className="ml-1 text-green-500 text-xs">📷</span>
        )}
      </span>

      {show && photoUrl && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: pos.x + 20,
            top: pos.y - 60,
            animation: "fadeSlideIn 0.2s ease-out forwards",
          }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-600 overflow-hidden w-[140px]">
            <div className="relative w-[140px] h-[175px]">
              <Image
                src={photoUrl}
                alt={name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="px-2 py-1.5 text-center">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{name}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

export default function PengurusClient({ initialData, periods, divisions, positions, userRole, userDivisionId }: any) {
  const [data, setData] = useState<Member[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: 0, periodId: periods[0]?.id || 0, positionId: positions[0]?.id || 0, divisionId: "", name: "", nim: "", email: "", contact: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const router = useRouter();

  // KETUA is read-only
  const isReadOnly = userRole === "KETUA";

  const columns = [
    {
      header: "Nama",
      accessor: (row: Member) => (
        <HoverPhoto name={row.name} photoUrl={row.photoUrl || null} />
      ),
    },
    { header: "Jabatan", accessor: (row: Member) => row.position?.name || "-" },
    { header: "Bidang", accessor: (row: Member) => row.division?.name || "-" },
    { header: "NIM / Kontak", accessor: (row: Member) => <div className="text-xs text-gray-500 dark:text-gray-400">{row.nim || "-"} <br/> {row.contact || "-"}</div> },
  ];

  const openAddModal = () => {
    setFormData({ id: 0, periodId: periods[0]?.id || 0, positionId: positions[0]?.id || 0, divisionId: userRole === "ADMIN_BIDANG" ? String(userDivisionId) : "", name: "", nim: "", email: "", contact: "" });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (row: Member) => {
    setFormData({ id: row.id, periodId: row.periodId, positionId: row.positionId, divisionId: row.divisionId ? String(row.divisionId) : "", name: row.name, nim: row.nim || "", email: row.email || "", contact: row.contact || "" });
    setPhotoFile(null);
    setPhotoPreview(row.photoUrl || null);
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format file harus JPG, PNG, atau WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

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
        divisionId: formData.divisionId ? parseInt(formData.divisionId) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Terjadi kesalahan");

      let savedMember = result;

      // Upload photo if selected
      if (photoFile && result.id) {
        setUploadingPhoto(true);
        const fd = new FormData();
        fd.append("photo", photoFile);
        const photoRes = await fetch(`/api/admin/members/${result.id}/photo`, {
          method: "POST",
          body: fd,
        });
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          savedMember = { ...savedMember, photoUrl: photoData.photoUrl };
        } else {
          toast.error("Data tersimpan, tapi gagal upload foto");
        }
        setUploadingPhoto(false);
      }

      setIsModalOpen(false);

      const periodName = periods.find((p: any) => p.id === formData.periodId)?.name;
      const positionName = positions.find((p: any) => p.id === formData.positionId)?.name;
      const divisionName = payload.divisionId ? divisions.find((d: any) => d.id === payload.divisionId)?.name : null;

      const displayResult = { ...savedMember, period: { name: periodName }, position: { name: positionName }, division: { name: divisionName } };

      if (isEditing) {
        setData(data.map((d: any) => d.id === formData.id ? displayResult : d));
      } else {
        setData([displayResult, ...data]);
      }

      toast.success(isEditing ? "Data pengurus berhasil diperbarui" : "Pengurus berhasil ditambahkan");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploadingPhoto(false);
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
            className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm font-medium"
          >
            Hapus Semua
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            + Tambah Pengurus
          </button>
        </div>
      )}

      <DataTable
        data={data}
        columns={columns}
        onEdit={!isReadOnly ? openEditModal : undefined}
        onDelete={!isReadOnly ? handleDelete : undefined}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Pengurus" : "Tambah Pengurus"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-black dark:text-gray-100">
          {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/30 p-2 rounded">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Periode</label>
              <select required value={formData.periodId} onChange={e => setFormData({...formData, periodId: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600">
                {periods.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bidang / Divisi (Opsional)</label>
              <select
                value={formData.divisionId}
                onChange={e => setFormData({...formData, divisionId: e.target.value})}
                className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
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
              <select required value={formData.positionId} onChange={e => setFormData({...formData, positionId: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600">
                {positions.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">NIM (Opsional)</label>
              <input type="text" value={formData.nim} onChange={e => setFormData({...formData, nim: e.target.value})} className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No WhatsApp (Opsional)</label>
              <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600" placeholder="08..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email (Opsional)</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
          </div>

          {/* Foto Pengurus */}
          <div>
            <label className="block text-sm font-medium mb-2">Foto Pengurus (Opsional, maks. 2MB)</label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="shrink-0 w-20 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-gray-300">👤</span>
                )}
              </div>
              {/* Input */}
              <div className="flex-1">
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-slate-500 rounded-lg hover:border-blue-400 dark:hover:border-blue-400 transition-colors text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <span>📁</span>
                  <span>{photoFile ? photoFile.name : "Pilih foto..."}</span>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <p className="text-xs text-gray-400 mt-1.5">Format: JPG, PNG, WebP. Foto akan di-crop otomatis 4:5.</p>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                  >
                    Hapus foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingPhoto}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium"
          >
            {uploadingPhoto ? "Mengupload foto..." : loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
