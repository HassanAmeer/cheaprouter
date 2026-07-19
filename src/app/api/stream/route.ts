import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const prompt = url.searchParams.get('prompt');
  const models = url.searchParams.get('model')?.split(',') || ['gpt-4o'];

  if (!prompt) {
    return new Response('Missing prompt', { status: 400 });
  }

  // We will stream from the first selected model
  const modelId = models[0];
  let provider = 'OpenAI';
  if (modelId.includes('claude')) provider = 'Anthropic';
  if (modelId.includes('gemini')) provider = 'Google';

  // Get key from DB or env
  let apiKey = db.getActiveProviderKey(provider);
  if (!apiKey) {
    // Fallback to env vars for demo if BYOK is not set
    if (provider === 'OpenAI') apiKey = process.env.OPENAI_API_KEY;
    if (provider === 'Anthropic') apiKey = process.env.ANTHROPIC_API_KEY;
    if (provider === 'Google') apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  }

  if (!apiKey) {
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(`data: {"chunk": "Error: No API key provided for ${provider}. Please add one in the Dashboard (BYOK)."}\n\n`);
        controller.enqueue(`data: [DONE]\n\n`);
        controller.close();
      }
    });
    return new Response(errorStream, { headers: { 'Content-Type': 'text/event-stream' } });
  }

  // Record mock analytics usage (approx 100 tokens)
  db.recordUsage(modelId, provider, Math.floor(Math.random() * 50) + 50);

  let aiModel: any;
  if (provider === 'OpenAI') {
    const openai = createOpenAI({ apiKey });
    aiModel = openai(modelId);
  } else if (provider === 'Anthropic') {
    const anthropic = createAnthropic({ apiKey });
    aiModel = anthropic(modelId);
  } else if (provider === 'Google') {
    const google = createGoogleGenerativeAI({ apiKey });
    aiModel = google(modelId);
  } else {
    // fallback
    const openai = createOpenAI({ apiKey });
    aiModel = openai('gpt-4o');
  }

  try {
    const result = await streamText({
      model: aiModel,
      prompt: prompt,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(`data: ${JSON.stringify({ chunk })}\n\n`);
          }
          controller.enqueue(`data: [DONE]\n\n`);
          controller.close();
        } catch (err: any) {
          controller.enqueue(`data: {"chunk": "\\n\\n[Error: ${err.message}]"}\n\n`);
          controller.enqueue(`data: [DONE]\n\n`);
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
