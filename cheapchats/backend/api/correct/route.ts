import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { globalConfig } from "@cheapchats/backend/db/schema";
import { eq } from "drizzle-orm";

function getOpenRouterModelId(model: string, provider: string): string {
  if (!model) return "openrouter/free";
  if (model.includes("openrouter/")) {
    return model.replace("openrouter/", "");
  }

  const m = model.toLowerCase();
  if (m.includes("llama-3.1-8b-instruct:free")) return "openrouter/free";
  if (m.includes("gpt-4o-mini")) return "openai/gpt-4o-mini";
  if (m.includes("gpt-4o")) return "openrouter/free";
  if (m.includes("google/gemma-2-9b-it:free")) return "openrouter/free";
  if (m.includes("gpt-4-turbo") || m.includes("gpt-4")) return "openai/gpt-4-turbo";
  if (m.includes("o1")) return "openai/o1-preview";

  if (m.includes("claude-3-5-sonnet") || m.includes("claude-3.5-sonnet") || m.includes("sonnet")) return "anthropic/claude-sonnet-4.6";
  if (m.includes("claude-3-5-haiku") || m.includes("claude-3.5-haiku") || m.includes("haiku")) return "anthropic/claude-3-haiku";
  if (m.includes("claude-3-opus") || m.includes("opus")) return "anthropic/claude-opus-4.7";

  if (m.includes("gemini-1.5-pro") || m.includes("gemini-2.5-pro") || m.includes("gemini-pro")) return "google/gemini-2.5-pro";
  if (m.includes("gemini-1.5-flash") || m.includes("gemini-2.5-flash") || m.includes("gemini-flash")) return "google/gemini-2.5-flash";

  if (m.includes("deepseek")) return "deepseek/deepseek-r1";
  if (m.includes("llama")) return "meta-llama/llama-3.3-70b-instruct";

  if (provider === "OpenAI") return `openai/${model}`;
  if (provider === "Anthropic") return `anthropic/${model}`;
  if (provider === "Google Gemini" || provider === "Google") return `google/${model}`;

  return "openrouter/free";
}

export async function POST(req: Request) {
  try {
    const { text, model = "openai/gpt-4o", provider = "OpenRouter" } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required for correction" }, { status: 400 });
    }

    const getConfigKey = (keyName: string) => {
      try {
        const entry = db.select().from(globalConfig).where(eq(globalConfig.key, keyName)).get();
        return process.env[keyName] || (entry?.value || "");
      } catch {
        return process.env[keyName] || "";
      }
    };

    const openrouterApiKey = getConfigKey("OPENROUTER_API_KEY");
    const openaiApiKey = getConfigKey("OPENAI_API_KEY");
  const customApiEndpoint = getConfigKey("CUSTOM_API_ENDPOINT");
    const customApiKey = getConfigKey("CUSTOM_API_KEY");

    const systemPrompt = `You are an expert writing and grammar assistant. Fix all grammatical mistakes, spelling errors, awkward phrasing, typos, and punctuation in the user's text while preserving the exact meaning, intent, tone, and language (English, Urdu, Roman Urdu, etc.).
RULES:
1. Output ONLY the corrected text.
2. Do NOT add any quotes around the output.
3. Do NOT add greetings, explanations, notes, or markdown fences.`;

    // 1. Custom API Provider
    if ((provider === "Custom API" || (!openrouterApiKey && !openaiApiKey)) && customApiEndpoint) {
      try {
        let completionsUrl = customApiEndpoint.trim();
        if (completionsUrl.endsWith("/models")) {
          completionsUrl = completionsUrl.replace(/\/models$/, "/chat/completions");
        } else if (completionsUrl.endsWith("/v1")) {
          completionsUrl = `${completionsUrl}/chat/completions`;
        } else if (!completionsUrl.endsWith("/chat/completions") && !completionsUrl.endsWith("/completions")) {
          completionsUrl = completionsUrl.replace(/\/+$/, "") + "/v1/chat/completions";
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (customApiKey && customApiKey.trim()) {
          headers["Authorization"] = `Bearer ${customApiKey.trim()}`;
        }

        const res = await fetch(completionsUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: model || "default",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text.trim() },
            ],
            max_tokens: 2000,
            temperature: 0.3,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const correctedText = data.choices?.[0]?.message?.content?.trim();
          if (correctedText) {
            return NextResponse.json({ success: true, correctedText });
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || errData.message || `Custom API error (HTTP ${res.status})`;
          return NextResponse.json({
            success: false,
            error: errMsg,
            errorType: "model_error",
            provider,
            model,
          }, { status: 502 });
        }
      } catch (err: any) {
        console.warn("Custom API connection error in /api/correct:", err);
        return NextResponse.json({
          success: false,
          error: "Network error: Unable to connect to model endpoint. Please check your connection or choose another model.",
          errorType: "network_error",
          provider,
          model,
        }, { status: 503 });
      }
    }

    // 2. OpenRouter / OpenAI Provider
    const activeApiKey = openrouterApiKey || openaiApiKey;
    const isDirectOpenAI = !openrouterApiKey && !!openaiApiKey;

    if (activeApiKey) {
      try {
        let targetModel = model;
        if (isDirectOpenAI) {
          if (targetModel.includes("/")) targetModel = targetModel.split("/")[1];
          const validOpenAIModels = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"];
          if (!validOpenAIModels.includes(targetModel)) targetModel = "gpt-4o-mini";
        } else {
          targetModel = getOpenRouterModelId(model, provider);
        }

        const apiUrl = isDirectOpenAI
          ? "https://api.openai.com/v1/chat/completions"
          : "https://openrouter.ai/api/v1/chat/completions";

        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${activeApiKey.trim()}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "CheapChat",
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text.trim() },
            ],
            max_tokens: 2000,
            temperature: 0.3,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const correctedText = data.choices?.[0]?.message?.content?.trim();
          if (correctedText) {
            return NextResponse.json({ success: true, correctedText });
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `Provider returned HTTP ${res.status}`;
          return NextResponse.json({
            success: false,
            error: errMsg,
            errorType: "model_error",
            provider,
            model: targetModel,
          }, { status: 502 });
        }
      } catch (err: any) {
        console.warn("OpenRouter API error in /api/correct:", err);
        return NextResponse.json({
          success: false,
          error: "Network error: Unable to connect to OpenRouter. Please try again or choose a different model.",
          errorType: "network_error",
          provider,
          model,
        }, { status: 503 });
      }
    }

    // 3. Fallback heuristic correction if offline or keys not configured
    // Clean spaces, capitalization, common typos
    let cleaned = text.trim();
    cleaned = cleaned.replace(/\s+/g, " ");
    cleaned = cleaned.replace(/\b(teh)\b/gi, "the")
      .replace(/\b(i)\b/g, "I")
      .replace(/\b(dont)\b/gi, "don't")
      .replace(/\b(cant)\b/gi, "can't")
      .replace(/\b(wont)\b/gi, "won't")
      .replace(/\b(im)\b/gi, "I'm");
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    return NextResponse.json({ success: true, correctedText: cleaned });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to correct text",
      errorType: "unknown_error",
    }, { status: 500 });
  }
}
