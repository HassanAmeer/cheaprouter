"use client";
import React, { useState } from 'react';
import { Play, Loader2, Key, Send, ExternalLink } from 'lucide-react';
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

  const getUrl = () => {
    if (requiresAuth && apiKey) {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.append('key', apiKey);
      return url.toString();
    }
    return endpoint;
  };

  return (
    <div className="glass-card" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={16} color="var(--color-primary)" />
          <span style={{ color: 'var(--color-text-main)', fontSize: '14px', fontWeight: 700 }}>Live Tester</span>
          {method === 'GET' && (
            <a 
              href={getUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              title="Open in new tab"
              style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', marginLeft: '8px', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      <div>
        {requiresAuth && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              API Key
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="password"
                className="input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  paddingLeft: '36px',
                  fontFamily: 'monospace',
                  width: '100%'
                }}
              />
            </div>
          </div>
        )}

        {method === 'POST' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Body Payload
            </label>
            <textarea
              className="input"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={6}
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                resize: 'vertical',
                width: '100%'
              }}
            />
          </div>
        )}

        <button
          onClick={handleTest}
          disabled={loading || (requiresAuth && !apiKey.trim())}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            opacity: (loading || (requiresAuth && !apiKey.trim())) ? 0.6 : 1,
            cursor: (loading || (requiresAuth && !apiKey.trim())) ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '14px',
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
                backgroundColor: 'var(--color-bg-card)', // Dynamically matches light/dark theme
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
                padding: '16px',
                maxHeight: '300px',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ 
                  color: error ? 'var(--color-primary)' : 'var(--color-text-muted)', 
                  fontSize: '10px', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  marginBottom: '12px' 
                }}>
                  {error ? 'Error' : 'Live Response'}
                </div>
                <pre style={{ margin: 0, fontSize: '13px', color: error ? 'var(--color-primary)' : 'var(--color-text-main)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
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
