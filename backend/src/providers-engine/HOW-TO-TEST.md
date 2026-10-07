# 🧪 Universal Guide: How to Start, Test & Connect (`HOW-TO-TEST.md`)

This comprehensive guide covers everything you need to start, inspect, verify, and connect **Providers Engine** to any website, project, or CLI tool.

---

## ⚡ 1. Speed & Latency: Is it Fast or Slow?

**Providers Engine is built for MAXIMUM SPEED with zero bottleneck:**

1. **Native Fetch Byte-Passthrough**:  
   Unlike traditional gateways that parse incoming chunks into JSON objects and re-encode them, Providers Engine pipes upstream Server-Sent Events (SSE) **directly as raw byte streams**.  
   *Gateway Processing Overhead:* **< 1 millisecond**.

2. **In-Memory TTL Caching**:  
   - **Provider Configurations:** Cached in memory for 60 seconds. Incoming requests do **not** query PostgreSQL repeatedly.
   - **Authentication Keys:** Validated and cached in memory for 30 seconds.

3. **Multi-Key Load Balancing**:  
   If a provider has multiple keys, requests are automatically shuffled to distribute throughput across provider limits.

---

## 🚀 2. How to Start the Engine

Make sure you are in the `providers-engine` folder:
```bash
cd /home/hasan/Documents/reactjs/providers-engine
bun run dev
```

The gateway starts on port **`4001`**:
- **OpenAI Compatible Base URL:** `http://localhost:4001/v1`
- **Anthropic Compatible Base URL:** `http://localhost:4001`
- **Live Web Control Hub:** `http://localhost:4001/dashboard`

---

## 🖥️ 3. How to View & Test via Web Dashboard

Open your browser to:
👉 **`http://localhost:4001/dashboard`** (or `http://localhost:4001/status`)

### What you can do on the Dashboard:
1. **Check Providers Health:**
   - See every provider from the database.
   - Click the **⚡ Ping** button next to any provider. The engine sends a live probe request and displays:
     - `✅ Responsive (185ms)` if online.
     - `❌ Error message` if API key is invalid or upstream is degraded.
2. **Batch Test All Providers:**
   - Click **⚡ Test All Active** to ping all active providers simultaneously and view live latency.
3. **Explore Models Catalog:**
   - Switch to the **📚 Models Catalog** tab.
   - Search by model name or ID to see which provider is serving each model.
   - One-click copy for Model IDs.
4. **Live Interactive Playground:**
   - Switch to **🧪 Live Test Playground**.
   - Select any model from the dropdown, type a prompt, and hit **Send Request**.
   - Watch the response stream live, along with **Time To First Token (TTFT)**, **Total Latency**, and the provider name.

---

## 💻 4. How to Test via Command Line (cURL)

### A. Check Models List
```bash
curl http://localhost:4001/v1/models
```

### B. Test a Specific Provider's Health
```bash
# Test OpenRouter
curl -X POST http://localhost:4001/v1/providers/test/ap_openrouter

# Test OpenCode
curl -X POST http://localhost:4001/v1/providers/test/ap_opencode
```

### C. Test Streaming Chat Completion (OpenAI Protocol)
```bash
curl -X POST http://localhost:4001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "laguna-s-2.1-free",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

### D. Test Claude / Anthropic Protocol (e.g. Claude Code)
```bash
curl -X POST http://localhost:4001/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "messages": [{"role": "user", "content": "Hello Claude!"}],
    "max_tokens": 100
  }'
```

---

## 🔌 5. How to Attach / Connect to Other Projects

### In Next.js / React Web Apps (e.g. `cheapchats2`)
In your project's `.env.local`:
```env
OPENAI_BASE_URL="http://localhost:4001/v1"
OPENAI_API_KEY="YOUR_CHEAPROUTER_API_KEY"
```

In your server route (e.g. `route.ts`):
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'http://localhost:4001/v1',
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, model = 'laguna-s-2.1-free' } = await req.json();

  const stream = await openai.chat.completions.create({
    model,
    messages,
    stream: true,
  });

  return new Response(stream.toReadableStream());
}
```

### In Python Projects
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4001/v1",
    api_key="YOUR_CHEAPROUTER_API_KEY"
)

response = client.chat.completions.create(
    model="laguna-s-2.1-free",
    messages=[{"role": "user", "content": "Explain quantum computing briefly"}],
    stream=True
)

for chunk in response:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)
```

### In Claude Code CLI
```bash
export ANTHROPIC_BASE_URL="http://localhost:4001"
export ANTHROPIC_API_KEY="YOUR_CHEAPROUTER_API_KEY"
claude
```

---

## 📋 6. Synchronizing the Provider Catalog

Whenever you add, modify, or delete a provider in the database or admin dashboard:
1. Run the sync command:
   ```bash
   bun run sync:list
   ```
2. Check `provider-list.md` to see the updated table of all ready, active, and inactive providers.

---

## 🔑 7. Testing with API Keys

### Option A: Test using the Built-In Raw Key Verifier (Web UI)
1. Open `http://localhost:4001/dashboard`.
2. Click on the tab **"🔑 Test Custom Raw API Key"**.
3. Select any provider (e.g. OpenAI, OpenRouter, Anthropic, DeepSeek).
4. Paste your raw provider API key (`sk-or-v1-...`, `sk-ant-...`, `sk-...`).
5. Click **⚡ Verify Key Connection**.
   - The engine sends a 1-token test ping directly with your key.
   - Shows `✅ Key is VALID & ACTIVE! (latency: 185ms)` or `❌ Key Verification FAILED! (with exact upstream error)`.

### Option B: Test using cURL / Postman / SDK with your API Key
Pass your key as standard `Authorization: Bearer <KEY>`:
```bash
curl -X POST http://localhost:4001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CHEAPROUTER_API_KEY" \
  -d '{
    "model": "laguna-s-2.1-free",
    "messages": [{"role": "user", "content": "Hi!"}]
  }'
```
*(Note: In local development, you can also use `sk-engine-dev-key` as a master test key).*
