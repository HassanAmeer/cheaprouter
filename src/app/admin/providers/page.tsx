'use client';
import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Save, AlertTriangle } from 'lucide-react';

const MOCK_PROVIDERS = [
  { id: 'prov_openai', name: 'OpenAI', status: true, key: 'sk-proj-xxxxxx...yyyy', priority: 1 },
  { id: 'prov_anthropic', name: 'Anthropic', status: true, key: 'sk-ant-xxxxxx...zzzz', priority: 2 },
  { id: 'prov_google', name: 'Google Gemini', status: true, key: 'AIzaSyxxxxxx...wwww', priority: 3 },
  { id: 'prov_meta', name: 'Meta Llama', status: false, key: '', priority: 4 },
  { id: 'prov_deepseek', name: 'DeepSeek', status: true, key: 'sk-deep-xxxxxx...vvvv', priority: 5 },
];

export default function ProvidersPage() {
  const [providers, setProviders] = useState(MOCK_PROVIDERS);
  const [saved, setSaved] = useState(false);

  const toggleProvider = (id: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, status: !p.status } : p));
    setSaved(false);
  };

  const updateKey = (id: string, newKey: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, key: newKey } : p));
    setSaved(false);
  };

  const handleSave = () => {
    // Mock save
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Provider Routing & Keys</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage the root API keys used by CheapAgents to route global traffic.</p>
        </div>
        <button className="btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#ef4444', marginBottom: '32px' }}>
        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
          <strong>Critical Warning:</strong> Changing these keys will affect all users on the platform who do not use BYOK. Ensure new keys have sufficient limits before replacing them.
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
                style={{
                  background: 'var(--color-input-bg)',
                  border: '1px solid var(--color-border)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  color: 'var(--color-text-main)',
                  opacity: provider.status ? 1 : 0.5,
                  outline: 'none',
                  fontFamily: 'monospace',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Priority: {provider.priority}</span>
              <span className={`${styles.badge} ${provider.status ? styles.badgeActive : styles.badgeInactive}`}>
                {provider.status ? 'Routing Active' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
