import React from 'react';
import { motion } from 'framer-motion';
import CodeBlock from '../components/CodeBlock';
import ApiPlayground from '../components/ApiPlayground';

interface ModelsViewProps {
  baseUrl: string;
}

export default function ModelsView({ baseUrl }: ModelsViewProps) {
  const curlCode = `curl -X GET "${baseUrl}/v1/models"`;

  const jsCode = `fetch('${baseUrl}/v1/models', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})`;

  const pyCode = `import requests

url = "${baseUrl}/v1/models"
response = requests.get(url)
print(response.json())`;

  const snippets = [
    { language: 'cURL' as const, code: curlCode },
    { language: 'JS (fetch)' as const, code: jsCode },
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
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'flex-start' }}
    >
      {/* LEFT COLUMN: Description and Request Info */}
      <div>
        <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px', color: '#fff', letterSpacing: '-0.5px' }}>
          List of Models
        </h2>
        
        <p style={{ fontSize: '15px', color: '#999', marginBottom: '32px', lineHeight: '1.6' }}>
          Fetch a list of all active models available for chat completions. Use this list to let users choose a model before generating a response.
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #1f1f1f', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#0a0a0a' }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Returns:</span>
            <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>JSON Object</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #1f1f1f', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#0a0a0a' }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Auth:</span>
            <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>None Required</span>
          </div>
        </div>

        {/* Request Code */}
        <CodeBlock snippets={snippets} />

        {/* Payload */}
        <CodeBlock snippets={[{ language: 'cURL', code: payloadCode }]} title="JSON - PAYLOAD" />
      </div>

      {/* RIGHT COLUMN: Response and Interactive Tester */}
      <div style={{ position: 'sticky', top: '48px' }}>
        
        <div style={{
          backgroundColor: '#0a0a0a',
          borderRadius: '12px',
          border: '1px solid #1f1f1f',
          overflow: 'hidden',
          marginBottom: '24px',
        }}>
          {/* Response Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0f0f0f',
            borderBottom: '1px solid #1f1f1f',
            padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Response</span>
              <span style={{ backgroundColor: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>200 OK</span>
              <span style={{ color: '#666', fontSize: '12px', fontFamily: 'monospace' }}>application/json</span>
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
