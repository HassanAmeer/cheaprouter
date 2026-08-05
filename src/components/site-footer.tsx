'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useSiteSettings } from '@/components/settings-provider';
import styles from './site-footer.module.css';

export function SiteFooter() {
  const { settings } = useSiteSettings();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.logo} style={{ fontSize: '22px', marginBottom: '16px' }}>
              <span className={styles.logoIcon}>
                {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" style={{ height: 22 }} /> : <Zap size={22} fill="currentColor" />}
              </span> 
              {settings.brandName}
            </div>
            <p className={styles.footerDesc}>
              The unified API for every AI model. Build faster, cheaper, and more reliably with one key.
            </p>
            <div className={styles.socialLinks}>
              {settings.footer.socialLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title={link.platform}>
                  <img src={`https://cdn.simpleicons.org/${link.platform.toLowerCase()}/8b949e`} width="18" height="18" alt={link.platform} onError={(e) => { e.currentTarget.src = "https://cdn.simpleicons.org/internetarchive/8b949e" }} />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Product', links: [['Models', '/#models'], ['Pricing', '/#pricing'], ['API Docs', '/docs'], ['Dashboard', '/dashboard'], ['Chat Playground', '/chat']] },
            { title: 'Company', links: [['About', '/docs'], ['Contact Sales', '/#contact'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']] },
            { title: 'Developers', links: [['Quick Start', '/docs'], ['CLI Tool', '/cli'], ['Status', '#']] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className={styles.footerColTitle}>{col.title}</h4>
              <div className={styles.footerLinks}>
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} prefetch={false}>{label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.footerBottom}>
          <span>{settings.footer.copyrightText}</span>
          <div className={styles.footerRight}>
            <span className={styles.statusBadge}><span className={styles.statusDot} /> All Systems Operational</span>
            <span>v2.4.1</span>
          </div>
        </div>

        {/* Big outlined text + Back to top */}
        <div className={styles.footerHero}>
          <div className={styles.footerBigText} aria-hidden="true">CHEAP</div>
          <button
            className={styles.backToTop}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span>Back to top</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
