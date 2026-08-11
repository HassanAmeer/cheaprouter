import os
import re

path = 'src/app/docs/components/CodeBlock.tsx'
with open(path, 'r') as fp:
    content = fp.read()

replacements = [
    (r"backgroundColor: '#0a0a0a'", "backgroundColor: 'var(--color-bg-card)'"),
    (r"backgroundColor: 'rgba\(255, 255, 255, 0.03\)'", "backgroundColor: 'var(--color-bg-muted)'"),
    (r"border: '1px solid rgba\(255,255,255,0.05\)'", "border: '1px solid var(--color-border)'"),
    (r"borderBottom: '1px solid rgba\(255, 255, 255, 0.1\)'", "borderBottom: '1px solid var(--color-border)'"),
    (r"color: '#94a3b8'", "color: 'var(--color-text-muted)'"),
    (r"color: '#64748b'", "color: 'var(--color-text-muted)'"),
    (r"color: '#f8fafc'", "color: 'var(--color-text-main)'"),
    (r"backgroundColor: isActive \? 'rgba\(255,255,255,0.1\)' : 'transparent'", "backgroundColor: isActive ? 'var(--color-bg-base)' : 'transparent'"),
    (r"border: '1px solid rgba\(255, 255, 255, 0.1\)'", "border: '1px solid var(--color-border)'"),
    (r"color: '#cbd5e1'", "color: 'var(--color-text-main)'"),
    (r"e\.currentTarget\.style\.color = '#f8fafc'", "e.currentTarget.style.color = 'var(--color-text-main)'"),
    (r"e\.currentTarget\.style\.borderColor = 'rgba\(255, 255, 255, 0.2\)'", "e.currentTarget.style.borderColor = 'var(--color-text-muted)'"),
    (r"e\.currentTarget\.style\.color = '#94a3b8'", "e.currentTarget.style.color = 'var(--color-text-muted)'"),
    (r"e\.currentTarget\.style\.borderColor = 'rgba\(255, 255, 255, 0.1\)'", "e.currentTarget.style.borderColor = 'var(--color-border)'"),
    (r"<span style=\"color:#fca5a5\">", "<span style=\"color:var(--color-primary)\">"),
    (r"<span style=\"color:#7dd3fc\">", "<span style=\"color:var(--color-success)\">"),
    (r"<span style=\"color:#bae6fd\">", "<span style=\"color:var(--color-warning)\">"),
]

for pattern, repl in replacements:
    content = re.sub(pattern, repl, content)

with open(path, 'w') as fp:
    fp.write(content)
