// ---------------------------------------------------------------------------
// Built-in Web Control Hub & Provider Health Dashboard
// ---------------------------------------------------------------------------

export function renderDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Providers Engine — Control Hub & Live Health</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090b10;
      --card: #11141d;
      --card-hover: #161b26;
      --border: #1e2433;
      --border-accent: #2e384d;
      --text: #f0f3f8;
      --text-muted: #8b949e;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 28px 24px;
      line-height: 1.5;
    }

    .container { max-width: 1300px; margin: 0 auto; }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .logo-area { display: flex; align-items: center; gap: 14px; }
    .logo-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
    }
    h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .subtitle { font-size: 13px; color: var(--text-muted); }

    .header-actions { display: flex; gap: 12px; align-items: center; }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      outline: none;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
    .btn-secondary {
      background: #181d28;
      color: var(--text);
      border-color: var(--border);
    }
    .btn-secondary:hover { background: #222938; }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px 20px;
    }
    .stat-title { font-size: 12px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 26px; font-weight: 700; margin-top: 6px; }

    /* Nav Tabs */
    .tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .tab-btn {
      padding: 10px 18px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .tab-btn.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    /* Provider Cards */
    .provider-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 18px;
    }
    .provider-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
      transition: all 0.2s;
      position: relative;
    }
    .provider-card:hover {
      border-color: var(--border-accent);
      background: var(--card-hover);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .card-title { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-active { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .badge-inactive { background: rgba(107, 114, 128, 0.15); color: #9ca3af; }
    .badge-format { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }

    .card-info {
      font-size: 13px;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }
    .code-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      background: #0b0e14;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #1a202c;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .health-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #0b0e14;
      border-radius: 8px;
      font-size: 12px;
      border: 1px solid var(--border);
    }

    /* Model list table */
    .table-container {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th {
      padding: 14px 18px;
      background: #141924;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 14px 18px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
    }
    tr:hover td { background: var(--card-hover); }

    /* Playground & Verifier Boxes */
    .box-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 24px;
      max-width: 800px;
    }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .hint-text { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    select, input, textarea {
      width: 100%;
      padding: 10px 14px;
      background: #0b0e14;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-family: inherit;
      font-size: 13px;
      outline: none;
    }
    select:focus, input:focus, textarea:focus { border-color: var(--primary); }
    .response-area {
      margin-top: 20px;
      background: #0b0e14;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      min-height: 120px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      white-space: pre-wrap;
    }
    .metric-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo-area">
        <div class="logo-icon">⚡</div>
        <div>
          <h1>Providers Engine Control Hub</h1>
          <div class="subtitle">Universal AI Gateway & Live Provider Diagnostics • Port :4000</div>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" onclick="loadData()">🔄 Refresh</button>
        <button class="btn btn-primary" id="btnTestAll" onclick="testAllProviders()">⚡ Test All Active</button>
      </div>
    </header>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">Total Providers</div>
        <div class="stat-value" id="statTotal">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Active Providers</div>
        <div class="stat-value" style="color: #34d399;" id="statActive">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Registered Models</div>
        <div class="stat-value" style="color: #60a5fa;" id="statModels">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Gateway Health</div>
        <div class="stat-value" style="color: #10b981;" id="statHealth">Online</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('providers')">🔌 Providers & Health</button>
      <button class="tab-btn" onclick="switchTab('models')">📚 Models Catalog</button>
      <button class="tab-btn" onclick="switchTab('playground')">🧪 Live Test Playground</button>
      <button class="tab-btn" onclick="switchTab('verifier')">🔑 Test Custom Raw API Key</button>
      <button class="tab-btn" onclick="switchTab('custom')">➕ Add Custom Provider</button>
    </div>

    <!-- Tab 1: Providers -->
    <div id="tab-providers">
      <div class="provider-grid" id="providersList">
        <div style="color: var(--text-muted); padding: 20px;">Loading providers diagnostic data...</div>
      </div>
    </div>

    <!-- Tab 2: Models -->
    <div id="tab-models" style="display: none;">
      <div style="margin-bottom: 16px;">
        <input type="text" id="modelSearch" placeholder="🔍 Search models by ID or name..." oninput="filterModels()">
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Model ID</th>
              <th>Display Name</th>
              <th>Provider</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="modelsTableBody">
            <tr><td colspan="4" style="color: var(--text-muted);">Loading models...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 3: Playground -->
    <div id="tab-playground" style="display: none;">
      <div class="box-card">
        <div class="form-group">
          <label>Select Model to Test</label>
          <select id="playModelSelect"><option>Loading models...</option></select>
        </div>
        <div class="form-group">
          <label>API Key (Optional)</label>
          <input type="password" id="playApiKey" placeholder="Enter your CheapRouter API key (sk-...) or leave blank">
          <div class="hint-text">Leave blank to automatically use the built-in development test key.</div>
        </div>
        <div class="form-group">
          <label>Prompt</label>
          <textarea id="playPrompt" rows="3">Hello! Confirm you are working and tell me which model you are.</textarea>
        </div>
        <button class="btn btn-primary" id="btnPlayRun" onclick="runPlaygroundTest()">🚀 Send Completion Request</button>

        <div class="metric-badge" id="playMetrics" style="display: none;"></div>
        <div class="response-area" id="playOutput">Response will appear here...</div>
      </div>
    </div>

    <!-- Tab 4: Raw Key Verifier -->
    <div id="tab-verifier" style="display: none;">
      <div class="box-card">
        <h3 style="font-size: 16px; margin-bottom: 8px;">🔑 Test Any Provider Raw API Key</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">
          Want to verify if a new provider key is working and has active credits before saving it? Test it live here:
        </p>

        <div class="form-group">
          <label>Provider</label>
          <select id="verifyProviderSelect"><option>Loading providers...</option></select>
        </div>
        <div class="form-group">
          <label>Raw API Key</label>
          <input type="password" id="verifyApiKey" placeholder="Paste raw key here (e.g. sk-or-v1-..., sk-ant-..., sk-...)">
        </div>
        <div class="form-group">
          <label>Specific Model to Ping (Optional)</label>
          <input type="text" id="verifyModel" placeholder="e.g. gpt-4o, claude-3-5-sonnet, deepseek-chat">
        </div>
        <button class="btn btn-primary" id="btnVerifyKey" onclick="runKeyVerification()">⚡ Verify Key Connection</button>

        <div class="response-area" id="verifyOutput" style="min-height: 80px;">Verification result will appear here...</div>
      </div>
    </div>

    <!-- Tab 5: Custom Providers -->
    <div id="tab-custom" style="display: none;">
      <div class="box-card" style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; margin-bottom: 8px;">➕ Register Any Custom Provider / Self-Hosted Endpoint</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">
          Easily attach your own local models (Ollama, vLLM, LM Studio) or private third-party OpenAI-compatible APIs directly into CheapRouter.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label>Provider Name *</label>
            <input type="text" id="customName" placeholder="e.g. Local Ollama, My Private vLLM">
          </div>
          <div class="form-group">
            <label>Base URL *</label>
            <input type="text" id="customBaseUrl" placeholder="e.g. http://localhost:11434/v1 or https://api.myserver.com/v1">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label>API Key (Optional for local/unprotected)</label>
            <input type="password" id="customApiKey" placeholder="sk-... (leave blank if local Ollama/LM Studio)">
          </div>
          <div class="form-group">
            <label>API Format</label>
            <select id="customFormat">
              <option value="openai">OpenAI Compatible (/v1/chat/completions)</option>
              <option value="anthropic">Anthropic Compatible (/v1/messages)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Supported Model IDs (comma-separated or one per line) *</label>
          <textarea id="customModels" rows="2" placeholder="e.g. llama3:8b, mistral:7b, qwen2.5:72b"></textarea>
          <div class="hint-text">CheapRouter will route requests for these model IDs directly to this custom provider.</div>
        </div>

        <div class="form-group">
          <label>Custom Headers (Optional JSON format)</label>
          <input type="text" id="customHeaders" placeholder='{"X-Custom-Header": "Value"}'>
        </div>

        <button class="btn btn-primary" id="btnSaveCustom" onclick="saveCustomProvider()">💾 Save Custom Provider</button>
        <div id="customSaveStatus" style="margin-top: 12px; font-size: 13px;"></div>
      </div>
    </div>
  </div>

  <script>
    let providersData = [];
    let allModelsData = [];

    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('tab-providers').style.display = tabId === 'providers' ? 'block' : 'none';
      document.getElementById('tab-models').style.display = tabId === 'models' ? 'block' : 'none';
      document.getElementById('tab-playground').style.display = tabId === 'playground' ? 'block' : 'none';
      document.getElementById('tab-verifier').style.display = tabId === 'verifier' ? 'block' : 'none';
      document.getElementById('tab-custom').style.display = tabId === 'custom' ? 'block' : 'none';
    }

    async function loadData() {
      try {
        const res = await fetch('/v1/providers');
        const data = await res.json();
        providersData = data.providers || [];

        // Update stats
        document.getElementById('statTotal').innerText = providersData.length;
        const active = providersData.filter(p => p.status);
        document.getElementById('statActive').innerText = active.length;

        // Collect all models
        allModelsData = [];
        providersData.forEach(p => {
          (p.models || []).forEach(m => {
            allModelsData.push({ ...m, providerName: p.name, providerId: p.id });
          });
        });
        document.getElementById('statModels').innerText = allModelsData.length;

        renderProviders();
        renderModelsTable(allModelsData);
        populatePlaygroundModels();
        populateVerifierProviders();
      } catch (err) {
        console.error('Failed to load data', err);
      }
    }

    function renderProviders() {
      const container = document.getElementById('providersList');
      if (providersData.length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted);">No providers found.</div>';
        return;
      }

      container.innerHTML = providersData.map(p => {
        const statusBadge = p.status
          ? '<span class="badge badge-active">Active</span>'
          : '<span class="badge badge-inactive">Disabled</span>';
        const formatBadge = '<span class="badge badge-format">' + (p.api_format || 'openai') + '</span>';

        const last = p.last_test;
        let testDisplay = '<span style="color: var(--text-muted);">Not tested yet</span>';
        if (last) {
          if (last.ok) {
            testDisplay = '<span style="color: #10b981; font-weight: 600;">✅ Responsive (' + last.latencyMs + 'ms)</span>';
          } else {
            testDisplay = '<span style="color: #ef4444; font-weight: 600;">❌ ' + (last.error || 'Failed') + '</span>';
          }
        }

        return \`
          <div class="provider-card" id="card-\${p.id}">
            <div class="card-top">
              <div class="card-title">
                \${p.name}
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                \${statusBadge}
                \${formatBadge}
                \${p.byok_enabled ? '<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">BYOK ON</span>' : '<span class="badge" style="background: rgba(156, 163, 175, 0.1); color: #9ca3af; border: 1px solid rgba(156, 163, 175, 0.2);">BYOK OFF</span>'}
              </div>
            </div>

            <div class="card-info">
              <div>Base URL: <span class="code-text">\${p.base_url || 'Default'}</span></div>
              <div>Keys: \${p.has_valid_key ? '🟢 ' + p.keys_count + ' key(s)' : '🔴 No valid key'}</div>
              <div>Models: <strong>\${p.models_count}</strong> configured</div>
            </div>

            <div class="health-pill" id="health-\${p.id}">
              <div id="status-text-\${p.id}">\${testDisplay}</div>
              <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="testSingleProvider('\${p.id}')">
                ⚡ Ping
              </button>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderModelsTable(models) {
      const tbody = document.getElementById('modelsTableBody');
      if (models.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="color: var(--text-muted);">No models match search.</td></tr>';
        return;
      }

      tbody.innerHTML = models.map(m => \`
        <tr>
          <td><code class="code-text">\${m.id}</code></td>
          <td>\${m.name}</td>
          <td><span class="badge badge-format">\${m.providerName}</span></td>
          <td>
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="copyToClipboard('\${m.id}')">
              📋 Copy ID
            </button>
          </td>
        </tr>
      \`).join('');
    }

    function filterModels() {
      const q = document.getElementById('modelSearch').value.toLowerCase();
      const filtered = allModelsData.filter(m => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
      renderModelsTable(filtered);
    }

    function populatePlaygroundModels() {
      const select = document.getElementById('playModelSelect');
      select.innerHTML = allModelsData.map(m => \`
        <option value="\${m.id}">\${m.name} (\${m.id}) — \${m.providerName}</option>
      \`).join('');
    }

    function populateVerifierProviders() {
      const select = document.getElementById('verifyProviderSelect');
      select.innerHTML = providersData.map(p => \`
        <option value="\${p.id}">\${p.name} (\${p.api_format})</option>
      \`).join('');
    }

    async function testSingleProvider(id) {
      const textElem = document.getElementById('status-text-' + id);
      textElem.innerHTML = '<span style="color: #60a5fa;">⏳ Testing...</span>';

      try {
        const res = await fetch('/v1/providers/test/' + id, { method: 'POST' });
        const result = await res.json();
        if (result.ok) {
          textElem.innerHTML = '<span style="color: #10b981; font-weight: 600;">✅ ' + result.latencyMs + 'ms</span>';
        } else {
          textElem.innerHTML = '<span style="color: #ef4444; font-weight: 600;">❌ ' + (result.error || 'Error') + '</span>';
        }
      } catch (e) {
        textElem.innerHTML = '<span style="color: #ef4444;">❌ Request error</span>';
      }
    }

    async function testAllProviders() {
      const btn = document.getElementById('btnTestAll');
      btn.innerText = '⏳ Testing all...';
      btn.disabled = true;

      try {
        const res = await fetch('/v1/providers/test', { method: 'POST' });
        const results = await res.json();
        for (const [id, r] of Object.entries(results)) {
          const textElem = document.getElementById('status-text-' + id);
          if (textElem) {
            if (r.ok) {
              textElem.innerHTML = '<span style="color: #10b981; font-weight: 600;">✅ ' + r.latencyMs + 'ms</span>';
            } else {
              textElem.innerHTML = '<span style="color: #ef4444; font-weight: 600;">❌ ' + (r.error || 'Failed') + '</span>';
            }
          }
        }
      } catch (e) {
        alert('Failed to run batch test: ' + e.message);
      } finally {
        btn.innerText = '⚡ Test All Active';
        btn.disabled = false;
      }
    }

    async function runPlaygroundTest() {
      const model = document.getElementById('playModelSelect').value;
      const prompt = document.getElementById('playPrompt').value;
      const key = document.getElementById('playApiKey').value.trim();
      const output = document.getElementById('playOutput');
      const metrics = document.getElementById('playMetrics');
      const btn = document.getElementById('btnPlayRun');

      btn.disabled = true;
      btn.innerText = '⏳ Generating...';
      output.innerText = 'Connecting to gateway...\\n';
      metrics.style.display = 'none';

      const startTime = Date.now();
      try {
        const headers = {
          'Content-Type': 'application/json',
          'x-from-dashboard': 'true'
        };
        if (key) headers['Authorization'] = 'Bearer ' + key;

        const res = await fetch('/v1/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          output.innerText = 'Error (' + res.status + '):\\n' + JSON.stringify(err, null, 2);
          btn.disabled = false;
          btn.innerText = '🚀 Send Completion Request';
          return;
        }

        const providerHeader = res.headers.get('x-provider') || 'Gateway';
        output.innerText = '';

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let totalText = '';
        let firstTokenTime = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  if (!firstTokenTime) firstTokenTime = Date.now() - startTime;
                  totalText += delta;
                  output.innerText = totalText;
                }
              } catch (e) {}
            }
          }
        }

        const totalTime = Date.now() - startTime;
        metrics.style.display = 'inline-flex';
        metrics.innerHTML = \`
          <span>🟢 Provider: <strong>\${providerHeader}</strong></span> •
          <span>⚡ TTFT: <strong>\${firstTokenTime || totalTime}ms</strong></span> •
          <span>⏱️ Total: <strong>\${totalTime}ms</strong></span>
        \`;
      } catch (err) {
        output.innerText = 'Error: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.innerText = '🚀 Send Completion Request';
      }
    }

    async function runKeyVerification() {
      const providerId = document.getElementById('verifyProviderSelect').value;
      const apiKey = document.getElementById('verifyApiKey').value.trim();
      const modelId = document.getElementById('verifyModel').value.trim();
      const output = document.getElementById('verifyOutput');
      const btn = document.getElementById('btnVerifyKey');

      if (!apiKey) {
        alert('Please paste an API key to test.');
        return;
      }

      btn.disabled = true;
      btn.innerText = '⏳ Verifying with upstream...';
      output.innerText = 'Sending 1-token test ping directly with provided key...';

      try {
        const res = await fetch('/v1/providers/verify-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId, apiKey, modelId: modelId || undefined }),
        });
        const result = await res.json();
        if (result.ok) {
          output.innerHTML = \`
            <span style="color: #10b981; font-weight: 700;">✅ Key is VALID & ACTIVE!</span>\\n
            Provider: <strong>\${result.providerName}</strong>\\n
            Tested Model: <strong>\${result.modelTested}</strong>\\n
            Latency: <strong>\${result.latencyMs}ms</strong>
          \`;
        } else {
          output.innerHTML = \`
            <span style="color: #ef4444; font-weight: 700;">❌ Key Verification FAILED!</span>\\n
            Provider: <strong>\${result.providerName}</strong>\\n
            Error details: \${result.error}
          \`;
        }
      } catch (err) {
        output.innerText = 'Error testing key: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.innerText = '⚡ Verify Key Connection';
      }
    }

    async function saveCustomProvider() {
      const name = document.getElementById('customName').value.trim();
      const baseUrl = document.getElementById('customBaseUrl').value.trim();
      const apiKey = document.getElementById('customApiKey').value.trim();
      const apiFormat = document.getElementById('customFormat').value;
      const modelsRaw = document.getElementById('customModels').value.trim();
      const headersRaw = document.getElementById('customHeaders').value.trim();
      const statusDiv = document.getElementById('customSaveStatus');
      const btn = document.getElementById('btnSaveCustom');

      if (!name || !baseUrl || !modelsRaw) {
        statusDiv.innerHTML = '<span style="color: #ef4444;">Please fill in Provider Name, Base URL, and Models.</span>';
        return;
      }

      const models = modelsRaw.split(/[\n,]+/).map(m => m.trim()).filter(Boolean);
      let headers = undefined;
      if (headersRaw) {
        try {
          headers = JSON.parse(headersRaw);
        } catch (e) {
          statusDiv.innerHTML = '<span style="color: #ef4444;">Custom Headers must be valid JSON format.</span>';
          return;
        }
      }

      btn.disabled = true;
      btn.innerText = '⏳ Saving...';
      statusDiv.innerHTML = '';

      try {
        const res = await fetch('/v1/providers/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            baseUrl,
            apiKey: apiKey || undefined,
            apiFormat,
            models,
            headers,
          }),
        });

        const data = await res.json();
        if (data.ok) {
          statusDiv.innerHTML = '<span style="color: #10b981; font-weight: 600;">✅ Custom Provider saved successfully! Added ' + models.length + ' model(s).</span>';
          document.getElementById('customName').value = '';
          document.getElementById('customBaseUrl').value = '';
          document.getElementById('customApiKey').value = '';
          document.getElementById('customModels').value = '';
          document.getElementById('customHeaders').value = '';
          await loadData();
        } else {
          statusDiv.innerHTML = '<span style="color: #ef4444;">❌ Failed: ' + (data.error || 'Unknown error') + '</span>';
        }
      } catch (err) {
        statusDiv.innerHTML = '<span style="color: #ef4444;">❌ Error: ' + err.message + '</span>';
      } finally {
        btn.disabled = false;
        btn.innerText = '💾 Save Custom Provider';
      }
    }

    async function deleteCustomProvider(id) {
      if (!confirm('Are you sure you want to delete this custom provider?')) return;
      try {
        const res = await fetch('/v1/providers/custom/' + encodeURIComponent(id), { method: 'DELETE' });
        const data = await res.json();
        if (data.ok) {
          await loadData();
        } else {
          alert('Failed to delete: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text);
      alert('Copied model ID: ' + text);
    }

    loadData();
  </script>
</body>
</html>`;
}
