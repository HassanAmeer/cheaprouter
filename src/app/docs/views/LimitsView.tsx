import React from 'react';
import { motion } from 'framer-motion';

export default function LimitsView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'flex-start' }}
    >
      <div>
        <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px', color: '#fff', letterSpacing: '-0.5px' }}>
          Limit of Account
        </h2>
        <p style={{ fontSize: '15px', color: '#999', marginBottom: '32px', lineHeight: '1.6' }}>
          To ensure fair usage and system stability, CheapAgents imposes rate limits and token quotas based on your subscription tier. You can view your current usage statistics in your Dashboard.
        </p>

        <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
          <div style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid #1f1f1f',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Rate Limits</h3>
            <p style={{ fontSize: '13px', color: '#999', lineHeight: '1.6' }}>
              There is a maximum number of API requests allowed per minute or day based on your active plan. Free plans have stricter limits compared to Pro plans.
            </p>
          </div>

          <div style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid #1f1f1f',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Token Quotas</h3>
            <p style={{ fontSize: '13px', color: '#999', lineHeight: '1.6' }}>
              AI models generate responses in tokens. Your subscription determines the maximum token allowance (or API hits) per billing cycle.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid #1f1f1f',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444', marginBottom: '16px' }}>
            Error Handling
          </h3>
          <p style={{ fontSize: '13px', color: '#999', marginBottom: '16px', lineHeight: '1.6' }}>
            If you exceed your account limits, the API will return specific HTTP status codes:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                429 Too Many Requests
              </span>
              <span style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>You have hit the rate limit.</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                402 Payment Required
              </span>
              <span style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>Your quota is exhausted.</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
