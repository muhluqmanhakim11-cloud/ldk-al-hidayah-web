import os

ui_dir = r"d:\ldk-al-hidayah\src\app\(admin)\admin\catatan"
api_dir = r"d:\ldk-al-hidayah\src\app\api\admin\catatan"
api_id_dir = os.path.join(api_dir, "[id]")

os.makedirs(ui_dir, exist_ok=True)
os.makedirs(api_id_dir, exist_ok=True)

# 1. page.tsx
with open(os.path.join(ui_dir, "page.tsx"), "w", encoding="utf-8") as f:
    f.write("""import { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Catatan Bersama | Admin LDK Al-Hidayah",
};

export default function Page() {
  return <ClientPage />;
}
""")

# 2. ClientPage.tsx
with open(os.path.join(ui_dir, "ClientPage.tsx"), "w", encoding="utf-8") as f:
    f.write('''"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

export default function ClientPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ title: '', content: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/catatan");
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
    if (!confirm("Yakin ingin menghapus catatan ini?")) return;
    try {
      const res = await fetch(`/api/admin/catatan/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Catatan berhasil dihapus");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menghapus catatan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/catatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Catatan berhasil ditambahkan");
        setIsFormOpen(false);
        fetchData();
        setFormData({ title: '', content: '' });
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menambah catatan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: "Tanggal", accessor: (row: any) => new Date(row.createdAt).toLocaleDateString("id-ID") },
    { header: "Judul Catatan", accessor: "title" },
    { header: "Isi Catatan", accessor: (row: any) => <div className="max-w-xs truncate">{row.content}</div> },
    { header: "Penulis", accessor: "authorName" },
    {
      header: "Aksi",
      accessor: (row: any) => (
        <div className="flex gap-2">
          {row.canDelete && (
            <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded" title="Hapus Catatan">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catatan Divisi / Bersama</h1>
          <p className="text-gray-500 mt-1">Simpan notulensi, draf, atau ide penting</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus size={20} /> Tulis Catatan
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
            searchPlaceholder="Cari catatan..."
          />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Buat Catatan Baru">
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Judul Catatan</label>
            <input type="text" required placeholder="Misal: Notulensi Rapat Bidang" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Isi Catatan</label>
            <textarea required rows={5} placeholder="Tulis catatan lengkap di sini..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
              {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : "Simpan Catatan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
''')

# 3. GET/POST route
with open(os.path.join(api_dir, "route.ts"), "w", encoding="utf-8") as f:
    f.write('''import { auth } from "@/auth";
import { db } from "@/db";
import { divisionNotes, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    
    // Fetch all notes, we will filter in memory or via query
    let query = db.select({
      id: divisionNotes.id,
      title: divisionNotes.title,
      content: divisionNotes.content,
      divisionId: divisionNotes.divisionId,
      createdBy: divisionNotes.createdBy,
      createdAt: divisionNotes.createdAt,
      authorName: users.name
    }).from(divisionNotes)
      .leftJoin(users, eq(divisionNotes.createdBy, users.id))
      .orderBy(desc(divisionNotes.createdAt));

    let data = await query;

    // If not super admin, only show notes from their division
    if (user.realRole !== 'super_admin' && user.divisionId) {
      data = data.filter(d => d.divisionId === user.divisionId);
    }

    // Add canDelete flag (can delete if super admin OR if they are the author)
    const processedData = data.map(d => ({
      ...d,
      canDelete: user.realRole === 'super_admin' || d.createdBy === parseInt(user.id)
    }));
    
    return NextResponse.json(processedData);
  } catch (error) {
    console.error("GET notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const body = await req.json();
    const { title, content } = body;
    
    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan isi harus diisi" }, { status: 400 });
    }

    const [newNote] = await db.insert(divisionNotes).values({
      title,
      content,
      createdBy: parseInt(user.id),
      divisionId: user.divisionId || null
    }).returning();
    
    return NextResponse.json(newNote, { status: 201 });
  } catch (error: any) {
    console.error("POST notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
''')

# 4. DELETE route
with open(os.path.join(api_id_dir, "route.ts"), "w", encoding="utf-8") as f:
    f.write('''import { auth } from "@/auth";
import { db } from "@/db";
import { divisionNotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const { id } = await params;
    const noteId = parseInt(id);
    
    // Get the note to check permissions
    const [note] = await db.select().from(divisionNotes).where(eq(divisionNotes.id, noteId));
    if (!note) return NextResponse.json({ error: "Catatan tidak ditemukan" }, { status: 404 });

    // Super admin can delete any note. Others can only delete their own note.
    if (user.realRole !== 'super_admin' && note.createdBy !== parseInt(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(divisionNotes).where(eq(divisionNotes.id, noteId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
''')

print("Catatan scaffold complete!")
