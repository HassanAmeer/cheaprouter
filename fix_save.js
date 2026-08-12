const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/admin/providers');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('Setup.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace setSaving(true); with if (shouldNotify) setSaving(true);
    // Replace setSaved(true); with if (shouldNotify) { setSaved(true);
    // Replace setTimeout(() => setSaved(false), 2000); with setTimeout(() => setSaved(false), 2000); }
    // Replace setSaving(false); with if (shouldNotify) setSaving(false);

    let changed = false;

    if (content.includes('setSaving(true);') && !content.includes('if (shouldNotify) setSaving(true);')) {
      content = content.replace(/    setSaving\(true\);/g, '    if (shouldNotify) setSaving(true);');
      changed = true;
    }

    if (content.includes('setSaved(true);') && !content.includes('if (shouldNotify) { setSaved(true);')) {
      content = content.replace(/        setSaved\(true\);/g, '        if (shouldNotify) { setSaved(true);');
      // The line after setSaved(true); is setTimeout(() => setSaved(false), 2000);
      content = content.replace(/        setTimeout\(\(\) => setSaved\(false\), 2000\);/g, '        setTimeout(() => setSaved(false), 2000); }');
      changed = true;
    }

    if (content.includes('setSaving(false);') && !content.includes('if (shouldNotify) setSaving(false);')) {
      content = content.replace(/      setSaving\(false\);/g, '      if (shouldNotify) setSaving(false);');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed ${file}`);
    }
  }
});
