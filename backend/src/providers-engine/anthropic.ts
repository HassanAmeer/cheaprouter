// ---------------------------------------------------------------------------
// POST /v1/messages
// Native Anthropic Messages API gateway endpoint (e.g. for Claude Code, Anthropic SDK).
// ---------------------------------------------------------------------------

import { Context } from 'hono';
import { extractToken, validateBearer } from './auth.ts';
import { resolveModel, getDefaultModel } from './providers.ts';
import { isAnthropicNative, anthropicProxy } from './proxy.ts';

export async function handleAnthropicMessages(c: Context): Promise<Response> {
  // 1. Auth check
  let token = extractToken(c.req.raw.headers);
  const isDashboardTest = c.req.header('x-from-dashboard') === 'true';

  if (!token && isDashboardTest) {
    token = process.env.MASTER_KEY || 'sk-engine-dev-key';
  }

  if (!token) {
    return Response.json(
      { type: 'error', error: { type: 'authentication_error', message: 'Missing API key. Provide via x-api-key or Authorization: Bearer' } },
      { status: 401 }
    );
  }

  const userId = await validateBearer(token);
  if (!userId) {
    return Response.json(
      { type: 'error', error: { type: 'authentication_error', message: 'Invalid or inactive API key' } },
      { status: 401 }
    );
  }

  // 2. Body parsing
  let body: Record<string, any>;
  try {
    body = await c.req.json();
  } catch {
    return Response.json(
      { type: 'error', error: { type: 'invalid_request_error', message: 'Invalid JSON payload' } },
      { status: 400 }
    );
  }

  const requestedModel = body.model || (await getDefaultModel());
  const resolvedItems = await resolveModel(requestedModel);

  if (!resolvedItems || resolvedItems.length === 0) {
    return Response.json(
      {
        type: 'error',
        error: {
          type: 'not_found_error',
          message: `Model '${requestedModel}' not found or no active provider configured.`,
        },
      },
      { status: 404 }
    );
  }

  // 3. Routing & Failover
  let lastError: any = null;

  for (const candidate of resolvedItems) {
    if (isAnthropicNative(candidate)) {
      try {
        const resp = await anthropicProxy('/v1/messages', candidate, body, c.req.raw.headers);
        if (resp.status >= 500 || resp.status === 429) {
          lastError = new Error(`Provider ${candidate.provider.name} returned status ${resp.status}`);
          continue;
        }
        return resp;
      } catch (err: any) {
        lastError = err;
        continue;
      }
    }
  }

  return Response.json(
    {
      type: 'error',
      error: {
        type: 'api_error',
        message: lastError?.message || `No native Anthropic provider available for model '${requestedModel}'.`,
      },
    },
    { status: 502 }
  );
}
