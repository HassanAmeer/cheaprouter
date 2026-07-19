import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    // Verify auth
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // We could validate the API key here by checking it in our DB
    const reqKey = auth.replace('Bearer ', '');
    // For now, accept any key for the demo

    const body = await req.json();
    const { model = 'gpt-4o', messages, stream = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    let provider = 'OpenAI';
    if (model.includes('claude')) provider = 'Anthropic';
    if (model.includes('gemini')) provider = 'Google';

    // Get provider key
    let apiKey = db.getActiveProviderKey(provider);
    if (!apiKey) {
      if (provider === 'OpenAI') apiKey = process.env.OPENAI_API_KEY;
      if (provider === 'Anthropic') apiKey = process.env.ANTHROPIC_API_KEY;
      if (provider === 'Google') apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    }

    if (!apiKey) {
      return NextResponse.json({ error: `No API key found for provider ${provider}. Add it in the BYOK dashboard.` }, { status: 400 });
    }

    let aiModel: any;
    if (provider === 'OpenAI') {
      const openai = createOpenAI({ apiKey });
      aiModel = openai(model);
    } else if (provider === 'Anthropic') {
      const anthropic = createAnthropic({ apiKey });
      aiModel = anthropic(model);
    } else {
      const google = createGoogleGenerativeAI({ apiKey });
      aiModel = google(model);
    }

    db.recordUsage(model, provider, 150); // Mock usage

    // Convert OpenAI messages to AI SDK core messages
    const coreMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })) as any;

    if (stream) {
      const result = await streamText({
        model: aiModel,
        messages: coreMessages,
      });

      const dataStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.textStream) {
              const payload = {
                id: 'chatcmpl-mock',
                object: 'chat.completion.chunk',
                created: Date.now(),
                model: model,
                choices: [{ delta: { content: chunk }, finish_reason: null }]
              };
              controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
            }
            controller.enqueue('data: [DONE]\n\n');
            controller.close();
          } catch (err: any) {
            controller.error(err);
          }
        }
      });
      return new Response(dataStream, { headers: { 'Content-Type': 'text/event-stream' } });
    } else {
      const result = await generateText({
        model: aiModel,
        messages: coreMessages,
      });

      return NextResponse.json({
        id: 'chatcmpl-mock',
        object: 'chat.completion',
        created: Date.now(),
        model: model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: result.text,
            },
            finish_reason: 'stop',
          }
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150
        }
      });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
