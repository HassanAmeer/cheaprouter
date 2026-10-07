import { db } from '../db.ts';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

async function sync() {
  console.log('🔄 Fetching latest providers from database...');
  const rows = await db`
    SELECT id, name, status, api_format, base_url, key, models 
    FROM admin_providers 
    ORDER BY status DESC, priority ASC NULLS LAST, name ASC
  `;

  const parsed = rows.map((p) => {
    let hasKey = false;
    let keyCount = 0;
    try {
      const pKey = JSON.parse(p.key);
      if (Array.isArray(pKey)) {
        const valid = pKey.filter((k: any) => {
          const val = typeof k === 'string' ? k : k.key;
          return val && !val.includes('•') && !val.includes('...') && !/demo$/i.test(val);
        });
        hasKey = valid.length > 0;
        keyCount = valid.length;
      } else if (p.key && !p.key.includes('•') && !p.key.includes('...') && !/demo$/i.test(p.key)) {
        hasKey = true;
        keyCount = 1;
      }
    } catch {
      hasKey = Boolean(p.key && !p.key.includes('•') && !p.key.includes('...') && !/demo$/i.test(p.key));
      keyCount = hasKey ? 1 : 0;
    }

    const rawModels: any[] = Array.isArray(p.models) ? p.models : [];
    const models = rawModels.map((m: any) => (typeof m === 'string' ? m : m.name || m.id || m.originalId)).filter(Boolean);

    return {
      id: p.id,
      name: p.name || p.id,
      status: Boolean(p.status),
      api_format: p.api_format || 'openai',
      base_url: p.base_url || 'N/A',
      hasKey,
      keyCount,
      modelCount: models.length,
      models,
    };
  });

  const ready = parsed.filter(p => p.status && p.hasKey && p.modelCount > 0);
  const activePending = parsed.filter(p => p.status && (!p.hasKey || p.modelCount === 0));
  const inactive = parsed.filter(p => !p.status);

  const totalModels = ready.reduce((acc, p) => acc + p.modelCount, 0);

  let md = `# 📋 Providers Directory & Status Catalog (\`provider-list.md\`)

> **Automatic Maintenance Rule**:  
> Whenever any provider is added, modified, enabled, disabled, or deleted in the system, this file **MUST** be updated immediately to reflect the current live state of the database and engine.

Last Updated: \`${new Date().toISOString().slice(0, 10)}\`  
Total Providers Registered: **${parsed.length}**  
Active Providers: **${ready.length + activePending.length}**  
Providers Ready with Keys & Models: **${ready.length}** (${totalModels} Models Total)  
Pending / Inactive Providers: **${inactive.length}**

---

## 🟢 Ready & Active Providers (With Keys & Models)

These providers have active credentials and configured models, ready to serve live traffic right now through the gateway.

| Provider Name | Provider ID | API Format | Base URL | Keys Count | Models Count | Supported Models |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
`;

  for (const r of ready) {
    const modelStr = r.models.map((m: string) => `\`${m}\``).join(', ');
    md += `| **${r.name}** | \`${r.id}\` | \`${r.api_format}\` | \`${r.base_url}\` | ${r.keyCount} | ${r.modelCount} | ${modelStr} |\n`;
  }

  md += `
---

## 🟡 Active Providers (Pending Live Keys or Model Catalog Setup)

These providers are enabled in admin settings, but need live production API keys or catalog entries in the database to serve traffic.

| Provider Name | Provider ID | API Format | Base URL | Keys | Status |
| :--- | :--- | :--- | :--- | :---: | :--- |
`;

  for (const p of activePending) {
    md += `| **${p.name}** | \`${p.id}\` | \`${p.api_format}\` | \`${p.base_url}\` | ${p.keyCount} | Active (Awaiting Key/Models) |\n`;
  }

  md += `
---

## ⚪ Standby / Inactive Providers (${inactive.length} Providers)

These providers are pre-configured in the schema and can be enabled whenever needed by adding keys and toggling \`status: true\`:

| Provider Name | Provider ID | Protocol / Format | Default Upstream Base URL |
| :--- | :--- | :--- | :--- |
`;

  for (const p of inactive) {
    md += `| **${p.name}** | \`${p.id}\` | \`${p.api_format}\` | \`${p.base_url}\` |\n`;
  }

  md += `
---

## 🔄 How to Auto-Synchronize This File

You can automatically re-generate and synchronize this file directly from the live database at any time by running:
\`\`\`bash
bun run sync:list
\`\`\`
`;

  const targetPath = resolve(__dirname, './provider-list.md');
  const backendPath = resolve(__dirname, '../../provider-list.md');
  writeFileSync(targetPath, md, 'utf-8');
  writeFileSync(backendPath, md, 'utf-8');
  console.log(`✅ Successfully updated ${targetPath} and ${backendPath} with ${parsed.length} providers.`);
  process.exit(0);
}

sync().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
