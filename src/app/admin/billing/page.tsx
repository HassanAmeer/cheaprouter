'use client';
import React, { useState, useEffect, useMemo } from 'react';
import styles from '../admin.module.css';
import { Wallet, FileText, Check, X, Download, Loader2, User, Settings2, Save, Search, Trash2, CheckSquare } from 'lucide-react';
import { PaginationBar } from '@/components/ui/pagination-bar';

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

  // Multi-selection states
  const [selectedWithdrawIds, setSelectedWithdrawIds] = useState<Set<string>>(new Set());
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
  const [selectedTopupIds, setSelectedTopupIds] = useState<Set<string>>(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);

  // Withdrawal pagination & search
  const [withdrawSearch, setWithdrawSearch] = useState('');
  const [withdrawStatusFilter, setWithdrawStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [withdrawPage, setWithdrawPage] = useState(1);
  const [withdrawPageSize, setWithdrawPageSize] = useState(50);

  // Invoices pagination & search
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('all');
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(50);

  // Topups pagination & search
  const [topupSearch, setTopupSearch] = useState('');
  const [topupStatusFilter, setTopupStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [topupPage, setTopupPage] = useState(1);
  const [topupPageSize, setTopupPageSize] = useState(50);

  const adminHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`, 'Content-Type': 'application/json' });

  const handleDeleteSelectedWithdrawals = async () => {
    if (selectedWithdrawIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedWithdrawIds.size} withdrawal request${selectedWithdrawIds.size > 1 ? 's' : ''}?`)) return;
    setDeletingBulk(true);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'DELETE',
        headers: adminHeaders(),
        body: JSON.stringify({ ids: Array.from(selectedWithdrawIds) })
      });
      if (res.ok) {
        setWithdrawals(prev => prev.filter(w => !selectedWithdrawIds.has(w.id)));
        setSelectedWithdrawIds(new Set());
      } else {
        alert('Failed to delete selected withdrawal requests');
      }
    } catch (e: any) {
      alert(e?.message || 'Error deleting withdrawals');
    } finally {
      setDeletingBulk(false);
    }
  };

  const handleDeleteSelectedInvoices = async () => {
    if (selectedInvoiceIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedInvoiceIds.size} invoice${selectedInvoiceIds.size > 1 ? 's' : ''}?`)) return;
    setDeletingBulk(true);
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'DELETE',
        headers: adminHeaders(),
        body: JSON.stringify({ ids: Array.from(selectedInvoiceIds) })
      });
      if (res.ok) {
        setInvoices(prev => prev.filter(inv => !selectedInvoiceIds.has(inv.id)));
        setSelectedInvoiceIds(new Set());
      } else {
        alert('Failed to delete selected invoices');
      }
    } catch (e: any) {
      alert(e?.message || 'Error deleting invoices');
    } finally {
      setDeletingBulk(false);
    }
  };

  const handleDeleteSelectedTopups = async () => {
    if (selectedTopupIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedTopupIds.size} top-up request${selectedTopupIds.size > 1 ? 's' : ''}?`)) return;
    setDeletingBulk(true);
    try {
      const res = await fetch('/api/admin/topups', {
        method: 'DELETE',
        headers: adminHeaders(),
        body: JSON.stringify({ ids: Array.from(selectedTopupIds) })
      });
      if (res.ok) {
        setTopups(prev => prev.filter(t => !selectedTopupIds.has(t.id)));
        setSelectedTopupIds(new Set());
      } else {
        alert('Failed to delete selected top-up requests');
      }
    } catch (e: any) {
      alert(e?.message || 'Error deleting top-up requests');
    } finally {
      setDeletingBulk(false);
    }
  };

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
    const listToExport = filteredInvoices.length > 0 ? filteredInvoices : invoices;
    const lines = [
      'Invoice,Date,User,Email,Type,Amount,Notes',
      ...listToExport.map(inv => [inv.id, fmtDate(inv.created), inv.userName, inv.userEmail, inv.type, money(inv.amount), inv.description].join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Withdrawals filtering & pagination
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(w => {
      const q = withdrawSearch.trim().toLowerCase();
      const matchesSearch = !q ||
        (w.id && w.id.toLowerCase().includes(q)) ||
        (w.userName && w.userName.toLowerCase().includes(q)) ||
        (w.userEmail && w.userEmail.toLowerCase().includes(q)) ||
        (w.method && w.method.toLowerCase().includes(q)) ||
        (w.amount !== undefined && String(w.amount).includes(q));
      const matchesStatus = withdrawStatusFilter === 'all' || w.status === withdrawStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [withdrawals, withdrawSearch, withdrawStatusFilter]);

  const totalWithdrawPages = Math.ceil(filteredWithdrawals.length / withdrawPageSize) || 1;
  const pagedWithdrawals = useMemo(() => {
    const start = (withdrawPage - 1) * withdrawPageSize;
    return filteredWithdrawals.slice(start, start + withdrawPageSize);
  }, [filteredWithdrawals, withdrawPage, withdrawPageSize]);

  // Invoices filtering & pagination
  const availableInvoiceTypes = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach(i => { if (i.type) set.add(i.type); });
    return Array.from(set);
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const q = invoiceSearch.trim().toLowerCase();
      const matchesSearch = !q ||
        (inv.id && inv.id.toLowerCase().includes(q)) ||
        (inv.userId && inv.userId.toLowerCase().includes(q)) ||
        (inv.userName && inv.userName.toLowerCase().includes(q)) ||
        (inv.userEmail && inv.userEmail.toLowerCase().includes(q)) ||
        (inv.type && inv.type.toLowerCase().includes(q)) ||
        (inv.description && inv.description.toLowerCase().includes(q)) ||
        (inv.amount !== undefined && String(inv.amount).includes(q));
      const matchesType = invoiceTypeFilter === 'all' || inv.type === invoiceTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [invoices, invoiceSearch, invoiceTypeFilter]);

  const totalInvoicePages = Math.ceil(filteredInvoices.length / invoicePageSize) || 1;
  const pagedInvoices = useMemo(() => {
    const start = (invoicePage - 1) * invoicePageSize;
    return filteredInvoices.slice(start, start + invoicePageSize);
  }, [filteredInvoices, invoicePage, invoicePageSize]);

  // Topups filtering & pagination
  const filteredTopups = useMemo(() => {
    return topups.filter(t => {
      const q = topupSearch.trim().toLowerCase();
      const matchesSearch = !q ||
        (t.id && String(t.id).toLowerCase().includes(q)) ||
        (t.userId && String(t.userId).toLowerCase().includes(q)) ||
        (t.userName && String(t.userName).toLowerCase().includes(q)) ||
        (t.userEmail && String(t.userEmail).toLowerCase().includes(q)) ||
        (t.amount !== undefined && String(t.amount).includes(q));
      const matchesStatus = topupStatusFilter === 'all' || t.status === topupStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [topups, topupSearch, topupStatusFilter]);

  const totalTopupPages = Math.ceil(filteredTopups.length / topupPageSize) || 1;
  const pagedTopups = useMemo(() => {
    const start = (topupPage - 1) * topupPageSize;
    return filteredTopups.slice(start, start + topupPageSize);
  }, [filteredTopups, topupPage, topupPageSize]);

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={withdrawSettings.enabled}
                    onChange={(e) => setWithdrawSettings(s => ({ ...s, enabled: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                  />
                  Withdrawals Enabled
                </label>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  When off, the Withdraw button, withdraw history, and the withdraw form are hidden for every
                  user, and withdrawal requests are rejected.
                </span>
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
            {/* Top Search & Status Toolbar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--color-border)'
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Withdrawal Requests</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  Payout requests awaiting review or completed.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 220 }}>
                  <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search withdrawal..."
                    value={withdrawSearch}
                    onChange={(e) => { setWithdrawSearch(e.target.value); setWithdrawPage(1); }}
                    style={{
                      width: '100%', padding: '7px 10px 7px 32px', borderRadius: '8px',
                      border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)',
                      color: 'var(--color-text-main)', fontSize: '12px', outline: 'none'
                    }}
                  />
                  {withdrawSearch && (
                    <button
                      onClick={() => { setWithdrawSearch(''); setWithdrawPage(1); }}
                      style={{
                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 2
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <select
                  value={withdrawStatusFilter}
                  onChange={(e: any) => { setWithdrawStatusFilter(e.target.value); setWithdrawPage(1); }}
                  style={{
                    padding: '7px 10px', borderRadius: '8px',
                    border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)',
                    color: 'var(--color-text-main)', fontSize: '12px', outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Bulk Selection Action Bar */}
            {selectedWithdrawIds.size > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px', background: 'rgba(124, 58, 237, 0.08)',
                borderBottom: '1px solid rgba(124, 58, 237, 0.25)', animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckSquare size={16} color="var(--color-primary)" />
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px' }}>
                    {selectedWithdrawIds.size} withdrawal request{selectedWithdrawIds.size > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedWithdrawIds(new Set())}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Clear selection
                  </button>
                </div>
                <button
                  onClick={handleDeleteSelectedWithdrawals}
                  disabled={deletingBulk}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)', padding: '7px 16px',
                    borderRadius: '8px', cursor: deletingBulk ? 'default' : 'pointer',
                    fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px'
                  }}
                >
                  {deletingBulk ? <Loader2 size={14} className="lucide-spin" /> : <Trash2 size={14} />} Delete Selected
                </button>
              </div>
            )}

            {/* Top Pagination */}
            <PaginationBar
              currentPage={withdrawPage}
              totalPages={totalWithdrawPages}
              totalItems={filteredWithdrawals.length}
              pageSize={withdrawPageSize}
              onPageChange={setWithdrawPage}
              onPageSizeChange={(s) => { setWithdrawPageSize(s); setWithdrawPage(1); }}
              pageSizeOptions={[10, 25, 50]}
              itemName="withdrawals"
              position="top"
            />

            <div className={styles.tableScroll}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={pagedWithdrawals.length > 0 && pagedWithdrawals.every(w => selectedWithdrawIds.has(w.id))}
                        onChange={(e) => {
                          const newSet = new Set(selectedWithdrawIds);
                          if (e.target.checked) {
                            pagedWithdrawals.forEach(w => newSet.add(w.id));
                          } else {
                            pagedWithdrawals.forEach(w => newSet.delete(w.id));
                          }
                          setSelectedWithdrawIds(newSet);
                        }}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                      />
                    </th>
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
                    <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading withdrawals…</td></tr>
                  ) : filteredWithdrawals.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No withdrawal requests found.</td></tr>
                  ) : (
                    pagedWithdrawals.map(w => (
                      <tr key={w.id} style={{ background: selectedWithdrawIds.has(w.id) ? 'rgba(124, 58, 237, 0.06)' : undefined }}>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedWithdrawIds.has(w.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedWithdrawIds);
                              if (e.target.checked) newSet.add(w.id);
                              else newSet.delete(w.id);
                              setSelectedWithdrawIds(newSet);
                            }}
                            style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                          />
                        </td>
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
                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                            {w.status === 'pending' ? (
                              <>
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
                              </>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{w.processed ? fmtDate(w.processed) : 'Resolved'}</span>
                            )}
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete withdrawal request ${w.id}?`)) return;
                                try {
                                  const res = await fetch('/api/admin/withdrawals', {
                                    method: 'DELETE',
                                    headers: adminHeaders(),
                                    body: JSON.stringify({ ids: [w.id] })
                                  });
                                  if (res.ok) {
                                    setWithdrawals(prev => prev.filter(x => x.id !== w.id));
                                    setSelectedWithdrawIds(prev => { const s = new Set(prev); s.delete(w.id); return s; });
                                  } else {
                                    alert('Failed to delete withdrawal');
                                  }
                                } catch (e: any) {
                                  alert(e?.message || 'Error deleting');
                                }
                              }}
                              title="Delete withdrawal record"
                              style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 28, height: 28, borderRadius: '6px',
                                background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination */}
            <PaginationBar
              currentPage={withdrawPage}
              totalPages={totalWithdrawPages}
              totalItems={filteredWithdrawals.length}
              pageSize={withdrawPageSize}
              onPageChange={setWithdrawPage}
              onPageSizeChange={(s) => { setWithdrawPageSize(s); setWithdrawPage(1); }}
              pageSizeOptions={[10, 25, 50]}
              itemName="withdrawals"
              position="bottom"
            />
          </div>
        </div>
      )}

      {/* ── Invoices tab ── */}
      {tab === 'invoices' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 240 }}>
                <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={invoiceSearch}
                  onChange={(e) => { setInvoiceSearch(e.target.value); setInvoicePage(1); }}
                  style={{
                    width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px',
                    border: '1px solid var(--color-border)', background: 'var(--color-card-bg)',
                    color: 'var(--color-text-main)', fontSize: '13px', outline: 'none'
                  }}
                />
                {invoiceSearch && (
                  <button
                    onClick={() => { setInvoiceSearch(''); setInvoicePage(1); }}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 2
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <select
                value={invoiceTypeFilter}
                onChange={(e) => { setInvoiceTypeFilter(e.target.value); setInvoicePage(1); }}
                style={{
                  padding: '8px 12px', borderRadius: '8px',
                  border: '1px solid var(--color-border)', background: 'var(--color-card-bg)',
                  color: 'var(--color-text-main)', fontSize: '13px', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="all">All Types</option>
                {availableInvoiceTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

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
            {/* Bulk Selection Action Bar */}
            {selectedInvoiceIds.size > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px', background: 'rgba(124, 58, 237, 0.08)',
                borderBottom: '1px solid rgba(124, 58, 237, 0.25)', animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckSquare size={16} color="var(--color-primary)" />
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px' }}>
                    {selectedInvoiceIds.size} invoice{selectedInvoiceIds.size > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedInvoiceIds(new Set())}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Clear selection
                  </button>
                </div>
                <button
                  onClick={handleDeleteSelectedInvoices}
                  disabled={deletingBulk}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)', padding: '7px 16px',
                    borderRadius: '8px', cursor: deletingBulk ? 'default' : 'pointer',
                    fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px'
                  }}
                >
                  {deletingBulk ? <Loader2 size={14} className="lucide-spin" /> : <Trash2 size={14} />} Delete Selected
                </button>
              </div>
            )}

            {/* Top Pagination */}
            <PaginationBar
              currentPage={invoicePage}
              totalPages={totalInvoicePages}
              totalItems={filteredInvoices.length}
              pageSize={invoicePageSize}
              onPageChange={setInvoicePage}
              onPageSizeChange={(s) => { setInvoicePageSize(s); setInvoicePage(1); }}
              pageSizeOptions={[10, 25, 50]}
              itemName="invoices"
              position="top"
            />

            <div className={styles.tableScroll}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={pagedInvoices.length > 0 && pagedInvoices.every(inv => selectedInvoiceIds.has(inv.id))}
                        onChange={(e) => {
                          const newSet = new Set(selectedInvoiceIds);
                          if (e.target.checked) {
                            pagedInvoices.forEach(inv => newSet.add(inv.id));
                          } else {
                            pagedInvoices.forEach(inv => newSet.delete(inv.id));
                          }
                          setSelectedInvoiceIds(newSet);
                        }}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                      />
                    </th>
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
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>Loading invoices…</td></tr>
                  )}
                  {!loadingInvoices && filteredInvoices.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>No transactions yet</td></tr>
                  )}
                  {pagedInvoices.map(inv => (
                    <tr key={inv.id} style={{ background: selectedInvoiceIds.has(inv.id) ? 'rgba(124, 58, 237, 0.06)' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedInvoiceIds.has(inv.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedInvoiceIds);
                            if (e.target.checked) newSet.add(inv.id);
                            else newSet.delete(inv.id);
                            setSelectedInvoiceIds(newSet);
                          }}
                          style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                        />
                      </td>
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
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
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete invoice ${inv.id}?`)) return;
                              try {
                                const res = await fetch('/api/admin/transactions', {
                                  method: 'DELETE',
                                  headers: adminHeaders(),
                                  body: JSON.stringify({ ids: [inv.id] })
                                });
                                if (res.ok) {
                                  setInvoices(prev => prev.filter(x => x.id !== inv.id));
                                  setSelectedInvoiceIds(prev => { const s = new Set(prev); s.delete(inv.id); return s; });
                                } else {
                                  alert('Failed to delete invoice');
                                }
                              } catch (e: any) {
                                alert(e?.message || 'Error deleting');
                              }
                            }}
                            title="Delete invoice record"
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 28, height: 28, borderRadius: '6px',
                              background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination */}
            <PaginationBar
              currentPage={invoicePage}
              totalPages={totalInvoicePages}
              totalItems={filteredInvoices.length}
              pageSize={invoicePageSize}
              onPageChange={setInvoicePage}
              onPageSizeChange={(s) => { setInvoicePageSize(s); setInvoicePage(1); }}
              pageSizeOptions={[10, 25, 50]}
              itemName="invoices"
              position="bottom"
            />
          </div>
        </div>
      )}
      {/* ── Top-ups tab ── */}
      {tab === 'topups' && (
        <div className={styles.tableContainer}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--color-border)'
          }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Top-up Requests</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                Users request balance top-ups. Approving credits their balance; rejecting does nothing.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 220 }}>
                <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search top-up..."
                  value={topupSearch}
                  onChange={(e) => { setTopupSearch(e.target.value); setTopupPage(1); }}
                  style={{
                    width: '100%', padding: '7px 10px 7px 32px', borderRadius: '8px',
                    border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)',
                    color: 'var(--color-text-main)', fontSize: '12px', outline: 'none'
                  }}
                />
                {topupSearch && (
                  <button
                    onClick={() => { setTopupSearch(''); setTopupPage(1); }}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 2
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <select
                value={topupStatusFilter}
                onChange={(e: any) => { setTopupStatusFilter(e.target.value); setTopupPage(1); }}
                style={{
                  padding: '7px 10px', borderRadius: '8px',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)',
                  color: 'var(--color-text-main)', fontSize: '12px', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Bulk Selection Action Bar */}
          {selectedTopupIds.size > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', background: 'rgba(124, 58, 237, 0.08)',
              borderBottom: '1px solid rgba(124, 58, 237, 0.25)', animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckSquare size={16} color="var(--color-primary)" />
                <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px' }}>
                  {selectedTopupIds.size} top-up request{selectedTopupIds.size > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedTopupIds(new Set())}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Clear selection
                </button>
              </div>
              <button
                onClick={handleDeleteSelectedTopups}
                disabled={deletingBulk}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)', padding: '7px 16px',
                  borderRadius: '8px', cursor: deletingBulk ? 'default' : 'pointer',
                  fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px'
                }}
              >
                {deletingBulk ? <Loader2 size={14} className="lucide-spin" /> : <Trash2 size={14} />} Delete Selected
              </button>
            </div>
          )}

          {/* Top Pagination */}
          <PaginationBar
            currentPage={topupPage}
            totalPages={totalTopupPages}
            totalItems={filteredTopups.length}
            pageSize={topupPageSize}
            onPageChange={setTopupPage}
            onPageSizeChange={(s) => { setTopupPageSize(s); setTopupPage(1); }}
            pageSizeOptions={[10, 25, 50]}
            itemName="requests"
            position="top"
          />

          <div className={styles.tableScroll}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={pagedTopups.length > 0 && pagedTopups.every(t => selectedTopupIds.has(t.id))}
                      onChange={(e) => {
                        const newSet = new Set(selectedTopupIds);
                        if (e.target.checked) {
                          pagedTopups.forEach(t => newSet.add(t.id));
                        } else {
                          pagedTopups.forEach(t => newSet.delete(t.id));
                        }
                        setSelectedTopupIds(newSet);
                      }}
                      style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                    />
                  </th>
                  <th>Request</th>
                  <th>User ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopups.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>No top-up requests found</td></tr>
                )}
                {pagedTopups.map(t => (
                  <tr key={t.id} style={{ background: selectedTopupIds.has(t.id) ? 'rgba(124, 58, 237, 0.06)' : undefined }}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedTopupIds.has(t.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedTopupIds);
                          if (e.target.checked) newSet.add(t.id);
                          else newSet.delete(t.id);
                          setSelectedTopupIds(newSet);
                        }}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                      />
                    </td>
                    <td style={{ fontWeight: 700 }}>{t.id}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {t.userId}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={14} color="var(--color-text-muted)" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500 }}>{t.userName || '—'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{t.userEmail || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{fmtDate(t.created)}</td>
                    <td style={{ fontWeight: 600 }}>{money(t.amount)}</td>
                    <td>{statusBadge(t.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                        {t.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateTopupStatus(t.id, 'approved')}
                              disabled={busyId === t.id}
                              title="Approve & credit this top-up to the user's balance"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                                cursor: busyId === t.id ? 'default' : 'pointer',
                                background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              {busyId === t.id ? <Loader2 size={13} className="lucide-spin" /> : <Check size={13} />} Approve
                            </button>
                            <button
                              onClick={() => updateTopupStatus(t.id, 'rejected')}
                              disabled={busyId === t.id}
                              title="Reject this top-up"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                                cursor: busyId === t.id ? 'default' : 'pointer',
                                background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)'
                              }}
                            >
                              <X size={13} /> Reject
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{t.processed ? fmtDate(t.processed) : 'Resolved'}</span>
                        )}
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete top-up request ${t.id}?`)) return;
                            try {
                              const res = await fetch('/api/admin/topups', {
                                method: 'DELETE',
                                headers: adminHeaders(),
                                body: JSON.stringify({ ids: [t.id] })
                              });
                              if (res.ok) {
                                setTopups(prev => prev.filter(x => x.id !== t.id));
                                setSelectedTopupIds(prev => { const s = new Set(prev); s.delete(t.id); return s; });
                              } else {
                                alert('Failed to delete top-up request');
                              }
                            } catch (e: any) {
                              alert(e?.message || 'Error deleting');
                            }
                          }}
                          title="Delete top-up record"
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 28, height: 28, borderRadius: '6px',
                            background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Pagination */}
          <PaginationBar
            currentPage={topupPage}
            totalPages={totalTopupPages}
            totalItems={filteredTopups.length}
            pageSize={topupPageSize}
            onPageChange={setTopupPage}
            onPageSizeChange={(s) => { setTopupPageSize(s); setTopupPage(1); }}
            pageSizeOptions={[10, 25, 50]}
            itemName="requests"
            position="bottom"
          />
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