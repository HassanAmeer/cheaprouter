'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { SiteNav } from '@/components/site-nav';
import styles from './legal-shell.module.css';

export function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <SiteNav
        links={[
          { href: '/docs', label: 'Docs' },
          { href: '/pricing', label: 'Pricing' },
          { href: '/chat', label: 'Chat' },
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
          <span>© 2026 CheapModels. All rights reserved.</span>
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
