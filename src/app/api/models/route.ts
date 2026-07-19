import { NextResponse } from 'next/server';

const MODELS = [
  { id: 'gpt-4o', provider: 'OpenAI', name: 'GPT-4o', context: '128k', input: '$5.00', output: '$15.00' },
  { id: 'gpt-4o-mini', provider: 'OpenAI', name: 'GPT-4o Mini', context: '128k', input: '$0.15', output: '$0.60' },
  { id: 'claude-3-5-sonnet', provider: 'Anthropic', name: 'Claude 3.5 Sonnet', context: '200k', input: '$3.00', output: '$15.00' },
  { id: 'claude-3-haiku', provider: 'Anthropic', name: 'Claude 3 Haiku', context: '200k', input: '$0.25', output: '$1.25' },
  { id: 'gemini-1.5-pro', provider: 'Google', name: 'Gemini 1.5 Pro', context: '2M', input: '$3.50', output: '$10.50' },
  { id: 'gemini-1.5-flash', provider: 'Google', name: 'Gemini 1.5 Flash', context: '1M', input: '$0.075', output: '$0.30' },
];

export async function GET() {
  return NextResponse.json({ models: MODELS });
}
