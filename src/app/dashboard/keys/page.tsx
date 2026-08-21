'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Check, Trash2, Plus, KeyRound, Shield } from 'lucide-react';
import { Button, Input, Modal, Badge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import styles from '../dashboard.module.css';
import keysStyles from './keys.module.css';
import { ApiKey } from '@/lib/api-types';

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.listKeys().then((r) => setKeys(r.keys.map((k) => ({ ...k, lastUsed: k.lastUsed ?? 'Never' })))).catch(console.error).finally(() => setLoading(false));
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

  const closeModal = () => {
    setOpen(false);
    setNewSecret(null);
  };

  return (
    <div>
      {/* Header */}
      <div className={keysStyles.header}>
        <div>
          <h1 className={keysStyles.headerTitle}>API Keys</h1>
          <p className={keysStyles.headerSubtitle}>
            Authenticate your API requests. Keep your keys secure and rotate them regularly.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className={keysStyles.generateButton}><Plus size={16} /> Generate Key</Button>
      </div>

      {/* Info Banner */}
      <div className={keysStyles.infoBanner}>
        <Shield size={18} color="var(--color-primary)" />
        <p className={keysStyles.infoText}>
          Never share API keys in public repos or client-side code. Use environment variables instead.
        </p>
      </div>

      {/* Keys Table */}
      {loading ? (
        <div className={`card ${keysStyles.loadingState}`}>
          <div className={`${styles.emptyStateIcon} ${keysStyles.emptyStateIcon}`}><KeyRound size={28} /></div>
          <p>Loading keys…</p>
        </div>
      ) : keys.length === 0 ? (
        <div className="card">
          <div className={`${styles.emptyState} ${keysStyles.emptyState}`}>
            <div className={`${styles.emptyStateIcon} ${keysStyles.emptyStateIcon}`}><KeyRound size={28} /></div>
            <h3 className={keysStyles.emptyStateTitle}>No API keys yet</h3>
            <p className={keysStyles.emptyStateDescription}>Generate your first API key to start making authenticated requests.</p>
            <Button onClick={() => setOpen(true)} className={keysStyles.emptyStateButton}><Plus size={16} /> Generate Your First Key</Button>
          </div>
        </div>
      ) : (
        <div className={`card ${keysStyles.tableContainer}`}>
          <div className={keysStyles.tableScroll}>
            <table className={keysStyles.dataTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Secret Key</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th className={keysStyles.keyActions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td className={keysStyles.keyNameCell}>
                      <div className={keysStyles.keyNameWrapper}>
                        <div className={keysStyles.keyIconWrapper}>
                          <KeyRound size={14} color="var(--color-text-muted)" />
                        </div>
                        <strong className={keysStyles.keyName}>{k.name}</strong>
                      </div>
                    </td>
                    <td className={keysStyles.keySecretCell}>
                      <code className={keysStyles.keySecret}>{k.secret}</code>
                    </td>
                    <td className={keysStyles.keyCreated}>{k.created}</td>
                  <td>
                    <Badge tone={k.lastUsed === 'Never' ? 'neutral' : 'success'}>
                      {k.lastUsed}
                    </Badge>
                  </td>
                  <td className={keysStyles.keyActions}>
                    <button className={keysStyles.actionBtn} onClick={() => revoke(k.id, k.name)} title="Revoke">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
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
            <div className={keysStyles.secretDisplay}>
              <code className={keysStyles.secretCode}>{newSecret}</code>
              <button
                className={keysStyles.copyButton}
                onClick={() => copy(newSecret, 'new')}
              >
                {copied === 'new' ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
              </button>
            </div>
            <div className={keysStyles.modalWarning}>
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
            <p className={keysStyles.inputHint}>
              Choose a descriptive name so you can easily identify this key later.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
