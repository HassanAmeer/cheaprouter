import { NextResponse } from 'next/server';
import { db as sqliteDb } from '@cheapchats/backend/db';
import { globalConfig } from '@cheapchats/backend/db/schema';
import { db as pgDb } from '../../../../backend/src/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const DEFAULT_PROVIDER_BASE_URLS: Record<string, string> = {
  ap_openai: 'https://api.openai.com/v1',
  ap_anthropic: 'https://api.anthropic.com/v1',
  ap_groq: 'https://api.groq.com/openai/v1',
  ap_openrouter: 'https://openrouter.ai/api/v1',
  ap_opencode: 'https://opencode.ai/api/v1',
  ap_deepseek: 'https://api.deepseek.com',
  ap_together: 'https://api.together.xyz/v1',
  ap_cerebras: 'https://api.cerebras.ai/v1',
  ap_sambanova: 'https://api.sambanova.ai/v1',
  ap_xai: 'https://api.x.ai/v1',
  ap_mistral: 'https://api.mistral.ai/v1',
  ap_cohere: 'https://api.cohere.ai/v1',
  ap_novita: 'https://api.novita.ai/v3/openai',
  ap_fireworks: 'https://api.fireworks.ai/inference/v1',
  ap_perplexity: 'https://api.perplexity.ai',
  ap_siliconflow: 'https://api.siliconflow.cn/v1',
  ap_hyperbolic: 'https://api.hyperbolic.xyz/v1',
  ap_moonshot: 'https://api.moonshot.cn/v1',
  ap_stepfun: 'https://api.stepfun.com/v1',
  ap_nvidia: 'https://integrate.api.nvidia.com/v1',
};

function getOpenAIFormatUrl(baseUrl?: string): string {
  let url = (baseUrl || 'https://api.openai.com/v1').trim();
  if (url.endsWith('/chat/completions')) return url;
  if (url.endsWith('/completions')) return url;
  if (url.endsWith('/models')) return url.replace(/\/models$/, '/chat/completions');
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/v1')) url += '/v1';
  return `${url}/chat/completions`;
}

function cleanExtractedText(raw: string): string {
  let text = raw.trim();
  // Strip enclosing quotes if model wrapped output in quotes
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1).trim();
  }
  // Strip markdown code fences if wrapped
  if (text.startsWith('```') && text.endsWith('```')) {
    text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  return text;
}

function fallbackCleanText(raw: string): string {
  let cleaned = (raw || '').trim();
  if (!cleaned) return cleaned;

  // Normalize multi-spaces and tabs
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  // Typo & shorthand dictionary (English & Roman Urdu common forms)
  const typoMap: Record<string, string> = {
    teh: 'the',
    adn: 'and',
    taht: 'that',
    waht: 'what',
    wierd: 'weird',
    seperate: 'separate',
    recieve: 'receive',
    dont: "don't",
    cant: "can't",
    wont: "won't",
    im: "I'm",
    id: "I'd",
    ive: "I've",
    youre: "you're",
    theyre: "they're",
    isnt: "isn't",
    arent: "aren't",
    wasnt: "wasn't",
    werent: "weren't",
    hasnt: "hasn't",
    havent: "haven't",
    hadnt: "hadn't",
    doesnt: "doesn't",
    didnt: "didn't",
    couldnt: "couldn't",
    shouldnt: "shouldn't",
    wouldnt: "wouldn't",
    plz: 'please',
    pls: 'please',
    thx: 'thanks',
    ty: 'thank you',
    u: 'you',
    r: 'are',
    ur: 'your',
    shud: 'should',
    cud: 'could',
    wud: 'would',
  };

  cleaned = cleaned.replace(/\b([a-zA-Z']+)\b/g, (match) => {
    const lower = match.toLowerCase();
    if (lower === 'i') return 'I';
    if (typoMap[lower]) {
      const rep = typoMap[lower];
      if (match[0] === match[0].toUpperCase()) {
        return rep.charAt(0).toUpperCase() + rep.slice(1);
      }
      return rep;
    }
    return match;
  });

  // Capitalize after periods, question marks, and exclamation marks
  cleaned = cleaned.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, prefix, char) => `${prefix}${char.toUpperCase()}`);

  // Capitalize first letter
  if (cleaned.length > 0 && /^[a-z]/.test(cleaned)) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

export async function POST(req: Request) {
  let rawText = '';
  try {
    const body = await req.json().catch(() => ({}));
    const {
      text,
      model = 'gpt-4o',
      provider = 'OpenRouter',
      apiKey: userApiKey,
      customEndpoint,
      isCustom = false,
    } = body;

    rawText = typeof text === 'string' ? text : '';

    if (!rawText.trim()) {
      return NextResponse.json({ error: 'Text is required for correction' }, { status: 400 });
    }

    const systemPrompt = `You are an expert writing and grammar assistant. Fix all grammatical mistakes, spelling errors, awkward phrasing, typos, and punctuation in the user's text while preserving the exact meaning, intent, tone, and language (English, Urdu, Roman Urdu, etc.).
RULES:
1. Output ONLY the corrected text.
2. Do NOT add any quotes around the output.
3. Do NOT add greetings, explanations, notes, or markdown fences.`;

    let activeKey: string = (userApiKey || '').trim();
    let effectiveTargetUrl: string = '';
    let apiFormat: string = 'openai';
    let customHeaders: Record<string, string> = {};

    // 1. If custom endpoint is passed (e.g., custom provider or local OpenCode/Ollama)
    if (isCustom || customEndpoint || (typeof provider === 'string' && provider.startsWith('custom:'))) {
      if (customEndpoint && typeof customEndpoint === 'string') {
        effectiveTargetUrl = getOpenAIFormatUrl(customEndpoint);
      }
    }

    // 2. Lookup provider in Postgres admin_providers if not custom
    let provRow: any = null;
    if (!effectiveTargetUrl && provider) {
      try {
        const cleanName = String(provider).replace(/^custom:/, '').toLowerCase();
        const withAp = `ap_${cleanName}`;
        const rows = await pgDb`SELECT * FROM admin_providers WHERE LOWER(id) = ${withAp} OR LOWER(id) = ${cleanName} OR LOWER(name) = ${cleanName} LIMIT 1`;
        if (rows.length > 0) {
          provRow = rows[0];
          if (provRow.base_url) {
            effectiveTargetUrl = getOpenAIFormatUrl(provRow.base_url);
          }
          if (provRow.api_format) {
            apiFormat = String(provRow.api_format).toLowerCase();
          }
          if (Array.isArray(provRow.headers)) {
            for (const h of provRow.headers) {
              if (h.key && h.value) customHeaders[h.key] = h.value;
            }
          }
          if (!activeKey && provRow.key) {
            try {
              const parsed = JSON.parse(provRow.key);
              if (Array.isArray(parsed) && parsed.length > 0) {
                activeKey = typeof parsed[0] === 'string' ? parsed[0] : parsed[0].key;
              } else if (typeof parsed === 'string') {
                activeKey = parsed;
              }
            } catch {
              activeKey = String(provRow.key).trim();
            }
          }
        }
      } catch (e) {
        console.warn('[Correct API] pgDb lookup error:', e);
      }
    }

    // 3. Check DEFAULT_PROVIDER_BASE_URLS
    if (!effectiveTargetUrl && provider) {
      const pKey = `ap_${String(provider).toLowerCase()}`;
      if (DEFAULT_PROVIDER_BASE_URLS[pKey]) {
        effectiveTargetUrl = getOpenAIFormatUrl(DEFAULT_PROVIDER_BASE_URLS[pKey]);
      } else if (DEFAULT_PROVIDER_BASE_URLS[String(provider).toLowerCase()]) {
        effectiveTargetUrl = getOpenAIFormatUrl(DEFAULT_PROVIDER_BASE_URLS[String(provider).toLowerCase()]);
      }
    }

    // 4. Fallback keys from SQLite globalConfig or process.env
    if (!activeKey) {
      try {
        const entry = await sqliteDb.select().from(globalConfig).where(eq(globalConfig.key, 'OPENROUTER_API_KEY')).get();
        activeKey = process.env.OPENROUTER_API_KEY || (entry?.value || '') || process.env.OPENAI_API_KEY || '';
      } catch {
        activeKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '';
      }
    }

    // 5. Default target URL if still undetermined
    if (!effectiveTargetUrl) {
      const provLower = String(provider).toLowerCase();
      if (provLower.includes('anthropic')) {
        effectiveTargetUrl = 'https://api.anthropic.com/v1/messages';
        apiFormat = 'anthropic';
      } else if (provLower.includes('groq')) {
        effectiveTargetUrl = 'https://api.groq.com/openai/v1/chat/completions';
      } else if (provLower.includes('opencode')) {
        effectiveTargetUrl = 'https://opencode.ai/api/v1/chat/completions';
      } else if (provLower.includes('deepseek')) {
        effectiveTargetUrl = 'https://api.deepseek.com/chat/completions';
      } else if (activeKey && activeKey.startsWith('sk-ant-')) {
        effectiveTargetUrl = 'https://api.anthropic.com/v1/messages';
        apiFormat = 'anthropic';
      } else if (activeKey && activeKey.startsWith('sk-or-')) {
        effectiveTargetUrl = 'https://openrouter.ai/api/v1/chat/completions';
      } else {
        effectiveTargetUrl = 'https://openrouter.ai/api/v1/chat/completions';
      }
    }

    // 6. Execute AI model call with safe timeout and error catching
    let correctedText = '';
    let usedModel = model || 'gpt-4o-mini';

    try {
      if (apiFormat === 'anthropic' || String(provider).toLowerCase().includes('anthropic')) {
        const targetModel = usedModel.replace(/^anthropic\//, '');
        const anthropicUrl = effectiveTargetUrl.includes('/messages')
          ? effectiveTargetUrl
          : `${effectiveTargetUrl.replace(/\/+$/, '')}/v1/messages`;

        const res = await fetch(anthropicUrl, {
          method: 'POST',
          signal: AbortSignal.timeout(8000),
          headers: {
            'x-api-key': activeKey || '',
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
            ...customHeaders,
          },
          body: JSON.stringify({
            model: targetModel,
            system: systemPrompt,
            messages: [{ role: 'user', content: rawText.trim() }],
            temperature: 0.2,
            max_tokens: 2048,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          correctedText = data.content?.[0]?.text?.trim() || '';
        } else {
          console.warn(`[Correct API] Anthropic status ${res.status}`);
        }
      } else {
        // Standard OpenAI / OpenAI-compatible endpoint
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...customHeaders,
        };
        if (activeKey) {
          headers['Authorization'] = `Bearer ${activeKey}`;
        }
        if (effectiveTargetUrl.includes('openrouter.ai')) {
          headers['HTTP-Referer'] = 'http://localhost:3000';
          headers['X-Title'] = 'CheapChats';
        }

        const targetModel = usedModel.includes('/') && !effectiveTargetUrl.includes('openrouter')
          ? usedModel.split('/').pop() || usedModel
          : usedModel;

        const res = await fetch(effectiveTargetUrl, {
          method: 'POST',
          signal: AbortSignal.timeout(8000),
          headers,
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: rawText.trim() },
            ],
            temperature: 0.2,
            max_tokens: 2048,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          correctedText = data.choices?.[0]?.message?.content?.trim() || '';
        } else {
          console.warn(`[Correct API] Upstream status ${res.status}`);
        }
      }
    } catch (fetchErr: any) {
      console.warn('[Correct API] Upstream fetch warning:', fetchErr?.message || fetchErr);
    }

    if (correctedText) {
      const clean = cleanExtractedText(correctedText);
      if (clean) {
        return NextResponse.json({ success: true, correctedText: clean, model: usedModel });
      }
    }

    // Fallback: If upstream failed or returned empty, use intelligent heuristic cleaner
    const fallbackCleaned = fallbackCleanText(rawText);
    return NextResponse.json({
      success: true,
      correctedText: fallbackCleaned || rawText,
      fallback: true,
      note: 'Applied smart grammar and typo correction.',
    });
  } catch (err: any) {
    console.error('[Correct API] Outer exception:', err);
    const fallbackCleaned = fallbackCleanText(rawText);
    return NextResponse.json({
      success: true,
      correctedText: fallbackCleaned || rawText || 'Text corrected',
      fallback: true,
    });
  }
}
