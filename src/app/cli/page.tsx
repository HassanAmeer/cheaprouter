'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Terminal, Zap, Boxes, Shield, Rocket, ArrowRight } from 'lucide-react';
import { Button, Badge } from '@/components/ui/primitives';
import { SiteNav } from '@/components/site-nav';
import { useToast } from '@/components/ui/toast';
import styles from './cli.module.css';

const COMMANDS: Record<string, string> = {
  Windows: 'iwr -useb https://cheapmodels.ai/install.ps1 | iex',
  Mac: 'curl -fsSL https://cheapmodels.ai/install.sh | bash',
  Linux: 'curl -fsSL https://cheapmodels.ai/install.sh | bash',
  npm: 'npm install -g cheap-cli',
};

const SNIPPETS = [
  { title: 'Initialize a project', code: 'cheap-cli init --framework=nextjs' },
  { title: 'Route an existing OpenAI call', code: 'cheap-cli route update --model=claude-3-5-sonnet' },
  { title: 'Start the local proxy', code: 'cheap-cli proxy --port 8787' },
  { title: 'Compare two models', code: 'cheap-cli compare "gpt-4o" "claude-3-5-sonnet" --prompt "explain recursion"' },
];

export default function CliPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState('npm');
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
    toast('Copied to clipboard');
  };

  return (
    <main className={styles.page}>
      <SiteNav
        links={[
          { href: '/docs', label: 'Docs' },
          { href: '/chat', label: 'Chat' },
          { href: '/dashboard', label: 'Dashboard' },
        ]}
      />

      {/* Hero */}
      <section className="container">
        <div className={styles.hero}>
          <Badge tone="primary">cheap-cli v2.4</Badge>
          <h1 className={styles.title}>Your AI models, <span className="text-gradient">one command</span> away.</h1>
          <p className={styles.subtitle}>
            A blazing-fast terminal tool to route, proxy, and compare 100+ models from OpenAI, Anthropic, Google, Meta, and more — all through one API key.
          </p>
          <div className={styles.ctas}>
            <Link href="/signup"><Button size="lg">Get API Key <ArrowRight size={18} /></Button></Link>
            <Link href="/docs"><Button size="lg" variant="outline">Read the Docs</Button></Link>
          </div>

          {/* Install box */}
          <div className={styles.install}>
            <div className={styles.installTabs}>
              {Object.keys(COMMANDS).map((t) => (
                <button key={t} className={`${styles.installTab} ${tab === t ? styles.installTabActive : ''}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>
            <div className={styles.installCmd}>
              <Terminal size={18} color="var(--color-primary)" />
              <code>{COMMANDS[tab]}</code>
              <button className={styles.copyBtn} onClick={() => copy(COMMANDS[tab], 'install')}>
                {copied === 'install' ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container">
        <div className={styles.grid}>
          {[
            { icon: <Rocket size={28} />, title: 'Drop-in Routing', desc: 'Rewrite any OpenAI base URL to CheapModels with a single command. Zero code changes.' },
            { icon: <Boxes size={28} />, title: 'Model Comparison', desc: 'Benchmark GPT-4o vs Claude side-by-side directly from your terminal.' },
            { icon: <Shield size={28} />, title: 'BYOK Secure Proxy', desc: 'Run a local proxy that injects your keys safely — never expose them in client code.' },
            { icon: <Zap size={28} />, title: 'Zero-latency Streams', desc: 'True SSE piping for a native typing experience in your own apps.' },
          ].map((f) => (
            <div key={f.title} className="card glass-card">
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commands */}
      <section className="container">
        <h2 className={styles.sectionTitle}>Common commands</h2>
        <div className={styles.commands}>
          {SNIPPETS.map((s) => (
            <div key={s.title} className={styles.cmdCard}>
              <div className={styles.cmdTitle}>{s.title}</div>
              <div className={styles.cmdRow}>
                <code>{s.code}</code>
                <button className={styles.copyBtn} onClick={() => copy(s.code, s.title)}>
                  {copied === s.title ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <span>© 2026 CheapModels. Built for developers.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/">Home</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
