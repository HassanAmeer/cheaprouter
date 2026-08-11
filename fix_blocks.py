import os
import re

directories = ['src/app/docs/views', 'src/app/docs/components']
replacements = [
    (r"backgroundColor:\s*['\"]#0a0a0a['\"]", "backgroundColor: 'var(--color-bg-card)'"),
    (r"backgroundColor:\s*['\"]#09090b['\"]", "backgroundColor: 'var(--color-bg-card)'"),
    (r"background:\s*['\"]#0a0a0a['\"]", "background: 'var(--color-bg-card)'"),
    (r"rgba\(255,\s*255,\s*255,\s*0\.1\)", "var(--color-border)"),
    (r"color:\s*['\"]#cbd5e1['\"]", "color: 'var(--color-text-main)'"),
    (r"color:\s*['\"]#fca5a5['\"]", "color: 'var(--color-primary)'"),
    (r"color:\s*['\"]#7dd3fc['\"]", "color: 'var(--color-success)'"),
    (r"color:\s*['\"]#bae6fd['\"]", "color: 'var(--color-warning)'")
]

for d in directories:
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx'):
                path = os.path.join(root, f)
                with open(path, 'r') as fp:
                    content = fp.read()
                
                for pattern, repl in replacements:
                    content = re.sub(pattern, repl, content)
                
                with open(path, 'w') as fp:
                    fp.write(content)
