/**
 * CheapRouter - Database Seed Script
 * Run: bun run seed.ts
 *
 * Seeds: 10 users, api_keys, providers, conversations+messages, usage (30-day), notifications, admin_providers, global_settings
 */

import postgres from 'postgres';

const DB_URL = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/cheapmodels';
const db = postgres(DB_URL, { max: 5 });

// ── Helpers ─────────────────────────────────────────────────────────────────
function genId(prefix: string) {
  return prefix + '_' + crypto.randomUUID().slice(0, 8) + Math.random().toString(36).slice(2, 6);
}

function hashPassword(password: string): string {
  let h = 2166136261;
  for (let i = 0; i < password.length; i++) {
    h ^= password.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0') + '-' + password.length;
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 864e5);
}

function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── 1. USERS ─────────────────────────────────────────────────────────────────
const USERS = [
  { name: 'Alice Johnson',   email: 'alice@example.com',   password: 'password123', plan: 'Pro',        plan_cli: 'Pro',        plan_api: 'Pro',        plan_chat: 'Pro',   plan_agents: 'Free', status: 'Active',   joinedDaysAgo: 90 },
  { name: 'Bob Williams',    email: 'bob@example.com',     password: 'password123', plan: 'Free',       plan_cli: 'Free',       plan_api: 'Free',       plan_chat: 'Free',  plan_agents: 'Free', status: 'Active',   joinedDaysAgo: 75 },
  { name: 'Charlie Brown',   email: 'charlie@example.com', password: 'password123', plan: 'Enterprise', plan_cli: 'Enterprise', plan_api: 'Enterprise', plan_chat: 'Pro',   plan_agents: 'Pro',  status: 'Active',   joinedDaysAgo: 60 },
  { name: 'Diana Prince',    email: 'diana@example.com',   password: 'password123', plan: 'Pro',        plan_cli: 'Pro',        plan_api: 'Free',       plan_chat: 'Pro',   plan_agents: 'Free', status: 'Active',   joinedDaysAgo: 55 },
  { name: 'Ethan Hunt',      email: 'ethan@example.com',   password: 'password123', plan: 'Free',       plan_cli: 'Free',       plan_api: 'Free',       plan_chat: 'Free',  plan_agents: 'Free', status: 'Suspended', joinedDaysAgo: 45 },
  { name: 'Fiona Green',     email: 'fiona@example.com',   password: 'password123', plan: 'Pro',        plan_cli: 'Free',       plan_api: 'Pro',        plan_chat: 'Pro',   plan_agents: 'Free', status: 'Active',   joinedDaysAgo: 40 },
  { name: 'George Clark',    email: 'george@example.com',  password: 'password123', plan: 'Enterprise', plan_cli: 'Enterprise', plan_api: 'Enterprise', plan_chat: 'Enterprise', plan_agents: 'Enterprise', status: 'Active', joinedDaysAgo: 30 },
  { name: 'Hannah White',    email: 'hannah@example.com',  password: 'password123', plan: 'Free',       plan_cli: 'Free',       plan_api: 'Free',       plan_chat: 'Free',  plan_agents: 'Free', status: 'Active',   joinedDaysAgo: 25 },
  { name: 'Ivan Drago',      email: 'ivan@example.com',    password: 'password123', plan: 'Pro',        plan_cli: 'Pro',        plan_api: 'Pro',        plan_chat: 'Free',  plan_agents: 'Free', status: 'Active',   joinedDaysAgo: 15 },
  { name: 'Julia Roberts',   email: 'julia@example.com',   password: 'password123', plan: 'Free',       plan_cli: 'Free',       plan_api: 'Free',       plan_chat: 'Free',  plan_agents: 'Free', status: 'Active',   joinedDaysAgo: 5  },
];

// ── 2. MODELS (same as backend catalog) ──────────────────────────────────────
const MODELS = ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro', 'llama-3-70b', 'deepseek-coder-v2'];

// ── 3. CONVERSATION TOPICS ────────────────────────────────────────────────────
const CONVERSATION_TOPICS = [
  { title: 'How does CheapModels routing work?', question: 'Can you explain how CheapModels routes API requests?', answer: 'CheapModels uses a smart routing layer that sends your requests to the cheapest available provider that meets your latency and quality requirements. It normalizes all providers to OpenAI-compatible format.' },
  { title: 'Compare Claude vs GPT-4o', question: 'What are the key differences between Claude 3.5 Sonnet and GPT-4o?', answer: 'Claude 3.5 Sonnet excels at long-context tasks and nuanced writing, while GPT-4o is faster and better for tool-use and function calling. Both are excellent — choose based on your specific use case.' },
  { title: 'Setting up my API key', question: 'How do I set up my OpenAI API key with CheapModels?', answer: 'Go to Settings → API Keys, click "Add Provider", select OpenAI, and paste your key. CheapModels will mask and store it securely. Your key will be used for routing when OpenAI is selected.' },
  { title: 'Understanding token costs', question: 'How are token costs calculated in CheapModels?', answer: 'Token costs vary by model. GPT-4o costs $5/M input and $15/M output. Claude 3.5 Sonnet is $3/M input and $15/M output. Gemini 1.5 Pro offers a very large 2M context at $3.50/M input.' },
  { title: 'Gemini 1.5 Pro context window', question: 'What is the context window of Gemini 1.5 Pro?', answer: 'Gemini 1.5 Pro has an impressive 2 million token context window, the largest available. This makes it ideal for analyzing large codebases, long documents, or hour-long video transcripts.' },
  { title: 'Using DeepSeek for coding tasks', question: 'Is DeepSeek Coder V2 good for programming tasks?', answer: 'Yes! DeepSeek Coder V2 is an excellent choice for coding tasks and is extremely cost-effective at $0.14/M input tokens. It performs competitively with GPT-4o on many coding benchmarks at a fraction of the cost.' },
  { title: 'Switching models mid-project', question: 'Can I switch models without changing my code?', answer: 'Absolutely! CheapModels normalizes all providers to the OpenAI API schema. Just change the model field in your API calls and everything else stays the same.' },
  { title: 'Llama 3 70B for local-style inference', question: 'What are the advantages of using Llama 3 70B through CheapModels?', answer: 'Llama 3 70B is Meta\'s open-source model available at just $0.50/M tokens. It is great for general tasks, summarization, and question answering at a very low cost.' },
  { title: 'Rate limits and concurrent requests', question: 'Does CheapModels handle rate limiting automatically?', answer: 'Yes, CheapModels implements automatic retry and failover logic. If one provider hits rate limits, it seamlessly switches to an alternative provider to keep your requests flowing.' },
  { title: 'Best model for summarization', question: 'Which model do you recommend for text summarization tasks?', answer: 'For summarization, Claude 3.5 Sonnet is usually the best choice due to its strong comprehension. For large documents, Gemini 1.5 Pro\'s 2M context window is unbeatable. GPT-4o is a solid middle ground.' },
  { title: 'API endpoint configuration', question: 'What is the API endpoint I should use with CheapModels?', answer: 'Use https://api.cheapmodels.ai/v1/chat/completions as a drop-in replacement for the OpenAI API. Set your base URL and API key, and you are ready to go!' },
  { title: 'Monthly usage report', question: 'How do I view my monthly token usage?', answer: 'Visit the Analytics section in your dashboard. You will see a detailed breakdown by model, day, and cost. The dashboard auto-refreshes to show real-time usage.' },
  { title: 'Setting up provider routing priority', question: 'Can I set a preferred provider order?', answer: 'In the Provider Routing admin panel, you can set priority scores for each provider. Higher priority providers are tried first, with automatic failover to lower priority ones if unavailable.' },
  { title: 'Function calling support', question: 'Do all models support function calling / tool use?', answer: 'GPT-4o and Claude 3.5 Sonnet have the best function calling support. Gemini 1.5 Pro also supports it. Llama 3 and DeepSeek have limited or experimental tool use support.' },
  { title: 'Streaming responses setup', question: 'How do I enable streaming responses?', answer: 'Set stream: true in your API request body, just like with the standard OpenAI SDK. CheapModels uses Server-Sent Events (SSE) and is fully compatible with the OpenAI streaming protocol.' },
];

// ── 4. NOTIFICATIONS ──────────────────────────────────────────────────────────
const GLOBAL_NOTIFICATIONS = [
  { title: '🎉 Welcome to CheapModels!', message: 'Thank you for joining CheapModels. You now have access to the best AI models at the lowest cost. Explore the dashboard to get started with your first API call.' },
  { title: '🚀 New Feature: Provider Routing', message: 'We have launched smart provider routing! CheapModels now automatically selects the cheapest available provider for your requests. No changes needed on your end.' },
  { title: '⚡ Gemini 1.5 Pro Now Available', message: 'Google\'s Gemini 1.5 Pro with a 2 million token context window is now available on CheapModels. Try it today at just $3.50 per million input tokens.' },
  { title: '🔧 Scheduled Maintenance', message: 'We will be performing scheduled maintenance on August 15th from 2:00 AM to 4:00 AM UTC. Service may be briefly interrupted. We apologize for any inconvenience.' },
  { title: '📊 Monthly Usage Report Ready', message: 'Your detailed usage report for last month is now ready. Visit the Analytics section of your dashboard to view your token usage, costs, and model breakdown.' },
];

const USER_SPECIFIC_NOTIFICATIONS = [
  { title: '🔑 API Key Expiring Soon', message: 'Your API key "Production Key" will expire in 7 days. Please rotate it in the API Keys section to avoid service interruption.' },
  { title: '📈 Usage Spike Detected', message: 'We noticed an unusual spike in your API usage yesterday. If this was not you, please check your API keys and rotate them immediately.' },
  { title: '💳 Plan Upgrade Available', message: 'You have been using CheapModels consistently! Upgrade to Pro and get priority routing, higher rate limits, and 20% cost savings on all API calls.' },
  { title: '✅ Provider Key Verified', message: 'Your OpenAI API key has been successfully verified and is now active. Your requests will be routed through your own key for maximum control.' },
  { title: '🛡️ Security Alert: New Login', message: 'A new login was detected from an unrecognized device. If this was you, no action is needed. Otherwise, please change your password immediately.' },
];

// ── MAIN SEED FUNCTION ────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting CheapRouter database seeding...\n');

  // ── 1. USERS ────────────────────────────────────────────────────────────────
  console.log('👥 Seeding 10 users...');
  const userIds: string[] = [];

  for (const u of USERS) {
    // Skip if email already exists
    const existing = await db`SELECT id FROM users WHERE email = ${u.email}`;
    if (existing.length > 0) {
      console.log(`  ⚠️  User ${u.email} already exists, skipping.`);
      userIds.push(existing[0].id);
      continue;
    }

    const id = genId('usr');
    const joinedAt = daysAgo(u.joinedDaysAgo);
    const lastLogin = daysAgo(randBetween(0, Math.min(u.joinedDaysAgo - 1, 10)));

    await db`
      INSERT INTO users (id, name, email, password_hash, plan, plan_cli, plan_api, plan_chat, plan_agents, status, last_login, created_at)
      VALUES (
        ${id}, ${u.name}, ${u.email}, ${hashPassword(u.password)},
        ${u.plan}, ${u.plan_cli}, ${u.plan_api}, ${u.plan_chat}, ${u.plan_agents},
        ${u.status}, ${lastLogin.toISOString()}, ${joinedAt.toISOString()}
      )
    `;
    userIds.push(id);
    console.log(`  ✅ Created user: ${u.name} (${u.plan})`);
  }

  // ── 2. USER API KEYS ────────────────────────────────────────────────────────
  console.log('\n🔑 Seeding user API keys...');
  const keyNames = ['Production Key', 'Development Key', 'Test Environment'];

  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    const existing = await db`SELECT id FROM api_keys WHERE user_id = ${userId} LIMIT 1`;
    if (existing.length > 0) { console.log(`  ⚠️  Keys for user ${i+1} already exist, skipping.`); continue; }

    const numKeys = randBetween(1, 2);
    for (let k = 0; k < numKeys; k++) {
      const keyId = genId('key');
      const rawKey = 'cr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 32);
      const keyPrefix = rawKey.slice(0, 8);
      const keyHash = hashPassword(rawKey);
      const keyName = keyNames[k % keyNames.length];
      const createdAt = daysAgo(randBetween(1, 60));
      const lastUsed = daysAgo(randBetween(0, 5));

      await db`
        INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash, created_at, last_used)
        VALUES (${keyId}, ${userId}, ${keyName}, ${keyPrefix}, ${keyHash}, ${createdAt.toISOString()}, ${lastUsed.toISOString()})
      `;
    }
    console.log(`  ✅ Created ${numKeys} API key(s) for user ${i + 1}`);
  }

  // ── 3. USER BYOK PROVIDERS ─────────────────────────────────────────────────
  console.log('\n🔌 Seeding user BYOK providers...');
  const byokProviders = [
    { provider: 'openai',    masked: '••••••••••••1234' },
    { provider: 'anthropic', masked: '••••••••••••5678' },
    { provider: 'google',    masked: '••••••••••••9012' },
  ];

  for (let i = 0; i < Math.min(5, userIds.length); i++) {
    const userId = userIds[i];
    const existing = await db`SELECT id FROM providers WHERE user_id = ${userId} LIMIT 1`;
    if (existing.length > 0) { console.log(`  ⚠️  Providers for user ${i+1} already exist, skipping.`); continue; }

    const numProviders = randBetween(1, 2);
    for (let p = 0; p < numProviders; p++) {
      const prov = byokProviders[p];
      const provId = genId('prov');
      const status = Math.random() > 0.2 ? 'active' : 'paused';
      await db`
        INSERT INTO providers (id, user_id, provider, masked_key, status)
        VALUES (${provId}, ${userId}, ${prov.provider}, ${prov.masked}, ${status})
      `;
    }
    console.log(`  ✅ Created ${numProviders} BYOK provider(s) for user ${i + 1}`);
  }

  // ── 4. CONVERSATIONS + MESSAGES ─────────────────────────────────────────────
  console.log('\n💬 Seeding conversations and messages...');

  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    const existing = await db`SELECT id FROM conversations WHERE user_id = ${userId} LIMIT 1`;
    if (existing.length > 0) { console.log(`  ⚠️  Conversations for user ${i+1} already exist, skipping.`); continue; }

    const numConvs = randBetween(3, 6);
    for (let c = 0; c < numConvs; c++) {
      const topic = CONVERSATION_TOPICS[c % CONVERSATION_TOPICS.length];
      const convId = genId('conv');
      const convDate = daysAgo(randBetween(0, 30));

      await db`
        INSERT INTO conversations (id, user_id, title, created_at)
        VALUES (${convId}, ${userId}, ${topic.title}, ${convDate.toISOString()})
      `;

      // Add 2-4 message pairs
      const numPairs = randBetween(2, 4);
      for (let m = 0; m < numPairs; m++) {
        const msgDate = new Date(convDate.getTime() + m * 60000);
        const alternativeTopic = CONVERSATION_TOPICS[(c + m + 1) % CONVERSATION_TOPICS.length];
        const question = m === 0 ? topic.question : alternativeTopic.question;
        const answer = m === 0 ? topic.answer : alternativeTopic.answer;

        const userMsgId = genId('msg');
        await db`
          INSERT INTO messages (id, conversation_id, role, content, created_at)
          VALUES (${userMsgId}, ${convId}, 'user', ${question}, ${new Date(msgDate.getTime()).toISOString()})
        `;

        const botMsgId = genId('msg');
        await db`
          INSERT INTO messages (id, conversation_id, role, content, created_at)
          VALUES (${botMsgId}, ${convId}, 'assistant', ${answer}, ${new Date(msgDate.getTime() + 2000).toISOString()})
        `;
      }
    }
    console.log(`  ✅ Created ${numConvs} conversations for user ${i + 1}`);
  }

  // ── 5. USAGE / ANALYTICS (30 days) ──────────────────────────────────────────
  console.log('\n📊 Seeding 30-day usage analytics...');

  const MODEL_COSTS: Record<string, { input: number; output: number }> = {
    'gpt-4o':            { input: 0.000005, output: 0.000015 },
    'claude-3-5-sonnet': { input: 0.000003, output: 0.000015 },
    'gemini-1.5-pro':    { input: 0.0000035, output: 0.0000105 },
    'llama-3-70b':       { input: 0.0000005, output: 0.0000005 },
    'deepseek-coder-v2': { input: 0.00000014, output: 0.00000028 },
  };

  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    const existing = await db`SELECT id FROM usage WHERE user_id = ${userId} LIMIT 1`;
    if (existing.length > 0) { console.log(`  ⚠️  Usage for user ${i+1} already exists, skipping.`); continue; }

    for (let d = 0; d < 30; d++) {
      const dayDate = daysAgo(30 - d);
      const dayStr = dayDate.toISOString().slice(0, 10);
      const modelsUsedToday = randBetween(1, 3);

      for (let m = 0; m < modelsUsedToday; m++) {
        const model = pick(MODELS);
        const tokens = randBetween(500, 8000);
        const costInfo = MODEL_COSTS[model];
        const cost = Number((tokens * (costInfo.input + costInfo.output) / 2).toFixed(6));
        const usageId = genId('usg');

        await db`
          INSERT INTO usage (id, user_id, model, tokens, cost, day)
          VALUES (${usageId}, ${userId}, ${model}, ${tokens}, ${cost}, ${dayStr})
        `;
      }
    }
    console.log(`  ✅ Created 30-day usage records for user ${i + 1}`);
  }

  // ── 6. NOTIFICATIONS ─────────────────────────────────────────────────────────
  console.log('\n🔔 Seeding notifications...');

  // Global notifications (user_id = NULL → shown to ALL users)
  const existingGlobal = await db`SELECT id FROM notifications WHERE user_id IS NULL LIMIT 1`;
  if (existingGlobal.length > 0) {
    console.log('  ⚠️  Global notifications already exist, skipping.');
  } else {
    for (const notif of GLOBAL_NOTIFICATIONS) {
      const notifId = genId('notif');
      const createdAt = daysAgo(randBetween(1, 30));
      await db`
        INSERT INTO notifications (id, user_id, title, message, read, created_at)
        VALUES (${notifId}, NULL, ${notif.title}, ${notif.message}, FALSE, ${createdAt.toISOString()})
      `;
    }
    console.log(`  ✅ Created ${GLOBAL_NOTIFICATIONS.length} global notifications`);
  }

  // Per-user notifications
  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    const existing = await db`SELECT id FROM notifications WHERE user_id = ${userId} LIMIT 1`;
    if (existing.length > 0) { console.log(`  ⚠️  Notifications for user ${i+1} already exist, skipping.`); continue; }

    const numNotifs = randBetween(2, 3);
    for (let n = 0; n < numNotifs; n++) {
      const notif = USER_SPECIFIC_NOTIFICATIONS[n % USER_SPECIFIC_NOTIFICATIONS.length];
      const notifId = genId('notif');
      const createdAt = daysAgo(randBetween(0, 14));
      const isRead = Math.random() > 0.4;

      await db`
        INSERT INTO notifications (id, user_id, title, message, read, created_at)
        VALUES (${notifId}, ${userId}, ${notif.title}, ${notif.message}, ${isRead}, ${createdAt.toISOString()})
      `;
    }
    console.log(`  ✅ Created ${numNotifs} notifications for user ${i + 1}`);
  }

  // ── 7. ADMIN PROVIDERS (Global routing config) ────────────────────────────
  console.log('\n🌐 Seeding admin provider routing...');
  const existingAdminProvs = await db`SELECT id FROM admin_providers LIMIT 1`;
  if (existingAdminProvs.length > 0) {
    console.log('  ⚠️  Admin providers already exist, skipping.');
  } else {
    const adminProviders = [
      { id: 'ap_google', name: 'Google Gemini', status: true, key: 'AIza••••••••••••••••demo', priority: 3, base_url: 'https://generativelanguage.googleapis.com/v1beta/openai', api_format: 'openai', models: [{"id":"gemini-3.6-flash","name":"Gemini 3.6 Flash"},{"id":"gemini-3.5-flash","name":"Gemini 3.5 Flash"},{"id":"gemini-3.5-flash-lite","name":"Gemini 3.5 Flash-Lite"},{"id":"gemini-3.1-flash-lite","name":"Gemini 3.1 Flash-Lite"},{"id":"gemini-2.5-flash","name":"Gemini 2.5 Flash"},{"id":"gemini-2.5-flash-lite","name":"Gemini 2.5 Flash-Lite"}] },
      { id: 'ap_groq', name: 'Groq', status: true, key: 'ap_groq-••••••••demo', priority: 15, base_url: 'https://api.groq.com/openai/v1', api_format: 'openai', models: [{"id":"openai/gpt-oss-120b","name":"GPT OSS 120B"},{"id":"openai/gpt-oss-20b","name":"GPT OSS 20B"},{"id":"llama-3.3-70b-versatile","name":"Llama 3.3 70B"},{"id":"openai/gpt-oss-safeguard-20b","name":"GPT OSS Safeguard 20B"},{"id":"qwen/qwen3.6-27b","name":"Qwen 3.6 27B"},{"id":"llama-3.1-8b-instant","name":"Llama 3.1 8B Instant"}] },
      { id: 'ap_openrouter', name: 'OpenRouter', status: true, key: 'ap_openrouter-••••••••demo', priority: 10, base_url: 'https://openrouter.ai/api/v1', api_format: 'openrouter', models: [{"id":"deepseek/deepseek-v4-flash:free","name":"DeepSeek V4 Flash Free"},{"id":"nvidia/nemotron-3-ultra-550b-a55b:free","name":"NVIDIA Nemotron 3 Ultra Free"},{"id":"nvidia/nemotron-3-super-120b-a12b:free","name":"NVIDIA Nemotron 3 Super Free"},{"id":"nvidia/nemotron-3.5-content-safety:free","name":"NVIDIA Nemotron 3.5 Content Safety Free"},{"id":"poolside/laguna-s-2.1:free","name":"Poolside Laguna S 2.1 Free"},{"id":"inclusionai/ling-3.0-tiny:free","name":"Ling 3.0 Tiny Free"},{"id":"openrouter/free","name":"Free Models Router"}] },
      { id: 'ap_mistralai', name: 'Mistral AI', status: true, key: 'ap_mistralai-••••••••demo', priority: 15, base_url: '', api_format: 'openai', models: [{"id":"mistral-small-2506","name":"Mistral Small 3.2"},{"id":"codestral-2501","name":"Codestral"},{"id":"devstral-small-2505","name":"Devstral Small"}] },
      { id: 'ap_nvidianim', name: 'Nvidia NIM', status: true, key: 'ap_nvidianim-••••••••demo', priority: 15, base_url: '', api_format: 'openai', models: [{"id":"nvidia/nemotron-3-ultra-550b-a55b","name":"Nemotron 3 Ultra"},{"id":"nvidia/nemotron-3-super-120b-a12b","name":"Nemotron 3 Super"},{"id":"nvidia/nemotron-3-nano-30b-a3b","name":"Nemotron 3 Nano 30B A3B"},{"id":"nvidia/nemotron-nano-9b-v2","name":"Nemotron Nano 9B V2"},{"id":"openai/gpt-oss-120b","name":"GPT OSS 120B"},{"id":"openai/gpt-oss-20b","name":"GPT OSS 20B"}] },
      { id: 'ap_siliconflow', name: 'SiliconFlow', status: true, key: 'ap_siliconflow-••••••••demo', priority: 35, base_url: 'https://api.siliconflow.cn/v1', api_format: 'openai', models: [{"id":"Qwen/Qwen3.5-4B","name":"Qwen3.5 4B"},{"id":"PaddlePaddle/PaddleOCR-VL-1.5","name":"PaddleOCR-VL 1.5"},{"id":"deepseek-ai/DeepSeek-R1-Distill-Qwen-7B","name":"DeepSeek R1 Distill Qwen 7B"},{"id":"THUDM/GLM-4.1V-9B-Thinking","name":"GLM-4.1V-9B-Thinking"},{"id":"deepseek-ai/DeepSeek-OCR","name":"DeepSeek OCR"},{"id":"Qwen/Qwen3-8B","name":"Qwen3 8B"},{"id":"tencent/Hunyuan-MT-7B","name":"Hunyuan-MT 7B"}] },
      { id: 'ap_modelscope', name: 'ModelScope', status: true, key: 'ap_modelscope-••••••••demo', priority: 41, base_url: 'https://api-inference.modelscope.cn/v1', api_format: 'openai', models: [{"id":"Qwen/Qwen3-32B","name":"Qwen3 32B"},{"id":"Qwen/Qwen3-235B-A22B-Instruct-2507","name":"Qwen3 235B A22B Instruct 2507"},{"id":"Qwen/Qwen3-Coder-480B-A35B-Instruct","name":"Qwen3 Coder 480B A35B"}] },
      { id: 'ap_huggingface', name: 'HuggingFace', status: true, key: 'ap_huggingface-••••••••demo', priority: 27, base_url: 'https://api-inference.huggingface.co/v1', api_format: 'openai', models: [{"id":"deepseek-ai/DeepSeek-V3-0324","name":"DeepSeek V3 0324"},{"id":"Qwen/Qwen3-Coder-480B-A35B-Instruct","name":"Qwen3 Coder 480B A35B"}] },
      { id: 'ap_opencode', name: 'OpenCode', status: true, key: 'ap_opencode-••••••••demo', priority: 11, base_url: 'https://opencode.ai/zen/v1', api_format: 'openai', models: [{"id":"deepseek-v4-flash-free","name":"DeepSeek V4 Flash Free"},{"id":"mimo-v2.5-free","name":"MiMo-V2.5 Free"},{"id":"laguna-s-2.1-free","name":"Laguna S 2.1 Free"},{"id":"nemotron-3.5-lightning-free","name":"Nemotron 3.5 Lightning Free"},{"id":"nemotron-3-ultra-free","name":"Nemotron 3 Ultra Free"},{"id":"hy3-free","name":"HY3 Free"},{"id":"big-pickle","name":"Big Pickle"}] },
      { id: 'ap_cohere', name: 'Cohere', status: true, key: 'ap_cohere-••••••••demo', priority: 14, base_url: 'https://api.cohere.com/v1', api_format: 'cohere', models: [{"id":"command-a-03-2025","name":"Command A"},{"id":"command-a-reasoning-08-2025","name":"Command A Reasoning"},{"id":"command-r7b-12-2024","name":"Command R7B"}] },
      { id: 'ap_cerebras', name: 'Cerebras', status: true, key: 'ap_cerebras-••••••••demo', priority: 15, base_url: 'https://api.cerebras.ai/v1', api_format: 'openai', models: [{"id":"gpt-oss-120b","name":"GPT OSS 120B"},{"id":"zai-glm-4.7","name":"ZAI GLM 4.7"},{"id":"gemma-4-31b","name":"Gemma 4 31B"}] },
      { id: 'ap_sambanova', name: 'SambaNova', status: true, key: 'ap_sambanova-••••••••demo', priority: 15, base_url: 'https://api.sambanova.ai/v1', api_format: 'openai', models: [{"id":"DeepSeek-V3.1","name":"DeepSeek V3.1"},{"id":"Meta-Llama-3.3-70B-Instruct","name":"Llama 3.3 70B Instruct"},{"id":"gpt-oss-120b","name":"GPT OSS 120B"}] },
      { id: 'ap_aihorde', name: 'AI Horde', status: true, key: 'ap_aihorde-••••••••demo', priority: 42, base_url: 'https://aihorde.net/api/v2', api_format: 'openai', models: [{"id":"meta-llama/Llama-3.1-8B-Instruct","name":"Llama 3.1 8B Instruct"}] },
      { id: 'ap_pollinations', name: 'Pollinations', status: true, key: 'ap_pollinations-••••••••demo', priority: 43, base_url: 'https://text.pollinations.ai/v1', api_format: 'openai', models: [{"id":"gemini-3-flash","name":"Gemini 3 Flash"},{"id":"gemini-flash-lite-3.1","name":"Gemini Flash Lite 3.1"},{"id":"mistral-small-3.2","name":"Mistral Small 3.2"},{"id":"qwen-coder","name":"Qwen Coder"},{"id":"deepseek","name":"DeepSeek"}] },
      { id: 'ap_bytez', name: 'Bytez', status: true, key: 'ap_bytez-••••••••demo', priority: 15, base_url: 'https://api.bytez.com/v1', api_format: 'openai', models: [{"id":"Qwen/Qwen2.5-7B-Instruct","name":"Qwen 2.5 7B Instruct"},{"id":"meta-llama/Llama-3.1-8B-Instruct","name":"Llama 3.1 8B Instruct"}] },
      { id: 'ap_tokenrouter', name: 'TokenRouter', status: false, key: 'ap_tokenrouter-••••••••demo', priority: 46, base_url: 'https://api.tokenrouter.com/v1', api_format: 'openai', models: [] },
      { id: 'ap_zai', name: 'Zai', status: true, key: 'ap_zai-••••••••demo', priority: 30, base_url: 'https://api.z.ai/v1', api_format: 'openai', models: [{"id":"glm-4.7-flash","name":"GLM-4.7-Flash"},{"id":"glm-4.6v-flash","name":"GLM-4.6V-Flash"}] },
      { id: 'ap_kilocode', name: 'KiloCode', status: true, key: 'ap_kilocode-••••••••demo', priority: 32, base_url: 'https://api.kilocode.ai/v1', api_format: 'openai', models: [{"id":"stepfun/step-3.7-flash:free","name":"Step 3.7 Flash Free"},{"id":"poolside/laguna-m.1:free","name":"Laguna M.1 Free"},{"id":"nvidia/nemotron-3-ultra-550b-a55b:free","name":"Nemotron 3 Ultra Free"},{"id":"google/gemma-4-26b-a4b-it:free","name":"Gemma 4 26B A4B Free"},{"id":"kilo-auto/free","name":"Auto Free"}] },
      { id: 'ap_unorouter', name: 'UnoRouter', status: true, key: 'ap_unorouter-••••••••demo', priority: 37, base_url: 'https://api.unorouter.com/v1', api_format: 'openai', models: [{"id":"free","name":"Free Model Pool"}] },
      { id: 'ap_llm7', name: 'LLM7', status: true, key: 'ap_llm7-••••••••demo', priority: 40, base_url: 'https://api.llm7.io/v1', api_format: 'openai', models: [{"id":"free","name":"Free Model Pool"}] },
      { id: 'ap_poixe', name: 'Poixe', status: true, key: 'ap_poixe-••••••••demo', priority: 34, base_url: 'https://api.poixe.com/v1', api_format: 'openai', models: [{"id":"claude-3-5-haiku-20241022:free","name":"Claude 3.5 Haiku Free"},{"id":"cli2api/claude-sonnet-4-6:free","name":"Claude Sonnet 4.6 Free"},{"id":"cli2api/gpt-5.3-codex:free","name":"GPT 5.3 Codex Free"}] },
      { id: 'ap_zenmux', name: 'Zenmux', status: true, key: 'ap_zenmux-••••••••demo', priority: 36, base_url: 'https://api.zenmux.ai/v1', api_format: 'openai', models: [{"id":"z-ai/glm-4.7-flash-free","name":"GLM 4.7 Flash Free"},{"id":"z-ai/glm-4.6v-flash-free","name":"GLM 4.6V Flash Free"},{"id":"stepfun/step-3.5-flash-free","name":"Step 3.5 Flash Free"},{"id":"xiaomi/mimo-v2-flash-free","name":"MiMo V2 Flash Free"},{"id":"kuaishou/kat-coder-pro-v1-free","name":"KAT Coder Pro V1 Free"}] },
      { id: 'ap_routeway', name: 'Routeway', status: true, key: 'ap_routeway-••••••••demo', priority: 38, base_url: 'https://api.routeway.ai/v1', api_format: 'openai', models: [{"id":"step-3-7-flash:free","name":"Step 3.7 Flash"},{"id":"gemma-4-31b:free","name":"Gemma 4 31B"},{"id":"gpt-oss-120b:free","name":"GPT OSS 120B"},{"id":"ling-3.0-flash:free","name":"Ling 3.0 Flash"},{"id":"nemotron-nano-9b-v2:free","name":"Nemotron Nano 9B V2"},{"id":"nemotron-3-nano-30b-a3b:free","name":"Nemotron 3 Nano 30B A3B"},{"id":"llama-3.3-70b-instruct:free","name":"Llama 3.3 70B Instruct"}] },
      { id: 'ap_agnesai', name: 'AgnesAI', status: false, key: 'ap_agnesai-••••••••demo', priority: 45, base_url: 'https://api.agnes-ai.com/v1', api_format: 'openai', models: [] },
      { id: 'ap_tokenharbor', name: 'TokenHarbor', status: true, key: 'ap_tokenharbor-••••••••demo', priority: 16, base_url: 'https://api.tokenharbor.ai/v1', api_format: 'openai', models: [{"id":"deepseek-v4-flash","name":"DeepSeek V4 Flash"},{"id":"mimo-v2.5","name":"MiMo V2.5"},{"id":"kimi-k3","name":"Kimi K3"}] },
      { id: 'ap_openai', name: 'OpenAI', status: false, key: 'sk-••••••••••••••••••••••••••••demo', priority: 1, base_url: 'https://api.openai.com/v1', api_format: 'openai', models: [] },
      { id: 'ap_anthropic', name: 'Anthropic', status: false, key: 'sk-ant-••••••••••••••••demo', priority: 2, base_url: 'https://api.anthropic.com/v1', api_format: 'anthropic', models: [] },
      { id: 'ap_deepseek', name: 'DeepSeek', status: false, key: 'sk-••••deepseek-demo', priority: 5, base_url: 'https://api.deepseek.com/v1', api_format: 'openai', models: [] },
      { id: 'ap_perplexity', name: 'Perplexity', status: false, key: 'ap_perplexity-••••••••demo', priority: 16, base_url: 'https://api.perplexity.ai', api_format: 'openai', models: [] },
      { id: 'ap_together', name: 'Together', status: false, key: 'ap_together-••••••••demo', priority: 16, base_url: 'https://api.together.xyz/v1', api_format: 'openai', models: [] },
      { id: 'ap_fireworks', name: 'Fireworks', status: false, key: 'ap_fireworks-••••••••demo', priority: 16, base_url: 'https://api.fireworks.ai/inference/v1', api_format: 'openai', models: [] },
      { id: 'ap_xai', name: 'XAI', status: false, key: 'ap_xai-••••••••demo', priority: 15, base_url: 'https://api.x.ai/v1', api_format: 'openai', models: [] },
      { id: 'ap_novita', name: 'Novita', status: false, key: 'ap_novita-••••••••demo', priority: 15, base_url: 'https://api.novita.ai/v3/openai', api_format: 'openai', models: [] },
      { id: 'ap_aimlapi', name: 'AIMLAPI', status: false, key: 'ap_aimlapi-••••••••demo', priority: 15, base_url: 'https://api.aimlapi.com/v1', api_format: 'openai', models: [] },
      { id: 'ap_amazonbedrock', name: 'AmazonBedrock', status: false, key: 'ap_amazonbedrock-••••••••demo', priority: 25, base_url: 'https://bedrock.proxy/v1', api_format: 'openai', models: [] },
      { id: 'ap_hyperbolic', name: 'Hyperbolic', status: false, key: 'ap_hyperbolic-••••••••demo', priority: 28, base_url: 'https://api.hyperbolic.ai/v1', api_format: 'openai', models: [] },
      { id: 'ap_moonshot', name: 'Moonshot', status: false, key: 'ap_moonshot-••••••••demo', priority: 29, base_url: 'https://api.moonshot.cn/v1', api_format: 'openai', models: [] },
      { id: 'ap_ai', name: 'ai&', status: false, key: 'ap_ai-••••••••demo', priority: 15, base_url: '', api_format: 'openai', models: [] },
      { id: 'ap_clinecode', name: 'ClineCode', status: false, key: 'ap_clinecode-••••••••demo', priority: 33, base_url: 'https://api.clinecode.ai/v1', api_format: 'openai', models: [] },
      { id: 'ap_stepfun', name: 'StepFun', status: false, key: 'ap_stepfun-••••••••demo', priority: 39, base_url: 'https://api.stepfun.com/v1', api_format: 'openai', models: [] },
      { id: 'ap_anyrouter', name: 'AnyRouter', status: false, key: 'ap_anyrouter-••••••••demo', priority: 44, base_url: 'https://api.anyrouter.dev/v1', api_format: 'openai', models: [] },
      { id: 'ap_meta', name: 'Meta', status: false, key: 'meta-••••••••demo', priority: 4, base_url: 'https://api.meta.ai/v1', api_format: 'openai', models: [] },
      { id: 'ap_aiand', name: 'ai&', status: false, key: 'ap_aiand-••••••••demo', priority: 17, base_url: 'https://api.aiand.com/v1', api_format: 'openai', models: [] },
      { id: 'ap_mistral', name: 'Mistral', status: false, key: 'ap_mistral-••••••••demo', priority: 16, base_url: 'https://api.mistral.ai/v1', api_format: 'openai', models: [] },
      { id: 'ap_github', name: 'Github', status: false, key: 'ap_github-••••••••demo', priority: 26, base_url: 'https://models.inference.ai.azure.com', api_format: 'openai', models: [] },
      { id: 'ap_nvidia', name: 'Nvidia', status: false, key: 'ap_nvidia-••••••••demo', priority: 31, base_url: 'https://integrate.api.nvidia.com/v1', api_format: 'openai', models: [] },
    ];

    for (const p of adminProviders) {
      await db`
        INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
        VALUES (${p.id}, ${p.name}, ${p.status}, ${p.key}, ${p.priority}, ${p.base_url}, ${p.api_format}, false, ${db.json(p.models)}, ${db.json([])})
      `;
    }
    console.log(`  ✅ Created ${adminProviders.length} admin provider routing configs`);
  }

  // ── 8. GLOBAL SETTINGS ────────────────────────────────────────────────────
  console.log('\n⚙️  Seeding global settings...');
  const existingSettings = await db`SELECT id FROM global_settings WHERE id = 'global'`;
  if (existingSettings.length > 0) {
    console.log('  ⚠️  Global settings already exist, skipping.');
  } else {
    const defaultSettings = {
      siteName: 'CheapRouter',
      siteTagline: 'The Cheapest Way to Access World-Class AI',
      siteDescription: 'Access GPT-4o, Claude, Gemini, and more through a single unified API at the lowest cost.',
      heroTitle: 'Access World-Class AI at\nUnbeatable Prices',
      heroSubtitle: 'Route your AI requests through CheapRouter to save up to 90% on API costs with zero code changes.',
      primaryCTA: 'Start Free Today',
      secondaryCTA: 'View Pricing',
      supportEmail: 'support@cheaprouter.ai',
      pricingPlans: [
        { name: 'Free',       price: 0,    features: ['1,000 requests/month', 'Access to 5 models', 'Standard routing', 'Community support'] },
        { name: 'Pro',        price: 29,   features: ['100,000 requests/month', 'All models', 'Priority routing', 'Email support', 'Usage analytics', 'BYOK support'] },
        { name: 'Enterprise', price: 199,  features: ['Unlimited requests', 'All models', 'Dedicated routing', '24/7 support', 'Custom SLA', 'Team management', 'Advanced analytics'] },
      ],
      features: [
        { title: 'Unified API',       description: 'One endpoint for all AI providers. OpenAI-compatible format.' },
        { title: 'Cost Optimization', description: 'Automatically routes to the cheapest provider for each request.' },
        { title: 'Zero Downtime',     description: 'Automatic failover ensures 99.9% uptime across providers.' },
        { title: 'Usage Analytics',   description: 'Detailed cost and token tracking with model breakdown.' },
      ],
    };

    await db`
      INSERT INTO global_settings (id, data)
      VALUES ('global', ${db.json(defaultSettings)})
    `;
    console.log('  ✅ Created global settings with site config, plans, and features');
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────────────
  const counts = await Promise.all([
    db`SELECT count(*) as c FROM users`,
    db`SELECT count(*) as c FROM api_keys`,
    db`SELECT count(*) as c FROM providers`,
    db`SELECT count(*) as c FROM conversations`,
    db`SELECT count(*) as c FROM messages`,
    db`SELECT count(*) as c FROM usage`,
    db`SELECT count(*) as c FROM notifications`,
    db`SELECT count(*) as c FROM admin_providers`,
  ]);

  console.log('\n✅ Seeding complete! Database summary:');
  console.log(`   👥 Users:           ${counts[0][0].c}`);
  console.log(`   🔑 API Keys:        ${counts[1][0].c}`);
  console.log(`   🔌 BYOK Providers:  ${counts[2][0].c}`);
  console.log(`   💬 Conversations:   ${counts[3][0].c}`);
  console.log(`   📨 Messages:        ${counts[4][0].c}`);
  console.log(`   📊 Usage Records:   ${counts[5][0].c}`);
  console.log(`   🔔 Notifications:   ${counts[6][0].c}`);
  console.log(`   🌐 Admin Providers: ${counts[7][0].c}`);
  console.log('\n🎉 All done! Login with any user at password: password123\n');

  await db.end();
}

seed().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); });
