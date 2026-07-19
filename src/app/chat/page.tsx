'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Send, Paperclip, Copy, Check, Zap, Plus, X, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/primitives';
import { streamChat } from '@/lib/api';
import styles from './chat.module.css';

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', color: '#10A37F', icon: 'https://cdn.simpleicons.org/openai/10A37F' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', color: '#D97757', icon: 'https://cdn.simpleicons.org/anthropic/D97757' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', color: '#4285F4', icon: 'https://cdn.simpleicons.org/google/4285F4' },
  { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'Meta', color: '#0668E1', icon: 'https://cdn.simpleicons.org/meta/0668E1' },
  { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', provider: 'DeepSeek', color: '#1A53E8', icon: 'https://logo.clearbit.com/deepseek.com' },
];

const CANNED = [
  "CheapModels routes your request through a single unified OpenAI-compatible endpoint, so you get the same streaming experience regardless of the underlying provider.",
  "Great question! Because we normalize every provider to the OpenAI schema, you can swap models by changing just the `model` field — no SDK changes required.",
  "Here's a quick comparison: Claude 3.5 Sonnet tends to excel at long-context reasoning, while GPT-4o is faster for general tasks. Gemini 1.5 Pro offers the largest context window.",
  "I can help you scaffold that. Just let me know the framework and I'll generate a drop-in route that points at https://api.cheapmodels.ai/v1.",
];

type Msg = { role: 'user' | 'assistant'; content: string };
type Chat = { id: string; title: string; messages: Msg[] };

const MODEL_LABEL = (id: string) => MODELS.find((x) => x.id === id)?.name ?? id;

export default function ChatPlayground() {
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([{ id: 'c1', title: 'New conversation', messages: [] }]);
  const [activeChat, setActiveChat] = useState('c1');
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4o', 'claude-3-5-sonnet']);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = chats.find((c) => c.id === activeChat)!;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [current.messages, streaming]);

  const send = () => {
    if (!input.trim() || streaming || selectedModels.length === 0) return;
    const text = input.trim();
    setInput('');
    setStreaming(true);

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat
          ? {
              ...c,
              title: c.messages.length === 0 ? text.slice(0, 28) : c.title,
              messages: [...c.messages, { role: 'user', content: text }],
            }
          : c
      )
    );

    const prefix = `🤖 [${selectedModels.map((m) => MODEL_LABEL(m)).join(' + ')}]\n`;
    setChats((prev) =>
      prev.map((c) => (c.id === activeChat ? { ...c, messages: [...c.messages, { role: 'assistant', content: prefix }] } : c))
    );

    streamChat(
      text,
      selectedModels,
      (chunk) => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== activeChat) return c;
            const msgs = [...c.messages];
            const last = msgs[msgs.length - 1];
            msgs[msgs.length - 1] = { role: 'assistant', content: last.content + chunk };
            return { ...c, messages: msgs };
          })
        );
      },
      () => setStreaming(false)
    );
  };

  const newChat = () => {
    const id = 'c' + Date.now();
    setChats((prev) => [...prev, { id, title: 'New conversation', messages: [] }]);
    setActiveChat(id);
  };

  const copyMsg = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    toast('Message copied');
  };

  const toggleModel = (id: string) => {
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>
          <span style={{ color: 'var(--color-primary)' }}><Zap size={20} fill="currentColor" /></span> CheapModels
        </Link>
        <button className={styles.newChat} onClick={newChat}>
          <Plus size={16} /> New chat
        </button>
        <div className={styles.chatList}>
          {chats.map((c) => (
            <button
              key={c.id}
              className={`${styles.chatItem} ${c.id === activeChat ? styles.chatItemActive : ''}`}
              onClick={() => setActiveChat(c.id)}
            >
              {c.title}
            </button>
          ))}
        </div>
        <div className={styles.sidebarFooter}>
          <ThemeToggle />
          <Link href="/dashboard" className={styles.sidebarLink}>Dashboard</Link>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Model selector bar */}
        <div className={styles.modelBar}>
          <span className={styles.modelBarLabel}>Comparing:</span>
          {MODELS.map((m) => {
            const active = selectedModels.includes(m.id);
            return (
              <button
                key={m.id}
                className={`${styles.modelChip} ${active ? styles.modelChipActive : ''}`}
                onClick={() => toggleModel(m.id)}
                style={active ? { borderColor: m.color } : undefined}
              >
                <img src={m.icon} width={16} height={16} alt="" style={{ borderRadius: 2 }} />
                {m.name}
                {active && <Check size={12} />}
              </button>
            );
          })}
        </div>

        {/* Messages */}
        <div className={styles.messages} ref={scrollRef}>
          {current.messages.length === 0 && (
            <div className={styles.empty}>
              <Sparkles size={40} color="var(--color-primary)" />
              <h2>Compare AI models side-by-side</h2>
              <p>Pick two or more models above and start chatting. Responses stream through our unified API.</p>
            </div>
          )}
          {current.messages.map((m, idx) => (
            <div key={idx} className={`${styles.row} ${m.role === 'user' ? styles.rowUser : styles.rowAi}`}>
              <div className={styles.bubble}>
                <div className={styles.bubbleText}>{m.content}</div>
                {m.role === 'assistant' && (
                  <button className={styles.copyBtn} onClick={() => copyMsg(m.content, `m-${idx}`)}>
                    {copiedId === `m-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {streaming && (
            <div className={styles.row + ' ' + styles.rowAi}>
              <div className={styles.bubble}>
                <span className={styles.typing}><span /></span>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className={styles.composer}>
          <button className={styles.attach} aria-label="Attach"><Paperclip size={18} /></button>
          <input
            className={styles.composerInput}
            placeholder={selectedModels.length ? 'Message the selected models…' : 'Select at least one model ↑'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            disabled={selectedModels.length === 0}
          />
          <Button size="sm" onClick={send} disabled={streaming || !input.trim() || selectedModels.length === 0}>
            <Send size={16} /> Send
          </Button>
          {selectedModels.length === 0 && (
            <button className={styles.clearBtn} onClick={() => setSelectedModels(['gpt-4o'])}><X size={14} /> Reset</button>
          )}
        </div>
      </main>
    </div>
  );
}
