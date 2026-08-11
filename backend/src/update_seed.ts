import fs from 'fs';
import path from 'path';

// 1. Extract ALL_PROVIDERS_INFO from providersInfo.ts
const providersInfoStr = fs.readFileSync(path.join(__dirname, '../../src/app/admin/providers/manage/providersInfo.ts'), 'utf8');
const jsonMatch = providersInfoStr.match(/export const ALL_PROVIDERS_INFO = (\[[\s\S]*\]);/);
if (!jsonMatch) {
  console.error('Could not find ALL_PROVIDERS_INFO');
  process.exit(1);
}
const providersInfo = eval(jsonMatch[1]); // It's valid JSON-like array

// 2. Map provider UI names to IDs based on generate_seed_providers.js
const uiToIdMap = {
  'Google Gemini': 'ap_google',
  'Groq': 'ap_groq',
  'Cohere': 'ap_cohere',
  'DeepSeek': 'ap_deepseek',
  'SambaNova': 'ap_sambanova',
  'Mistral': 'ap_mistral',
  'Meta': 'ap_meta',
  'XAI': 'ap_xai',
  'OpenAI': 'ap_openai',
  'Anthropic': 'ap_anthropic',
  'Cerebras': 'ap_cerebras',
  'Together': 'ap_together',
  'Fireworks': 'ap_fireworks',
  'Hyperbolic': 'ap_hyperbolic',
  'OpenRouter': 'ap_openrouter',
  'HuggingFace': 'ap_huggingface',
  'Github': 'ap_github',
  'Perplexity': 'ap_perplexity'
};

// Also we should fallback to id generation if not matched exactly
function getId(name) {
  if (uiToIdMap[name]) return uiToIdMap[name];
  return 'ap_' + name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const seedPath = path.join(__dirname, 'seed.ts');
let seedContent = fs.readFileSync(seedPath, 'utf8');

// Find the adminProviders array block in seed.ts
const blockRegex = /const adminProviders = \[([\s\S]*?)\];/;
const blockMatch = seedContent.match(blockRegex);
if (!blockMatch) {
  console.error('Could not find adminProviders in seed.ts');
  process.exit(1);
}

// Extract existing providers to keep their keys, base_url, api_format, priority
const existingProvidersStr = blockMatch[1];
const existingProviders = [];
const objRegex = /\{([^}]+)\}/g;
let objMatch;
while ((objMatch = objRegex.exec(existingProvidersStr)) !== null) {
  const content = objMatch[1];
  const idMatch = content.match(/id:\s*'([^']+)'/);
  const keyMatch = content.match(/key:\s*'([^']+)'/);
  const baseUrlMatch = content.match(/base_url:\s*'([^']+)'/);
  const formatMatch = content.match(/api_format:\s*'([^']+)'/);
  const priorityMatch = content.match(/priority:\s*(\d+)/);
  if (idMatch) {
    existingProviders.push({
      id: idMatch[1],
      key: keyMatch ? keyMatch[1] : '',
      base_url: baseUrlMatch ? baseUrlMatch[1] : '',
      api_format: formatMatch ? formatMatch[1] : 'openai',
      priority: priorityMatch ? parseInt(priorityMatch[1]) : 15
    });
  }
}

let newAdminProvidersStr = '';

providersInfo.forEach(p => {
  const id = getId(p.name);
  const existing = existingProviders.find(ep => ep.id === id);
  const key = existing ? existing.key : `${id}-••••••••demo`;
  const base_url = existing ? existing.base_url : '';
  const api_format = existing ? existing.api_format : 'openai';
  const priority = existing ? existing.priority : 15;
  const status = p.hasFree || p.models.length > 0;
  
  // Format models for the backend (just standard id/name)
  const formattedModels = p.models.map(m => ({
    id: m.id,
    name: m.name
  }));
  
  newAdminProvidersStr += `      { id: '${id}', name: '${p.name.replace(/'/g, "\\'")}', status: ${status}, key: '${key}', priority: ${priority}, base_url: '${base_url}', api_format: '${api_format}', models: ${JSON.stringify(formattedModels)} },\n`;
});

// Also include any existing providers from seed.ts that weren't in providersInfo
existingProviders.forEach(ep => {
  const isInInfo = providersInfo.some(p => getId(p.name) === ep.id);
  if (!isInInfo) {
    // Find original string for it
    const origRegex = new RegExp(`\\{\\s*id:\\s*'${ep.id}'[^}]+\\}`);
    const origMatch = existingProvidersStr.match(origRegex);
    if (origMatch) {
      newAdminProvidersStr += `      ${origMatch[0]},\n`;
    }
  }
});

seedContent = seedContent.replace(blockRegex, `const adminProviders = [\n${newAdminProvidersStr}    ];`);
fs.writeFileSync(seedPath, seedContent, 'utf8');
console.log('Successfully updated seed.ts adminProviders with data from providersInfo.ts');

