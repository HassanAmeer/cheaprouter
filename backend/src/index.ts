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
import { MODEL_REGISTRY } from './registry.ts';
import { listConversations, getMessages, createConversation, addMessage, renameConversation } from './conversations.ts';
import { handleCompletions, getModelInstance, getSystemPromptForModel } from './completions.ts';
import { generateText, streamText } from 'ai';
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

// Protect all /api routes except auth, models catalog
app.use('/api/*', async (c, next) => {
  const p = c.req.path;
  if (p.endsWith('/auth/login') || p.endsWith('/auth/signup') || p.endsWith('/auth/admin-login') || p === '/api/models') {
    return next();
  }
  if (p.startsWith('/api/admin')) {
    return requireAdminAuth(c, next);
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

async function requireAdminAuth(c: any, next: any) {
  const header = c.req.header('Authorization') ?? '';
  const token = header.replace('Bearer ', '');
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') return c.json({ error: 'Unauthorized' }, 401);
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

app.post('/api/auth/admin-login', zValidator('json', z.object({ username: z.string(), password: z.string() })), async (c) => {
  const { username, password } = c.req.valid('json');
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || '1234';
  
  if (username === adminUser && password === adminPass) {
    const token = await signToken({ sub: 'admin', email: 'admin@system', role: 'admin' } as any);
    return c.json({ token, user: { role: 'admin' } });
  }
  return c.json({ error: 'Invalid admin credentials' }, 401);
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

app.delete('/api/admin/users', zValidator('json', z.object({ ids: z.array(z.string()) })), async (c) => {
  const { ids } = c.req.valid('json');
  for (const id of ids) {
    await adminDeleteUser(id);
  }
  return c.json({ ok: true, count: ids.length });
});

app.put('/api/admin/users/bulk', zValidator('json', z.object({ ids: z.array(z.string()), data: z.any() })), async (c) => {
  const { ids, data } = c.req.valid('json');
  for (const id of ids) {
    await adminUpdateUser(id, data);
  }
  return c.json({ ok: true, count: ids.length });
});

app.get('/api/admin/submissions', async (c) => {
  const submissions = await db`SELECT id, user_id as "userId", user_name as "userName", url, status, created_at as date FROM submissions ORDER BY created_at DESC`;
  return c.json({ submissions });
});

app.put('/api/admin/submissions/:id', zValidator('json', z.object({ status: z.enum(['pending', 'approved', 'rejected']) })), async (c) => {
  const { status } = c.req.valid('json');
  await db`UPDATE submissions SET status = ${status} WHERE id = ${c.req.param('id')}`;
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
  const aiModel = await getModelInstance(userId, 'gpt-4o');
  const systemPrompt = await getSystemPromptForModel('gpt-4o');
  const result = await generateText({ model: aiModel, prompt: message, system: systemPrompt || undefined });
  const replyText = result.text;
  const tokens = result.usage?.totalTokens ?? 150;
  
  await addMessage(convId, 'assistant', replyText);
  await recordUsage(userId, 'gpt-4o', tokens, tokens * 0.000003);
  return c.json({ id: convId, messages: [{ role: 'user', content: message }, { role: 'assistant', content: replyText }] }, 201);
});

app.post('/api/conversations/:id/messages', zValidator('json', z.object({ message: z.string().min(1), model: z.string().optional() })), async (c) => {
  const { message, model } = c.req.valid('json');
  const userId = c.get('userId');
  const convId = c.req.param('id');
  if (!(await getMessages(convId, userId))) return c.json({ error: 'Not found' }, 404);
  await addMessage(convId, 'user', message);
  const aiModel = await getModelInstance(userId, model || 'gpt-4o');
  const systemPrompt = await getSystemPromptForModel(model || 'gpt-4o');
  const result = await generateText({ model: aiModel, prompt: message, system: systemPrompt || undefined });
  const replyText = result.text;
  const tokens = result.usage?.totalTokens ?? 150;
  
  await addMessage(convId, 'assistant', replyText);
  await recordUsage(userId, model || 'gpt-4o', tokens, tokens * 0.000003);
  return c.json({ message: { role: 'assistant', content: replyText } });
});

app.post('/api/v1/chat/completions', handleCompletions);
app.post('/v1/chat/completions', handleCompletions); // Accept both for easy proxying

// Streaming chat (SSE)
app.get('/api/stream', async (c) => {
  const userId = c.get('userId');
  const url = new URL(c.req.url);
  const prompt = url.searchParams.get('prompt') ?? '';
  const model = url.searchParams.get('model') ?? 'gpt-4o';
  try {
    const aiModel = await getModelInstance(userId, model);
    const systemPrompt = await getSystemPromptForModel(model);
    const result = await streamText({ model: aiModel, prompt, system: systemPrompt || undefined });

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        for await (const chunk of result.textStream) {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
        }
        controller.enqueue(enc.encode(`data: [DONE]\n\n`));
        controller.close();
        
        // Wait for final usage
        const usage = await result.usage;
        const tokens = usage?.totalTokens ?? 150;
        await recordUsage(userId, model, tokens, tokens * 0.000003);
      },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } });
  } catch (error: any) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
        controller.close();
      }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
  }
});

// ---- Global Settings ----
app.get('/api/settings', async (c) => {
  const result = await db`SELECT data FROM global_settings WHERE id = 'global'`;
  if (result.length > 0) return c.json(result[0].data);
  return c.json({}); // Will return empty if not initialized, frontend will merge with defaults
});

app.put('/api/settings', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO global_settings (id, data) 
    VALUES ('global', ${db.json(data)}) 
    ON CONFLICT (id) DO UPDATE SET data = ${db.json(data)}
  `;
  return c.json(data);
});

// ---- Global Admin Providers ----
app.get('/api/admin/providers', async (c) => {
  const result = await db`SELECT * FROM admin_providers ORDER BY priority ASC`;
  return c.json(result);
});

app.put('/api/admin/providers', zValidator('json', z.array(z.any())), async (c) => {
  const providers = c.req.valid('json');
  await db`DELETE FROM admin_providers`;
  for (const p of providers) {
    await db`
      INSERT INTO admin_providers (id, name, status, key, priority, base_url, use_models_api, models_api_link, api_format, is_custom, models, headers)
      VALUES (${p.id}, ${p.name}, ${p.status ?? true}, ${p.key}, ${p.priority ?? 0}, ${p.baseUrl ?? null}, ${p.useModelsApi ?? false}, ${p.modelsApiLink ?? null}, ${p.apiFormat ?? null}, ${p.isCustom ?? false}, ${db.json(p.models ?? [])}, ${db.json(p.headers ?? [])})
    `;
  }
  return c.json({ success: true });
});

// ---- OpenCode Setup ----
app.get('/api/admin/opencode', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_opencode'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/opencode', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_opencode', 'OpenCode', ${data.status}, ${data.key}, 11, 'https://opencode.ai/zen/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/opencode/models', async (c) => {
  try {
    const apiKey = c.req.query('key') || '';
    const res = await fetch('https://opencode.ai/zen/v1/models', {
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
    });
    const data = await res.json();
    return c.json(data);
  } catch (e) {
    return c.json({ error: 'Failed to fetch OpenCode models' }, 500);
  }
});

// ---- OpenRouter Setup ----
app.get('/api/admin/openrouter', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_openrouter'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/openrouter', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_openrouter', 'OpenRouter', ${data.status}, ${data.key}, 10, 'https://openrouter.ai/api/v1', 'openrouter', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

// ---- OpenAI Setup ----
app.get('/api/admin/openai', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_openai'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/openai', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_openai', 'OpenAI', ${data.status}, ${data.key}, 12, 'https://api.openai.com/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/openai/models', async (c) => {
  try {
    const apiKey = c.req.query('key') || '';
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
    });
    const data = await res.json();
    return c.json(data);
  } catch (e) {
    return c.json({ error: 'Failed to fetch OpenAI models' }, 500);
  }
});

// ---- Anthropic Setup ----
app.get('/api/admin/anthropic', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_anthropic'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/anthropic', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_anthropic', 'Anthropic', ${data.status}, ${data.key}, 13, 'https://api.anthropic.com/v1', 'anthropic', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/anthropic/models', async (c) => {
  try {
    const apiKey = c.req.query('key') || '';
    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: apiKey ? { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' } : {}
    });
    const data = await res.json();
    return c.json(data);
  } catch (e) {
    return c.json({ error: 'Failed to fetch Anthropic models' }, 500);
  }
});

// ---- Cohere Setup ----
app.get('/api/admin/cohere', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_cohere'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/cohere', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_cohere', 'Cohere', ${data.status}, ${data.key}, 14, 'https://api.cohere.com/v1', 'cohere', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/cohere/models', async (c) => {
  try {
    const apiKey = c.req.query('key') || '';
    const res = await fetch('https://api.cohere.com/v1/models', {
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
    });
    const data = await res.json();
    return c.json(data);
  } catch (e) {
    return c.json({ error: 'Failed to fetch Cohere models' }, 500);
  }
});


app.get('/api/admin/groq', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_groq'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/groq', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_groq', 'Groq', ${data.status}, ${data.key}, 15, 'https://api.groq.com/openai/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/groq/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['groq'] || [] });
});

app.get('/api/admin/google', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_google'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/google', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_google', 'Google', ${data.status}, ${data.key}, 15, 'https://generativelanguage.googleapis.com/v1beta/openai', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/google/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['google'] || [] });
});

app.get('/api/admin/cerebras', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_cerebras'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/cerebras', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_cerebras', 'Cerebras', ${data.status}, ${data.key}, 15, 'https://api.cerebras.ai/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/cerebras/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['cerebras'] || [] });
});

app.get('/api/admin/sambanova', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_sambanova'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/sambanova', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_sambanova', 'SambaNova', ${data.status}, ${data.key}, 15, 'https://api.sambanova.ai/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/sambanova/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['sambanova'] || [] });
});

app.get('/api/admin/xai', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_xai'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/xai', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_xai', 'XAI', ${data.status}, ${data.key}, 15, 'https://api.x.ai/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/xai/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['xai'] || [] });
});

app.get('/api/admin/novita', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_novita'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/novita', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_novita', 'Novita', ${data.status}, ${data.key}, 15, 'https://api.novita.ai/v3/openai', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/novita/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['novita'] || [] });
});

app.get('/api/admin/bytez', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_bytez'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/bytez', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_bytez', 'Bytez', ${data.status}, ${data.key}, 15, 'https://api.bytez.com/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/bytez/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['bytez'] || [] });
});

app.get('/api/admin/aimlapi', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_aimlapi'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/aimlapi', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_aimlapi', 'AIMLAPI', ${data.status}, ${data.key}, 15, 'https://api.aimlapi.com/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/aimlapi/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['aimlapi'] || [] });
});


app.get('/api/admin/mistral', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_mistral'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/mistral', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_mistral', 'Mistral', ${data.status}, ${data.key}, 16, 'https://api.mistral.ai/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/mistral/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['mistral'] || [] });
});

app.get('/api/admin/together', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_together'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/together', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_together', 'Together', ${data.status}, ${data.key}, 16, 'https://api.together.xyz/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/together/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['together'] || [] });
});

app.get('/api/admin/deepseek', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_deepseek'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/deepseek', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_deepseek', 'DeepSeek', ${data.status}, ${data.key}, 16, 'https://api.deepseek.com/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/deepseek/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['deepseek'] || [] });
});

app.get('/api/admin/fireworks', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_fireworks'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/fireworks', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_fireworks', 'Fireworks', ${data.status}, ${data.key}, 16, 'https://api.fireworks.ai/inference/v1', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/fireworks/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['fireworks'] || [] });
});

app.get('/api/admin/perplexity', async (c) => {
  const result = await db`SELECT * FROM admin_providers WHERE id = 'ap_perplexity'`;
  if (result.length > 0) return c.json({
    key: result[0].key,
    status: result[0].status,
    models: result[0].models || []
  });
  return c.json({ key: '', status: false, models: [] });
});

app.put('/api/admin/perplexity', zValidator('json', z.any()), async (c) => {
  const data = c.req.valid('json');
  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES ('ap_perplexity', 'Perplexity', ${data.status}, ${data.key}, 16, 'https://api.perplexity.ai', 'openai', true, ${db.json(data.models)}, ${db.json([])})
    ON CONFLICT (id) DO UPDATE SET 
      key = ${data.key},
      status = ${data.status},
      models = ${db.json(data.models)}
  `;
  return c.json({ success: true });
});

app.get('/api/admin/perplexity/models', async (c) => {
  return c.json({ data: MODEL_REGISTRY['perplexity'] || [] });
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
  
  try {
    const allProviders = await db`SELECT * FROM admin_providers WHERE status = true`;
    for (const provider of allProviders) {
      const providerModels = provider.models || [];
      for (const m of providerModels) {
        const exists = models.some(existing => existing.id === m.id && existing.provider === provider.name);
        if (!exists) {
          models.push({
            id: m.id,
            name: m.name,
            provider: provider.name,
            context: m.contextWindow || 'Dynamic',
            input: m.inputPrice || 'Variable',
            output: m.outputPrice || 'Variable'
          });
        }
      }
    }
  } catch (e) {}

  return c.json({ models });
});



// ---- Admin: Database Seeding ----
import { hashPassword as _hp } from './auth.ts';

app.post('/api/admin/seed', zValidator('json', z.object({ section: z.string() })), async (c) => {
  const { section } = c.req.valid('json');

  function genSeedId(prefix: string) {
    return prefix + '_' + crypto.randomUUID().slice(0, 8) + Math.random().toString(36).slice(2, 6);
  }
  function daysAgo(n: number) { return new Date(Date.now() - n * 864e5); }
  function randBetween(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

  const MODELS = ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro', 'llama-3-70b', 'deepseek-coder-v2'];

  const SEED_USERS = [
    { name: 'Alice Johnson',   email: 'alice@example.com',   plan: 'Pro',        plan_cli: 'Pro',        plan_api: 'Pro',        plan_chat: 'Pro',        plan_agents: 'Free',       status: 'Active',    days: 90 },
    { name: 'Bob Williams',    email: 'bob@example.com',     plan: 'Free',       plan_cli: 'Free',       plan_api: 'Free',       plan_chat: 'Free',       plan_agents: 'Free',       status: 'Active',    days: 75 },
    { name: 'Charlie Brown',   email: 'charlie@example.com', plan: 'Enterprise', plan_cli: 'Enterprise', plan_api: 'Enterprise', plan_chat: 'Pro',        plan_agents: 'Pro',        status: 'Active',    days: 60 },
    { name: 'Diana Prince',    email: 'diana@example.com',   plan: 'Pro',        plan_cli: 'Pro',        plan_api: 'Free',       plan_chat: 'Pro',        plan_agents: 'Free',       status: 'Active',    days: 55 },
    { name: 'Ethan Hunt',      email: 'ethan@example.com',   plan: 'Free',       plan_cli: 'Free',       plan_api: 'Free',       plan_chat: 'Free',       plan_agents: 'Free',       status: 'Suspended', days: 45 },
    { name: 'Fiona Green',     email: 'fiona@example.com',   plan: 'Pro',        plan_cli: 'Free',       plan_api: 'Pro',        plan_chat: 'Pro',        plan_agents: 'Free',       status: 'Active',    days: 40 },
    { name: 'George Clark',    email: 'george@example.com',  plan: 'Enterprise', plan_cli: 'Enterprise', plan_api: 'Enterprise', plan_chat: 'Enterprise', plan_agents: 'Enterprise', status: 'Active',    days: 30 },
    { name: 'Hannah White',    email: 'hannah@example.com',  plan: 'Free',       plan_cli: 'Free',       plan_api: 'Free',       plan_chat: 'Free',       plan_agents: 'Free',       status: 'Active',    days: 25 },
    { name: 'Ivan Drago',      email: 'ivan@example.com',    plan: 'Pro',        plan_cli: 'Pro',        plan_api: 'Pro',        plan_chat: 'Free',       plan_agents: 'Free',       status: 'Active',    days: 15 },
    { name: 'Julia Roberts',   email: 'julia@example.com',   plan: 'Free',       plan_cli: 'Free',       plan_api: 'Free',       plan_chat: 'Free',       plan_agents: 'Free',       status: 'Active',    days: 5  },
  ];

  const CONV_TOPICS = [
    { title: 'How does CheapModels routing work?', q: 'Can you explain how CheapModels routes API requests?', a: 'CheapModels uses a smart routing layer that sends your requests to the cheapest available provider that meets your latency and quality requirements. It normalizes all providers to OpenAI-compatible format.' },
    { title: 'Compare Claude vs GPT-4o', q: 'What are the key differences between Claude 3.5 Sonnet and GPT-4o?', a: 'Claude 3.5 Sonnet excels at long-context tasks and nuanced writing, while GPT-4o is faster for tool-use. Both are excellent — choose based on your specific use case.' },
    { title: 'Understanding token costs', q: 'How are token costs calculated in CheapModels?', a: 'Token costs vary by model. GPT-4o costs $5/M input and $15/M output. Claude 3.5 Sonnet is $3/M input. Gemini 1.5 Pro offers a 2M context at $3.50/M input.' },
    { title: 'Gemini 1.5 Pro context window', q: 'What is the context window of Gemini 1.5 Pro?', a: 'Gemini 1.5 Pro has an impressive 2 million token context window, the largest available. This makes it ideal for analyzing large codebases or long documents.' },
    { title: 'Using DeepSeek for coding', q: 'Is DeepSeek Coder V2 good for programming tasks?', a: 'Yes! DeepSeek Coder V2 is extremely cost-effective at $0.14/M input tokens. It performs competitively with GPT-4o on many coding benchmarks at a fraction of the cost.' },
    { title: 'Setting up API key', q: 'How do I set up my OpenAI API key with CheapModels?', a: 'Go to Settings → API Keys, click Add Provider, select OpenAI, and paste your key. CheapModels will mask and store it securely.' },
    { title: 'Switching models mid-project', q: 'Can I switch models without changing my code?', a: 'Absolutely! CheapModels normalizes all providers to the OpenAI API schema. Just change the model field in your API calls.' },
    { title: 'Rate limits and failover', q: 'Does CheapModels handle rate limiting automatically?', a: 'Yes, CheapModels implements automatic retry and failover logic. If one provider hits rate limits, it seamlessly switches to an alternative.' },
    { title: 'Streaming responses', q: 'How do I enable streaming responses?', a: 'Set stream: true in your API request body, just like with the standard OpenAI SDK. CheapModels uses SSE and is fully compatible with the OpenAI streaming protocol.' },
    { title: 'Monthly usage analytics', q: 'How do I view my monthly token usage?', a: 'Visit the Analytics section in your dashboard. You will see a detailed breakdown by model, day, and cost. The dashboard auto-refreshes to show real-time usage.' },
  ];

  const GLOBAL_NOTIFS = [
    { title: '🎉 Welcome to CheapModels!', msg: 'Thank you for joining CheapModels. You now have access to the best AI models at the lowest cost. Explore the dashboard to get started.' },
    { title: '🚀 New Feature: Provider Routing', msg: 'We have launched smart provider routing! CheapModels now automatically selects the cheapest available provider. No changes needed on your end.' },
    { title: '⚡ Gemini 1.5 Pro Now Available', msg: "Google's Gemini 1.5 Pro with a 2 million token context window is now available. Try it today at just $3.50 per million input tokens." },
    { title: '🔧 Scheduled Maintenance', msg: 'We will be performing scheduled maintenance on Aug 15th from 2:00 AM to 4:00 AM UTC. Service may be briefly interrupted.' },
    { title: '📊 Monthly Usage Report Ready', msg: 'Your detailed usage report for last month is now ready. Visit the Analytics section to view your token usage, costs, and model breakdown.' },
  ];

  const USER_NOTIFS = [
    { title: '🔑 API Key Expiring Soon', msg: 'Your API key "Production Key" will expire in 7 days. Please rotate it to avoid service interruption.' },
    { title: '📈 Usage Spike Detected', msg: 'We noticed an unusual spike in your API usage yesterday. If this was not you, please check and rotate your API keys immediately.' },
    { title: '💳 Plan Upgrade Available', msg: 'You have been using CheapModels consistently! Upgrade to Pro for priority routing, higher rate limits, and 20% cost savings.' },
    { title: '✅ Provider Key Verified', msg: 'Your OpenAI API key has been successfully verified and is now active. Requests will be routed through your own key.' },
    { title: '🛡️ Security Alert: New Login', msg: 'A new login was detected from an unrecognized device. If this was you, no action is needed. Otherwise, change your password immediately.' },
  ];

  const MODEL_COSTS: Record<string, number> = {
    'gpt-4o': 0.00001, 'claude-3-5-sonnet': 0.000009, 'gemini-1.5-pro': 0.0000073,
    'llama-3-70b': 0.000001, 'deepseek-coder-v2': 0.00000021,
  };

  try {
    if (section === 'users') {
      let created = 0;
      for (const u of SEED_USERS) {
        const ex = await db`SELECT id FROM users WHERE email = ${u.email}`;
        if (ex.length > 0) continue;
        const id = genSeedId('usr');
        const start = daysAgo(u.days).toISOString();
        const expiry = daysAgo(u.days - 365).toISOString(); // 1 year expiry
        await db`INSERT INTO users (
          id, name, email, password_hash, plan, 
          plan_cli, plan_api, plan_chat, plan_agents, 
          plan_cli_start, plan_cli_expiry, 
          plan_api_start, plan_api_expiry, 
          plan_chat_start, plan_chat_expiry, 
          plan_agents_start, plan_agents_expiry, 
          status, last_login, created_at
        ) VALUES (
          ${id}, ${u.name}, ${u.email}, ${_hp('password123')}, ${u.plan}, 
          ${u.plan_cli}, ${u.plan_api}, ${u.plan_chat}, ${u.plan_agents}, 
          ${start}, ${expiry}, 
          ${start}, ${expiry}, 
          ${start}, ${expiry}, 
          ${start}, ${expiry}, 
          ${u.status}, ${daysAgo(randBetween(0,5)).toISOString()}, ${start}
        )`;
        created++;
      }
      return c.json({ ok: true, message: `Created ${created} users (skipped ${SEED_USERS.length - created} existing)` });
    }

    if (section === 'api_keys') {
      const users = await db`SELECT id FROM users WHERE email = ANY(${SEED_USERS.map(u => u.email)})`;
      const keyNames = ['Production Key', 'Development Key', 'Test Environment'];
      let created = 0;
      for (const user of users) {
        const ex = await db`SELECT id FROM api_keys WHERE user_id = ${user.id} LIMIT 1`;
        if (ex.length > 0) continue;
        const numKeys = randBetween(1, 2);
        for (let k = 0; k < numKeys; k++) {
          const keyId = genSeedId('key');
          const rawKey = 'cr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 32);
          await db`INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash, created_at, last_used)
            VALUES (${keyId}, ${user.id}, ${keyNames[k % keyNames.length]}, ${rawKey.slice(0,8)}, ${_hp(rawKey)}, ${daysAgo(randBetween(1,60)).toISOString()}, ${daysAgo(randBetween(0,5)).toISOString()})`;
          created++;
        }
      }
      return c.json({ ok: true, message: `Created ${created} API keys` });
    }

    if (section === 'providers') {
      const users = await db`SELECT id FROM users WHERE email = ANY(${SEED_USERS.slice(0,5).map(u => u.email)})`;
      const byok = [{ provider: 'openai', masked: '••••••••••••1234' }, { provider: 'anthropic', masked: '••••••••••••5678' }];
      let created = 0;
      for (const user of users) {
        const ex = await db`SELECT id FROM providers WHERE user_id = ${user.id} LIMIT 1`;
        if (ex.length > 0) continue;
        const prov = byok[Math.floor(Math.random() * byok.length)];
        await db`INSERT INTO providers (id, user_id, provider, masked_key, status)
          VALUES (${genSeedId('prov')}, ${user.id}, ${prov.provider}, ${prov.masked}, 'active')`;
        created++;
      }
      return c.json({ ok: true, message: `Created ${created} BYOK providers` });
    }

    if (section === 'conversations') {
      const users = await db`SELECT id FROM users WHERE email = ANY(${SEED_USERS.map(u => u.email)})`;
      let convCount = 0, msgCount = 0;
      for (const user of users) {
        const ex = await db`SELECT id FROM conversations WHERE user_id = ${user.id} LIMIT 1`;
        if (ex.length > 0) continue;
        const numConvs = randBetween(3, 6);
        for (let c = 0; c < numConvs; c++) {
          const topic = CONV_TOPICS[c % CONV_TOPICS.length];
          const convId = genSeedId('conv');
          const convDate = daysAgo(randBetween(0, 30));
          await db`INSERT INTO conversations (id, user_id, title, created_at) VALUES (${convId}, ${user.id}, ${topic.title}, ${convDate.toISOString()})`;
          convCount++;
          const numPairs = randBetween(2, 4);
          for (let m = 0; m < numPairs; m++) {
            const t2 = CONV_TOPICS[(c + m + 1) % CONV_TOPICS.length];
            const tBase = new Date(convDate.getTime() + m * 60000);
            await db`INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (${genSeedId('msg')}, ${convId}, 'user', ${m===0?topic.q:t2.q}, ${tBase.toISOString()})`;
            await db`INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (${genSeedId('msg')}, ${convId}, 'assistant', ${m===0?topic.a:t2.a}, ${new Date(tBase.getTime()+2000).toISOString()})`;
            msgCount += 2;
          }
        }
      }
      return c.json({ ok: true, message: `Created ${convCount} conversations and ${msgCount} messages` });
    }

    if (section === 'usage') {
      const users = await db`SELECT id FROM users WHERE email = ANY(${SEED_USERS.map(u => u.email)})`;
      let count = 0;
      for (const user of users) {
        const ex = await db`SELECT id FROM usage WHERE user_id = ${user.id} LIMIT 1`;
        if (ex.length > 0) continue;
        for (let d = 0; d < 30; d++) {
          const dayDate = daysAgo(30 - d);
          const dayStr = dayDate.toISOString().slice(0, 10);
          const mCount = randBetween(1, 3);
          for (let m = 0; m < mCount; m++) {
            const model = pick(MODELS);
            const tokens = randBetween(500, 8000);
            const cost = Number((tokens * (MODEL_COSTS[model] ?? 0.000005)).toFixed(6));
            await db`INSERT INTO usage (id, user_id, model, tokens, cost, day) VALUES (${genSeedId('usg')}, ${user.id}, ${model}, ${tokens}, ${cost}, ${dayStr})`;
            count++;
          }
        }
      }
      return c.json({ ok: true, message: `Created ${count} usage records (30 days × 10 users)` });
    }

    if (section === 'notifications') {
      let count = 0;
      const exGlobal = await db`SELECT id FROM notifications WHERE user_id IS NULL LIMIT 1`;
      if (exGlobal.length === 0) {
        for (const n of GLOBAL_NOTIFS) {
          await db`INSERT INTO notifications (id, user_id, title, message, read, created_at)
            VALUES (${genSeedId('notif')}, NULL, ${n.title}, ${n.msg}, FALSE, ${daysAgo(randBetween(1,30)).toISOString()})`;
          count++;
        }
      }
      const users = await db`SELECT id FROM users WHERE email = ANY(${SEED_USERS.map(u => u.email)})`;
      for (const user of users) {
        const ex = await db`SELECT id FROM notifications WHERE user_id = ${user.id} LIMIT 1`;
        if (ex.length > 0) continue;
        const numN = randBetween(2, 3);
        for (let n = 0; n < numN; n++) {
          const notif = USER_NOTIFS[n % USER_NOTIFS.length];
          await db`INSERT INTO notifications (id, user_id, title, message, read, created_at)
            VALUES (${genSeedId('notif')}, ${user.id}, ${notif.title}, ${notif.msg}, ${Math.random() > 0.4}, ${daysAgo(randBetween(0,14)).toISOString()})`;
          count++;
        }
      }
      return c.json({ ok: true, message: `Created ${count} notifications` });
    }

    if (section === 'plans') {
      const exSettings = await db`SELECT id FROM global_settings WHERE id = 'global'`;
      const settings = {
        siteName: 'CheapRouter', siteTagline: 'The Cheapest Way to Access World-Class AI',
        heroTitle: 'Access World-Class AI at\nUnbeatable Prices',
        heroSubtitle: 'Route your AI requests through CheapRouter to save up to 90% on API costs with zero code changes.',
        primaryCTA: 'Start Free Today', secondaryCTA: 'View Pricing', supportEmail: 'support@cheaprouter.ai',
        pricingPlans: [
          { name: 'Free',       price: 0,   features: ['1,000 requests/month', 'Access to 5 models', 'Standard routing', 'Community support'] },
          { name: 'Pro',        price: 29,  features: ['100,000 requests/month', 'All models', 'Priority routing', 'Email support', 'Usage analytics', 'BYOK support'] },
          { name: 'Enterprise', price: 199, features: ['Unlimited requests', 'All models', 'Dedicated routing', '24/7 support', 'Custom SLA', 'Team management', 'Advanced analytics'] },
        ],
      };
      if (exSettings.length === 0) {
        await db`INSERT INTO global_settings (id, data) VALUES ('global', ${db.json(settings)})`;
      }
      // seed admin providers
      const exProvs = await db`SELECT id FROM admin_providers LIMIT 1`;
      let provCount = 0;
      if (exProvs.length === 0) {
        const adminProviders = [
          { id: 'ap_openai', name: 'OpenAI', status: true, key: 'sk-demo', priority: 1, base_url: 'https://api.openai.com/v1', api_format: 'openai', models: ['gpt-4o','gpt-4o-mini'] },
          { id: 'ap_anthropic', name: 'Anthropic', status: true, key: 'sk-ant-demo', priority: 2, base_url: 'https://api.anthropic.com', api_format: 'anthropic', models: ['claude-3-5-sonnet','claude-3-haiku'] },
          { id: 'ap_google', name: 'Google', status: true, key: 'AIza-demo', priority: 3, base_url: 'https://generativelanguage.googleapis.com/v1beta', api_format: 'google', models: ['gemini-1.5-pro','gemini-1.5-flash'] },
          { id: 'ap_meta', name: 'Meta', status: false, key: 'meta-demo', priority: 4, base_url: 'https://api.meta.ai/v1', api_format: 'openai', models: ['llama-3-70b'] },
          { id: 'ap_deepseek', name: 'DeepSeek', status: true, key: 'sk-ds-demo', priority: 5, base_url: 'https://api.deepseek.com/v1', api_format: 'openai', models: ['deepseek-coder-v2'] },
        ];
        for (const p of adminProviders) {
          await db`INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
            VALUES (${p.id}, ${p.name}, ${p.status}, ${p.key}, ${p.priority}, ${p.base_url}, ${p.api_format}, false, ${db.json(p.models)}, ${db.json([])})`;
          provCount++;
        }
      }
      return c.json({ ok: true, message: `Seeded plans/settings + ${provCount} admin provider configs` });
    }

    return c.json({ error: 'Unknown section' }, 400);
  } catch (e: any) {
    return c.json({ error: e.message ?? 'Seed error' }, 500);
  }
});

app.delete('/api/admin/seed', async (c) => {
  try {
    // True wipe - delete all users and their related data (via CASCADE)
    await db`DELETE FROM users`;
    // Clean up any global unattached notifications
    await db`DELETE FROM notifications WHERE user_id IS NULL`;
    // Delete admin providers config
    await db`DELETE FROM admin_providers`;
    // Delete global settings (plans)
    await db`DELETE FROM global_settings WHERE id = 'global'`;
    return c.json({ ok: true, message: 'All test data and users wiped completely' });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

const port = Number(process.env.PORT ?? 4000);
console.log(`CheapModels backend listening on http://localhost:${port}`);
await initDb();
Bun.serve({ fetch: app.fetch, port });

