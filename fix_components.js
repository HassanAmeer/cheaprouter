const fs = require('fs');
const path = require('path');

const dir = 'src/app/admin/providers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Setup.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Fix 1: img tags missing quotes
  code = code.replace(/<img src=([^ ]+) alt=([^ ]+) style=/g, '<img src="$1" alt="$2" style=');
  
  // Fix 2: #${index} literal to #{index}
  code = code.replace(/#\$\{index\}/g, '#{index}');
  
  fs.writeFileSync(filePath, code);
}
console.log('Fixed syntax in components');
