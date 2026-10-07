# 📋 Providers Directory & Status Catalog (`provider-list.md`)

> **Automatic Maintenance Rule**:  
> Whenever any provider is added, modified, enabled, disabled, or deleted in the system, this file **MUST** be updated immediately to reflect the current live state of the database and engine.

Last Updated: `2026-10-05`  
Total Providers Registered: **27**  
Active Providers: **8**  
Providers Ready with Keys & Models: **3** (10 Models Total)  
Pending / Inactive Providers: **19**

---

## 🟢 Ready & Active Providers (With Keys & Models)

These providers have active credentials and configured models, ready to serve live traffic right now through the gateway.

| Provider Name | Provider ID | API Format | Base URL | Keys Count | Models Count | Supported Models |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **MockTest** | `ap_mocktest` | `openai` | `http://localhost:4599/v1` | 1 | 1 | `mock-test-model` |
| **OpenRouter** | `ap_openrouter` | `openrouter` | `https://openrouter.ai/api/v1` | 1 | 2 | `NVIDIA: Nemotron 3.5 Lightning (free)`, `Upstage: Solar Pro 4` |
| **OpenCode** | `ap_opencode` | `openai` | `https://opencode.ai/zen/v1` | 1 | 7 | `Laguna S 2.1 Free`, `DeepSeek V4 Flash Free`, `MiMo-V2.5 Free`, `Nemotron 3.5 Lightning Free`, `Nemotron 3 Ultra Free`, `HY3 Free`, `Big Pickle` |

---

## 🟡 Active Providers (Pending Live Keys or Model Catalog Setup)

These providers are enabled in admin settings, but need live production API keys or catalog entries in the database to serve traffic.

| Provider Name | Provider ID | API Format | Base URL | Keys | Status |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **OpenAI** | `ap_openai` | `openai` | `https://api.openai.com/v1` | 0 | Active (Awaiting Key/Models) |
| **Anthropic** | `ap_anthropic` | `anthropic` | `https://api.anthropic.com` | 0 | Active (Awaiting Key/Models) |
| **Google** | `ap_google` | `google` | `https://generativelanguage.googleapis.com/v1beta` | 0 | Active (Awaiting Key/Models) |
| **DeepSeek** | `ap_deepseek` | `openai` | `https://api.deepseek.com/v1` | 0 | Active (Awaiting Key/Models) |
| **HuggingFace** | `ap_huggingface` | `openai` | `https://api-inference.huggingface.co/v1` | 0 | Active (Awaiting Key/Models) |

---

## ⚪ Standby / Inactive Providers (19 Providers)

These providers are pre-configured in the schema and can be enabled whenever needed by adding keys and toggling `status: true`:

| Provider Name | Provider ID | Protocol / Format | Default Upstream Base URL |
| :--- | :--- | :--- | :--- |
| **Meta** | `ap_meta` | `openai` | `https://api.meta.ai/v1` |
| **Cohere** | `ap_cohere` | `cohere` | `https://api.cohere.com/v1` |
| **Bytez** | `ap_bytez` | `openai` | `https://api.bytez.com/v1` |
| **Cerebras** | `ap_cerebras` | `openai` | `https://api.cerebras.ai/v1` |
| **Groq** | `ap_groq` | `openai` | `https://api.groq.com/openai/v1` |
| **SambaNova** | `ap_sambanova` | `openai` | `https://api.sambanova.ai/v1` |
| **XAI** | `ap_xai` | `openai` | `https://api.x.ai/v1` |
| **Fireworks** | `ap_fireworks` | `openai` | `https://api.fireworks.ai/inference/v1` |
| **Mistral** | `ap_mistral` | `openai` | `https://api.mistral.ai/v1` |
| **Together** | `ap_together` | `openai` | `https://api.together.xyz/v1` |
| **TokenHarbor** | `ap_tokenharbor` | `openai` | `https://api.tokenharbor.ai/v1` |
| **ai&** | `ap_aiand` | `openai` | `https://api.aiand.com/v1` |
| **Zai** | `ap_zai` | `openai` | `https://api.z.ai/v1` |
| **ClineCode** | `ap_clinecode` | `openai` | `https://api.clinecode.ai/v1` |
| **UnoRouter** | `ap_unorouter` | `openai` | `https://api.unorouter.com/v1` |
| **Routeway** | `ap_routeway` | `openai` | `https://api.routeway.ai/v1` |
| **AnyRouter** | `ap_anyrouter` | `openai` | `https://api.anyrouter.dev/v1` |
| **AgnesAI** | `ap_agnesai` | `openai` | `https://api.agnes-ai.com/v1` |
| **TokenRouter** | `ap_tokenrouter` | `openai` | `https://api.tokenrouter.com/v1` |

---

## 🔄 How to Auto-Synchronize This File

You can automatically re-generate and synchronize this file directly from the live database at any time by running:
```bash
bun run sync:list
```
