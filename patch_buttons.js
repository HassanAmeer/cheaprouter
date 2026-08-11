const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/admin/providers');
const files = fs.readdirSync(dir).filter(f => f.endsWith('Setup.tsx'));

let count = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add saved state
  if (!content.includes('const [saved, setSaved] = useState(false);')) {
    content = content.replace(
      /const \[saving, setSaving\] = useState\(false\);/,
      'const [saving, setSaving] = useState(false);\n  const [saved, setSaved] = useState(false);'
    );
  }

  // 2. Update handleSave to set saved state
  if (!content.includes('setSaved(true);')) {
    content = content.replace(
      /if \(res\.ok\) {\s*if \(shouldNotify && onModelsUpdated\) onModelsUpdated\(\);\s*}/g,
      'if (res.ok) {\n        setSaved(true);\n        setTimeout(() => setSaved(false), 2000);\n        if (shouldNotify && onModelsUpdated) onModelsUpdated();\n      }'
    );
  }

  // 3. Update the button
  // Find the button block: <button className="btn-secondary" onClick={() => handleSave(selectedModels, apiKeys, true)} disabled={saving} ... > {saving ? ... : <Save size={12} />} Save Keys </button>
  
  // We need to carefully replace the style and inner contents of that specific button.
  // Original style: style={{ flex: 1, justifyContent: 'center', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px' }}
  // We will replace it with: style={{ flex: 1, justifyContent: 'center', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px', color: saved ? '#10b981' : undefined, borderColor: saved ? '#10b981' : undefined }}
  
  content = content.replace(
    /style=\{\{ flex: 1, justifyContent: 'center', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px' \}\}/g,
    "style={{ flex: 1, justifyContent: 'center', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px', color: saved ? '#10b981' : undefined, borderColor: saved ? '#10b981' : undefined }}"
  );

  content = content.replace(
    /\{saving \? <RefreshCcw size=\{12\} className=\{styles\.spin\} \/> : <Save size=\{12\} \/>\} Save Keys/g,
    "{saving ? <RefreshCcw size={12} className={styles.spin} /> : (saved ? <Check size={12} /> : <Save size={12} />)} {saved ? 'Saved!' : 'Save Keys'}"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  count++;
}

console.log(`Updated ${count} files.`);
