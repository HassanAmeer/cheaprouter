'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, X } from 'lucide-react';
import { Button, Badge } from '@/components/ui/primitives';
import { SiteNav } from '@/components/site-nav';
import { useToast } from '@/components/ui/toast';
import styles from './pricing.module.css';

const PLANS = [
  {
    name: 'Free',
    desc: 'Get started with no commitment.',
    monthly: 0,
    popular: false,
    features: ['Some basic AI models are free', 'BYOK — bring your own keys', 'Community support', '100K tokens / month'],
  },
  {
    name: 'Starter',
    desc: 'Perfect for testing and small projects.',
    monthly: 2,
    popular: false,
    features: ['Basic AI models access', 'Priority email support', 'Enhanced rate limits', '1M tokens / month'],
  },
  {
    name: 'Pro Developer',
    desc: 'For serious builders and production apps.',
    monthly: 15,
    popular: true,
    features: ['Highly capable models included', 'Grok, Claude, GLM', 'ChatGPT (GPT-5.6, Fable)', '10M tokens / month', 'Priority support'],
  },
];

const COMPARE = [
  { feature: 'Unified OpenAI-compatible API', free: true, starter: true, pro: true },
  { feature: 'Bring Your Own Key (BYOK)', free: true, starter: true, pro: true },
  { feature: 'Streaming (SSE)', free: true, starter: true, pro: true },
  { feature: 'Function calling & JSON mode', free: false, starter: true, pro: true },
  { feature: 'Premium models (GPT-4o, Claude)', free: false, starter: true, pro: true },
  { feature: 'Dedicated infra & SLA', free: false, starter: false, pro: true },
  { feature: 'Team seats', free: false, starter: false, pro: true },
];

export default function PricingPage() {
  const { toast } = useToast();
  const [annual, setAnnual] = useState(false);

  const price = (m: number) => (annual ? Math.round(m * 10) : m);

  return (
    <main className={styles.page}>
      <SiteNav
        links={[
          { href: '/docs', label: 'Docs' },
          { href: '/chat', label: 'Chat' },
          { href: '/cli', label: 'CLI' },
        ]}
      />

      <section className="container">
        <div className={styles.head}>
          <Badge tone="primary">Simple pricing</Badge>
          <h1 className={styles.title}>Pay only for what you use.</h1>
          <p className={styles.subtitle}>Transparent per-token pricing. Switch plans anytime — no hidden fees.</p>
          <div className={styles.toggle}>
            <button className={!annual ? styles.toggleActive : ''} onClick={() => setAnnual(false)}>Monthly</button>
            <button className={annual ? styles.toggleActive : ''} onClick={() => setAnnual(true)}>Annual <span className={styles.save}>-17%</span></button>
          </div>
        </div>

        <div className={styles.grid}>
          {PLANS.map((p) => (
            <div key={p.name} className={`card ${styles.card} ${p.popular ? styles.cardPopular : ''}`}>
              {p.popular && <div className={styles.popular}>MOST POPULAR</div>}
              <h3 className={styles.planName}>{p.name}</h3>
              <p className={styles.planDesc}>{p.desc}</p>
              <div className={styles.price}>
                ${price(p.monthly)}<span>/{annual ? 'yr' : 'mo'}</span>
              </div>
              <Link href="/signup" className="btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', marginBottom: 24 }}>
                {p.monthly === 0 ? 'Get Started' : 'Subscribe'}
              </Link>
              <ul className={styles.list}>
                {p.features.map((f) => (
                  <li key={f}><Check size={18} strokeWidth={3} color="var(--color-primary)" /> {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <h2 className={styles.compareTitle}>Compare plans</h2>
        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Starter</th>
                <th>Pro Developer</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>{row.free ? <Check size={18} color="var(--color-success)" /> : <X size={18} color="var(--color-text-muted)" />}</td>
                  <td>{row.starter ? <Check size={18} color="var(--color-success)" /> : <X size={18} color="var(--color-text-muted)" />}</td>
                  <td>{row.pro ? <Check size={18} color="var(--color-success)" /> : <X size={18} color="var(--color-text-muted)" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.enterprise}>
          <h2>Need enterprise limits?</h2>
          <p>Custom rate limits, dedicated infrastructure, and SSO. Talk to our team.</p>
          <Button variant="secondary" onClick={() => toast('Sales team notified — we’ll reach out shortly', 'info')}>Contact Sales</Button>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <span>© 2026 CheapModels. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/">Home</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/cli">CLI</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
