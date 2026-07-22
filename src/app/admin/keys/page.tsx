'use client';
import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Search, Plus, Key, Copy, Check, Trash2, ShieldAlert, Sparkles, CheckCircle, RefreshCw, X } from 'lucide-react';

interface ProxyKey {
  id: string;
  name: string;
  keyVal: string;
  calls: number;
  cost: number;
  created: string;
  status: 'Active' | 'Revoked';
  rateLimit: string;
}

const INITIAL_KEYS: ProxyKey[] = [
  { id: 'key_master_1', name: 'Primary Prod Proxy Gateway', keyVal: 'ca_live_9f8c12a83b4c...e81d', calls: 1420500, cost: 724.80, created: '2026-06-01', status: 'Active', rateLimit: '10,000 req/min' },
  { id: 'key_dev_hasan', name: 'Hasan Local Development Key', keyVal: 'ca_live_2x7v38d91b0k...99a0', calls: 42000, cost: 12.40, created: '2026-06-15', status: 'Active', rateLimit: '100 req/min' },
  { id: 'key_testing_sandbox', name: 'Automated CI/CD Test Key', keyVal: 'ca_live_8q1p2w3e4r5t...78cd', calls: 9840, cost: 3.10, created: '2026-07-01', status: 'Active', rateLimit: '500 req/min' },
  { id: 'key_legacy_migration', name: 'Old Migration Token (Depr)', keyVal: 'ca_live_4n5m6b7v8c9x...1234', calls: 890432, cost: 412.10, created: '2026-01-10', status: 'Revoked', rateLimit: 'None' },
];

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<ProxyKey[]>(INITIAL_KEYS);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmRevokeOpen, setIsConfirmRevokeOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ProxyKey | null>(null);
  
  // Test loading state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // New key form state
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyLimit, setNewKeyLimit] = useState('1,000 req/min');

  const triggerToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (id: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    triggerToast('API Key copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestKey = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      triggerToast('Proxy Route Online. Status: 200 OK (Latency: 45ms)', 'success');
    }, 1500);
  };

  const openRevokeConfirm = (key: ProxyKey) => {
    setKeyToRevoke(key);
    setIsConfirmRevokeOpen(true);
  };

  const handleRevoke = () => {
    if (!keyToRevoke) return;
    setKeys(prev => prev.map(k => k.id === keyToRevoke.id ? { ...k, status: 'Revoked' } : k));
    setIsConfirmRevokeOpen(false);
    triggerToast(`Successfully revoked "${keyToRevoke.name}"`, 'info');
    setKeyToRevoke(null);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullKey = `ca_live_${randomHex.slice(0, 12)}...${randomHex.slice(12, 16)}`;

    const newKey: ProxyKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      keyVal: fullKey,
      calls: 0,
      cost: 0.00,
      created: new Date().toISOString().split('T')[0],
      status: 'Active',
      rateLimit: newKeyLimit,
    };

    setKeys([newKey, ...keys]);
    setIsCreateModalOpen(false);
    setNewKeyName('');
    setNewKeyLimit('1,000 req/min');
    triggerToast('New Master Proxy Key successfully generated!');
  };

  const filteredKeys = keys.filter(k => 
    k.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    k.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: toastMessage.type === 'success' ? '#10B981' : toastMessage.type === 'error' ? '#EF4444' : '#3B82F6',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: 600,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toastMessage.type === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
          {toastMessage.text}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Global Proxy Keys</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage master API keys used to route frontend queries through the cheap-gateway.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <Plus size={16} /> Generate Master Key
        </button>
      </div>

      {/* Search Filter */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search proxy keys by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              background: 'var(--color-card-bg)', 
              border: '1px solid var(--color-border)', 
              padding: '10px 16px 10px 36px', 
              borderRadius: '8px',
              color: 'var(--color-text-main)',
              outline: 'none',
              width: '100%'
            }} 
          />
        </div>
      </div>

      {/* Keys Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Key Name / ID</th>
              <th>API Key Value</th>
              <th>Rate Limit</th>
              <th>Calls Routed</th>
              <th>Cost Incurred</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredKeys.map((k) => (
              <tr key={k.id} style={{ opacity: k.status === 'Revoked' ? 0.6 : 1 }}>
                <td>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={14} color={k.status === 'Active' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                    {k.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>{k.id}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{ background: 'var(--color-bg-soft)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>
                      {k.keyVal}
                    </code>
                    {k.status === 'Active' && (
                      <button 
                        onClick={() => handleCopy(k.id, k.keyVal)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                        title="Copy Key"
                      >
                        {copiedId === k.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </td>
                <td style={{ fontSize: '13px' }}>{k.rateLimit}</td>
                <td style={{ fontWeight: 500 }}>{k.calls.toLocaleString()}</td>
                <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>${k.cost.toFixed(2)}</td>
                <td>
                  <span className={`${styles.badge} ${k.status === 'Active' ? styles.badgeActive : styles.badgeInactive}`}>
                    {k.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {k.status === 'Active' && (
                      <>
                        <button 
                          className={styles.actionBtn}
                          onClick={() => handleTestKey(k.id)}
                          disabled={testingId === k.id}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <RefreshCw size={12} className={testingId === k.id ? 'spin' : ''} style={{ animation: testingId === k.id ? 'spin 1s linear infinite' : 'none' }} />
                          {testingId === k.id ? 'Testing...' : 'Test Proxy'}
                        </button>
                        <button 
                          className={styles.actionBtn} 
                          onClick={() => openRevokeConfirm(k)}
                          style={{ border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                          title="Revoke Key"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredKeys.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                  No proxy keys found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL: GENERATE KEY ================= */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{
            background: 'var(--color-card-bg)', border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--color-primary)" /> Generate Master Proxy Key
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateKey} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Key Name / Description</label>
                <input 
                  type="text" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Cluster Client"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 14px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Rate Limit Policy</label>
                <select 
                  value={newKeyLimit} 
                  onChange={(e) => setNewKeyLimit(e.target.value)}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 14px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                >
                  <option value="100 req/min">100 req/min (Developer Sandbox)</option>
                  <option value="1,000 req/min">1,000 req/min (Standard Tier)</option>
                  <option value="5,000 req/min">5,000 req/min (High Throughput)</option>
                  <option value="10,000 req/min">10,000 req/min (Master Cluster)</option>
                  <option value="None">No Limits (Caution)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className={styles.actionBtn} onClick={() => setIsCreateModalOpen(false)} style={{ flex: 1, padding: '12px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>Generate Token</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REVOKE CONFIRMATION ================= */}
      {isConfirmRevokeOpen && keyToRevoke && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{
            background: 'var(--color-card-bg)', border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldAlert size={20} /> Revoke Master Key?
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Are you sure you want to revoke the key <strong>"{keyToRevoke.name}"</strong>? This action is irreversible. All applications and clients currently routing proxy queries with this token will immediately fail.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className={styles.actionBtn} onClick={() => setIsConfirmRevokeOpen(false)} style={{ flex: 1, padding: '10px' }}>Cancel</button>
              <button 
                onClick={handleRevoke}
                style={{ flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Yes, Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Spin CSS animation */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

    </div>
  );
}
