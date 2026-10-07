import { NextResponse } from 'next/server';
import { db } from '../../../../../backend/src/db';
import { MODEL_REGISTRY } from '../../../../../backend/src/registry';

export const dynamic = 'force-dynamic';

import { resolveProviderIcon } from '../../../../../backend/src/providers-engine/icons';

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
        icon: resolveProviderIcon(p.name, p.icon),
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
