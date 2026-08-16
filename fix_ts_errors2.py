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

# 1. Date typing fixes in Seni/Olahraga Agenda
agenda = 'src/app/(admin)/admin/seni-olahraga/agenda/ClientPage.tsx'
replace_in_file(agenda, r'new Date\((row\.jadwal)\)', r'new Date(\1 as string)')
replace_in_file(agenda, r'new Date\((row\.tanggal)\)', r'new Date(\1 as string)')
replace_in_file(agenda, r'new Date\((row\.tanggal \|\| "")\)', r'new Date(\1 as string)')
replace_in_file(agenda, r'new Date\((row\.jadwal \|\| "")\)', r'new Date(\1 as string)')

# 2. Zod error in announcements
announcement_route = 'src/app/api/admin/announcements/route.ts'
replace_in_file(announcement_route, r'\(error\)\.errors', r'(error as any).errors')

# 3. divisionId in articles
for file in ['src/app/api/admin/articles/route.ts', 'src/app/api/admin/articles/[id]/route.ts']:
    replace_in_file(file, r'divisionId = session\.user\.divisionId;', r'divisionId = session.user.divisionId || null;')
    replace_in_file(file, r'divisionId = session\.user\.divisionId', r'divisionId = session.user.divisionId || null')

print("TS fixes applied round 2.")
