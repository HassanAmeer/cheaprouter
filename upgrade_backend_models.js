const fs = require('fs');

let indexTs = fs.readFileSync('backend/src/index.ts', 'utf8');

const dynamicEndpoints = [
  { provider: 'groq', url: 'https://api.groq.com/openai/v1/models' },
  { provider: 'deepseek', url: 'https://api.deepseek.com/models' },
  { provider: 'fireworks', url: 'https://api.fireworks.ai/inference/v1/models' },
  { provider: 'mistral', url: 'https://api.mistral.ai/v1/models' },
  { provider: 'together', url: 'https://api.together.xyz/v1/models' },
  { provider: 'perplexity', url: 'https://api.perplexity.ai/models' },
  { provider: 'novita', url: 'https://api.novita.ai/v3/openai/models' },
  { provider: 'bytez', url: 'https://api.bytez.com/v1/models' },
  { provider: 'aimlapi', url: 'https://api.aimlapi.com/v1/models' },
  { provider: 'sambanova', url: 'https://api.sambanova.ai/v1/models' },
  { provider: 'cerebras', url: 'https://api.cerebras.ai/v1/models' },
  { provider: 'xai', url: 'https://api.x.ai/v1/models' }
];

for (const ep of dynamicEndpoints) {
  const targetStr = `app.get('/api/admin/${ep.provider}/models', async (c) => {\n  return c.json({ data: MODEL_REGISTRY['${ep.provider}'] || [] });\n});`;

  const replacement = `app.get('/api/admin/${ep.provider}/models', async (c) => {\n  const apiKey = c.req.query('key') || '';\n  if (apiKey) {\n    try {\n      const res = await fetch('${ep.url}', {\n        headers: { 'Authorization': \`Bearer \${apiKey}\` }\n      });\n      if (res.ok) {\n        const data = await res.json();\n        if (data && (Array.isArray(data.data) || Array.isArray(data))) {\n          return c.json(data);\n        }\n      }\n    } catch (e) {}\n  }\n  return c.json({ data: MODEL_REGISTRY['${ep.provider}'] || [] });\n});`;

  if (indexTs.includes(targetStr)) {
    indexTs = indexTs.replace(targetStr, replacement);
    console.log(`Updated ${ep.provider}`);
  } else {
    console.log(`Target string not found for ${ep.provider}`);
  }
}

const googleTarget = `app.get('/api/admin/google/models', async (c) => {\n  return c.json({ data: MODEL_REGISTRY['google'] || [] });\n});`;
const googleReplacement = `app.get('/api/admin/google/models', async (c) => {\n  const apiKey = c.req.query('key') || '';\n  if (apiKey) {\n    try {\n      const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models?key=\${encodeURIComponent(apiKey)}\`);\n      if (res.ok) {\n        const data = await res.json();\n        if (data && Array.isArray(data.models)) {\n          const mapped = data.models.map((m: any) => ({\n            id: m.name ? m.name.replace('models/', '') : m.id,\n            name: m.displayName || m.name || m.id\n          }));\n          return c.json({ data: mapped });\n        }\n      }\n    } catch (e) {}\n  }\n  return c.json({ data: MODEL_REGISTRY['google'] || [] });\n});`;

if (indexTs.includes(googleTarget)) {
  indexTs = indexTs.replace(googleTarget, googleReplacement);
  console.log('Updated google');
}

fs.writeFileSync('backend/src/index.ts', indexTs);
