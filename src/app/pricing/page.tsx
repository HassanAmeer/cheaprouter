'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { Button, Badge } from '@/components/ui/primitives';
import { SiteNav } from '@/components/site-nav';
import { useToast } from '@/components/ui/toast';
import { useSiteSettings } from '@/components/settings-provider';
import styles from './pricing.module.css';

export default function PricingPage() {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [activeTabId, setActiveTabId] = useState<string>('');

  const tabs = settings.pricingSection?.tabs || [];
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const plans = activeTab?.plans || [];

  return (
    <main className={styles.page}>
      <SiteNav
        links={[
          { href: '/', label: 'Home' },
          { href: '/models', label: 'Models' },
          { href: '/#pricing', label: 'Pricing' },
          { href: '/docs', label: 'API Docs' },
          { href: '/cli', label: 'Coding' },
        ]}
      />

      <section className="container">
        <div className={styles.head}>
          <Badge tone="primary">Simple pricing</Badge>
          <h1 className={styles.title}>{settings.pricingSection?.title || 'Pay only for what you use.'}</h1>
          <p className={styles.subtitle}>{settings.pricingSection?.subtitle || 'Transparent per-token pricing. Switch plans anytime — no hidden fees.'}</p>
          {tabs.length > 1 && (
            <div className={styles.toggle}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={(activeTab?.id === tab.id) ? styles.toggleActive : ''}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.grid}>
          {plans.map((p) => (
            <div key={p.id} className={`card ${styles.card} ${p.featured ? styles.cardPopular : ''}`}>
              {p.featured && <div className={styles.popular}>MOST POPULAR</div>}
              <h3 className={styles.planName}>{p.name}</h3>
              <p className={styles.planDesc}>{p.desc}</p>
              <div className={styles.price}>
                {p.price}<span>{p.period}</span>
              </div>
              <Link href={p.ctaLink || '/signup'} className="btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', marginBottom: 24 }}>
                {p.cta}
              </Link>
              <ul className={styles.list}>
                {p.features.map((f) => (
                  <li key={f}><Check size={18} strokeWidth={3} color="var(--color-primary)" /> {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.enterprise}>
          <h2>Need enterprise limits?</h2>
          <p>Custom rate limits, dedicated infrastructure, and SSO. Talk to our team.</p>
          <Button variant="secondary" onClick={() => toast('Sales team notified — we’ll reach out shortly', 'info')}>Contact Sales</Button>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <span>© 2026 {settings.brandName || 'CheapRouter'}. All rights reserved.</span>
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