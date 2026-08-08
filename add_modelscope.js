const fs = require('fs');
const path = require('path');

const prov = { name: 'ModelScope', lower: 'modelscope', url: 'https://api-inference.modelscope.cn/v1', domain: 'modelscope.cn', priority: 41 };

// 1. Generate Setup.tsx
const source = fs.readFileSync('src/app/admin/providers/ZaiSetup.tsx', 'utf8');
let pCode = source
  .replace(/Zai/g, prov.name)
  .replace(/z\.ai/g, prov.domain)
  .replace(/zai/g, prov.lower)
  .replace(/https:\/\/api\.z\.ai\/v1/g, prov.url);
fs.writeFileSync(`src/app/admin/providers/${prov.name}Setup.tsx`, pCode);

// 2. Update manage/page.tsx
let managePage = fs.readFileSync('src/app/admin/providers/manage/page.tsx', 'utf8');
managePage = managePage.replace(
  `import LLM7Setup, { LLM7SetupRef } from '../LLM7Setup';`,
  `import LLM7Setup, { LLM7SetupRef } from '../LLM7Setup';
import ModelScopeSetup, { ModelScopeSetupRef } from '../ModelScopeSetup';`
);
managePage = managePage.replace(
  `const llm7Ref = useRef<LLM7SetupRef>(null);`,
  `const llm7Ref = useRef<LLM7SetupRef>(null);
  const modelscopeRef = useRef<ModelScopeSetupRef>(null);`
);
managePage = managePage.replace(
  `<LLM7Setup ref={llm7Ref} index={34} onModelsUpdated={() => fetchProviders(true)} />`,
  `<LLM7Setup ref={llm7Ref} index={34} onModelsUpdated={() => fetchProviders(true)} />
              <ModelScopeSetup ref={modelscopeRef} index={35} onModelsUpdated={() => fetchProviders(true)} />`
);
fs.writeFileSync('src/app/admin/providers/manage/page.tsx', managePage);

// 3. Update index.ts - setup + models routes
let indexTs = fs.readFileSync('backend/src/index.ts', 'utf8');
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
    const data = await res.json();
    return c.json(data);
  } catch {
    return c.json({ data: [] });
  }
});
`;
indexTs = indexTs.replace(/app\.get\('\/api\/models'/, routes + '\napp.get(\'/api/models\'');
fs.writeFileSync('backend/src/index.ts', indexTs);

// 4. Update completions.ts
let compTs = fs.readFileSync('backend/src/completions.ts', 'utf8');
const check = `
  const ${prov.lower}Inst = checkProv('ap_${prov.lower}', (key) => createOpenAI({ baseURL: '${prov.url}', apiKey: key }));
  if (${prov.lower}Inst) return ${prov.lower}Inst;
`;
compTs = compTs.replace(
  /(const llm7Inst = checkProv\('ap_llm7'[\s\S]*?if \(llm7Inst\) return llm7Inst;\n)/,
  '$1' + check
);
fs.writeFileSync('backend/src/completions.ts', compTs);

// 5. Create Next.js proxy routes for modelscope
const base = 'src/app/api/admin';
fs.mkdirSync(`${base}/${prov.lower}`, { recursive: true });
fs.writeFileSync(`${base}/${prov.lower}/route.ts`, `import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(\`\${backendUrl}/api/admin/${prov.lower}\`, {
      headers: { 'Authorization': authHeader }
    });
    if (!response.ok) return NextResponse.json({}, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const body = await req.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(\`\${backendUrl}/api/admin/${prov.lower}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(body)
    });
    if (!response.ok) return NextResponse.json({ error: 'Failed' }, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ${prov.lower} config' }, { status: 500 });
  }
}
`);

fs.mkdirSync(`${base}/${prov.lower}/models`, { recursive: true });
fs.writeFileSync(`${base}/${prov.lower}/models/route.ts`, `import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const url = new URL(req.url);
    const key = url.searchParams.get('key') || '';
    const response = await fetch(\`\${backendUrl}/api/admin/${prov.lower}/models\${key ? '?key=' + encodeURIComponent(key) : ''}\`, {
      headers: { 'Authorization': authHeader }
    });
    if (!response.ok) return NextResponse.json({ data: [] }, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
`);

console.log('ModelScope added successfully!');
