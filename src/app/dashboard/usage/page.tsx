'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import styles from '../dashboard.module.css';
import { Activity, Zap, Wallet, Cpu, Terminal, MessageSquare, Globe, Hammer, Braces, MessagesSquare } from 'lucide-react';

const TABS = [
  { key: 'cli', label: 'CLI / Code Editor', icon: <Terminal size={15} /> },
  { key: 'chat', label: 'Cheap Chats', icon: <MessageSquare size={15} /> },
  { key: 'web', label: 'Web Builder', icon: <Globe size={15} /> },
  { key: 'ide', label: 'IDE Builder', icon: <Hammer size={15} /> },
  { key: 'api', label: 'APIs', icon: <Braces size={15} /> },
];

const TAB_META: Record<string, { description: string }> = {
  cli: { description: 'Model calls made from the CheapRouter CLI and code editors via /v1/chat/completions.' },
  chat: { description: 'Messages sent in Cheap Chats through the chat and streaming endpoints.' },
  web: { description: 'AI usage from the Web Builder (Devonz vibe-coding) while generating web apps.' },
  ide: { description: 'AI usage from the IDE Builder (Devonz code editor) while writing and fixing code.' },
  api: { description: 'Every call made through the /v1/chat/completions API endpoint.' },
};

export default function UsagePage() {
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cli');

  useEffect(() => {
    let active = true;
    const load = () => {
      api.usageBreakdown(activeTab)
        .then((d) => { if (active) setBreakdown(d); })
        .catch(() => { if (active) setBreakdown(null); })
        .finally(() => { if (active) setLoading(false); });
    };
    setLoading(true);
    load();
    const id = setInterval(load, 10000);
    return () => { active = false; clearInterval(id); };
  }, [activeTab]);

  const b = breakdown ?? { models: [], totalModels: 0, totalCalls: 0, totalTokens: 0, totalCost: 0, conversations: 0, messages: 0 };

  const cardsFor = (key: string) => {
    if (key === 'chat') {
      return [
        { label: 'Total Chats', value: b.conversations.toLocaleString(), icon: <MessagesSquare size={20} />, bg: 'var(--color-primary-soft)', color: 'var(--color-primary)' },
        { label: 'Total Messages', value: b.messages.toLocaleString(), icon: <MessageSquare size={20} />, bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
        { label: 'Tokens Used', value: b.totalTokens.toLocaleString(), icon: <Zap size={20} />, bg: 'var(--color-success-soft)', color: 'var(--color-success)' },
        { label: 'Total Cost', value: `$${b.totalCost.toFixed(4)}`, icon: <Wallet size={20} />, bg: 'rgba(217,119,6,0.1)', color: 'var(--color-warning)' },
      ];
    }
    return [
      { label: 'Total AI Models Used', value: b.totalModels.toLocaleString(), icon: <Cpu size={20} />, bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
      { label: key === 'web' ? 'Total Builds' : key === 'ide' ? 'Total IDE Calls' : key === 'cli' ? 'Total CLI Calls' : 'Total API Calls', value: b.totalCalls.toLocaleString(), icon: <Activity size={20} />, bg: 'var(--color-primary-soft)', color: 'var(--color-primary)' },
      { label: 'Tokens Used', value: b.totalTokens.toLocaleString(), icon: <Zap size={20} />, bg: 'var(--color-success-soft)', color: 'var(--color-success)' },
      { label: 'Total Cost', value: `$${b.totalCost.toFixed(4)}`, icon: <Wallet size={20} />, bg: 'rgba(217,119,6,0.1)', color: 'var(--color-warning)' },
    ];
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Usage Analytics</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Track your API calls, token consumption, and spending across all products.</p>
      </div>

      {/* ─── PRODUCT TABS ─── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
              border: `1px solid ${activeTab === t.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: activeTab === t.key ? 'var(--color-primary)' : 'transparent',
              color: activeTab === t.key ? '#fff' : 'var(--color-text-muted)',
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === t.key ? '0 4px 14px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading usage data…</div>
      ) : (
        <>
          <div className={styles.statsGrid} style={{ marginBottom: '28px' }}>
            {cardsFor(activeTab).map((s) => (
              <div className={styles.statCard} key={s.label}>
                <div className={styles.statIcon} style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statValue}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="card glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                {TABS.find(t => t.key === activeTab)?.label} Usage
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {TAB_META[activeTab]?.description}
              </p>
            </div>

            {b.models.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                No usage recorded for this product yet.
              </div>
            ) : (
              <div className={styles.tableScroll}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>AI Model</th>
                      <th style={{ textAlign: 'right' }}>{activeTab === 'web' ? 'Builds' : activeTab === 'chat' ? 'Hits' : 'API Hits'}</th>
                      <th style={{ textAlign: 'right' }}>Tokens Used</th>
                      <th style={{ textAlign: 'right' }}>Cost</th>
                      <th style={{ textAlign: 'right' }}>Last Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.models.map((m: any, i: number) => (
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '13px' }}>{m.model}</div>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{m.hits.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{m.tokens.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-warning)' }}>${m.cost.toFixed(4)}</td>
                        <td style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {m.last_used ? new Date(m.last_used).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date(m.last_used).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}