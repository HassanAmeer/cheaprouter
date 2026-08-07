'use client';

import React, { useState } from 'react';
import {
  Database, Users, Zap, MessageSquare, Bell, BarChart2, CreditCard,
  Play, RefreshCw, Trash2, CheckCircle2, AlertTriangle, Info, ChevronDown, ChevronRight,
  ShieldAlert
} from 'lucide-react';

type SeedStatus = 'idle' | 'running' | 'success' | 'error';

type SeedSection = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: string;
  count: string;
  status: SeedStatus;
};

const initialSections: SeedSection[] = [
  {
    id: 'users',
    icon: <Users size={22} />,
    title: 'Users',
    description: 'Create 10 demo user accounts with varied plan tiers (Free, Pro, Enterprise).',
    details: ['4 Free plan users', '4 Pro plan users', '2 Enterprise plan users', '1 Suspended account', 'Password: password123 for all'],
    color: '#3B82F6',
    count: '10 users',
    status: 'idle',
  },
  {
    id: 'api_keys',
    icon: <Zap size={22} />,
    title: 'API Keys',
    description: 'Generate user-scoped API keys with realistic prefixes and hashes.',
    details: ['1-2 keys per user', 'Production & Development keys', 'Realistic key prefixes (cr_...)', 'Requires users to be seeded first'],
    color: '#8B5CF6',
    count: '~15 keys',
    status: 'idle',
  },
  {
    id: 'providers',
    icon: <Database size={22} />,
    title: 'BYOK Providers',
    description: 'Seed bring-your-own-key provider entries for top 5 users.',
    details: ['OpenAI & Anthropic providers', 'Masked key format (••••1234)', 'Active status by default', 'Requires users to be seeded first'],
    color: '#10B981',
    count: '~5 entries',
    status: 'idle',
  },
  {
    id: 'conversations',
    icon: <MessageSquare size={22} />,
    title: 'Conversations & Messages',
    description: 'Generate real-looking chat history with CheapModels Q&A content.',
    details: ['3-6 conversations per user', '2-4 message pairs each', '10 unique AI topics', '~250 total messages'],
    color: '#F59E0B',
    count: '~45 convs',
    status: 'idle',
  },
  {
    id: 'usage',
    icon: <BarChart2 size={22} />,
    title: 'Usage Analytics',
    description: 'Insert 30 days of realistic token usage data across all 5 AI models.',
    details: ['30 days × 10 users', '1-3 models used per day', 'GPT-4o, Claude, Gemini, Llama, DeepSeek', 'Realistic token counts (500-8000)'],
    color: '#EC4899',
    count: '~900 records',
    status: 'idle',
  },
  {
    id: 'notifications',
    icon: <Bell size={22} />,
    title: 'Notifications',
    description: 'Seed global announcements and personal per-user notifications.',
    details: ['5 global notifications (all users)', '2-3 personal per user', 'Mix of read/unread states', 'Realistic content & emojis'],
    color: '#CC0000',
    count: '~30 notifs',
    status: 'idle',
  },
  {
    id: 'plans',
    icon: <CreditCard size={22} />,
    title: 'Plans, Settings & Admin Providers',
    description: 'Seed global site settings, pricing plans, and admin provider routing config.',
    details: ['Free / Pro / Enterprise pricing', '5 admin provider configs (OpenAI, Anthropic, Google, Meta, DeepSeek)', 'Site name, tagline, CTAs', 'Routing priority order'],
    color: '#6366F1',
    count: '3 plans + 5 providers',
    status: 'idle',
  },
];

function StatusBadge({ status, message }: { status: SeedStatus; message?: string }) {
  const map = {
    idle: { label: 'Not seeded', bg: 'var(--color-bg-soft)', color: 'var(--color-text-muted)' },
    running: { label: 'Seeding...', bg: 'rgba(59,130,246,0.12)', color: '#3B82F6' },
    success: { label: message || 'Seeded ✓', bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    error: { label: message || 'Failed ✗', bg: 'rgba(220,38,38,0.12)', color: '#DC2626' },
  };
  const s = map[status];
  return (
    <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {status === 'running' && <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
    </span>
  );
}

export default function SeedingPage() {
  const [sections, setSections] = useState<SeedSection[]>(initialSections);
  const [sectionMessages, setSectionMessages] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [seedingAll, setSeedingAll] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<string>('');

  const toggleExpand = (id: string) => setExpanded(prev => prev === id ? null : id);

  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const callSeedAPI = async (section: string): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ section }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error || 'Failed' };
      return { ok: true, message: data.message || 'Done' };
    } catch (e) {
      return { ok: false, message: 'Network error' };
    }
  };

  const handleSeedOne = async (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, status: 'running' } : s));
    const result = await callSeedAPI(id);
    setSections(prev => prev.map(s => s.id === id ? { ...s, status: result.ok ? 'success' : 'error' } : s));
    setSectionMessages(prev => ({ ...prev, [id]: result.message }));
  };

  const handleSeedAll = async () => {
    setSeedingAll(true);
    setGlobalMessage('');
    const ids = initialSections.map(s => s.id);
    for (const id of ids) {
      setSections(prev => prev.map(s => s.id === id ? { ...s, status: 'running' } : s));
      const result = await callSeedAPI(id);
      setSections(prev => prev.map(s => s.id === id ? { ...s, status: result.ok ? 'success' : 'error' } : s));
      setSectionMessages(prev => ({ ...prev, [id]: result.message }));
      await new Promise(r => setTimeout(r, 200));
    }
    setGlobalMessage('All sections seeded successfully!');
    setSeedingAll(false);
  };

  const handleResetAll = () => {
    setSections(initialSections.map(s => ({ ...s, status: 'idle' })));
    setSectionMessages({});
    setGlobalMessage('');
  };

  const handleWipe = async () => {
    if (!confirm('This will permanently delete ALL seeded test data. Are you sure?')) return;
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        handleResetAll();
        setGlobalMessage(data.message || 'Wiped successfully');
      }
    } catch (e) {
      setGlobalMessage('Wipe failed — check backend connection');
    }
  };

  const allSeeded = sections.every(s => s.status === 'success');
  const anyRunning = sections.some(s => s.status === 'running') || seedingAll;
  const seededCount = sections.filter(s => s.status === 'success').length;

  return (
    <div style={{ width: '100%', paddingBottom: '80px' }}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .seed-card { animation: fadeSlideIn 0.35s ease both; }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '24px',
        padding: '36px 40px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(204,0,0,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
              <div style={{ background: 'var(--color-primary-soft)', padding: '12px', borderRadius: '16px', color: 'var(--color-primary)', display: 'flex' }}>
                <Database size={26} />
              </div>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.4px', margin: 0 }}>Database Seeding</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>Populate the database with temporary test data for development.</p>
              </div>
            </div>

            {/* Warning Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '10px 16px', fontSize: '13px', color: '#D97706', marginTop: '8px', maxWidth: '520px' }}>
              <ShieldAlert size={16} />
              <span>This is for <strong>development/testing only</strong>. Do not run on production data.</span>
            </div>
          </div>

          {/* Progress pill */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {seededCount}/{sections.length} sections seeded
            </div>
            {/* Progress bar */}
            <div style={{ width: '160px', height: '8px', borderRadius: '99px', background: 'var(--color-bg-soft)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(seededCount / sections.length) * 100}%`, background: 'var(--color-primary)', borderRadius: '99px', transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleResetAll}
                disabled={anyRunning}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', cursor: anyRunning ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: anyRunning ? 0.6 : 1 }}
              >
                <Trash2 size={14} /> Reset All
              </button>
              <button
                onClick={handleSeedAll}
                disabled={anyRunning || allSeeded}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: (anyRunning || allSeeded) ? 'var(--color-bg-soft)' : 'var(--color-primary)', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: (anyRunning || allSeeded) ? 'var(--color-text-muted)' : '#fff', cursor: (anyRunning || allSeeded) ? 'not-allowed' : 'pointer', transition: 'all 0.25s', boxShadow: (anyRunning || allSeeded) ? 'none' : 'var(--shadow-md)' }}
                onMouseOver={e => { if (!anyRunning && !allSeeded) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {anyRunning ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : allSeeded ? <CheckCircle2 size={14} /> : <Play size={14} />}
                {anyRunning ? 'Seeding...' : allSeeded ? 'All Seeded' : 'Seed All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Seed Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
        {sections.map((section, idx) => {
          const isOpen = expanded === section.id;
          const isRunning = section.status === 'running';
          return (
            <div
              key={section.id}
              className="seed-card"
              style={{
                animationDelay: `${idx * 50}ms`,
                background: 'var(--color-card-bg)',
                border: `1px solid ${section.status === 'success' ? 'rgba(16,185,129,0.3)' : section.status === 'error' ? 'rgba(220,38,38,0.3)' : 'var(--color-border)'}`,
                borderRadius: '20px',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s, transform 0.2s',
                boxShadow: section.status === 'success' ? '0 0 0 1px rgba(16,185,129,0.15), var(--shadow-sm)' : 'var(--shadow-sm)',
              }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = section.status === 'success' ? '0 0 0 1px rgba(16,185,129,0.15), var(--shadow-sm)' : 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Colored top strip */}
              <div style={{ height: '4px', background: section.status === 'success' ? '#10B981' : section.status === 'error' ? '#DC2626' : section.color, transition: 'background 0.4s' }} />

              <div style={{ padding: '22px 24px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${section.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: section.color, flexShrink: 0 }}>
                    {section.icon}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>{section.title}</h3>
                      <StatusBadge status={section.status} message={sectionMessages[section.id]} />
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>{section.description}</p>
                  </div>
                </div>

                {/* Footer row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <button
                    onClick={() => toggleExpand(section.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', padding: '0', fontSize: '12px', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 500 }}
                  >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {isOpen ? 'Hide' : 'Details'} · <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{section.count}</span>
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {section.status === 'success' && (
                      <button
                        onClick={() => setSections(prev => prev.map(s => s.id === section.id ? { ...s, status: 'idle' } : s))}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} /> Reset
                      </button>
                    )}
                    <button
                      onClick={() => handleSeedOne(section.id)}
                      disabled={isRunning || section.status === 'success'}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', background: isRunning || section.status === 'success' ? 'var(--color-bg-soft)' : section.color, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: isRunning || section.status === 'success' ? 'var(--color-text-muted)' : '#fff', cursor: isRunning || section.status === 'success' ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: isRunning || section.status === 'success' ? 0.7 : 1 }}
                    >
                      {isRunning ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : section.status === 'success' ? <CheckCircle2 size={12} /> : <Play size={12} />}
                      {isRunning ? 'Running' : section.status === 'success' ? 'Done' : 'Seed'}
                    </button>
                  </div>
                </div>

                {/* Expandable details */}
                {isOpen && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', animation: 'fadeSlideIn 0.2s ease' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What will be seeded:</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {section.details.map((d, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: section.color, flexShrink: 0 }} />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Danger Zone ── */}
      <div style={{ marginTop: '28px', background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '20px', padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: '#DC2626', display: 'flex' }}><AlertTriangle size={22} /></div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#DC2626', margin: '0 0 3px' }}>Danger Zone</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>Permanently wipe all seeded test data from the database. This cannot be undone.</p>
            </div>
          </div>
          <button
            onClick={handleWipe}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#DC2626', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.1)'; e.currentTarget.style.color = '#DC2626'; }}
          >
            <Trash2 size={14} /> Wipe Test Data
          </button>
        </div>
      </div>
    </div>
  );
}
