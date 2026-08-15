'use client';
import React, { useState, useEffect, useCallback } from 'react';
import styles from '../admin.module.css';
import { Search, Key, Copy, Check, Trash2, ShieldAlert, Sparkles, CheckCircle, Loader2, User, Mail, Calendar, Activity, Layers } from 'lucide-react';

interface AdminKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  planApi: string;
  balance: number;
}

const formatDate = (d: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const maskKey = (prefix: string) => {
  if (!prefix) return 'sk-…';
  return prefix.length >= 16 ? `${prefix.slice(0, 6)}…${prefix.slice(-4)}` : prefix;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('adminToken')) : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<AdminKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isConfirmRevokeOpen, setIsConfirmRevokeOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<AdminKey | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchKeys = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/keys', { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load keys (${res.status})`);
        return res.json();
      })
      .then(data => {
        setKeys(data.keys || []);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to load keys');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCopy = (id: string, val: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopiedId(id);
    triggerToast('API key prefix copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openRevokeConfirm = (key: AdminKey) => {
    setKeyToRevoke(key);
    setIsConfirmRevokeOpen(true);
  };

  const handleRevoke = async () => {
    if (!keyToRevoke) return;
    setDeletingId(keyToRevoke.id);
    try {
      const res = await fetch(`/api/admin/keys/${keyToRevoke.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        setKeys(prev => prev.filter(k => k.id !== keyToRevoke.id));
        triggerToast(`Key "${keyToRevoke.name}" revoked`, 'info');
      } else {
        triggerToast('Failed to revoke key', 'error');
      }
    } catch (e) {
      triggerToast('Failed to revoke key', 'error');
    }
    setDeletingId(null);
    setIsConfirmRevokeOpen(false);
    setKeyToRevoke(null);
  };

  const filteredKeys = keys.filter(k => {
    const q = searchTerm.toLowerCase();
    return (
      k.name?.toLowerCase().includes(q) ||
      k.id?.toLowerCase().includes(q) ||
      k.userId?.toLowerCase().includes(q) ||
      k.userName?.toLowerCase().includes(q) ||
      k.userEmail?.toLowerCase().includes(q) ||
      k.prefix?.toLowerCase().includes(q)
    );
  });

  const totalKeys = keys.length;
  const activeUsers = new Set(keys.map(k => k.userId)).size;
  const totalBalance = keys.reduce((sum, k) => sum + (Number(k.balance) || 0), 0);

  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <style jsx>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

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
          gap: '8px'
        }}>
          {toastMessage.type === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-soft)', padding: '4px 10px', borderRadius: '20px' }}>
              <Key size={12} /> User API Keys
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, var(--color-text-main) 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Purchased Keys</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: '8px 0 0', maxWidth: '640px' }}>
            Every API key users have generated and paid for — created through the API/code-editor flow. Each key is linked to the user who owns it, showing their plan and remaining balance.
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { icon: <Key size={15} />, label: 'Active keys', value: totalKeys, tint: 'var(--color-primary)' },
          { icon: <User size={15} />, label: 'Unique users', value: activeUsers, tint: 'var(--color-success)' },
          { icon: <Layers size={15} />, label: 'Total balance ($)', value: `$${totalBalance.toFixed(2)}`, tint: 'var(--color-warning)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '10px 16px' }}>
            <span style={{ color: s.tint, display: 'inline-flex' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by key name, key ID, user ID, email, or key prefix..."
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
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '60px', color: 'var(--color-text-muted)' }}>
            <Loader2 size={18} className="lucide-spin" /> Loading keys…
          </div>
        ) : error && keys.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: 6 }}>Could not load keys</div>
            <div style={{ fontSize: '13px' }}>{error}</div>
          </div>
        ) : (
          <div className={styles.tableScroll}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Key Name</th>
                <th>API Key</th>
                <th>Owner (User ID)</th>
                <th>Plan</th>
                <th>Created</th>
                <th>Last Used</th>
                <th>Balance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.map((k) => (
                <tr key={k.id}>
                  <td>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Key size={14} color="var(--color-primary)" />
                      {k.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>{k.id}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{ background: 'var(--color-bg-soft)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>
                        {maskKey(k.prefix)}
                      </code>
                      <button
                        onClick={() => handleCopy(k.id, k.prefix)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                        title="Copy Key Prefix"
                      >
                        {copiedId === k.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <User size={12} color="var(--color-primary)" /> {k.userName || '—'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={10} /> {k.userEmail || '—'}
                        </span>
                        <code style={{ color: 'var(--color-text-muted)' }}>{k.userId}</code>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeActive}`}>
                      {k.planApi || k.plan || 'Free'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={11} /> {formatDate(k.created)}
                    </div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Activity size={11} /> {formatDate(k.lastUsed)}
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>${Number(k.balance || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => openRevokeConfirm(k)}
                        disabled={deletingId === k.id}
                        style={{ border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                        title="Revoke / Delete Key"
                      >
                        {deletingId === k.id ? <Loader2 size={14} className="lucide-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredKeys.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                    {searchTerm ? `No keys found matching "${searchTerm}"` : 'No keys yet. When users generate API keys from their dashboard or code editor, they will appear here.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, color: 'var(--color-text-muted)', fontSize: '12px' }}>
        <ShieldAlert size={14} color="var(--color-warning)" />
        Full key values are stored hashed — only the prefix is recoverable. Revoking removes the key for the owner immediately.
      </div>

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
              <ShieldAlert size={20} /> Revoke Key?
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
              Are you sure you want to revoke the key <strong>"{keyToRevoke.name}"</strong> belonging to {' '}
              <strong>{keyToRevoke.userEmail || keyToRevoke.userId}</strong>? The owner will lose access immediately.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
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

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}