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

client_pages = glob.glob('src/app/(admin)/admin/**/ClientPage.tsx', recursive=True)
for page in client_pages:
    replace_in_file(page, r'new Date\(payload\.(\w+)\)', r'new Date(payload.\1 as string)')

print("Payload date fixes applied.")
