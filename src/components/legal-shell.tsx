'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { SiteNav } from '@/components/site-nav';
import { useSiteSettings } from '@/components/settings-provider';
import styles from './legal-shell.module.css';

export function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  const { settings } = useSiteSettings();

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

      <div className="container">
        <div className={styles.layout}>
          <aside className={styles.side}>
            <h4>Legal</h4>
            <Link href="/privacy" className={title === 'Privacy Policy' ? styles.active : ''}>Privacy Policy</Link>
            <Link href="/terms" className={title === 'Terms of Service' ? styles.active : ''}>Terms of Service</Link>
          </aside>
          <article className={styles.content}>
            <h1>{title}</h1>
            <p className={styles.updated}>Last updated: {updated}</p>
            {children}
          </article>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className="container">
          <span>{settings.footer?.copyrightText || `© ${new Date().getFullYear()} ${settings.brandName || 'CheapRouter'}. All rights reserved.`}</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/">Home</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
