import os
import re

VIEWS_DIR = 'src/app/docs/views'

replacements = [
    (r"color:\s*['\"]#f8fafc['\"]", "color: 'var(--color-text-main)'"),
    (r"color:\s*['\"]#94a3b8['\"]", "color: 'var(--color-text-muted)'"),
    (r"color:\s*['\"]#64748b['\"]", "color: 'var(--color-text-muted)'"),
    (r"color:\s*['\"]#475569['\"]", "color: 'var(--color-text-muted)'"),
    (r"backgroundColor:\s*['\"]rgba\(255,\s*255,\s*255,\s*0.02\)['\"]", "backgroundColor: 'var(--color-bg-card)'"),
    (r"backgroundColor:\s*['\"]rgba\(255,\s*255,\s*255,\s*0.03\)['\"]", "backgroundColor: 'var(--color-bg-card)'"),
    (r"border:\s*['\"]1px solid rgba\(255,\s*255,\s*255,\s*0.05\)['\"]", "border: '1px solid var(--color-border)'"),
    (r"borderBottom:\s*['\"]1px solid rgba\(255,\s*255,\s*255,\s*0.05\)['\"]", "borderBottom: '1px solid var(--color-border)'"),
    (r"border:\s*['\"]1px solid rgba\(255,\s*255,\s*255,\s*0.1\)['\"]", "border: '1px solid var(--color-border)'"),
    (r"borderBottom:\s*['\"]1px solid rgba\(255,\s*255,\s*255,\s*0.1\)['\"]", "borderBottom: '1px solid var(--color-border)'"),
]

for root, _, files in os.walk(VIEWS_DIR):
    for f in files:
        if f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r') as fp:
                content = fp.read()
            for pattern, repl in replacements:
                content = re.sub(pattern, repl, content)
            with open(path, 'w') as fp:
                fp.write(content)
