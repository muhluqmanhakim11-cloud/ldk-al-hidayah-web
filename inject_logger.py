import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already logged or no db modification
    if 'logActivity' in content or ('db.insert' not in content and 'db.update' not in content and 'db.delete' not in content):
        return

    # Extract entity type from path
    # e.g., src/app/api/admin/dkm/piket/route.ts -> DKM_PIKET
    parts = filepath.replace('\\', '/').split('/api/admin/')
    if len(parts) < 2:
        return
    
    subpath = parts[1].replace('/[id]/route.ts', '').replace('/route.ts', '').replace('/[slug]', '')
    entity_type = subpath.upper().replace('/', '_').replace('-', '_')
    if not entity_type:
        entity_type = "GENERAL"

    new_content = content
    # Add import
    if 'import { logActivity }' not in new_content:
        import_stmt = 'import { logActivity } from "@/lib/logger";\n'
        # find last import
        imports_end = new_content.rfind('import ')
        if imports_end != -1:
            next_newline = new_content.find('\n', imports_end)
            new_content = new_content[:next_newline+1] + import_stmt + new_content[next_newline+1:]
        else:
            new_content = import_stmt + new_content

    # Function to inject before return NextResponse.json
    def inject_logger(match, action):
        return f"""
    try {{
      await logActivity({{
        action: "{action}",
        entityType: "{entity_type}",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      }});
    }} catch (e) {{ console.error(e); }}
    {match.group(0)}"""

    # We need to inject inside POST, PATCH, DELETE, before the successful return.
    # A simple heuristic: find the first `return NextResponse.json` AFTER `db.insert/update/delete` inside the function.
    
    methods = ['POST', 'PATCH', 'DELETE']
    for method in methods:
        action_map = {'POST': 'CREATE', 'PATCH': 'UPDATE', 'DELETE': 'DELETE'}
        action = action_map[method]
        
        method_pattern = r'export async function ' + method + r'\b.*?try \{'
        method_match = re.search(method_pattern, new_content, re.DOTALL)
        
        if method_match:
            start_idx = method_match.end()
            # find the end of the try block by counting braces
            braces = 1
            i = start_idx
            while i < len(new_content) and braces > 0:
                if new_content[i] == '{': braces += 1
                elif new_content[i] == '}': braces -= 1
                i += 1
            end_idx = i
            
            try_block = new_content[start_idx:end_idx]
            
            # check if it actually modifies DB
            if ('db.insert' in try_block and method == 'POST') or \
               ('db.update' in try_block and method == 'PATCH') or \
               ('db.delete' in try_block and method == 'DELETE'):
                
                # find the first return NextResponse.json(...) that doesn't have an error status
                # e.g., return NextResponse.json(..., { status: 201 }) or return NextResponse.json(newProgram)
                
                # We'll replace the last return NextResponse.json in this block that returns success (not 4xx/5xx).
                # To be safe, we just replace all `return NextResponse.json` that do NOT contain `{ status: 4` or `{ status: 5`.
                def return_replacer(m):
                    if '{ status: 4' in m.group(0) or '{ status: 5' in m.group(0):
                        return m.group(0)
                    return f"""
    try {{
      await logActivity({{
        action: "{action}",
        entityType: "{entity_type}",
        entityName: "Data",
        divisionId: session?.user?.divisionId || null,
      }});
    }} catch(e) {{}}
    {m.group(0)}"""
                
                new_try_block = re.sub(r'return NextResponse\.json\([^\)]*\);?', return_replacer, try_block)
                new_content = new_content[:start_idx] + new_try_block + new_content[end_idx:]
                
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Injected logger into {filepath}")

def main():
    api_dir = os.path.join('src', 'app', 'api', 'admin')
    for root, dirs, files in os.walk(api_dir):
        for file in files:
            if file == 'route.ts':
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
