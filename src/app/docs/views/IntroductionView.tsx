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
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '40px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#3b82f6', marginBottom: '12px' }}>Base URL</h3>
        <p style={{ fontSize: '15px', color: 'var(--color-text-main)', marginBottom: '16px' }}>
          All API requests must be routed to our global unified endpoint. For the best experience, use our API through official SDKs.
        </p>
        <div style={{
          backgroundColor: '#0d1117',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #30363d',
          fontFamily: 'monospace',
          color: '#c9d1d9',
          fontSize: '14px'
        }}>
          https://api.cheapagents.com/v1
        </div>
      </div>

      <div style={{
        backgroundColor: 'rgba(168, 85, 247, 0.05)',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#a855f7', marginBottom: '12px' }}>Authentication</h3>
        <p style={{ fontSize: '15px', color: 'var(--color-text-main)', marginBottom: '16px', lineHeight: '1.6' }}>
          Authenticate your API requests using your CheapAgents API Key. Pass your API key in the <code>Authorization</code> HTTP header as a Bearer token. 
          Some endpoints (like the Models list) may not require authentication, but most do.
        </p>
        <div style={{
          backgroundColor: '#0d1117',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #30363d',
          fontFamily: 'monospace',
          color: '#c9d1d9',
          fontSize: '14px'
        }}>
          <span style={{ color: '#8b949e' }}>// Example HTTP Header</span><br/>
          Authorization: Bearer YOUR_API_KEY
        </div>
      </div>
    </motion.div>
  );
}
