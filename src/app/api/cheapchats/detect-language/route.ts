import { NextResponse } from 'next/server';
import { db as pgDb } from '../../../../../backend/src/db';

export const dynamic = 'force-dynamic';

/**
 * Tiny AI language detector used by the "Auto Detect" speech accents.
 * Asks the active model for nothing but a BCP-47 language tag (max_tokens: 6),
 * so it stays fast. Results are cached per text-hash.
 */

const CACHE = new Map<string, string>();
const CACHE_LIMIT = 300;

const VALID_TAGS: string[] = [
  'ur-roman', 'ur-PK', 'ur-IN', 'hi-IN', 'en-US', 'en-GB', 'en-IN', 'en-AU',
  'en-CA', 'ar-SA', 'ar-AE', 'es-ES', 'es-MX', 'fr-FR', 'de-DE', 'it-IT',
  'pt-BR', 'ru-RU', 'tr-TR', 'zh-CN', 'ja-JP', 'ko-KR', 'id-ID', 'th-TH',
  'nl-NL', 'pl-PL', 'vi-VN', 'bn-IN', 'ta-IN', 'te-IN'
];

function normalizeTag(raw: string): string | null {
  const tag = (raw || '').trim().split(/[\s,/|]+/)[0];
  if (!tag) return null;
  const found = VALID_TAGS.find((v) => v.toLowerCase() === tag.toLowerCase());
  if (found) return found;
  // Accept bare language codes like "ur" or "en"
  const base = tag.toLowerCase().split('-')[0];
  const match = VALID_TAGS.find((v) => v.toLowerCase().split('-')[0] === base);
  return match || null;
}

/** Pull the first usable key out of the admin provider `key` column. */
function pickFirstKey(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed.startsWith('[') && !trimmed.startsWith('{') && !trimmed.startsWith('"')) {
      return trimmed;
    }
    try {
      return pickFirstKey(JSON.parse(trimmed));
    } catch {
      return '';
    }
  }
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const k = pickFirstKey(item);
      if (k) return k;
    }
    return '';
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    for (const field of ['key', 'apiKey', 'api_key', 'value', 'token']) {
      const k = pickFirstKey(obj[field]);
      if (k) return k;
    }
  }
  return '';
}

function getOpenAIFormatUrl(baseUrl?: string): string {
  let url = (baseUrl || 'https://api.openai.com/v1').trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  if (!/\/v\d+$/.test(url) && !/\/v\d+\//.test(url)) {
    url = url.replace(/\/+$/, '') + '/v1';
  }
  return `${url.replace(/\/+$/, '')}/chat/completions`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, model, provider = 'OpenRouter', providerId, apiKey, baseUrl } = body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    // Cache by a stable sample of the text
    const sample = text.trim().slice(0, 240);
    let hash = 0;
    for (let i = 0; i < sample.length; i++) {
      hash = (hash * 31 + sample.charCodeAt(i)) | 0;
    }
    const key = `${hash}`;
    const cached = CACHE.get(key);
    if (cached) {
      return NextResponse.json({ language: cached, cached: true });
    }

    // Resolve the provider exactly like the chat route does: BYOK key first,
    // otherwise the admin-configured provider from Postgres.
    let activeKey = (apiKey || '').trim();
    let resolvedBaseUrl = baseUrl;
    let resolvedModel = model;
    let apiFormat = 'openai';

    if (!activeKey) {
      try {
        let provRow: any = null;
        if (providerId) {
          const rows = await pgDb`SELECT * FROM admin_providers WHERE id = ${providerId} LIMIT 1`;
          if (rows.length) provRow = rows[0];
        }
        if (!provRow) {
          const rows = await pgDb`SELECT * FROM admin_providers WHERE LOWER(name) = LOWER(${provider}) LIMIT 1`;
          if (rows.length) provRow = rows[0];
        }
        if (provRow) {
          resolvedBaseUrl = provRow.base_url || resolvedBaseUrl;
          apiFormat = (provRow.api_format || 'openai').toLowerCase();
          if (!resolvedModel) resolvedModel = provRow.default_model || provRow.model;
          activeKey = pickFirstKey(provRow.key);
        }
      } catch {
        // DB unavailable — fall back to env keys below
      }
    }

    activeKey = activeKey || process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || '';
    if (!activeKey) {
      return NextResponse.json({ language: null, reason: 'no api key' });
    }

    const isOpenRouter = /openrouter/i.test(provider) || /openrouter/i.test(resolvedBaseUrl || '');
    const target =
      apiFormat === 'anthropic'
        ? `${(resolvedBaseUrl || 'https://api.anthropic.com').replace(/\/+$/, '')}/v1/messages`
        : getOpenAIFormatUrl(resolvedBaseUrl);

    const upstream = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiFormat === 'anthropic'
          ? { 'x-api-key': activeKey, 'anthropic-version': '2023-06-01' }
          : {
              Authorization: `Bearer ${activeKey}`,
              ...(isOpenRouter
                ? {
                    'HTTP-Referer': 'https://cheaprouter.app',
                    'X-Title': 'CheapChats Language Detect',
                  }
                : {}),
            }),
      },
      body: JSON.stringify(
        apiFormat === 'anthropic'
          ? {
              model: resolvedModel || 'claude-3-5-haiku-latest',
              max_tokens: 8,
              system:
                'You are a language detector. Reply with ONLY one BCP-47 language tag for the language of the user text (examples: en-US, ur-PK, ur-roman for Urdu written in Latin letters, hi-IN, ar-SA). No words, no quotes.',
              messages: [{ role: 'user', content: sample }],
            }
          : {
              model: resolvedModel || (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini'),
              temperature: 0,
              max_tokens: 6,
              messages: [
                {
                  role: 'system',
                  content:
                    'You are a language detector. Reply with ONLY one BCP-47 language tag for the language of the user text (examples: en-US, ur-PK, ur-roman for Urdu written in Latin letters, hi-IN, ar-SA). No words, no quotes, no explanation.',
                },
                { role: 'user', content: sample },
              ],
            }
      ),
      signal: AbortSignal.timeout(6000),
    });

    if (!upstream.ok) {
      return NextResponse.json({ language: null, reason: `upstream ${upstream.status}` });
    }

    const data = await upstream.json();
    const raw: string =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.content?.[0]?.text ||
      '';

    const language = normalizeTag(raw);
    if (language) {
      if (CACHE.size >= CACHE_LIMIT) CACHE.clear();
      CACHE.set(key, language);
    }

    return NextResponse.json({ language, raw: raw.trim().slice(0, 20) });
  } catch (error) {
    return NextResponse.json({ language: null, reason: 'detect failed' });
  }
}