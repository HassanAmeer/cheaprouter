'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/primitives';
import styles from './site-nav.module.css';

interface NavLink {
  href: string;
  label: string;
}

export function SiteNav({ links, cta = true }: { links: NavLink[]; cta?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <Link href="/" className={styles.logo}>
          <span style={{ color: 'var(--color-primary)' }}><Zap size={22} fill="currentColor" /></span> CheapAgents
        </Link>

        <nav className={styles.desktopLinks}>
          {links.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>

        <div className={styles.desktopActions}>
          <ThemeToggle />
          {cta && (
            <>
              <Link href="/login" style={{ fontWeight: 600 }}>Log In</Link>
              <Link href="/signup" className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}>Get Started</Link>
            </>
          )}
        </div>

        <button className={styles.burger} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className={styles.mobileMenu}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          {cta && (
            <div className={styles.mobileActions}>
              <Link href="/login" onClick={() => setOpen(false)}><Button variant="secondary" fullWidth>Log In</Button></Link>
              <Link href="/signup" onClick={() => setOpen(false)}><Button fullWidth>Get Started</Button></Link>
            </div>
          )}
          <div className={styles.mobileTheme}><ThemeToggle /></div>
        </div>
      )}
    </header>
  );
}
