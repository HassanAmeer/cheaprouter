import fs from 'fs';
import path from 'path';

// 1. Remove from providersInfo.ts
const providersInfoPath = path.join(__dirname, '../../src/app/admin/providers/manage/providersInfo.ts');
let providersInfoStr = fs.readFileSync(providersInfoPath, 'utf8');

const jsonMatch = providersInfoStr.match(/export const ALL_PROVIDERS_INFO = (\[[\s\S]*\]);/);
if (jsonMatch) {
  let providersInfo = eval(jsonMatch[1]);
  const namesToRemove = ["OpenAI", "Anthropic", "Google Gemini", "Meta", "DeepSeek"];
  providersInfo = providersInfo.filter((p: any) => !namesToRemove.includes(p.name));
  
  const newContent = `export const ALL_PROVIDERS_INFO = ${JSON.stringify(providersInfo, null, 2)};\n`;
  fs.writeFileSync(providersInfoPath, newContent, 'utf8');
  console.log('Removed from providersInfo.ts');
}

// 2. Remove from seed.ts
const seedPath = path.join(__dirname, 'seed.ts');
let seedContent = fs.readFileSync(seedPath, 'utf8');
const blockRegex = /const adminProviders = \[([\s\S]*?)\];/;
const blockMatch = seedContent.match(blockRegex);
if (blockMatch) {
  let existingProvidersStr = blockMatch[1];
  const idsToRemove = ['ap_openai', 'ap_anthropic', 'ap_google', 'ap_meta', 'ap_deepseek'];
  
  // We can just filter out these lines from the string
  const lines = existingProvidersStr.split('\n');
  const newLines = lines.filter(line => {
    return !idsToRemove.some(id => line.includes(`id: '${id}'`));
  });
  
  seedContent = seedContent.replace(blockRegex, `const adminProviders = [${newLines.join('\n')}    ];`);
  fs.writeFileSync(seedPath, seedContent, 'utf8');
  console.log('Removed from seed.ts');
}

