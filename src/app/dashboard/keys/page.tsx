'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Check, Trash2, Plus, KeyRound, Eye, EyeOff, Shield } from 'lucide-react';
import { Button, Input, Modal, Badge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import styles from '../dashboard.module.css';

type ApiKey = {
  id: string;
  name: string;
  secret: string;
  created: string;
  lastUsed: string;
};

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealId, setRevealId] = useState<string | null>(null);

  const load = () => {
    api.listKeys().then((r) => setKeys(r.keys.map((k: any) => ({ ...k, lastUsed: k.lastUsed ?? 'Never' })))).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const create = async () => {
    if (!name.trim()) return;
    try {
      const r = await api.createKey(name.trim());
      setKeys((prev) => [r.key, ...prev]);
      setNewSecret(r.key.secret);
      setName('');
      toast('API key created successfully');
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const revoke = async (id: string, keyName: string) => {
    if (!confirm(`Revoke key "${keyName}"? This cannot be undone.`)) return;
    try {
      await api.deleteKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast('Key revoked', 'warning');
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const copy = (secret: string, id: string) => {
    navigator.clipboard.writeText(secret);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast('Copied to clipboard');
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return key;
    return key.slice(0, 10) + '•'.repeat(Math.max(key.length - 14, 4)) + key.slice(-4);
  };

  const closeModal = () => {
    setOpen(false);
    setNewSecret(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 6 }}>API Keys</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Authenticate your API requests. Keep your keys secure and rotate them regularly.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={16} /> Generate Key</Button>
      </div>

      {/* Info Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', marginBottom: 28,
        borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-soft)', border: '1px solid rgba(204,0,0,0.1)'
      }}>
        <Shield size={18} color="var(--color-primary)" />
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
          Never share API keys in public repos or client-side code. Use environment variables instead.
        </p>
      </div>

      {/* Keys Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 64, color: 'var(--color-text-muted)' }}>
          <div className={styles.emptyStateIcon}><KeyRound size={28} /></div>
          <p>Loading keys…</p>
        </div>
      ) : keys.length === 0 ? (
        <div className="card">
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}><KeyRound size={28} /></div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 8 }}>No API keys yet</h3>
            <p style={{ marginBottom: 20 }}>Generate your first API key to start making authenticated requests.</p>
            <Button onClick={() => setOpen(true)}><Plus size={16} /> Generate Your First Key</Button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Secret Key</th>
                <th>Created</th>
                <th>Last Used</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-bg-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <KeyRound size={14} color="var(--color-text-muted)" />
                      </div>
                      <strong style={{ fontSize: '14px' }}>{k.name}</strong>
                    </div>
                  </td>
                  <td>
                    <code style={{
                      fontFamily: 'monospace', fontSize: '13px', background: 'var(--color-bg-soft)',
                      padding: '4px 10px', borderRadius: 'var(--radius-sm)', display: 'inline-block',
                      color: 'var(--color-text-muted)'
                    }}>
                      {revealId === k.id ? k.secret : maskKey(k.secret)}
                    </code>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{k.created}</td>
                  <td>
                    <Badge tone={k.lastUsed === 'Never' ? 'neutral' : 'success'}>
                      {k.lastUsed}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={styles.actionBtn} onClick={() => setRevealId(revealId === k.id ? null : k.id)} title="Toggle visibility">
                      {revealId === k.id ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button className={styles.actionBtn} onClick={() => copy(k.secret, k.id)} title="Copy">
                      {copied === k.id ? <Check size={15} color="var(--color-success)" /> : <Copy size={15} />}
                    </button>
                    <button className={styles.actionBtn} onClick={() => revoke(k.id, k.name)} title="Revoke" style={{ color: 'var(--color-danger)' }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Key Modal */}
      <Modal
        open={open}
        onClose={closeModal}
        title={newSecret ? '🎉 Key Generated Successfully' : 'Generate New API Key'}
        footer={
          newSecret
            ? <Button onClick={closeModal}>Done</Button>
            : <>
                <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                <Button onClick={create} disabled={!name.trim()}>Create Key</Button>
              </>
        }
      >
        {newSecret ? (
          <div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 16, fontSize: '14px' }}>
              Copy your secret key now. For security, you won&apos;t be able to see it again.
            </p>
            <div style={{
              display: 'flex', gap: 10, alignItems: 'center', background: 'var(--color-bg-soft)',
              padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)'
            }}>
              <code style={{ flex: 1, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.5 }}>{newSecret}</code>
              <button
                className={styles.actionBtn}
                style={{ margin: 0, flexShrink: 0 }}
                onClick={() => copy(newSecret, 'new')}
              >
                {copied === 'new' ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
              </button>
            </div>
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)',
              fontSize: '13px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Shield size={14} /> Store this key securely — it cannot be recovered.
            </div>
          </div>
        ) : (
          <div>
            <Input
              id="key-name"
              label="Key name"
              placeholder="e.g. Production Server, Staging, Local Dev"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 4 }}>
              Choose a descriptive name so you can easily identify this key later.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
