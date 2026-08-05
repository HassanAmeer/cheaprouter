'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, MessageCircle, MessageSquare, RefreshCw, Key, Check, Terminal, Shield, Globe, Code, Cpu, ArrowRight, ArrowUpRight, Star, Users, Clock, TrendingUp, Lock, Layers, Server, ChevronDown, Plus, Minus, BookOpen, GitBranch, Crown, Rocket, X, CircleCheck, Sparkles, DollarSign, Workflow, Plug, Eye } from 'lucide-react';
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
        { href: '/chat', label: 'Chat' },
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
              {settings.heroHeading && (
                <>
                  {settings.heroHeading}
                  <br />
                </>
              )}
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
              Buy Just for <span className={styles.heroPromoHighlight}>$2 USD / month</span>
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

            <h2 className={styles.sectionTitle}>Every model. One endpoint.</h2>
            <p className={styles.sectionSubtitle}>
              Transparent per-token pricing with no hidden fees. Bring your own key for free routing, or use ours.
            </p>
          </div>
          <ModelsTable />
        </section>

        {/* ═══════════════ WORKS WITH YOUR STACK ═══════════════ */}
        <section id="integrations" className={styles.section} style={{ paddingTop: '28px', paddingBottom: '72px' }}>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '24px', padding: '48px 32px', background: 'var(--color-card-bg)', boxShadow: 'var(--shadow-sm)' }}>
            <div className={styles.sectionHeader} style={{ marginBottom: '36px' }}>
              <p className={`${styles.sectionSubtitle} ${styles.shimmerSubtitle}`} style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Connect with APIs
              </p>
            </div>
            <StackSection />
          </div>
        </section>

        {/* ═══════════════ DROP-IN REPLACEMENT ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.apiSplit}>
            <div className={styles.apiText}>

              <h2 className={styles.apiTitle}>Change one line.<br />Access every model.</h2>
              <p className={styles.apiDesc}>
                No new SDK. No new patterns. CheapAgents speaks the exact same OpenAI API protocol, so your existing code works immediately — just point it at our endpoint.
              </p>
              <ul className={styles.checkList}>
                {[
                  'SSE streaming — first token in <100ms',
                  'Function calling & tool use, out of the box',
                  'JSON mode & structured outputs',
                  'Automatic retry with smart fallback chains',
                  'Per-model rate limiting & usage tracking',
                ].map((item) => (
                  <li key={item}><div className={styles.checkIcon}><Check size={14} /></div>{item}</li>
                ))}
              </ul>
              <Link href="/docs" prefetch={false} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Read the API Docs <ArrowRight size={16} />
              </Link>
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
<code>{`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "cm-xxxxxxxxxxxx",
  baseURL: "https://api.cheapagents.com/v1",
});

const response = await client.chat.completions.create({
  model: "claude-3-5-sonnet",
  messages: [
    { role: "user", content: "Hello!" }
  ],
  stream: true,
});`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>


        {/* ═══════════════ PRICING ═══════════════ */}
        <section id="pricing" className={styles.section}>
          <div className={styles.sectionHeader}>

            <h2 className={styles.sectionTitle}>Simple, honest pricing</h2>
            <p className={styles.sectionSubtitle}>
              No surprise bills. No hidden token markups. Start free, pay as you grow.
            </p>
          </div>
          <div className={styles.pricingGrid}>
            {[
              { name: 'Free', price: '$0', period: '', desc: 'For experimenting and personal projects', features: ['Basic & open-source models', 'Unlimited BYOK routing', 'Community support', 'Dashboard & analytics', '100 requests/day'], cta: 'Start Free', featured: false },
              { name: 'Starter', price: '$2', period: '/mo', desc: 'For indie hackers and side projects', features: ['All basic + mid-tier models', '500K tokens included', 'Priority email support', 'Higher rate limits', 'Custom API keys'], cta: 'Get Started', featured: false },
              { name: 'Pro', price: '$15', period: '/mo', desc: 'For teams and production apps', features: ['All premium models included', '1M tokens included', 'GPT-4o, Claude 3.5, Grok', 'Highest rate limits', 'Dedicated support', 'Team collaboration'], cta: 'Upgrade to Pro', featured: true },
            ].map((plan, i) => (
              <div key={i} className={`${styles.priceCard} ${plan.featured ? styles.priceCardFeatured : ''}`}>
                {plan.featured && <div className={styles.popularBadge}>MOST POPULAR</div>}
                <div className={styles.priceCardInner}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planDesc}>{plan.desc}</p>
                  <div className={styles.planPrice}>{plan.price}<span>{plan.period}</span></div>
                  <ul className={styles.planFeatures}>
                    {plan.features.map(f => <li key={f}><Check size={15} strokeWidth={2.5} color="var(--color-success)" />{f}</li>)}
                  </ul>
                  <Link href="/signup" prefetch={false} className={plan.featured ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', textAlign: 'center', display: 'block', marginTop: 'auto' }}>{plan.cta}</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* ═══════════════ BEFORE / AFTER ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>

            <h2 className={styles.sectionTitle}>Stop managing providers.<br /><span className={styles.gradientText}>Start building.</span></h2>
            <p className={styles.sectionSubtitle}>
              See what changes when you unify your AI infrastructure.
            </p>
          </div>

          <div className={styles.vsWrap}>
            {/* LEFT — Before */}
            <div className={styles.vsPanelBefore}>
              <div className={styles.vsPanelHeader}>
                <div className={styles.vsHeaderIconBad}>
                  <X size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className={styles.vsHeaderLabelBad}>Without CheapAgents</div>
                  <div className={styles.vsHeaderSub}>The painful way</div>
                </div>
              </div>
              <ul className={styles.vsNewList}>
                {[
                  { text: 'Separate API key for each provider', detail: 'OpenAI, Anthropic, Google, Meta…' },
                  { text: 'Different SDKs and response formats', detail: 'Rewrite code for every model switch' },
                  { text: 'Manual retry and fallback logic', detail: 'Hours of engineering per provider' },
                  { text: 'Scattered usage data across dashboards', detail: 'No unified cost visibility' },
                  { text: 'Vendor lock-in on every integration', detail: 'Switching costs you weeks' },
                  { text: 'Multiple billing accounts to manage', detail: 'Finance team nightmare' },
                ].map((item, i) => (
                  <li key={i} className={styles.vsNewItemBad}>
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
                  <div className={styles.vsHeaderLabelGood}>With CheapAgents</div>
                  <div className={styles.vsHeaderSub}>The smart way</div>
                </div>
              </div>
              <ul className={styles.vsNewList}>
                {[
                  { text: 'One key for every AI provider', detail: 'All models, one credential' },
                  { text: 'Same OpenAI SDK, same interface', detail: 'Change one line, zero refactoring' },
                  { text: 'Built-in retry and smart fallbacks', detail: 'Automatic zero-downtime routing' },
                  { text: 'Unified real-time analytics', detail: 'Cost, latency & tokens in one view' },
                  { text: 'Switch models with one parameter', detail: 'GPT → Claude → Gemini instantly' },
                  { text: 'Single consolidated bill', detail: 'One invoice, full transparency' },
                ].map((item, i) => (
                  <li key={i} className={styles.vsNewItemGood}>
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

            <h2 className={styles.sectionTitle}>Built for production</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to ship AI features — from prototype to planet-scale.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {[
              { icon: <RefreshCw size={20} />, title: 'Unified API', desc: 'Same OpenAI SDK format. Change one URL, access every model on the market.' },
              { icon: <Zap size={20} />, title: 'Real-time Streaming', desc: 'Native SSE streaming piped directly from provider to your users, <100ms to first token.' },
              { icon: <Key size={20} />, title: 'Bring Your Own Key', desc: 'Add your provider keys for free routing. Zero margins, zero limits on your own keys.' },
              { icon: <Shield size={20} />, title: 'Enterprise Security', desc: 'SOC 2 compliant, AES-256 encrypted key vault, automatic rotation, zero-knowledge architecture.' },
              { icon: <Globe size={20} />, title: 'Global Edge Routing', desc: 'Requests served from the nearest edge node for consistently low latency worldwide.' },
              { icon: <Layers size={20} />, title: 'Smart Fallbacks', desc: 'Automatic failover chains. If one provider is down, traffic routes to your next best model.' },
              { icon: <Eye size={20} />, title: 'Live Analytics', desc: 'Real-time dashboards tracking tokens, cost, latency, and errors per model and per user.' },
              { icon: <DollarSign size={20} />, title: 'Cost Optimization', desc: 'Automatic model suggestions based on cost/performance. Save up to 70% vs direct provider pricing.' },
              { icon: <Workflow size={20} />, title: 'Rate Limiting', desc: 'Fine-grained per-model, per-user rate limits. Set budgets and caps at the API key level.' },
            ].map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIconWrap}>{f.icon}</div>
                <div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ═══════════════ FAQ ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>

            <h2 className={styles.sectionTitle}>Common questions</h2>
            <p className={styles.sectionSubtitle}>
              Can&apos;t find what you&apos;re looking for? Reach out to our support team.
            </p>
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
