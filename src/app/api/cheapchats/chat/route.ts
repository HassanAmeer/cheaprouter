import { NextResponse } from 'next/server';
import { db as sqliteDb } from '../../../../../cheapchats/backend/db';
import { conversations, messages, skills } from '../../../../../cheapchats/backend/db/schema';
import { db as pgDb } from '../../../../../backend/src/db';
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

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const {
      conversationId,
      message,
      model = 'gpt-4o',
      provider = 'OpenAI',
      providerId,
      apiKey: userApiKey,
      isIncognito = false,
      systemPrompt = 'You are a helpful, brilliant AI assistant.',
      attachments = [],
      temperature = 0.7,
      contextWindow = '128k',
      rollingWindowLimit = 20,
      selectedSkills = [],
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    let activeSystemPrompt = systemPrompt;
    const selectedSkillNames = Array.isArray(selectedSkills)
      ? selectedSkills.filter((name: unknown): name is string => typeof name === 'string').map((name: string) => name.trim().toLowerCase())
      : [];
    if (selectedSkillNames.length > 0) {
      try {
        const selectedSkillRows = sqliteDb
          .select()
          .from(skills)
          .all()
          .filter((skill: any) => selectedSkillNames.includes(skill?.name?.toLowerCase()) || selectedSkillNames.includes(skill?.id?.toLowerCase()));

        if (selectedSkillRows.length > 0) {
          const skillsContext = selectedSkillRows
            .map((skill: any) => `### Skill: ${skill.name}\n${skill.description ? `*${skill.description}*\n` : ''}${skill.content || ''}`)
            .join('\n\n');
          activeSystemPrompt += `\n\n<active_skills>\nFollow these user-selected skills for this response:\n${skillsContext}\n</active_skills>\n`;
        }
      } catch (error) {
        console.error('Failed to load selected CheapChats skills:', error);
      }
    }

    // 1. Manage SQLite Conversation
    let currentConvId = conversationId;
    const userId = 'guest_user';

    if (!isIncognito) {
      if (!currentConvId) {
        currentConvId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const shortTitle = message.slice(0, 35) + (message.length > 35 ? '...' : '');
        try {
          sqliteDb.insert(conversations).values({
            id: currentConvId,
            userId,
            title: shortTitle,
            model,
            provider,
            isPinned: 0,
            isBookmarked: 0,
            isIncognito: 0,
            createdAt: startTime,
            updatedAt: startTime,
          }).run();
        } catch (e) {
          console.warn('Could not insert new conversation in sqlite:', e);
        }
      }

      // Insert User message
      try {
        sqliteDb.insert(messages).values({
          id: `msg_u_${Date.now()}`,
          conversationId: currentConvId,
          sender: 'user',
          content: message,
          model,
          provider,
          tokens: Math.ceil(message.length / 4),
          cost: 0,
          createdAt: startTime,
        }).run();
      } catch (e) {
        console.warn('Could not insert user message in sqlite:', e);
      }
    }

    // 2. Fetch provider record from CheapRouter Postgres DB
    let provRow: any = null;
    try {
      if (providerId) {
        const rows = await pgDb`SELECT * FROM admin_providers WHERE id = ${providerId} LIMIT 1`;
        if (rows.length > 0) provRow = rows[0];
      }
      if (!provRow) {
        const rows = await pgDb`SELECT * FROM admin_providers WHERE LOWER(name) = LOWER(${provider}) LIMIT 1`;
        if (rows.length > 0) provRow = rows[0];
      }
    } catch (e) {
      console.warn('Could not fetch provider from pgDb:', e);
    }

    // 3. Resolve key: User's BYOK key takes precedence; fallback to admin root key if available
    let activeKey = userApiKey?.trim();
    if (!activeKey && provRow?.key) {
      // Pick first active key from admin configuration
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

    // 4. Build message payload
    const formattedMessages: any[] = [
      { role: 'system', content: activeSystemPrompt },
    ];

    // Load recent SQLite message history if conversation exists
    if (currentConvId && !isIncognito) {
      try {
        const prev = sqliteDb
          .select()
          .from(messages)
          .where(eq(messages.conversationId, currentConvId))
          .all();
        const limit = typeof rollingWindowLimit === 'number' && rollingWindowLimit > 0 ? rollingWindowLimit : 20;
        const recent = prev.slice(-limit);
        for (const m of recent) {
          if (m.sender === 'user' || m.sender === 'assistant') {
            formattedMessages.push({
              role: m.sender,
              content: m.content || '',
            });
          }
        }
      } catch {}
    } else {
      formattedMessages.push({ role: 'user', content: message });
    }

    // If activeKey is available, stream directly from the upstream provider!
    const apiFormat = (provRow?.api_format || 'openai').toLowerCase();
    const baseUrl = provRow?.base_url;
    const effectiveTargetUrl = (apiFormat === 'anthropic' || provider.toLowerCase().includes('anthropic'))
      ? (baseUrl ? `${baseUrl.replace(/\/+$/, '')}/v1/messages` : 'https://api.anthropic.com/v1/messages')
      : getOpenAIFormatUrl(baseUrl);

    const sanitizedRequestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': activeKey ? `Bearer ${activeKey.slice(0, 4)}...${activeKey.slice(-4)}` : 'None',
    };

    // Upstream streaming handler
    let upstreamRes: Response | null = null;

    if (apiFormat === 'anthropic' || provider.toLowerCase().includes('anthropic')) {
      const anthropicMessages = formattedMessages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      upstreamRes = await fetch(effectiveTargetUrl, {
        method: 'POST',
        headers: {
          'x-api-key': activeKey || '',
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.replace(/^anthropic\//, ''),
          system: systemPrompt,
          messages: anthropicMessages,
          stream: true,
          temperature: typeof temperature === 'number' ? temperature : 0.7,
          max_tokens: 4096,
        }),
      });
    } else {
      // Standard OpenAI / OpenAI-compatible format
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (activeKey) {
        headers['Authorization'] = `Bearer ${activeKey}`;
      }
      if (provRow?.headers && Array.isArray(provRow.headers)) {
        for (const h of provRow.headers) {
          if (h.key && h.value) headers[h.key] = h.value;
        }
      }

      console.log(`[CheapChats] Proxying to ${effectiveTargetUrl} with model: ${model}`);
      upstreamRes = await fetch(effectiveTargetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model.includes('/') && !effectiveTargetUrl.includes('openrouter') ? model.split('/').pop() : model,
          messages: formattedMessages,
          stream: true,
          temperature: typeof temperature === 'number' ? temperature : 0.7,
          max_tokens: 4096,
        }),
      });
    }

    if (!upstreamRes || !upstreamRes.ok || !upstreamRes.body) {
      const errText = await upstreamRes?.text().catch(() => '');
      let errMsg = `Upstream provider error (${upstreamRes?.status || 500})`;
      try {
        const j = JSON.parse(errText || '{}');
        errMsg = j.error?.message || j.message || errMsg;
      } catch {}

      if (!activeKey) {
        errMsg = `Please configure your API key for ${provider} in Settings → Providers.`;
      }

      console.warn('[CheapChats] Upstream Error:', upstreamRes?.status, errMsg);

      const upstreamStatus = upstreamRes?.status || 500;
      const upstreamStatusText = upstreamRes?.statusText || (upstreamStatus === 401 ? 'Unauthorized' : upstreamStatus === 429 ? 'Too Many Requests' : 'Error');
      const upstreamHeaders = upstreamRes ? Object.fromEntries(upstreamRes.headers.entries()) : {};

      let errorReason = `Upstream request to ${provider} failed (${upstreamStatus})`;
      if (!activeKey) {
        errorReason = `No API key configured for provider '${provider}'. Add your key in Settings → Providers.`;
      } else if (upstreamStatus === 401) {
        errorReason = `API key for '${provider}' was rejected (401 Unauthorized). Please verify your key.`;
      } else if (upstreamStatus === 429) {
        errorReason = `Rate limit exceeded or insufficient credits on '${provider}' (429 Too Many Requests).`;
      } else if (upstreamStatus === 404) {
        errorReason = `Model '${model}' or endpoint not found on '${provider}' (404 Not Found).`;
      } else if (errText) {
        errorReason = errMsg;
      }

      const debugInfo = {
        timestamp: new Date().toLocaleTimeString(),
        endpoint: '/api/cheapchats/chat',
        method: 'POST',
        model,
        provider,
        baseUrl: effectiveTargetUrl,
        statusCode: upstreamStatus,
        statusText: upstreamStatusText,
        statusState: 'error',
        latencyMs: Date.now() - startTime,
        tokens: 0,
        promptTokens: Math.ceil(JSON.stringify(formattedMessages).length / 4),
        completionTokens: 0,
        cost: 0,
        temperature: 0.7,
        rawSystemPrompt: systemPrompt,
        rawMessages: formattedMessages,
        userMessage: message,
        attachments,
        requestHeaders: sanitizedRequestHeaders,
        responseHeaders: upstreamHeaders,
        requestPayload: {
          model,
          provider,
          messagesCount: formattedMessages.length,
          stream: true,
        },
        rawResponse: errText || errMsg,
        errorCode: upstreamStatus,
        errorText: errMsg,
        errorReason,
      };

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                token: `⚠️ **${provider} Error**: ${errMsg}`,
                error: true,
                canRetry: true,
                conversationId: currentConvId,
                debug: debugInfo,
              })}\n\n`
            )
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                error: true,
                conversationId: currentConvId,
                debug: debugInfo,
              })}\n\n`
            )
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Stream the SSE body back to client
    const encoder = new TextEncoder();
    const reader = upstreamRes.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    const assistantMsgId = `msg_a_${Date.now()}`;

    const stream = new ReadableStream({
      async start(controller) {
        let carryOver = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = (carryOver + chunk).split('\n');
            carryOver = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === 'data: [DONE]') continue;
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.slice(6).trim();
                try {
                  const parsed = JSON.parse(dataStr);
                  // OpenAI delta
                  const deltaText =
                    parsed.choices?.[0]?.delta?.content ||
                    parsed.choices?.[0]?.text ||
                    parsed.delta?.text || // Anthropic
                    '';

                  if (deltaText) {
                    fullContent += deltaText;
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          token: deltaText,
                          conversationId: currentConvId,
                        })}\n\n`
                      )
                    );
                  }
                } catch {}
              }
            }
          }

          const endTime = Date.now();
          const latency = endTime - startTime;
          const tokens = Math.ceil(fullContent.length / 4);

          // Save assistant message in SQLite
          if (!isIncognito && currentConvId && fullContent) {
            try {
              sqliteDb.insert(messages).values({
                id: assistantMsgId,
                conversationId: currentConvId,
                sender: 'assistant',
                content: fullContent,
                model,
                provider,
                tokens,
                cost: 0,
                createdAt: endTime,
              }).run();

              sqliteDb.update(conversations)
                .set({ updatedAt: endTime })
                .where(eq(conversations.id, currentConvId))
                .run();
            } catch (e) {
              console.warn('Could not save assistant message in sqlite:', e);
            }
          }

          const promptTokens = Math.ceil(JSON.stringify(formattedMessages).length / 4);
          const upstreamHeaders = upstreamRes ? Object.fromEntries(upstreamRes.headers.entries()) : {};

          const successDebugInfo = {
            timestamp: new Date().toLocaleTimeString(),
            endpoint: '/api/cheapchats/chat',
            method: 'POST',
            model,
            provider,
            baseUrl: effectiveTargetUrl,
            statusCode: upstreamRes?.status || 200,
            statusText: upstreamRes?.statusText || 'OK',
            statusState: 'completed',
            latencyMs: latency,
            tokens: promptTokens + tokens,
            promptTokens,
            completionTokens: tokens,
            cost: 0,
            temperature: typeof temperature === 'number' ? temperature : 0.7,
            contextWindow: String(contextWindow || '128k'),
            rawSystemPrompt: systemPrompt,
            rawMessages: formattedMessages,
            userMessage: message,
            attachments,
            requestHeaders: sanitizedRequestHeaders,
            responseHeaders: upstreamHeaders,
            requestPayload: {
              model,
              provider,
              messagesCount: formattedMessages.length,
              stream: true,
              temperature,
              contextWindow,
            },
            rawResponse: fullContent,
          };

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                latency,
                tokens,
                conversationId: isIncognito ? null : currentConvId,
                debug: successDebugInfo,
              })}\n\n`
            )
          );
          controller.close();
        } catch (err: any) {
          console.error('[CheapChats] Stream reading error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[CheapChats] Chat error:', error);
    return NextResponse.json({ error: error.message || 'Chat completion failed' }, { status: 500 });
  }
}
