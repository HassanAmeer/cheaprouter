'use client';
import React, { useState, useEffect } from 'react';
import { Globe, RefreshCcw, Search, X, Check } from 'lucide-react';
import styles from '../admin.module.css';

type SelectedModel = {
  originalId: string;
  originalName: string;
  name: string;
  id: string;
  text: boolean;
  image: boolean;
  vision: boolean;
};

export default function OpenRouterSetup({ onModelsUpdated }: { onModelsUpdated?: () => void }) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState(false);
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('adminToken') || '') : '';
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetch('/api/admin/openrouter', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.key) setApiKey(data.key);
        if (data.status !== undefined) setStatus(data.status);
        if (data.models && Array.isArray(data.models)) {
          const normalized = data.models.map((m: any) =>
            typeof m === 'string'
              ? { originalId: m, originalName: m, name: m, id: m, text: true, image: false, vision: false }
              : {
                  originalId: m.originalId || m.id || '',
                  originalName: m.originalName || m.name || m.id || '',
                  name: m.name || m.id || '',
                  id: m.id || m.originalId || '',
                  text: m.text ?? m.reasoning ?? true,
                  image: m.image ?? false,
                  vision: m.vision ?? m.image ?? false
                }
          );
          setSelectedModels(normalized);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleFetchModels = async () => {
    setFetchingModels(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models');
      const data = await res.json();
      if (data && data.data) {
        setAvailableModels(data.data);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to fetch OpenRouter models.');
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSave = async (modelsToSave = selectedModels, keyToSave = apiKey) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/openrouter', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ key: keyToSave, status: true, models: modelsToSave })
      });
      if (res.ok) {
        if (onModelsUpdated) onModelsUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleModelSelection = (model: any) => {
    const exists = selectedModels.find(m => m.originalId === model.id);
    let next: SelectedModel[];
    if (exists) {
      next = selectedModels.filter(m => m.originalId !== model.id);
    } else {
      next = [...selectedModels, {
        originalId: model.id,
        originalName: model.name || model.id,
        name: model.name || model.id,
        id: model.id.split('/').pop()?.replace(/[^a-zA-Z0-9_-]/g, '_') || model.id,
        text: true,
        image: false,
        vision: false
      }];
    }
    setSelectedModels(next);
    handleSave(next, apiKey);
  };

  const updateSelectedModel = (originalId: string, field: keyof SelectedModel, value: any) => {
    const next = selectedModels.map(m => m.originalId === originalId ? { ...m, [field]: value } : m);
    setSelectedModels(next);
    handleSave(next, apiKey);
  };

  const handleDrawerClose = () => {
    handleSave(selectedModels, apiKey);
    setIsDrawerOpen(false);
  };

  const filteredAvailableModels = availableModels.filter(m => 
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return null;

  return (
    <>
      <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '24px', borderRadius: '12px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={20} color="var(--color-primary)" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>OpenRouter</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Key</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
            />
            <button className="btn-primary" onClick={() => handleSave()} disabled={saving}>
              {saving ? 'Saving...' : 'Save Key'}
            </button>
          </div>
        </div>

        <button 
          className="btn-secondary" 
          onClick={() => setIsDrawerOpen(true)}
          style={{ padding: '10px 16px', width: '100%', justifyContent: 'center', marginTop: '8px' }}
        >
          Select Models ({selectedModels.length})
        </button>
      </div>

      {/* RIGHT SIDE DRAWER */}
      {isDrawerOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '460px', background: 'var(--color-card-bg)', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 15px rgba(0,0,0,0.1)' }}>
            
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-soft)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>OpenRouter Models</h2>
              <button onClick={handleDrawerClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* TOP HALF: Model Selection */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '5px 10px 5px 30px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                  />
                </div>
                <button className="btn-secondary" onClick={handleFetchModels} disabled={fetchingModels} style={{ padding: '5px 12px', fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', height: '30px' }}>
                  <RefreshCcw size={13} className={fetchingModels ? styles.spin : ''} /> 
                  {fetchingModels ? 'Loading...' : 'Load API'}
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredAvailableModels.map(model => {
                  const isSelected = selectedModels.some(m => m.originalId === model.id);
                  return (
                    <label key={model.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', background: isSelected ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-bg-soft)', border: '1px solid', borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: '6px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleModelSelection(model)}
                        style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.id}</span>
                      </div>
                    </label>
                  );
                })}
                {availableModels.length === 0 && !fetchingModels && (
                  <div style={{ textAlign: 'center', padding: '12px', color: 'var(--color-text-muted)', fontSize: '12px' }}>Click "Load API" to fetch available models.</div>
                )}
              </div>
            </div>

            {/* BOTTOM HALF: Selected Models Configuration */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-bg-soft)' }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Selected Models</span>
                <span style={{ background: 'var(--color-primary)', color: '#fff', padding: '1px 7px', borderRadius: '10px', fontSize: '11px' }}>{selectedModels.length}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedModels.map(model => (
                  <div key={model.originalId} style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Original:</span>
                      <strong style={{ color: 'var(--color-text-main)', fontFamily: 'monospace', fontSize: '11px' }}>{model.originalId}</strong>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Custom Name</label>
                        <input 
                          type="text" 
                          value={model.name}
                          onChange={(e) => updateSelectedModel(model.originalId, 'name', e.target.value)}
                          style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none' }}
                        />
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Custom ID</label>
                        <input 
                          type="text" 
                          value={model.id}
                          onChange={(e) => updateSelectedModel(model.originalId, 'id', e.target.value)}
                          style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={model.text} onChange={(e) => updateSelectedModel(model.originalId, 'text', e.target.checked)} />
                        Text
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={model.image} onChange={(e) => updateSelectedModel(model.originalId, 'image', e.target.checked)} />
                        Image
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={model.vision} onChange={(e) => updateSelectedModel(model.originalId, 'vision', e.target.checked)} />
                        Vision
                      </label>
                    </div>

                  </div>
                ))}
                {selectedModels.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '12px', color: 'var(--color-text-muted)', fontSize: '12px' }}>No models selected yet.</div>
                )}
              </div>
              <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-card-bg)' }}>
                <button className="btn-primary" onClick={handleDrawerClose} style={{ width: '100%', justifyContent: 'center', padding: '7px 14px', fontSize: '12px' }}>
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
