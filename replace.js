const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/admin/providers');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('Setup.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it already has ...m,
    if (!content.includes('...m, originalId: m.originalId')) {
      content = content.replace(
        /originalId: m\.originalId \|\| m\.id \|\| '',/g,
        '...m, originalId: m.originalId || m.id || \'\','
      );
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
});
