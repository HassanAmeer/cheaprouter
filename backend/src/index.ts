import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
  signToken,
  verifyToken,
  getUserByEmail,
  getUserById,
  createUser,
  verifyPassword,
} from './auth.ts';
import { listKeys, createKey, deleteKey } from './keys.ts';
import { listProviders, upsertProvider, setProviderStatus, deleteProvider, providerMeta } from './providers.ts';
import { getAnalytics, getSummary, recordUsage } from './usage.ts';
import { listConversations, getMessages, createConversation, addMessage, renameConversation } from './conversations.ts';

type Bindings = { userId: string; email: string };

const app = new Hono<{ Variables: Bindings }>();

// ---- CORS (allow frontend dev server) ----
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (c.req.method === 'OPTIONS') return c.text('', 204);
  await next();
});

// Protect all /api routes except auth + models catalog
app.use('/api/*', async (c, next) => {
  const p = c.req.path;
  if (p.endsWith('/auth/login') || p.endsWith('/auth/signup') || p === '/api/models') {
    return next();
  }
  return requireAuth(c, next);
});

// ---- Auth middleware ----
async function requireAuth(c: any, next: any) {
  const header = c.req.header('Authorization') ?? '';
  const token = header.replace('Bearer ', '');
  const payload = await verifyToken(token);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);
  c.set('userId', payload.sub);
  c.set('email', payload.email);
  await next();
}

// ---- Auth routes ----
const authSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });

app.post('/api/auth/signup', zValidator('json', authSchema), async (c) => {
  const { email, password, name } = c.req.valid('json');
  if (getUserByEmail(email)) return c.json({ error: 'Email already registered' }, 409);
  const user = createUser(name ?? email.split('@')[0], email, password);
  const token = await signToken({ sub: user.id, email: user.email });
  return c.json({ token, user });
});

app.post('/api/auth/login', zValidator('json', authSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const user = getUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) return c.json({ error: 'Invalid credentials' }, 401);
  const token = await signToken({ sub: user.id, email: user.email });
  return c.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
});

app.get('/api/me', async (c) => {
  const user = getUserById(c.get('userId'));
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json({ user });
});

// ---- API Keys ----
app.get('/api/keys', async (c) => c.json({ keys: listKeys(c.get('userId')) }));

app.post('/api/keys', zValidator('json', z.object({ name: z.string().min(1) })), async (c) => {
  const key = createKey(c.get('userId'), c.req.valid('json').name);
  return c.json({ key }, 201);
});

app.delete('/api/keys/:id', async (c) => {
  deleteKey(c.get('userId'), c.req.param('id'));
  return c.json({ ok: true });
});

// ---- Providers (BYOK) ----
app.get('/api/providers', async (c) => c.json({ providers: listProviders(c.get('userId')) }));

app.post(
  '/api/providers',
  zValidator('json', z.object({ provider: z.string().min(1), apiKey: z.string().min(1) })),
  async (c) => {
    const { provider, apiKey } = c.req.valid('json');
    const masked = `••••••••••••${apiKey.slice(-4)}`;
    upsertProvider(c.get('userId'), provider, masked);
    return c.json({ provider: { ...providerMeta(provider), status: 'active' } }, 201);
  }
);

app.put('/api/providers/:id', zValidator('json', z.object({ status: z.enum(['active', 'paused']) })), async (c) => {
  setProviderStatus(c.get('userId'), c.req.param('id'), c.req.valid('json').status);
  return c.json({ ok: true });
});

app.delete('/api/providers/:id', async (c) => {
  deleteProvider(c.get('userId'), c.req.param('id'));
  return c.json({ ok: true });
});

// ---- Analytics & Summary ----
app.get('/api/analytics', async (c) => c.json(getAnalytics(c.get('userId'))));
app.get('/api/summary', async (c) => c.json(getSummary(c.get('userId'))));

// ---- Conversations (chat) ----
app.get('/api/conversations', async (c) => c.json({ conversations: listConversations(c.get('userId')) }));

app.get('/api/conversations/:id', async (c) => {
  const messages = getMessages(c.req.param('id'), c.get('userId'));
  if (!messages) return c.json({ error: 'Not found' }, 404);
  return c.json({ messages });
});

app.post('/api/conversations', zValidator('json', z.object({ title: z.string().optional(), message: z.string().min(1) })), async (c) => {
  const { title, message } = c.req.valid('json');
  const userId = c.get('userId');
  const convId = createConversation(userId, title ?? message.slice(0, 28));
  addMessage(convId, 'user', message);
  const reply = await fakeModelReply(message);
  addMessage(convId, 'assistant', reply.text);
  recordUsage(userId, reply.model, reply.tokens, reply.cost);
  return c.json({ id: convId, messages: [{ role: 'user', content: message }, { role: 'assistant', content: reply.text }] }, 201);
});

app.post('/api/conversations/:id/messages', zValidator('json', z.object({ message: z.string().min(1), model: z.string().optional() })), async (c) => {
  const { message, model } = c.req.valid('json');
  const userId = c.get('userId');
  const convId = c.req.param('id');
  if (!getMessages(convId, userId)) return c.json({ error: 'Not found' }, 404);
  addMessage(convId, 'user', message);
  const reply = await fakeModelReply(message, model);
  addMessage(convId, 'assistant', reply.text);
  recordUsage(userId, reply.model, reply.tokens, reply.cost);
  return c.json({ message: { role: 'assistant', content: reply.text } });
});

// Streaming chat (SSE)
app.get('/api/stream', async (c) => {
  const userId = c.get('userId');
  const url = new URL(c.req.url);
  const prompt = url.searchParams.get('prompt') ?? '';
  const model = url.searchParams.get('model') ?? 'gpt-4o';
  const reply = await fakeModelReply(prompt, model);

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      for (const ch of reply.text) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ chunk: ch })}\n\n`));
        await new Promise((r) => setTimeout(r, 12));
      }
      controller.enqueue(enc.encode(`data: [DONE]\n\n`));
      controller.close();
      recordUsage(userId, reply.model, reply.tokens, reply.cost);
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } });
});

// ---- Models catalog ----
app.get('/api/models', async (c) => {
  const models = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context: '128K', input: '$5/M', output: '$15/M' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', context: '200K', input: '$3/M', output: '$15/M' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', context: '2M', input: '$3.50/M', output: '$10.50/M' },
    { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'Meta', context: '8K', input: '$0.50/M', output: '$0.50/M' },
    { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', provider: 'DeepSeek', context: '128K', input: '$0.14/M', output: '$0.28/M' },
  ];
  return c.json({ models });
});

// ---- Chat playground canned reply ----
const CANNED = [
  'CheapModels routes your request through a single unified OpenAI-compatible endpoint, so you get the same streaming experience regardless of the underlying provider.',
  'Great question! Because we normalize every provider to the OpenAI schema, you can swap models by changing just the `model` field — no SDK changes required.',
  'Here is a quick comparison: Claude 3.5 Sonnet tends to excel at long-context reasoning, while GPT-4o is faster for general tasks. Gemini 1.5 Pro offers the largest context window.',
  'I can help you scaffold that. Just let me know the framework and I will generate a drop-in route that points at https://api.cheapmodels.ai/v1.',
];

async function fakeModelReply(prompt: string, model = 'gpt-4o') {
  const text = CANNED[Math.floor(Math.random() * CANNED.length)];
  const tokens = Math.max(1, Math.round(text.length / 4));
  const cost = Number((tokens * 0.000003).toFixed(4));
  return { model, text, tokens, cost };
}

const port = Number(process.env.PORT ?? 4000);
console.log(`CheapModels backend listening on http://localhost:${port}`);
Bun.serve({ fetch: app.fetch, port });
