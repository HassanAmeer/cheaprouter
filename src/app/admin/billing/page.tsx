'use client';
import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Wallet, FileText, Check, X, Download, Loader2, User, Settings2, Save } from 'lucide-react';

type Withdrawal = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  created: string | null;
  processed: string | null;
};

type WithdrawSettings = { enabled: boolean; minAmount: number; announcement: string };

type BillingConfig = {
  welcomeCredit: number;
  costPerToken: number;
  minBalanceRequired: number;
  minBillableTokens: number;
  monthlyTokenQuota: number;
};

type Invoice = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  amount: number;
  description: string;
  created: string | null;
};

export default function AdminBillingPage() {
  const [tab, setTab] = useState<'withdraw' | 'invoices' | 'topups'>('withdraw');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [withdrawSettings, setWithdrawSettings] = useState<WithdrawSettings>({ enabled: true, minAmount: 5, announcement: 'Withdrawals are processed within 1–3 business days once approved by an admin review.' });
  const [billingConfig, setBillingConfig] = useState<BillingConfig>({ welcomeCredit: 10, costPerToken: 0.000003, minBalanceRequired: 0.01, minBillableTokens: 150, monthlyTokenQuota: 1000000 });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const adminHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`, 'Content-Type': 'application/json' });

  useEffect(() => {
    fetch('/api/admin/withdrawals', { headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` } })
      .then(res => res.json())
      .then(data => setWithdrawals(data?.withdrawals || []))
      .catch(err => console.error(err))
      .finally(() => setLoadingWithdrawals(false));

    fetch('/api/admin/transactions', { headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` } })
      .then(res => res.json())
      .then(data => setInvoices(data?.transactions || []))
      .catch(err => console.error(err))
      .finally(() => setLoadingInvoices(false));

    fetch('/api/admin/topups', { headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` } })
      .then(res => res.json())
      .then(data => setTopups(data?.topups || []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then((data: any) => {
        if (data?.withdrawSettings) setWithdrawSettings(data.withdrawSettings);
        if (data?.billingSettings) setBillingConfig(prev => ({ ...prev, ...data.billingSettings }));
      })
      .catch(err => console.error(err));
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to update withdrawal');
      } else {
        setWithdrawals(prev => prev.map(w => (w.id === id ? { ...w, status } : w)));
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to update withdrawal');
    } finally {
      setBusyId(null);
    }
  };

  const updateTopupStatus = async (id: string, status: 'approved' | 'rejected') => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/topups/${id}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to update top-up request');
      } else {
        setTopups(prev => prev.map(t => (t.id === id ? { ...t, status } : t)));
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to update top-up request');
    } finally {
      setBusyId(null);
    }
  };

  const saveWithdrawSettings = async () => {
    setSavingSettings(true);
    try {
      // Send only this section; the backend merges shallowly so other
      // sections can't be reverted with stale copies.
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ withdrawSettings })
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const saveBillingConfig = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ billingSettings: billingConfig })
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return <span className={`${styles.badge} ${styles.badgeActive}`}><Check size={12} /> Approved</span>;
    if (status === 'pending') return <span className={`${styles.badge} ${styles.badgePro}`}><Loader2 size={12} className="lucide-spin" /> Pending</span>;
    return <span className={`${styles.badge} ${styles.badgeInactive}`}><X size={12} /> Rejected</span>;
  };

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const money = (n: number) => `$${Math.abs(Number(n || 0)).toFixed(2)}`;

  const downloadInvoice = (inv: Invoice) => {
    const lines = [
      'CheapRouter — Invoice',
      '==========================',
      `Invoice:   ${inv.id}`,
      `Date:      ${fmtDate(inv.created)}`,
      `User:      ${inv.userName} (${inv.userId})`,
      `Email:     ${inv.userEmail}`,
      `Type:      ${inv.type}`,
      `Amount:    ${money(inv.amount)}`,
      `Notes:     ${inv.description}`,
      '',
      'Generated by CheapRouter Billing',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllInvoices = () => {
    const lines = [
      'Invoice,Date,User,Email,Type,Amount,Notes',
      ...invoices.map(inv => [inv.id, fmtDate(inv.created), inv.userName, inv.userEmail, inv.type, money(inv.amount), inv.description].join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(90deg, var(--color-text-main) 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Billing Management</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Review and manage user withdrawal requests and invoices.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
        <button
          onClick={() => setTab('invoices')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            border: 'none',
            background: tab === 'invoices' ? 'var(--color-primary)' : 'transparent',
            color: tab === 'invoices' ? '#fff' : 'var(--color-text-muted)',
            transition: 'all 0.2s ease',
            boxShadow: tab === 'invoices' ? '0 2px 10px rgba(124, 58, 237, 0.3)' : 'none'
          }}
        >
          <FileText size={15} /> Invoices
        </button>
        <button
          onClick={() => setTab('withdraw')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            border: 'none',
            background: tab === 'withdraw' ? 'var(--color-primary)' : 'transparent',
            color: tab === 'withdraw' ? '#fff' : 'var(--color-text-muted)',
            transition: 'all 0.2s ease',
            boxShadow: tab === 'withdraw' ? '0 2px 10px rgba(124, 58, 237, 0.3)' : 'none'
          }}
        >
          <Wallet size={15} /> Withdraw Requests
          {pendingCount > 0 && (
            <span style={{
              background: tab === 'withdraw' ? 'rgba(255,255,255,0.2)' : 'rgba(239, 68, 68, 0.1)',
              color: tab === 'withdraw' ? '#fff' : '#ef4444',
              borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: 700
            }}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('topups')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            border: 'none',
            background: tab === 'topups' ? 'var(--color-primary)' : 'transparent',
            color: tab === 'topups' ? '#fff' : 'var(--color-text-muted)',
            transition: 'all 0.2s ease',
            boxShadow: tab === 'topups' ? '0 2px 10px rgba(124, 58, 237, 0.3)' : 'none'
          }}
        >
          <Wallet size={15} /> Top-up Requests
          {topups.filter(t => t.status === 'pending').length > 0 && (
            <span style={{
              background: tab === 'topups' ? 'rgba(255,255,255,0.2)' : 'rgba(239, 68, 68, 0.1)',
              color: tab === 'topups' ? '#fff' : '#ef4444',
              borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: 700
            }}>
              {topups.filter(t => t.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* ── Withdraw tab ── */}
      {tab === 'withdraw' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Withdraw Settings */}
          <div className={styles.tableContainer} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Settings2 size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Withdrawal Settings</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Minimum Withdrawal Amount (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={withdrawSettings.minAmount}
                  onChange={(e) => setWithdrawSettings(s => ({ ...s, minAmount: Number(e.target.value) }))}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px',
                    border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)',
                    color: 'var(--color-text-main)', fontSize: '14px', outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={withdrawSettings.enabled}
                    onChange={(e) => setWithdrawSettings(s => ({ ...s, enabled: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                  />
                  Withdrawals Enabled
                </label>
              </div>
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Announcement Message (shown to users)</label>
              <textarea
                value={withdrawSettings.announcement}
                onChange={(e) => setWithdrawSettings(s => ({ ...s, announcement: e.target.value }))}
                placeholder="Message shown in the withdraw panel on the user billing page…"
                style={{
                  width: '100%', minHeight: '90px', padding: '11px 14px', borderRadius: '10px',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)',
                  color: 'var(--color-text-main)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical'
                }}
              />
            </div>
            <button
              onClick={saveWithdrawSettings}
              disabled={savingSettings}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: savingSettings ? 'default' : 'pointer',
                background: 'var(--color-primary)', color: '#fff', border: 'none', opacity: savingSettings ? 0.7 : 1
              }}
            >
              {savingSettings ? <Loader2 size={14} className="lucide-spin" /> : (settingsSaved ? <Check size={14} /> : <Save size={14} />)}
              {savingSettings ? 'Saving...' : (settingsSaved ? 'Saved!' : 'Save Settings')}
            </button>
          </div>

          {/* Billing Config */}
          <div className={styles.tableContainer} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Settings2 size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Usage & Pricing Config</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: 18, lineHeight: 1.5 }}>
              Controls how credits are granted and how usage is billed. These values are read live by the API cost engine.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Welcome Credit (USD)</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={billingConfig.welcomeCredit}
                  onChange={(e) => setBillingConfig(c => ({ ...c, welcomeCredit: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)', color: 'var(--color-text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Cost Per Token (USD)</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={billingConfig.costPerToken}
                  onChange={(e) => setBillingConfig(c => ({ ...c, costPerToken: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)', color: 'var(--color-text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Min Balance Required (USD)</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={billingConfig.minBalanceRequired}
                  onChange={(e) => setBillingConfig(c => ({ ...c, minBalanceRequired: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)', color: 'var(--color-text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Min Billable Tokens</label>
                <input
                  type="number"
                  min={0}
                  value={billingConfig.minBillableTokens}
                  onChange={(e) => setBillingConfig(c => ({ ...c, minBillableTokens: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)', color: 'var(--color-text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Free Monthly Token Quota</label>
                <input
                  type="number"
                  min={0}
                  value={billingConfig.monthlyTokenQuota}
                  onChange={(e) => setBillingConfig(c => ({ ...c, monthlyTokenQuota: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)', color: 'var(--color-text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>
            <button
              onClick={saveBillingConfig}
              disabled={savingSettings}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: savingSettings ? 'default' : 'pointer',
                background: 'var(--color-primary)', color: '#fff', border: 'none', opacity: savingSettings ? 0.7 : 1
              }}
            >
              {savingSettings ? <Loader2 size={14} className="lucide-spin" /> : (settingsSaved ? <Check size={14} /> : <Save size={14} />)}
              {savingSettings ? 'Saving...' : (settingsSaved ? 'Saved!' : 'Save Config')}
            </button>
          </div>

          <div className={styles.tableContainer}>
            <div className={styles.tableScroll}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingWithdrawals ? (
                    <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading withdrawals…</td></tr>
                  ) : withdrawals.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No withdrawal requests yet.</td></tr>
                  ) : (
                    withdrawals.map(w => (
                      <tr key={w.id}>
                        <td style={{ fontWeight: 700 }}>{w.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <User size={14} color="var(--color-text-muted)" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 500 }}>{w.userName}</div>
                              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{w.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{fmtDate(w.created)}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{w.method}</td>
                        <td style={{ fontWeight: 600 }}>${Number(w.amount).toFixed(2)}</td>
                        <td>{statusBadge(w.status)}</td>
                        <td style={{ textAlign: 'right' }}>
                          {w.status === 'pending' ? (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={() => updateStatus(w.id, 'approved')}
                                disabled={busyId === w.id}
                                title="Approve & process this withdrawal (pays out the balance)"
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                                  cursor: busyId === w.id ? 'default' : 'pointer',
                                  background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)'
                                }}
                              >
                                <Check size={13} /> Approve
                              </button>
                              <button
                                onClick={() => updateStatus(w.id, 'rejected')}
                                disabled={busyId === w.id}
                                title="Reject this withdrawal"
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                                  cursor: busyId === w.id ? 'default' : 'pointer',
                                  background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)'
                                }}
                              >
                                <X size={13} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{w.processed ? fmtDate(w.processed) : 'Resolved'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoices tab ── */}
      {tab === 'invoices' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              onClick={downloadAllInvoices}
              disabled={invoices.length === 0}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600,
                background: 'none', border: 'none', cursor: invoices.length ? 'pointer' : 'not-allowed',
                opacity: invoices.length ? 1 : 0.5
              }}
            >
              <Download size={13} /> Download All
            </button>
          </div>
          <div className={styles.tableContainer}>
            <div className={styles.tableScroll}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>User ID</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingInvoices && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>Loading invoices…</td></tr>
                  )}
                  {!loadingInvoices && invoices.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>No transactions yet</td></tr>
                  )}
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700 }}>{inv.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                          <User size={12} /> {inv.userId}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{inv.userName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{inv.userEmail}</div>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{fmtDate(inv.created)}</td>
                      <td style={{ fontWeight: 600 }}>{money(inv.amount)}</td>
                      <td>
                        <span className={`${styles.badge} ${inv.type === 'upgrade' ? styles.badgePro : inv.type === 'withdraw' ? styles.badgeInactive : styles.badgeActive}`}>
                          {inv.type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600,
                            background: 'none', border: 'none', cursor: 'pointer'
                          }}
                        >
                          <FileText size={13} /> Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* ── Top-ups tab ── */}
      {tab === 'topups' && (
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 4 }}>Top-up Requests</h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                Users request balance top-ups. Approving credits their balance; rejecting does nothing.
              </p>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request</th>
                  <th>User ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {topups.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>No top-up requests yet</td></tr>
                )}
                {topups.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700 }}>{t.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                        <User size={12} /> {t.userId}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.userName || '—'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{t.userEmail || ''}</div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{fmtDate(t.created)}</td>
                    <td style={{ fontWeight: 600 }}>{money(t.amount)}</td>
                    <td>
                      <span className={`${styles.badge} ${t.status === 'approved' ? styles.badgeActive : t.status === 'rejected' ? styles.badgeInactive : styles.badgePro}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {t.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => updateTopupStatus(t.id, 'approved')}
                            disabled={busyId === t.id}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              fontSize: '13px', color: '#16a34a', fontWeight: 600,
                              background: 'none', border: 'none', cursor: 'pointer'
                            }}
                          >
                            {busyId === t.id ? <Loader2 size={13} className="lucide-spin" /> : <Check size={13} />} Approve
                          </button>
                          <button
                            onClick={() => updateTopupStatus(t.id, 'rejected')}
                            disabled={busyId === t.id}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              fontSize: '13px', color: '#ef4444', fontWeight: 600,
                              background: 'none', border: 'none', cursor: 'pointer'
                            }}
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Invoice detail right-side sheet */}
      {selectedInvoice && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end'
          }}
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            style={{
              width: 460, maxWidth: '92vw', height: '100%',
              background: 'var(--color-card-bg)',
              borderLeft: '1px solid var(--color-border)',
              padding: '28px', overflowY: 'auto',
              boxShadow: '-8px 0 30px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Invoice Details</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{selectedInvoice.id}</div>
              <span className={`${styles.badge} ${selectedInvoice.amount < 0 ? styles.badgeInactive : styles.badgeActive}`}>
                {selectedInvoice.amount < 0 ? 'Credit' : 'Payment'}
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Billed To</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: 2 }}>{selectedInvoice.userName}</div>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-muted)', marginBottom: 4 }}>{selectedInvoice.userId}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{selectedInvoice.userEmail}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px', marginBottom: 24 }}>
              {[
                ['Invoice Date', fmtDate(selectedInvoice.created)],
                ['Transaction Type', selectedInvoice.type],
                ['Description', selectedInvoice.description],
              ].map(([k, v]: any) => (
                <div key={k}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, marginTop: 8 }}>
                <span>Amount</span>
                <span style={{ color: selectedInvoice.amount < 0 ? 'var(--color-danger)' : 'var(--color-primary)' }}>{money(selectedInvoice.amount)}</span>
              </div>
            </div>

            <button
              onClick={() => downloadInvoice(selectedInvoice)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer'
              }}
            >
              <Download size={15} /> Download Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}