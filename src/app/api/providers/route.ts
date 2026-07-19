import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PROVIDER_META: Record<string, { name: string; icon: string; color: string }> = {
  openai: { name: 'OpenAI', icon: 'https://cdn.simpleicons.org/openai/10A37F', color: '#10A37F' },
  anthropic: { name: 'Anthropic', icon: 'https://cdn.simpleicons.org/anthropic/D97757', color: '#D97757' },
  google: { name: 'Google', icon: 'https://cdn.simpleicons.org/google/4285F4', color: '#4285F4' },
  meta: { name: 'Meta', icon: 'https://cdn.simpleicons.org/meta/0668E1', color: '#0668E1' },
  deepseek: { name: 'DeepSeek', icon: 'https://logo.clearbit.com/deepseek.com', color: '#1A53E8' },
};

export async function GET() {
  return NextResponse.json({ providers: db.listProviders() });
}

export async function POST(req: Request) {
  try {
    const { provider: providerKey, apiKey } = await req.json();
    
    if (!providerKey || !apiKey) {
      return NextResponse.json({ error: 'Provider and API Key required' }, { status: 400 });
    }

    const meta = PROVIDER_META[providerKey.toLowerCase()];
    if (!meta) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const provider = db.createProvider(meta.name, apiKey, meta);
    return NextResponse.json({ provider });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
