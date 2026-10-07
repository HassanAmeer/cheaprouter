'use client';
import React from 'react';
import AnnouncementBar from '../../components/AnnouncementBar';
import { SiteNav } from '../../components/site-nav';
import { SiteFooter } from '../../components/site-footer';
import PricingSection from '../../components/PricingSection';
import ModelsTable from '../../components/ModelsTable';
import styles from './models.module.css';

export default function AllModelsPage() {
  return (
    <main className={styles.page}>
      <AnnouncementBar />

      <SiteNav links={[
        { href: '/', label: 'Home' },
        { href: '/models', label: 'Models' },
        { href: '#pricing', label: 'Pricing' },
        { href: '/docs', label: 'API Docs' },
        { href: '/cli', label: 'Coding' },
      ]} />

      <section className={styles.catalog}>
        <ModelsTable libraryMode />
      </section>

      {/* Pricing section */}
      <div id="pricing" style={{ marginTop: '80px' }}>
        <PricingSection forceTabId="tab_api" />
      </div>

      <SiteFooter />
    </main>
  );
}
