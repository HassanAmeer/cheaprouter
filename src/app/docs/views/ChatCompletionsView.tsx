import React from 'react';
import { motion } from 'framer-motion';
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
    { language: 'JS (fetch)' as const, code: jsCode },
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
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'flex-start' }}
    >
      {/* LEFT COLUMN: Description and Request Info */}
      <div>
        <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px', color: '#fff', letterSpacing: '-0.5px' }}>
          Chat Completions
        </h2>
        
        <p style={{ fontSize: '15px', color: '#999', marginBottom: '32px', lineHeight: '1.6' }}>
          Create a model response for the given chat conversation. This endpoint supports standard OpenAI chat completions format, including streaming and function calling.
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #1f1f1f', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#0a0a0a' }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Returns:</span>
            <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>JSON Object</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #1f1f1f', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#0a0a0a' }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Auth:</span>
            <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: 600, fontFamily: 'monospace' }}>Bearer Token Required</span>
          </div>
        </div>

        {/* Request Code */}
        <CodeBlock snippets={snippets} />

        {/* Payload */}
        <CodeBlock snippets={[{ language: 'JS (fetch)' as const, code: payloadCode }]} title="JSON - PAYLOAD" />
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
          endpoint={`${baseUrl}/v1/chat/completions`} 
          method="POST" 
          requiresAuth={true} 
          defaultPayload={defaultPlaygroundPayload}
        />
      </div>
    </motion.div>
  );
}
