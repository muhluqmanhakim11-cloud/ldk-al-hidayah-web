const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('src/app/api/admin');

for (let f of files) {
  let content = fs.readFileSync(f, 'utf8');
  let originalContent = content;

  const regex = /const validated = ([A-Za-z0-9_]+)\.parse\(body\);/g;
  
  content = content.replace(regex, (match, schemaName) => {
    return `const parsed = ${schemaName}.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: (parsed.error as any).errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    const validated = parsed.data;`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(f, content);
    console.log('Refactored', f);
  }
}
