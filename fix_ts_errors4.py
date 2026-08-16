import os
import re

def replace_in_file(filepath, pattern, replacement):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# 1. bidang and jabatan page string | undefined
replace_in_file('src/app/(admin)/admin/bidang/page.tsx', r'userRole=\{session\.user\.role\}', r'userRole={session.user.role || ""}')
replace_in_file('src/app/(admin)/admin/jabatan/page.tsx', r'userRole=\{session\.user\.role\}', r'userRole={session.user.role || ""}')

# 2. PengumumanClient.tsx errors
pengumuman = 'src/app/(admin)/admin/pengumuman/PengumumanClient.tsx'
replace_in_file(pengumuman, r'row\.repliedAt', r'row.createdAt')
replace_in_file(pengumuman, r'ack\.createdAt', r'ack.repliedAt')
replace_in_file(pengumuman, r'const columns = \[', r'const columns: any[] = [')
replace_in_file(pengumuman, r'ack\.repliedAt \|\| ack\.repliedAt', r'ack.repliedAt || ""') # Fix recursive replacement bug from previous line

# 3. announcements/route.ts
announcements_route = 'src/app/api/admin/announcements/route.ts'
replace_in_file(announcements_route, r'parsed\.error\.errors', r'(parsed.error as any).errors')

print("Final TS fixes applied.")
