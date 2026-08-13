const fs = require('fs');

const apiFiles = [
  'src/app/api/admin/divisions/[id]/route.ts',
  'src/app/api/admin/divisions/route.ts',
  'src/app/api/admin/members/[id]/route.ts',
  'src/app/api/admin/members/route.ts',
  'src/app/api/admin/periods/route.ts',
  'src/app/api/admin/positions/[id]/route.ts',
  'src/app/api/admin/positions/route.ts'
];

for (let f of apiFiles) {
  let content = fs.readFileSync(f, 'utf8');
  // Just in case it's not changed yet
  content = content.replace(/error instanceof z\.ZodError/g, "error instanceof z.ZodError");
  content = content.replace(/error\.errors\[0\]\.message/g, "(error as any).errors[0].message");
  fs.writeFileSync(f, content);
}

console.log('Fixed API files');
