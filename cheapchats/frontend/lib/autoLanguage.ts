"use client";

import { detectSpeechLanguage } from "./speechUtils";
import { useAppStore } from "./store";

/**
 * AI based language detection for the "Auto Detect" speech accents.
 *
 * Flow: ask the active model for a BCP-47 tag (fast, max_tokens 6, server cached)
 * → if that fails or is slow, fall back to the local heuristic detector.
 * Results are memoised per text so a message is never detected twice.
 */

const CACHE = new Map<string, string>();

function hashText(t: string): string {
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0;
  return `${h}`;
}

export async function detectLanguageWithAI(text: string, timeoutMs = 4000): Promise<string> {
  const clean = (text || "").trim();
  if (!clean) return "en-US";

  const key = hashText(clean.slice(0, 240));
  const memo = CACHE.get(key);
  if (memo) return memo;

  const local = detectSpeechLanguage(clean);

  try {
    const store = useAppStore.getState();

    // Same BYOK key resolution the chat request uses
    let apiKey: string | undefined;
    try {
      const raw = localStorage.getItem("cheapchats_provider_keys");
      if (raw) {
        const keys = JSON.parse(raw);
        const pName = (store.selectedProvider || "openrouter").toLowerCase();
        const pNorm = pName.replace(/[^a-z0-9]/g, "");
        const hit = keys[store.selectedProvider || ""] || keys[pName] || keys[`ap_${pName}`];
        if (typeof hit === "string" && hit.trim()) apiKey = hit.trim();
        if (!apiKey) {
          for (const [k, v] of Object.entries(keys)) {
            const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (typeof v === "string" && v.trim() && (kNorm === pNorm || pNorm.includes(kNorm) || kNorm.includes(pNorm))) {
              apiKey = v.trim();
              break;
            }
          }
        }
      }
    } catch {}

    let baseUrl: string | undefined;
    let providerId: string | undefined;
    try {
      const custom = JSON.parse(localStorage.getItem("cheapchats_custom_providers") || "[]");
      const sel = (store.selectedProvider || "").toLowerCase();
      const match = custom.find(
        (c: any) =>
          (c?.name || "").toLowerCase() === sel ||
          `custom:${c?.id}`.toLowerCase() === sel
      );
      if (match) {
        baseUrl = match.baseUrl;
        providerId = match.id;
      }
    } catch {}

    // Display name for admin-provider lookups (custom providers use their id)
    let providerName = store.selectedProvider || "OpenRouter";
    if (providerId) providerName = providerName.replace(/^custom:/, "");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch("/api/cheapchats/detect-language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        text: clean.slice(0, 400),
        // Use the model the user already has working — the endpoint only needs
        // ~6 tokens back, so any chat model is fine and keeps keys/limits valid.
        model: store.selectedModel || undefined,
        provider: providerName,
        providerId,
        baseUrl,
        apiKey,
      }),
    }).finally(() => clearTimeout(timer));

    if (res.ok) {
      const data = await res.json();
      if (data?.language) {
        CACHE.set(key, data.language);
        return data.language;
      }
    }
  } catch {
    // fall through to local detection
  }

  CACHE.set(key, local);
  return local;
}