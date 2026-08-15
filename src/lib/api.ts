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
  
  const contentType = res.headers.get('content-type') || '';
  let body: any = {};
  if (contentType.includes('application/json')) {
    try {
      body = await res.json();
    } catch {
      body = {};
    }
  }

  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    if (body.error) {
      if (typeof body.error === 'string') {
        errMsg = body.error;
      } else if (body.error.issues && Array.isArray(body.error.issues)) {
        errMsg = body.error.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join(', ');
      } else {
        errMsg = body.message || JSON.stringify(body.error);
      }
    } else if (body.message) {
      errMsg = body.message;
    }
    throw new Error(errMsg);
  }
  return body as T;
}

export const api = {
  // Auth
  signup: (email: string, password: string, name?: string, hardwareInfo?: any) =>
    request<{ token: string; user: any }>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name, hardwareInfo }) }),
  login: (email: string, password: string, hardwareInfo?: any) =>
    request<{ token: string; user: any }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, hardwareInfo }) }),
  me: () => request<{ user: any }>('/api/me'),
  updateProfile: (name: string, profile_picture?: string) => 
    request<{ user: any }>('/api/me/profile', { method: 'PUT', body: JSON.stringify({ name, profile_picture }) }),
  saveOnboarding: (data: { isStudent: boolean; experienceLevel: string; useCases: string[]; earningGoal: string }) =>
    request<{ user: any }>('/api/me/onboarding', { method: 'PUT', body: JSON.stringify(data) }),

  // Models
  models: () => request<{ models: any[] }>('/api/models'),
  getModelPrefs: () => request<{ prefs: Record<string, boolean> }>('/api/user/model-prefs'),
  updateModelPref: (modelId: string, enabled: boolean) => 
    request<{ ok: true }>('/api/user/model-prefs', { method: 'PUT', body: JSON.stringify({ modelId, enabled }) }),

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
  analytics: (source?: string) => request<any>(source ? `/api/analytics?source=${source}` : '/api/analytics'),
  summary: () => request<any>('/api/summary'),
  usageBreakdown: (source?: string) => request<any>(source ? `/api/analytics/breakdown?source=${source}` : '/api/analytics/breakdown'),

  // Billing / Account Balance
  getBilling: () => request<any>('/api/billing'),
  topUp: (amount: number) => request<any>('/api/billing/topup', { method: 'POST', body: JSON.stringify({ amount }) }),
  upgradePlan: (data: { planField: string; planId: string; planName: string; price: number; durationDays?: number }) =>
    request<any>('/api/billing/upgrade', { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => request<any>('/api/notifications'),

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
