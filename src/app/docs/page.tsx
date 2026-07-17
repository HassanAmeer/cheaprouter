import React from 'react';
import Link from 'next/link';
import { Zap, Terminal, Book, Code, Shield } from 'lucide-react';
import styles from '../page.module.css';

export default function DocsPage() {
  return (
    <main style={{ backgroundColor: 'var(--color-bg-soft)', minHeight: '100vh', color: 'var(--color-text-main)' }}>
      {/* Navbar */}
      <div className="container">
        <nav className={styles.navbar}>
          <Link href="/" className={styles.logo} style={{ color: 'inherit', textDecoration: 'none' }}>
            <span className={styles.logoIcon}><Zap size={28} fill="currentColor" /></span>
            CheapModels Docs
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
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '1px', marginBottom: '16px' }}>Getting Started</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="#introduction" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Introduction</a></li>
            <li><a href="#authentication" style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}>Authentication</a></li>
            <li><a href="#base-url" style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}>Base URL</a></li>
          </ul>

          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '1px', marginBottom: '16px' }}>API Endpoints</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="#chat-completions" style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}>Chat Completions</a></li>
            <li><a href="#models" style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}>List Models</a></li>
          </ul>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, backgroundColor: 'var(--color-card-bg)', padding: '48px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px' }} id="introduction">API Reference</h1>
          <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', marginBottom: '40px', lineHeight: '1.6' }}>
            The CheapModels API is organized around REST and is 100% compatible with the OpenAI specification. This means you can use official OpenAI SDKs for Python, Node.js, and other languages by simply changing the Base URL and API Key.
          </p>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--color-border)', margin: '40px 0' }} />

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }} id="authentication">
            <Shield size={28} color="var(--color-primary)" /> Authentication
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
            Authenticate your API requests using your CheapModels API Key. You can generate and manage API keys in your <Link href="/dashboard" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Dashboard</Link>.
            Pass your API key in the `Authorization` HTTP header as a Bearer token.
          </p>
          <div className={styles.codeSection} style={{ marginTop: '0', marginBottom: '40px' }}>
            <pre style={{ margin: 0, fontSize: '14px' }}>
              <code>
<span style={{ color: '#8b949e' }}># Example HTTP Header</span><br/>
Authorization: Bearer YOUR_API_KEY
              </code>
            </pre>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }} id="base-url">
            <Book size={28} color="var(--color-primary)" /> Base URL
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
            All API requests must be routed to our global unified endpoint.
          </p>
          <div className={styles.codeSection} style={{ marginTop: '0', marginBottom: '40px', padding: '16px 24px' }}>
            <pre style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              <code>https://api.cheapmodels.com/v1</code>
            </pre>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--color-border)', margin: '40px 0' }} />

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }} id="chat-completions">
            <Code size={28} color="var(--color-primary)" /> Chat Completions
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
            Create a model response for the given chat conversation. Supports streaming (`stream: true`) and function calling.
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
<span style={{ color: '#FF7B72' }}>curl</span> https://api.cheapmodels.com/v1/chat/completions \<br/>
&nbsp;&nbsp;-H <span style={{ color: '#A5D6FF' }}>"Content-Type: application/json"</span> \<br/>
&nbsp;&nbsp;-H <span style={{ color: '#A5D6FF' }}>"Authorization: Bearer $CHEAPMODELS_API_KEY"</span> \<br/>
&nbsp;&nbsp;-d '&#123;<br/>
&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#A5D6FF' }}>"model"</span>: <span style={{ color: '#A5D6FF' }}>"claude-3-5-sonnet"</span>,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#A5D6FF' }}>"messages"</span>: [<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#A5D6FF' }}>"role"</span>: <span style={{ color: '#A5D6FF' }}>"user"</span>,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#A5D6FF' }}>"content"</span>: <span style={{ color: '#A5D6FF' }}>"Write a haiku about APIs."</span><br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br/>
&nbsp;&nbsp;&nbsp;&nbsp;]<br/>
&nbsp;&nbsp;&#125;'
              </code>
            </pre>
          </div>

        </div>
      </div>
    </main>
  );
}
