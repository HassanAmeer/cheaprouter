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
      backgroundColor: 'var(--color-card-bg)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: '24px',
      marginTop: '24px',
      marginBottom: '40px',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--color-primary), #a855f7)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={18} color="var(--color-primary)" /> API Playground
        </h3>
        <span style={{ 
          fontSize: '12px', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          backgroundColor: requiresAuth ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          color: requiresAuth ? '#ef4444' : '#22c55e',
          fontWeight: 600
        }}>
          {requiresAuth ? 'Auth Required' : 'No Auth Required'}
        </span>
      </div>

      {requiresAuth && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-muted)' }}>
            API Key
          </label>
          <div style={{ position: 'relative' }}>
            <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-soft)',
                color: 'var(--color-text-main)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>
        </div>
      )}

      {method === 'POST' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-muted)' }}>
            JSON Payload
          </label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: '#0d1117',
              color: '#c9d1d9',
              fontSize: '13px',
              fontFamily: 'monospace',
              outline: 'none',
              resize: 'vertical',
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
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: (loading || (requiresAuth && !apiKey.trim())) ? 'var(--color-bg-hover)' : 'var(--color-primary)',
          color: (loading || (requiresAuth && !apiKey.trim())) ? 'var(--color-text-muted)' : '#fff',
          border: 'none',
          cursor: (loading || (requiresAuth && !apiKey.trim())) ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '14px',
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? <Loader2 size={16} className="lucide-spin" /> : <Send size={16} />}
        {loading ? 'Sending Request...' : 'Send Request'}
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
              backgroundColor: '#0d1117',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${error ? '#ef4444' : '#30363d'}`,
              padding: '16px',
            }}>
              <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                Response
              </div>
              <pre style={{ margin: 0, fontSize: '13px', color: error ? '#ff7b72' : '#c9d1d9', fontFamily: 'monospace', overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                <code>{error || response}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
