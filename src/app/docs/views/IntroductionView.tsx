import React from 'react';
import { motion } from 'framer-motion';

export default function IntroductionView() {
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
          API Reference
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
          Welcome to the CheapAgents API documentation. Our API is organized around REST and is 100% compatible with the OpenAI specification. This means you can use official OpenAI SDKs for Python, Node.js, and other languages by simply changing the Base URL and API Key to point to our endpoints.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-card" style={{
          borderRadius: 'var(--radius-lg)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Base URL</h3>
          <div style={{
            backgroundColor: '#0f172a',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            color: '#cbd5e1',
            fontSize: '13px',
          }}>
            https://api.cheapagents.com/v1
          </div>
        </div>

        <div className="glass-card" style={{
          borderRadius: 'var(--radius-lg)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Authentication</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
            Authenticate your API requests using your CheapAgents API Key. Pass your API key in the <code>Authorization</code> HTTP header as a Bearer token. 
          </p>
          <div style={{
            backgroundColor: '#0f172a',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            color: '#cbd5e1',
            fontSize: '13px',
          }}>
            <span style={{ color: '#64748b' }}>// Example HTTP Header</span><br/>
            <span style={{ color: '#fca5a5' }}>Authorization</span>: Bearer YOUR_API_KEY
          </div>
        </div>
      </div>
    </motion.div>
  );
}
