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
import PricingSection from '../components/PricingSection';
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
        { href: '/models', label: 'Models' },
        { href: '#pricing', label: 'Pricing' },
        { href: '/docs', label: 'API Docs' },
        { href: '/cli', label: 'Coding' },
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

        {/* ═══════════════ MODELS TABLE ═══════════════ */}
        <section id="models" className={`container ${styles.section}`}>
          <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', textAlign: 'left' }}>
            <div>
              <h2 className={styles.sectionTitle}>{settings.modelsSection?.title}</h2>
              <p className={styles.sectionSubtitle} style={{ margin: 0 }}>{settings.modelsSection?.subtitle}</p>
            </div>
            <Link href="/models" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary, #ef4444)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', padding: '8px 16px', border: '1px solid var(--color-primary, #ef4444)', borderRadius: '8px', transition: 'background 0.15s, color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-primary, #ef4444)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-primary, #ef4444)'; }}
            >
              View All Models <ArrowRight size={14} />
            </Link>
          </div>
          <ModelsTable limit={15} />
        </section>


        {/* ═══════════════ WORKS WITH YOUR STACK ═══════════════ */}
        <StackSection title={settings.integrationsSection?.title} subtitle="Integrations" />

        {/* ═══════════════ SPLIT FEATURE ═══════════════ */}
        <section className={`container ${styles.section}`}>
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
        <PricingSection />
        {/* ═══════════════ BEFORE / AFTER ═══════════════ */}
        <section className={`container ${styles.section}`}>
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
        <section className={`container ${styles.section}`}>
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
        <section className={`container ${styles.section}`}>
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
        <section id="demand" className={`container ${styles.section}`}>
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
        <section id="contact" className={`container ${styles.section}`} style={{ paddingTop: '60px', paddingBottom: '80px' }}>
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

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
