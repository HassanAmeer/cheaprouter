'use client';
import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Save, Plus, X, Globe, RefreshCcw, Search } from 'lucide-react';

type ModelConfig = {
  id: string; // custom ID
  name: string; // custom Name
  originalId: string;
  systemPrompt?: string;
};

export default function OpenRouterPage() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState(false);
  const [savedModels, setSavedModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // OpenRouter models state
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New model state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOriginal, setSelectedOriginal] = useState<any>(null);
  const [customName, setCustomName] = useState('');
  const [customId, setCustomId] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  useEffect(() => {
    fetch('/api/admin/openrouter')
      .then(res => res.json())
      .then(data => {
        if (data.key) setApiKey(data.key);
        if (data.status !== undefined) setStatus(data.status);
        if (data.models) setSavedModels(data.models);
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

  const openModalForModel = (model: any) => {
    setSelectedOriginal(model);
    setCustomName(model.name || '');
    setCustomId(model.id.split('/').pop().replace(/[^a-zA-Z0-9_-]/g, '_') || '');
    setSystemPrompt('');
    setShowAddModal(true);
  };

  const handleAddModel = () => {
    if (!selectedOriginal || !customName || !customId) return;
    
    // Check if ID already exists
    if (savedModels.some(m => m.id === customId)) {
      alert('A model with this custom ID already exists. Please choose a unique ID.');
      return;
    }

    setSavedModels([...savedModels, { id: customId, name: customName, originalId: selectedOriginal.id, systemPrompt }]);
    setShowAddModal(false);
    setSelectedOriginal(null);
  };

  const handleRemoveModel = (id: string) => {
    setSavedModels(savedModels.filter(m => m.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/openrouter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey, status, models: savedModels })
      });
      if (res.ok) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  const filteredModels = availableModels.filter(m => 
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 100px)' }}>
      
      {/* LEFT COLUMN: Config */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={24} /> OpenRouter Setup
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>Configure OpenRouter API and select models from the right panel.</p>
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : savedMessage ? 'Saved!' : 'Save Configuration'}
          </button>
        </div>

        <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>API Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600 }}>Enable OpenRouter Integration</label>
              <label className={styles.toggleSwitch}>
                <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>OpenRouter API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', maxWidth: '400px' }}
              />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Configured Models</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {savedModels.map(model => (
              <div key={model.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', minWidth: '250px', flex: '1 1 250px', position: 'relative' }}>
                <button onClick={() => handleRemoveModel(model.id)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>{model.name}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <span><strong>Custom ID:</strong> {model.id}</span>
                  <span><strong>Original:</strong> <code style={{ background: 'var(--color-input-bg)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{model.originalId}</code></span>
                </div>
                
                {model.systemPrompt && (
                  <div style={{ marginTop: '8px', padding: '8px', background: 'var(--color-input-bg)', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text-main)', fontStyle: 'italic', opacity: 0.8 }}>
                    <strong>Prompt:</strong> {model.systemPrompt.length > 50 ? model.systemPrompt.substring(0, 50) + '...' : model.systemPrompt}
                  </div>
                )}
              </div>
            ))}
            
            {savedModels.length === 0 && (
              <div style={{ width: '100%', padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'var(--color-bg-soft)', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
                No models configured yet. Select a model from the list on the right.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Model List Sheet */}
      <div style={{ width: '350px', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Available Models</h3>
            <button className="btn-secondary" onClick={handleFetchModels} disabled={fetchingModels} style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCcw size={12} className={fetchingModels ? styles.spin : ''} /> {fetchingModels ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search OpenRouter models..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 10px 8px 30px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {availableModels.length === 0 && !fetchingModels && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              Click Fetch to load models from OpenRouter.
            </div>
          )}
          {filteredModels.map(model => (
            <div 
              key={model.id} 
              onClick={() => openModalForModel(model)}
              style={{ 
                padding: '12px', 
                background: 'var(--color-bg-soft)', 
                border: '1px solid var(--color-border)', 
                borderRadius: '8px', 
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{model.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>{model.id}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                <span>Context: {model.context_length}</span>
                <span>Price: ${(parseFloat(model.pricing?.prompt || '0') * 1000000).toFixed(2)}/M | ${(parseFloat(model.pricing?.completion || '0') * 1000000).toFixed(2)}/M</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL FOR ADDING MODEL */}
      {showAddModal && selectedOriginal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Configure Model</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', background: 'var(--color-bg-soft)', padding: '8px 12px', borderRadius: '6px' }}>
              <strong>Original Model:</strong> {selectedOriginal.id}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Custom Display Name</label>
              <input 
                type="text" 
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Fable 0.5"
                style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Custom API ID</label>
              <input 
                type="text" 
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="e.g. cheap_fable123"
                style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Users will use this ID to query the model.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Custom System Prompt (Optional)</label>
              <textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter a custom system prompt that will be prepended to all requests for this model..."
                rows={4}
                style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddModel} disabled={!customName || !customId}>Add Model</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
