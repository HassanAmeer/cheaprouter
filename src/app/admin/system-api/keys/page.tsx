'use client';
import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../admin.module.css';
import s from '../system-api.module.css';
import { Key, Copy, Check, Trash2, ShieldAlert, Plus, Loader2, Terminal, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';

interface SystemKey {
  id: string;
  name: string;
  prefix: string;
  description: string;
  created: string;
  lastUsed: string | null;
  secret?: string;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('adminToken')) : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const formatDate = (d: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function AdminSystemApiPage() {
  const [keys, setKeys] = useState<SystemKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [newSecret, setNewSecret] = useState<SystemKey | null>(null);
  const [showEndpoint, setShowEndpoint] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchKeys = useCallback(() => {
    setLoading(true);
    fetch('/api/systemapi/keys', { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.json();
      })
      .then(data => { setKeys(data.keys || []); setError(null); })
      .catch(err => { console.error(err); setError(err.message || 'Failed to load'); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/systemapi/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ name, description })
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      setNewSecret(data.key);
      setKeys(prev => [{ ...data.key }, ...prev]);
      setName('');
      setDescription('');
      triggerToast('System key stored successfully');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to store key', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Revoke this system key?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/systemapi/keys/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        setKeys(prev => prev.filter(k => k.id !== id));
        triggerToast('System key revoked', 'info');
      } else {
        triggerToast('Failed to revoke', 'error');
      }
    } catch { triggerToast('Failed to revoke', 'error'); }
    setDeletingId(null);
  };

  const copy = (id: string, val: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <style jsx>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#3B82F6',
          color: '#fff', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 700, color: 'var(--color-warning)', background: 'var(--color-warning-soft, rgba(250,204,21,0.15))', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(250,204,21,0.3)' }}>
              <ShieldAlert size={12} /> Only for Admin System
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, var(--color-text-main) 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            System API — Store Keys
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: '8px 0 0', maxWidth: '640px' }}>
            Internal, admin-only endpoint to store system-level API keys at <code>/systemapi</code>. Not exposed to regular users.
          </p>
        </div>
      </div>

      {/* Endpoint reference */}
      <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Terminal size={16} color="var(--color-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 700 }}>POST <code style={{ background: 'var(--color-bg-soft)', padding: '2px 8px', borderRadius: '6px' }}>/api/systemapi/keys</code></span>
        </div>
        <pre style={{
          background: 'var(--color-code-bg)', border: '1px solid var(--color-border)', borderRadius: '12px',
          padding: '16px', overflowX: 'auto', fontSize: '12.5px', lineHeight: 1.6, color: 'var(--color-code-text)', fontFamily: 'monospace', margin: 0
        }}>
{`curl -X POST ${'`'}${`$`}{BACKEND_URL}/api/systemapi/keys${'`'} \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "System Gateway", "description": "used by code editor" }'

// Response:
{ "key": { "id": "key_...", "name": "System Gateway", "secret": "sk-...", "prefix": "sk-...", "created": "2026-08-14" } }`}
        </pre>
      </div>

      {/* Store form */}
      <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Store New System Key</h3>
        </div>
        <form onSubmit={handleStore} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className={s.formGrid}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Key name (e.g. Code Editor Gateway)"
              required
              style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 14px', borderRadius: '10px', color: 'var(--color-text-main)', outline: 'none', fontSize: '14px' }}
            />
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)"
              style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 14px', borderRadius: '10px', color: 'var(--color-text-main)', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <button type="submit" disabled={saving} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', alignSelf: 'flex-start',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
            color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer'
          }}>
            {saving ? <Loader2 size={16} className="lucide-spin" /> : <Plus size={16} />} Store Key
          </button>
        </form>
      </div>

      {/* Newly generated secret */}
      {newSecret && (
        <div style={{ background: 'var(--color-code-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <CheckCircle size={16} color="#10B981" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>Key stored — copy the secret now (shown once)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-code-bg-2)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(250,204,21,0.3)' }}>
            <code style={{ fontSize: '13px', color: 'var(--color-code-accent)', fontFamily: 'monospace', flex: 1, overflowX: 'auto', whiteSpace: 'nowrap' }}>{newSecret.secret}</code>
            <button onClick={() => copy(newSecret.id, newSecret.secret || '')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}>
              {copiedId === newSecret.id ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
            </button>
          </div>
          <button onClick={() => setNewSecret(null)} style={{ marginTop: 12, background: 'none', border: '1px solid var(--color-border)', padding: '6px 14px', borderRadius: '8px', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '12px' }}>
            Done
          </button>
        </div>
      )}

      {/* Stored keys list */}
      <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Stored System Keys ({keys.length})</h3>
        </div>

        <div className={styles.tableContainer}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px', color: 'var(--color-text-muted)' }}>
              <Loader2 size={18} className="lucide-spin" /> Loading…
            </div>
          ) : error && keys.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>{error}</div>
          ) : (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key Prefix</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map(k => (
                  <tr key={k.id}>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Key size={14} color="var(--color-primary)" /> {k.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{k.id}</div>
                    </td>
                    <td>
                      <code style={{ background: 'var(--color-bg-soft)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>
                        {k.prefix}
                      </code>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{k.description || '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{formatDate(k.created)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(k.id)}
                        disabled={deletingId === k.id}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', padding: 4 }}
                        title="Revoke"
                      >
                        {deletingId === k.id ? <Loader2 size={15} className="lucide-spin" /> : <Trash2 size={15} />}
                      </button>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && !loading && !error && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                      No system keys stored yet. Use the form above or the <code>/api/systemapi/keys</code> endpoint.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
