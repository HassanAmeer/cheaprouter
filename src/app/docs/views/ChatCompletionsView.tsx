import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import ApiPlayground from '../components/ApiPlayground';

interface ChatCompletionsViewProps {
  baseUrl: string;
}

export default function ChatCompletionsView({ baseUrl }: ChatCompletionsViewProps) {
  const curlCode = `curl -X POST "${baseUrl}/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": "Write a haiku about APIs."
      }
    ]
  }'`;

  const jsCode = `fetch('${baseUrl}/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: 'Write a haiku about APIs.' }
    ]
  })
})`;

  const pyCode = `import requests

url = "${baseUrl}/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
payload = {
    "model": "gpt-4o",
    "messages": [
        {"role": "user", "content": "Write a haiku about APIs."}
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`;

  const snippets = [
    { language: 'cURL' as const, code: curlCode },
    { language: 'JavaScript' as const, code: jsCode },
    { language: 'Python' as const, code: pyCode },
  ];

  const payloadCode = `{
  "model": "gpt-4o", // Required
  "messages": [      // Required
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "stream": false    // Optional (default: false)
}`;

  const defaultPlaygroundPayload = `{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": "Hello! How are you?"
    }
  ]
}`;

  const exampleResponse = `{
  "id": "chatcmpl-8f921ab0",
  "object": "chat.completion",
  "created": 1718292150,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I'm doing well, thank you for asking! How can I assist you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 14,
    "completion_tokens": 16,
    "total_tokens": 30
  }
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
          Chat Completions
        </h2>
        
        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
          Create a model response for the given chat conversation. This endpoint supports standard OpenAI chat completions format, including streaming and function calling.
        </p>

        {/* Endpoint Details */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* URL */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Endpoint URL</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--color-bg-muted)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '12px' }}>POST</span>
                <code style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>{baseUrl}/v1/chat/completions</code>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

            {/* Authentication */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Authentication</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '14px' }}>
                <ShieldAlert size={18} /> Required
              </div>
            </div>
            
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

            {/* Headers */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>Headers Required</span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px 0', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-main)' }}>Authorization</td>
                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>Bearer YOUR_API_KEY</td>
                  </tr>
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
          endpoint={`${baseUrl}/v1/chat/completions`} 
          method="POST" 
          requiresAuth={true} 
          defaultPayload={defaultPlaygroundPayload}
        />
      </div>
    </motion.div>
  );
}
