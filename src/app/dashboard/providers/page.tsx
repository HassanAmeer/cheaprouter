'use client';
import { useState } from 'react';
import styles from '../dashboard.module.css';
import ModelsTable from '../../../components/ModelsTable';

export default function ProvidersPage() {
  const [activeTab, setActiveTab] = useState<'sub' | 'own'>('sub');

  return (
    <div>
      {/* Clear helper line */}
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '16px' }}>
        Pick how you want to run models — use our ready-made catalog, or plug in your own provider keys (free, no margins).
      </p>

      {/* Segmented choice control */}
      <div
        role="tablist"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          maxWidth: '640px',
          marginBottom: '36px',
        }}
      >
        {([
          { key: 'sub', icon: '📦', title: 'Use Our Models', sub: 'Ready to use, no setup' },
          { key: 'own', icon: '🔑', title: 'Use Own API Keys', sub: 'BYOK — pay providers direct' },
        ] as const).map((opt) => {
          const active = activeTab === opt.key;
          return (
            <button
              key={opt.key}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(opt.key)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 18px',
                borderRadius: 'var(--radius-lg)',
                border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: active ? 'rgba(204,0,0,0.04)' : 'var(--color-card-bg)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: active ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  background: active ? 'var(--color-primary)' : 'var(--color-bg-soft)',
                  transition: 'all 0.2s ease',
                }}
              >
                {opt.icon}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: active ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                  {opt.title}
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {opt.sub}
                </span>
              </span>
              <span
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-primary)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {active && (
                  <span style={{ position: 'absolute', top: '3px', left: '5px', width: '4px', height: '8px', border: 'solid #fff', borderWidth: '0 2px 2px 0', transform: 'rotate(45deg)' }} />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub Models Tab */}
      {activeTab === 'sub' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Use Our Models</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              These models are provided and managed by CheapModels. No setup needed — just pick one and start using it through the unified API.
            </p>
          </div>

          <ModelsTable />
        </div>
      )}

      {/* Own API Keys Tab */}
      {activeTab === 'own' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Bring Your Own Key (BYOK)</h1>
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>+ New Provider</button>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
            Connect your own AI provider keys (BYOK). You pay your provider directly and use our unified UI for free — no token margins.
          </p>

          {/* Connection Area */}
          <div className="card glass-card" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Connect New Provider</h2>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Select Provider</label>
                <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px', background: '#F9FAFB' }}>
                  <option value="">-- Choose a Provider --</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="meta">Meta (Llama)</option>
                  <option value="deepseek">DeepSeek</option>
                </select>
              </div>

              <div style={{ flex: 2, minWidth: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600 }}>API Key</label>
                  <a href="#" style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>Get API Key here ↗</a>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <input type="password" placeholder="sk-..." style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px', background: '#F9FAFB' }} />
                  <button className="btn-primary" style={{ padding: '0 32px' }}>Save</button>
                </div>
              </div>

            </div>
          </div>

          {/* Connected Providers List */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Connected Providers</h2>
            <input type="text" placeholder="Search providers..." style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--color-border)', fontSize: '14px', width: '250px' }} />
          </div>

          <div className={styles.statsGrid}>
            
            {/* Active Connected Provider */}
            <div className="card glass-card" style={{ border: '1px solid #16a34a', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#16a34a' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#10A37F', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="https://cdn.simpleicons.org/openai/10A37F" width="24" height="24" alt="OpenAI" /> OpenAI
                </h3>
                <span style={{ fontSize: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>Active</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '8px' }}>Key: sk-proj-••••••••••••8A21</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>Added on: Jul 15, 2026</p>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '14px' }}>Test</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '14px' }}>Pause</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '14px', color: 'var(--color-primary)', borderColor: 'rgba(204,0,0,0.2)' }}>Delete</button>
              </div>
            </div>

            {/* Paused Connected Provider */}
            <div className="card glass-card" style={{ border: '1px solid #F59E0B', position: 'relative', overflow: 'hidden', opacity: 0.8 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#F59E0B' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#D97757', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="https://cdn.simpleicons.org/anthropic/D97757" width="24" height="24" alt="Anthropic" /> Anthropic
                </h3>
                <span style={{ fontSize: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#D97706', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>Paused</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '8px' }}>Key: sk-ant-••••••••••••990P</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>Added on: Jul 12, 2026</p>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '14px' }} disabled>Test</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '14px', color: '#16a34a', borderColor: 'rgba(34,197,94,0.2)' }}>Resume</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '14px', color: 'var(--color-primary)', borderColor: 'rgba(204,0,0,0.2)' }}>Delete</button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
