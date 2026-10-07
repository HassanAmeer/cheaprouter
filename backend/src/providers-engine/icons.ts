// ---------------------------------------------------------------------------
// Providers Engine — Centralized Provider Icons Registry & Resolver
// ---------------------------------------------------------------------------

export const PROVIDER_ENGINE_ICONS: Record<string, string> = {
  // Major Foundations
  openai: 'https://cdn.simpleicons.org/openai/10A37F',
  anthropic: 'https://cdn.simpleicons.org/anthropic/D97757',
  google: 'https://cdn.simpleicons.org/google/4285F4',
  gemini: 'https://cdn.simpleicons.org/google/4285F4',
  deepseek: 'https://www.google.com/s2/favicons?domain=deepseek.com&sz=128',
  meta: 'https://cdn.simpleicons.org/meta/0467DF',
  cohere: 'https://www.google.com/s2/favicons?domain=cohere.com&sz=128',
  mistral: 'https://www.google.com/s2/favicons?domain=mistral.com&sz=128',
  xai: 'https://www.google.com/s2/favicons?domain=xai.com&sz=128',

  // Top Routers & Code Gateways
  openrouter: 'https://www.google.com/s2/favicons?domain=openrouter.ai&sz=128',
  opencode: 'https://www.google.com/s2/favicons?domain=opencode.ai&sz=128',
  clinecode: 'https://www.google.com/s2/favicons?domain=clinecode.ai&sz=128',
  kilocode: 'https://www.google.com/s2/favicons?domain=kilocode.ai&sz=128',
  poixe: 'https://www.google.com/s2/favicons?domain=poixe.com&sz=128',
  zenmux: 'https://www.google.com/s2/favicons?domain=zenmux.ai&sz=128',
  unorouter: 'https://www.google.com/s2/favicons?domain=unorouter.com&sz=128',
  routeway: 'https://www.google.com/s2/favicons?domain=routeway.ai&sz=128',
  anyrouter: 'https://www.google.com/s2/favicons?domain=anyrouter.dev&sz=128',
  tokenrouter: 'https://www.google.com/s2/favicons?domain=tokenrouter.com&sz=128',

  // Fast Inference & Silicon Engines
  groq: 'https://www.google.com/s2/favicons?domain=groq.com&sz=128',
  cerebras: 'https://www.google.com/s2/favicons?domain=cerebras.com&sz=128',
  sambanova: 'https://www.google.com/s2/favicons?domain=sambanova.com&sz=128',
  together: 'https://www.google.com/s2/favicons?domain=together.com&sz=128',
  fireworks: 'https://www.google.com/s2/favicons?domain=fireworks.ai&sz=128',
  hyperbolic: 'https://www.google.com/s2/favicons?domain=hyperbolic.xyz&sz=128',
  novita: 'https://www.google.com/s2/favicons?domain=novita.com&sz=128',
  siliconflow: 'https://www.google.com/s2/favicons?domain=siliconflow.cn&sz=128',
  nvidia: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=128',

  // Hubs & Clouds
  github: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
  huggingface: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
  amazonbedrock: 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128',
  modelscope: 'https://www.google.com/s2/favicons?domain=modelscope.cn&sz=128',
  perplexity: 'https://www.google.com/s2/favicons?domain=perplexity.com&sz=128',

  // Open & Specialized APIs
  moonshot: 'https://www.google.com/s2/favicons?domain=moonshot.cn&sz=128',
  zai: 'https://www.google.com/s2/favicons?domain=z.ai&sz=128',
  stepfun: 'https://www.google.com/s2/favicons?domain=platform.stepfun.ai&sz=128',
  llm7: 'https://www.google.com/s2/favicons?domain=llm7.io&sz=128',
  aihorde: 'https://www.google.com/s2/favicons?domain=aihorde.net&sz=128',
  pollinations: 'https://www.google.com/s2/favicons?domain=pollinations.ai&sz=128',
  agnesai: 'https://www.google.com/s2/favicons?domain=platform.agnes-ai.com&sz=128',
  bytez: 'https://www.google.com/s2/favicons?domain=bytez.com&sz=128',
  aimlapi: 'https://www.google.com/s2/favicons?domain=aimlapi.com&sz=128',
  tokenharbor: 'https://www.google.com/s2/favicons?domain=tokenharbor.com&sz=128',
  aiand: 'https://www.google.com/s2/favicons?domain=aiand.com&sz=128',

  // Local & Custom Endpoints
  ollama: 'https://cdn.simpleicons.org/ollama/FFFFFF',
  vllm: 'https://www.google.com/s2/favicons?domain=vllm.ai&sz=128',
  lmstudio: 'https://www.google.com/s2/favicons?domain=lmstudio.ai&sz=128',
  generic: 'https://api.iconify.design/lucide:server.svg',
};

/**
 * Resolves the official icon URL for any provider ID or Name.
 * If a custom icon URL is provided, it returns that URL.
 */
export function resolveProviderIcon(
  providerIdOrName: string,
  customIcon?: string | null
): string {
  if (customIcon && typeof customIcon === 'string' && customIcon.trim()) {
    return customIcon.trim();
  }

  const clean = String(providerIdOrName || '')
    .toLowerCase()
    .replace(/^ap_/, '')
    .replace(/[^a-z0-9]/g, '');

  if (!clean) return PROVIDER_ENGINE_ICONS.generic;

  // Direct match in registry
  if (PROVIDER_ENGINE_ICONS[clean]) {
    return PROVIDER_ENGINE_ICONS[clean];
  }

  // Key fuzzy substring matching
  for (const [key, url] of Object.entries(PROVIDER_ENGINE_ICONS)) {
    if (key === 'generic') continue;
    if (clean.includes(key) || key.includes(clean)) {
      return url;
    }
  }

  return PROVIDER_ENGINE_ICONS.generic;
}
