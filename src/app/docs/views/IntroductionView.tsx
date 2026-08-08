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
        <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', color: '#fff', letterSpacing: '-0.5px' }}>
          API Reference
        </h2>
        <p style={{ fontSize: '15px', color: '#999', marginBottom: '32px', lineHeight: '1.6' }}>
          Welcome to the CheapAgents API documentation. Our API is organized around REST and is 100% compatible with the OpenAI specification. This means you can use official OpenAI SDKs for Python, Node.js, and other languages by simply changing the Base URL and API Key to point to our endpoints.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{
          backgroundColor: '#0F0F0F',
          border: '1px solid #1f1f1f',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Base URL</h3>
          <div style={{
            backgroundColor: '#000',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #333',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            color: '#a3a3a3',
            fontSize: '13px',
          }}>
            https://api.cheapagents.com/v1
          </div>
        </div>

        <div style={{
          backgroundColor: '#0F0F0F',
          border: '1px solid #1f1f1f',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Authentication</h3>
          <p style={{ fontSize: '13px', color: '#999', marginBottom: '16px', lineHeight: '1.6' }}>
            Authenticate your API requests using your CheapAgents API Key. Pass your API key in the <code>Authorization</code> HTTP header as a Bearer token. 
          </p>
          <div style={{
            backgroundColor: '#000',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #333',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            color: '#a3a3a3',
            fontSize: '13px',
          }}>
            <span style={{ color: '#666' }}>// Example HTTP Header</span><br/>
            <span style={{ color: 'var(--color-primary)' }}>Authorization</span>: Bearer YOUR_API_KEY
          </div>
        </div>
      </div>
    </motion.div>
  );
}
