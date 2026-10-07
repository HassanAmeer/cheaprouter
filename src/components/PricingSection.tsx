'use client';
import React from 'react';
import Link from 'next/link';
import { Check, Zap, Terminal, Hammer, MessageSquare, Braces, Sparkles } from 'lucide-react';
import { useSiteSettings } from '@/components/settings-provider';
import { PricingPlan } from '@/lib/api-types';
import styles from './PricingSection.module.css';

export interface PricingSectionProps {
  forceTabId?: string;
  title?: string;
  subtitle?: string;
}

export default function PricingSection({ title, subtitle }: PricingSectionProps) {
  const { settings } = useSiteSettings();

  const displayTitle = title !== undefined ? title : (settings.pricingSection?.title || 'Simple, honest pricing');
  const displaySubtitle = subtitle !== undefined ? subtitle : (settings.pricingSection?.subtitle || 'Transparent per-token plans. Access CLI, IDE Builder, Cheap Chats, and REST APIs with a single subscription.');

  // Use unified plans if available; fall back to first tab's plans if legacy
  const plans: PricingPlan[] = (settings.pricingSection?.plans && settings.pricingSection.plans.length > 0)
    ? settings.pricingSection.plans
    : (settings.pricingSection?.tabs?.[0]?.plans || []);

  return (
    <section id="pricing" className={styles.pricingSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          {displaySubtitle && <span className={styles.sectionSubtitle}>{displaySubtitle}</span>}
          {displayTitle && <h2 className={styles.sectionTitle}>{displayTitle}</h2>}
        </div>

        <div className={styles.pricingGrid}>
          {plans.map((plan) => {
            const tokenText = plan.tokens || (plan.tokensM ? `${plan.tokensM}M Tokens/mo` : (plan.name === 'Free' ? '10M Tokens/mo' : plan.name === 'Pro' ? '100M Tokens/mo' : '500M Tokens/mo'));
            const showCli = plan.canUseCli !== false;
            const showIde = plan.canUseIde !== false;
            const showChat = plan.canUseChat !== false;
            const showApi = plan.canUseApi !== false;

            return (
              <div key={plan.id} className={`${styles.priceCard} ${plan.featured ? styles.priceCardFeatured : ''}`}>
                {plan.featured && <div className={styles.popularBadge}>MOST POPULAR</div>}
                <div className={styles.priceCardInner}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 className={styles.planName}>{plan.name}</h3>
                      <p className={styles.planDesc}>{plan.desc}</p>
                    </div>
                  </div>

                  <div className={styles.tokenBadge}>
                    <Zap size={14} />
                    <span>{tokenText}</span>
                  </div>

                  <div className={styles.planPrice}>
                    {plan.price}<span>{plan.period || ''}</span>
                  </div>

                  {/* ─── PLATFORM CAPABILITIES ─── */}
                  <div className={styles.capabilitiesStrip}>
                    {showCli && (
                      <span className={styles.capabilityChip} title="Can use Cheap CLI and terminal agents">
                        <Terminal size={11} color="var(--color-primary)" /> Can use CLI
                      </span>
                    )}
                    {showIde && (
                      <span className={styles.capabilityChip} title="Can use IDE Builder and code extensions">
                        <Hammer size={11} color="#6366f1" /> Can use IDE
                      </span>
                    )}
                    {showChat && (
                      <span className={styles.capabilityChip} title="Can use Cheap Chats web app">
                        <MessageSquare size={11} color="#10b981" /> Can use Chats
                      </span>
                    )}
                    {showApi && (
                      <span className={styles.capabilityChip} title="Can use REST API directly">
                        <Braces size={11} color="#d97706" /> Can use API
                      </span>
                    )}
                  </div>

                  {/* ─── INCLUDED MODELS (IF CONFIGURED) ─── */}
                  {plan.includedModels && plan.includedModels.length > 0 && (
                    <div className={styles.includedModelsBox}>
                      <div className={styles.includedModelsTitle}>
                        <Sparkles size={11} color="var(--color-primary)" /> Included AI Models
                      </div>
                      <div>
                        {plan.includedModels.map((m) => (
                          <span key={m} className={styles.includedModelTag}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <ul className={styles.planFeatures}>
                    {(plan.features || []).map((f) => (
                      <li key={f}>
                        <Check size={15} strokeWidth={2.5} color="var(--color-success)" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.ctaLink || (plan.name === 'Free' ? '/signup' : '/dashboard/billing')}
                    prefetch={false}
                    className={plan.featured ? 'btn-primary' : 'btn-secondary'}
                    style={{ width: '100%', textAlign: 'center', display: 'block', marginTop: 'auto' }}
                  >
                    {plan.cta || (plan.name === 'Free' ? 'Start Free' : 'Upgrade Plan')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
