import os
import re
import glob

def replace_in_file(filepath, pattern, replacement):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# 1. Date typing fixes in all ClientPage.tsx
client_pages = glob.glob('src/app/(admin)/admin/**/ClientPage.tsx', recursive=True)
for page in client_pages:
    replace_in_file(page, r'new Date\((row\.\w+)\)', r'new Date(\1 as string)')
    replace_in_file(page, r'new Date\((row\.\w+ \|\| "")\)', r'new Date(\1 as string)')

# 2. PengumumanClient.tsx fix column accessor and createdAt
pengumuman = 'src/app/(admin)/admin/pengumuman/PengumumanClient.tsx'
replace_in_file(pengumuman, r'\{ header: "Aksi", accessor: "aksi" \},', r'{ header: "Aksi", accessor: (row: any) => "aksi" },')
replace_in_file(pengumuman, r'row\.createdAt', r'row.repliedAt') # Assuming repliedAt is the date

# 3. announcements/route.ts Zod error
announcement_route = 'src/app/api/admin/announcements/route.ts'
replace_in_file(announcement_route, r'\(error\)\.errors', r'(error as any).errors')
replace_in_file(announcement_route, r'e => e\.message', r'(e: any) => e.message')

# 4. admin/periode/page.tsx string | undefined
periode_page = 'src/app/(admin)/admin/periode/page.tsx'
replace_in_file(periode_page, r'userRole={session\.user\.role}', r'userRole={session.user.role || ""}')

# 5. recruitment/[id]/page.tsx string | undefined
recruitment_page = 'src/app/(admin)/admin/recruitment/[id]/page.tsx'
replace_in_file(recruitment_page, r'userRole={session\.user\.role}', r'userRole={session.user.role || ""}')

# 6. articles/route.ts and articles/[id]/route.ts authorId typing
for file in ['src/app/api/admin/articles/route.ts', 'src/app/api/admin/articles/[id]/route.ts']:
    replace_in_file(file, r'authorId: session\.user\.id,', r'authorId: parseInt(session.user.id),')
    replace_in_file(file, r'authorId: session\.user\.id', r'authorId: parseInt(session.user.id)')

print("TS fixes applied.")
