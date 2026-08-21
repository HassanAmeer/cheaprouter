'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Menu, X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';
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

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close the menu when the viewport grows into desktop layout.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    const handler = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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

        <div className={styles.iconGroup}>
          <ThemeToggle />
          <button className={styles.burger} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open} aria-controls="mobile-nav">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.mobileAccent} />
            <div className={styles.mobileInner}>
              <div className={styles.mobileEyebrow}>
                <span className={styles.mobileSlash}>~/</span>
                <span>Menu</span>
              </div>

              <nav className={styles.mobileLinks}>
                {links.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={styles.mobileLink}>
                    <span className={styles.mobileLinkLabel}>{l.label}</span>
                    <ArrowRight size={16} className={styles.mobileLinkArrow} />
                  </Link>
                ))}
              </nav>

              {cta && (
                <>
                  <div className={styles.mobileDivider} />
                  <div className={styles.mobileActions}>
                    <SpaceButton 
                      variant="nav-outline" 
                      href="/login" 
                      onClick={() => setOpen(false)}
                      style={{ height: '44px', width: '100%' }}
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
                      style={{ height: '44px', width: '100%' }}
                    >
                      Ask Founder
                    </SpaceButton>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
