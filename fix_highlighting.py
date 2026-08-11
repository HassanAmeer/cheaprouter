import os
import re

directories = ['src/app/docs/views', 'src/app/docs/components']
replacements = [
    (r"#fca5a5", "var(--color-primary)"),
    (r"#7dd3fc", "var(--color-success)"),
    (r"#bae6fd", "var(--color-warning)")
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
