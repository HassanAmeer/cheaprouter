import React from 'react';
import { motion } from 'framer-motion';
import { Book, ShieldAlert } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import ApiPlayground from '../components/ApiPlayground';

interface ModelsViewProps {
  baseUrl: string;
}

export default function ModelsView({ baseUrl }: ModelsViewProps) {
  const curlCode = `curl ${baseUrl}/v1/models`;

  const jsCode = `fetch('${baseUrl}/v1/models', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`;

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
        "vision": true,
        "image": false,
        "audio": false,
        "reasoning": false,
        "video": false
      },
      "context_length": 128000
    }
  ]
}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)' }}>
          <Book size={32} color="var(--color-primary)" /> List of Models
        </h2>
        
        {/* Method and Auth Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-bg-muted)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
            <span style={{ backgroundColor: 'var(--color-success)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '12px' }}>GET</span>
            <code style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>/v1/models</code>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '12px', fontWeight: 600, paddingRight: '4px' }}>
            <ShieldAlert size={14} /> Authentication Not Required
          </div>
        </div>
      </div>
      
      <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
        Get a list of all currently available models for your account, along with their custom names and supported capabilities (text, vision, reasoning, etc).
      </p>

      {/* Request Headers Section */}
      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-main)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
        Request Headers
      </h3>
      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Header</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-main)' }}>Content-Type</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>string</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>Should be set to <code>application/json</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>Code Examples</h3>
      <CodeBlock snippets={snippets} />

      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-main)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
        Example Response
      </h3>
      <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '40px', overflowX: 'auto', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'var(--shadow-sm)' }}>
        <pre style={{ margin: 0, color: '#A5D6FF', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13.5px', lineHeight: '1.5' }}>
          <code>{exampleResponse}</code>
        </pre>
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid var(--color-border)', margin: '40px 0' }} />

      <ApiPlayground 
        endpoint={`${baseUrl}/v1/models`} 
        method="GET" 
        requiresAuth={false} 
      />

    </motion.div>
  );
}
