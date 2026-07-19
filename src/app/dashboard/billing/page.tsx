'use client';

import React from 'react';
import { Check, CreditCard, Download, ArrowUpRight, Zap, Shield, Crown } from 'lucide-react';
import { Button, Badge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import styles from '../dashboard.module.css';

const INVOICES = [
  { id: 'INV-2026-07', date: 'Jul 1, 2026', amount: '$15.00', status: 'Paid' },
  { id: 'INV-2026-06', date: 'Jun 1, 2026', amount: '$15.00', status: 'Paid' },
  { id: 'INV-2026-05', date: 'May 1, 2026', amount: '$15.00', status: 'Paid' },
  { id: 'INV-2026-04', date: 'Apr 1, 2026', amount: '$15.00', status: 'Paid' },
];

const PLANS = [
  { name: 'Free', price: '$0', features: ['Basic models', 'BYOK support', '100K tokens/mo'], current: false },
  { name: 'Starter', price: '$2', features: ['Basic + mid-tier models', 'Priority support', '500K tokens/mo'], current: false },
  { name: 'Pro Developer', price: '$15', features: ['All premium models', 'Highest rate limits', '1M tokens/mo', 'Grok, Claude, GLM'], current: true },
];

export default function BillingPage() {
  const { toast } = useToast();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 6 }}>Billing & Plans</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Manage your subscription, payment methods, and view invoices.
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="card" style={{ marginBottom: 28, position: 'relative', overflow: 'hidden', border: '1px solid var(--color-primary)', padding: '28px' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-primary)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '6px 16px', borderBottomLeftRadius: '8px' }}>
          CURRENT PLAN
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Crown size={22} color="var(--color-primary)" />
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Pro Developer</h2>
              <Badge tone="primary">Active</Badge>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: 12 }}>
              $15.00 / month · Renews Aug 15, 2026 · 1,000,000 tokens included
            </p>
            <div className={styles.progressBar} style={{ maxWidth: 400, height: 6 }}>
              <div className={styles.progressFill} style={{ width: '32%', background: 'linear-gradient(90deg, var(--color-primary), #ff6b6b)' }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 6 }}>320,000 / 1,000,000 tokens used this cycle</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={() => toast('Opening billing portal…', 'info')}>Manage</Button>
            <Button variant="ghost" onClick={() => toast('Upgrade coming soon', 'info')}>Upgrade</Button>
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 16 }}>Available Plans</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {PLANS.map((plan) => (
            <div key={plan.name} className="card" style={{
              padding: '20px', position: 'relative',
              border: plan.current ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              opacity: plan.current ? 1 : 0.85
            }}>
              {plan.current && (
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Badge tone="primary">Current</Badge>
                </div>
              )}
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
              <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: 16, color: 'var(--color-text-main)' }}>
                {plan.price}<span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    <Check size={14} color="var(--color-success)" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 16 }}>Payment Method</h2>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
          <div style={{
            width: 48, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #1a1f71, #2a2f91)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11
          }}>
            VISA
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Visa ending in 4242</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Expires 09/2028 · Default payment method</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => toast('Card update portal', 'info')}>Update Card</Button>
        </div>
      </div>

      {/* Invoices */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Invoice History</h2>
          <button style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            Download All <Download size={13} />
          </button>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.id}>
                  <td><strong style={{ fontSize: '13px' }}>{inv.id}</strong></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{inv.date}</td>
                  <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                  <td><Badge tone="success"><Check size={11} /> {inv.status}</Badge></td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => toast('Downloading invoice…')}
                      style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Download size={13} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
