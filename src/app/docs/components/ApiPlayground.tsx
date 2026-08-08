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
      backgroundColor: '#0F0F0F',
      borderRadius: '12px',
      border: '1px solid #1f1f1f',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#141414',
        borderBottom: '1px solid #1f1f1f',
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={14} color="var(--color-primary)" />
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Live Tester</span>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {requiresAuth && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              API Key
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 36px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  backgroundColor: '#000',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'monospace'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#333';
                }}
              />
            </div>
          </div>
        )}

        {method === 'POST' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Body Payload
            </label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: '#000',
                color: '#a3a3a3',
                fontSize: '13px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                outline: 'none',
                resize: 'vertical',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#333';
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
            padding: '10px',
            borderRadius: '6px',
            backgroundColor: (loading || (requiresAuth && !apiKey.trim())) ? '#1f1f1f' : 'var(--color-primary)',
            color: (loading || (requiresAuth && !apiKey.trim())) ? '#666' : '#fff',
            border: 'none',
            cursor: (loading || (requiresAuth && !apiKey.trim())) ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '13px',
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? <Loader2 size={16} className="lucide-spin" /> : <Send size={16} />}
          {loading ? 'Sending...' : 'Send Request'}
        </button>

        <AnimatePresence>
          {(response || error) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginTop: '20px' }}
            >
              <div style={{
                backgroundColor: '#000',
                borderRadius: '6px',
                border: `1px solid ${error ? '#ef4444' : '#333'}`,
                padding: '16px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <div style={{ 
                  color: error ? '#ef4444' : '#a3a3a3', 
                  fontSize: '10px', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  marginBottom: '12px' 
                }}>
                  {error ? 'Error' : 'Live Response'}
                </div>
                <pre style={{ margin: 0, fontSize: '13px', color: error ? '#fca5a5' : '#fff', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                  <code>{error || response}</code>
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
