const fs = require('fs');
const path = require('path');

const dir = 'src/app/admin/providers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Setup.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let code = fs.readFileSync(filePath, 'utf8');

  // Match the button block precisely
  const regex = /<button onClick=\{\(\) => handleSave\(selectedModels, apiKeys, true\)\} disabled=\{saving\} style=\{\{ flex: 1, justifyContent: 'center', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px', background: 'transparent', border: '1px solid color-mix\(in srgb, var\(--color-primary\) 30%, transparent\)', color: 'color-mix\(in srgb, var\(--color-primary\) 30%, transparent\)', borderRadius: '6px', cursor: 'pointer' \}\} title="Save All Keys">/g;

  if (code.match(regex)) {
    const replacement = `<button className="btn-secondary" onClick={() => handleSave(selectedModels, apiKeys, true)} disabled={saving} style={{ flex: 1, justifyContent: 'center', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px' }} title="Save All Keys">`;

    code = code.replace(regex, replacement);
    fs.writeFileSync(filePath, code);
    console.log('Updated to grey button in ' + file);
  } else {
    console.log('Could not find buttons to replace in ' + file);
  }
}
