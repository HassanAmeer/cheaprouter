import { v4 as uuidv4 } from 'uuid';

type User = { 
  id: string; 
  email: string; 
  name?: string; 
  plan: string; 
  password?: string;
  calls: number;
  status: 'Active' | 'Inactive' | 'Suspended';
  joined: string;
  keys: number;
  planStart?: string;
  planEnd?: string;
  planDuration?: string;
};
type ApiKey = { id: string; name: string; secret: string; created: string; lastUsed: string | null };
type Provider = { id: string; name: string; icon: string; color: string; masked: string; status: 'active' | 'paused'; added: string; apiKey: string };

const getDaysAgoStr = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const todayStr = getDaysAgoStr(0);

const users: Record<string, User> = {
  'usr_1a9b': { id: 'usr_1a9b', name: 'John Doe', email: 'john@example.com', plan: 'Free', calls: 1450, status: 'Active', joined: todayStr, keys: 2, planStart: todayStr, planEnd: 'N/A', planDuration: 'Lifetime' },
  'usr_2x8c': { id: 'usr_2x8c', name: 'Alice Smith', email: 'alice@startup.io', plan: 'Premium', calls: 89200, status: 'Active', joined: getDaysAgoStr(2), keys: 5, planStart: getDaysAgoStr(2), planEnd: getDaysAgoStr(-28), planDuration: '1 Month' },
  'usr_9z1l': { id: 'usr_9z1l', name: 'Bob Johnson', email: 'bob@agency.com', plan: 'Free', calls: 0, status: 'Inactive', joined: getDaysAgoStr(5), keys: 0, planStart: getDaysAgoStr(5), planEnd: 'N/A', planDuration: 'Lifetime' },
  'usr_7q4w': { id: 'usr_7q4w', name: 'Eve Hacker', email: 'eve@shadow.net', plan: 'Free', calls: 4000, status: 'Suspended', joined: getDaysAgoStr(14), keys: 1, planStart: getDaysAgoStr(14), planEnd: 'N/A', planDuration: 'Lifetime' },
  'usr_5p2m': { id: 'usr_5p2m', name: 'Michael Tech', email: 'mike@tech.co', plan: 'Premium', calls: 120500, status: 'Active', joined: getDaysAgoStr(25), keys: 4, planStart: getDaysAgoStr(25), planEnd: getDaysAgoStr(-340), planDuration: '1 Year' },
  'usr_3v8n': { id: 'usr_3v8n', name: 'Sarah Connor', email: 'sarah@skynet.com', plan: 'Premium', calls: 999999, status: 'Active', joined: getDaysAgoStr(45), keys: 10, planStart: getDaysAgoStr(45), planEnd: getDaysAgoStr(-135), planDuration: '6 Months' },
  'usr_8m1x': { id: 'usr_8m1x', name: 'Tony Stark', email: 'tony@stark.com', plan: 'Premium', calls: 543210, status: 'Active', joined: getDaysAgoStr(75), keys: 8, planStart: getDaysAgoStr(75), planEnd: getDaysAgoStr(-290), planDuration: '1 Year' },
  'usr_4k9p': { id: 'usr_4k9p', name: 'Bruce Wayne', email: 'bruce@wayne.com', plan: 'Premium', calls: 231000, status: 'Active', joined: getDaysAgoStr(110), keys: 6, planStart: getDaysAgoStr(110), planEnd: getDaysAgoStr(-255), planDuration: '1 Year' }
};
let keys: ApiKey[] = [];
let providers: Provider[] = [];

export type AdminModel = { id: string; name: string };
export type AdminProvider = { id: string; name: string; status: boolean; key: string; priority: number; models: AdminModel[]; baseUrl?: string };

let adminProviders: AdminProvider[] = [
  { id: 'prov_openai', name: 'OpenAI', status: true, key: 'sk-proj-xxxxxx...yyyy', priority: 1, models: [{id: 'm1', name: 'gpt-4o'}, {id: 'm2', name: 'gpt-3.5-turbo'}], baseUrl: 'https://api.openai.com/v1' },
  { id: 'prov_anthropic', name: 'Anthropic', status: true, key: 'sk-ant-xxxxxx...zzzz', priority: 2, models: [{id: 'm3', name: 'claude-3.5-sonnet'}], baseUrl: 'https://api.anthropic.com/v1' },
  { id: 'prov_google', name: 'Google (Gemini)', status: true, key: 'AIzaSy......xxxx', priority: 3, models: [{id: 'm4', name: 'gemini-1.5-pro'}, {id: 'm5', name: 'gemini-1.5-flash'}], baseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
  { id: 'prov_deepseek', name: 'DeepSeek', status: false, key: '', priority: 4, models: [{id: 'm6', name: 'deepseek-chat'}, {id: 'm7', name: 'deepseek-coder'}], baseUrl: 'https://api.deepseek.com/v1' }
];

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
  // Auth / Users
  listUsers: () => Object.values(users),
  getUserStats: (filter?: string, startDate?: string, endDate?: string) => {
    const allUsers = Object.values(users);
    const now = new Date();

    const todayDateStr = now.toISOString().split('T')[0];
    
    // Total registered users count
    const total = allUsers.length;

    // Users registered today
    const today = allUsers.filter(u => u.joined === todayDateStr).length;

    // Users registered in last 7 days
    const last7Days = allUsers.filter(u => {
      if (!u.joined) return false;
      const joinedDate = new Date(u.joined);
      const diffTime = Math.abs(now.getTime() - joinedDate.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length;

    // Users registered in last 30 days
    const last30Days = allUsers.filter(u => {
      if (!u.joined) return false;
      const joinedDate = new Date(u.joined);
      const diffTime = Math.abs(now.getTime() - joinedDate.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    }).length;

    // Filtered users selection
    let filteredUsers = allUsers;
    if (filter === '30') {
      filteredUsers = allUsers.filter(u => {
        if (!u.joined) return false;
        const joinedDate = new Date(u.joined);
        const diffDays = (now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      });
    } else if (filter === '60') {
      filteredUsers = allUsers.filter(u => {
        if (!u.joined) return false;
        const joinedDate = new Date(u.joined);
        const diffDays = (now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 60;
      });
    } else if (filter === '90') {
      filteredUsers = allUsers.filter(u => {
        if (!u.joined) return false;
        const joinedDate = new Date(u.joined);
        const diffDays = (now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 90;
      });
    } else if (filter === 'custom' && (startDate || endDate)) {
      filteredUsers = allUsers.filter(u => {
        if (!u.joined) return false;
        const joinedStr = u.joined;
        if (startDate && joinedStr < startDate) return false;
        if (endDate && joinedStr > endDate) return false;
        return true;
      });
    }

    return {
      total,
      today,
      last7Days,
      last30Days,
      filteredCount: filteredUsers.length,
      filteredUsers
    };
  },
  createUser: (email: string, password?: string, name?: string) => {
    const id = uuidv4();
    users[id] = { id, email, name, password, plan: 'Free', calls: 0, status: 'Active', joined: new Date().toISOString().split('T')[0], keys: 0 };
    return users[id];
  },
  getUserByEmail: (email: string) => Object.values(users).find(u => u.email === email),
  getUser: (id: string) => users[id],
  updateUser: (id: string, updates: Partial<User>) => {
    if (users[id]) {
      users[id] = { ...users[id], ...updates };
      return users[id];
    }
    throw new Error('User not found');
  },
  deleteUser: (id: string) => {
    delete users[id];
    return true;
  },

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
  
  // Admin Providers
  listAdminProviders: () => [...adminProviders],
  saveAdminProviders: (newProviders: AdminProvider[]) => {
    adminProviders = newProviders;
    return adminProviders;
  },
};
