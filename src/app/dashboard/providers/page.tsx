'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Pause, Play, CheckCircle2, Search, ExternalLink, Wifi, Plug, Key, Copy, Layers, X } from 'lucide-react';
import styles from '../dashboard.module.css';
import { Button, Badge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

type Provider = {
  id: string;
  name: string;
  icon: string;
  color: string;
  masked: string;
  status: 'active' | 'paused';
  added: string;
};

const PROVIDER_META: Record<string, { name: string; icon: string; color: string; desc: string }> = {
  openai: { name: 'OpenAI', icon: 'https://cdn.simpleicons.org/openai/10A37F', color: '#10A37F', desc: 'GPT-4o, GPT-4 Turbo, o1' },
  anthropic: { name: 'Anthropic', icon: 'https://cdn.simpleicons.org/anthropic/D97757', color: '#D97757', desc: 'Claude 3.5 Sonnet, Opus, Haiku' },
  google: { name: 'Google', icon: 'https://cdn.simpleicons.org/google/4285F4', color: '#4285F4', desc: 'Gemini 1.5 Pro, Flash' },
  meta: { name: 'Meta', icon: 'https://cdn.simpleicons.org/meta/0668E1', color: '#0668E1', desc: 'Llama 3.1 405B, 70B, 8B' },
  deepseek: { name: 'DeepSeek', icon: 'https://logo.clearbit.com/deepseek.com', color: '#1A53E8', desc: 'DeepSeek Chat, Coder V2' },
};

export default function ProvidersPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'sub' | 'own'>('sub');
  const [selected, setSelected] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [search, setSearch] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableProviders, setAvailableProviders] = useState<{ id: string; name: string; key: string; icon: string; color: string; desc: string }[]>([]);
  const [showModelsModal, setShowModelsModal] = useState<Provider | null>(null);
  const [providerModels, setProviderModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    // List user's connected providers
    api.listProviders().then((r) => setProviders(r.providers)).catch((e) => toast(e.message, 'error')).finally(() => setLoading(false));

    // Load active admin providers
    fetch('/api/admin/providers')
      .then(res => res.json())
      .then(data => {
        if (data.providers) {
          const list = data.providers
            .filter((p: any) => p.status)
            .map((p: any) => {
              const nameLower = p.name.toLowerCase();
              let key = 'custom';
              let icon = 'https://logo.clearbit.com/openai.com'; 
              let color = '#8b5cf6';
              let desc = `Custom upstream provider: ${p.baseUrl || 'Default Route'}`;

              if (nameLower.includes('openai')) {
                key = 'openai';
                icon = 'https://cdn.simpleicons.org/openai/10A37F';
                color = '#10A37F';
                desc = 'GPT-4o, GPT-4 Turbo, o1';
              } else if (nameLower.includes('anthropic')) {
                key = 'anthropic';
                icon = 'https://cdn.simpleicons.org/anthropic/D97757';
                color = '#D97757';
                desc = 'Claude 3.5 Sonnet, Opus, Haiku';
              } else if (nameLower.includes('google') || nameLower.includes('gemini')) {
                key = 'google';
                icon = 'https://cdn.simpleicons.org/google/4285F4';
                color = '#4285F4';
                desc = 'Gemini 1.5 Pro, Flash';
              } else if (nameLower.includes('deepseek')) {
                key = 'deepseek';
                icon = 'https://logo.clearbit.com/deepseek.com';
                color = '#1A53E8';
                desc = 'DeepSeek Chat, Coder V2';
              } else if (nameLower.includes('meta') || nameLower.includes('llama')) {
                key = 'meta';
                icon = 'https://cdn.simpleicons.org/meta/0668E1';
                color = '#0668E1';
                desc = 'Llama 3.1 405B, 70B, 8B';
              }

              return {
                id: p.id,
                name: p.name,
                key,
                icon,
                color,
                desc,
              };
            });
          setAvailableProviders(list);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const connect = async () => {
    if (!selected || !keyValue.trim()) {
      toast('Select a provider and enter a key', 'warning');
      return;
    }
    try {
      const r = await api.createProvider(selected, keyValue.trim());
      const meta = availableProviders.find(p => p.key === selected) || { name: 'Custom AI', icon: '', color: '#8b5cf6' };
      setProviders((prev) => [
        { id: 'tmp_' + Date.now(), name: meta.name, icon: meta.icon, color: meta.color, masked: `••••••••••••${keyValue.trim().slice(-4)}`, status: 'active', added: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
        ...prev.filter((p) => p.name !== meta.name),
      ]);
      setSelected('');
      setKeyValue('');
      toast(`${meta.name} connected successfully`);
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const toggle = async (id: string, current: string) => {
    const next = current === 'active' ? 'paused' : 'active';
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, status: next as any } : p)));
    try { await api.setProviderStatus(id, next as 'active' | 'paused'); } catch (e: any) { toast(e.message, 'error'); }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}? You'll need to reconnect to use it again.`)) return;
    setProviders((prev) => prev.filter((p) => p.id !== id));
    try { await api.deleteProvider(id); toast(`${name} removed`, 'warning'); } catch (e: any) { toast(e.message, 'error'); }
  };

  const loadModels = async (p: Provider) => {
    setShowModelsModal(p);
    setLoadingModels(true);
    setProviderModels([]);
    try {
      const res = await api.models();
      const filtered = res.models.filter((m: any) => m.provider.toLowerCase() === p.name.toLowerCase());
      setProviderModels(filtered);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoadingModels(false);
    }
  };

  const filtered = providers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 6 }}>Providers</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Choose how you want to access AI models — use ours or connect your own provider keys.
        </p>
      </div>

      {/* Tab Selector */}
      <div role="tablist" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '640px', marginBottom: '32px', marginTop: '24px' }}>
        {([
          { key: 'sub', icon: '📦', title: 'Use Our Models', sub: 'Ready to use, no setup' },
          { key: 'own', icon: '🔑', title: 'Use Own API Keys', sub: 'BYOK — pay providers direct' },
        ] as const).map((opt) => {
          const active = activeTab === opt.key;
          return (
            <button key={opt.key} role="tab" aria-selected={active} onClick={() => setActiveTab(opt.key)} style={{
              position: 'relative', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px',
              borderRadius: 'var(--radius-lg)', border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: active ? 'var(--color-primary-soft)' : 'var(--color-card-bg)', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s ease', boxShadow: active ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
            }}>
              <span style={{ flexShrink: 0, width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: active ? 'var(--color-primary)' : 'var(--color-bg-soft)' }}>{opt.icon}</span>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: active ? 'var(--color-primary)' : 'var(--color-text-main)' }}>{opt.title}</span>
                <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{opt.sub}</span>
              </span>
              <span style={{ position: 'absolute', top: '14px', right: '14px', width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`, background: active ? 'var(--color-primary)' : 'transparent' }}>
                {active && <span style={{ position: 'absolute', top: '3px', left: '5px', width: '4px', height: '8px', border: 'solid #fff', borderWidth: '0 2px 2px 0', transform: 'rotate(45deg)' }} />}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === 'sub' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Our Model Catalog</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>These models are managed by CheapAgents. No setup needed — just use our unified API.</p>
          </div>
          <ProvidersModelsTable />
        </div>
      )}

      {activeTab === 'own' && (
        <div>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Bring Your Own Key (BYOK)</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Connect your own provider keys. You pay them directly — our routing is completely free.</p>
          </div>

          {/* Connect Form */}
          <div className="card glass-card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '20px' }}>
              <Wifi size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Connect New Provider</h3>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-muted)' }}>Provider</label>
                <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{
                  width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                  fontSize: '15px', background: 'var(--color-input-bg)', color: 'var(--color-text-main)', fontFamily: 'inherit'
                }}>
                  <option value="">Select a provider…</option>
                  {availableProviders.map((p) => <option key={p.id} value={p.key}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 2, minWidth: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>API Key</label>
                  {selected && (
                    <a href={`https://${selected === 'openai' ? 'platform.openai.com' : selected === 'anthropic' ? 'console.anthropic.com' : 'aistudio.google.com'}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Get key <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="password" placeholder={selected ? `Enter your ${availableProviders.find(p => p.key === selected)?.name ?? ''} API key` : 'sk-...'}
                    value={keyValue} onChange={(e) => setKeyValue(e.target.value)}
                    style={{ flex: 1, padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '15px', background: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}
                  />
                  <Button onClick={connect}><Plus size={16} /> Connect</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Providers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plug size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Active Connections
                  <span style={{ fontSize: '12px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px', background: 'var(--color-bg-muted)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                    {filtered.length} connected
                  </span>
                </h3>
              </div>
            </div>
            {providers.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: '100px', border: '1px solid var(--color-border)', background: 'var(--color-card-bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'all 0.2s ease' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <Search size={14} color="var(--color-text-muted)" />
                <input type="text" placeholder="Search providers…" value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: '13px', outline: 'none', color: 'var(--color-text-main)', width: 140 }} />
              </div>
            )}
          </div>

          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>Loading providers…</div>
          ) : filtered.length === 0 ? (
            <div className="card">
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}><Plus size={24} /></div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 8 }}>No providers connected</h3>
                <p>Use the form above to connect your first AI provider.</p>
              </div>
            </div>
          ) : (
            <div className={styles.statsGrid}>
              {filtered.map((p) => (
                <div key={p.id} className="card glass-card" style={{ border: `1px solid ${p.status === 'active' ? 'rgba(22,163,74,0.3)' : 'rgba(245,158,11,0.3)'}`, position: 'relative', overflow: 'hidden', padding: '24px', background: 'var(--color-card-bg)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'; }}
                >
                  {/* Status indicator stripe */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: p.status === 'active' ? 'var(--color-success)' : 'var(--color-warning)', opacity: 0.9 }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
                        <img src={p.icon} width="24" height="24" alt={p.name} style={{ borderRadius: '4px' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: p.color, letterSpacing: '-0.3px' }}>{p.name}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{availableProviders.find(ap => ap.name.toLowerCase() === p.name.toLowerCase())?.desc ?? 'Custom Connected Key'}</p>
                      </div>
                    </div>
                    <Badge tone={p.status === 'active' ? 'success' : 'warning'}>
                      {p.status === 'active' && <CheckCircle2 size={11} />} {p.status === 'active' ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--color-bg)', borderRadius: '8px', border: '1px dashed var(--color-border)', marginBottom: '16px', color: 'var(--color-text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Key size={14} color="var(--color-text-muted)" />
                      <span style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '1px' }}>{p.masked}</span>
                    </div>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }} title="Copy Key" onClick={() => toast('Key copied to clipboard', 'success')}>
                      <Copy size={14} />
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Connected {p.added}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', transition: 'all 0.2s' }} 
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-muted)'; e.currentTarget.style.borderColor = 'var(--color-text-muted)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-soft)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                      onClick={() => loadModels(p)}>
                      <Layers size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Models
                    </button>
                    <button className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', transition: 'all 0.2s' }} 
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-muted)'; e.currentTarget.style.borderColor = 'var(--color-text-muted)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-soft)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                      onClick={() => toast(`${p.name} connection test OK`, 'success')}>
                      Test
                    </button>
                    <button className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', background: p.status === 'active' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', color: p.status === 'active' ? 'var(--color-warning)' : 'var(--color-success)', border: `1px solid ${p.status === 'active' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`, transition: 'all 0.2s' }} 
                      onMouseEnter={e => e.currentTarget.style.background = p.status === 'active' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = p.status === 'active' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)'}
                      onClick={() => toggle(p.id, p.status)}>
                      {p.status === 'active' ? <><Pause size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Pause</> : <><Play size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Resume</>}
                    </button>
                    <button className="btn-secondary" style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.3)', transition: 'all 0.2s' }} 
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onClick={() => remove(p.id, p.name)} title="Remove Provider">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModelsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }} onClick={() => setShowModelsModal(null)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', height: '100%', overflowY: 'auto', padding: '32px 24px', background: 'var(--color-card-bg)', borderLeft: '1px solid var(--color-border)', boxShadow: '-10px 0 40px rgba(0,0,0,0.2)', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={showModelsModal.icon} width="32" height="32" alt={showModelsModal.name} style={{ borderRadius: 8, background: 'white' }} />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)' }}>{showModelsModal.name} Models</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Available API models</p>
                </div>
              </div>
              <button style={{ background: 'var(--color-bg-soft)', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} 
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-muted)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-soft)'}
                onClick={() => setShowModelsModal(null)}
              >
                <X size={16} />
              </button>
            </div>
            
            {loadingModels ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ width: 20, height: 20, border: '2px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                Loading...
              </div>
            ) : providerModels.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <Layers size={24} style={{ opacity: 0.5, margin: '0 auto 12px', display: 'block' }} />
                No models found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {providerModels.map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'transparent', borderRadius: '8px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '14px' }}>{m.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{m.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProvidersModelsTable() {
  const [models, setModels] = useState<any[] | null>(null);
  useEffect(() => { api.models().then((r) => setModels(r.models)).catch(() => setModels([])); }, []);
  if (!models) return <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading models…</div>;
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Model</th><th>Provider</th><th>Context</th><th>Input / 1M</th><th style={{ textAlign: 'right' }}>Output / 1M</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr key={m.id}>
              <td><strong>{m.name}</strong></td>
              <td style={{ color: 'var(--color-text-muted)' }}>{m.provider}</td>
              <td><Badge tone="neutral">{m.context}</Badge></td>
              <td style={{ color: 'var(--color-text-muted)' }}>{m.input}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{m.output}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
