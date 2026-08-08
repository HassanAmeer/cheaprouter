'use client';
import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Save, AlertTriangle, Plus, X, ChevronDown, ChevronRight, Globe, Layers, RefreshCw, Play, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import OpenRouterSetup from './OpenRouterSetup';

type Model = { id: string; name: string; originalId?: string; reasoning?: boolean; image?: boolean; tokenLimit?: string; access?: string };
type Header = { id: string; key: string; value: string };
type Provider = { id: string; name: string; status: boolean; key: string; priority: number; models: Model[]; baseUrl?: string; useModelsApi?: boolean; modelsApiLink?: string; headers?: Header[]; isCustom?: boolean; apiFormat?: string };

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showGlobalModels, setShowGlobalModels] = useState(true);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [activeTab, setActiveTab] = useState<'models' | 'providers'>('models');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleTestModel = async (providerId: string, model: Model) => {
    const key = `${providerId}-${model.id}`;
    setTestingModelId(key);
    try {
      const res = await fetch('/api/admin/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          providerId,
          originalId: model.originalId || model.id
        })
      });
      const data = await res.json();
      if (data.ok) {
        setTestResults(prev => ({
          ...prev,
          [key]: { success: true, message: data.message || '200 OK - Active' }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [key]: { success: false, message: data.message || `HTTP ${data.status}` }
        }));
      }
    } catch (e: any) {
      setTestResults(prev => ({
        ...prev,
        [key]: { success: false, message: e?.message || 'Connection Error' }
      }));
    } finally {
      setTestingModelId(null);
    }
  };

  const handleModelUpdateInGlobalSummary = (providerId: string, modelIndex: number, field: string, value: any) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        const nextModels = [...(p.models || [])];
        nextModels[modelIndex] = { ...nextModels[modelIndex], [field]: value };
        return { ...p, models: nextModels };
      }
      return p;
    }));
  };
  
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

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('adminToken') || '') : '';
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      let list: Provider[] = [];
      const headers: Record<string, string> = getAuthHeaders();
      const res = await fetch('/api/admin/providers', { headers });
      if (res.ok) {
        const data = await res.json();
        const rawArray = Array.isArray(data) ? data : (data && Array.isArray(data.providers) ? data.providers : []);
        list = rawArray.map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status ?? true,
          key: p.key || '',
          priority: p.priority ?? 0,
          baseUrl: p.base_url ?? p.baseUrl,
          useModelsApi: p.use_models_api ?? p.useModelsApi ?? false,
          modelsApiLink: p.models_api_link ?? p.modelsApiLink ?? '',
          apiFormat: p.api_format ?? p.apiFormat,
          isCustom: p.is_custom ?? p.isCustom ?? false,
          headers: p.headers || [],
          models: Array.isArray(p.models)
            ? p.models.map((m: any) =>
                typeof m === 'string'
                  ? { id: m, name: m, originalId: m, reasoning: false, image: false, tokenLimit: 'Unlimited', access: 'Free' }
                  : {
                      id: m.id || m.originalId || '',
                      name: m.name || m.originalName || m.id || '',
                      originalId: m.originalId || m.id || '',
                      reasoning: m.reasoning ?? m.text ?? false,
                      image: m.image || m.vision || false,
                      tokenLimit: m.tokenLimit || 'Unlimited',
                      access: m.access || 'Free'
                    }
              )
            : []
        }));
      }

      // Also check OpenRouter config
      const openRouterRes = await fetch('/api/admin/openrouter', { headers });
      if (openRouterRes.ok) {
        const openRouterData = await openRouterRes.json();
        if (openRouterData && Array.isArray(openRouterData.models)) {
          const openRouterModels = openRouterData.models.map((m: any) =>
            typeof m === 'string'
              ? { id: m, name: m, originalId: m, reasoning: true, image: false, tokenLimit: 'Unlimited', access: 'Free' }
              : {
                  id: m.id || m.originalId || '',
                  name: m.name || m.originalName || m.id || '',
                  originalId: m.originalId || m.id || '',
                  reasoning: m.text ?? m.reasoning ?? true,
                  image: m.image || m.vision || false,
                  tokenLimit: m.tokenLimit || 'Unlimited',
                  access: m.access || 'Free'
                }
          );

          const idx = list.findIndex(p => p.id === 'ap_openrouter' || p.id === 'openrouter');
          if (idx >= 0) {
            list[idx].models = openRouterModels;
            if (openRouterData.key) list[idx].key = openRouterData.key;
            if (openRouterData.status !== undefined) list[idx].status = openRouterData.status;
          } else {
            list.push({
              id: 'ap_openrouter',
              name: 'OpenRouter',
              status: openRouterData.status ?? true,
              key: openRouterData.key || '',
              priority: 10,
              models: openRouterModels,
              isCustom: true
            });
          }
        }
      }

      setProviders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
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
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      const res = await fetch('/api/admin/providers', {
        method: 'PUT',
        headers,
        body: JSON.stringify(providers)
      });

      const openRouterProv = providers.find(p => p.id === 'ap_openrouter' || p.id === 'openrouter');
      if (openRouterProv) {
        await fetch('/api/admin/openrouter', {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            key: openRouterProv.key,
            status: openRouterProv.status,
            models: openRouterProv.models
          })
        });
      }

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
  const allModelsList = providers.flatMap(p => (p.models || []).map((m, mIdx) => ({ providerId: p.id, providerName: p.name, mIdx, ...m })));
  const totalPages = Math.ceil(allModelsList.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [allModelsList.length, totalPages, currentPage]);

  const currentPageModels = allModelsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const groupedCurrentPageModels: Record<string, { providerName: string; models: any[] }> = {};
  currentPageModels.forEach(m => {
    if (!groupedCurrentPageModels[m.providerId]) {
      groupedCurrentPageModels[m.providerId] = { providerName: m.providerName, models: [] };
    }
    groupedCurrentPageModels[m.providerId].models.push(m);
  });

  return (
    <div>
      {/* Top Header & Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Provider Routing & Keys</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Manage API keys and dynamically route models.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            <button 
              onClick={() => setActiveTab('models')}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '6px', 
                border: 'none',
                background: activeTab === 'models' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'models' ? '#ffffff' : 'var(--color-text-muted)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Layers size={15} /> Selected Models ({allModelsList.length})
            </button>
            <button 
              onClick={() => setActiveTab('providers')}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '6px', 
                border: 'none',
                background: activeTab === 'providers' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'providers' ? '#ffffff' : 'var(--color-text-muted)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Plus size={15} /> Add & Manage Providers
            </button>
          </div>

          <button className="btn-primary" onClick={handleSave} disabled={saving || loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '8px' }}>
            <Save size={16} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500 }}>Loading Providers...</span>
          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
        </div>
      ) : (
        <>
          {/* TAB 1: Selected Models */}
          {activeTab === 'models' && (
            <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
              <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-soft)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                  <Layers size={18} /> Cheap: All Selected Models <span style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '13px' }}>({allModelsList.length})</span>
                </div>
                <button 
                  onClick={() => fetchProviders()}
                  title="Reload Models" 
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}
                >
                  <RefreshCw size={14} className={loading ? styles.spin : ''} /> Reload
                </button>
              </div>

              {allModelsList.length === 0 ? (
                <div style={{ padding: '40px 20px', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  No models selected yet. Click on <strong>"Add & Manage Providers"</strong> tab to select or configure models.
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-bg-soft)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <th style={{ padding: '10px 16px', fontWeight: 600, width: '20%' }}>Original Model ID</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, width: '18%' }}>Showing Name</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, width: '18%' }}>Showing ID</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, width: '13%' }}>Token Limit</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, width: '13%' }}>Access Level</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, width: '10%' }}>Capabilities</th>
                          <th style={{ padding: '10px 16px', fontWeight: 600, width: '8%', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(groupedCurrentPageModels).map(([pId, group]) => (
                          <React.Fragment key={pId}>
                            {/* Provider Section Row */}
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <td colSpan={7} style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-soft)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ 
                                    color: 'var(--color-primary, #ef4444)', 
                                    fontSize: '11px', 
                                    fontWeight: 700, 
                                    letterSpacing: '0.6px', 
                                    textTransform: 'uppercase'
                                  }}>
                                    {group.providerName}
                                  </span>
                                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', opacity: 0.7, fontWeight: 500 }}>
                                    ({group.models.length} {group.models.length === 1 ? 'model' : 'models'})
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {/* Model Rows */}
                            {group.models.map((m) => (
                              <tr key={`${pId}-${m.mIdx}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '6px 16px' }}>
                                  <code style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-main)', opacity: 0.9, background: 'rgba(255,255,255,0.04)', padding: '3px 7px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                    {m.originalId || m.id}
                                  </code>
                                </td>
                                <td style={{ padding: '4px 12px' }}>
                                  <input 
                                    type="text"
                                    value={m.name}
                                    onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, 'name', e.target.value)}
                                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text-main)', outline: 'none', width: '100%' }}
                                  />
                                </td>
                                <td style={{ padding: '4px 12px' }}>
                                  <input 
                                    type="text"
                                    value={m.id}
                                    onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, 'id', e.target.value)}
                                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text-main)', outline: 'none', width: '100%' }}
                                  />
                                </td>
                                <td style={{ padding: '4px 12px' }}>
                                  <input 
                                    type="text"
                                    value={m.tokenLimit || 'Unlimited'}
                                    onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, 'tokenLimit', e.target.value)}
                                    placeholder="e.g. 1M or Unlimited"
                                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text-main)', outline: 'none', width: '100%' }}
                                  />
                                </td>
                                <td style={{ padding: '4px 12px' }}>
                                  <select 
                                    value={m.access || 'Free'}
                                    onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, 'access', e.target.value)}
                                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '5px 8px', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text-main)', outline: 'none', width: '100%', cursor: 'pointer' }}
                                  >
                                    <option value="Free">Free</option>
                                    <option value="Pro">Pro / Premium</option>
                                    <option value="Enterprise">Enterprise</option>
                                    <option value="Unlimited">Unlimited</option>
                                  </select>
                                </td>
                                <td style={{ padding: '4px 12px' }}>
                                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                                      <input 
                                        type="checkbox" 
                                        checked={!!m.reasoning}
                                        onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, 'reasoning', e.target.checked)}
                                        style={{ cursor: 'pointer' }}
                                      />
                                      Reasoning
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                                      <input 
                                        type="checkbox" 
                                        checked={!!m.image}
                                        onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, 'image', e.target.checked)}
                                        style={{ cursor: 'pointer' }}
                                      />
                                      Vision/Image
                                    </label>
                                  </div>
                                </td>
                                <td style={{ padding: '4px 16px', textAlign: 'right' }}>
                                  {testResults[`${pId}-${m.id}`] ? (
                                    <span style={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: '4px', 
                                      fontSize: '11px', 
                                      fontWeight: 600,
                                      color: testResults[`${pId}-${m.id}`].success ? '#10b981' : '#ef4444', 
                                      background: testResults[`${pId}-${m.id}`].success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', 
                                      border: testResults[`${pId}-${m.id}`].success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                                      padding: '3px 8px', 
                                      borderRadius: '6px' 
                                    }}>
                                      {testResults[`${pId}-${m.id}`].success ? <CheckCircle2 size={12} /> : <XCircle size={12} />} 
                                      {testResults[`${pId}-${m.id}`].message}
                                    </span>
                                  ) : (
                                    <button 
                                      onClick={() => handleTestModel(pId, m)}
                                      disabled={testingModelId === `${pId}-${m.id}`}
                                      style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '5px', 
                                        background: 'var(--color-bg-soft)', 
                                        border: '1px solid var(--color-border)', 
                                        color: 'var(--color-text-main)', 
                                        padding: '4px 12px', 
                                        borderRadius: '6px', 
                                        fontSize: '11px', 
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Play size={10} fill="currentColor" /> {testingModelId === `${pId}-${m.id}` ? 'Testing...' : 'Test'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-soft)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Showing {allModelsList.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, allModelsList.length)} of {allModelsList.length} models
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                        style={{ padding: '5px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-main)', fontSize: '12px', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
                      >
                        Previous
                      </button>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-main)', fontWeight: 600, padding: '0 4px' }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage >= totalPages}
                        style={{ padding: '5px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-main)', fontSize: '12px', fontWeight: 600, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.4 : 1 }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: Add & Manage Providers */}
          {activeTab === 'providers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)' }}>Provider Setup & Configuration</h3>
                <button className="btn-secondary" onClick={() => setShowAddProvider(!showAddProvider)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                  <Plus size={16} /> {showAddProvider ? 'Hide Add Form' : 'Add Custom Provider'}
                </button>
              </div>

              {showAddProvider && (
                <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '24px', borderRadius: '12px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider ID</label>
                      <input 
                        type="text" 
                        value={newProvId}
                        onChange={(e) => setNewProvId(e.target.value)}
                        placeholder="e.g. custom_openai"
                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider Name</label>
                      <input 
                        type="text" 
                        value={newProvName}
                        onChange={(e) => setNewProvName(e.target.value)}
                        placeholder="e.g. My Custom Provider"
                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 2, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Base URL</label>
                      <input 
                        type="text" 
                        value={newProvBaseUrl}
                        onChange={(e) => setNewProvBaseUrl(e.target.value)}
                        placeholder="e.g. https://api.openai.com/v1"
                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Format</label>
                      <select 
                        value={newProvApiFormat}
                        onChange={(e) => setNewProvApiFormat(e.target.value)}
                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                      >
                        <option value="OpenAI Compatible">OpenAI Compatible</option>
                        <option value="Anthropic">Anthropic</option>
                        <option value="Google">Google</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Root API Key</label>
                      <input 
                        type="password" 
                        value={newProvKey}
                        onChange={(e) => setNewProvKey(e.target.value)}
                        placeholder="sk-..."
                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Custom Headers</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {newProvHeaders.map((header, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            value={header.key}
                            onChange={(e) => { const next = [...newProvHeaders]; next[idx].key = e.target.value; setNewProvHeaders(next); }}
                            placeholder="Header Key (e.g. HTTP-Referer)"
                            style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-text-main)', outline: 'none' }}
                          />
                          <input 
                            type="text" 
                            value={header.value}
                            onChange={(e) => { const next = [...newProvHeaders]; next[idx].value = e.target.value; setNewProvHeaders(next); }}
                            placeholder="Header Value"
                            style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-text-main)', outline: 'none' }}
                          />
                          <button onClick={() => setNewProvHeaders(newProvHeaders.filter((_, i) => i !== idx))} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0 12px', borderRadius: '6px', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                      ))}
                      <button 
                        className="btn-secondary"
                        onClick={() => setNewProvHeaders([...newProvHeaders, { id: Date.now().toString(), key: '', value: '' }])}
                        style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '12px' }}
                      >
                        + Add Header
                      </button>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Configure Models</h4>
                      <button 
                        onClick={() => setNewProvModels([...newProvModels, { id: '', name: '', originalId: '', reasoning: false, image: false }])}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Add Model
                      </button>
                    </div>
                    {newProvModels.map((model, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'var(--color-bg-soft)', borderRadius: '8px', border: '1px solid var(--color-border)', position: 'relative', marginBottom: '8px' }}>
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

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="btn-primary" onClick={handleAddProvider} style={{ padding: '10px 24px' }}>Create Provider</button>
                    <button className="btn-secondary" onClick={() => setShowAddProvider(false)} style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-main)' }}>Custom Providers</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {providers.filter(p => !p.isCustom).map(provider => renderProviderTile(provider, false))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
                <div style={{ width: '50%', height: '1px', background: 'var(--color-border)', opacity: 0.6 }} />
              </div>

              {providers.filter(p => p.isCustom).length > 0 && (
                <>
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-main)' }}>Other Added Providers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {providers.filter(p => p.isCustom).map(provider => renderProviderTile(provider, true))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
                    <div style={{ width: '50%', height: '1px', background: 'var(--color-border)', opacity: 0.6 }} />
                  </div>
                </>
              )}

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-main)' }}>Prefix Providers</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  <OpenRouterSetup onModelsUpdated={fetchProviders} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
