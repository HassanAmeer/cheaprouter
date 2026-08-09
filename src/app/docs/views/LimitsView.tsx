import React from 'react';
import { motion } from 'framer-motion';

export default function LimitsView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '48px', alignItems: 'flex-start' }}
    >
      <div>
        <h2 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>
          Limit of Account
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
          To ensure fair usage and system stability, CheapAgents imposes rate limits and token quotas based on your subscription tier. You can view your current usage statistics in your Dashboard.
        </p>

        <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
          <div className="glass-card" style={{
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Rate Limits</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              There is a maximum number of API requests allowed per minute or day based on your active plan. Free plans have stricter limits compared to Pro plans.
            </p>
          </div>

          <div className="glass-card" style={{
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Token Quotas</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              AI models generate responses in tokens. Your subscription determines the maximum token allowance (or API hits) per billing cycle.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="glass-card" style={{
          borderRadius: 'var(--radius-lg)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '16px' }}>
            Error Handling
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
            If you exceed your account limits, the API will return specific HTTP status codes:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ backgroundColor: 'var(--color-danger)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                429 Too Many Requests
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>You have hit the rate limit.</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                402 Payment Required
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>Your quota is exhausted.</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
