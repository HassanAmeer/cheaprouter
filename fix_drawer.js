const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/admin/providers');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('Setup.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Update signature
    const sigRegex = /const handleSave = async \((modelsToSave[^,]+), (keysToSave[^,]+), (shouldNotify = false), (overrideStatus: boolean \| null = null)\) => {/;
    if (sigRegex.test(content)) {
      content = content.replace(sigRegex, 'const handleSave = async ($1, $2, $3, $4, showUiFeedback = shouldNotify) => {');
      changed = true;
    }

    // 2. Replace shouldNotify with showUiFeedback for UI states
    const saveState1 = 'if (shouldNotify) setSaving(true);';
    if (content.includes(saveState1)) {
      content = content.replace(/if \(shouldNotify\) setSaving\(true\);/g, 'if (showUiFeedback) setSaving(true);');
      changed = true;
    }

    const saveState2 = 'if (shouldNotify) { setSaved(true);';
    if (content.includes(saveState2)) {
      content = content.replace(/if \(shouldNotify\) \{ setSaved\(true\);/g, 'if (showUiFeedback) { setSaved(true);');
      changed = true;
    }

    const saveState3 = 'if (shouldNotify) setSaving(false);';
    if (content.includes(saveState3)) {
      content = content.replace(/if \(shouldNotify\) setSaving\(false\);/g, 'if (showUiFeedback) setSaving(false);');
      changed = true;
    }

    // 3. Update handleDrawerClose
    const drawerRegex = /handleSave\(selectedModels, apiKeys, true\);/;
    if (drawerRegex.test(content)) {
      content = content.replace(drawerRegex, 'handleSave(selectedModels, apiKeys, true, null, false);');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
});
