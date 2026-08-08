const fs = require('fs');
const path = require('path');

const providers = [
  'openai', 'anthropic', 'google', 'groq', 'cohere', 'mistral', 'together', 
  'deepseek', 'fireworks', 'perplexity', 'xai', 'novita', 'bytez', 'aimlapi',
  'sambanova', 'cerebras', 'amazonbedrock', 'github', 'huggingface', 'hyperbolic',
  'moonshot', 'zai', 'nvidia', 'kilocode', 'clinecode', 'poixe', 'siliconflow',
  'zenmux', 'unorouter', 'routeway', 'stepfun', 'llm7'
];

const base = 'src/app/api/admin';

for (const prov of providers) {
  const dir = path.join(base, prov);
  fs.mkdirSync(dir, { recursive: true });
  
  const code = `import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const url = new URL(req.url);
    const keyParam = url.searchParams.get('key') || '';
    const response = await fetch(\`\${backendUrl}/api/admin/${prov}\${keyParam ? '?key=' + encodeURIComponent(keyParam) : ''}\`, {
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
    const response = await fetch(\`\${backendUrl}/api/admin/${prov}\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) return NextResponse.json({ error: 'Failed' }, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ${prov} config' }, { status: 500 });
  }
}
`;

  fs.writeFileSync(path.join(dir, 'route.ts'), code);
  
  // Also create /models sub-route
  const modelsDir = path.join(base, prov, 'models');
  fs.mkdirSync(modelsDir, { recursive: true });
  
  const modelsCode = `import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const url = new URL(req.url);
    const key = url.searchParams.get('key') || '';
    const response = await fetch(\`\${backendUrl}/api/admin/${prov}/models\${key ? '?key=' + encodeURIComponent(key) : ''}\`, {
      headers: { 'Authorization': authHeader }
    });
    if (!response.ok) return NextResponse.json({ data: [] }, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
`;
  
  fs.writeFileSync(path.join(modelsDir, 'route.ts'), modelsCode);
  console.log('Created routes for: ' + prov);
}
