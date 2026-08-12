'use client';
import React from 'react';
import AnnouncementBar from '../../components/AnnouncementBar';
import { SiteNav } from '../../components/site-nav';
import { SiteFooter } from '../../components/site-footer';
import PricingSection from '../../components/PricingSection';
import ModelsTable from '../../components/ModelsTable';

export default function AllModelsPage() {
  return (
    <main>
      <AnnouncementBar />

      <SiteNav links={[
        { href: '/', label: 'Home' },
        { href: '/models', label: 'Models' },
        { href: '#pricing', label: 'Pricing' },
        { href: '/docs', label: 'API Docs' },
        { href: '/cli', label: 'Coding' },
      ]} />

      {/* Page title */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          All Available Models
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
          Browse all models available on this platform, sorted by priority.
        </p>
      </div>

      {/* Full table — no limit */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <ModelsTable />
      </div>

      {/* Pricing section */}
      <div id="pricing" style={{ marginTop: '80px' }}>
        <PricingSection forceTabId="tab_api" />
      </div>

      <SiteFooter />
    </main>
  );
}
