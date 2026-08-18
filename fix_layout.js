const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync('d:/ldk-al-hidayah/src/app/(admin)/admin')
  .filter(f => f.endsWith('ClientPage.tsx'));

let count = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace main header flex container
  content = content.replace(
    /className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100"/g,
    'className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"'
  );

  // Replace button wrapper
  content = content.replace(
    /<\/div>\s*<div className="flex gap-3">/g,
    '</div>\n        <div className="flex flex-wrap gap-3 w-full md:w-auto">'
  );
  
  // Replace red button
  content = content.replace(
    /className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2\.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-medium"/g,
    'className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium flex-1 sm:flex-none"'
  );

  // Replace blue button
  content = content.replace(
    /className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2\.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"/g,
    'className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm flex-1 sm:flex-none"'
  );

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log('Fixed:', file);
  }
}
console.log(`Total files fixed: ${count}`);
