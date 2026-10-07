// ---------------------------------------------------------------------------
// POST /v1/chat/completions
// OpenAI-compatible chat completions handler with intelligent routing & failover.
// ---------------------------------------------------------------------------

import { Context } from 'hono';
import { extractToken, validateBearer } from './auth.ts';
import { resolveModel, getDefaultModel } from './providers.ts';
import { isOpenAICompat, nativeProxy } from './proxy.ts';
import { sdkCompletions } from './sdk-handler.ts';

export async function handleCompletions(c: Context): Promise<Response> {
  // 1. Auth verification (supports API key, Dev Master Key, or Dashboard Test Mode)
  let token = extractToken(c.req.raw.headers);
  const isDashboardTest = c.req.header('x-from-dashboard') === 'true';

  if (!token && isDashboardTest) {
    token = process.env.MASTER_KEY || 'sk-engine-dev-key';
  }

  if (!token) {
    return Response.json(
      { error: { message: 'Missing Authorization header or Bearer token', type: 'invalid_request_error', code: 'unauthorized' } },
      { status: 401 }
    );
  }

  const userId = await validateBearer(token);
  if (!userId) {
    return Response.json(
      { error: { message: 'Invalid or inactive API key', type: 'invalid_request_error', code: 'invalid_api_key' } },
      { status: 401 }
    );
  }

  // 2. Parse request body
  let body: Record<string, any>;
  try {
    body = await c.req.json();
  } catch {
    return Response.json(
      { error: { message: 'Invalid JSON payload in request body', type: 'invalid_request_error' } },
      { status: 400 }
    );
  }

  const requestedModel = body.model || (await getDefaultModel());
  const resolvedItems = await resolveModel(requestedModel);

  if (!resolvedItems || resolvedItems.length === 0) {
    return Response.json(
      {
        error: {
          message: `Model '${requestedModel}' not found or no active provider with valid keys is configured.`,
          type: 'invalid_request_error',
          code: 'model_not_found',
        },
      },
      { status: 404 }
    );
  }

  // 3. Routing & Failover
  let lastError: any = null;

  for (let i = 0; i < resolvedItems.length; i++) {
    const candidate = resolvedItems[i];

    // High performance path: Native fetch byte-passthrough for OpenAI-compatible providers
    if (isOpenAICompat(candidate)) {
      try {
        const resp = await nativeProxy('/chat/completions', candidate, body, c.req.raw.headers);
        if (resp.status >= 500 || resp.status === 429) {
          lastError = new Error(`Provider ${candidate.provider.name} returned status ${resp.status}`);
          continue;
        }
        return resp;
      } catch (err: any) {
        lastError = err;
        continue;
      }
    } else {
      // Transformation path: Non-OpenAI providers (Anthropic, Gemini, Cohere) handled by AI SDK
      try {
        const remaining = resolvedItems.slice(i);
        return await sdkCompletions(remaining, body);
      } catch (err: any) {
        lastError = err;
        continue;
      }
    }
  }

  return Response.json(
    {
      error: {
        message: lastError?.message || 'All providers failed to fulfill the request',
        type: 'api_error',
      },
    },
    { status: 502 }
  );
}
