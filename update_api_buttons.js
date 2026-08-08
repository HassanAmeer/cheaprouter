const fs = require('fs');
const path = require('path');

const urlMap = {
  'AIMLAPISetup.tsx': 'https://aimlapi.com/',
  'AmazonBedrockSetup.tsx': 'https://aws.amazon.com/bedrock/',
  'AnthropicSetup.tsx': 'https://console.anthropic.com/settings/keys',
  'BytezSetup.tsx': 'https://bytez.com/',
  'CerebrasSetup.tsx': 'https://inference.cerebras.ai/',
  'CohereSetup.tsx': 'https://dashboard.cohere.com/api-keys',
  'DeepSeekSetup.tsx': 'https://platform.deepseek.com/api_keys',
  'FireworksSetup.tsx': 'https://fireworks.ai/api-keys',
  'GithubSetup.tsx': 'https://github.com/settings/tokens',
  'GoogleSetup.tsx': 'https://aistudio.google.com/app/apikey',
  'GroqSetup.tsx': 'https://console.groq.com/keys',
  'HuggingFaceSetup.tsx': 'https://huggingface.co/settings/tokens',
  'HyperbolicSetup.tsx': 'https://app.hyperbolic.xyz/',
  'MistralSetup.tsx': 'https://console.mistral.ai/api-keys/',
  'MoonshotSetup.tsx': 'https://platform.moonshot.cn/console/api-keys',
  'NovitaSetup.tsx': 'https://novita.ai/dashboard/key',
  'OpenAISetup.tsx': 'https://platform.openai.com/api-keys',
  'OpenCodeSetup.tsx': 'https://opencode.ai/zen/api-keys',
  'OpenRouterSetup.tsx': 'https://openrouter.ai/keys',
  'PerplexitySetup.tsx': 'https://www.perplexity.ai/settings/api',
  'SambaNovaSetup.tsx': 'https://cloud.sambanova.ai/',
  'TogetherSetup.tsx': 'https://api.together.xyz/settings/api-keys',
  'XAISetup.tsx': 'https://console.x.ai/',
  'ZaiSetup.tsx': 'https://z.ai/'
};

const dir = 'src/app/admin/providers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Setup.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let code = fs.readFileSync(filePath, 'utf8');
  const apiUrl = urlMap[file] || 'https://google.com/';

  const oldLabelStart = `<label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}>`;
  const newLabelStart = `<label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>\n                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>`;
  
  if (code.includes(oldLabelStart)) {
    code = code.replace(oldLabelStart, newLabelStart);
    
    // Regular expression to match the modified label block
    const regex = /<label style=\{\{ fontSize: '13px', color: 'var\(--color-text-muted\)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' \}\}>\s*<div style=\{\{ display: 'flex', gap: '8px', alignItems: 'center' \}\}>\s*API Key \{index \+ 1\} \{keyObj\.active \? '' : '\(Paused\)'\}\s*\{showKeyErrors\[index\] && <span style=\{\{ color: '#ef4444', fontSize: '11px', fontWeight: 500 \}\}>\*Required<\/span>\}\s*<\/label>/g;
    
    code = code.replace(regex, (match) => {
      return match.replace('</label>', `</div>\n                {index === 0 && (\n                  <a href="${apiUrl}" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: '11px', color: 'var(--color-primary)', textDecoration: 'none', background: 'var(--color-bg-soft)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: 500 }}>\n                    Get API Key ↗\n                  </a>\n                )}\n              </label>`);
    });

    fs.writeFileSync(filePath, code);
    console.log('Updated ' + file);
  }
}
