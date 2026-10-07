// ---------------------------------------------------------------------------
// Native fetch passthrough — for OpenAI-compatible providers.
//
// Zero re-encoding overhead: the upstream response body (SSE stream or JSON)
// is piped byte-for-byte to the client. Only the Authorization header is
// swapped. This is the fastest possible gateway implementation.
// ---------------------------------------------------------------------------

import { ResolvedModel } from './providers.ts';

const OPENAI_COMPAT_FORMATS = new Set([null, 'openai', 'openai-compat', '']);

/** True if the provider speaks the OpenAI wire format */
export function isOpenAICompat(r: ResolvedModel): boolean {
  return OPENAI_COMPAT_FORMATS.has(r.provider.api_format ?? null);
}

/** True if the provider speaks the native Anthropic wire format */
export function isAnthropicNative(r: ResolvedModel): boolean {
  return r.provider.api_format === 'anthropic';
}

/**
 * Forward a request to an OpenAI-compatible upstream provider, streaming the
 * response body straight back to the caller without buffering.
 *
 * @param path       Upstream path suffix, e.g. '/chat/completions'
 * @param r          Resolved model+provider+key
 * @param body       Already-parsed request body (we re-serialize once to
 *                   swap the model id to the real upstream id)
 * @param reqHeaders Original request headers (forwarded selectively)
 */
export async function nativeProxy(
  path: string,
  r: ResolvedModel,
  body: Record<string, any>,
  reqHeaders: Headers,
): Promise<Response> {
  const baseUrl = (r.provider.base_url ?? 'https://api.openai.com/v1').replace(/\/$/, '');
  const url     = `${baseUrl}${path}`;

  // Build forwarded headers
  const fwd: Record<string, string> = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${r.apiKey}`,
  };

  // Forward extra provider-level headers (e.g. custom org headers)
  const provHeaders = r.provider.headers;
  if (provHeaders && typeof provHeaders === 'object' && !Array.isArray(provHeaders)) {
    for (const [k, v] of Object.entries(provHeaders)) {
      if (typeof v === 'string') fwd[k] = v;
    }
  }

  // Forward safe client headers
  for (const h of ['x-session-id', 'user-agent', 'anthropic-version']) {
    const v = reqHeaders.get(h);
    if (v) fwd[h] = v;
  }

  // Swap the model id to the real upstream id
  const upstreamBody = { ...body, model: r.modelId };

  const upstream = await fetch(url, {
    method:  'POST',
    headers: fwd,
    body:    JSON.stringify(upstreamBody),
  });

  // Determine content-type for the response
  const ct = upstream.headers.get('content-type') ?? 'application/json';

  return new Response(upstream.body, {
    status:  upstream.status,
    headers: {
      'Content-Type':      ct,
      'Cache-Control':     'no-cache, no-transform',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
      // Expose which provider served the request (useful for debugging)
      'X-Provider':        r.provider.name || r.provider.id,
    },
  });
}

/**
 * Forward a request to a native Anthropic upstream provider.
 * Same byte-passthrough strategy as nativeProxy.
 */
export async function anthropicProxy(
  path: string,
  r: ResolvedModel,
  body: Record<string, any>,
  reqHeaders: Headers,
): Promise<Response> {
  const baseUrl = (r.provider.base_url ?? 'https://api.anthropic.com').replace(/\/$/, '');
  const url     = `${baseUrl}${path}`;

  const fwd: Record<string, string> = {
    'Content-Type':    'application/json',
    'x-api-key':       r.apiKey,
    'anthropic-version': reqHeaders.get('anthropic-version') ?? '2023-06-01',
  };

  const provHeaders = r.provider.headers;
  if (provHeaders && typeof provHeaders === 'object' && !Array.isArray(provHeaders)) {
    for (const [k, v] of Object.entries(provHeaders)) {
      if (typeof v === 'string') fwd[k] = v;
    }
  }

  const upstreamBody = { ...body, model: r.modelId };

  const upstream = await fetch(url, {
    method:  'POST',
    headers: fwd,
    body:    JSON.stringify(upstreamBody),
  });

  const ct = upstream.headers.get('content-type') ?? 'application/json';
  return new Response(upstream.body, {
    status:  upstream.status,
    headers: {
      'Content-Type':      ct,
      'Cache-Control':     'no-cache, no-transform',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
      'X-Provider':        r.provider.name || r.provider.id,
    },
  });
}
