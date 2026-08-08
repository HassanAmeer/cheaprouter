import React from 'react';
import { motion } from 'framer-motion';

export default function IntroductionView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px', color: 'var(--color-text-main)' }}>
        API Reference
      </h1>
      <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
        Welcome to the CheapAgents API documentation. Our API is organized around REST and is 100% compatible with the OpenAI specification. This means you can use official OpenAI SDKs for Python, Node.js, and other languages by simply changing the Base URL and API Key to point to our endpoints.
      </p>

      <div style={{
        backgroundColor: 'var(--color-primary-soft)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '40px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>Base URL</h3>
        <p style={{ fontSize: '15px', color: 'var(--color-text-main)', marginBottom: '16px' }}>
          All API requests must be routed to our global unified endpoint. For the best experience, use our API through official SDKs.
        </p>
        <div style={{
          backgroundColor: '#111827',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(0,0,0,0.1)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          color: '#E5E7EB',
          fontSize: '14px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          https://api.cheapagents.com/v1
        </div>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-muted)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Authentication</h3>
        <p style={{ fontSize: '15px', color: 'var(--color-text-main)', marginBottom: '16px', lineHeight: '1.6' }}>
          Authenticate your API requests using your CheapAgents API Key. Pass your API key in the <code>Authorization</code> HTTP header as a Bearer token. 
          Some endpoints (like the Models list) may not require authentication, but most do.
        </p>
        <div style={{
          backgroundColor: '#111827',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(0,0,0,0.1)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          color: '#E5E7EB',
          fontSize: '14px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ color: '#9CA3AF' }}>// Example HTTP Header</span><br/>
          Authorization: Bearer YOUR_API_KEY
        </div>
      </div>
    </motion.div>
  );
}
