import { Hono } from 'hono';
import * as os from 'os';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
  signToken,
  verifyToken,
  getUserByEmail,
  getUserById,
  createUser,
  verifyPassword,
  getAllUsers,
  updateUserLoginInfo,
  updateUserProfile,
  adminUpdateUser,
  adminDeleteUser,
} from './auth.ts';
import { listKeys, createKey, deleteKey } from './keys.ts';
import { listProviders, upsertProvider, setProviderStatus, deleteProvider, providerMeta } from './providers.ts';
import { getAnalytics, getSummary, recordUsage } from './usage.ts';
import { listConversations, getMessages, createConversation, addMessage, renameConversation } from './conversations.ts';
import { db, initDb, DB_URL } from './db.ts';

// ---- IN-MEMORY LOGGER ----
const systemLogs: string[] = [];
const originalLog = console.log;
const originalError = console.error;
const addLog = (level: string, ...args: any[]) => {
  const msg = `[${level}] ${new Date().toISOString()} - ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
  systemLogs.unshift(msg);
  if (systemLogs.length > 200) systemLogs.pop();
};
console.log = (...args) => { addLog('INFO', ...args); originalLog(...args); };
console.error = (...args) => { addLog('ERROR', ...args); originalError(...args); };

type Bindings = { userId: string; email: string };

const app = new Hono<{ Variables: Bindings }>();

// ---- CORS (allow frontend dev server) ----
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (c.req.method === 'OPTIONS') return c.body(null, 204);
  await next();
});

// Protect all /api routes except auth, models catalog, and admin routes
app.use('/api/*', async (c, next) => {
  const p = c.req.path;
  if (p.endsWith('/auth/login') || p.endsWith('/auth/signup') || p === '/api/models' || p.startsWith('/api/admin')) {
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
const authSchema = z.object({ 
  email: z.string().email(), 
  password: z.string().min(6), 
  name: z.string().optional(),
  hardwareInfo: z.any().optional() 
});

app.post('/api/auth/signup', zValidator('json', authSchema), async (c) => {
  const { email, password, name, hardwareInfo } = c.req.valid('json');
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '';
  const userAgent = c.req.header('user-agent') || '';
  const hwInfoStr = hardwareInfo ? JSON.stringify(hardwareInfo) : undefined;
  
  if (await getUserByEmail(email)) return c.json({ error: 'Email already registered' }, 409);
  
  const user = await createUser(name ?? email.split('@')[0], email, password, ip, userAgent, hwInfoStr);
  const token = await signToken({ sub: user.id, email: user.email });
  return c.json({ token, user });
});

app.post('/api/auth/login', zValidator('json', authSchema), async (c) => {
  const { email, password, hardwareInfo } = c.req.valid('json');
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '';
  const userAgent = c.req.header('user-agent') || '';
  const hwInfoStr = hardwareInfo ? JSON.stringify(hardwareInfo) : undefined;

  const user = await getUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) return c.json({ error: 'Invalid credentials' }, 401);
  
  await updateUserLoginInfo(user.id, ip, userAgent, hwInfoStr);
  
  const token = await signToken({ sub: user.id, email: user.email });
  return c.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
});

app.get('/api/me', async (c) => {
  const user = await getUserById(c.get('userId'));
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json({ user });
});

app.put('/api/me/profile', zValidator('json', z.object({ name: z.string().min(1), profile_picture: z.string().optional() })), async (c) => {
  const { name, profile_picture } = c.req.valid('json');
  const userId = c.get('userId');
  await updateUserProfile(userId, name, profile_picture);
  const user = await getUserById(userId);
  return c.json({ user });
});

// ---- API Keys ----
app.get('/api/keys', async (c) => c.json({ keys: await listKeys(c.get('userId')) }));

app.post('/api/keys', zValidator('json', z.object({ name: z.string().min(1) })), async (c) => {
  const key = await createKey(c.get('userId'), c.req.valid('json').name);
  return c.json({ key }, 201);
});

app.delete('/api/keys/:id', async (c) => {
  await deleteKey(c.get('userId'), c.req.param('id'));
  return c.json({ ok: true });
});

// ---- Providers (BYOK) ----
app.get('/api/providers', async (c) => c.json({ providers: await listProviders(c.get('userId')) }));

app.post(
  '/api/providers',
  zValidator('json', z.object({ provider: z.string().min(1), apiKey: z.string().min(1) })),
  async (c) => {
    const { provider, apiKey } = c.req.valid('json');
    const masked = `••••••••••••${apiKey.slice(-4)}`;
    await upsertProvider(c.get('userId'), provider, masked);
    return c.json({ provider: { ...providerMeta(provider), status: 'active' } }, 201);
  }
);

app.put('/api/providers/:id', zValidator('json', z.object({ status: z.enum(['active', 'paused']) })), async (c) => {
  await setProviderStatus(c.get('userId'), c.req.param('id'), c.req.valid('json').status);
  return c.json({ ok: true });
});

app.delete('/api/providers/:id', async (c) => {
  await deleteProvider(c.get('userId'), c.req.param('id'));
  return c.json({ ok: true });
});

// ---- Analytics & Summary ----
app.get('/api/analytics', async (c) => c.json(await getAnalytics(c.get('userId'))));
app.get('/api/summary', async (c) => c.json(await getSummary(c.get('userId'))));

// ---- Admin System & Logs ----
app.get('/api/admin/system', async (c) => {
  let dbConnected = false;
  let postgresInfo = null;
  
  try {
    const versionRes = await db`SELECT version();`;
    const sizeRes = await db`SELECT pg_size_pretty(pg_database_size(current_database())) as size;`;
    const connRes = await db`SELECT count(*) as count FROM pg_stat_activity;`;
    const maxConnRes = await db`SHOW max_connections;`;
    const pgUptimeRes = await db`SELECT pg_postmaster_start_time() as start_time;`;
    
    // Additional Postgres Data
    const tableCountRes = await db`SELECT count(*) as count FROM information_schema.tables WHERE table_schema = 'public';`;
    const rowCountRes = await db`SELECT sum(n_live_tup) as total_rows FROM pg_stat_user_tables;`;
    const sharedBuffersRes = await db`SHOW shared_buffers;`;
    const workMemRes = await db`SHOW work_mem;`;
    const timezoneRes = await db`SHOW timezone;`;
    const dataDirRes = await db`SHOW data_directory;`;
    const encodingRes = await db`SELECT pg_encoding_to_char(encoding) as enc, datcollate FROM pg_database WHERE datname = current_database();`;
    
    let dbHost = 'Unknown', dbName = 'Unknown', dbUser = 'Unknown', dbPort = '5432', dbPassword = 'Unknown';
    if (DB_URL) {
      try {
        const u = new URL(DB_URL);
        dbHost = u.hostname;
        dbPort = u.port || '5432';
        dbName = u.pathname.slice(1);
        dbUser = u.username;
        dbPassword = u.password;
      } catch(e) {}
    }

    postgresInfo = {
      version: versionRes[0]?.version?.split(' on ')[0] || 'Unknown',
      databaseSize: sizeRes[0]?.size || '0 bytes',
      activeConnections: Number(connRes[0]?.count || 0),
      maxConnections: Number(maxConnRes[0]?.max_connections || 100),
      uptime: pgUptimeRes[0]?.start_time || null,
      tableCount: Number(tableCountRes[0]?.count || 0),
      approximateRows: Number(rowCountRes[0]?.total_rows || 0),
      sharedBuffers: sharedBuffersRes[0]?.shared_buffers || 'Unknown',
      workMem: workMemRes[0]?.work_mem || 'Unknown',
      timezone: timezoneRes[0]?.TimeZone || 'Unknown',
      dataDirectory: dataDirRes[0]?.data_directory || 'Unknown',
      encoding: encodingRes[0]?.enc || 'UTF8',
      collation: encodingRes[0]?.datcollate || 'Unknown',
      dbName,
      dbHost,
      dbPort,
      dbUser,
      dbPassword,
      rawUrl: DB_URL
    };
    dbConnected = true;
  } catch (e) {
    dbConnected = false;
  }
  
  const config = {
    DATABASE_URL: process.env.DATABASE_URL ? '******** (Set)' : 'Not Set',
    PORT: process.env.PORT || '4000',
    CWD: process.cwd(),
    NODE_ENV: process.env.NODE_ENV || 'development'
  };

  // Process Network Interfaces
  const nets = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // Skip internal and non-ipv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(`${name}: ${net.address}`);
      }
    }
  }

  const hardwareInfo = {
    osPlatform: os.type() + ' ' + os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    cpuCores: os.cpus().length,
    cpuModel: os.cpus()[0]?.model || 'Unknown CPU',
    cpuSpeed: os.cpus()[0]?.speed || 0,
    loadAverage: os.loadavg().map(n => n.toFixed(2)),
    totalMemMB: Math.round(os.totalmem() / 1024 / 1024),
    freeMemMB: Math.round(os.freemem() / 1024 / 1024),
    uptimeSeconds: Math.floor(os.uptime()),
    networkIPs: ips.length > 0 ? ips : ['No external IPv4'],
    tmpDir: os.tmpdir(),
    endianness: os.endianness()
  };

  const memUsage = process.memoryUsage();
  const userInfo = os.userInfo();
  const cpuUsage = process.cpuUsage();
  
  const bunInfo = {
    version: process.versions?.bun || 'Unknown',
    nodeVersion: process.versions?.node || 'N/A',
    pid: process.pid,
    execPath: process.execPath,
    runUser: userInfo.username,
    userHome: userInfo.homedir,
    userShell: userInfo.shell,
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(memUsage.rss / 1024 / 1024),
    heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
    cliArgs: process.argv.join(' '),
    cpuUsageUser: Math.round(cpuUsage.user / 1000), // ms
    cpuUsageSystem: Math.round(cpuUsage.system / 1000) // ms
  };

  return c.json({ dbConnected, postgresInfo, config, hardwareInfo, bunInfo, logs: systemLogs });
});

app.delete('/api/admin/system/logs', zValidator('json', z.object({ days: z.union([z.number(), z.literal('all')]) })), async (c) => {
  const { days } = c.req.valid('json');
  if (days === 'all') {
    systemLogs.length = 0;
  } else {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const filtered = systemLogs.filter(log => {
      const match = log.match(/^\[.*?\]\s+(.*?)\s+-/);
      if (match && match[1]) {
        const logDate = new Date(match[1]);
        if (logDate > cutoff) return false; // delete logs newer than cutoff
      }
      return true; // keep others
    });
    systemLogs.length = 0;
    systemLogs.push(...filtered);
  }
  return c.json({ ok: true });
});

// ---- Admin Users & Notifications ----
app.get('/api/admin/users', async (c) => {
  const users = await getAllUsers();
  return c.json({ users });
});

app.get('/api/admin/users/:id', async (c) => {
  const user = await getUserById(c.req.param('id'));
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json({ user });
});

app.put('/api/admin/users/:id', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await adminUpdateUser(c.req.param('id'), data);
  const user = await getUserById(c.req.param('id'));
  return c.json({ user });
});

app.delete('/api/admin/users/:id', async (c) => {
  await adminDeleteUser(c.req.param('id'));
  return c.json({ ok: true });
});

app.post('/api/admin/notifications', zValidator('json', z.object({ title: z.string(), message: z.string(), targetUserIds: z.array(z.string()).optional() })), async (c) => {
  const { title, message, targetUserIds } = c.req.valid('json');
  // targetUserIds can be ['ALL'] or ['user_id_1', 'user_id_2']
  const ids = targetUserIds && targetUserIds.length > 0 ? targetUserIds : ['ALL'];
  
  const created: any[] = [];
  
  if (ids.includes('ALL')) {
    const id = require('./db.ts').genId('notif');
    await db`INSERT INTO notifications (id, user_id, title, message) VALUES (${id}, NULL, ${title}, ${message})`;
    created.push({ id, title, message, targetUserId: 'ALL' });
  } else {
    for (const uId of ids) {
      const id = require('./db.ts').genId('notif');
      await db`INSERT INTO notifications (id, user_id, title, message) VALUES (${id}, ${uId}, ${title}, ${message})`;
      created.push({ id, title, message, targetUserId: uId });
    }
  }
  return c.json({ success: true, notifications: created });
});

// ---- User Notifications ----
app.get('/api/notifications', async (c) => {
  const userId = c.get('userId');
  const notifications = await db`SELECT * FROM notifications WHERE user_id = ${userId} OR user_id IS NULL ORDER BY created_at DESC`;
  return c.json({ notifications });
});

app.put('/api/notifications', zValidator('json', z.object({ action: z.enum(['markRead', 'markAllRead']), id: z.string().optional() })), async (c) => {
  const { action, id } = c.req.valid('json');
  const userId = c.get('userId');
  
  if (action === 'markRead' && id) {
    await db`UPDATE notifications SET read = TRUE WHERE id = ${id} AND (user_id = ${userId} OR user_id IS NULL)`;
    return c.json({ success: true });
  } else if (action === 'markAllRead') {
    await db`UPDATE notifications SET read = TRUE WHERE user_id = ${userId} OR user_id IS NULL`;
    return c.json({ success: true });
  }
  return c.json({ error: 'Invalid request' }, 400);
});

// ---- Conversations (chat) ----
app.get('/api/conversations', async (c) => c.json({ conversations: await listConversations(c.get('userId')) }));

app.get('/api/conversations/:id', async (c) => {
  const messages = await getMessages(c.req.param('id'), c.get('userId'));
  if (!messages) return c.json({ error: 'Not found' }, 404);
  return c.json({ messages });
});

app.post('/api/conversations', zValidator('json', z.object({ title: z.string().optional(), message: z.string().min(1) })), async (c) => {
  const { title, message } = c.req.valid('json');
  const userId = c.get('userId');
  const convId = await createConversation(userId, title ?? message.slice(0, 28));
  await addMessage(convId, 'user', message);
  const reply = await fakeModelReply(message);
  await addMessage(convId, 'assistant', reply.text);
  await recordUsage(userId, reply.model, reply.tokens, reply.cost);
  return c.json({ id: convId, messages: [{ role: 'user', content: message }, { role: 'assistant', content: reply.text }] }, 201);
});

app.post('/api/conversations/:id/messages', zValidator('json', z.object({ message: z.string().min(1), model: z.string().optional() })), async (c) => {
  const { message, model } = c.req.valid('json');
  const userId = c.get('userId');
  const convId = c.req.param('id');
  if (!(await getMessages(convId, userId))) return c.json({ error: 'Not found' }, 404);
  await addMessage(convId, 'user', message);
  const reply = await fakeModelReply(message, model);
  await addMessage(convId, 'assistant', reply.text);
  await recordUsage(userId, reply.model, reply.tokens, reply.cost);
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
      await recordUsage(userId, reply.model, reply.tokens, reply.cost);
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
await initDb();
Bun.serve({ fetch: app.fetch, port });
