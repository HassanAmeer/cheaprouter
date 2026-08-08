import React from 'react';
import { motion } from 'framer-motion';
import { Code, ShieldAlert } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import ApiPlayground from '../components/ApiPlayground';

interface ChatCompletionsViewProps {
  baseUrl: string;
}

export default function ChatCompletionsView({ baseUrl }: ChatCompletionsViewProps) {
  const curlCode = `curl ${baseUrl}/v1/chat/completions \\
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
})
.then(response => response.json())
.then(data => console.log(data));`;

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

  const defaultPayload = `{
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)' }}>
          <Code size={32} color="var(--color-primary)" /> Chat Completions
        </h2>
        
        {/* Method and Auth Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-bg-muted)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
            <span style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '12px' }}>POST</span>
            <code style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>/v1/chat/completions</code>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 700, paddingRight: '4px' }}>
            <ShieldAlert size={14} /> Authorization Required
          </div>
        </div>
      </div>
      
      <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
        Create a model response for the given chat conversation. This endpoint supports standard OpenAI chat completions format, including streaming and function calling.
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
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Required</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-main)' }}>Authorization</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>string</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-primary)', fontWeight: 600 }}>Yes</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>Format: <code>Bearer YOUR_API_KEY</code></td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-main)' }}>Content-Type</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>string</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-primary)', fontWeight: 600 }}>Yes</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>Must be <code>application/json</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Request Body / Payload Section */}
      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-main)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
        Request Body (JSON Payload)
      </h3>
      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Parameter</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Required</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-main)' }}>model</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>string</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-primary)', fontWeight: 600 }}>Yes</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>ID of the model to use (e.g., <code>gpt-4o</code>).</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-main)' }}>messages</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>array</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-primary)', fontWeight: 600 }}>Yes</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>A list of messages comprising the conversation so far.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-main)' }}>stream</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>boolean</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>No</td>
              <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>If set to true, partial message deltas will be sent. Default is false.</td>
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
        endpoint={`${baseUrl}/v1/chat/completions`} 
        method="POST" 
        requiresAuth={true} 
        defaultPayload={defaultPayload}
      />
    </motion.div>
  );
}
