'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, MessageCircle, MessageSquare, RefreshCw, Key, Check, Terminal, Shield, Globe, Code, Cpu, ArrowRight, ArrowUpRight, Star, Users, Clock, TrendingUp, Lock, Layers, Server, ChevronDown, Plus, Minus, BookOpen, GitBranch, Crown, Rocket, X, CircleCheck, Sparkles, DollarSign, Workflow, Plug, Eye } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import styles from './page.module.css';
import ModelsTable from '../components/ModelsTable';
import StackSection from '../components/StackSection';
import HeroTerminal from '../components/HeroTerminal';
import { TextRoll } from '../components/core/text-roll';
import { TextLoop } from '../components/core/text-loop';
import BranchFeatures from '../components/BranchFeatures';
import { SpaceButton } from '../components/ui/space-button';
import InstallBox from '../components/InstallBox';
import InstallGrid from '../components/InstallGrid';
import LaserFlow from '../components/LaserFlow';
import SplashCursor from '../components/SplashCursor';
import AnnouncementBar from '../components/AnnouncementBar';
import { SiteNav } from '../components/site-nav';
import { SiteFooter } from '../components/site-footer';
import { theme } from '../config/theme';
import { useSiteSettings } from '@/components/settings-provider';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showDemandToast, setShowDemandToast] = useState(false);
  const [activePricingTab, setActivePricingTab] = useState('tab_cli');
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const { settings } = useSiteSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDemandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDemandToast(true);
    setTimeout(() => setShowDemandToast(false), 3000);
  };

  return (
    <main>
      {/* WhatsApp Floating Button */}

      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="tooltip">
          <div className="tooltip__content"><MessageCircle size={32} /></div>
          <svg className="tooltip__label" viewBox="0 0 100 100">
            <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
            <text><textPath href="#circlePath">Chat with us on WhatsApp • Chat with us on WhatsApp •</textPath></text>
          </svg>
        </a>
      </div>

      <AnnouncementBar />

      <SiteNav links={[
        { href: '/', label: 'Home' },
        { href: '#models', label: 'Models' },
        { href: '#pricing', label: 'Pricing' },
        { href: '/docs', label: 'API Docs' },
        { href: '/cli', label: 'Coding' },
        { href: '/compare', label: 'Compare' },
      ]} />

      <div className="container">

        {/* ═══════════════ HERO ═══════════════ */}
        <div className={styles.heroBackground}>
          {mounted && [...Array(30)].map((_, i) => (
            <div key={i} className={styles.particle} style={{ left: `${Math.random() * 100}%`, width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`, animationDuration: `${Math.random() * 8 + 4}s`, animationDelay: `${Math.random() * 5}s` }} />
          ))}
        </div>

        <section className={styles.hero} style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.heroContent}>


            <h1 className={styles.heroTitle}>
              {/* heroHeading removed — static heading not needed */}
              <TextLoop style={{ display: 'inline-block' }} interval={3.5} transition={{ duration: 0.3 }}>
                {settings.heroAnimatedTexts.map((text, idx) => (
                  <TextRoll key={idx} className={styles.gradientText}>{text}</TextRoll>
                ))}
              </TextLoop>
            </h1>

            <p className={styles.heroSubtitle}>
              <span dangerouslySetInnerHTML={{ __html: settings.heroSubtitle }} />
            </p>

            <div>
              <InstallBox />
            </div>

            <h3 className={styles.heroPromoTitle}>
              {settings.heroPromoText} <span className={styles.heroPromoHighlight}>{settings.heroPromoHighlight}</span>
            </h3>
          </div>

          <div className={styles.heroVisual}>
            <HeroTerminal />
          </div>
        </section>
      </div>

      {/* ═══════════════ PROVIDER MARQUEE ═══════════════ */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeContent}>
          {[...Array(2)].map((_, index) => (
            <React.Fragment key={index}>
              {settings.marqueeProviders.map((mq) => (
                <span key={mq.id} className={styles.providerLogo}>
                  {mq.iconUrl && <img src={mq.iconUrl} width="24" height="24" alt="" style={{ borderRadius: '4px' }} />}
                  {mq.name}
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ═══════════════ PRODUCT CARDS ═══════════════ */}
      <div className="container">
        <InstallGrid />
      </div>

      <div className="container">

        {/* ═══════════════ MODELS TABLE ═══════════════ */}
        <section id="models" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{settings.modelsSection?.title}</h2>
            <p className={styles.sectionSubtitle}>{settings.modelsSection?.subtitle}</p>
          </div>
          <ModelsTable />
        </section>

        {/* ═══════════════ WORKS WITH YOUR STACK ═══════════════ */}
        <section id="integrations" className={styles.section} style={{ paddingTop: '28px', paddingBottom: '72px' }}>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '24px', padding: '48px 32px', background: 'var(--color-card-bg)', boxShadow: 'var(--shadow-sm)' }}>
            <div className={styles.sectionHeader} style={{ marginBottom: '36px' }}>
              <p className={`${styles.sectionSubtitle} ${styles.shimmerSubtitle}`} style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {settings.integrationsSection?.title}
              </p>
            </div>
            <StackSection />
          </div>
        </section>

        {/* ═══════════════ DROP-IN REPLACEMENT ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.apiSplit}>
            <div className={styles.apiText}>
              <h2 className={styles.apiTitle} dangerouslySetInnerHTML={{ __html: settings.featureSplit?.title || '' }} />
              <p className={styles.apiDesc}>{settings.featureSplit?.description}</p>
              <ul className={styles.checkList}>
                {(settings.featureSplit?.checkList || []).map((item, idx) => (
                  <li key={idx}><div className={styles.checkIcon}><Check size={14} /></div>{item}</li>
                ))}
              </ul>
              {settings.featureSplit?.buttonText && settings.featureSplit?.buttonLink && (
                <Link href={settings.featureSplit.buttonLink} prefetch={false} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {settings.featureSplit.buttonText} <ArrowRight size={16} />
                </Link>
              )}
            </div>
            <div className={styles.apiCodeWrap}>
              <div className={styles.codeBlock}>
                <div className={styles.codeBlockHeader}>
                  <div className={styles.codeDots}>
                    <span /><span /><span />
                  </div>
                  <span className={styles.codeFilename}><Terminal size={14} /> app.ts</span>
                </div>
                <pre className={styles.codeBody}>
<code>{settings.featureSplit?.codeSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>


        {/* ═══════════════ PRICING ═══════════════ */}
        <section id="pricing" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{settings.pricingSection?.title}</h2>
            <p className={styles.sectionSubtitle}>{settings.pricingSection?.subtitle}</p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {(settings.pricingSection?.tabs || []).map(tab => (
              <button key={tab.id} onClick={() => setActivePricingTab(tab.id)} style={{ padding: '10px 24px', borderRadius: '30px', border: activePricingTab === tab.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: activePricingTab === tab.id ? 'var(--color-primary-soft)' : 'var(--color-card-bg)', color: activePricingTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-main)', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s ease' }}>
                {tab.name}
              </button>
            ))}
          </div>

          <div className={styles.pricingGrid}>
            {(() => {
              const activeTabObj = (settings.pricingSection?.tabs || []).find(t => t.id === activePricingTab) || (settings.pricingSection?.tabs || [])[0];
              if (!activeTabObj) return null;
              return (activeTabObj.plans || []).map((plan) => (
                <div key={plan.id} className={`${styles.priceCard} ${plan.featured ? styles.priceCardFeatured : ''}`}>
                  {plan.featured && <div className={styles.popularBadge}>MOST POPULAR</div>}
                  <div className={styles.priceCardInner}>
                    <h3 className={styles.planName}>{plan.name}</h3>
                    <p className={styles.planDesc}>{plan.desc}</p>
                    <div className={styles.planPrice}>{plan.price}<span>{plan.period}</span></div>
                    <ul className={styles.planFeatures}>
                      {plan.features.map(f => <li key={f}><Check size={15} strokeWidth={2.5} color="var(--color-success)" />{f}</li>)}
                    </ul>
                    <Link href={plan.ctaLink || '#'} prefetch={false} className={plan.featured ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', textAlign: 'center', display: 'block', marginTop: 'auto' }}>{plan.cta}</Link>
                  </div>
                </div>
              ));
            })()}
          </div>
        </section>
        {/* ═══════════════ BEFORE / AFTER ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} dangerouslySetInnerHTML={{ __html: settings.comparisonSection?.title || '' }} />
            <p className={styles.sectionSubtitle}>{settings.comparisonSection?.subtitle}</p>
          </div>

          <div className={styles.vsWrap}>
            {/* LEFT — Before */}
            <div className={styles.vsPanelBefore}>
              <div className={styles.vsPanelHeader}>
                <div className={styles.vsHeaderIconBad}>
                  <X size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className={styles.vsHeaderLabelBad}>{settings.comparisonSection?.beforeLabel}</div>
                  <div className={styles.vsHeaderSub}>{settings.comparisonSection?.beforeSubLabel}</div>
                </div>
              </div>
              <ul className={styles.vsNewList}>
                {(settings.comparisonSection?.beforePoints || []).map((item) => (
                  <li key={item.id} className={styles.vsNewItemBad}>
                    <div className={styles.vsNewItemIcon}>
                      <X size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <div className={styles.vsNewItemText}>{item.text}</div>
                      <div className={styles.vsNewItemDetail}>{item.detail}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* CENTER DIVIDER */}
            <div className={styles.vsDivider}>
              <div className={styles.vsDividerBadge}>VS</div>
            </div>

            {/* RIGHT — After */}
            <div className={styles.vsPanelAfter}>
              <div className={styles.vsPanelGlow} />
              <div className={styles.vsPanelHeader}>
                <div className={styles.vsHeaderIconGood}>
                  <Check size={20} strokeWidth={3} />
                </div>
                <div>
                  <div className={styles.vsHeaderLabelGood}>{settings.comparisonSection?.afterLabel}</div>
                  <div className={styles.vsHeaderSub}>{settings.comparisonSection?.afterSubLabel}</div>
                </div>
              </div>
              <ul className={styles.vsNewList}>
                {(settings.comparisonSection?.afterPoints || []).map((item) => (
                  <li key={item.id} className={styles.vsNewItemGood}>
                    <div className={styles.vsNewItemIcon}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <div className={styles.vsNewItemText}>{item.text}</div>
                      <div className={styles.vsNewItemDetail}>{item.detail}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>



        {/* ═══════════════ FEATURES GRID ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{settings.featuresGrid?.title}</h2>
            <p className={styles.sectionSubtitle}>{settings.featuresGrid?.subtitle}</p>
          </div>
          <div className={styles.featureGrid}>
            {(settings.featuresGrid?.features || []).map((f) => {
              const IconComp = (LucideIcons as any)[f.icon] || Globe;
              return (
                <div key={f.id} className={styles.featureCard}>
                  <div className={styles.featureIconWrap}><IconComp size={20} /></div>
                  <div>
                    <h3 className={styles.featureTitle}>{f.title}</h3>
                    <p className={styles.featureDesc}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* ═══════════════ FAQ ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{settings.faqSection?.title}</h2>
            <p className={styles.sectionSubtitle}>{settings.faqSection?.subtitle}</p>
          </div>
          <div className={styles.faqList}>
            {settings.faqs.map((item, i) => (
              <div key={item.id} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <button className={styles.faqQuestion}>
                  <span>{item.q}</span>
                  {openFaq === i ? <Minus size={18} /> : <Plus size={18} />}
                </button>
                <div className={styles.faqAnswer}>{item.a}</div>
              </div>
            ))}
          </div>
        </section>
        {/* ═══════════════ DEMAND SECTION (CLEAN PREMIUM) ═══════════════ */}
        <section id="demand" className={styles.section}>
          <div className={styles.demandOuter}>
            <div className={styles.demandBgGlow} />

            <div className={styles.demandWrap}>
              
              {/* LEFT SIDE: Copy & Stats */}
              <div className={styles.demandLeft}>
                
                {/* Item-hints tooltip layout aligned to the left edge */}
                <div className="item-hints" style={{ display: 'block', margin: '10px 0 20px 0', pointerEvents: 'none' }}>
                  <div className="hint" data-position="1" style={{ justifyContent: 'flex-start' }}>
                    <div className="hint-content" style={{ opacity: 1, visibility: 'visible', position: 'relative', top: 0, left: '0px', width: 'auto', maxWidth: '320px', padding: '0 0 38px 0', fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={15} style={{ color: 'var(--color-primary)' }} /> Driven by community
                    </div>
                  </div>
                </div>

                <h2 className={styles.demandTitle}>
                  {settings.demandSection.title}
                </h2>
                
                <p className={styles.demandDesc}>
                  {settings.demandSection.subtitle}
                </p>

                {/* Timeline Feature List */}
                <div className={styles.demandTimeline}>
                  <div className={styles.demandTimelineLabel}>Feature Roadmap</div>
                  <div className={styles.demandTimelineList}>
                    {settings.demandSection.items.map((item, i) => (
                      <div key={item.id} className={styles.demandTimelineItem}>
                        <div className={styles.demandTimelineTrack}>
                          <div className={`${styles.demandTimelineDot} ${styles[`demandDot_${item.badgeColor}`]}`} />
                          {i < settings.demandSection.items.length - 1 && <div className={styles.demandTimelineLine} />}
                        </div>
                        <div className={styles.demandTimelineContent}>
                          <div className={styles.demandTimelineRow}>
                            <span className={styles.demandTimelineText}>{item.text}</span>
                            <span className={`${styles.demandTimelineTag} ${styles[`demandTag_${item.badgeColor}`]}`}>
                              {item.badgeText}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Clean Professional Form */}
              <div className={styles.demandRight}>
                <form className={styles.demandFormCard} onSubmit={handleDemandSubmit}>
                  <div className={styles.demandFormHeader}>
                    <h3 className={styles.demandFormTitle}>Submit Request</h3>
                    <div className={styles.demandFormChips}>
                      <span>Rate Issue</span> • <span>Improvement</span> • <span>Feature</span> • <span>Contact Support</span>
                    </div>
                  </div>

                  <div className={styles.demandFormBody}>
                    <div className={styles.demandFormGroup}>
                      <label className={styles.demandFormLabel}>Email Address</label>
                      <input type="email" required className={styles.demandInput} placeholder="you@example.com" />
                    </div>

                    <div className={styles.demandFormGroup}>
                      <label className={styles.demandFormLabel}>Subject Name</label>
                      <input type="text" required className={styles.demandInput} placeholder="e.g., Add new Claude model" />
                    </div>

                    <div className={styles.demandFormGroup}>
                      <label className={styles.demandFormLabel}>Message Box</label>
                      <textarea 
                        required
                        className={styles.demandTextarea}
                        placeholder="Describe your request..."
                        rows={3}
                      />
                    </div>

                    <button type="submit" className={styles.demandSubmitBtn}>
                      Submit Request
                    </button>

                    <div className={styles.demandFormFooter}>
                      <span className={styles.demandShimmerText}>Founders will review your request soon.</span>
                    </div>
                  </div>
                </form>
              </div>

            </div>

            {/* Toast Notification */}
            {showDemandToast && (
              <div className={styles.demandToast}>
                <Check size={16} color="#22c55e" />
                Your request submitted successfully
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════ CTA ═══════════════ */}
        <section id="contact" className={styles.section} style={{ paddingTop: '60px', paddingBottom: '80px' }}>
          <div className={styles.ctaBlock}>
            {/* Glows */}
            <div className={styles.ctaGlow1} />
            <div className={styles.ctaGlow2} />
            <div className={styles.ctaGlow3} />

            {/* Grid overlay */}
            <div className={styles.ctaGrid} />

            <div className={styles.ctaInner}>


              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px auto' }}>
                <SpaceButton href="/signup" style={{ maxWidth: '440px', width: '100%' }}>
                  <span style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '14px', width: '100%', padding: '12px 10px' }}>
                    Get Started <ArrowRight size={28} strokeWidth={2.5} />
                  </span>
                </SpaceButton>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
