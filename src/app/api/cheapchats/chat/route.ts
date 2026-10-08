import { NextResponse } from 'next/server';
import { db as chatDb } from '../../../../../cheapchats/backend/db';
import { conversations, messages, skills } from '../../../../../cheapchats/backend/db/schema';
import { db as pgDb } from '../../../../../backend/src/db';
import { eq, desc, asc } from 'drizzle-orm';
import { getSession } from '../../../../../cheapchats/backend/lib/auth';
import {
  readWebPageWithReach,
  searchWebWithReach,
  getYoutubeTranscriptWithReach,
} from '../../../../../cheapchats/backend/lib/agentReachService';
import {
  browsePage,
  captureScreenshot,
  searchYouTubeWithPlaywright,
} from '../../../../../cheapchats/backend/lib/playwrightService';

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
      tools = {},
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
        const allSkills = await chatDb.select().from(skills);
        const selectedSkillRows = allSkills
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

    // 1. Manage PostgreSQL Conversation with unified user
    const session = await getSession();
    const currentUserId = session?.id || 'usr_user1';
    let currentConvId = conversationId;

    if (!isIncognito) {
      if (!currentConvId) {
        currentConvId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const shortTitle = message.slice(0, 35) + (message.length > 35 ? '...' : '');
        try {
          await chatDb.insert(conversations).values({
            id: currentConvId,
            userId: currentUserId,
            title: shortTitle,
            model,
            provider,
            isPinned: 0,
            isBookmarked: 0,
            isIncognito: 0,
            createdAt: startTime,
            updatedAt: startTime,
          });
        } catch (e) {
          console.warn('Could not insert new conversation in postgres:', e);
        }
      }

      // Insert User message
      try {
        await chatDb.insert(messages).values({
          id: `msg_u_${Date.now()}`,
          conversationId: currentConvId,
          sender: 'user',
          content: message,
          model,
          provider,
          tokens: Math.ceil(message.length / 4),
          cost: 0,
          createdAt: startTime,
        });
      } catch (e) {
        console.warn('Could not insert user message in postgres:', e);
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

    // =========================================================================
    // AGENT REACH, PLAYWRIGHT WEB AUTOMATION, YOUTUBE & SEARCH INTEGRATION
    // =========================================================================
    activeSystemPrompt += `\n\n<web_automation_and_agent_reach>
You are equipped with live web automation, multi-engine search, and browser control:
1. Playwright Browser Automation:
   - Headless Chromium execution for real-time web crawling and snapshots.
   - Tag: <cheapchatAgent action="playwright_browse" data="https://target-url.com" />
   - Tag: <cheapchatAgent action="playwright_screenshot" data="https://target-url.com" />

2. Agent Reach Multi-Engine Search & Tier 1 Reader (Jina Reader):
   - Fast, clean, zero-fee markdown reader (Jina Reader at r.jina.ai) and multi-engine live search (DuckDuckGo, Bing, Tavily, Wikipedia, CoinGecko).
   - Tag: <cheapchatAgent action="web_search" data="search query here" />
   - Tag: <cheapchatAgent action="agent_reach" data="https://target-url.com" />

3. Browser Tab Opening & YouTube Playback:
   - When the user asks to open a website tab, open YouTube, or search & play a video:
   - Tag: <cheapchatAgent action="open_browser" data="https://target-url.com" />
   - For YouTube: <cheapchatAgent action="open_browser" data="https://www.youtube.com/watch?v=..." />
   - This tag automatically commands the user's browser to launch the tab immediately!
</web_automation_and_agent_reach>\n`;

    // 1. LIVE URL EXTRACTION (Jina Reader / YouTube Transcript)
    const urlMatch = message.match(/https?:\/\/[^\s<>'"]+/i);
    if (urlMatch) {
      const targetUrl = urlMatch[0];
      try {
        console.log('[AGENT REACH] Live extracting URL:', targetUrl);
        const isYoutube = /youtube\.com|youtu\.be/i.test(targetUrl);
        const scrapeResult = isYoutube
          ? await getYoutubeTranscriptWithReach(targetUrl)
          : await readWebPageWithReach(targetUrl);

        if (scrapeResult && scrapeResult.success && scrapeResult.markdown) {
          activeSystemPrompt += `\n\n<agent_reach_scraped_content url="${targetUrl}" source="${scrapeResult.source}">
Title: ${scrapeResult.title || targetUrl}
Content:
${scrapeResult.markdown}
</agent_reach_scraped_content>\n`;
        }
      } catch (err) {
        console.warn('[AGENT REACH] Scrape URL failed:', err);
      }
    }

    // 2. YOUTUBE SEARCH & PLAYBACK (e.g. "youtube pe lofi music search karo aur 3rd video play kar do", "koi bhi video play kar do", "youtube ka tab khol do")
    const isYouTubeGeneralOpen =
      /\byoutube\b/i.test(message) &&
      /\b(tab|kholo|open|khol)\b/i.test(message) &&
      !/\b(search|dhoondo|find|video|song|gaana|play|3rd|third|teesri|2nd|second|doosri|1st|first|pehli)\b/i.test(message);

    const isYouTubeSearchAndPlay =
      (/\byoutube\b/i.test(message) &&
        /\b(search|dhoondo|play|chalao|video|song|gaana|kholo|tab|third|teesri|teesra|first|pehli|pehla|second|doosri|doosra|3rd|1st|2nd|koi bhi|any)\b/i.test(
          message
        )) ||
      (/\b(video|gaana|song)\b/i.test(message) &&
        /\b(play|chalao|search|dhoondo|kholo|third|teesri|teesra|3rd)\b/i.test(message));

    if (isYouTubeGeneralOpen) {
      activeSystemPrompt += `\n\n<youtube_action_instruction>
The user requested to open YouTube in a new browser tab.
You MUST output this exact XML tag:
<cheapchatAgent action="open_browser" data="https://www.youtube.com" />
Confirm to the user in fluent Roman Urdu / English that the YouTube tab has been opened.
</youtube_action_instruction>\n`;
    } else if (isYouTubeSearchAndPlay) {
      let ytQuery = message
        .replace(/https?:\/\/[^\s]+/gi, '')
        .replace(
          /\b(youtube|par|pe|mein|kholo|open|khol|do|dhoondo|search|karke|kar do|kardo|play|chalao|video|song|gaana|tab|aur|bhi|koi|any|third|teesri|teesra|first|pehli|pehla|second|doosri|doosra|fourth|chauthi|1st|2nd|3rd|4th)\b/gi,
          ' '
        )
        .replace(/\s+/g, ' ')
        .trim();

      if (!ytQuery) {
        ytQuery = message.replace(/https?:\/\/[^\s]+/gi, '').trim();
      }

      console.log('[Playwright YouTube] Searching YouTube for:', ytQuery);
      try {
        const ytVideos = await searchYouTubeWithPlaywright(ytQuery, 5);
        if (ytVideos && ytVideos.length > 0) {
          let targetIndex = 0;
          let ordinalLabel = '1st Video';
          if (/\b(third|3rd|teesri|teesra|3)\b/i.test(message)) {
            targetIndex = 2;
            ordinalLabel = '3rd Video (Teesri Video)';
          } else if (/\b(second|2nd|doosri|doosra|2)\b/i.test(message)) {
            targetIndex = 1;
            ordinalLabel = '2nd Video (Doosri Video)';
          } else if (/\b(fourth|4th|chauthi|chautha|4)\b/i.test(message)) {
            targetIndex = 3;
            ordinalLabel = '4th Video (Chauthi Video)';
          } else if (/\b(fifth|5th|panchwi|5)\b/i.test(message)) {
            targetIndex = 4;
            ordinalLabel = '5th Video (Panchwi Video)';
          } else if (/\b(first|1st|pehli|pehla|1)\b/i.test(message)) {
            targetIndex = 0;
            ordinalLabel = '1st Video (Pehli Video)';
          }

          const selectedVideo = ytVideos[targetIndex] || ytVideos[0];
          activeSystemPrompt += `\n\n<youtube_search_and_playback>
YouTube Search Query: "${ytQuery}"
Requested Target: ${ordinalLabel}
Selected Video:
- Title: "${selectedVideo.title}"
- URL: "${selectedVideo.link}"
- Video ID: "${selectedVideo.videoId || ''}"

Found Search Results:
${ytVideos.map((v, idx) => `${idx + 1}. [${v.title}](${v.link})`).join('\n')}

MANDATORY INSTRUCTIONS FOR ASSISTANT:
1. To automatically launch and play this video in the user's browser, you MUST output this XML tag:
   <cheapchatAgent action="open_browser" data="${selectedVideo.link}" />
2. State clearly in natural Roman Urdu or English:
   "Maine YouTube par '${selectedVideo.title}' (${ordinalLabel}) play karne ke liye tab open kar diya hai."
3. Include the direct clickable link [${selectedVideo.title}](${selectedVideo.link}) so the user can easily click or view it.
</youtube_search_and_playback>\n`;
        }
      } catch (err) {
        console.warn('[Playwright YouTube] Search failed:', err);
      }
    }

    // 3. MULTI-ENGINE WEB SEARCH (DuckDuckGo, Bing, Tavily, Wikipedia, CoinGecko)
    const isExplicitSearchRequest =
      Boolean(tools?.webSearch) ||
      (/\b(search|dhoondo|find|latest|news|google|khabar|update|taza|playwright|agent reach|scrape|live|price|rate|bhao|result|nikal|nikalo|check|current|today|bitcoin|crypto|nvidia|browse|fetch)\b/i.test(
        message
      ) &&
        !isYouTubeSearchAndPlay &&
        !isYouTubeGeneralOpen);

    if (isExplicitSearchRequest && !urlMatch) {
      try {
        const cleanedQuery = message.replace(/https?:\/\/[^\s]+/gi, '').trim();
        if (cleanedQuery) {
          console.log('[AGENT REACH] Executing web search for:', cleanedQuery);
          const searchData = await searchWebWithReach(cleanedQuery, 5);
          if (searchData.results && searchData.results.length > 0) {
            const wantsTabOpened = /\b(tab|kholo|open|browser)\b/i.test(message);
            const topLink = searchData.results[0]?.link;

            activeSystemPrompt += `\n\n<web_search_results engine="${searchData.source}">
Query: "${cleanedQuery}"
${searchData.summary ? `Summary: ${searchData.summary}\n` : ''}
Results:
${searchData.results.map((r: any) => `- **${r.title}** (${r.link})\n  ${r.snippet}`).join('\n')}
${
  wantsTabOpened && topLink
    ? `\nINSTRUCTION: The user asked to open the tab. Include the XML tag: <cheapchatAgent action="open_browser" data="${topLink}" /> to open the top result in a new tab.\n`
    : ''
}
</web_search_results>\n`;
          }
        }
      } catch (err) {
        console.warn('[AGENT REACH] Web search failed:', err);
      }
    }

    // 4. OPEN TAB INSTRUCTION FOR POPULAR SERVICES
    const tabMatch =
      message.match(/\b(open|kholo|tab)\b.*\b(google|github|twitter|x|reddit|bing|wikipedia|facebook|instagram)\b/i) ||
      message.match(/\b(google|github|twitter|x|reddit|bing|wikipedia|facebook|instagram)\b.*\b(tab|kholo|open)\b/i);
    if (tabMatch && !isYouTubeGeneralOpen && !isYouTubeSearchAndPlay) {
      const site = tabMatch[0].toLowerCase();
      let targetSiteUrl = 'https://www.google.com';
      if (site.includes('github')) targetSiteUrl = 'https://github.com';
      else if (site.includes('twitter') || site.includes(' x ')) targetSiteUrl = 'https://x.com';
      else if (site.includes('reddit')) targetSiteUrl = 'https://reddit.com';
      else if (site.includes('bing')) targetSiteUrl = 'https://bing.com';
      else if (site.includes('wikipedia')) targetSiteUrl = 'https://wikipedia.org';

      activeSystemPrompt += `\n\n<open_tab_instruction>
The user requested to open ${targetSiteUrl} in browser.
Output this tag: <cheapchatAgent action="open_browser" data="${targetSiteUrl}" />
Confirm to the user that the tab has been opened.
</open_tab_instruction>\n`;
    }

    // 5. Build message payload
    const formattedMessages: any[] = [
      { role: 'system', content: activeSystemPrompt },
    ];

    // Load recent PostgreSQL message history if conversation exists
    if (currentConvId && !isIncognito) {
      try {
        const prev = await chatDb
          .select()
          .from(messages)
          .where(eq(messages.conversationId, currentConvId))
          .orderBy(asc(messages.createdAt));
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
          system: activeSystemPrompt,
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

          // Save assistant message in PostgreSQL
          if (!isIncognito && currentConvId && fullContent) {
            try {
              await chatDb.insert(messages).values({
                id: assistantMsgId,
                conversationId: currentConvId,
                sender: 'assistant',
                content: fullContent,
                model,
                provider,
                tokens,
                cost: 0,
                createdAt: endTime,
              });

              await chatDb.update(conversations)
                .set({ updatedAt: endTime })
                .where(eq(conversations.id, currentConvId));
            } catch (e) {
              console.warn('Could not save assistant message in postgres:', e);
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
