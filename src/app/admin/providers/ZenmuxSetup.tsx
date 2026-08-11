'use client';
import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Globe, RefreshCcw, Search, X, Check, Code, Play, Save, Eye, EyeOff, Plus, Pause } from 'lucide-react';
import styles from '../admin.module.css';

type SelectedModel = {
  originalId: string;
  originalName: string;
  name: string;
  id: string;
  text: boolean;
  image: boolean;
  vision: boolean;
  audio: boolean;
  reasoning: boolean;
  video: boolean;
};

export interface ZenmuxSetupRef {
  testApi: (silent?: boolean) => Promise<boolean>;
}

const ZenmuxSetup = forwardRef<ZenmuxSetupRef, { onModelsUpdated?: () => void, index?: number }>(({ onModelsUpdated, index }, ref) => {
  const [apiKeys, setApiKeys] = useState<{key: string, active: boolean}[]>([{key: '', active: true}]);
  const [status, setStatus] = useState(false);
  const [showKeys, setShowKeys] = useState<boolean[]>([]);
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [testing, setTesting] = useState<boolean[]>([]);
  const [testSuccesses, setTestSuccesses] = useState<(boolean | null)[]>([]);
  const [showKeyErrors, setShowKeyErrors] = useState<boolean[]>([]);
  const apiKeyRefs = useRef<(HTMLInputElement | null)[]>([]);

  const testAllApiKeys = async (silent = false) => {
    let allPassed = true;
    for (let i = 0; i < apiKeys.length; i++) {
      const passed = await handleTestApi(i, silent);
      if (!passed) allPassed = false;
    }
    return allPassed;
  };

  useImperativeHandle(ref, () => ({
    testApi: testAllApiKeys
  }));

  const handleTestApi = async (index: number, silent = false) => {
    const keyObj = apiKeys[index];
    if (!keyObj || !keyObj.key) {
      if (!silent) {
        setShowKeyErrors(prev => { const n = [...prev]; n[index] = true; return n; });
        apiKeyRefs.current[index]?.focus();
      }
      setTestSuccesses(prev => { const n = [...prev]; n[index] = false; return n; });
      return false;
    }
    setShowKeyErrors(prev => { const n = [...prev]; n[index] = false; return n; });
    setTesting(prev => { const n = [...prev]; n[index] = true; return n; });
    setTestSuccesses(prev => { const n = [...prev]; n[index] = null; return n; });
    try {
      const res = await fetch(`/api/admin/zenmux/models?key=${encodeURIComponent(keyObj.key)}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data && data.data) {
        setTestSuccesses(prev => { const n = [...prev]; n[index] = true; return n; });
        return true;
      } else {
        setTestSuccesses(prev => { const n = [...prev]; n[index] = false; return n; });
        return false;
      }
    } catch (e) {
      setTestSuccesses(prev => { const n = [...prev]; n[index] = false; return n; });
      return false;
    } finally {
      setTesting(prev => { const n = [...prev]; n[index] = false; return n; });
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('adminToken') || '') : '';
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetch('/api/admin/zenmux', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.key) {
          try {
            const parsed = JSON.parse(data.key);
            if (Array.isArray(parsed)) {
              const mapped = parsed.map(k => typeof k === 'string' ? { key: k, active: true } : { key: k.key || '', active: k.active ?? true });
              setApiKeys(mapped.length > 0 ? mapped : [{key: '', active: true}]);
            } else {
              setApiKeys([{key: data.key, active: true}]);
            }
          } catch {
            setApiKeys([{key: data.key, active: true}]);
          }
        }
        if (data.status !== undefined) setStatus(data.status);
        if (data.models && Array.isArray(data.models)) {
          const normalized = data.models.map((m: any) =>
            typeof m === 'string'
              ? { originalId: m, originalName: m, name: m, id: m, text: true, image: false, vision: false, audio: false, reasoning: false, video: false }
              : {
                  originalId: m.originalId || m.id || '',
                  originalName: m.originalName || m.name || m.id || '',
                  name: m.name || m.id || '',
                  id: m.id || m.originalId || '',
                  text: m.text ?? m.reasoning ?? true,
                  image: m.image ?? false,
                  vision: m.vision ?? m.image ?? false,
                  audio: m.audio ?? false,
                  reasoning: m.reasoning ?? false,
                  video: m.video ?? false
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
      const validKey = apiKeys.find(k => k.active && k.key.trim() !== '')?.key || '';
      const res = await fetch(`/api/admin/zenmux/models?key=${encodeURIComponent(validKey)}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      const rawModels = Array.isArray(data.data) ? data.data : data;
      if (Array.isArray(rawModels)) {
        const sorted = rawModels.sort((a: any, b: any) => {
          const aMod = a.architecture?.modality || '';
          const bMod = b.architecture?.modality || '';
          const aIsText = aMod === 'text->text' || (!aMod.includes('image') && !aMod.includes('video') && !aMod.includes('audio'));
          const bIsText = bMod === 'text->text' || (!bMod.includes('image') && !bMod.includes('video') && !bMod.includes('audio'));
          if (aIsText && !bIsText) return -1;
          if (!aIsText && bIsText) return 1;
          return 0;
        });
        setAvailableModels(sorted);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to fetch Zenmux models.');
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSave = async (modelsToSave = selectedModels, keysToSave = apiKeys, shouldNotify = false, overrideStatus: boolean | null = null) => {
    setSaving(true);
    try {
      const validKeys = keysToSave.filter(k => k.key.trim() !== '');
      const keyString = JSON.stringify(validKeys.length > 0 ? validKeys : [{key: '', active: true}]);
      const res = await fetch('/api/admin/zenmux', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ key: keyString, status: overrideStatus !== null ? overrideStatus : status, models: modelsToSave })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        if (shouldNotify && onModelsUpdated) onModelsUpdated();
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
        vision: false,
        audio: false,
        reasoning: false,
        video: false
      }];
    }
    setSelectedModels(next);
    handleSave(next, apiKeys, false);
  };

  const updateSelectedModel = (originalId: string, field: keyof SelectedModel, value: any) => {
    const next = selectedModels.map(m => m.originalId === originalId ? { ...m, [field]: value } : m);
    setSelectedModels(next);
    handleSave(next, apiKeys, false);
  };

  const handleDrawerClose = () => {
    handleSave(selectedModels, apiKeys, true);
    setIsDrawerOpen(false);
  };

  const filteredAvailableModels = availableModels.filter(m => 
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return null;

  return (
    <>
      <div style={{ background: 'var(--color-card-bg)', border: `1px solid ${testSuccesses.includes(false) ? '#ef4444' : testSuccesses.includes(true) ? '#10b981' : 'var(--color-border)'}`, padding: '24px', borderRadius: '12px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'border-color 0.3s' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {index !== undefined && (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600, background: 'var(--color-bg-soft)', padding: '4px 8px', borderRadius: '6px' }}>
                #{index}
              </span>
            )}
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="https://www.google.com/s2/favicons?domain=zenmux.ai&sz=128" alt="Zenmux" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Zenmux</span>
          </div>
                    <div 
            onClick={() => {
              const newStatus = !status;
              setStatus(newStatus);
              handleSave(selectedModels, apiKeys, true, newStatus);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              background: status ? '#10b98115' : 'var(--color-bg-soft)',
              padding: '4px 10px',
              borderRadius: '20px',
              border: `1px solid ${status ? '#10b98144' : 'var(--color-border)'}`
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: status ? '#10b981' : 'var(--color-text-muted)' }}>
              {status ? 'ON' : 'OFF'}
            </span>
            <div style={{
              width: '28px',
              height: '16px',
              background: status ? '#10b981' : 'var(--color-text-muted)',
              borderRadius: '16px',
              position: 'relative',
              transition: 'background 0.3s'
            }}>
              <div style={{
                position: 'absolute',
                top: '2px',
                left: status ? '14px' : '2px',
                width: '12px',
                height: '12px',
                background: 'white',
                borderRadius: '50%',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>
        </div>

        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {apiKeys.map((keyObj, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: keyObj.active ? 1 : 0.6 }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                API Key {index + 1} {keyObj.active ? '' : '(Paused)'}
                {showKeyErrors[index] && <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 500 }}>*Required</span>}
              </div>
                {index === 0 && (
                  <a href="https://zenmux.ai/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: '11px', color: 'var(--color-primary)', textDecoration: 'none', background: 'var(--color-bg-soft)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: 500 }}>
                    Get API Key ↗
                  </a>
                )}
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    ref={el => { apiKeyRefs.current[index] = el; }}
                    type={showKeys[index] ? "text" : "password"} 
                    value={keyObj.key}
                    onChange={(e) => { 
                      const n = [...apiKeys]; n[index] = { ...n[index], key: e.target.value }; setApiKeys(n); 
                      if (showKeyErrors[index]) {
                        const ne = [...showKeyErrors]; ne[index] = false; setShowKeyErrors(ne);
                      }
                    }}
                    placeholder="sk-or-v1-..."
                    disabled={!keyObj.active}
                    style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 40px 10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                  />
                  <button 
                    className="btn-secondary"
                    onClick={() => { const n = [...showKeys]; n[index] = !n[index]; setShowKeys(n); }} 
                    style={{ position: 'absolute', right: '4px', background: 'transparent', border: 'none', padding: '6px', color: 'var(--color-text-muted)' }}
                    title={showKeys[index] ? "Hide Key" : "Show Key"}
                  >
                    {showKeys[index] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                <button className="btn-secondary" onClick={() => {
                  const n = [...apiKeys]; n[index] = { ...n[index], active: !n[index].active }; setApiKeys(n);
                }} style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', height: '40px', color: keyObj.active ? '#eab308' : '#10b981' }} title={keyObj.active ? "Pause Key" : "Resume Key"}>
                  {keyObj.active ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <button className="btn-secondary" onClick={() => handleTestApi(index, false)} disabled={testing[index] || !keyObj.active} style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '6px', height: '40px', color: testSuccesses[index] === true ? '#10b981' : testSuccesses[index] === false ? '#ef4444' : 'inherit' }} title="Test Provider">
                  {testing[index] ? <RefreshCcw size={16} className={styles.spin} /> : testSuccesses[index] === true ? <Check size={16} /> : testSuccesses[index] === false ? <X size={16} /> : <Play size={16} />}
                </button>
                {index > 0 && (
                  <button className="btn-secondary" onClick={() => {
                    const nk = [...apiKeys]; nk.splice(index, 1); setApiKeys(nk);
                    const nt = [...testing]; nt.splice(index, 1); setTesting(nt);
                    const nts = [...testSuccesses]; nts.splice(index, 1); setTestSuccesses(nts);
                    const nsk = [...showKeys]; nsk.splice(index, 1); setShowKeys(nsk);
                  }} style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', height: '40px', color: '#ef4444' }} title="Remove Key">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button className="btn-secondary" onClick={() => setApiKeys([...apiKeys, {key: '', active: true}])} style={{ flex: 1, justifyContent: 'center', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px' }}>
              <Plus size={12} /> Add Another API Key
            </button>
            <button className="btn-secondary" onClick={() => handleSave(selectedModels, apiKeys, true)} disabled={saving} style={{ flex: 1, justifyContent: 'center', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px', color: saved ? '#10b981' : undefined, borderColor: saved ? '#10b981' : undefined }} title="Save All Keys">
              {saving ? <RefreshCcw size={12} className={styles.spin} /> : (saved ? <Check size={12} /> : <Save size={12} />)} {saved ? 'Saved!' : 'Save Keys'}
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }} onClick={handleDrawerClose}>
          <div style={{ width: '460px', background: 'var(--color-card-bg)', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 15px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-soft)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Zenmux Models</h2>
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
                <a 
                  href={(() => { const k = apiKeys.find(k => k.active && k.key.trim() !== '')?.key || ''; return k ? "https://api.zenmux.ai/v1/models?key=" + encodeURIComponent(k) : "https://api.zenmux.ai/v1/models"; })()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary" 
                  style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30px' }}
                  title="View Raw JSON"
                >
                  <Code size={14} color="var(--color-text-muted)" />
                </a>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.name}</span>
                          <span style={{ fontSize: '10px', color: 'var(--color-primary)', background: 'rgba(var(--color-primary-rgb), 0.1)', padding: '1px 4px', borderRadius: '4px' }}>
                            {model.context_length ? `${Math.round(model.context_length / 1000)}K` : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.id}</span>
                          <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', opacity: 0.8, textTransform: 'uppercase' }}>
                            {model.architecture?.modality || 'TEXT'}
                          </span>
                        </div>
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

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={model.audio} onChange={(e) => updateSelectedModel(model.originalId, 'audio', e.target.checked)} />
                        Audio
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={model.reasoning} onChange={(e) => updateSelectedModel(model.originalId, 'reasoning', e.target.checked)} />
                        Reasoning
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={model.video} onChange={(e) => updateSelectedModel(model.originalId, 'video', e.target.checked)} />
                        Video
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
});

export default ZenmuxSetup;
