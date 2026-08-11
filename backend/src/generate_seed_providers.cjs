const fs = require('fs');

const indexCode = fs.readFileSync('index.ts', 'utf-8');

const regex = /VALUES \('([^']+)', '([^']+)',[^,]+,[^,]+,\s*(\d+),\s*'([^']+)',\s*'([^']+)'/g;

let match;
let providers = [];

while ((match = regex.exec(indexCode)) !== null) {
  providers.push({
    id: match[1],
    name: match[2],
    status: false,
    key: '',
    priority: parseInt(match[3]),
    base_url: match[4],
    api_format: match[5],
    models: []
  });
}

// Special case for existing ones to keep their demo keys and models
const existing = {
  ap_openai: { status: true, key: 'sk-••••••••••••••••••••••••••••demo', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'], priority: 1 },
  ap_anthropic: { status: true, key: 'sk-ant-••••••••••••••••demo', models: ['claude-3-5-sonnet', 'claude-3-haiku'], priority: 2 },
  ap_google: { status: true, key: 'AIza••••••••••••••••demo', models: ['gemini-1.5-pro', 'gemini-1.5-flash'], priority: 3 },
  ap_meta: { status: false, key: 'meta-••••••••demo', models: ['llama-3-70b', 'llama-3-8b'], priority: 4 },
  ap_deepseek: { status: true, key: 'sk-••••deepseek-demo', models: ['deepseek-coder-v2', 'deepseek-chat'], priority: 5 }
};

let output = '    const adminProviders = [\n';

providers.forEach(p => {
  if (existing[p.id]) {
    p.status = existing[p.id].status;
    p.key = existing[p.id].key;
    p.models = existing[p.id].models;
    p.priority = existing[p.id].priority;
  } else {
    p.key = `${p.id}-••••••••demo`;
  }
  
  output += `      { id: '${p.id}', name: '${p.name}', status: ${p.status}, key: '${p.key}', priority: ${p.priority}, base_url: '${p.base_url}', api_format: '${p.api_format}', models: ${JSON.stringify(p.models)} },\n`;
});

// Also add Meta if not in the index.ts list (it might not be)
if (!providers.some(p => p.id === 'ap_meta')) {
  let m = existing['ap_meta'];
  output += `      { id: 'ap_meta', name: 'Meta', status: ${m.status}, key: '${m.key}', priority: ${m.priority}, base_url: 'https://api.meta.ai/v1', api_format: 'openai', models: ${JSON.stringify(m.models)} },\n`;
}

output += '    ];';
console.log(output);

