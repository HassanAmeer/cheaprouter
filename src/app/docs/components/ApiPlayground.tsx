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
      const contentType = res.headers.get('content-type') || '';
      const isStream = payload.includes('"stream":true') || payload.includes('"stream": true') || contentType.includes('text/event-stream') || contentType.includes('text/plain');

      if (!res.ok) {
        const rawText = await res.text();
        let errData: any;
        try { errData = JSON.parse(rawText); } catch {}
        throw new Error(errData?.error || `HTTP ${res.status}: ${rawText}`);
      }

      if (isStream && res.body) {
        setLoading(false); // Stop loader immediately
        let fullText = '';
        setResponse('AI response streaming started...\n\n');
        
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setResponse('AI response streamed:\n\n' + fullText);
        }
        return;
      }
      
      const rawText = await res.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(rawText); // Server returned non-JSON 200 OK
      }

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
    <div style={{
      position: 'relative',
      borderRadius: '16px',
      padding: '1px',
      background: 'linear-gradient(145deg, rgba(204,0,0,0.5) 0%, rgba(204,0,0,0.05) 40%, rgba(204,0,0,0.15) 100%)',
      boxShadow: '0 24px 48px -12px rgba(0,0,0,0.3), 0 0 24px rgba(204,0,0,0.1)',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '100%',
        background: 'radial-gradient(circle at top right, rgba(204,0,0,0.2), transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      
      <div style={{
        position: 'relative',
        borderRadius: '15px',
        padding: '32px',
        background: 'var(--color-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 1,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          borderBottom: '1px solid rgba(204,0,0,0.1)',
          paddingBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '10px', 
              background: 'linear-gradient(135deg, var(--color-primary), #ff4d4d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(204,0,0,0.35)'
            }}>
              <Play size={16} color="#fff" style={{ marginLeft: '3px' }} />
            </div>
            <div>
              <h4 style={{ color: 'var(--color-text-main)', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Interactive Sandbox</h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', margin: '2px 0 0 0' }}>Execute real requests against the API</p>
            </div>
          </div>
          {method === 'GET' && (
            <a 
              href={getUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              title="Open in new tab"
              style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', padding: '8px', borderRadius: '8px', cursor: 'pointer', background: 'var(--color-bg-soft)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.background = 'rgba(204,0,0,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'var(--color-bg-soft)'; }}
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'stretch'
        }}>
          {/* Left Column: Inputs & Button */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {requiresAuth && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Key size={12} color="var(--color-primary)" />
                  Authorization Key
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    style={{
                      width: '100%', padding: '14px 16px',
                      borderRadius: '12px', border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-soft)', color: 'var(--color-text-main)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px',
                      transition: 'all 0.2s', outline: 'none'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(204,0,0,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            )}

            {method === 'POST' && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  JSON Payload
                </label>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  style={{
                    width: '100%', padding: '16px',
                    borderRadius: '12px', border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-soft)', color: 'var(--color-text-main)',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px',
                    transition: 'all 0.2s', outline: 'none', resize: 'none', lineHeight: '1.6', flex: 1, minHeight: '200px'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(204,0,0,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            <button
              onClick={handleTest}
              disabled={loading || (requiresAuth && !apiKey.trim())}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                width: '100%', padding: '16px', border: 'none', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--color-primary), #ff4d4d)',
                color: '#fff', fontSize: '15px', fontWeight: 800, letterSpacing: '0.5px',
                textTransform: 'uppercase',
                opacity: (loading || (requiresAuth && !apiKey.trim())) ? 0.5 : 1,
                cursor: (loading || (requiresAuth && !apiKey.trim())) ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(204,0,0,0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)',
                marginTop: 'auto'
              }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(204,0,0,0.35)'; } }}
              onMouseLeave={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(204,0,0,0.25)'; } }}
            >
              {loading ? <Loader2 size={18} className="lucide-spin" /> : <Send size={18} />}
              {loading ? 'Initializing Stream...' : 'Execute Request'}
            </button>
          </div>

          {/* Right Column: Terminal Output */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '350px' }}>
            <div style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: '12px',
              border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
              overflow: 'hidden',
              boxShadow: error ? '0 0 30px rgba(220, 38, 38, 0.15)' : 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              flex: 1
            }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', padding: '12px 16px',
                backgroundColor: 'var(--color-bg-soft)', borderBottom: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '11px', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {error ? 'Execution Error' : 'Terminal Output'}
                </div>
              </div>
              
              <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {!response && !error && !loading ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '13px', fontFamily: 'monospace', opacity: 0.7 }}>
                    Awaiting request...
                  </div>
                ) : (
                  <pre style={{ margin: 0, fontSize: '13.5px', color: error ? 'var(--color-danger)' : 'var(--color-text-main)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    <code>{error || response}</code>
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
