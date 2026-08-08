import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { providerId, originalId, key } = body;

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

    // Fetch provider config from backend if key is not passed directly
    let apiKey = key;
    let baseUrl = '';

    if (providerId === 'ap_openrouter' || providerId === 'openrouter') {
      const res = await fetch(`${backendUrl}/api/admin/openrouter`);
      if (res.ok) {
        const data = await res.json();
        apiKey = apiKey || data.key;
        baseUrl = 'https://openrouter.ai/api/v1';
      }
    } else {
      const res = await fetch(`${backendUrl}/api/admin/providers`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.providers || []);
        const prov = list.find((p: any) => p.id === providerId);
        if (prov) {
          apiKey = apiKey || prov.key;
          baseUrl = prov.base_url || prov.baseUrl || '';
        }
      }
    }

    if (!apiKey || apiKey.includes('••••')) {
      return NextResponse.json({
        ok: false,
        status: 401,
        message: 'API Key missing or unconfigured'
      });
    }

    // Perform REAL test HTTP request to OpenRouter or OpenAI compatible endpoint
    const targetUrl = baseUrl 
      ? (baseUrl.endsWith('/') ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`)
      : 'https://openrouter.ai/api/v1/chat/completions';

    const testRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: originalId || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      })
    });

    if (testRes.ok) {
      return NextResponse.json({
        ok: true,
        status: 200,
        message: `200 OK - ${testRes.statusText || 'Active'}`
      });
    } else {
      const errText = await testRes.text().catch(() => '');
      return NextResponse.json({
        ok: false,
        status: testRes.status,
        message: `HTTP ${testRes.status} ${testRes.statusText}`
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      status: 500,
      message: error?.message || 'Connection Error'
    }, { status: 500 });
  }
}
