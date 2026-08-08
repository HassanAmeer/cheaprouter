import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle } from 'lucide-react';

export default function LimitsView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)' }}>
        <Activity size={32} color="var(--color-primary)" /> Limit of Account
      </h2>
      <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
        To ensure fair usage and system stability, CheapAgents imposes rate limits and token quotas based on your subscription tier. You can view your current usage statistics in your Dashboard.
      </p>

      <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
        <div style={{
          backgroundColor: 'var(--color-bg-soft)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Rate Limits</h3>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            There is a maximum number of API requests allowed per minute or day based on your active plan. Free plans have stricter limits compared to Pro plans. Exceeding these limits will result in rate limit errors.
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--color-bg-soft)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Token Quotas</h3>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            AI models generate responses in tokens. Your subscription determines the maximum token allowance (or API hits) per billing cycle. Once depleted, you must upgrade or wait for the cycle to renew.
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertTriangle size={20} /> Error Handling
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--color-text-main)', marginBottom: '16px', lineHeight: '1.6' }}>
          If you exceed your account limits, the API will return specific HTTP status codes:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>
              429 Too Many Requests
            </span>
            <span style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>You have hit the rate limit (requests per minute). Slow down your requests.</span>
          </li>
          <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>
              402 Payment Required
            </span>
            <span style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>Your account quota (tokens or hits) has been exhausted for the billing cycle.</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
