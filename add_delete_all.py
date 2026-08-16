import os
import re

base_api = r"d:\ldk-al-hidayah\src\app\api\admin"
base_ui = r"d:\ldk-al-hidayah\src\app\(admin)\admin"

# Regex patterns
insert_pattern = re.compile(r'db\.insert\(([a-zA-Z0-9_]+)\)')
select_pattern = re.compile(r'db\.select\([^\)]*\)\.from\(([a-zA-Z0-9_]+)\)')

for root, dirs, files in os.walk(base_api):
    # Only process root route.ts (not inside [id])
    if "route.ts" in files and "[id]" not in root:
        api_path = os.path.join(root, "route.ts")
        with open(api_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # If already has DELETE, skip
        if "export async function DELETE(req: Request)" in content:
            continue
            
        # Find table name
        m = insert_pattern.search(content)
        if not m:
            m = select_pattern.search(content)
        
        if m:
            table_name = m.group(1)
            delete_func = f"""
export async function DELETE(req: Request) {{
  try {{
    const session = await auth();
    if (!session) return NextResponse.json({{ error: "Unauthorized" }}, {{ status: 401 }});
    // Optional: Add strict role check here if needed, but we trust the route's existing auth
    await db.delete({table_name});
    return NextResponse.json({{ success: true }});
  }} catch (error) {{
    return NextResponse.json({{ error: "Internal Server Error" }}, {{ status: 500 }});
  }}
}}
"""
            with open(api_path, "a", encoding="utf-8") as f:
                f.write(delete_func)

for root, dirs, files in os.walk(base_ui):
    if "ClientPage.tsx" in files:
        ui_path = os.path.join(root, "ClientPage.tsx")
        with open(ui_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        if "handleDeleteAll" in content:
            continue
            
        if "Tambah Data" in content or "Tambah Agenda" in content or "Tulis Catatan" in content:
            # Figure out API URL based on directory structure
            # Example root: d:\ldk-al-hidayah\src\app\(admin)\admin\dkm\inventaris
            rel_path = os.path.relpath(root, base_ui).replace("\\", "/")
            api_url = f"/api/admin/{rel_path}"

            # 1. Inject handleDeleteAll
            handle_delete_all = f"""
  const handleDeleteAll = async () => {{
    if (!confirm("Peringatan Keras: Anda yakin ingin menghapus SEMUA data di halaman ini? Aksi ini tidak dapat dibatalkan!")) return;
    try {{
      const res = await fetch("{api_url}", {{ method: "DELETE" }});
      if (res.ok) {{
        toast.success("Seluruh data berhasil dihapus");
        fetchData();
      }} else {{
        toast.error("Gagal menghapus semua data");
      }}
    }} catch (error) {{
      toast.error("Terjadi kesalahan jaringan");
    }}
  }};
"""
            # Insert after fetchData or before useEffect
            if "useEffect(() =>" in content:
                content = content.replace("useEffect(() =>", handle_delete_all + "\n  useEffect(() =>")
            
            # 2. Inject button next to Tambah Data
            button_code = f"""
          <button
            onClick={{handleDeleteAll}}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-medium"
          >
            <Trash2 size={{20}} /> Hapus Semua
          </button>
"""
            # Find the button block
            if "<Plus size={20} />" in content:
                # Insert the button code right before the `<button` that has Plus
                # We need a robust string replacement
                btn_idx = content.find("onClick={() => setIsFormOpen(true)}")
                if btn_idx != -1:
                    # Find the start of this button tag
                    start_btn = content.rfind("<button", 0, btn_idx)
                    content = content[:start_btn] + button_code + content[start_btn:]
            
            with open(ui_path, "w", encoding="utf-8") as f:
                f.write(content)

print("Hapus Semua feature injected to all CRUD pages!")
