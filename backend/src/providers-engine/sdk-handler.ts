// ---------------------------------------------------------------------------
// AI SDK handler — used for non-OpenAI providers (Anthropic/Google/Cohere).
// Converts OpenAI-format input → provider format → OpenAI-format output.
// This is the same approach as cheaprouter's completions.ts.
// ---------------------------------------------------------------------------

import { createOpenAI }             from '@ai-sdk/openai';
import { createAnthropic }          from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createCohere }             from '@ai-sdk/cohere';
import { streamText, generateText } from 'ai';
import { ResolvedModel }            from './providers.ts';

/** Build the AI SDK model instance for a given resolved provider */
function buildInstance(r: ResolvedModel): any {
  const { provider: p, apiKey, modelId } = r;
  const baseURL = p.base_url || undefined;
  const headers: Record<string, string> =
    p.headers && typeof p.headers === 'object' && !Array.isArray(p.headers)
      ? (p.headers as Record<string, string>)
      : {};

  switch (p.api_format) {
    case 'anthropic':
      return createAnthropic({ apiKey, baseURL, headers })(modelId);
    case 'google':
      return createGoogleGenerativeAI({ apiKey, baseURL, headers })(modelId);
    case 'cohere':
      return createCohere({ apiKey, baseURL, headers })(modelId);
    default:
      return createOpenAI({ apiKey, baseURL, headers })(modelId);
  }
}

type CoreMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: any;
};

function mapRole(role: string): CoreMessage['role'] {
  const r = String(role ?? '').toLowerCase();
  if (r === 'system' || r === 'user' || r === 'assistant' || r === 'tool') return r;
  if (r === 'function' || r === 'tool_result') return 'tool';
  return 'assistant';
}

function buildMessages(messages: any[]): CoreMessage[] {
  return messages.map((m: any): CoreMessage => {
    const role = mapRole(m.role);

    if (role === 'tool') {
      const rawResult = Array.isArray(m.content) ? JSON.stringify(m.content) : m.content;
      let parsed: unknown = rawResult;
      try { parsed = JSON.parse(rawResult); } catch { /* keep raw */ }
      const output =
        parsed !== null && typeof parsed === 'object'
          ? { type: 'json', value: parsed }
          : { type: 'text', value: rawResult ?? '' };
      return {
        role: 'tool',
        content: [{
          type:       'tool-result',
          toolCallId: m.tool_call_id ?? m.toolCallId ?? `call_${Math.random().toString(36).slice(2, 10)}`,
          toolName:   m.name ?? 'unknown',
          output,
        }],
      };
    }

    if (Array.isArray(m.content)) return { role, content: m.content };

    if (m.tool_calls?.length) {
      const parts: any[] = [];
      if (m.content) parts.push({ type: 'text', text: m.content });
      for (const tc of m.tool_calls) {
        const fn = tc.function ?? {};
        parts.push({
          type:       'tool-call',
          toolCallId: tc.id ?? `call_${Math.random().toString(36).slice(2, 10)}`,
          toolName:   fn.name ?? 'unknown',
          input:      typeof fn.arguments === 'string'
            ? JSON.parse(fn.arguments || '{}')
            : (fn.arguments ?? {}),
        });
      }
      return { role, content: parts };
    }

    if (m.images?.length) {
      const parts: any[] = [];
      if (m.content) parts.push({ type: 'text', text: m.content });
      for (const img of m.images) parts.push({ type: 'image', image: img });
      return { role, content: parts };
    }

    return { role, content: m.content };
  });
}

/**
 * Handle a completions request using the AI SDK (for non-OpenAI-compat providers).
 * Tries each resolved item in order; falls back on transient errors.
 */
export async function sdkCompletions(
  resolvedItems: ResolvedModel[],
  body: Record<string, any>,
): Promise<Response> {
  const { model, messages, stream = false, temperature, max_tokens, top_p } = body;
  const coreMessages = buildMessages(messages ?? []);

  const opts: any = {};
  if (typeof temperature === 'number') opts.temperature = temperature;
  if (typeof max_tokens  === 'number') { opts.maxOutputTokens = max_tokens; }
  if (typeof top_p       === 'number') opts.topP        = top_p;

  let lastError: any;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (const r of resolvedItems) {
    const instance = buildInstance(r);
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (stream) {
          const result = await streamText({ model: instance, maxRetries: 0, messages: coreMessages, ...opts });

          const iter  = result.fullStream[Symbol.asyncIterator]();
          const first = await iter.next();
          if (first.done) throw new Error('Provider returned empty stream');
          if (first.value.type === 'error') {
            const e: any = first.value.error;
            throw e instanceof Error ? e : new Error(e?.message ?? 'Stream error');
          }

          const encoder  = new TextEncoder();
          const sentinel = `chatcmpl-${Date.now()}`;
          const created  = Math.floor(Date.now() / 1000);

          const readable = new ReadableStream({
            async start(ctrl) {
              const send    = (obj: any) => ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
              const sendRaw = (s: string) => ctrl.enqueue(encoder.encode(s + '\n\n'));

              const handlePart = (part: any) => {
                if (part.type === 'text-delta') {
                  send({ id: sentinel, object: 'chat.completion.chunk', created, model,
                         choices: [{ index: 0, delta: { content: part.delta }, finish_reason: null }] });
                }
              };

              try {
                handlePart(first.value);
                let next = await iter.next();
                while (!next.done) {
                  const p = next.value;
                  if (p.type === 'error') {
                    send({ error: (p.error as any)?.message ?? 'Stream error', type: 'provider_error' });
                    return;
                  }
                  if (p.type === 'finish') {
                    send({ id: sentinel, object: 'chat.completion.chunk', created, model,
                           choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] });
                    sendRaw('data: [DONE]');
                    return;
                  }
                  handlePart(p);
                  next = await iter.next();
                }
              } catch (err) {
                ctrl.error(err);
              } finally {
                ctrl.close();
              }
            },
          });

          return new Response(readable, {
            headers: {
              'Content-Type':      'text/event-stream',
              'Cache-Control':     'no-cache, no-transform',
              'Connection':        'keep-alive',
              'X-Accel-Buffering': 'no',
              'X-Provider':        r.provider.name || r.provider.id,
            },
          });
        } else {
          // Non-streaming
          const result = await generateText({ model: instance, maxRetries: 0, messages: coreMessages, ...opts });
          const tokens = result.usage?.totalTokens ?? 0;
          return Response.json({
            id:      `chatcmpl-${Date.now()}`,
            object:  'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [{
              index:         0,
              message:       { role: 'assistant', content: result.text },
              finish_reason: 'stop',
            }],
            usage: {
              prompt_tokens:     (result.usage as any)?.promptTokens     ?? 0,
              completion_tokens: (result.usage as any)?.completionTokens ?? 0,
              total_tokens:      tokens,
            },
          });
        }
      } catch (err: any) {
        lastError = err;
        const status = err?.statusCode ?? err?.response?.status ?? 500;
        const msg    = err?.message ?? '';
        const isTransient =
          status === 503 || status === 429 || status === 502 || status === 504 ||
          msg.includes('Rate limit') || msg.includes('unavailable');

        if (isTransient && attempt < 2) { await sleep(600); continue; }

        // Hard 4xx (not 401/403/429) — abort immediately
        const modelNotFound = status === 404 || /not supported|does not exist|not found/i.test(msg);
        if (status >= 400 && status < 500 && ![401, 403, 429].includes(status) && !modelNotFound) throw err;
        break; // try next provider
      }
    }
  }

  throw lastError ?? new Error('All providers failed');
}
