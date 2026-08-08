const fs = require('fs');
const path = require('path');

const dir = 'src/app/admin/providers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Setup.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let code = fs.readFileSync(filePath, 'utf8');
  
  code = code.replace(
    /handleSave\(selectedModels, apiKeys, false, newStatus\);/g,
    'handleSave(selectedModels, apiKeys, true, newStatus);'
  );
  
  fs.writeFileSync(filePath, code);
}
console.log('Update notification set to true');
