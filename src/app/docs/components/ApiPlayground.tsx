"use client";
import React, { useState } from 'react';
import { Play, Loader2, Key, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiPlaygroundProps {
  endpoint: string;
  method: 'GET' | 'POST';
  defaultPayload?: string;
  requiresAuth?: boolean;
}

export default function ApiPlayground({ endpoint, method, defaultPayload, requiresAuth = false }: ApiPlaygroundProps) {
  const [apiKey, setApiKey] = useState('');
  const [payload, setPayload] = useState(defaultPayload || '');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (requiresAuth && apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const res = await fetch(endpoint, {
        method,
        headers,
        body: method === 'POST' ? payload : undefined,
      });
      
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-card-bg-2)', // Slightly offset background from the main card
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: '24px',
      marginTop: '16px',
      marginBottom: '40px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: 'var(--color-primary)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)' }}>
          <Play size={18} color="var(--color-primary)" /> Live API Tester
        </h3>
      </div>

      {requiresAuth && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-main)' }}>
            API Key
          </label>
          <div style={{ position: 'relative' }}>
            <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your CheapAgents API Key..."
              style={{
                width: '100%',
                padding: '12px 12px 12px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-input-bg)',
                color: 'var(--color-text-main)',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--color-primary-soft)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
                e.target.style.boxShadow = 'var(--shadow-sm)';
              }}
            />
          </div>
        </div>
      )}

      {method === 'POST' && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-main)' }}>
            JSON Payload
          </label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={8}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #374151',
              backgroundColor: '#111827', // Dark background for code input
              color: '#E5E7EB',
              fontSize: '14px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              outline: 'none',
              resize: 'vertical',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#374151';
            }}
          />
        </div>
      )}

      <button
        onClick={handleTest}
        disabled={loading || (requiresAuth && !apiKey.trim())}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: (loading || (requiresAuth && !apiKey.trim())) ? 'var(--color-border)' : 'var(--color-primary)',
          color: (loading || (requiresAuth && !apiKey.trim())) ? 'var(--color-text-muted)' : '#ffffff',
          border: 'none',
          cursor: (loading || (requiresAuth && !apiKey.trim())) ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '15px',
          transition: 'all 0.2s ease',
          boxShadow: (loading || (requiresAuth && !apiKey.trim())) ? 'none' : 'var(--shadow-md)'
        }}
      >
        {loading ? <Loader2 size={18} className="lucide-spin" /> : <Send size={18} />}
        {loading ? 'Sending Request...' : 'Send Request'}
      </button>

      <AnimatePresence>
        {(response || error) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginTop: '24px' }}
          >
            <div style={{
              backgroundColor: '#111827',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${error ? 'var(--color-danger)' : '#374151'}`,
            }}>
              <div style={{ 
                backgroundColor: error ? 'var(--color-danger)' : '#1F2937', 
                padding: '8px 16px', 
                borderTopLeftRadius: 'var(--radius-md)', 
                borderTopRightRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {error ? 'Error' : 'Response'}
              </div>
              <div style={{ padding: '16px', overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '13.5px', color: error ? '#FCA5A5' : '#A5D6FF', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                  <code>{error || response}</code>
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
