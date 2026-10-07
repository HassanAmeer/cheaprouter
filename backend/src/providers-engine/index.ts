// ---------------------------------------------------------------------------
// Providers Engine — High-Performance Universal AI Provider Gateway
// ---------------------------------------------------------------------------

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleGetModels } from './models.ts';
import { handleCompletions } from './completions.ts';
import { handleAnthropicMessages } from './anthropic.ts';
import {
  getProvidersDiagnosticList,
  testProviderHealth,
  testAllActiveProviders,
  testCustomRawKey,
} from './diagnostics.ts';
import { renderDashboardHtml } from './dashboard.ts';

const app = new Hono();

// Global CORS configuration
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'x-api-key',
      'anthropic-version',
      'x-session-id',
      'x-from-dashboard',
    ],
    exposeHeaders: ['X-Provider'],
  })
);

// 1. Interactive Web Dashboard & Status UI
app.get('/dashboard', (c) => c.html(renderDashboardHtml()));
app.get('/status', (c) => c.html(renderDashboardHtml()));

// 2. Health & Status JSON Endpoints
app.get('/', (c) =>
  c.json({
    status: 'online',
    service: 'providers-engine',
    version: '1.0.0',
    endpoints: {
      dashboard: '/dashboard',
      models: '/v1/models',
      providers: '/v1/providers',
      testAll: '/v1/providers/test',
      verifyKey: '/v1/providers/verify-key',
      chat: '/v1/chat/completions',
      messages: '/v1/messages',
    },
  })
);

app.get('/health', (c) => c.json({ ok: true, timestamp: Date.now() }));

// 3. Provider Diagnostics & Live Health Check APIs
app.get('/v1/providers', async (c) => {
  const list = await getProvidersDiagnosticList();
  return c.json({ providers: list });
});

app.post('/v1/providers/test', async (c) => {
  const results = await testAllActiveProviders();
  return c.json(results);
});

app.post('/v1/providers/test/:id', async (c) => {
  const id = c.req.param('id');
  const result = await testProviderHealth(id);
  return c.json(result);
});

// Verify ANY raw API key on-demand before saving into database
app.post('/v1/providers/verify-key', async (c) => {
  try {
    const body = await c.req.json();
    if (!body?.apiKey) {
      return c.json({ ok: false, error: 'Missing apiKey parameter in request body' }, 400);
    }
    const result = await testCustomRawKey(body);
    return c.json(result);
  } catch (err: any) {
    return c.json({ ok: false, error: err?.message || 'Verification failed' }, 500);
  }
});

// 4. Universal AI Protocol Endpoints
app.get('/v1/models', async () => await handleGetModels());
app.post('/v1/chat/completions', async (c) => await handleCompletions(c));
app.post('/v1/messages', async (c) => await handleAnthropicMessages(c));

const PORT = Number(process.env.PORT || 4001);

console.log(`\n⚡ Providers Engine Gateway starting on port ${PORT}...`);
console.log(`   - Control Hub & UI:   http://localhost:${PORT}/dashboard`);
console.log(`   - OpenAI Base URL:    http://localhost:${PORT}/v1`);
console.log(`   - Anthropic Base URL: http://localhost:${PORT}`);
console.log(`   - Model List:         http://localhost:${PORT}/v1/models\n`);

export default {
  port: PORT,
  fetch: app.fetch,
};
