import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import ApiPlayground from '../components/ApiPlayground';

interface ModelsViewProps {
  baseUrl: string;
}

export default function ModelsView({ baseUrl }: ModelsViewProps) {
  const curlCode = `curl -X GET "${baseUrl}/v1/models" \\
  -H "Content-Type: application/json"`;

  const jsCode = `fetch('${baseUrl}/v1/models', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})`;

  const pyCode = `import requests

url = "${baseUrl}/v1/models"
headers = {
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
print(response.json())`;

  const snippets = [
    { language: 'cURL' as const, code: curlCode },
    { language: 'JavaScript' as const, code: jsCode },
    { language: 'Python' as const, code: pyCode },
  ];

  const payloadCode = `No request body required`;

  const exampleResponse = `{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      "created": 171829092,
      "name": "GPT-4 Omni",
      "features": {
        "text": true,
        "vision": true
      },
      "context_length": 128000
    }
  ]
}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '48px', alignItems: 'flex-start' }}
    >
      {/* LEFT COLUMN: Description and Request Info */}
      <div>
        <h2 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>
          List of Models
        </h2>
        
        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
          Fetch a list of all active models available for chat completions. Use this list to let users choose a model before generating a response.
        </p>

        {/* Endpoint Details */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* URL */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Endpoint URL</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--color-bg-muted)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span style={{ backgroundColor: 'var(--color-success)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '12px' }}>GET</span>
                <code style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>{baseUrl}/v1/models</code>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

            {/* Authentication */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Authentication</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 600, fontSize: '14px' }}>
                <ShieldCheck size={18} /> None Required
              </div>
            </div>
            
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

            {/* Headers */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>Headers Required</span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px 0', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-main)' }}>Content-Type</td>
                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>application/json</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Payload */}
        <CodeBlock snippets={[{ language: 'JavaScript' as const, code: payloadCode }]} title="JSON - PAYLOAD" />
      </div>

      {/* RIGHT COLUMN: Response and Interactive Tester */}
      <div style={{ position: 'sticky', top: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Request Code */}
        <CodeBlock snippets={snippets} title="REQUEST EXAMPLE" />

        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Response Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>RESPONSE EXAMPLE</span>
              <span style={{ backgroundColor: 'rgba(22, 163, 74, 0.2)', color: '#4ade80', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>200 OK</span>
            </div>
          </div>
          
          {/* Response Body */}
          <div style={{ padding: '24px', overflowX: 'auto' }}>
            <pre style={{ margin: 0, color: '#cbd5e1', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px', lineHeight: '1.6' }}>
              <code>{exampleResponse}</code>
            </pre>
          </div>
        </div>

        <ApiPlayground 
          endpoint={`${baseUrl}/v1/models`} 
          method="GET" 
          requiresAuth={false} 
        />
      </div>
    </motion.div>
  );
}
