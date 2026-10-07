import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_PROVIDER_BASE_URLS: Record<string, string> = {
  ap_openai: 'https://api.openai.com/v1',
  ap_anthropic: 'https://api.anthropic.com/v1',
  ap_groq: 'https://api.groq.com/openai/v1',
  ap_openrouter: 'https://openrouter.ai/api/v1',
  ap_opencode: 'https://opencode.ai/api/v1',
  ap_deepseek: 'https://api.deepseek.com',
  ap_together: 'https://api.together.xyz/v1',
  ap_cerebras: 'https://api.cerebras.ai/v1',
  ap_sambanova: 'https://api.sambanova.ai/v1',
  ap_xai: 'https://api.x.ai/v1',
  ap_mistral: 'https://api.mistral.ai/v1',
  ap_cohere: 'https://api.cohere.ai/v1',
  ap_novita: 'https://api.novita.ai/v3/openai',
  ap_fireworks: 'https://api.fireworks.ai/inference/v1',
  ap_perplexity: 'https://api.perplexity.ai',
  ap_siliconflow: 'https://api.siliconflow.cn/v1',
  ap_hyperbolic: 'https://api.hyperbolic.xyz/v1',
  ap_moonshot: 'https://api.moonshot.cn/v1',
  ap_stepfun: 'https://api.stepfun.com/v1',
  ap_nvidia: 'https://integrate.api.nvidia.com/v1',
};

// Default high-contrast demo calendar/chart SVG data url for reliable vision tests
const DEMO_VISION_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400';

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const {
      providerId,
      originalId,
      model,
      key,
      baseUrl,
      testType = 'text',
      prompt,
      imageUrl,
      headers: customHeaders
    } = body;

    const targetModel = originalId || model || 'gpt-4o-mini';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('authorization') || '';

    let apiKey = key || '';
    let finalBaseUrl = baseUrl || (providerId ? DEFAULT_PROVIDER_BASE_URLS[providerId] : '') || '';

    if (!apiKey || apiKey.includes('••••')) {
      if (providerId === 'ap_openrouter' || providerId === 'openrouter') {
        const res = await fetch(`${backendUrl}/api/admin/openrouter`, {
          headers: { 'Authorization': authHeader }
        });
        if (res.ok) {
          const data = await res.json();
          apiKey = apiKey || data.key;
          finalBaseUrl = finalBaseUrl || 'https://openrouter.ai/api/v1';
        }
      } else {
        const res = await fetch(`${backendUrl}/api/admin/providers`, {
          headers: { 'Authorization': authHeader }
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.providers || []);
          const prov = list.find((p: any) => p.id === providerId);
          if (prov) {
            apiKey = apiKey || prov.key;
            finalBaseUrl = finalBaseUrl || prov.base_url || prov.baseUrl || '';
          }
        }
      }
    }

    if (!apiKey || apiKey.includes('••••')) {
      return NextResponse.json({
        ok: false,
        status: 401,
        message: 'API Key is missing or not provided.'
      });
    }

    let actualKey = apiKey;
    try {
      const parsed = JSON.parse(apiKey);
      if (Array.isArray(parsed) && parsed.length > 0) {
        actualKey = parsed.find((k: any) => k.active !== false)?.key || parsed[0]?.key || apiKey;
      }
    } catch {
      actualKey = apiKey;
    }

    if (!finalBaseUrl && providerId) {
      finalBaseUrl = DEFAULT_PROVIDER_BASE_URLS[providerId] || '';
    }

    const cleanBaseUrl = (finalBaseUrl || 'https://openrouter.ai/api/v1').replace(/\/+$/, '');
    const isAnthropic = providerId === 'ap_anthropic' || cleanBaseUrl.includes('anthropic.com');

    // Build headers
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (isAnthropic) {
      reqHeaders['x-api-key'] = actualKey;
      reqHeaders['anthropic-version'] = '2023-06-01';
    } else {
      reqHeaders['Authorization'] = `Bearer ${actualKey}`;
    }

    if (customHeaders && typeof customHeaders === 'object') {
      if (Array.isArray(customHeaders)) {
        customHeaders.forEach((h: any) => {
          if (h.key && h.value) reqHeaders[h.key] = h.value;
        });
      } else {
        Object.assign(reqHeaders, customHeaders);
      }
    }

    const userPrompt = String(prompt || '').trim() || (
      testType === 'image'
        ? 'A vibrant digital artwork of an abstract glowing cosmic nebula'
        : testType === 'vision'
          ? 'Tell me what is shown in this image. Describe its main colors and elements.'
          : 'Hello! Please introduce yourself in one short sentence.'
    );

    const targetImgUrl = String(imageUrl || '').trim() || DEMO_VISION_IMAGE;

    // Build payload according to testType
    let targetUrl = '';
    let payload: any = {};

    if (isAnthropic) {
      targetUrl = `${cleanBaseUrl}/messages`;
      if (testType === 'vision') {
        payload = {
          model: targetModel,
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: targetImgUrl
                }
              }
            ]
          }]
        };
      } else {
        payload = {
          model: targetModel,
          max_tokens: 300,
          messages: [{ role: 'user', content: userPrompt }]
        };
      }
    } else if (testType === 'image') {
      targetUrl = `${cleanBaseUrl}/images/generations`;
      payload = {
        prompt: userPrompt,
        n: 1,
        size: '512x512'
      };
    } else if (testType === 'vision') {
      targetUrl = `${cleanBaseUrl}/chat/completions`;
      payload = {
        model: targetModel,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            {
              type: 'image_url',
              image_url: {
                url: targetImgUrl
              }
            }
          ]
        }],
        max_tokens: 300
      };
    } else {
      // Default: text chat completion
      targetUrl = `${cleanBaseUrl}/chat/completions`;
      payload = {
        model: targetModel,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 300
      };
    }

    const testRes = await fetch(targetUrl, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (testRes.ok) {
      let previewText = '';
      let generatedImgUrl = '';
      try {
        const json = await testRes.json();
        if (json?.choices?.[0]?.message?.content) {
          previewText = json.choices[0].message.content;
        } else if (json?.content?.[0]?.text) {
          previewText = json.content[0].text;
        } else if (json?.data?.[0]?.url) {
          generatedImgUrl = json.data[0].url;
          previewText = 'Image generated successfully';
        } else if (json?.data?.[0]?.b64_json) {
          generatedImgUrl = `data:image/png;base64,${json.data[0].b64_json}`;
          previewText = 'Image generated successfully';
        } else {
          previewText = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
        }
      } catch {
        previewText = 'Response received (OK)';
      }

      return NextResponse.json({
        ok: true,
        status: 200,
        message: `${testType.toUpperCase()} test completed in ${latencyMs}ms`,
        preview: previewText,
        generatedImageUrl: generatedImgUrl || undefined,
        latencyMs
      });
    } else {
      let errDetail = '';
      try {
        const errJson = await testRes.json();
        errDetail = errJson?.error?.message || errJson?.message || JSON.stringify(errJson);
      } catch {
        errDetail = await testRes.text().catch(() => '');
      }

      return NextResponse.json({
        ok: false,
        status: testRes.status,
        message: `HTTP ${testRes.status}: ${errDetail.slice(0, 300) || testRes.statusText}`,
        latencyMs
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      status: 500,
      message: error?.message || 'Connection Error',
      latencyMs: Date.now() - startTime
    }, { status: 500 });
  }
}
