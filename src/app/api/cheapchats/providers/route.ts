import { NextResponse } from 'next/server';
import { db } from '../../../../../backend/src/db';
import { MODEL_REGISTRY } from '../../../../../backend/src/registry';

export const dynamic = 'force-dynamic';

const DEFAULT_ICONS: Record<string, string> = {
  openai: 'https://cdn.simpleicons.org/openai/10A37F',
  anthropic: 'https://cdn.simpleicons.org/anthropic/D97757',
  google: 'https://cdn.simpleicons.org/google/4285F4',
  gemini: 'https://cdn.simpleicons.org/google/4285F4',
  deepseek: 'https://cdn.simpleicons.org/deepseek/4D6BFE',
  openrouter: 'https://api.iconify.design/lucide:router.svg',
  opencode: 'https://api.iconify.design/lucide:code.svg',
  groq: 'https://cdn.simpleicons.org/groq/F55036',
  mistral: 'https://cdn.simpleicons.org/mistral/F26625',
  cohere: 'https://cdn.simpleicons.org/cohere/39594D',
  meta: 'https://cdn.simpleicons.org/meta/0467DF',
  huggingface: 'https://cdn.simpleicons.org/huggingface/FFD21E',
  ollama: 'https://cdn.simpleicons.org/ollama/FFFFFF',
  cerebras: 'https://api.iconify.design/lucide:brain.svg',
  sambanova: 'https://api.iconify.design/lucide:server.svg',
  together: 'https://cdn.simpleicons.org/togetherai/0A66C2',
  fireworks: 'https://cdn.simpleicons.org/fireworks/000000',
  xai: 'https://api.iconify.design/lucide:bot.svg',
  generic: 'https://api.iconify.design/lucide:bot.svg',
};

function resolveIcon(name: string, customIcon?: string | null): string {
  if (customIcon && customIcon.trim()) return customIcon.trim();
  const lower = name.toLowerCase();
  for (const [k, url] of Object.entries(DEFAULT_ICONS)) {
    if (lower.includes(k)) return url;
  }
  return DEFAULT_ICONS.generic;
}

export async function GET() {
  try {
    // 1. Fetch active providers from CheapRouter postgres DB
    const rows = await db`
      SELECT id, name, status, models, icon, base_url, api_format, is_custom, byok_enabled, chats_enabled, priority
      FROM admin_providers
      WHERE chats_enabled = true AND (byok_enabled = true OR byok_enabled IS NULL)
      ORDER BY priority ASC, name ASC
    `;

    // 2. Format and augment with registry models if needed
    const providers = rows.map((p: any) => {
      let modelsList = Array.isArray(p.models) ? p.models : [];

      // If empty in DB row, check MODEL_REGISTRY
      if (modelsList.length === 0) {
        const key = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const regMatches = Object.keys(MODEL_REGISTRY).find((rk) => key.includes(rk));
        if (regMatches && MODEL_REGISTRY[regMatches]) {
          modelsList = MODEL_REGISTRY[regMatches].map((m) => ({
            id: m.id,
            name: m.name,
            originalId: m.id,
            description: m.features?.join(', ') || '',
            contextWindow: m.contextWindow ? `${Math.round(m.contextWindow / 1000)}k` : undefined,
          }));
        }
      }

      return {
        id: p.id,
        name: p.name,
        icon: resolveIcon(p.name, p.icon),
        baseUrl: p.base_url || '',
        apiFormat: p.api_format || 'openai',
        isCustom: !!p.is_custom,
        byokEnabled: p.byok_enabled !== false,
        chatsEnabled: p.chats_enabled !== false,
        models: modelsList.map((m: any) => ({
          id: typeof m === 'string' ? m : m.id || m.originalId || m.name,
          name: typeof m === 'string' ? m : m.name || m.id || 'Default Model',
          originalId: typeof m === 'string' ? m : m.originalId || m.id,
          description: typeof m === 'object' ? m.description || '' : '',
          isPopular: typeof m === 'object' ? !!m.isPopular : false,
        })),
      };
    });

    return NextResponse.json({ providers }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Failed to load CheapChats providers:', error);
    return NextResponse.json({ error: 'Failed to load providers', providers: [] }, { status: 500 });
  }
}
