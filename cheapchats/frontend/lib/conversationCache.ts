"use client";

interface CachedConversationData {
  conversation?: any;
  messages: any[];
  timestamp: number;
}

// In-memory hot cache for instant 0ms retrieval
const memoryCache = new Map<string, CachedConversationData>();
const inFlightRequests = new Map<string, Promise<any>>();

import { useAppStore } from "@cheapchats/frontend/lib/store";

export function getCachedConversation(id: string): CachedConversationData | null {
  if (!id || id === "new") return null;
  try {
    if (useAppStore.getState().isIncognito) return null;
  } catch {}

  // 1. Check in-memory hot cache
  if (memoryCache.has(id)) {
    return memoryCache.get(id)!;
  }

  // 2. Check localStorage/sessionStorage cache
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`cheapchat_conv_${id}`) || localStorage.getItem(`cheapchat_conv_${id}`);
      if (stored) {
        const parsed: CachedConversationData = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.messages)) {
          memoryCache.set(id, parsed);
          return parsed;
        }
      }
    } catch {}
  }

  return null;
}

export function setCachedConversation(id: string, data: { conversation?: any; messages: any[] }) {
  if (!id || id === "new") return;
  if (data.conversation?.isIncognito === 1 || data.conversation?.isIncognito === true) return;
  try {
    if (useAppStore.getState().isIncognito) return;
  } catch {}

  const payload: CachedConversationData = {
    conversation: data.conversation,
    messages: data.messages,
    timestamp: Date.now(),
  };

  memoryCache.set(id, payload);

  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`cheapchat_conv_${id}`, JSON.stringify(payload));
    } catch {}
  }
}

export function clearConversationCache() {
  memoryCache.clear();
  inFlightRequests.clear();
  if (typeof window !== "undefined") {
    try {
      const removable: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith("cheapchat_conv_")) removable.push(key);
      }
      removable.forEach((key) => sessionStorage.removeItem(key));
    } catch {}
  }
}

/**
 * Prefetch a conversation in the background (e.g. on mouse hover)
 * so clicking it is 0ms instantaneous!
 */
export async function prefetchConversation(id: string) {
  if (!id || id === "new") return;
  try {
    if (useAppStore.getState().isIncognito) return;
  } catch {}

  // If already in memory cache, no need to prefetch
  if (memoryCache.has(id)) return;

  // Avoid duplicate simultaneous fetches
  if (inFlightRequests.has(id)) {
    return inFlightRequests.get(id);
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        priority: "low",
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.messages || []).map((m: any) => ({
          ...m,
          attachments:
            typeof m.attachments === "string"
              ? (() => {
                  try {
                    return JSON.parse(m.attachments);
                  } catch {
                    return [];
                  }
                })()
              : m.attachments || [],
        }));
        setCachedConversation(id, { conversation: data.conversation, messages: mapped });
      }
    } catch {
      // Ignore background prefetch errors
    } finally {
      inFlightRequests.delete(id);
    }
  })();

  inFlightRequests.set(id, fetchPromise);
  return fetchPromise;
}
