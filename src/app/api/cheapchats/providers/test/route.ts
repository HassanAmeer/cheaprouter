import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { providerId, baseUrl, apiKey, apiFormat, model } = await req.json();

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({ ok: false, error: 'API key is required for testing' }, { status: 400 });
    }

    const key = apiKey.trim();
    const format = (apiFormat || 'openai').toLowerCase();
    const cleanBase = (baseUrl || '').replace(/\/+$/, '');

    let testUrl = `${cleanBase}/models`;
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${key}`,
      'Accept': 'application/json',
    };

    if (format === 'anthropic' || providerId?.includes('anthropic')) {
      testUrl = cleanBase ? `${cleanBase}/v1/models` : 'https://api.anthropic.com/v1/models';
      headers = {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Accept': 'application/json',
      };
    } else if (format === 'google' || providerId?.includes('google')) {
      testUrl = cleanBase ? `${cleanBase}/models?key=${key}` : `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
      delete headers['Authorization'];
    } else if (!cleanBase) {
      if (providerId?.includes('openrouter')) {
        testUrl = 'https://openrouter.ai/api/v1/models';
      } else if (providerId?.includes('deepseek')) {
        testUrl = 'https://api.deepseek.com/models';
      } else if (providerId?.includes('groq')) {
        testUrl = 'https://api.groq.com/openai/v1/models';
      } else {
        testUrl = 'https://api.openai.com/v1/models';
      }
    }

    const start = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(testUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const latency = Date.now() - start;

    if (res.ok) {
      return NextResponse.json({ ok: true, latencyMs: latency, message: `Connected successfully (${latency}ms)` });
    } else {
      const errText = await res.text().catch(() => '');
      let errMsg = `Upstream error (${res.status})`;
      try {
        const j = JSON.parse(errText);
        errMsg = j.error?.message || j.message || errMsg;
      } catch {}
      return NextResponse.json({ ok: false, status: res.status, error: errMsg }, { status: 200 });
    }
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError';
    return NextResponse.json({
      ok: false,
      error: isAbort ? 'Connection timed out (6s)' : (err.message || 'Connection test failed'),
    }, { status: 200 });
  }
}
