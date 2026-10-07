import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { globalConfig } from "@cheapchats/backend/db/schema";
import { providerEndpoints } from "@cheapchats/backend/db/schema";
import { eq } from "drizzle-orm";
import { and } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description?: string;
  contextLength?: number;
  isPopular?: boolean;
}

const DEFAULT_MODELS_BY_PROVIDER: Record<string, ModelOption[]> = {
  OpenRouter: [
    { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenRouter", description: "Fast, intelligent flagship multimodal model", isPopular: true },
    { id: "anthropic/claude-sonnet-4.6", name: "Claude Sonnet 4.6", provider: "OpenRouter", description: "Most intelligent Anthropic model for code & analysis", isPopular: true },
    { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "OpenRouter", description: "Next-gen high speed multimodal model", isPopular: true },
    { id: "deepseek/deepseek-r1", name: "DeepSeek R1", provider: "OpenRouter", description: "Open reasoning model competing with o1", isPopular: true },
    { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "OpenRouter", description: "Flagship open weights model by Meta" },
  ],
  OpenAI: [
    { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", description: "High-intelligence flagship model for complex tasks", isPopular: true },
    { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", description: "Affordable & fast lightweight model", isPopular: true },
    { id: "openai/o1-preview", name: "o1-preview", provider: "OpenAI", description: "Reasoning model for hard problems" },
    { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI", description: "Previous generation flagship" },
  ],
  Anthropic: [
    { id: "anthropic/claude-sonnet-4.6", name: "Claude Sonnet 4.6", provider: "Anthropic", description: "Top coding & reasoning capabilities", isPopular: true },
    { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", description: "Lightning fast responses", isPopular: true },
    { id: "anthropic/claude-opus-4.7", name: "Claude Opus 4.7", provider: "Anthropic", description: "Deep comprehension for nuanced work" },
  ],
  "Google Gemini": [
    { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google Gemini", description: "Long context window for complex multimodal tasks", isPopular: true },
    { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google Gemini", description: "Fast & cost efficient multimodal model", isPopular: true },
    { id: "google/gemini-3.6-flash", name: "Gemini 3.6 Flash", provider: "Google Gemini", description: "Experimental next-generation model" },
  ],
  DeepSeek: [
    { id: "deepseek/deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", description: "Reasoning open model", isPopular: true },
  ],
  "Meta Llama": [
    { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "Meta Llama", description: "Meta open weights flagship", isPopular: true },
  ],
};

// In-memory cache to guarantee instantaneous (0ms) response times
interface CachedResponse {
  data: { providers: Record<string, ModelOption[]>; customEndpoint: string };
  timestamp: number;
}
let serverModelsCache: CachedResponse | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

async function fetchCustomModels(endpoint: string, apiKey?: string): Promise<ModelOption[]> {
  try {
    let url = endpoint.trim();
    if (!url) return [];

    if (url.endsWith("/chat/completions")) {
      url = url.replace("/chat/completions", "/models");
    } else if (url.endsWith("/completions")) {
      url = url.replace("/completions", "/models");
    } else if (!url.endsWith("/models")) {
      url = url.replace(/\/+$/, "");
      if (url.endsWith("/v1")) {
        url = `${url}/models`;
      } else {
        url = `${url}/v1/models`;
      }
    }

    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey && apiKey.trim()) {
      headers["Authorization"] = `Bearer ${apiKey.trim()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[CUSTOM MODELS] Failed to fetch from ${url}, status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const rawList = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);

    return rawList.map((m: any) => ({
      id: m.id || m.name,
      name: m.name || m.id,
      provider: "Custom API",
      description: m.description 
        ? m.description.slice(0, 100) 
        : (m.owned_by ? `Owned by ${m.owned_by}` : (m.type ? `Type: ${m.type}` : undefined)),
      contextLength: m.context_length || m.contextWindow || (m.capability_coverage?.context_length),
      isPopular: false,
    }));
  } catch (err: any) {
    return [];
  }
}

async function fetchOpenRouterModels(): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch("https://openrouter.ai/api/v1/models", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (err) {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isRefresh = searchParams.get("refresh") === "true";

  // Instant response if memory cache is valid (<1ms)
  if (!isRefresh && serverModelsCache && (Date.now() - serverModelsCache.timestamp < CACHE_TTL_MS)) {
    return NextResponse.json(serverModelsCache.data, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  }

  // Check globalConfig for custom endpoint & key
  let customEndpoint = "";
  let customApiKey = "";
  try {
    const publicEndpoint = db.select().from(providerEndpoints)
      .where(and(eq(providerEndpoints.userId, "public"), eq(providerEndpoints.provider, "Custom API")))
      .get();
    customEndpoint = publicEndpoint?.baseUrl || "";
    customApiKey = publicEndpoint?.apiKey || "";

    if (!customEndpoint) {
      const endpointRow = db.select().from(globalConfig).where(eq(globalConfig.key, "CUSTOM_API_ENDPOINT")).get();
      const keyRow = db.select().from(globalConfig).where(eq(globalConfig.key, "CUSTOM_API_KEY")).get();
      customEndpoint = endpointRow?.value || "";
      customApiKey = keyRow?.value || "";
    }
  } catch (err) {
    console.warn("Could not read custom endpoint config:", err);
  }

  if (!customEndpoint) {
    customEndpoint = "";
  }

  const groups: Record<string, ModelOption[]> = {
    OpenRouter: [],
    OpenAI: [],
    Anthropic: [],
    "Google Gemini": [],
    DeepSeek: [],
    "Meta Llama": [],
    Mistral: [],
    Other: [],
  };

  // Run external calls concurrently in PARALLEL
  const [openRouterResult, customResult] = await Promise.allSettled([
    fetchOpenRouterModels(),
    customEndpoint ? fetchCustomModels(customEndpoint, customApiKey) : Promise.resolve([]),
  ]);

  const rawModels = openRouterResult.status === "fulfilled" ? openRouterResult.value : [];
  if (rawModels.length > 0) {
    for (const m of rawModels) {
      const option: ModelOption = {
        id: m.id,
        name: m.name || m.id,
        provider: "OpenRouter",
        description: m.description ? m.description.slice(0, 100) + "..." : undefined,
        contextLength: m.context_length,
        isPopular: m.id.includes("gpt-4o") || m.id.includes("claude-sonnet") || m.id.includes("gemini-2.5-flash") || m.id.includes("deepseek-r1"),
      };

      groups.OpenRouter.push(option);

      if (m.id.startsWith("openai/")) groups.OpenAI.push({ ...option, provider: "OpenAI" });
      else if (m.id.startsWith("anthropic/")) groups.Anthropic.push({ ...option, provider: "Anthropic" });
      else if (m.id.startsWith("google/")) groups["Google Gemini"].push({ ...option, provider: "Google Gemini" });
      else if (m.id.startsWith("deepseek/")) groups.DeepSeek.push({ ...option, provider: "DeepSeek" });
      else if (m.id.startsWith("meta-llama/")) groups["Meta Llama"].push({ ...option, provider: "Meta Llama" });
      else if (m.id.startsWith("mistralai/")) groups.Mistral.push({ ...option, provider: "Mistral" });
      else groups.Other.push({ ...option, provider: "Other" });
    }
  } else {
    // Populate with defaults
    Object.assign(groups, DEFAULT_MODELS_BY_PROVIDER);
  }

  // Handle custom models
  const customModels = customResult.status === "fulfilled" ? customResult.value : [];
  if (customModels && customModels.length > 0) {
    groups["Custom API"] = customModels;
  } else if (customEndpoint) {
    groups["Custom API"] = [
      {
        id: "custom-default",
        name: "Custom Model (Check Endpoint)",
        provider: "Custom API",
        description: `Configured endpoint: ${customEndpoint.slice(0, 40)}...`,
      },
    ];
  }

  const responsePayload = { providers: groups, customEndpoint };

  // Update server in-memory cache
  serverModelsCache = {
    data: responsePayload,
    timestamp: Date.now(),
  };

  return NextResponse.json(responsePayload, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}

// POST endpoint to test a custom endpoint on demand
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { endpoint, apiKey } = body;
    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint URL is required" }, { status: 400 });
    }

    let parsedEndpoint;
    try {
      parsedEndpoint = new URL(endpoint);
    } catch {
      return NextResponse.json({ error: "Endpoint URL is invalid" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(parsedEndpoint.protocol)) {
      return NextResponse.json({ error: "Only HTTP(S) endpoints are allowed" }, { status: 400 });
    }
    const hostname = parsedEndpoint.hostname;
    const isLoopback = hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1" || hostname === "::1";
    if (!isLoopback && (/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname) || hostname === "[::1]" || hostname === "0.0.0.0")) {
      return NextResponse.json({ error: "Private IP addresses are not allowed" }, { status: 403 });
    }

    const models = await fetchCustomModels(endpoint, apiKey);
    if (!models || models.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Could not fetch any models from this endpoint. Please ensure the URL is reachable and CORS / network allows it.",
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: models.length,
      sampleModels: models.slice(0, 10),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || "Failed to test custom endpoint",
    }, { status: 500 });
  }
}
