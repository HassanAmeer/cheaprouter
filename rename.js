const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.match(/\.(tsx|ts|css|js)$/)) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('CheapAgents') || content.includes('cheapagents')) {
    content = content.replace(/CheapAgents/g, 'CheapRouter');
    content = content.replace(/cheapagents/g, 'cheaprouter');
    fs.writeFileSync(file, content);
    console.log('Updated: ' + file);
  }
});
