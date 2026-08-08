const fs = require('fs');

const newProviders = [
  { name: 'Routeway', lower: 'routeway', url: 'https://api.routeway.ai/v1', domain: 'routeway.ai', priority: 38 },
  { name: 'StepFun', lower: 'stepfun', url: 'https://api.stepfun.com/v1', domain: 'platform.stepfun.ai', priority: 39 }
];

// 1. Generate Setup.tsx files
const source = fs.readFileSync('src/app/admin/providers/ZaiSetup.tsx', 'utf8');
for (const prov of newProviders) {
  let pCode = source
    .replace(/Zai/g, prov.name)
    .replace(/z\.ai/g, prov.domain)
    .replace(/zai/g, prov.lower)
    .replace(/https:\/\/api\.z\.ai\/v1/g, prov.url);
  fs.writeFileSync(`src/app/admin/providers/${prov.name}Setup.tsx`, pCode);
}

// 2. Update manage/page.tsx
let managePage = fs.readFileSync('src/app/admin/providers/manage/page.tsx', 'utf8');
managePage = managePage.replace(
  `import UnoRouterSetup, { UnoRouterSetupRef } from '../UnoRouterSetup';`,
  `import UnoRouterSetup, { UnoRouterSetupRef } from '../UnoRouterSetup';
import RoutewaySetup, { RoutewaySetupRef } from '../RoutewaySetup';
import StepFunSetup, { StepFunSetupRef } from '../StepFunSetup';`
);
managePage = managePage.replace(
  `const unorouterRef = useRef<UnoRouterSetupRef>(null);`,
  `const unorouterRef = useRef<UnoRouterSetupRef>(null);
  const routewayRef = useRef<RoutewaySetupRef>(null);
  const stepfunRef = useRef<StepFunSetupRef>(null);`
);
managePage = managePage.replace(
  `<UnoRouterSetup ref={unorouterRef} index={31} onModelsUpdated={() => fetchProviders(true)} />`,
  `<UnoRouterSetup ref={unorouterRef} index={31} onModelsUpdated={() => fetchProviders(true)} />
              <RoutewaySetup ref={routewayRef} index={32} onModelsUpdated={() => fetchProviders(true)} />
              <StepFunSetup ref={stepfunRef} index={33} onModelsUpdated={() => fetchProviders(true)} />`
);
fs.writeFileSync('src/app/admin/providers/manage/page.tsx', managePage);

// 3. Update index.ts - setup routes + models routes
let indexTs = fs.readFileSync('backend/src/index.ts', 'utf8');
let routes = '';
for (const prov of newProviders) {
  routes += `
// ---- ${prov.name} Setup ----
app.get('/api/admin/${prov.lower}', async (c) => {
  const result = await db\`SELECT * FROM admin_providers WHERE id = 'ap_${prov.lower}'\`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/${prov.lower}', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db\`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_${prov.lower}', '${prov.name}', \${data.status}, \${data.key}, ${prov.priority}, '${prov.url}', 'openai', true, \${db.json(data.models)}, \${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = \${data.key},
      status = \${data.status},
      models = \${db.json(data.models)}
  \`;
  return c.json({ success: true });
});

app.get('/api/admin/${prov.lower}/models', async (c) => {
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
indexTs = indexTs.replace(/app\.get\('\/api\/models'/, routes + '\napp.get(\'/api/models\'');
fs.writeFileSync('backend/src/index.ts', indexTs);

// 4. Update completions.ts
let compTs = fs.readFileSync('backend/src/completions.ts', 'utf8');
let checks = '';
for (const prov of newProviders) {
  checks += `
  const ${prov.lower}Inst = checkProv('ap_${prov.lower}', (key) => createOpenAI({ baseURL: '${prov.url}', apiKey: key }));
  if (${prov.lower}Inst) return ${prov.lower}Inst;
`;
}
// Append near the end before the return null or last provider
const lastProv = `const unorouterInst = checkProv('ap_unorouter'`;
compTs = compTs.replace(
  /(const unorouterInst = checkProv\('ap_unorouter'[\s\S]*?if \(unorouterInst\) return unorouterInst;\n)/,
  '$1' + checks
);
fs.writeFileSync('backend/src/completions.ts', compTs);

console.log('Routeway and StepFun added successfully!');
