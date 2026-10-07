// ---------------------------------------------------------------------------
// In-memory TTL cache — avoids a DB round-trip on every request.
// Providers are refreshed every 60 s; auth tokens every 30 s.
// ---------------------------------------------------------------------------

interface Entry<T> {
  value: T;
  expiresAt: number;
}

export class TTLCache<T> {
  private store = new Map<string, Entry<T>>();

  get(key: string): T | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return e.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Singleton caches
export const providerCache = new TTLCache<Provider[]>();
export const authCache     = new TTLCache<string | null>();

export interface Provider {
  id: string;
  name: string;
  status: boolean;
  key: string;               // JSON array of keys or a single key string
  priority: number | null;
  base_url: string | null;
  api_format: string | null; // 'openai' | 'anthropic' | 'google' | 'cohere' | null
  models: any;               // JSON array from DB
  headers: any;              // JSON object of extra headers
  byok_enabled?: boolean;    // Whether this provider is shown to users in BYOK dashboard
}
