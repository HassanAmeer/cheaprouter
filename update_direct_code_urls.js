const fs = require('fs');
const path = require('path');

const providerApiUrls = {
  'AIMLAPISetup.tsx': 'https://api.aimlapi.com/v1/models',
  'AIHordeSetup.tsx': 'https://aihorde.net/api/v2/status/models',
  'AgnesAISetup.tsx': 'https://api.agnes-ai.com/v1/models',
  'AmazonBedrockSetup.tsx': 'https://bedrock.proxy/v1/models',
  'AnthropicSetup.tsx': 'https://api.anthropic.com/v1/models',
  'AnyRouterSetup.tsx': 'https://api.anyrouter.dev/v1/models',
  'BytezSetup.tsx': 'https://api.bytez.com/v1/models',
  'CerebrasSetup.tsx': 'https://api.cerebras.ai/v1/models',
  'ClineCodeSetup.tsx': 'https://api.clinecode.ai/v1/models',
  'CohereSetup.tsx': 'https://api.cohere.com/v1/models',
  'DeepSeekSetup.tsx': 'https://api.deepseek.com/models',
  'FireworksSetup.tsx': 'https://api.fireworks.ai/inference/v1/models',
  'GithubSetup.tsx': 'https://models.inference.ai.azure.com/models',
  'GoogleSetup.tsx': 'https://generativelanguage.googleapis.com/v1beta/models',
  'GroqSetup.tsx': 'https://api.groq.com/openai/v1/models',
  'HuggingFaceSetup.tsx': 'https://api-inference.huggingface.co/v1/models',
  'HyperbolicSetup.tsx': 'https://api.hyperbolic.ai/v1/models',
  'KiloCodeSetup.tsx': 'https://api.kilocode.ai/v1/models',
  'LLM7Setup.tsx': 'https://api.llm7.io/v1/models',
  'MistralSetup.tsx': 'https://api.mistral.ai/v1/models',
  'ModelScopeSetup.tsx': 'https://api-inference.modelscope.cn/v1/models',
  'MoonshotSetup.tsx': 'https://api.moonshot.cn/v1/models',
  'NovitaSetup.tsx': 'https://api.novita.ai/v3/openai/models',
  'NvidiaSetup.tsx': 'https://integrate.api.nvidia.com/v1/models',
  'OpenAISetup.tsx': 'https://api.openai.com/v1/models',
  'OpenCodeSetup.tsx': 'https://opencode.ai/zen/v1/models',
  'OpenRouterSetup.tsx': 'https://openrouter.ai/api/v1/models',
  'PerplexitySetup.tsx': 'https://api.perplexity.ai/models',
  'PoixeSetup.tsx': 'https://api.poixe.com/v1/models',
  'PollinationsSetup.tsx': 'https://text.pollinations.ai/v1/models',
  'RoutewaySetup.tsx': 'https://api.routeway.ai/v1/models',
  'SambaNovaSetup.tsx': 'https://api.sambanova.ai/v1/models',
  'SiliconFlowSetup.tsx': 'https://api.siliconflow.cn/v1/models',
  'StepFunSetup.tsx': 'https://api.stepfun.com/v1/models',
  'TogetherSetup.tsx': 'https://api.together.xyz/v1/models',
  'TokenRouterSetup.tsx': 'https://api.tokenrouter.com/v1/models',
  'UnoRouterSetup.tsx': 'https://api.unorouter.com/v1/models',
  'XAISetup.tsx': 'https://api.x.ai/v1/models',
  'ZaiSetup.tsx': 'https://api.z.ai/v1/models',
  'ZenmuxSetup.tsx': 'https://api.zenmux.ai/v1/models'
};

const dir = 'src/app/admin/providers';

for (const [file, directUrl] of Object.entries(providerApiUrls)) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;

  let code = fs.readFileSync(filePath, 'utf8');

  // Match the href line in the Code icon <a> tag
  // Example: href={`/api/admin/zai/models?key=${encodeURIComponent(apiKeys.find(k => k.active && k.key.trim() !== '')?.key || '')}`}
  // or href="https://openrouter.ai/..."
  const regex = /href=\{\`\/api\/admin\/[^\/]+\/models\?key=\$\{encodeURIComponent\(apiKeys\.find\(k => k\.active && k\.key\.trim\(\) !== ''\)\?\.\key \|\| ''\)\}\`\}/g;

  const newHref = `href={(() => { const k = apiKeys.find(k => k.active && k.key.trim() !== '')?.key || ''; return k ? "${directUrl}?key=" + encodeURIComponent(k) : "${directUrl}"; })()}`;

  if (code.match(regex)) {
    code = code.replace(regex, newHref);
    fs.writeFileSync(filePath, code);
    console.log(`Updated direct API link in ${file}`);
  } else {
    // Check if it already has a direct URL or different pattern
    const altRegex = /href="https:\/\/openrouter\.ai\/api\/v1\/models[^"]*"/g;
    if (code.match(altRegex)) {
      code = code.replace(altRegex, `href="${directUrl}"`);
      fs.writeFileSync(filePath, code);
      console.log(`Updated alt direct API link in ${file}`);
    } else {
      console.log(`Pattern not matched in ${file}`);
    }
  }
}
