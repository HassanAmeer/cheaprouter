const fs = require('fs');
const path = require('path');

const prov = { name: 'ModelScope', lower: 'modelscope', url: 'https://api-inference.modelscope.cn/v1', domain: 'modelscope.cn', priority: 41 };

// 1. Generate Setup.tsx
const source = fs.readFileSync('src/app/admin/providers/LLM7Setup.tsx', 'utf8');
let pCode = source
  .replace(/LLM7/g, prov.name)
  .replace(/llm7\.io/g, prov.domain)
  .replace(/llm7/g, prov.lower)
  .replace(/https:\/\/api\.llm7\.io\/v1/g, prov.url);
fs.writeFileSync(`src/app/admin/providers/${prov.name}Setup.tsx`, pCode);

// 2. Update manage/page.tsx
let managePage = fs.readFileSync('src/app/admin/providers/manage/page.tsx', 'utf8');
if (!managePage.includes(`import ${prov.name}Setup`)) {
  managePage = managePage.replace(
    `import LLM7Setup, { LLM7SetupRef } from '../LLM7Setup';`,
    `import LLM7Setup, { LLM7SetupRef } from '../LLM7Setup';\nimport ${prov.name}Setup, { ${prov.name}SetupRef } from '../${prov.name}Setup';`
  );
  managePage = managePage.replace(
    `const llm7Ref = useRef<LLM7SetupRef>(null);`,
    `const llm7Ref = useRef<LLM7SetupRef>(null);\n  const ${prov.lower}Ref = useRef<${prov.name}SetupRef>(null);`
  );
  managePage = managePage.replace(
    `<LLM7Setup ref={llm7Ref} index={34} onModelsUpdated={() => fetchProviders(true)} />`,
    `<LLM7Setup ref={llm7Ref} index={34} onModelsUpdated={() => fetchProviders(true)} />\n              <${prov.name}Setup ref={${prov.lower}Ref} index={35} onModelsUpdated={() => fetchProviders(true)} />`
  );
  fs.writeFileSync('src/app/admin/providers/manage/page.tsx', managePage);
}

// 3. Update index.ts - setup + models routes
let indexTs = fs.readFileSync('backend/src/index.ts', 'utf8');
if (!indexTs.includes(`'/api/admin/${prov.lower}'`)) {
  const routes = `
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
    const data = await res.json() as any;
    return c.json(data);
  } catch {
    return c.json({ data: [] });
  }
});
`;
  indexTs = indexTs.replace(/app\.get\('\/api\/models'/, routes + '\napp.get(\'/api/models\'');
  fs.writeFileSync('backend/src/index.ts', indexTs);
}

// 4. Update completions.ts
let compTs = fs.readFileSync('backend/src/completions.ts', 'utf8');
if (!compTs.includes(`const ${prov.lower}Inst`)) {
  const check = `
  const ${prov.lower}Inst = checkProv('ap_${prov.lower}', (key) => createOpenAI({ baseURL: '${prov.url}', apiKey: key }));
  if (${prov.lower}Inst) return ${prov.lower}Inst;
`;
  compTs = compTs.replace(
    /(const llm7Inst = checkProv\('ap_llm7'[\s\S]*?if \(llm7Inst\) return llm7Inst;\n)/,
    '$1' + check
  );
  fs.writeFileSync('backend/src/completions.ts', compTs);
}

// 5. Generate Next.js Proxy Route
const routeDir = 'src/app/api/admin/' + prov.lower;
if (!fs.existsSync(routeDir)) {
  fs.mkdirSync(routeDir, { recursive: true });
}
if (!fs.existsSync(routeDir + '/models')) {
  fs.mkdirSync(routeDir + '/models', { recursive: true });
}

const proxyRouteCode = `import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const response = await fetch('http://localhost:4000/api/admin/${prov.lower}/models?key=' + key);
    
    if (!response.ok) {
      throw new Error('Backend responded with ' + response.status);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend', details: error.message },
      { status: 500 }
    );
  }
}
`;

fs.writeFileSync(routeDir + '/models/route.ts', proxyRouteCode);

console.log(prov.name + ' added successfully!');
