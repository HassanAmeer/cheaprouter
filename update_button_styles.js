const fs = require('fs');
const path = require('path');

const dir = 'src/app/admin/providers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Setup.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let code = fs.readFileSync(filePath, 'utf8');

  // Match the button block precisely
  const regex = /<button className="btn-secondary" onClick=\{\(\) => setApiKeys\(\[\.\.\.apiKeys, \{key: '', active: true\}\]\)\} style=\{\{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' \}\}>\s*<Plus size=\{14\} \/> Add Another API Key\s*<\/button>\s*<button className="btn-primary" onClick=\{\(\) => handleSave\(selectedModels, apiKeys, true\)\} disabled=\{saving\} style=\{\{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' \}\} title="Save All Keys">\s*\{saving \? <RefreshCcw size=\{14\} className=\{styles\.spin\} \/> : <Save size=\{14\} \/>\} Save Keys\s*<\/button>/g;

  if (code.match(regex)) {
    const replacement = `<button className="btn-secondary" onClick={() => setApiKeys([...apiKeys, {key: '', active: true}])} style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px' }}>
              <Plus size={12} /> Add Another API Key
            </button>
            <button onClick={() => handleSave(selectedModels, apiKeys, true)} disabled={saving} style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px', background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '6px', cursor: 'pointer' }} title="Save All Keys">
              {saving ? <RefreshCcw size={12} className={styles.spin} /> : <Save size={12} />} Save Keys
            </button>`;

    code = code.replace(regex, replacement);
    fs.writeFileSync(filePath, code);
    console.log('Updated buttons in ' + file);
  } else {
    console.log('Could not find buttons to replace in ' + file);
  }
}
