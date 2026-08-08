'use client';
import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Save, AlertTriangle, Plus, X, ChevronDown, ChevronRight, Globe, Layers } from 'lucide-react';
import Link from 'next/link';

type Model = { id: string; name: string; originalId?: string; reasoning?: boolean; image?: boolean };
type Header = { id: string; key: string; value: string };
type Provider = { id: string; name: string; status: boolean; key: string; priority: number; models: Model[]; baseUrl?: string; useModelsApi?: boolean; modelsApiLink?: string; headers?: Header[]; isCustom?: boolean; apiFormat?: string };

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showGlobalModels, setShowGlobalModels] = useState(false);
  
  // State for Add Provider Modal
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvId, setNewProvId] = useState('');
  const [newProvName, setNewProvName] = useState('');
  const [newProvBaseUrl, setNewProvBaseUrl] = useState('');
  const [newProvApiFormat, setNewProvApiFormat] = useState('OpenAI Compatible');
  const [newProvUseModelsApi, setNewProvUseModelsApi] = useState(false);
  const [newProvModelsApiLink, setNewProvModelsApiLink] = useState('');
  const [newProvModels, setNewProvModels] = useState<Model[]>([]);
  const [newProvKey, setNewProvKey] = useState('');
  const [newProvHeaders, setNewProvHeaders] = useState<Header[]>([]);

  // State for Add Model
  const [addingModelTo, setAddingModelTo] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState('');
  const [newModelOriginalId, setNewModelOriginalId] = useState('');
  const [newModelShowingId, setNewModelShowingId] = useState('');
  const [newModelReasoning, setNewModelReasoning] = useState(false);
  const [newModelImage, setNewModelImage] = useState(false);

  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    const next = new Set(expandedProviders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedProviders(next);
  };

  useEffect(() => {
    fetch('/api/admin/providers')
      .then(res => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          return res.json().catch(() => null);
        }
        return null;
      })
      .then(data => {
        if (data && data.providers) setProviders(data.providers);
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

  const updateApiFormat = (id: string, newFormat: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, apiFormat: newFormat } : p));
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

    let initialModels: Model[] = [];
    if (!newProvUseModelsApi) {
      initialModels = newProvModels.filter(m => m.name.trim() && m.id.trim()).map(m => ({
        ...m,
        id: m.id.trim(),
        name: m.name.trim(),
        originalId: m.originalId?.trim() || m.id.trim()
      }));
    }

    const providerId = newProvId.trim() ? newProvId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '') : `prov_${Date.now()}`;

    setProviders([...providers, {
      id: providerId,
      name: newProvName,
      status: false,
      key: newProvKey.trim(),
      priority: providers.length + 1,
      models: initialModels,
      baseUrl: newProvBaseUrl.trim() || undefined,
      apiFormat: newProvApiFormat,
      useModelsApi: newProvUseModelsApi,
      modelsApiLink: newProvModelsApiLink.trim() || undefined,
      headers: newProvHeaders,
      isCustom: true
    }]);
    setNewProvId('');
    setNewProvName('');
    setNewProvBaseUrl('');
    setNewProvApiFormat('OpenAI Compatible');
    setNewProvKey('');
    setNewProvHeaders([]);
    setNewProvUseModelsApi(false);
    setNewProvModelsApiLink('');
    setNewProvModels([]);
    setShowAddProvider(false);
    setSaved(false);
  };

  const handleAddModel = (provId: string) => {
    if (!newModelName.trim() || !newModelOriginalId.trim() || !newModelShowingId.trim()) return;
    setProviders(providers.map(p => {
      if (p.id === provId) {
        return { ...p, models: [...p.models, { id: newModelShowingId, name: newModelName, originalId: newModelOriginalId, reasoning: newModelReasoning, image: newModelImage }] };
      }
      return p;
    }));
    setNewModelName('');
    setNewModelOriginalId('');
    setNewModelShowingId('');
    setNewModelReasoning(false);
    setNewModelImage(false);
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

  const handleAddHeader = (provId: string) => {
    setProviders(providers.map(p => {
      if (p.id === provId) {
        return { ...p, headers: [...(p.headers || []), { id: `h_${Date.now()}`, key: '', value: '' }] };
      }
      return p;
    }));
    setSaved(false);
  };

  const handleUpdateHeader = (provId: string, headerId: string, field: 'key' | 'value', val: string) => {
    setProviders(providers.map(p => {
      if (p.id === provId) {
        return { ...p, headers: (p.headers || []).map(h => h.id === headerId ? { ...h, [field]: val } : h) };
      }
      return p;
    }));
    setSaved(false);
  };

  const handleRemoveHeader = (provId: string, headerId: string) => {
    setProviders(providers.map(p => {
      if (p.id === provId) {
        return { ...p, headers: (p.headers || []).filter(h => h.id !== headerId) };
      }
      return p;
    }));
    setSaved(false);
  };


  const renderProviderTile = (provider: Provider, isCustomGroup: boolean) => (
    <div key={provider.id} style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <div 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', cursor: 'pointer', background: expandedProviders.has(provider.id) ? 'var(--color-bg-soft)' : 'transparent' }}
        onClick={() => toggleExpanded(provider.id)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{provider.name}</span>
          {isCustomGroup && <span style={{ fontSize: '11px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Custom</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={e => e.stopPropagation()}>
          <label className={styles.toggleSwitch}>
            <input 
              type="checkbox" 
              checked={provider.status} 
              onChange={() => toggleProvider(provider.id)} 
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
      </div>
      
      {expandedProviders.has(provider.id) && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Root API Key</label>
            <input 
              type="password" 
              value={provider.key}
              onChange={(e) => updateKey(provider.id, e.target.value)}
              placeholder={`Enter ${provider.name} API Key`}
              disabled={!provider.status}
              autoComplete="new-password"
              style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontFamily: 'monospace', fontSize: '13px' }}
            />
          </div>

          {isCustomGroup && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider API Format</label>
                <select 
                  value={provider.apiFormat || 'OpenAI Compatible'}
                  onChange={(e) => updateApiFormat(provider.id, e.target.value)}
                  disabled={!provider.status}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px', appearance: 'auto' }}
                >
                  <option value="OpenAI Compatible">OpenAI Compatible</option>
                  <option value="OpenAI Responses">OpenAI Responses</option>
                  <option value="Anthropic Messages">Anthropic Messages</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Base URL</label>
                <input 
                  type="text" 
                  value={provider.baseUrl || ''}
                  onChange={(e) => updateBaseUrl(provider.id, e.target.value)}
                  placeholder="e.g. https://api.openai.com/v1"
                  disabled={!provider.status}
                  autoComplete="off"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px' }}
                />
              </div>

              {/* Headers Management */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Headers (Optional)</label>
                  <button 
                    onClick={() => handleAddHeader(provider.id)}
                    disabled={!provider.status}
                    style={{ background: 'none', border: 'none', color: provider.status ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '12px', fontWeight: 600, cursor: provider.status ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> Add Header
                  </button>
                </div>
                {provider.headers?.map(header => (
                  <div key={header.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="text"
                      value={header.key}
                      onChange={(e) => handleUpdateHeader(provider.id, header.id, 'key', e.target.value)}
                      placeholder="Header Name (e.g. Authorization)"
                      disabled={!provider.status}
                      style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '12px' }}
                    />
                    <input 
                      type="text"
                      value={header.value}
                      onChange={(e) => handleUpdateHeader(provider.id, header.id, 'value', e.target.value)}
                      placeholder="Value (e.g. Bearer sk-...)"
                      disabled={!provider.status}
                      style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '12px' }}
                    />
                    <button onClick={() => handleRemoveHeader(provider.id, header.id)} disabled={!provider.status} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: provider.status ? 'pointer' : 'not-allowed', display: 'flex', padding: '4px' }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Model Management */}
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 600 }}>Models Configuration</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Use API Link</span>
                <label className={styles.toggleSwitch}>
                  <input 
                    type="checkbox" 
                    checked={provider.useModelsApi || false} 
                    onChange={() => {
                      setProviders(providers.map(p => p.id === provider.id ? { ...p, useModelsApi: !(p.useModelsApi || false) } : p));
                      setSaved(false);
                    }} 
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
            </div>

            {provider.useModelsApi ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Models List API Link</label>
                <input 
                  type="text" 
                  value={provider.modelsApiLink || ''}
                  onChange={(e) => {
                    setProviders(providers.map(p => p.id === provider.id ? { ...p, modelsApiLink: e.target.value } : p));
                    setSaved(false);
                  }}
                  placeholder="e.g. https://api.openai.com/v1/models"
                  disabled={!provider.status}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px' }}
                />
              </div>
            ) : (
              <>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', padding: '12px', background: 'var(--color-bg-soft)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Original Model ID</label>
                        <input 
                          type="text"
                          value={newModelOriginalId}
                          onChange={(e) => setNewModelOriginalId(e.target.value)}
                          placeholder="e.g. gpt-4"
                          autoFocus
                          style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing Model Name</label>
                        <input 
                          type="text"
                          value={newModelName}
                          onChange={(e) => setNewModelName(e.target.value)}
                          placeholder="e.g. GPT-4"
                          style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing Model ID</label>
                      <input 
                        type="text"
                        value={newModelShowingId}
                        onChange={(e) => setNewModelShowingId(e.target.value)}
                        placeholder="e.g. cr-gpt-4"
                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>* Users calling our API will use this ID, but will see the "Showing Model Name" in the UI.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newModelReasoning} onChange={(e) => setNewModelReasoning(e.target.checked)} />
                        Reasoning
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newModelImage} onChange={(e) => setNewModelImage(e.target.checked)} />
                        Image
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button onClick={() => setAddingModelTo(null)} style={{ background: 'transparent', color: 'var(--color-text-muted)', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={() => handleAddModel(provider.id)} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Add Model</button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {provider.models.map(model => (
                    <div key={model.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', minWidth: '200px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)' }}>{model.name}</span>
                        <button onClick={() => handleRemoveModel(provider.id, model.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}>
                          <X size={14} />
                        </button>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span><strong>Original ID:</strong> {model.originalId || model.id}</span>
                        <span><strong>Showing ID:</strong> {model.id}</span>
                        {(model.reasoning || model.image) && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                            {model.reasoning && <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>Reasoning</span>}
                            {model.image && <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>Image</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {provider.models.length === 0 && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No models added.</span>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
            <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '24px', borderRadius: '12px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider ID</label>
                  <input 
                    type="text" 
                    value={newProvId}
                    onChange={(e) => setNewProvId(e.target.value)}
                    placeholder="e.g. myprovider"
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Display Name</label>
                  <input 
                    type="text" 
                    value={newProvName}
                    onChange={(e) => setNewProvName(e.target.value)}
                    placeholder="e.g. My AI Provider"
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
                    autoComplete="off"
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider API Format</label>
                  <select 
                    value={newProvApiFormat}
                    onChange={(e) => setNewProvApiFormat(e.target.value)}
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', appearance: 'auto' }}
                  >
                    <option value="OpenAI Compatible">OpenAI Compatible</option>
                    <option value="OpenAI Responses">OpenAI Responses</option>
                    <option value="Anthropic Messages">Anthropic Messages</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Key (Optional, leave empty if using headers)</label>
                  <input 
                    type="password" 
                    value={newProvKey}
                    onChange={(e) => setNewProvKey(e.target.value)}
                    placeholder="API Key"
                    autoComplete="new-password"
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Headers (Optional)</label>
                  <button 
                    onClick={() => setNewProvHeaders([...newProvHeaders, { id: `h_${Date.now()}`, key: '', value: '' }])}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> Add Header
                  </button>
                </div>
                {newProvHeaders.map(header => (
                  <div key={header.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="text"
                      value={header.key}
                      onChange={(e) => setNewProvHeaders(newProvHeaders.map(h => h.id === header.id ? { ...h, key: e.target.value } : h))}
                      placeholder="Header Name (e.g. Authorization)"
                      style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                    />
                    <input 
                      type="text"
                      value={header.value}
                      onChange={(e) => setNewProvHeaders(newProvHeaders.map(h => h.id === header.id ? { ...h, value: e.target.value } : h))}
                      placeholder="Value (e.g. Bearer sk-...)"
                      style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                    />
                    <button onClick={() => setNewProvHeaders(newProvHeaders.filter(h => h.id !== header.id))} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Use Models API Link</span>
                  <label className={styles.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={newProvUseModelsApi} 
                      onChange={() => setNewProvUseModelsApi(!newProvUseModelsApi)} 
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>

              {newProvUseModelsApi ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={newProvModelsApiLink}
                    onChange={(e) => setNewProvModelsApiLink(e.target.value)}
                    placeholder="Models List API Link (e.g. https://api.openai.com/v1/models)"
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Initial Models (Optional)</label>
                    <button 
                      onClick={() => setNewProvModels([...newProvModels, { id: '', name: '', originalId: '', reasoning: false, image: false }])}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={14} /> Add Model
                    </button>
                  </div>
                  {newProvModels.map((model, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'var(--color-bg-soft)', borderRadius: '8px', border: '1px solid var(--color-border)', position: 'relative' }}>
                      <button onClick={() => setNewProvModels(newProvModels.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingRight: '24px' }}>
                        <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Original Model ID</label>
                          <input 
                            type="text"
                            value={model.originalId || ''}
                            onChange={(e) => { const next = [...newProvModels]; next[idx].originalId = e.target.value; setNewProvModels(next); }}
                            placeholder="e.g. gpt-4"
                            style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing Model Name</label>
                          <input 
                            type="text"
                            value={model.name}
                            onChange={(e) => { const next = [...newProvModels]; next[idx].name = e.target.value; setNewProvModels(next); }}
                            placeholder="e.g. GPT-4"
                            style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing Model ID</label>
                        <input 
                          type="text"
                          value={model.id}
                          onChange={(e) => { const next = [...newProvModels]; next[idx].id = e.target.value; setNewProvModels(next); }}
                          placeholder="e.g. cr-gpt-4"
                          style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                        />
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>* Users calling our API will use this ID, but will see the "Showing Model Name" in the UI.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={model.reasoning} onChange={(e) => { const next = [...newProvModels]; next[idx].reasoning = e.target.checked; setNewProvModels(next); }} />
                          Reasoning
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={model.image} onChange={(e) => { const next = [...newProvModels]; next[idx].image = e.target.checked; setNewProvModels(next); }} />
                          Image
                        </label>
                      </div>
                    </div>
                  ))}
                  {newProvModels.length === 0 && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No initial models added.</span>}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
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

          <div style={{ marginBottom: '32px', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div 
              style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--color-bg-soft)' }}
              onClick={() => setShowGlobalModels(!showGlobalModels)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                <Layers size={18} /> All Selected Models Summary
              </div>
              {showGlobalModels ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
            {showGlobalModels && (
              <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {providers.flatMap(p => (p.models || []).map(m => ({ providerName: p.name, ...m }))).length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No models selected.</div>
                  ) : (
                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                          <th style={{ padding: '8px' }}>Provider</th>
                          <th style={{ padding: '8px' }}>Original Model ID</th>
                          <th style={{ padding: '8px' }}>Showing Name</th>
                          <th style={{ padding: '8px' }}>Showing ID</th>
                          <th style={{ padding: '8px' }}>Features</th>
                        </tr>
                      </thead>
                      <tbody>
                        {providers.flatMap(p => (p.models || []).map(m => ({ providerName: p.name, ...m }))).map((m, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '8px', fontWeight: 600 }}>{m.providerName}</td>
                            <td style={{ padding: '8px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{m.originalId || m.id}</td>
                            <td style={{ padding: '8px' }}>{m.name}</td>
                            <td style={{ padding: '8px' }}>{m.id}</td>
                            <td style={{ padding: '8px', display: 'flex', gap: '6px' }}>
                              {m.reasoning && <span style={{ background: 'var(--color-bg-soft)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>Reasoning</span>}
                              {m.image && <span style={{ background: 'var(--color-bg-soft)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>Vision</span>}
                              {!m.reasoning && !m.image && <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Text</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            {providers.filter(p => p.isCustom).length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-main)' }}>Custom Providers</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {providers.filter(p => p.isCustom).map(provider => renderProviderTile(provider, true))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-main)' }}>Fixed Providers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {providers.filter(p => !p.isCustom).map(provider => renderProviderTile(provider, false))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-main)' }}>Prefix Models</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Link href="/admin/openrouter" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '20px', borderRadius: '12px', width: '250px', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={20} color="var(--color-primary)" />
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 600 }}>OpenRouter</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>Configure and select models from OpenRouter.</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
</>
      )}
    </div>
  );
}
