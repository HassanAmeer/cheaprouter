import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const activeProviders = db.listAdminProviders().filter(p => p.status);
    
    // Dynamically compile active models
    const models = activeProviders.flatMap(provider => 
      provider.models.map(m => {
        // Dynamic mock metadata based on provider name
        let context = '128k';
        let input = '$1.50';
        let output = '$5.00';
        
        if (provider.name.toLowerCase().includes('google')) {
          context = '1M';
          input = '$0.075';
          output = '$0.30';
        } else if (provider.name.toLowerCase().includes('openai')) {
          context = '128k';
          input = '$2.50';
          output = '$10.00';
        } else if (provider.name.toLowerCase().includes('anthropic')) {
          context = '200k';
          input = '$3.00';
          output = '$15.00';
        } else if (provider.name.toLowerCase().includes('deepseek')) {
          context = '64k';
          input = '$0.14';
          output = '$0.28';
        }

        return {
          id: m.id,
          provider: provider.name,
          name: m.name,
          context,
          input,
          output
        };
      })
    );

    return NextResponse.json({ models });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch active models' }, { status: 500 });
  }
}
