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
      style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
    >
      {/* Top Section */}
      <div>
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '11px', fontFamily: 'monospace', marginBottom: '24px' }}>
          <span>API</span>
          <span>&gt;</span>
          <span style={{ color: 'var(--color-text-muted)' }}>List of Models</span>
        </div>

        {/* Endpoint Badge */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '12px', 
          backgroundColor: 'var(--color-bg-card)', 
          border: '1px solid var(--color-border)', 
          padding: '6px 16px 6px 6px', 
          borderRadius: 'var(--radius-xl)', 
          marginBottom: '24px'
        }}>
          <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '4px 10px', borderRadius: 'var(--radius-lg)', fontWeight: 800, fontSize: '11px' }}>GET</span>
          <code style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', fontFamily: 'monospace' }}>/v1/models</code>
        </div>

        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px', color: 'var(--color-text-main)' }}>
          List of Models
        </h2>
        
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', maxWidth: '800px', lineHeight: '1.6', marginBottom: '24px' }}>
          Fetch a list of all active models available for chat completions. Use this list to let users choose a model before generating a response.
        </p>

        {/* Info Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-card)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Returns:</span>
            <span style={{ color: 'var(--color-text-main)', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace' }}>JSON Array</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-card)' }}>
            <ShieldCheck size={14} color="#4ade80" />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Auth:</span>
            <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 700 }}>None Required</span>
          </div>
        </div>
      </div>

      {/* Grid Layout for Requests & Responses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '48px', alignItems: 'flex-start' }}>
        
        {/* Left Column (Requests) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <CodeBlock snippets={snippets} />
          
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No request body required</span>
          </div>
          
          {/* Headers table */}
          <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>Headers Required</span>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-main)' }}>Content-Type</td>
                  <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>application/json</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (Responses) */}
        <div style={{ position: 'sticky', top: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            borderTop: '1px solid #4ade80',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 15px rgba(34, 197, 94, 0.1)'
          }}>
            {/* Response Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-bg-card)',
              borderBottom: '1px solid var(--color-border)',
              padding: '12px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: 'var(--color-text-main)', fontSize: '13px', fontWeight: 600 }}>Response</span>
                <span style={{ backgroundColor: 'rgba(22, 163, 74, 0.2)', color: '#4ade80', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>200 OK</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontFamily: 'monospace' }}>application/json</span>
              </div>
            </div>
            
            {/* Response Body */}
            <div style={{ padding: '24px', overflowX: 'auto' }}>
              <pre style={{ margin: 0, color: 'var(--color-text-main)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px', lineHeight: '1.6' }}>
                <code>{exampleResponse.split('\n').map((line, idx) => {
                  let htmlLine = line
                    .replace(/(".*?")/g, '<span style="color:var(--color-primary)">$1</span>') // strings (red tint)
                    .replace(/(true|false|null)/g, '<span style="color:var(--color-success)">$1</span>'); // booleans
                  return (
                    <div key={idx} dangerouslySetInnerHTML={{ __html: htmlLine || ' ' }} />
                  );
                })}</code>
              </pre>
            </div>
          </div>

          <ApiPlayground 
            endpoint={`${baseUrl}/v1/models`} 
            method="GET" 
            requiresAuth={false} 
          />
        </div>
      </div>
    </motion.div>
  );
}
