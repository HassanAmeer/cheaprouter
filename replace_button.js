const fs = require('fs');
const path = require('path');

const dir = 'src/app/admin/providers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Setup.tsx'));

const newButton = `          <div 
            onClick={() => {
              const newStatus = !status;
              setStatus(newStatus);
              handleSave(selectedModels, apiKeys, false, newStatus);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              background: status ? '#10b98115' : 'var(--color-bg-soft)',
              padding: '4px 10px',
              borderRadius: '20px',
              border: \`1px solid \${status ? '#10b98144' : 'var(--color-border)'}\`
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: status ? '#10b981' : 'var(--color-text-muted)' }}>
              {status ? 'ON' : 'OFF'}
            </span>
            <div style={{
              width: '28px',
              height: '16px',
              background: status ? '#10b981' : 'var(--color-text-muted)',
              borderRadius: '16px',
              position: 'relative',
              transition: 'background 0.3s'
            }}>
              <div style={{
                position: 'absolute',
                top: '2px',
                left: status ? '14px' : '2px',
                width: '12px',
                height: '12px',
                background: 'white',
                borderRadius: '50%',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>`;

for (const file of files) {
  const filePath = path.join(dir, file);
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Find the button block
  const buttonRegex = /<button\s*onClick=\{\(\) => \{\s*const newStatus = !status;\s*setStatus\(newStatus\);\s*handleSave\(selectedModels, apiKeys, false, newStatus\);\s*\}\}\s*style=\{\{[\s\S]*?\}\}\s*>\s*\{status \? <Check size=\{14\} \/> : <Pause size=\{14\} \/>\}\s*\{status \? 'Enabled' : 'Disabled'\}\s*<\/button>/;
  
  if (buttonRegex.test(code)) {
    code = code.replace(buttonRegex, newButton);
    fs.writeFileSync(filePath, code);
  } else {
    console.log('Button not found in', file);
  }
}
console.log('Toggle buttons updated');
