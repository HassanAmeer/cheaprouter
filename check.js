const fs = require('fs');
const content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Strip out all {...} blocks and string literals to avoid matching tags inside strings/JSX expressions
let stripped = content;

// This is very naive, let's just use a regex to match all <TAG ...> and </TAG>
const tagRegex = /<\/?([a-zA-Z0-9_.-]+)(?:\s+[^>]*?)?(\/?)>/g;

let stack = [];

let match;
while ((match = tagRegex.exec(content)) !== null) {
  const isClosing = match[0].startsWith('</');
  const tagName = match[1];
  const isSelfClosing = match[2] === '/';
  
  // Ignore standard self closing HTML tags and Next.js Image etc if self closing
  if (isSelfClosing || ['br', 'img', 'input', 'hr', 'meta', 'link'].includes(tagName.toLowerCase())) {
    continue;
  }
  
  if (!isClosing) {
    stack.push({ tag: tagName, line: content.substring(0, match.index).split('\n').length });
  } else {
    const last = stack.pop();
    if (!last || last.tag !== tagName) {
      console.log(`Mismatch! Found </${tagName}> on line ${content.substring(0, match.index).split('\n').length}, but expected </${last ? last.tag : 'NONE'}> (opened on line ${last ? last.line : '?'})`);
      stack.push(last); // push back to see the rest of errors
    }
  }
}

if (stack.length > 0) {
  console.log("Unclosed tags:");
  stack.forEach(s => console.log(`<${s.tag}> opened on line ${s.line}`));
} else {
  console.log("All tags balanced!");
}
