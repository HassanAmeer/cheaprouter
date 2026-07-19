'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, MessageCircle, MessageSquare, RefreshCw, Key, Check, Terminal, Shield, Globe, Code, Cpu, ArrowRight, Star, Users, Clock, TrendingUp, Lock, Layers, Server, ChevronDown, Plus, Minus, BookOpen, GitBranch, Crown, Rocket, X, CircleCheck, Sparkles, DollarSign, Workflow, Plug, Eye } from 'lucide-react';
import styles from './page.module.css';
import ModelsTable from '../components/ModelsTable';
import StackSection from '../components/StackSection';
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
  const [showDemandToast, setShowDemandToast] = useState(false);

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

      {/* ═══════════════ PRODUCT CARDS ═══════════════ */}
      <div className="container">
        <div className={styles.installGrid}>
          {/* Card 1: Try Chat */}
          <div className={styles.installCard}>
            <div className={styles.installCardHeader}>
              <div className={styles.installIcon}><MessageSquare size={20} /></div>
              <h3 className={styles.installTitle}>Try Chat</h3>
              <p className={styles.installDesc}>Compare GPT-4o, Claude 3.5 & more in a real-time playground.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniChat}>
                <div className={styles.miniChatHeader}>
                  <div className={styles.miniDots}><span/><span/><span/></div>
                  <div className={styles.miniUrl}>cheapmodels.io/chat</div>
                </div>
                <div className={styles.miniChatBody}>
                  <div className={styles.chatBubbleUser}>Which model is fastest?</div>
                  <div className={styles.chatBubbleAi}>Comparing 15+ models...</div>
                </div>
                <div className={styles.miniChatInput}>
                  <div className={styles.miniInputField} />
                  <div className={styles.miniSendBtn} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Free Unlimited Coding */}
          <div className={styles.installCard}>
            <div className={styles.installCardHeader}>
              <div className={styles.installIcon}><Terminal size={20} /></div>
              <h3 className={styles.installTitle}>Free Unlimited Coding</h3>
              <p className={styles.installDesc}>Code with AI in your terminal. No usage limits, no credit card.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniTerminal}>
                <div className={styles.miniTermHeader}>
                  <div className={styles.miniDots}><span className={styles.tRed}/><span className={styles.tYellow}/><span className={styles.tGreen}/></div>
                  <span className={styles.miniTermTitle}>~ terminal</span>
                </div>
                <div className={styles.miniTermBody}>
                  <div className={styles.termRow}><span className={styles.termPrompt}>$</span> cheap-cli install</div>
                  <div className={styles.termRowOk}>✔ Installed successfully</div>
                  <div className={styles.termRow}><span className={styles.termPrompt}>$</span> cheap ask "fix this bug"</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Connect by API */}
          <div className={styles.installCard}>
            <div className={styles.installCardHeader}>
              <div className={styles.installIcon}><Code size={20} /></div>
              <h3 className={styles.installTitle}>Connect by API</h3>
              <p className={styles.installDesc}>Drop-in OpenAI replacement. Change one line of code.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniCode}>
                <div className={styles.miniCodeHeader}>
                  <span className={styles.miniTab}>app.ts</span>
                  <span className={styles.miniTabDim}>config.json</span>
                </div>
                <div className={styles.miniCodeBody}>
                  <div><span className={styles.kw}>const</span> ai = <span className={styles.kw}>new</span> OpenAI({'{'}</div>
                  <div>&nbsp;&nbsp;baseURL: <span className={styles.str}>&quot;api.cheapmodels.io&quot;</span>,</div>
                  <div>&nbsp;&nbsp;apiKey: <span className={styles.str}>&quot;cm_***&quot;</span></div>
                  <div>{'}'});</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Earn All AI */}
          <div className={styles.installCard}>
            <div className={styles.installCardHeader}>
              <div className={styles.installIcon}><Zap size={20} /></div>
              <h3 className={styles.installTitle}>Earn All AI</h3>
              <p className={styles.installDesc}>BYOK — bring your own keys, earn tokens on every request.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniDash}>
                <div className={styles.miniDashNav}>
                  <div className={styles.miniDashLogo} />
                  <div className={styles.miniDashAvatar} />
                </div>
                <div className={styles.miniDashBody}>
                  <div className={styles.miniDashSide}>
                    <div className={styles.dashMenuItem} />
                    <div className={styles.dashMenuItem} />
                    <div className={styles.dashMenuItem} />
                  </div>
                  <div className={styles.miniDashContent}>
                    <div className={styles.miniDashStats}>
                      <div className={styles.miniStatCard}><div className={styles.miniStatBar} /></div>
                      <div className={styles.miniStatCard}><div className={styles.miniStatBar} /></div>
                    </div>
                    <div className={styles.miniDashChart}>
                      <div className={styles.miniChartLine} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: CheapCode IDE - Coming Soon */}
          <div className={`${styles.installCard} ${styles.installCardSoon}`}>
            <div className={styles.installCardHeader}>
              <div className={styles.installIcon}><Code size={20} /></div>
              <div className={styles.soonClockIcon}><Clock size={16} /></div>
              <h3 className={styles.installTitle}>CheapCode IDE</h3>
              <p className={styles.installDesc}>AI-powered code editor with inline completions and refactoring.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniCode}>
                <div className={styles.miniCodeHeader}>
                  <span className={styles.miniTab}>main.py</span>
                  <span className={styles.miniTabDim}>utils.py</span>
                </div>
                <div className={styles.miniCodeBody}>
                  <div><span className={styles.kw}>def</span> <span className={styles.fn}>optimize</span>(data):</div>
                  <div>&nbsp;&nbsp;<span className={styles.cm}># AI suggestion...</span></div>
                  <div>&nbsp;&nbsp;<span className={styles.kw}>return</span> result</div>
                </div>
              </div>
            </div>
            <div className={styles.soonBadge}>Coming Soon</div>
          </div>

          {/* Card 6: CheapAgent - Coming Soon */}
          <div className={`${styles.installCard} ${styles.installCardSoon}`}>
            <div className={styles.installCardHeader}>
              <div className={styles.installIcon}><Workflow size={20} /></div>
              <div className={styles.soonClockIcon}><Clock size={16} /></div>
              <h3 className={styles.installTitle}>CheapAgent</h3>
              <p className={styles.installDesc}>Autonomous AI agent that plans, executes, and iterates on tasks.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniTerminal}>
                <div className={styles.miniTermHeader}>
                  <div className={styles.miniDots}><span className={styles.tRed}/><span className={styles.tYellow}/><span className={styles.tGreen}/></div>
                  <span className={styles.miniTermTitle}>agent</span>
                </div>
                <div className={styles.miniTermBody}>
                  <div className={styles.termRow}><span className={styles.termPrompt}>→</span> Analyzing task...</div>
                  <div className={styles.termRowOk}>✔ Plan generated</div>
                  <div className={styles.termRow}><span className={styles.termPrompt}>→</span> Executing step 1/3</div>
                </div>
              </div>
            </div>
            <div className={styles.soonBadge}>Coming Soon</div>
          </div>

          {/* Card 7: Cheap Browser Extension - Coming Soon */}
          <div className={`${styles.installCard} ${styles.installCardSoon}`}>
            <div className={styles.installCardHeader}>
              <div className={styles.installIcon}><Globe size={20} /></div>
              <div className={styles.soonClockIcon}><Clock size={16} /></div>
              <h3 className={styles.installTitle}>Cheap Extension</h3>
              <p className={styles.installDesc}>Browser extension for AI summaries, translations & quick answers.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniChat}>
                <div className={styles.miniChatHeader}>
                  <div className={styles.miniDots}><span/><span/><span/></div>
                  <div className={styles.miniUrl}>chrome.cheapmodels.io</div>
                </div>
                <div className={styles.miniChatBody}>
                  <div className={styles.chatBubbleUser}>Summarize this page</div>
                  <div className={styles.chatBubbleAi}>Key points: 3 articles...</div>
                </div>
                <div className={styles.miniChatInput}>
                  <div className={styles.miniInputField} />
                  <div className={styles.miniSendBtn} />
                </div>
              </div>
            </div>
            <div className={styles.soonBadge}>Coming Soon</div>
          </div>
        </div>
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
        <section className={styles.section} style={{ paddingTop: '28px', paddingBottom: '72px' }}>
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

        {/* ═══════════════ BRANCH FEATURES ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>

            <h2 className={styles.sectionTitle}>One core engine, four products</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need — CLI, Chat Playground, API Gateway, and Dashboard — all powered by a single core.
            </p>
          </div>
          <BranchFeatures />
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
                <div className={styles.vsHeaderIcon} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <X size={18} color="#ef4444" />
                </div>
                <div>
                  <div className={styles.vsHeaderLabel} style={{ color: '#ef4444' }}>Without CheapModels</div>
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
                    <div className={styles.vsNewItemIcon} style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
                      <X size={13} color="#ef4444" strokeWidth={2.5} />
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
              <div className={styles.vsDividerLine} />
              <div className={styles.vsDividerBadge}>
                <div className={styles.vsDividerPulse} />
                <span>VS</span>
              </div>
              <div className={styles.vsDividerLine} />
            </div>

            {/* RIGHT — After */}
            <div className={styles.vsPanelAfter}>
              <div className={styles.vsPanelHeader}>
                <div className={styles.vsHeaderIcon} style={{ background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.30)' }}>
                  <CircleCheck size={18} color="var(--color-primary)" />
                </div>
                <div>
                  <div className={styles.vsHeaderLabel} style={{ color: 'var(--color-primary)' }}>With CheapModels</div>
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
                    <div className={styles.vsNewItemIcon} style={{ background: 'rgba(204,0,0,0.10)', border: '1px solid rgba(204,0,0,0.25)' }}>
                      <Check size={13} color="var(--color-primary)" strokeWidth={2.5} />
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

          {/* BOTTOM STATS BAR */}
          <div className={styles.vsStatsBar}>
            {[
              { value: '70%', label: 'Cost reduction', icon: <DollarSign size={16} /> },
              { value: '1 line', label: 'Code change needed', icon: <Code size={16} /> },
              { value: '<100ms', label: 'Time to first token', icon: <Zap size={16} /> },
              { value: '10+ models', label: 'Accessible instantly', icon: <Layers size={16} /> },
            ].map((stat, i) => (
              <div key={i} className={styles.vsStatItem}>
                <div className={styles.vsStatIcon}>{stat.icon}</div>
                <div className={styles.vsStatValue}>{stat.value}</div>
                <div className={styles.vsStatLabel}>{stat.label}</div>
              </div>
            ))}
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
        {/* ═══════════════ DEMAND SECTION (CLEAN PREMIUM) ═══════════════ */}
        <section className={styles.section}>
          <div className={styles.demandOuter}>
            <div className={styles.demandBgGlow} />

            <div className={styles.demandWrap}>
              
              {/* LEFT SIDE: Copy & Stats */}
              <div className={styles.demandLeft}>
                <div className={styles.demandEyebrow}>
                  <Sparkles size={14} /> Driven by community
                </div>
                
                <h2 className={styles.demandTitle}>
                  You demand it.<br />
                  <span className={styles.demandTitleAccent}>We ship it.</span>
                </h2>
                
                <p className={styles.demandDesc}>
                  Our roadmap is entirely driven by you. Tell us what you need, and we'll prioritize it in our next sprint.
                </p>

                {/* Timeline Feature List */}
                <div className={styles.demandTimeline}>
                  <div className={styles.demandTimelineLabel}>Feature Roadmap</div>
                  <div className={styles.demandTimelineList}>
                    {[
                      { label: 'Free AI models & unlimited access', tag: 'Live', type: 'live' },
                      { label: 'Free coding via cheap-cli', tag: 'Live', type: 'live' },
                      { label: 'Web Browser Agent', tag: 'Coming Soon', type: 'soon' },
                      { label: 'CheapCode IDE', tag: 'Coming Soon', type: 'soon' },
                    ].map((item, i) => (
                      <div key={i} className={styles.demandTimelineItem}>
                        <div className={styles.demandTimelineTrack}>
                          <div className={`${styles.demandTimelineDot} ${styles[`demandDot_${item.type}`]}`} />
                          {i < 3 && <div className={styles.demandTimelineLine} />}
                        </div>
                        <div className={styles.demandTimelineContent}>
                          <div className={styles.demandTimelineRow}>
                            <span className={styles.demandTimelineText}>{item.label}</span>
                            <span className={`${styles.demandTimelineTag} ${styles[`demandTag_${item.type}`]}`}>{item.tag}</span>
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
              {/* Trust pill */}
              <div className={styles.ctaTrustPill}>
                <span className={styles.ctaTrustDot} />
                <span>Trusted by <strong>10,000+</strong> developers worldwide</span>
              </div>

              {/* Headline */}
              <h2 className={styles.ctaTitle}>
                Ready to simplify<br />
                <span className={styles.ctaTitleAccent}>your AI stack?</span>
              </h2>

              <p className={styles.ctaDesc}>
                Replace a dozen API integrations with one line of code.<br />
                Free tier available — no credit card required.
              </p>

              {/* Buttons */}
              <div className={styles.ctaActions}>
                <Link href="/signup" prefetch={false} className={styles.ctaBtnPrimary}>
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link href="/docs" prefetch={false} className={styles.ctaBtnOutline}>
                  View Documentation
                </Link>
              </div>

              {/* Stats row */}
              <div className={styles.ctaStats}>
                {[
                  { value: '10,000+', label: 'Developers' },
                  { value: '15+', label: 'AI Models' },
                  { value: '<100ms', label: 'First Token' },
                  { value: 'SOC 2', label: 'Compliant' },
                ].map((s, i) => (
                  <div key={i} className={styles.ctaStatItem}>
                    <div className={styles.ctaStatValue}>{s.value}</div>
                    <div className={styles.ctaStatLabel}>{s.label}</div>
                  </div>
                ))}
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
                    <Link key={label} href={href} prefetch={false}>{label}</Link>
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
    </main>
  );
}
