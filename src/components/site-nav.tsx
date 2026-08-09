'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/primitives';
import { SpaceButton } from '@/components/ui/space-button';
import { useSiteSettings } from '@/components/settings-provider';
import styles from './site-nav.module.css';

interface NavLink {
  href: string;
  label: string;
}

export function SiteNav({ links = [], cta = true }: { links?: NavLink[]; cta?: boolean }) {
  const [open, setOpen] = useState(false);
  const { settings } = useSiteSettings();

  const handleAskFounderClick = (e?: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      const elem = document.getElementById('demand');
      if (elem) {
        if (e) e.preventDefault();
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={styles.header}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <Link href="/" className={styles.logo}>
          <span style={{ color: 'var(--color-primary)' }}>
            {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" style={{ height: 22 }} /> : <Zap size={22} fill="currentColor" />}
          </span> 
          {settings.brandName}
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
              <SpaceButton 
                variant="nav-outline" 
                href="/login" 
                style={{ height: '36px', width: 'auto', minWidth: '90px' }}
              >
                Log In
              </SpaceButton>
              <SpaceButton 
                variant="nav-outline" 
                href="/#demand" 
                onClick={handleAskFounderClick}
                style={{ height: '36px', width: 'auto', minWidth: '125px' }}
              >
                Ask Founder
              </SpaceButton>
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
              <SpaceButton 
                variant="nav-outline" 
                href="/login" 
                onClick={() => setOpen(false)}
                style={{ height: '42px', width: '100%' }}
              >
                Log In
              </SpaceButton>
              <SpaceButton 
                variant="nav-outline" 
                href="/#demand" 
                onClick={(e) => {
                  setOpen(false);
                  handleAskFounderClick(e);
                }}
                style={{ height: '42px', width: '100%' }}
              >
                Ask Founder
              </SpaceButton>
            </div>
          )}
          <div className={styles.mobileTheme}><ThemeToggle /></div>
        </div>
      )}
    </header>
  );
}
