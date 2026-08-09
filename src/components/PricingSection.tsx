'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useSiteSettings } from '@/components/settings-provider';
import styles from './PricingSection.module.css';

export interface PricingSectionProps {
  forceTabId?: string;
  title?: string;
  subtitle?: string;
}

export default function PricingSection({ forceTabId, title, subtitle }: PricingSectionProps) {
  const { settings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState(
    forceTabId || (settings.pricingSection?.tabs || [])[0]?.id || ''
  );

  const displayTitle = title !== undefined ? title : settings.pricingSection?.title;
  const displaySubtitle = subtitle !== undefined ? subtitle : settings.pricingSection?.subtitle;

  const tabs = settings.pricingSection?.tabs || [];
  const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[0];
  const plans = activeTabObj?.plans || [];

  return (
    <section id="pricing" className={styles.pricingSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          {displaySubtitle && <span className={styles.sectionSubtitle}>{displaySubtitle}</span>}
          {displayTitle && <h2 className={styles.sectionTitle}>{displayTitle}</h2>}
        </div>
        
        {!forceTabId && tabs.length > 1 && (
          <div className={styles.tabList}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}

        <div className={styles.pricingGrid}>
          {plans.map((plan) => (
            <div key={plan.id} className={`${styles.priceCard} ${plan.featured ? styles.priceCardFeatured : ''}`}>
              {plan.featured && <div className={styles.popularBadge}>MOST POPULAR</div>}
              <div className={styles.priceCardInner}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planDesc}>{plan.desc}</p>
                <div className={styles.planPrice}>{plan.price}<span>{plan.period}</span></div>
                <ul className={styles.planFeatures}>
                  {plan.features.map(f => (
                    <li key={f}>
                      <Check size={15} strokeWidth={2.5} color="var(--color-success)" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.ctaLink || '#'}
                  prefetch={false}
                  className={plan.featured ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: '100%', textAlign: 'center', display: 'block', marginTop: 'auto' }}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
