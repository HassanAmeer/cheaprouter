import React from 'react';
import { motion } from 'framer-motion';
import { Code } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Code size={32} color="var(--color-primary)" /> Usage of Models
      </h2>
      <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
        Create a model response for the given chat conversation. This endpoint supports standard OpenAI chat completions format. You <strong>must</strong> authenticate your requests by providing your API key in the <code>Authorization</code> header.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: '6px 12px', borderRadius: '4px', fontWeight: 700, fontSize: '13px' }}>POST</span>
        <code style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)' }}>/v1/chat/completions</code>
      </div>

      <CodeBlock snippets={snippets} />

      <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Try it out</h3>
      <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Enter your API Key and tweak the JSON payload to test the AI models in real-time.
      </p>
      
      <ApiPlayground 
        endpoint={`${baseUrl}/v1/chat/completions`} 
        method="POST" 
        requiresAuth={true} 
        defaultPayload={defaultPayload}
      />
    </motion.div>
  );
}
