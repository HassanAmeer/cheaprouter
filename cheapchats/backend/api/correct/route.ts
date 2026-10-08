import { NextResponse } from 'next/server';
import { db as sqliteDb } from '@cheapchats/backend/db';
import { globalConfig } from '@cheapchats/backend/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

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
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1).trim();
  }
  if (text.startsWith('```') && text.endsWith('```')) {
    text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  return text;
}

function fallbackCleanText(raw: string): string {
  let cleaned = raw.trim();
  if (!cleaned) return cleaned;
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

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
    theyre: "theyre",
    isnt: "isn't",
    arent: "aren't",
    plz: 'please',
    pls: 'please',
    thx: 'thanks',
    ty: 'thank you',
    u: 'you',
    r: 'are',
    ur: 'your',
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

  cleaned = cleaned.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, prefix, char) => `${prefix}${char.toUpperCase()}`);

  if (cleaned.length > 0 && /^[a-z]/.test(cleaned)) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

export async function POST(req: Request) {
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

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Text is required for correction' }, { status: 400 });
    }

    const systemPrompt = `You are an expert writing and grammar assistant. Fix all grammatical mistakes, spelling errors, awkward phrasing, typos, and punctuation in the user's text while preserving the exact meaning, intent, tone, and language (English, Urdu, Roman Urdu, etc.).
RULES:
1. Output ONLY the corrected text.
2. Do NOT add any quotes around the output.
3. Do NOT add greetings, explanations, notes, or markdown fences.`;

    let activeKey: string = (userApiKey || '').trim();
    let effectiveTargetUrl: string = '';

    if (isCustom || customEndpoint) {
      if (customEndpoint && typeof customEndpoint === 'string') {
        effectiveTargetUrl = getOpenAIFormatUrl(customEndpoint);
      }
    }

    if (!activeKey) {
      try {
        const entry = sqliteDb.select().from(globalConfig).where(eq(globalConfig.key, 'OPENROUTER_API_KEY')).get();
        activeKey = process.env.OPENROUTER_API_KEY || (entry?.value || '') || process.env.OPENAI_API_KEY || '';
      } catch {
        activeKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '';
      }
    }

    if (!effectiveTargetUrl) {
      effectiveTargetUrl = 'https://openrouter.ai/api/v1/chat/completions';
    }

    let correctedText = '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (activeKey) {
      headers['Authorization'] = `Bearer ${activeKey}`;
    }
    if (effectiveTargetUrl.includes('openrouter.ai')) {
      headers['HTTP-Referer'] = 'http://localhost:3000';
      headers['X-Title'] = 'CheapChats';
    }

    try {
      const res = await fetch(effectiveTargetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text.trim() },
          ],
          temperature: 0.2,
          max_tokens: 2048,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        correctedText = data.choices?.[0]?.message?.content?.trim() || '';
      }
    } catch (e) {
      console.warn('Upstream fetch error in cheapchats backend correct:', e);
    }

    if (correctedText) {
      const clean = cleanExtractedText(correctedText);
      if (clean) {
        return NextResponse.json({ success: true, correctedText: clean });
      }
    }

    const fallbackCleaned = fallbackCleanText(text);
    return NextResponse.json({
      success: true,
      correctedText: fallbackCleaned || text,
      fallback: true,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || 'Failed to correct text',
    }, { status: 500 });
  }
}
