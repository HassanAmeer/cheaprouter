const BASE = '';

export const API_BASE = BASE;

function token() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cm_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  const t = token();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  // Auth
  signup: (email: string, password: string, name?: string) =>
    request<{ token: string; user: any }>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request<{ user: any }>('/api/me'),

  // Models
  models: () => request<{ models: any[] }>('/api/models'),

  // API Keys
  listKeys: () => request<{ keys: any[] }>('/api/keys'),
  createKey: (name: string) => request<{ key: any }>('/api/keys', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteKey: (id: string) => request<{ ok: true }>(`/api/keys/${id}`, { method: 'DELETE' }),

  // Providers (BYOK)
  listProviders: () => request<{ providers: any[] }>('/api/providers'),
  createProvider: (provider: string, apiKey: string) =>
    request<{ provider: any }>('/api/providers', { method: 'POST', body: JSON.stringify({ provider, apiKey }) }),
  setProviderStatus: (id: string, status: 'active' | 'paused') =>
    request<{ ok: true }>(`/api/providers/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteProvider: (id: string) => request<{ ok: true }>(`/api/providers/${id}`, { method: 'DELETE' }),

  // Analytics
  analytics: () => request<any>('/api/analytics'),
  summary: () => request<any>('/api/summary'),

  // Conversations
  listConversations: () => request<{ conversations: any[] }>('/api/conversations'),
  getConversation: (id: string) => request<{ messages: any[] }>(`/api/conversations/${id}`),
  createConversation: (message: string) =>
    request<{ id: string; messages: any[] }>('/api/conversations', { method: 'POST', body: JSON.stringify({ message }) }),
  sendMessage: (id: string, message: string, model?: string) =>
    request<{ message: any }>(`/api/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ message, model }) }),
};

// SSE stream helper (fetch-based, carries auth header)
export async function streamChat(
  prompt: string,
  models: string[],
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  const t = token();
  const url = `${BASE}/api/stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(models.join(','))}`;
  const res = await fetch(url, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
  if (!res.body) return onDone();
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const data = line.replace(/^data: /, '').trim();
      if (!data) continue;
      if (data === '[DONE]') { onDone(); return; }
      try {
        const parsed = JSON.parse(data);
        if (parsed.chunk) onChunk(parsed.chunk);
      } catch {}
    }
  }
  onDone();
}
