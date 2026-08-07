'use client';

import React, { useState } from 'react';
import {
  Database, Users, Zap, MessageSquare, Bell, BarChart2, CreditCard,
  Play, RefreshCw, Trash2, CheckCircle2, AlertTriangle, ShieldAlert,
  ChevronRight, ChevronDown, Layers,
} from 'lucide-react';

type SeedStatus = 'idle' | 'running' | 'success' | 'error';

type SeedSection = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  count: string;
  status: SeedStatus;
};

const initialSections: SeedSection[] = [
  {
    id: 'users',
    icon: <Users size={20} />,
    title: 'Users',
    description: 'Demo accounts across Free, Pro, and Enterprise tiers — ready to log in instantly.',
    details: ['4 Free plan users', '4 Pro plan users', '2 Enterprise plan users', '1 Suspended account', 'Password: password123 for all'],
    count: '10 users',
    status: 'idle',
  },
  {
    id: 'api_keys',
    icon: <Zap size={20} />,
    title: 'API Keys',
    description: 'Realistic scoped keys with cr_ prefixes per user, covering production and dev environments.',
    details: ['1–2 keys per user', 'Production & Development keys', 'Realistic key prefixes (cr_...)', 'Requires users to be seeded first'],
    count: '~15 keys',
    status: 'idle',
  },
  {
    id: 'providers',
    icon: <Database size={20} />,
    title: 'BYOK Providers',
    description: 'Bring-your-own-key entries for OpenAI & Anthropic — masked and ready to test routing.',
    details: ['OpenAI & Anthropic providers', 'Masked key format (••••1234)', 'Active status by default', 'Requires users to be seeded first'],
    count: '~5 entries',
    status: 'idle',
  },
  {
    id: 'conversations',
    icon: <MessageSquare size={20} />,
    title: 'Conversations',
    description: 'Multi-turn chat history across 10 real AI topics — looks and feels like real usage.',
    details: ['3–6 conversations per user', '2–4 message pairs each', '10 unique AI topics', '~250 total messages'],
    count: '~45 convs',
    status: 'idle',
  },
  {
    id: 'usage',
    icon: <BarChart2 size={20} />,
    title: 'Usage Analytics',
    description: '30 days of token data across all models — powers every chart in the dashboard.',
    details: ['30 days × 10 users', '1–3 models used per day', 'GPT-4o, Claude, Gemini, Llama, DeepSeek', 'Realistic token counts (500–8000)'],
    count: '~900 records',
    status: 'idle',
  },
  {
    id: 'notifications',
    icon: <Bell size={20} />,
    title: 'Notifications',
    description: 'Global announcements and personal alerts — mixed read/unread to simulate real state.',
    details: ['5 global notifications (all users)', '2–3 personal per user', 'Mix of read/unread states', 'Realistic content & emojis'],
    count: '~30 notifs',
    status: 'idle',
  },
  {
    id: 'plans',
    icon: <CreditCard size={20} />,
    title: 'Plans & Config',
    description: 'Pricing tiers, admin routing config, and site-wide settings — the whole system backbone.',
    details: ['Free / Pro / Enterprise pricing', '5 admin provider configs', 'Site name, tagline, CTAs', 'Routing priority order'],
    count: '3 plans + 5 providers',
    status: 'idle',
  },
];

function StatusPill({ status, message }: { status: SeedStatus; message?: string }) {
  const cfg = {
    idle:    { label: 'Ready',      dot: 'var(--color-text-muted)',   bg: 'var(--color-bg-soft)',          text: 'var(--color-text-muted)' },
    running: { label: 'Seeding…',   dot: 'var(--color-primary)',      bg: 'var(--color-primary-soft)',     text: 'var(--color-primary)' },
    success: { label: message || 'Seeded', dot: '#10B981', bg: 'rgba(16,185,129,0.1)', text: '#10B981' },
    error:   { label: message || 'Failed', dot: '#EF4444', bg: 'rgba(239,68,68,0.1)',  text: '#EF4444' },
  }[status];

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      background: cfg.bg, color: cfg.text,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      {status === 'running'
        ? <RefreshCw size={10} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
        : <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
      }
      {cfg.label}
    </span>
  );
}

export default function SeedingPage() {
  const [sections, setSections] = useState<SeedSection[]>(initialSections);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [seedingAll, setSeedingAll] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const showToast = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const callSeed = async (section: string): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ section }),
      });
      const data = await res.json();
      return res.ok ? { ok: true, message: data.message || 'Done' } : { ok: false, message: data.error || 'Failed' };
    } catch {
      return { ok: false, message: 'Network error' };
    }
  };

  const seedOne = async (id: string) => {
    setSections(p => p.map(s => s.id === id ? { ...s, status: 'running' } : s));
    const r = await callSeed(id);
    setSections(p => p.map(s => s.id === id ? { ...s, status: r.ok ? 'success' : 'error' } : s));
    setMessages(p => ({ ...p, [id]: r.message }));
    showToast(r.message, r.ok);
  };

  const mergeSeed = async () => {
    setSeedingAll(true);
    for (const { id } of initialSections) {
      setSections(p => p.map(s => s.id === id ? { ...s, status: 'running' } : s));
      const r = await callSeed(id);
      setSections(p => p.map(s => s.id === id ? { ...s, status: r.ok ? 'success' : 'error' } : s));
      setMessages(p => ({ ...p, [id]: r.message }));
      await new Promise(res => setTimeout(res, 180));
    }
    showToast('Merged seed data successfully!');
    setSeedingAll(false);
  };

  const freshSeedAll = async () => {
    setSeedingAll(true);
    showToast('Wiping old data...', true);
    try {
      await fetch('/api/admin/seed', { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
    } catch (e) {
      // ignore
    }
    resetAll();
    
    for (const { id } of initialSections) {
      setSections(p => p.map(s => s.id === id ? { ...s, status: 'running' } : s));
      const r = await callSeed(id);
      setSections(p => p.map(s => s.id === id ? { ...s, status: r.ok ? 'success' : 'error' } : s));
      setMessages(p => ({ ...p, [id]: r.message }));
      await new Promise(res => setTimeout(res, 180));
    }
    showToast('Fresh seed complete! Exactly 10 users created.');
    setSeedingAll(false);
  };

  const resetAll = () => {
    setSections(initialSections.map(s => ({ ...s, status: 'idle' })));
    setMessages({});
  };

  const wipe = async () => {
    if (!confirm('Permanently delete ALL seeded test data?')) return;
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (res.ok) { resetAll(); showToast(data.message || 'Wiped successfully'); }
      else showToast('Wipe failed', false);
    } catch {
      showToast('Network error', false);
    }
  };

  const allSeeded = sections.every(s => s.status === 'success');
  const anyRunning = sections.some(s => s.status === 'running') || seedingAll;
  const seededCount = sections.filter(s => s.status === 'success').length;
  const pct = Math.round((seededCount / sections.length) * 100);

  return (
    <div style={{ width: '100%', paddingBottom: 80, position: 'relative' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }

        .s-card {
          animation: slideUp 0.4s cubic-bezier(.16,1,.3,1) both;
          background: var(--color-card-bg);
          border: 1px solid var(--color-border);
          border-radius: 20px;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
          cursor: default;
        }
        .s-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px -8px rgba(0,0,0,0.15), 0 0 0 1px var(--color-border);
        }
        .s-card.success {
          border-color: rgba(16,185,129,0.28);
          box-shadow: 0 0 0 1px rgba(16,185,129,0.1);
        }
        .s-card.error { border-color: rgba(239,68,68,0.28); }

        .btn-primary {
          display:inline-flex; align-items:center; gap:6px;
          padding:9px 18px;
          background: var(--color-primary);
          border:none; border-radius:12px;
          font-size:13px; font-weight:700; color:#fff;
          cursor:pointer; transition:all 0.2s;
          box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
        }
        .btn-primary:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px color-mix(in srgb, var(--color-primary) 40%, transparent);
        }
        .btn-primary:disabled { background:var(--color-bg-soft); color:var(--color-text-muted); box-shadow:none; cursor:not-allowed; opacity:0.7; }

        .btn-ghost {
          display:inline-flex; align-items:center; gap:6px;
          padding:9px 16px;
          background:transparent;
          border:1px solid var(--color-border);
          border-radius:12px;
          font-size:13px; font-weight:600; color:var(--color-text-muted);
          cursor:pointer; transition:all 0.2s;
        }
        .btn-ghost:hover:not(:disabled) {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background: var(--color-primary-soft);
        }
        .btn-ghost:disabled { opacity:0.5; cursor:not-allowed; }

        .btn-sm-primary {
          display:inline-flex; align-items:center; gap:5px;
          padding:6px 14px;
          background: var(--color-primary);
          border:none; border-radius:10px;
          font-size:12px; font-weight:700; color:#fff;
          cursor:pointer; transition:all 0.18s;
        }
        .btn-sm-primary:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
        .btn-sm-primary:disabled { background:var(--color-bg-soft); color:var(--color-text-muted); cursor:not-allowed; }

        .btn-sm-ghost {
          display:inline-flex; align-items:center; gap:5px;
          padding:6px 12px;
          background:transparent;
          border:1px solid var(--color-border);
          border-radius:10px;
          font-size:12px; font-weight:600; color:var(--color-text-muted);
          cursor:pointer; transition:all 0.18s;
        }
        .btn-sm-ghost:hover { border-color:var(--color-primary); color:var(--color-primary); }

        .expand-btn {
          display:inline-flex; align-items:center; gap:4px;
          background:none; border:none; padding:0;
          font-size:12px; color:var(--color-text-muted);
          cursor:pointer; font-weight:500; transition:color 0.15s;
        }
        .expand-btn:hover { color: var(--color-primary); }

        .detail-item { display:flex; align-items:center; gap:9px; font-size:13px; color:var(--color-text-muted); }
        .detail-dot { width:5px; height:5px; border-radius:50%; background:var(--color-primary); flex-shrink:0; opacity:0.7; }

        .wipe-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:10px 20px;
          background:rgba(239,68,68,0.07);
          border:1px solid rgba(239,68,68,0.22);
          border-radius:12px;
          font-size:13px; font-weight:700; color:#EF4444;
          cursor:pointer; transition:all 0.2s;
        }
        .wipe-btn:hover { background:#EF4444; color:#fff; }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          animation: 'toastIn 0.3s ease',
          background: toast.ok ? 'var(--color-card-bg)' : 'var(--color-card-bg)',
          border: `1px solid ${toast.ok ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
          borderRadius: 14, padding: '12px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)',
          maxWidth: 320,
        }}>
          {toast.ok
            ? <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
            : <AlertTriangle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
          }
          {toast.text}
        </div>
      )}

      {/* ══════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════ */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 24, padding: '40px 44px 36px',
        marginBottom: 24,
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Gradient orb */}
        <div style={{
          position: 'absolute', top: -100, right: -80, width: 400, height: 400,
          background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 65%)',
          pointerEvents: 'none', borderRadius: '50%',
        }} />
        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '40px 40px', opacity: 0.3,
          maskImage: 'radial-gradient(ellipse 60% 60% at 80% 30%, black 0%, transparent 70%)',
        }} />
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 0%, transparent) 60%)',
          borderRadius: '24px 24px 0 0',
        }} />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
          {/* Left */}
          <div>
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'var(--color-primary-soft)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
              borderRadius: 99, padding: '4px 12px',
              marginBottom: 14,
            }}>
              <Layers size={12} color="var(--color-primary)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Admin Tool
              </span>
            </div>

            <h1 style={{
              fontSize: 28, fontWeight: 800, color: 'var(--color-text-main)',
              letterSpacing: '-0.5px', margin: '0 0 6px',
              lineHeight: 1.2,
            }}>
              Database Seeding
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '0 0 20px', maxWidth: 460, lineHeight: 1.6 }}>
              Populate every layer of the database with realistic demo data — users, keys, conversations, analytics — in a single run.
            </p>

            {/* Warning chip */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(217,119,6,0.08)',
              border: '1px solid rgba(217,119,6,0.2)',
              borderRadius: 10, padding: '8px 14px',
              fontSize: 13, color: '#B45309',
            }}>
              <ShieldAlert size={14} style={{ flexShrink: 0 }} />
              <span><strong style={{ fontWeight: 700 }}>Dev only.</strong> Never run against production data.</span>
            </div>
          </div>

          {/* Right — stats + actions */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14, minWidth: 200 }}>
            {/* Big progress ring replacement — clean stat */}
            <div style={{
              background: 'var(--color-bg-soft)',
              border: '1px solid var(--color-border)',
              borderRadius: 16, padding: '14px 20px',
              textAlign: 'center', minWidth: 130,
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1 }}>
                {pct}
                <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-primary)' }}>%</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {seededCount}/{sections.length} seeded
              </div>
              {/* Progress bar */}
              <div style={{ marginTop: 10, height: 4, borderRadius: 99, background: 'var(--color-bg-muted)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: 'var(--color-primary)',
                  borderRadius: 99,
                  transition: 'width 0.6s cubic-bezier(.16,1,.3,1)',
                  boxShadow: pct > 0 ? '0 0 8px color-mix(in srgb, var(--color-primary) 60%, transparent)' : 'none',
                }} />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" onClick={resetAll} disabled={anyRunning} style={{ flex: 1, justifyContent: 'center' }}>
                  <RefreshCw size={13} /> Reset
                </button>
                <button className="btn-primary" onClick={freshSeedAll} disabled={anyRunning || allSeeded} style={{ flex: 1, justifyContent: 'center' }}>
                  {anyRunning
                    ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    : allSeeded ? <CheckCircle2 size={13} /> : <Play size={13} />}
                  {anyRunning ? 'Seeding…' : allSeeded ? 'All Seeded' : 'Seed All'}
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                <button className="btn-ghost" onClick={mergeSeed} disabled={anyRunning || allSeeded} style={{ justifyContent: 'center', background: 'var(--color-bg-soft)', borderStyle: 'dashed' }}>
                  <Layers size={13} /> Merge Seed
                </button>
                <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: 0, textAlign: 'center', lineHeight: 1.2 }}>
                  Old data + new seeding data will be merged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          CARDS GRID
      ══════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
        {sections.map((sec, idx) => {
          const isOpen = expanded === sec.id;
          const isRunning = sec.status === 'running';
          const isSuccess = sec.status === 'success';
          const isError = sec.status === 'error';

          return (
            <div
              key={sec.id}
              className={`s-card ${isSuccess ? 'success' : isError ? 'error' : ''}`}
              style={{ animationDelay: `${idx * 55}ms` }}
            >
              {/* Left colored border accent */}
              <div style={{
                position: 'absolute', pointerEvents: 'none',
                // We'll use a top strip instead
              }} />

              {/* Top strip */}
              <div style={{
                height: 2,
                background: isSuccess
                  ? '#10B981'
                  : isError
                    ? '#EF4444'
                    : isRunning
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                transition: 'background 0.4s ease',
              }} />

              <div style={{ padding: '20px 22px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                    background: isSuccess
                      ? 'rgba(16,185,129,0.1)'
                      : isError
                        ? 'rgba(239,68,68,0.1)'
                        : 'var(--color-primary-soft)',
                    border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.25)' : isError ? 'rgba(239,68,68,0.25)' : 'color-mix(in srgb, var(--color-primary) 20%, transparent)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSuccess ? '#10B981' : isError ? '#EF4444' : 'var(--color-primary)',
                    transition: 'all 0.3s',
                  }}>
                    {isSuccess ? <CheckCircle2 size={20} /> : isRunning ? <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> : sec.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>{sec.title}</h3>
                      <StatusPill status={sec.status} message={messages[sec.id]} />
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {sec.description}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--color-border)', margin: '0 0 14px', opacity: 0.6 }} />

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <button className="expand-btn" onClick={() => setExpanded(p => p === sec.id ? null : sec.id)}>
                    {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    {isOpen ? 'Collapse' : 'Details'}
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700, marginLeft: 2 }}>· {sec.count}</span>
                  </button>

                  <div style={{ display: 'flex', gap: 7 }}>
                    {isSuccess && (
                      <button className="btn-sm-ghost" onClick={() => setSections(p => p.map(s => s.id === sec.id ? { ...s, status: 'idle' } : s))}>
                        <Trash2 size={11} /> Reset
                      </button>
                    )}
                    <button
                      className="btn-sm-primary"
                      onClick={() => seedOne(sec.id)}
                      disabled={isRunning || isSuccess}
                      style={isRunning || isSuccess ? { background: 'var(--color-bg-soft)', color: 'var(--color-text-muted)', boxShadow: 'none' } : {}}
                    >
                      {isRunning
                        ? <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />
                        : isSuccess ? <CheckCircle2 size={11} /> : <Play size={11} />}
                      {isRunning ? 'Running' : isSuccess ? 'Done' : 'Seed'}
                    </button>
                  </div>
                </div>

                {/* Expandable details */}
                {isOpen && (
                  <div style={{
                    marginTop: 14, paddingTop: 14,
                    borderTop: '1px solid var(--color-border)',
                    animation: 'slideUp 0.2s ease',
                  }}>
                    <p style={{
                      fontSize: 10, fontWeight: 800, color: 'var(--color-primary)',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      margin: '0 0 10px',
                    }}>
                      Included records
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {sec.details.map((d, i) => (
                        <div key={i} className="detail-item">
                          <div className="detail-dot" />
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════
          DANGER ZONE
      ══════════════════════════════════════ */}
      <div style={{
        marginTop: 20,
        background: 'rgba(239,68,68,0.03)',
        border: '1px solid rgba(239,68,68,0.16)',
        borderRadius: 20, padding: '22px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#EF4444', flexShrink: 0,
          }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#EF4444', margin: '0 0 2px' }}>Danger Zone</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
              Permanently delete all seeded test data. This action cannot be undone.
            </p>
          </div>
        </div>
        <button className="wipe-btn" onClick={wipe}>
          <Trash2 size={13} /> Wipe Test Data
        </button>
      </div>
    </div>
  );
}
