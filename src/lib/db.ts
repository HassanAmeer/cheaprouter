import { v4 as uuidv4 } from 'uuid';

type User = { id: string; email: string; name?: string; plan: string; password?: string };
type ApiKey = { id: string; name: string; secret: string; created: string; lastUsed: string | null };
type Provider = { id: string; name: string; icon: string; color: string; masked: string; status: 'active' | 'paused'; added: string; apiKey: string };

const users: Record<string, User> = {};
let keys: ApiKey[] = [];
let providers: Provider[] = [];

// Analytics state
const analytics = {
  totalTokens: 0,
  totalCost: 0,
  usageOverTime: [
    { label: 'Mon', value: 0 },
    { label: 'Tue', value: 0 },
    { label: 'Wed', value: 0 },
    { label: 'Thu', value: 0 },
    { label: 'Fri', value: 0 },
    { label: 'Sat', value: 0 },
    { label: 'Sun', value: 0 },
  ],
  topModels: {} as Record<string, number>,
  providerCosts: {} as Record<string, number>,
};

export const db = {
  // Auth
  createUser: (email: string, password?: string, name?: string) => {
    const id = uuidv4();
    users[id] = { id, email, name, password, plan: 'free' };
    return users[id];
  },
  getUserByEmail: (email: string) => Object.values(users).find(u => u.email === email),
  getUser: (id: string) => users[id],

  // Keys
  listKeys: () => [...keys].reverse(),
  createKey: (name: string) => {
    const key = {
      id: uuidv4(),
      name,
      secret: 'sk-' + uuidv4().replace(/-/g, '') + 'cm',
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUsed: null,
    };
    keys.push(key);
    return key;
  },
  deleteKey: (id: string) => {
    keys = keys.filter(k => k.id !== id);
    return true;
  },

  // Providers
  listProviders: () => [...providers],
  createProvider: (name: string, apiKey: string, meta: { icon: string; color: string }) => {
    // Remove existing if same name
    providers = providers.filter(p => p.name !== name);
    const provider: Provider = {
      id: uuidv4(),
      name,
      icon: meta.icon,
      color: meta.color,
      masked: `••••••••••••${apiKey.trim().slice(-4)}`,
      status: 'active',
      added: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      apiKey,
    };
    providers.push(provider);
    return provider;
  },
  updateProviderStatus: (id: string, status: 'active' | 'paused') => {
    const p = providers.find(p => p.id === id);
    if (p) p.status = status;
    return !!p;
  },
  deleteProvider: (id: string) => {
    providers = providers.filter(p => p.id !== id);
    return true;
  },
  getActiveProviderKey: (name: string) => {
    const p = providers.find(p => p.name.toLowerCase() === name.toLowerCase() && p.status === 'active');
    return p?.apiKey;
  },

  // Analytics
  getAnalytics: () => {
    const sortedModels = Object.entries(analytics.topModels)
      .sort((a, b) => b[1] - a[1])
      .map(([model, tokens]) => ({ model, tokens }));

    const costBreakdown = Object.entries(analytics.providerCosts).map(([label, value]) => {
      let color = '#888';
      if (label === 'OpenAI') color = '#10A37F';
      if (label === 'Anthropic') color = '#D97757';
      if (label === 'Google') color = '#4285F4';
      if (label === 'Meta') color = '#0668E1';
      return { label, value: parseFloat(value.toFixed(2)), color };
    });

    return {
      totalTokens: analytics.totalTokens,
      totalCost: parseFloat(analytics.totalCost.toFixed(2)),
      usageOverTime: analytics.usageOverTime,
      topModels: sortedModels.length > 0 ? sortedModels : [{ model: 'No data yet', tokens: 0 }],
      costBreakdown: costBreakdown.length > 0 ? costBreakdown : [{ label: 'No data yet', value: 0, color: '#ccc' }],
    };
  },
  recordUsage: (model: string, provider: string, tokens: number) => {
    analytics.totalTokens += tokens;
    
    // Cost estimation mock logic
    let cost = 0;
    if (provider === 'OpenAI') cost = (tokens / 1000000) * 5.0;
    else if (provider === 'Anthropic') cost = (tokens / 1000000) * 3.0;
    else if (provider === 'Google') cost = (tokens / 1000000) * 3.5;
    else cost = (tokens / 1000000) * 1.0;

    analytics.totalCost += cost;
    analytics.providerCosts[provider] = (analytics.providerCosts[provider] || 0) + cost;
    analytics.topModels[model] = (analytics.topModels[model] || 0) + tokens;

    // Add to a random day for the chart demo
    const randomDay = Math.floor(Math.random() * 7);
    analytics.usageOverTime[randomDay].value += tokens;
  },
};
