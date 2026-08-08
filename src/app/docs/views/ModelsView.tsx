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
        <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', color: '#fff', letterSpacing: '-0.5px' }}>
          List of Models
        </h2>
        
        <p style={{ fontSize: '15px', color: '#999', marginBottom: '32px', lineHeight: '1.6' }}>
          Fetch a list of all active models available for chat completions. Use this list to let users choose a model before generating a response.
        </p>

        {/* Endpoint Details */}
        <div style={{ backgroundColor: '#0F0F0F', border: '1px solid #1f1f1f', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* URL */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Endpoint URL</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: '#000', padding: '8px 12px', borderRadius: '6px', border: '1px solid #333' }}>
                <span style={{ backgroundColor: '#4ade80', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '11px' }}>GET</span>
                <code style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{baseUrl}/v1/models</code>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#1f1f1f' }} />

            {/* Authentication */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Authentication</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontWeight: 600, fontSize: '13px' }}>
                <ShieldCheck size={16} /> None Required
              </div>
            </div>
            
            <div style={{ height: '1px', backgroundColor: '#1f1f1f' }} />

            {/* Headers */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>Headers Required</span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #1f1f1f' }}>
                    <td style={{ padding: '8px 0', fontFamily: 'monospace', fontWeight: 600, color: '#fff' }}>Content-Type</td>
                    <td style={{ padding: '8px 0', color: '#999' }}>application/json</td>
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
          backgroundColor: '#0F0F0F',
          borderRadius: '12px',
          border: '1px solid #1f1f1f',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          {/* Response Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#141414',
            borderBottom: '1px solid #1f1f1f',
            padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#888', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>RESPONSE EXAMPLE</span>
              <span style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>200 OK</span>
            </div>
          </div>
          
          {/* Response Body */}
          <div style={{ padding: '24px', overflowX: 'auto' }}>
            <pre style={{ margin: 0, color: '#a3a3a3', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px', lineHeight: '1.6' }}>
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
