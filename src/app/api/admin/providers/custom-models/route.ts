import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { baseUrl, modelsApiLink, key, headers: customHeaders, apiFormat } = body;

    let targetUrl = '';
    if (modelsApiLink && typeof modelsApiLink === 'string' && modelsApiLink.trim()) {
      targetUrl = modelsApiLink.trim();
    } else if (baseUrl && typeof baseUrl === 'string' && baseUrl.trim()) {
      const cleanBase = baseUrl.trim().replace(/\/+$/, '');
      if (cleanBase.endsWith('/models')) {
        targetUrl = cleanBase;
      } else {
        targetUrl = `${cleanBase}/models`;
      }
    }

    if (!targetUrl) {
      return NextResponse.json({ error: 'Base URL or Models API Link is required' }, { status: 400 });
    }

    // Extract active key
    let actualKey = key || '';
    if (typeof key === 'string' && (key.startsWith('[') || key.startsWith('{'))) {
      try {
        const parsed = JSON.parse(key);
        if (Array.isArray(parsed)) {
          actualKey = parsed.find((k: any) => k.active !== false && k.key?.trim())?.key || parsed[0]?.key || '';
        }
      } catch {
        actualKey = key;
      }
    }

    // Build headers
    const reqHeaders: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'CheapRouter/1.0'
    };

    if (actualKey && actualKey.trim()) {
      if (apiFormat === 'Anthropic Messages') {
        reqHeaders['x-api-key'] = actualKey.trim();
        reqHeaders['anthropic-version'] = '2023-06-01';
      } else {
        reqHeaders['Authorization'] = `Bearer ${actualKey.trim()}`;
      }
    }

    // Add custom headers if any
    if (Array.isArray(customHeaders)) {
      for (const h of customHeaders) {
        if (h && h.key && h.value) {
          reqHeaders[h.key.trim()] = h.value.trim();
        }
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let res: Response;
    try {
      res = await fetch(targetUrl, {
        method: 'GET',
        headers: reqHeaders,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errMsg = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.error?.message || errJson.message || errMsg;
      } catch {}
      return NextResponse.json({ error: errMsg, status: res.status }, { status: res.status });
    }

    const data = await res.json();
    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (Array.isArray(data.data)) {
      rawList = data.data;
    } else if (Array.isArray(data.models)) {
      rawList = data.models;
    } else if (data && typeof data === 'object') {
      // In case key is something like data.result or data.items
      const possibleArr = Object.values(data).find(v => Array.isArray(v));
      if (possibleArr && Array.isArray(possibleArr)) {
        rawList = possibleArr;
      }
    }

    // Normalize each model into standard shape
    const normalized = rawList.map((m: any) => {
      if (typeof m === 'string') {
        return {
          id: m,
          name: m,
          context_length: null,
          architecture: { modality: 'text->text' }
        };
      }
      const modelId = m.id || m.name || m.model || '';
      return {
        id: modelId,
        name: m.name || m.display_name || modelId,
        context_length: m.context_length || m.max_tokens || m.context_window || null,
        architecture: m.architecture || {
          modality: m.modality || (m.image || m.vision ? 'image' : 'text->text')
        },
        raw: m
      };
    });

    return NextResponse.json({
      ok: true,
      data: normalized,
      count: normalized.length
    });
  } catch (error: any) {
    console.error('Error fetching custom models:', error);
    const msg = error.name === 'AbortError' ? 'Request timed out after 15s' : (error.message || 'Failed to fetch models');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
