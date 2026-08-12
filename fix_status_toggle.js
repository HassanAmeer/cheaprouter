const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/admin/providers');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('Setup.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace handleSave(selectedModels, apiKeys, true, newStatus);
    const regex = /handleSave\(selectedModels, apiKeys, true, newStatus\);/g;
    if (regex.test(content)) {
      content = content.replace(regex, 'handleSave(selectedModels, apiKeys, true, newStatus, false);');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
});
