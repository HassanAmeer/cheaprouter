const fs = require('fs');

const missingSetups = [
  { id: 'poixe', name: 'Poixe', url: 'https://api.poixe.com/v1', priority: 34 },
  { id: 'siliconflow', name: 'SiliconFlow', url: 'https://api.siliconflow.cn/v1', priority: 35 },
  { id: 'zenmux', name: 'Zenmux', url: 'https://api.zenmux.ai/v1', priority: 36 },
  { id: 'unorouter', name: 'UnoRouter', url: 'https://api.unorouter.com/v1', priority: 37 }
];

const missingModels = [
  { id: 'amazonbedrock', url: 'https://bedrock.proxy/v1' },
  { id: 'github', url: 'https://models.inference.ai.azure.com' },
  { id: 'huggingface', url: 'https://api-inference.huggingface.co/v1' },
  { id: 'hyperbolic', url: 'https://api.hyperbolic.xyz/v1' },
  { id: 'moonshot', url: 'https://api.moonshot.cn/v1' },
  { id: 'zai', url: 'https://api.z.ai/v1' },
  { id: 'nvidia', url: 'https://integrate.api.nvidia.com/v1' },
  { id: 'kilocode', url: 'https://api.kilocode.ai/v1' },
  { id: 'clinecode', url: 'https://api.clinecode.ai/v1' },
  { id: 'poixe', url: 'https://api.poixe.com/v1' },
  { id: 'siliconflow', url: 'https://api.siliconflow.cn/v1' },
  { id: 'zenmux', url: 'https://api.zenmux.ai/v1' },
  { id: 'unorouter', url: 'https://api.unorouter.com/v1' }
];

let addedRoutes = '';

// Add missing setups
for (const prov of missingSetups) {
  addedRoutes += `
// ---- ${prov.name} Setup ----
app.get('/api/admin/${prov.id}', async (c) => {
  const result = await db\`SELECT * FROM admin_providers WHERE id = 'ap_${prov.id}'\`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/${prov.id}', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db\`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_${prov.id}', '${prov.name}', \${data.status}, \${data.key}, ${prov.priority}, '${prov.url}', 'openai', true, \${db.json(data.models)}, \${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = \${data.key},
      status = \${data.status},
      models = \${db.json(data.models)}
  \`;
  return c.json({ success: true });
});
`;
}

// Add missing models endpoints
for (const prov of missingModels) {
  addedRoutes += `
app.get('/api/admin/${prov.id}/models', async (c) => {
  try {
    const apiKey = c.req.query('key') || '';
    const res = await fetch('${prov.url}/models', {
      headers: apiKey ? { 'Authorization': \`Bearer \${apiKey}\` } : {}
    });
    if (!res.ok) return c.json({ data: [] });
    const data = await res.json();
    return c.json(data);
  } catch {
    return c.json({ data: [] });
  }
});
`;
}

let indexTs = fs.readFileSync('backend/src/index.ts', 'utf8');

// Inject right before app.get('/api/models'
indexTs = indexTs.replace(/app\.get\('\/api\/models'/, addedRoutes + '\napp.get(\'/api/models\'');
fs.writeFileSync('backend/src/index.ts', indexTs);
console.log('Fixed ALL missing routes');
