import postgres from 'postgres';

const DB_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cheapmodels';
const db = postgres(DB_URL);

const tokenharborModels = [
  { id: 'claude-opus-5', name: 'Claude Opus 5', provider: 'tokenharbor' },
  { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol', provider: 'tokenharbor' },
  { id: 'kimi-k3', name: 'Kimi K3', provider: 'tokenharbor' },
  { id: 'qwen3.8-max', name: 'Qwen3.8 Max', provider: 'tokenharbor' },
  { id: 'grok-4.5', name: 'Grok 4.5', provider: 'tokenharbor' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'tokenharbor' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'tokenharbor' }
];

const aiandModels = [
  { id: 'qwen/qwen3.6-27b', name: 'Qwen 3.6 27B', provider: 'aiand' },
  { id: 'deepseek-ai/deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'aiand' },
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B IT', provider: 'aiand' },
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', provider: 'aiand' },
  { id: 'deepseek-ai/deepseek-v4-pro', name: 'DeepSeek V4 Pro', provider: 'aiand' },
  { id: 'moonshotai/kimi-k2.7-code', name: 'Kimi K2.7 Code', provider: 'aiand' },
  { id: 'moonshotai/kimi-k2.6', name: 'Kimi K2.6', provider: 'aiand' },
  { id: 'zai-org/glm-5.2', name: 'GLM 5.2', provider: 'aiand' },
  { id: 'zai-org/glm-5.1', name: 'GLM 5.1', provider: 'aiand' }
];

function mapToSelected(models: any[]) {
  return models.map(m => ({
    originalId: m.id,
    originalName: m.name,
    name: m.name,
    id: m.id.split('/').pop()!.replace(/[^a-zA-Z0-9_-]/g, '_'),
    text: true,
    image: false,
    vision: false,
    audio: false,
    reasoning: false,
    video: false
  }));
}

async function run() {
  const thModels = mapToSelected(tokenharborModels);
  const aiModels = mapToSelected(aiandModels);

  await db`
    UPDATE admin_providers SET models = ${db.json(thModels)} WHERE id = 'ap_tokenharbor'
  `;

  await db`
    UPDATE admin_providers SET models = ${db.json(aiModels)} WHERE id = 'ap_aiand'
  `;

  console.log("Models loaded into database.");
  process.exit(0);
}

run().catch(console.error);
