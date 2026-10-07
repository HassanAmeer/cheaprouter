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

  const plans = (settings.pricingSection?.plans && settings.pricingSection.plans.length > 0)
    ? settings.pricingSection.plans
    : (settings.pricingSection?.tabs?.[0]?.plans || []);

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
          <p className={styles.subtitle}>{settings.pricingSection?.subtitle || 'Transparent per-token pricing. Access CLI, IDE Builder, Cheap Chats, and REST APIs with a single subscription.'}</p>
        </div>

        <div className={styles.grid}>
          {plans.map((p) => {
            const tokenText = p.tokens || (p.tokensM ? `${p.tokensM}M Tokens/mo` : (p.name === 'Free' ? '10M Tokens/mo' : p.name === 'Pro' ? '100M Tokens/mo' : '500M Tokens/mo'));
            const showCli = p.canUseCli !== false;
            const showIde = p.canUseIde !== false;
            const showChat = p.canUseChat !== false;
            const showApi = p.canUseApi !== false;

            return (
              <div key={p.id} className={`card ${styles.card} ${p.featured ? styles.cardPopular : ''}`}>
                {p.featured && <div className={styles.popular}>MOST POPULAR</div>}
                <h3 className={styles.planName}>{p.name}</h3>
                <p className={styles.planDesc}>{p.desc}</p>

                <div className={styles.tokenBadge}>
                  <Check size={14} />
                  <span>{tokenText}</span>
                </div>

                <div className={styles.price}>
                  {p.price}<span>{p.period || ''}</span>
                </div>

                {/* ─── PLATFORM CAPABILITIES ─── */}
                <div className={styles.capabilitiesStrip}>
                  {showCli && (
                    <span className={styles.capabilityChip} title="Can use Cheap CLI and terminal agents">
                      Can use CLI
                    </span>
                  )}
                  {showIde && (
                    <span className={styles.capabilityChip} title="Can use IDE Builder and code extensions">
                      Can use IDE
                    </span>
                  )}
                  {showChat && (
                    <span className={styles.capabilityChip} title="Can use Cheap Chats web app">
                      Can use Chats
                    </span>
                  )}
                  {showApi && (
                    <span className={styles.capabilityChip} title="Can use REST API directly">
                      Can use API
                    </span>
                  )}
                </div>

                {/* ─── INCLUDED MODELS (IF CONFIGURED) ─── */}
                {p.includedModels && p.includedModels.length > 0 && (
                  <div className={styles.includedModelsBox}>
                    <div className={styles.includedModelsTitle}>
                      Included AI Models
                    </div>
                    <div>
                      {p.includedModels.map((m) => (
                        <span key={m} className={styles.includedModelTag}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link href={p.ctaLink || (p.name === 'Free' ? '/signup' : '/dashboard/billing')} className="btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', marginBottom: 24 }}>
                  {p.cta || (p.name === 'Free' ? 'Start Free' : 'Upgrade Plan')}
                </Link>

                <ul className={styles.list}>
                  {(p.features || []).map((f) => (
                    <li key={f}><Check size={18} strokeWidth={3} color="var(--color-primary)" /> {f}</li>
                  ))}
                </ul>
              </div>
            );
          })}
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