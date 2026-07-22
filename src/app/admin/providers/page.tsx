'use client';
import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Save, AlertTriangle, Plus, X } from 'lucide-react';

type Model = { id: string; name: string };
type Provider = { id: string; name: string; status: boolean; key: string; priority: number; models: Model[]; baseUrl?: string };

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State for Add Provider Modal
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvName, setNewProvName] = useState('');
  const [newProvBaseUrl, setNewProvBaseUrl] = useState('');

  // State for Add Model
  const [addingModelTo, setAddingModelTo] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState('');

  useEffect(() => {
    fetch('/api/admin/providers')
      .then(res => res.json())
      .then(data => {
        if (data.providers) setProviders(data.providers);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleProvider = (id: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, status: !p.status } : p));
    setSaved(false);
  };

  const updateKey = (id: string, newKey: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, key: newKey } : p));
    setSaved(false);
  };

  const updateBaseUrl = (id: string, newBaseUrl: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, baseUrl: newBaseUrl } : p));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providers)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProvider = () => {
    if (!newProvName.trim()) return;
    setProviders([...providers, {
      id: `prov_${Date.now()}`,
      name: newProvName,
      status: false,
      key: '',
      priority: providers.length + 1,
      models: [],
      baseUrl: newProvBaseUrl.trim() || undefined
    }]);
    setNewProvName('');
    setNewProvBaseUrl('');
    setShowAddProvider(false);
    setSaved(false);
  };

  const handleAddModel = (provId: string) => {
    if (!newModelName.trim()) return;
    setProviders(providers.map(p => {
      if (p.id === provId) {
        return { ...p, models: [...p.models, { id: `m_${Date.now()}`, name: newModelName }] };
      }
      return p;
    }));
    setNewModelName('');
    setAddingModelTo(null);
    setSaved(false);
  };

  const handleRemoveModel = (provId: string, modelId: string) => {
    setProviders(providers.map(p => {
      if (p.id === provId) {
        return { ...p, models: p.models.filter(m => m.id !== modelId) };
      }
      return p;
    }));
    setSaved(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Provider Routing & Keys</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage API keys and dynamically add providers and models.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => setShowAddProvider(true)} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-main)', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
            <Plus size={16} /> Add Custom Provider
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
            <Save size={16} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500 }}>Loading Providers...</span>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <>
          {showAddProvider && (
            <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '24px', borderRadius: '12px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>New Provider Name</label>
                <input 
                  type="text" 
                  value={newProvName}
                  onChange={(e) => setNewProvName(e.target.value)}
                  placeholder="e.g. HuggingFace, CustomAI"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1.5, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Base URL (Optional)</label>
                <input 
                  type="text" 
                  value={newProvBaseUrl}
                  onChange={(e) => setNewProvBaseUrl(e.target.value)}
                  placeholder="e.g. https://api.together.xyz/v1"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" onClick={handleAddProvider} style={{ padding: '10px 24px' }}>Create</button>
                <button className="btn-secondary" onClick={() => setShowAddProvider(false)} style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#ef4444', marginBottom: '32px' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
              <strong>Critical Warning:</strong> Changing these keys will affect all users on the platform who do not use BYOK.
            </div>
          </div>

          <div className={styles.providerGrid}>
            {providers.map(provider => (
              <div key={provider.id} className={styles.providerCard}>
                <div className={styles.providerHeader}>
                  <div className={styles.providerBrand}>{provider.name}</div>
                  <label className={styles.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={provider.status} 
                      onChange={() => toggleProvider(provider.id)} 
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Root API Key</label>
                  <input 
                    type="password" 
                    value={provider.key}
                    onChange={(e) => updateKey(provider.id, e.target.value)}
                    placeholder={`Enter ${provider.name} API Key`}
                    disabled={!provider.status}
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Base URL</label>
                  <input 
                    type="text" 
                    value={provider.baseUrl || ''}
                    onChange={(e) => updateBaseUrl(provider.id, e.target.value)}
                    placeholder="e.g. https://api.openai.com/v1"
                    disabled={!provider.status}
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px' }}
                  />
                </div>

                {/* Model Management */}
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 600 }}>Active Models</span>
                    <button 
                      onClick={() => setAddingModelTo(provider.id)}
                      disabled={!provider.status}
                      style={{ background: 'none', border: 'none', color: provider.status ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '12px', fontWeight: 600, cursor: provider.status ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={14} /> Add Model
                    </button>
                  </div>

                  {addingModelTo === provider.id && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input 
                        type="text"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="e.g. gpt-4"
                        autoFocus
                        style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                      />
                      <button onClick={() => handleAddModel(provider.id)} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {provider.models.map(model => (
                      <div key={model.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {model.name}
                        <button onClick={() => handleRemoveModel(provider.id, model.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {provider.models.length === 0 && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No models added.</span>}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
