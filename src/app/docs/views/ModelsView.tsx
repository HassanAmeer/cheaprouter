import React from 'react';
import { motion } from 'framer-motion';
import { Book } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Book size={32} color="var(--color-primary)" /> List of Models
      </h2>
      <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
        Get a list of all currently available models for your account, along with their custom names and supported capabilities (text, vision, reasoning, etc). This endpoint does <strong>not</strong> require an API key.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '6px 12px', borderRadius: '4px', fontWeight: 700, fontSize: '13px' }}>GET</span>
        <code style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)' }}>/v1/models</code>
      </div>

      <CodeBlock snippets={snippets} />

      <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Try it out</h3>
      <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Test the endpoint directly from your browser. Click the button below to fetch the live list of models.
      </p>
      <ApiPlayground 
        endpoint={`${baseUrl}/v1/models`} 
        method="GET" 
        requiresAuth={false} 
      />

    </motion.div>
  );
}
