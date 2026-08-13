'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Sparkles, RefreshCw, Trash2, Copy, Check, Cpu, Key, Info, ArrowDownRight, TerminalSquare } from 'lucide-react';


interface TestModel {
  id: string;
  name: string;
  provider: string;
  icon?: string;
  caps?: string[];
  inputPrice?: string;
  outputPrice?: string;
  contextWindow?: string;
  access?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  error?: boolean;
}

const PRESET_SYSTEM_MESSAGES = [
  'You are a helpful AI assistant. Respond as clearly and concisely as possible.',
  'You are a code expert. Help the user write clean and efficient code.',
  'You are a data analyst. Explain technical concepts in simple terms.',
  'You are a creative writer. Write vivid, engaging content.',
];

export default function TestModelsPage() {
  const [models, setModels] = useState<TestModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [systemMessage, setSystemMessage] = useState(PRESET_SYSTEM_MESSAGES[0]);
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number>(-1);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  const pushLog = (type: string, message: string, details?: any) => {
    fetch('/api/admin/dev-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, component: 'Frontend UI', message, details })
    }).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/public/providers')
      .then(res => res.json())
      .then(data => {
        const rawProviders = Array.isArray(data) ? data : (data as any)?.providers || [];
        const all: TestModel[] = [];
        for (const p of rawProviders) {
          for (const m of p.models || []) {
            if (!m.showOnLandingPage) continue;
            all.push({
              id: m.id || m.originalId || '',
              name: m.name || m.id,
              provider: p.name || '',
              icon: m.icon || p.icon,
              caps: Array.isArray(m.caps) ? m.caps : undefined,
              inputPrice: m.inputPrice,
              outputPrice: m.outputPrice,
              contextWindow: m.contextWindow,
              access: m.access,
            });
          }
        }
        setModels(all);
        if (all.length > 0) {
          setSelectedModel(all[0].id);
          pushLog('INFO', `Initialized with ${all.length} models`, { models: all });
        }
        setLoadingModels(false);
      })
      .catch(() => setLoadingModels(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async () => {
    if (!userMessage.trim() || !selectedModel || sending) return;
    const userMsg = userMessage.trim();
    const convo: ChatMessage[] = [
      ...(systemMessage.trim() ? [{ role: 'system' as const, content: systemMessage.trim() }] : []),
      ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: userMsg },
    ];

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setUserMessage('');
    setSending(true);
    setLatency(null);

    pushLog('INFO', `Sending chat request to model: ${selectedModel}`, { model: selectedModel, payload: convo });

    const started = performance.now();
    try {
      const token = localStorage.getItem('admin_token');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      const res = await fetch('/api/admin/test-model', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ model: selectedModel, messages: convo, stream: false }),
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      const elapsed = Math.round(performance.now() - started);

      if (!res.ok) {
        const raw = data?.error?.message || data?.error?.message === '' ? data?.error?.message : data?.error;
        const msg = typeof raw === 'string' ? raw : `Request failed (${res.status})`;
        setMessages(prev => [...prev, { role: 'assistant', content: msg, error: true }]);
        setLatency(elapsed);
        setError(msg);
        pushLog('ERROR', `Request failed with status ${res.status}`, { error: data?.error || data, status: res.status, elapsedMs: elapsed });
        return;
      }

      const content = data?.choices?.[0]?.message?.content;
      if (content === undefined || content === null) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Model returned an empty response.', error: true }]);
        setLatency(elapsed);
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: String(content) }]);
      setLatency(elapsed);
      pushLog('SUCCESS', `Received successful response in ${elapsed}ms`, { data, elapsedMs: elapsed });
    } catch (err: any) {
      const msg = err?.name === 'AbortError'
        ? 'Request timed out after 90s — the provider may be slow or rate-limited. Try another model.'
        : (err?.message || 'Network error — could not reach the backend.');
      setMessages(prev => [...prev, { role: 'assistant', content: msg, error: true }]);
      setError(msg);
      pushLog('ERROR', `Network error or timeout`, { message: msg, error: err?.message });
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    setLatency(null);
  };

  const copyMessage = (index: number, content: string) => {
    navigator.clipboard?.writeText(content).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(-1), 1500);
    }).catch(() => {});
  };

  const currentModel = models.find(m => m.id === selectedModel);

  const inputLen = String(userMessage || '').length;
  const totalLen = inputLen + (systemMessage?.length || 0);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: 'var(--color-text-main)', background: 'transparent' }}>
      <style>{`
        .testGrid { display: grid; grid-template-columns: 340px 1fr; gap: 22px; align-items: start; }
        .testCard { background: var(--color-card-bg, #15191E); border: 1px solid var(--color-border, #262C34); border-radius: 18px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.05); }
        .testHead { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .testHeadIcon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; background: var(--color-primary-soft, #1F2733); color: var(--color-primary, #EF4444); border: 1px solid rgba(239,68,68,0.2); }
        .testHead h3 { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
        .testHead p { margin: 2px 0 0; font-size: 12px; color: var(--color-text-muted, #9AA3AF); }
        .fieldLabel { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-muted, #9AA3AF); margin-bottom: 7px; }
        .select, .textarea { width: 100%; background: var(--color-bg, #0B0D10); border: 1px solid var(--color-border, #262C34); border-radius: 11px; color: var(--color-text-main, #F2F4F7); font-size: 13.5px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .select { padding: 11px 14px; cursor: pointer; }
        .textarea { padding: 12px 14px; resize: vertical; line-height: 1.5; min-height: 88px; }
        .select:focus, .textarea:focus { border-color: var(--color-primary, #EF4444); box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
        .selectWrap { position: relative; display: flex; align-items: center; }
        .selectWrap .selIcon { position: absolute; left: 12px; pointer-events: none; color: var(--color-text-muted); display: flex; }
        .selectWrap .select { padding-left: 42px; }
        .modelInfo { margin-top: 14px; padding: 12px 14px; background: var(--color-bg, #0B0D10); border: 1px solid var(--color-border, #262C34); border-radius: 12px; }
        .modelInfoRow { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; padding: 4px 0; }
        .modelInfoLabel { display: flex; align-items: center; gap: 6px; color: var(--color-text-muted, #9AA3AF); }
        .modelInfoVal { font-weight: 600; color: var(--color-text-main, #F2F4F7); }
        .presetBtns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .presetBtn { font-size: 11px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--color-border, #262C34); background: transparent; color: var(--color-text-muted, #9AA3AF); cursor: pointer; transition: all 0.15s; }
        .presetBtn:hover, .presetBtn.active { border-color: var(--color-primary, #EF4444); color: var(--color-primary, #EF4444); background: rgba(239,68,68,0.07); }
        .chatCard { display: flex; flex-direction: column; min-height: 640px; }
        .chatScroll { flex: 1; overflow-y: auto; min-height: 380px; max-height: 560px; display: flex; flex-direction: column; gap: 14px; padding-right: 4px; }
        .bubble { display: flex; gap: 10px; align-items: flex-start; max-width: 92%; animation: rise 0.22s ease; }
        .bubble.user { align-self: flex-end; flex-direction: row-reverse; }
        .bubbleAvatar { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid var(--color-border, #262C34); background: var(--color-bg, #0B0D10); color: var(--color-text-muted); }
        .bubble.user .bubbleAvatar { background: var(--color-primary-soft, #1F2733); color: var(--color-primary, #EF4444); border-color: rgba(239,68,68,0.25); }
        .bubbleBody { background: var(--color-bg, #0B0D10); border: 1px solid var(--color-border, #262C34); border-radius: 14px; padding: 12px 14px; font-size: 13.5px; line-height: 1.6; word-break: break-word; white-space: pre-wrap; }
        .bubble.user .bubbleBody { background: var(--color-primary-soft, #1F2733); border-color: rgba(239,68,68,0.22); }
        .bubbleBody.error { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.06); color: #F87171; }
        .bubbleMeta { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .bubbleRole { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-muted, #9AA3AF); }
        .copyBtn { background: transparent; border: none; color: var(--color-text-muted, #9AA3AF); cursor: pointer; padding: 2px; display: flex; transition: color 0.15s; }
        .copyBtn:hover { color: var(--color-primary, #EF4444); }
        .copyBtn.ok { color: #10B981; }
        .typing { display: inline-flex; align-items: center; gap: 4px; padding: 4px 0; }
        .typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-muted); animation: blink 1.2s infinite; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
        @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .composer { border-top: 1px dashed var(--color-border, #262C34); padding-top: 16px; margin-top: 16px; }
        .sendRow { display: flex; gap: 10px; margin-top: 12px; align-items: stretch; }
        .sendBtn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px; background: var(--color-primary, #EF4444); color: #fff; border: 1px solid var(--color-primary); font-weight: 700; font-size: 13.5px; cursor: pointer; box-shadow: 0 4px 14px rgba(239,68,68,0.28); transition: all 0.2s; flex-shrink: 0; }
        .sendBtn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); box-shadow: 0 6px 18px rgba(239,68,68,0.34); }
        .sendBtn:disabled { opacity: 0.55; cursor: not-allowed; }
        .clearBtn { display: inline-flex; align-items: center; gap: 6px; padding: 12px 14px; border-radius: 12px; background: transparent; color: var(--color-text-muted); border: 1px solid var(--color-border, #262C34); font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.15s; }
        .clearBtn:hover { color: #F87171; border-color: rgba(239,68,68,0.4); }
        .statusChip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 5px 11px; border-radius: 999px; margin-top: 12px; }
        .statusChip.ok { background: rgba(16,185,129,0.12); color: #10B981; border: 1px solid rgba(16,185,129,0.3); }
        .statusChip.err { background: rgba(239,68,68,0.12); color: #F87171; border: 1px solid rgba(239,68,68,0.3); }
        .statusChip.idle { background: var(--color-bg, #0B0D10); color: var(--color-text-muted); border: 1px solid var(--color-border, #262C34); }
        @media (max-width: 900px) { .testGrid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="testGrid">
        {/* ── LEFT: Model Config ── */}
        <div className="testCard">
          <div className="testHead">
            <div className="testHeadIcon"><Cpu size={18} /></div>
            <div>
              <h3>Model Configuration</h3>
              <p>Pick a model and tune the system message</p>
            </div>
          </div>

          <label className="fieldLabel">AI Model</label>
          <div className="selectWrap">
            <span className="selIcon"><Sparkles size={16} /></span>
            <select className="select" value={selectedModel} onChange={e => { 
              setSelectedModel(e.target.value); 
              setLatency(null); 
              setError(''); 
              pushLog('INFO', `User changed model selection to: ${e.target.value}`, { newModel: e.target.value });
            }}>
              {loadingModels ? (
                <option>Loading models…</option>
              ) : models.length === 0 ? (
                <option>No landing-page models available</option>
              ) : (
                models.map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.provider}</option>
                ))
              )}
            </select>
          </div>
          {loadingModels && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-text-muted)' }}>Fetching models…</div>}

          {currentModel && (
            <div className="modelInfo">
              <div className="modelInfoRow">
                <span className="modelInfoLabel"><Bot size={13} /> Model ID</span>
                <span className="modelInfoVal">{currentModel.id}</span>
              </div>
              <div className="modelInfoRow">
                <span className="modelInfoLabel"><Key size={13} /> Provider</span>
                <span className="modelInfoVal">{currentModel.provider}</span>
              </div>
              <div className="modelInfoRow">
                <span className="modelInfoLabel"><ArrowDownRight size={13} /> Context</span>
                <span className="modelInfoVal">{currentModel.contextWindow ? (currentModel.contextWindow.includes('k') || currentModel.contextWindow.includes('M') ? currentModel.contextWindow : `${currentModel.contextWindow} tokens`) : '—'}</span>
              </div>
              <div className="modelInfoRow">
                <span className="modelInfoLabel"><TerminalSquare size={13} /> Access</span>
                <span className="modelInfoVal">{currentModel.access || 'Standard'}</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <label className="fieldLabel">System Message</label>
            <textarea
              className="textarea"
              rows={4}
              value={systemMessage}
              onChange={e => setSystemMessage(e.target.value)}
              placeholder="Set the behavior or instructions for this model…"
            />
            <div className="presetBtns">
              {PRESET_SYSTEM_MESSAGES.map((p, i) => (
                <button key={i} className={`presetBtn ${systemMessage === p ? 'active' : ''}`} onClick={() => setSystemMessage(p)}>
                  {i === 0 ? 'General' : i === 1 ? 'Code Expert' : i === 2 ? 'Analyst' : 'Creative'}
                </button>
              ))}
            </div>
          </div>

          <div className="statusChip idle">
            <Info size={13} /> {models.length} curated model{models.length === 1 ? '' : 's'} available
          </div>
        </div>

        {/* ── RIGHT: Chat ── */}
        <div className="testCard chatCard">
          <div className="testHead" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="testHeadIcon"><Bot size={18} /></div>
              <div>
                <h3>Model Chat</h3>
                <p>{messages.length} messages · {currentModel ? currentModel.name : 'no model selected'}</p>
              </div>
            </div>
            <button className="clearBtn" onClick={clearChat} disabled={messages.length === 0}>
              <Trash2 size={14} /> Clear
            </button>
          </div>

          <div className="chatScroll" ref={chatBoxRef}>
            {messages.length === 0 && !sending && (
              <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--color-text-muted)' }}>
                <div style={{ width: 58, height: 58, borderRadius: 18, background: 'var(--color-primary-soft, #1F2733)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Sparkles size={26} style={{ color: 'var(--color-primary, #EF4444)' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-main)', marginBottom: 6 }}>Test a model in seconds</div>
                <div style={{ fontSize: 13, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                  Pick any model curated for the landing page, write a user message, and send. The response comes straight from the live routing layer.
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role === 'user' ? 'user' : ''}`}>
                <div className="bubbleAvatar">
                  {m.role === 'user' ? <UserIcon size={15} /> : <Bot size={15} />}
                </div>
                <div style={{ maxWidth: '100%' }}>
                  <div className={`bubbleBody ${m.error ? 'error' : ''}`}>{m.content}</div>
                  <div className="bubbleMeta">
                    <span className="bubbleRole">{m.role === 'user' ? (systemMessage.trim() ? 'user' : 'user') : m.error ? 'model error' : (m.role === 'system' ? 'system' : 'model')}</span>
                    {i === messages.length - 1 && latency !== null && (
                      <span className="bubbleRole" style={{ color: latency < 4000 ? '#10B981' : '#F59E0B' }}>{latency}ms</span>
                    )}
                    {!m.error && (
                      <button className={`copyBtn ${copiedIndex === i ? 'ok' : ''}`} onClick={() => copyMessage(i, m.content)} title="Copy">
                        {copiedIndex === i ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="bubble">
                <div className="bubbleAvatar"><Bot size={15} /></div>
                <div className="bubbleBody">
                  <div className="typing"><span /><span /><span /></div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="composer">
            <label className="fieldLabel">User Message</label>
            <textarea
              className="textarea"
              rows={3}
              value={userMessage}
              onChange={e => setUserMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder={'Type a message to test ' + (currentModel ? currentModel.name : 'the model') + '…'}
              disabled={sending}
            />
            <div className="sendRow">
              <button className="sendBtn" onClick={sendMessage} disabled={sending || !selectedModel || !userMessage.trim()}>
                {sending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                <span>{sending ? 'Streaming…' : 'Send Request'}</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10, fontSize: 11.5, color: 'var(--color-text-muted)', gap: 10 }}>
                <span>{inputLen} chars</span>
                <span>·</span>
                <span>{totalLen} total</span>
                <span>·</span>
                <span>Enter ↵ send · Shift+Enter newline</span>
              </div>
            </div>

            {!sending && (error || latency !== null) && (
              <div className={`statusChip ${error ? 'err' : 'ok'}`}>
                {error ? <><Info size={13} /> {typeof error === 'string' ? error.slice(0, 90) : 'Request failed'}</> : <><Check size={13} /> Completed in {latency}ms</>}
              </div>
            )}
          </div>
        </div>
      </div>
      
      
    </div>
  );
}