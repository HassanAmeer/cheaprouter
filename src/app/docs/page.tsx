"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Terminal, Book, Code, Activity } from 'lucide-react';
import styles from '../page.module.css';

export default function DocsPage() {
  const [baseUrl, setBaseUrl] = useState('https://api.cheapagents.com');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  return (
    <main style={{ backgroundColor: 'var(--color-bg-soft)', minHeight: '100vh', color: 'var(--color-text-main)' }}>
      {/* Navbar */}
      <div className="container">
        <nav className={styles.navbar}>
          <Link href="/" className={styles.logo} style={{ color: 'inherit', textDecoration: 'none' }}>
            <span className={styles.logoIcon}><Zap size={28} fill="currentColor" /></span>
            CheapAgents Docs
          </Link>
          <div className={styles.navLinks}>
            <Link href="/">Back to Home</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </nav>
      </div>

      <div className="container" style={{ display: 'flex', gap: '48px', paddingTop: '40px', paddingBottom: '80px' }}>
        
        {/* Sidebar */}
        <aside style={{ width: '250px', flexShrink: 0, position: 'sticky', top: '40px', height: 'max-content' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '1px', marginBottom: '16px' }}>Documentation</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="#introduction" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Introduction</a></li>
            <li><a href="#list-models" style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}>List of Models</a></li>
            <li><a href="#usage-models" style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}>Usage of Models</a></li>
            <li><a href="#account-limits" style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}>Limit of Account</a></li>
          </ul>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, backgroundColor: 'var(--color-card-bg)', padding: '48px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px' }} id="introduction">Introduction</h1>
          <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', marginBottom: '40px', lineHeight: '1.6' }}>
            Welcome to the CheapAgents API documentation. Our API is organized around REST and is 100% compatible with the OpenAI specification. This means you can use official OpenAI SDKs for Python, Node.js, and other languages by simply changing the Base URL and API Key to point to our endpoints.
          </p>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--color-border)', margin: '40px 0' }} />

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }} id="list-models">
            <Book size={28} color="var(--color-primary)" /> List of Models
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
            Get a list of all currently available models for your account, along with their custom names and supported capabilities (text, vision, reasoning, etc). This endpoint does <strong>not</strong> require an API key (Authentication).
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 12px', borderRadius: '4px', fontWeight: 700, fontSize: '14px' }}>GET</span>
            <code style={{ fontSize: '16px', fontWeight: 600 }}>/v1/models</code>
          </div>

          <div className={styles.codeSection} style={{ marginTop: '24px', marginBottom: '40px' }}>
            <div className={styles.codeHeader}>
              <Terminal size={20} />
              <span>cURL Example</span>
            </div>
            <pre style={{ margin: 0, fontSize: '14px' }}>
              <code>
<span style={{ color: '#FF7B72' }}>curl</span> {baseUrl}/v1/models
              </code>
            </pre>
          </div>
          
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Response Details</h3>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            The JSON response contains an array of model objects. Each object provides the model's <code>id</code> and <code>name</code> (as customized by the admin), and a <code>features</code> object indicating supported modalities.
          </p>
          
          <div className={styles.codeSection} style={{ marginTop: '16px', marginBottom: '24px', backgroundColor: '#0d1117' }}>
            <pre style={{ margin: 0, fontSize: '13px' }}>
              <code>
<span style={{ color: '#8b949e' }}>// Example JSON Response</span><br/>
&#123;<br/>
&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>"object"</span>: <span style={{ color: '#A5D6FF' }}>"list"</span>,<br/>
&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>"data"</span>: [<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&#123;<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>"id"</span>: <span style={{ color: '#A5D6FF' }}>"gpt-4o"</span>,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>"object"</span>: <span style={{ color: '#A5D6FF' }}>"model"</span>,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>"name"</span>: <span style={{ color: '#A5D6FF' }}>"GPT-4 Omni"</span>,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>"features"</span>: &#123;<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>"text"</span>: <span style={{ color: '#FF7B72' }}>true</span>,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>"vision"</span>: <span style={{ color: '#FF7B72' }}>true</span>,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>"reasoning"</span>: <span style={{ color: '#FF7B72' }}>false</span><br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79C0FF' }}>"context_length"</span>: <span style={{ color: '#79C0FF' }}>128000</span><br/>
&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br/>
&nbsp;&nbsp;]<br/>
&#125;
              </code>
            </pre>
          </div>
          
          <hr style={{ border: 'none', borderBottom: '1px solid var(--color-border)', margin: '40px 0' }} />

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }} id="usage-models">
            <Code size={28} color="var(--color-primary)" /> Usage of Models
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
            Create a model response for the given chat conversation. Supports streaming (`stream: true`) and function calling. You <strong>must</strong> authenticate your requests to this endpoint by providing your API key in the `Authorization` header.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: '4px 12px', borderRadius: '4px', fontWeight: 700, fontSize: '14px' }}>POST</span>
            <code style={{ fontSize: '16px', fontWeight: 600 }}>/v1/chat/completions</code>
          </div>

          <div className={styles.codeSection} style={{ marginTop: '24px', marginBottom: '40px' }}>
            <div className={styles.codeHeader}>
              <Terminal size={20} />
              <span>cURL Example</span>
            </div>
            <pre style={{ margin: 0, fontSize: '14px' }}>
              <code>
<span style={{ color: '#FF7B72' }}>curl</span> {baseUrl}/v1/chat/completions \<br/>
&nbsp;&nbsp;-H <span style={{ color: '#A5D6FF' }}>"Content-Type: application/json"</span> \<br/>
&nbsp;&nbsp;-H <span style={{ color: '#A5D6FF' }}>"Authorization: Bearer YOUR_API_KEY"</span> \<br/>
&nbsp;&nbsp;-d '&#123;<br/>
&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#A5D6FF' }}>"model"</span>: <span style={{ color: '#A5D6FF' }}>"gpt-4o"</span>,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#A5D6FF' }}>"messages"</span>: [<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#A5D6FF' }}>"role"</span>: <span style={{ color: '#A5D6FF' }}>"user"</span>,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#A5D6FF' }}>"content"</span>: <span style={{ color: '#A5D6FF' }}>"Hello there!"</span><br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br/>
&nbsp;&nbsp;&nbsp;&nbsp;]<br/>
&nbsp;&nbsp;&#125;'
              </code>
            </pre>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--color-border)', margin: '40px 0' }} />

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }} id="account-limits">
            <Activity size={28} color="var(--color-primary)" /> Limit of Account
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
            To view your account limits, usage statistics, and remaining quota, please visit your <Link href="/dashboard" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Dashboard</Link>.
          </p>
          <ul style={{ fontSize: '16px', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '24px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Rate Limits:</strong> There is a maximum number of API requests allowed per minute/day based on your active subscription plan.</li>
            <li style={{ marginBottom: '8px' }}><strong>Token Limits:</strong> AI models generate responses in tokens. Your plan determines the maximum token allowance per billing cycle.</li>
            <li style={{ marginBottom: '8px' }}><strong>Errors:</strong> If you exceed your account limit, the API will return an HTTP <code>429 Too Many Requests</code> or <code>402 Payment Required</code> status code.</li>
          </ul>

        </div>
      </div>
    </main>
  );
}
