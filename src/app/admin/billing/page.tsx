'use client';
import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Wallet, FileText, Check, X, Download, Loader2, User } from 'lucide-react';

const INITIAL_WITHDRAWALS = [
  { id: 'WD-2026-08', userId: 'usr_5f2a1b3c9d4e', user: 'Ali Khan', email: 'ali@example.com', date: 'Aug 10, 2026', method: 'Bank Transfer', amount: '$25.00', status: 'Pending' },
  { id: 'WD-2026-07', userId: 'usr_b15ee5fe78kb', user: 'Julia Roberts', email: 'julia@example.com', date: 'Jul 22, 2026', method: 'PayPal', amount: '$10.00', status: 'Completed' },
  { id: 'WD-2026-06', userId: 'usr_7c2d3e4f5a6b', user: 'Sara Ahmed', email: 'sara@example.com', date: 'Jun 15, 2026', method: 'Bank Transfer', amount: '$40.00', status: 'Completed' },
  { id: 'WD-2026-05', userId: 'usr_1a9b8c7d6e5f', user: 'Muhammad Ali', email: 'muhammad@example.com', date: 'Jun 2, 2026', method: 'JazzCash', amount: '$15.00', status: 'Rejected' },
];

const INVOICES = [
  {
    id: 'INV-2026-07', userId: 'usr_b15ee5fe78kb', user: 'Julia Roberts', email: 'julia@example.com', date: 'Jul 1, 2026', dueDate: 'Jul 15, 2026',
    amount: '$15.00', status: 'Paid', plan: 'API Starter', period: 'Jul 1 – Jul 31, 2026', subscription: 'Monthly',
    billingAddress: 'Julia Roberts\n123 Main Street\nSpringfield, IL 62704\nUnited States',
    paymentMethod: 'VISA •••• 4242', paymentDate: 'Jul 1, 2026',
    subtotal: '$15.00', tax: '$0.00', total: '$15.00',
    items: [
      { desc: 'API Starter Plan — Monthly subscription', qty: 1, amount: '$15.00' },
      { desc: 'Setup fee', qty: 0, amount: '$0.00' },
    ],
  },
  {
    id: 'INV-2026-06', userId: 'usr_5f2a1b3c9d4e', user: 'Ali Khan', email: 'ali@example.com', date: 'Jun 1, 2026', dueDate: 'Jun 15, 2026',
    amount: '$20.00', status: 'Paid', plan: 'Chat Pro', period: 'Jun 1 – Jun 30, 2026', subscription: 'Monthly',
    billingAddress: 'Ali Khan\n42 Rose Avenue\nHouston, TX 77002\nUnited States',
    paymentMethod: 'PayPal ••• ali@example.com', paymentDate: 'Jun 1, 2026',
    subtotal: '$20.00', tax: '$0.00', total: '$20.00',
    items: [
      { desc: 'Chat Pro Plan — Monthly subscription', qty: 1, amount: '$20.00' },
      { desc: 'Setup fee', qty: 0, amount: '$0.00' },
    ],
  },
  {
    id: 'INV-2026-05', userId: 'usr_7c2d3e4f5a6b', user: 'Sara Ahmed', email: 'sara@example.com', date: 'May 1, 2026', dueDate: 'May 15, 2026',
    amount: '$25.00', status: 'Paid', plan: 'CLI Pro', period: 'May 1 – May 31, 2026', subscription: 'Monthly',
    billingAddress: 'Sara Ahmed\n9 Lake View Drive\nSeattle, WA 98101\nUnited States',
    paymentMethod: 'VISA •••• 1111', paymentDate: 'May 1, 2026',
    subtotal: '$25.00', tax: '$0.00', total: '$25.00',
    items: [
      { desc: 'CLI Pro Plan — Monthly subscription', qty: 1, amount: '$25.00' },
      { desc: 'Setup fee', qty: 0, amount: '$0.00' },
    ],
  },
  {
    id: 'INV-2026-04', userId: 'usr_1a9b8c7d6e5f', user: 'Muhammad Ali', email: 'muhammad@example.com', date: 'Apr 1, 2026', dueDate: 'Apr 15, 2026',
    amount: '$15.00', status: 'Paid', plan: 'API Starter', period: 'Apr 1 – Apr 30, 2026', subscription: 'Monthly',
    billingAddress: 'Muhammad Ali\n77 Palm Street\nChicago, IL 60601\nUnited States',
    paymentMethod: 'Bank Transfer', paymentDate: 'Apr 1, 2026',
    subtotal: '$15.00', tax: '$0.00', total: '$15.00',
    items: [
      { desc: 'API Starter Plan — Monthly subscription', qty: 1, amount: '$15.00' },
      { desc: 'Setup fee', qty: 0, amount: '$0.00' },
    ],
  },
  {
    id: 'INV-2026-03', userId: 'usr_3d4e5f6a7b8c', user: 'Noor Fatima', email: 'noor@example.com', date: 'Mar 1, 2026', dueDate: 'Mar 15, 2026',
    amount: '$30.00', status: 'Failed', plan: 'Chat Pro', period: 'Mar 1 – Mar 31, 2026', subscription: 'Monthly',
    billingAddress: 'Noor Fatima\n18 Maple Court\nAustin, TX 78701\nUnited States',
    paymentMethod: 'VISA •••• 7788', paymentDate: '—',
    subtotal: '$30.00', tax: '$0.00', total: '$30.00',
    items: [
      { desc: 'Chat Pro Plan — Monthly subscription', qty: 1, amount: '$30.00' },
      { desc: 'Setup fee', qty: 0, amount: '$0.00' },
    ],
  },
  {
    id: 'INV-2026-02', userId: 'usr_2b3c4d5e6f7a', user: 'Omar Farooq', email: 'omar@example.com', date: 'Feb 1, 2026', dueDate: 'Feb 15, 2026',
    amount: '$45.00', status: 'Error', plan: 'CLI Pro', period: 'Feb 1 – Feb 28, 2026', subscription: 'Monthly',
    billingAddress: 'Omar Farooq\n5 Willow Lane\nDenver, CO 80202\nUnited States',
    paymentMethod: 'PayPal ••• omar@example.com', paymentDate: '—',
    subtotal: '$45.00', tax: '$0.00', total: '$45.00',
    items: [
      { desc: 'CLI Pro Plan — Monthly subscription', qty: 1, amount: '$45.00' },
      { desc: 'Setup fee', qty: 0, amount: '$0.00' },
    ],
  },
  {
    id: 'INV-2026-01', userId: 'usr_6f7a8b9c0d1e', user: 'Ayesha Malik', email: 'ayesha@example.com', date: 'Jan 5, 2026', dueDate: 'Jan 20, 2026',
    amount: '$20.00', status: 'Pending', plan: 'API Starter', period: 'Jan 5 – Feb 5, 2026', subscription: 'Monthly',
    billingAddress: 'Ayesha Malik\n31 Cedar Street\nPhoenix, AZ 85001\nUnited States',
    paymentMethod: 'Bank Transfer', paymentDate: '—',
    subtotal: '$20.00', tax: '$0.00', total: '$20.00',
    items: [
      { desc: 'API Starter Plan — Monthly subscription', qty: 1, amount: '$20.00' },
      { desc: 'Setup fee', qty: 0, amount: '$0.00' },
    ],
  },
];

type Withdrawal = { id: string; userId: string; user: string; email: string; date: string; method: string; amount: string; status: string };

export default function AdminBillingPage() {
  const [tab, setTab] = useState<'withdraw' | 'invoices'>('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(INITIAL_WITHDRAWALS);
  const [busyId, setBusyId] = useState<string | null>(null);

  const updateStatus = (id: string, status: 'Completed' | 'Rejected') => {
    setBusyId(id);
    setTimeout(() => {
      setWithdrawals(prev => prev.map(w => (w.id === id ? { ...w, status } : w)));
      setBusyId(null);
    }, 350);
  };

  const setStatus = (id: string, status: string) => {
    setWithdrawals(prev => prev.map(w => (w.id === id ? { ...w, status } : w)));
  };

  const statusBadge = (status: string) => {
    if (status === 'Completed' || status === 'Paid') return <span className={`${styles.badge} ${styles.badgeActive}`}><Check size={12} /> {status}</span>;
    if (status === 'Pending') return <span className={`${styles.badge} ${styles.badgePro}`}><Loader2 size={12} className="lucide-spin" /> Pending</span>;
    return <span className={`${styles.badge} ${styles.badgeInactive}`}><X size={12} /> {status}</span>;
  };

  const pendingCount = withdrawals.filter(w => w.status === 'Pending').length;

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
      </div>

      {/* ── Withdraw tab ── */}
      {tab === 'withdraw' && (
        <div className={styles.tableContainer}>
          <div className={styles.tableScroll}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Request</th>
                  <th>User ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 700 }}>{w.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                        <User size={12} /> {w.userId}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{w.user}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{w.email}</div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{w.date}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{w.method}</td>
                    <td style={{ fontWeight: 600 }}>{w.amount}</td>
                    <td>{statusBadge(w.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                        <select
                          value={w.status}
                          onChange={(e) => setStatus(w.id, e.target.value)}
                          style={{
                            fontSize: '12px', fontWeight: 600, borderRadius: '8px',
                            padding: '6px 8px', cursor: 'pointer',
                            background: 'var(--color-bg-soft)', color: 'var(--color-text-main)',
                            border: '1px solid var(--color-border)', outline: 'none'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        {w.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(w.id, 'Completed')}
                              disabled={busyId === w.id}
                              title="Approve & process this withdrawal"
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
                              onClick={() => updateStatus(w.id, 'Rejected')}
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
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Invoices tab ── */}
      {tab === 'invoices' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              onClick={() => {}}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer'
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
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700 }}>{inv.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                          <User size={12} /> {inv.userId}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{inv.user}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{inv.email}</div>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{inv.date}</td>
                      <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                      <td>{statusBadge(inv.status)}</td>
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
            {/* Header */}
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

            {/* Status + Id */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{selectedInvoice.id}</div>
              {statusBadge(selectedInvoice.status)}
            </div>

            {/* Billed To */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Billed To</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: 2 }}>{selectedInvoice.user}</div>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-muted)', marginBottom: 4 }}>{selectedInvoice.userId}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{selectedInvoice.billingAddress}</div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px', marginBottom: 24 }}>
              {[
                ['Invoice Date', selectedInvoice.date],
                ['Due Date', selectedInvoice.dueDate],
                ['Plan', selectedInvoice.plan],
                ['Period', selectedInvoice.period],
                ['Subscription', selectedInvoice.subscription],
                ['Payment Method', selectedInvoice.paymentMethod],
                ['Paid On', selectedInvoice.paymentDate],
                ['Email', selectedInvoice.email],
              ].map(([k, v]: any) => (
                <div key={k}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Line items */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Line Items</div>
              <div style={{ background: 'var(--color-bg-soft)', borderRadius: '12px', overflow: 'hidden' }}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((it: any, i: number) => (
                      <tr key={i}>
                        <td>{it.desc}</td>
                        <td style={{ textAlign: 'right' }}>{it.qty}</td>
                        <td style={{ textAlign: 'right' }}>{it.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, marginBottom: 24 }}>
              {[
                ['Subtotal', selectedInvoice.subtotal],
                ['Tax', selectedInvoice.tax],
              ].map(([k, v]: any) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, marginTop: 8 }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-primary)' }}>{selectedInvoice.total}</span>
              </div>
            </div>

            <button
              onClick={() => {}}
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