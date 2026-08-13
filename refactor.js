const fs = require('fs');

const files = [
  'src/components/admin/RecruitmentStatusForm.tsx',
  'src/app/(admin)/admin/programs/ProgramsClient.tsx',
  'src/app/(admin)/admin/periode/PeriodeClient.tsx',
  'src/app/(admin)/admin/pengurus/PengurusClient.tsx',
  'src/app/(admin)/admin/jabatan/JabatanClient.tsx',
  'src/app/(admin)/admin/events/EventsClient.tsx',
  'src/app/(admin)/admin/dokumentasi/GalleriesClient.tsx',
  'src/app/(admin)/admin/bidang/BidangClient.tsx'
];

for(let f of files) {
  if(!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  
  if(!c.includes('import toast from "react-hot-toast";')) {
    c = 'import toast from "react-hot-toast";\n' + c;
  }
  if(!c.includes('import { confirmDialog } from "@/components/ConfirmDialog";')) {
    c = 'import { confirmDialog } from "@/components/ConfirmDialog";\n' + c;
  }

  // Use JS replace properly
  c = c.replace(/if \(!confirm\((.*?)\)\) return;/g, 'if (!(await confirmDialog($1))) return;');
  
  c = c.replace(/alert\((.*?)\);/g, 'toast.error($1);');
  
  fs.writeFileSync(f, c);
}
console.log('Replaced alerts and confirms with react-hot-toast');
