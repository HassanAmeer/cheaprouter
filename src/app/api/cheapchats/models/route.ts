import { NextResponse } from 'next/server';
import { db } from '../../../../../backend/src/db';
import { MODEL_REGISTRY } from '../../../../../backend/src/registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await db`
      SELECT id, name, status, models, icon, base_url, api_format, chats_enabled
      FROM admin_providers
      WHERE chats_enabled = true
      ORDER BY priority ASC, name ASC
    `;

    const providers: Record<string, any[]> = {};

    for (const p of rows) {
      let modelsList = Array.isArray(p.models) ? p.models : [];

      if (modelsList.length === 0) {
        const key = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const regMatches = Object.keys(MODEL_REGISTRY).find((rk) => key.includes(rk));
        if (regMatches && MODEL_REGISTRY[regMatches]) {
          modelsList = MODEL_REGISTRY[regMatches].map((m) => ({
            id: m.id,
            name: m.name,
            provider: p.name,
            description: m.features?.join(', ') || '',
            isPopular: false,
          }));
        }
      }

      providers[p.name] = modelsList.map((m: any) => ({
        id: typeof m === 'string' ? m : m.id || m.originalId || m.name,
        name: typeof m === 'string' ? m : m.name || m.id || 'Default Model',
        provider: p.name,
        description: typeof m === 'object' ? m.description || '' : '',
        isPopular: typeof m === 'object' ? !!m.isPopular : false,
      }));
    }

    return NextResponse.json({ providers }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err: any) {
    console.error('Failed to load CheapChats models:', err);
    return NextResponse.json({ providers: {} }, { status: 500 });
  }
}
