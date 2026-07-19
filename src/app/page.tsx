'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, MessageCircle, RefreshCw, Key, Check, Terminal, Shield, Globe, Code, Cpu, ArrowRight, Star, Users, Clock, TrendingUp, Lock, Layers, Server, ChevronDown, Plus, Minus, BookOpen, GitBranch, Crown, Activity, Rocket, X, CircleCheck, Sparkles, DollarSign, Gauge, Workflow, Plug, Eye } from 'lucide-react';
import styles from './page.module.css';
import ModelsTable from '../components/ModelsTable';
import HeroTerminal from '../components/HeroTerminal';
import { TextRoll } from '../components/core/text-roll';
import { TextLoop } from '../components/core/text-loop';
import BranchFeatures from '../components/BranchFeatures';
import { SpaceButton } from '../components/ui/space-button';
import InstallBox from '../components/InstallBox';
import LaserFlow from '../components/LaserFlow';
import SplashCursor from '../components/SplashCursor';
import AnnouncementBar from '../components/AnnouncementBar';
import { SiteNav } from '../components/site-nav';
import { theme } from '../config/theme';

const faqItems = [
  { q: 'How does CheapModels work?', a: 'CheapModels is a unified AI gateway. You get a single API key that routes requests to OpenAI, Anthropic, Google, Meta, DeepSeek and more through one OpenAI-compatible endpoint.' },
  { q: 'Is there a free tier?', a: 'Yes! Our free tier includes access to basic models and unlimited BYOK (Bring Your Own Key) routing at zero cost. Upgrade only when you need premium model access or higher token limits.' },
  { q: 'What is BYOK (Bring Your Own Key)?', a: 'BYOK lets you add your own provider API keys to our dashboard. You pay providers directly while using our infrastructure for routing, monitoring, and analytics — completely free, no margins added.' },
  { q: 'Is it compatible with the OpenAI SDK?', a: '100% drop-in compatible. Change the baseURL to api.cheapmodels.com/v1 and use your CheapModels key. Streaming, function calling, JSON mode, and tool use all work identically.' },
  { q: 'How secure is the platform?', a: 'Enterprise-grade. SOC 2 compliant infrastructure, AES-256 encrypted key storage, automatic key rotation, zero-knowledge architecture — we never log or store conversation content.' },
  { q: 'What happens when a provider goes down?', a: 'Smart Fallback automatically retries and routes to alternative models you configure. Zero-downtime failover chains ensure your applications stay online even during provider outages.' },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
        { href: '/pricing', label: 'Pricing' },
        { href: '/docs', label: 'API Docs' },
        { href: '/chat', label: 'Chat' },
        { href: '/cli', label: 'CLI' },
      ]} />

      <div className="container">

        {/* ═══════════════ HERO ═══════════════ */}
        <div className={styles.heroBackground}>
          {[...Array(30)].map((_, i) => (
            <div key={i} className={styles.particle} style={{ left: `${Math.random() * 100}%`, width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`, animationDuration: `${Math.random() * 8 + 4}s`, animationDelay: `${Math.random() * 5}s` }} />
          ))}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.7 }}>
            <LaserFlow className="" style={{}} dpr={1} color={theme.colors.primary} wispDensity={2} flowSpeed={0.6} verticalSizing={5} horizontalSizing={1.4} fogIntensity={1} fogScale={0.2} wispSpeed={14} wispIntensity={15} flowStrength={0.4} decay={2.9} horizontalBeamOffset={0.3} verticalBeamOffset={-0.5} />
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
            <SplashCursor key="splash" SIM_RESOLUTION={128} DYE_RESOLUTION={1440} DENSITY_DISSIPATION={3.5} VELOCITY_DISSIPATION={2} PRESSURE={0.1} CURL={3} SPLAT_RADIUS={0.25} SPLAT_FORCE={2500} COLOR_UPDATE_SPEED={10} RAINBOW_MODE={false} COLOR={theme.colors.primary} BACK_COLOR={{ r: 0, g: 0, b: 0 }} />
          </div>
        </div>

        <section className={styles.hero} style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.heroContent}>
            {/* Trust Pill */}
            <div className={styles.heroTrustPill}>
              <span className={styles.trustDot} />
              <span>Trusted by <strong>10,000+</strong> developers worldwide</span>
              <ArrowRight size={14} />
            </div>

            <h1 className={styles.heroTitle}>
              One API for{' '}
              <br />
              <TextLoop style={{ display: 'inline-block' }} interval={3.5} variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20, position: 'absolute' } }} transition={{ duration: 0.3 }}>
                <TextRoll className={styles.gradientText}>Every AI Model</TextRoll>
                <TextRoll className={styles.gradientText}>Half the Cost</TextRoll>
                <TextRoll className={styles.gradientText}>Zero Lock-in</TextRoll>
              </TextLoop>
            </h1>

            <p className={styles.heroSubtitle}>
              A single, OpenAI-compatible API key to access <strong>GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3, DeepSeek, Grok</strong> and 10+ more models. Drop-in replacement — change one line of code.
            </p>

            <div className="item-hints" style={{ display: 'flex', width: '100%', gap: '12px', paddingBottom: '60px', alignItems: 'center' }}>
              <div className="hint" data-position="1" style={{ flex: '1' }}>
                <SpaceButton href="/docs">Try free AI models</SpaceButton>
                <div className="hint-content">Access 100+ premium AI models (GPT-4o, Claude 3.5) with our free tier or BYOK.</div>
              </div>
              <div className="hint" data-position="1" style={{ flex: '1' }}>
                <SpaceButton variant="outline" href="/chat">Try chat</SpaceButton>
                <div className="hint-content">Test and compare all AI models instantly in our interactive Chat Playground.</div>
              </div>
              <div className="hint" data-position="1" style={{ flex: '1' }}>
                <SpaceButton variant="outline" href="/cli">Try cheap CLI</SpaceButton>
                <div className="hint-content">Install the cheap-cli to route API requests securely from your terminal.</div>
              </div>
            </div>

            <div style={{ marginTop: '40px' }}>
              <InstallBox />
            </div>
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
              <span className={styles.providerLogo}><img src="https://cdn.simpleicons.org/openai/10A37F" width="24" height="24" alt="" /> OpenAI</span>
              <span className={styles.providerLogo}><img src="https://cdn.simpleicons.org/anthropic/D97757" width="24" height="24" alt="" /> Anthropic</span>
              <span className={styles.providerLogo}><img src="https://cdn.simpleicons.org/google/4285F4" width="24" height="24" alt="" /> Google</span>
              <span className={styles.providerLogo}><img src="https://cdn.simpleicons.org/meta/0668E1" width="24" height="24" alt="" /> Meta</span>
              <span className={styles.providerLogo}><img src="https://cdn.simpleicons.org/x/000000" width="24" height="24" alt="" /> X.AI</span>
              <span className={styles.providerLogo}><img src="https://logo.clearbit.com/deepseek.com" width="24" height="24" alt="" style={{ borderRadius: '4px' }} /> DeepSeek</span>
              <span className={styles.providerLogo}><img src="https://cdn.simpleicons.org/huggingface/FFD21E" width="24" height="24" alt="" /> HuggingFace</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ═══════════════ SOCIAL PROOF STATS ═══════════════ */}
      <div className="container">
        <div className={styles.statsBar}>
          {[
            { value: '10,000+', label: 'Active Developers', icon: <Users size={20} /> },
            { value: '50M+', label: 'API Calls / Month', icon: <Activity size={20} /> },
            { value: '99.9%', label: 'Uptime SLA', icon: <Gauge size={20} /> },
            { value: '<100ms', label: 'Average Latency', icon: <Clock size={20} /> },
            { value: '15+', label: 'AI Models', icon: <Cpu size={20} /> },
          ].map((s, i) => (
            <div key={i} className={styles.statItem}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="container">

        {/* ═══════════════ MODELS TABLE ═══════════════ */}
        <section id="models" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}><Layers size={14} /> Model Catalog</div>
            <h2 className={styles.sectionTitle}>Every model. One endpoint.</h2>
            <p className={styles.sectionSubtitle}>
              Transparent per-token pricing with no hidden fees. Bring your own key for free routing, or use ours.
            </p>
          </div>
          <ModelsTable />
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}><Rocket size={14} /> Quick Start</div>
            <h2 className={styles.sectionTitle}>Up and running in 2 minutes</h2>
            <p className={styles.sectionSubtitle}>
              No credit card required. No SDK to learn. No architecture changes.
            </p>
          </div>
          <div className={styles.stepsGrid}>
            {[
              { num: '01', title: 'Create your account', desc: 'Sign up in seconds and get your unified API key instantly. Free tier included — no credit card needed.', icon: <Users size={22} /> },
              { num: '02', title: 'Point your code at us', desc: 'Replace one line: change the baseURL in your existing OpenAI SDK. Same streaming, same function calling, zero refactoring.', icon: <Code size={22} /> },
              { num: '03', title: 'Scale across models', desc: 'Switch between GPT-4o, Claude, Gemini, or DeepSeek by changing one parameter. Route traffic globally without switching providers.', icon: <Rocket size={22} /> },
            ].map((s, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span className={styles.stepNum}>{s.num}</span>
                  <div className={styles.stepIconWrap}>{s.icon}</div>
                </div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
                {i < 2 && <div className={styles.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ BRANCH FEATURES ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}><GitBranch size={14} /> Platform</div>
            <h2 className={styles.sectionTitle}>One core engine, four products</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need — CLI, Chat Playground, API Gateway, and Dashboard — all powered by a single core.
            </p>
          </div>
          <BranchFeatures />
        </section>

        {/* ═══════════════ DROP-IN REPLACEMENT ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.apiSplit}>
            <div className={styles.apiText}>
              <div className={styles.sectionBadge}><Code size={14} /> OpenAI Compatible</div>
              <h2 className={styles.apiTitle}>Change one line.<br />Access every model.</h2>
              <p className={styles.apiDesc}>
                No new SDK. No new patterns. CheapModels speaks the exact same OpenAI API protocol, so your existing code works immediately — just point it at our endpoint.
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
              <Link href="/docs" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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
  baseURL: "https://api.cheapmodels.com/v1",
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

        {/* ═══════════════ BEFORE / AFTER ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}><RefreshCw size={14} /> The Difference</div>
            <h2 className={styles.sectionTitle}>Stop managing providers. Start building.</h2>
            <p className={styles.sectionSubtitle}>
              See what changes when you unify your AI infrastructure.
            </p>
          </div>
          <div className={styles.vsGrid}>
            <div className={styles.vsCardBefore}>
              <div className={styles.vsLabel}><X size={16} /> Without CheapModels</div>
              <ul className={styles.vsList}>
                <li><X size={15} /> Separate API key for each provider</li>
                <li><X size={15} /> Different SDKs and response formats</li>
                <li><X size={15} /> Manual retry and fallback logic</li>
                <li><X size={15} /> Scattered usage data across dashboards</li>
                <li><X size={15} /> Vendor lock-in on every integration</li>
                <li><X size={15} /> Multiple billing accounts to manage</li>
              </ul>
            </div>
            <div className={styles.vsCardAfter}>
              <div className={styles.vsLabelGood}><CircleCheck size={16} /> With CheapModels</div>
              <ul className={styles.vsList}>
                <li><Check size={15} /> One key for every AI provider</li>
                <li><Check size={15} /> Same OpenAI SDK, same interface</li>
                <li><Check size={15} /> Built-in retry and smart fallbacks</li>
                <li><Check size={15} /> Unified real-time analytics</li>
                <li><Check size={15} /> Switch models with one parameter</li>
                <li><Check size={15} /> Single consolidated bill</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ═══════════════ SDK SUPPORT ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}><Plug size={14} /> Integrations</div>
            <h2 className={styles.sectionTitle}>Works with your stack</h2>
            <p className={styles.sectionSubtitle}>
              Any language, any framework. If it speaks OpenAI, it speaks CheapModels.
            </p>
          </div>
          <div className={styles.sdkGrid}>
            {[
              { name: 'Node.js', icon: 'https://cdn.simpleicons.org/node.js/339933', cmd: 'npm install openai' },
              { name: 'Python', icon: 'https://cdn.simpleicons.org/python/3776AB', cmd: 'pip install openai' },
              { name: 'Go', icon: 'https://cdn.simpleicons.org/go/00ADD8', cmd: 'go get github.com/sashabaranov/go-openai' },
              { name: 'PHP', icon: 'https://cdn.simpleicons.org/php/777BB4', cmd: 'composer require openai-php/client' },
              { name: 'Ruby', icon: 'https://cdn.simpleicons.org/ruby/CC342D', cmd: 'gem install ruby-openai' },
              { name: 'Rust', icon: 'https://cdn.simpleicons.org/rust/000000', cmd: 'cargo add async-openai' },
            ].map((sdk, i) => (
              <div key={i} className={styles.sdkCard}>
                <img src={sdk.icon} width="32" height="32" alt={sdk.name} style={{ borderRadius: 4 }} />
                <div className={styles.sdkName}>{sdk.name}</div>
                <code className={styles.sdkCmd}>{sdk.cmd}</code>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ FEATURES GRID ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}><Sparkles size={14} /> Features</div>
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

        {/* ═══════════════ PRICING ═══════════════ */}
        <section id="pricing" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}><DollarSign size={14} /> Pricing</div>
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
                  <Link href="/signup" className={plan.featured ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', textAlign: 'center', display: 'block', marginTop: 'auto' }}>{plan.cta}</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ TESTIMONIALS ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}><Star size={14} /> Testimonials</div>
            <h2 className={styles.sectionTitle}>Loved by builders everywhere</h2>
            <p className={styles.sectionSubtitle}>
              From solo developers to enterprise teams — here&apos;s what they say.
            </p>
          </div>
          <div className={styles.testimonialGrid}>
            {[
              { text: 'We replaced 4 separate API integrations with CheapModels in a single afternoon. The unified key and OpenAI-compatible format meant zero refactoring for our team.', name: 'Syed Ali', role: 'Full Stack Developer @ NexaLabs', initials: 'SA', gradient: 'linear-gradient(135deg, #cc0000, #ff6b6b)' },
              { text: 'The BYOK feature alone pays for itself. I manage all my client keys from one dashboard and the real-time analytics give me visibility I never had before.', name: 'Maria Khan', role: 'Founder @ DevStudio', initials: 'MK', gradient: 'linear-gradient(135deg, #4285F4, #60a5fa)' },
              { text: 'We migrated 12 microservices in one day. Streaming works identically to the native OpenAI SDK, latency is under 100ms, and we cut our AI costs by 40%.', name: 'James Okafor', role: 'Lead AI Engineer @ ScaleOps', initials: 'JO', gradient: 'linear-gradient(135deg, #F59E0B, #fbbf24)' },
            ].map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.stars}>{[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#F59E0B" stroke="none" />)}</div>
                <blockquote className={styles.testimonialText}>&ldquo;{t.text}&rdquo;</blockquote>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar} style={{ background: t.gradient }}>{t.initials}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ FAQ ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}><BookOpen size={14} /> FAQ</div>
            <h2 className={styles.sectionTitle}>Common questions</h2>
            <p className={styles.sectionSubtitle}>
              Can&apos;t find what you&apos;re looking for? Reach out to our support team.
            </p>
          </div>
          <div className={styles.faqList}>
            {faqItems.map((item, i) => (
              <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <button className={styles.faqQuestion}>
                  <span>{item.q}</span>
                  {openFaq === i ? <Minus size={18} /> : <Plus size={18} />}
                </button>
                <div className={styles.faqAnswer}>{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ CTA ═══════════════ */}
        <section id="contact" className={styles.section}>
          <div className={styles.ctaBlock}>
            <div className={styles.ctaGlow1} />
            <div className={styles.ctaGlow2} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 className={styles.ctaTitle}>Ready to simplify your AI stack?</h2>
              <p className={styles.ctaDesc}>
                Join 10,000+ developers who replaced a dozen API integrations with one line of code. Free tier available — no credit card required.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/signup" className="btn-primary" style={{ padding: '16px 40px', fontSize: '16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link href="/docs" style={{ padding: '16px 40px', fontSize: '16px', fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  View Documentation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.logo} style={{ fontSize: '22px', marginBottom: '16px' }}>
                <span className={styles.logoIcon}><Zap size={22} fill="currentColor" /></span> CheapModels
              </div>
              <p className={styles.footerDesc}>
                The unified API for every AI model. Build faster, cheaper, and more reliably with one key.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialIcon}><img src="https://cdn.simpleicons.org/github/8b949e" width="18" height="18" alt="GitHub" /></a>
                <a href="#" className={styles.socialIcon}><img src="https://cdn.simpleicons.org/twitter/8b949e" width="18" height="18" alt="Twitter" /></a>
                <a href="#" className={styles.socialIcon}><img src="https://cdn.simpleicons.org/discord/8b949e" width="18" height="18" alt="Discord" /></a>
              </div>
            </div>
            {[
              { title: 'Product', links: [['Models', '#models'], ['Pricing', '#pricing'], ['API Docs', '/docs'], ['Dashboard', '/dashboard'], ['Chat Playground', '/chat']] },
              { title: 'Company', links: [['About', '/docs'], ['Contact Sales', '#contact'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']] },
              { title: 'Developers', links: [['Quick Start', '/docs'], ['CLI Tool', '/cli'], ['Analytics', '/dashboard/analytics'], ['Status', '#']] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className={styles.footerColTitle}>{col.title}</h4>
                <div className={styles.footerLinks}>
                  {col.links.map(([label, href]) => (
                    <Link key={label} href={href}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 CheapModels. All rights reserved.</span>
            <div className={styles.footerRight}>
              <span className={styles.statusBadge}><span className={styles.statusDot} /> All Systems Operational</span>
              <span>v2.4.1</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
