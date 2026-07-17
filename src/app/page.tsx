import React from 'react';
import Link from 'next/link';
import { Zap, MessageCircle, RefreshCw, Key, Check, Terminal } from 'lucide-react';
import styles from './page.module.css';
import ModelsTable from '../components/ModelsTable';
import HeroTerminal from '../components/HeroTerminal';
import { TextRoll } from '../components/core/text-roll';
import { TextLoop } from '../components/core/text-loop';
import { PixelatedCanvasDemo } from '../components/PixelatedCanvasDemo';
import BranchFeatures from '../components/BranchFeatures';

export default function Home() {
  const models = [
    { provider: 'OpenAI', providerColor: '#10A37F', icon: 'https://cdn.simpleicons.org/openai/10A37F', model: 'GPT-4o', inputToken: '$5.00 / 1M', outputToken: '$15.00 / 1M', type: 'Premium', badgeClass: '' },
    { provider: 'OpenAI', providerColor: '#10A37F', icon: 'https://cdn.simpleicons.org/openai/10A37F', model: 'GPT-4 Turbo', inputToken: '$10.00 / 1M', outputToken: '$30.00 / 1M', type: 'Premium', badgeClass: '' },
    { provider: 'OpenAI', providerColor: '#10A37F', icon: 'https://cdn.simpleicons.org/openai/10A37F', model: 'GPT-4o Mini', inputToken: '$0.15 / 1M', outputToken: '$0.60 / 1M', type: 'Cheap Rate', badgeClass: styles.badgeCheap },
    { provider: 'Anthropic', providerColor: '#D97757', icon: 'https://cdn.simpleicons.org/anthropic/D97757', model: 'Claude 3.5 Sonnet', inputToken: '$3.00 / 1M', outputToken: '$15.00 / 1M', type: 'Premium', badgeClass: '' },
    { provider: 'Anthropic', providerColor: '#D97757', icon: 'https://cdn.simpleicons.org/anthropic/D97757', model: 'Claude 3 Opus', inputToken: '$15.00 / 1M', outputToken: '$75.00 / 1M', type: 'Premium', badgeClass: '' },
    { provider: 'Anthropic', providerColor: '#D97757', icon: 'https://cdn.simpleicons.org/anthropic/D97757', model: 'Claude 3 Haiku', inputToken: '$0.25 / 1M', outputToken: '$1.25 / 1M', type: 'Cheap Rate', badgeClass: styles.badgeCheap },
    { provider: 'Google', providerColor: '#4285F4', icon: 'https://cdn.simpleicons.org/google/4285F4', model: 'Gemini 1.5 Pro', inputToken: '$3.50 / 1M', outputToken: '$10.50 / 1M', type: 'Premium', badgeClass: '' },
    { provider: 'Google', providerColor: '#4285F4', icon: 'https://cdn.simpleicons.org/google/4285F4', model: 'Gemini 1.5 Flash', inputToken: '$0.075 / 1M', outputToken: '$0.30 / 1M', type: 'Free (Limited)', badgeClass: styles.badgeFree },
    { provider: 'Meta', providerColor: '#0668E1', icon: 'https://cdn.simpleicons.org/meta/0668E1', model: 'Llama 3.1 405B', inputToken: '$2.00 / 1M', outputToken: '$2.00 / 1M', type: 'Premium', badgeClass: '' },
    { provider: 'Meta', providerColor: '#0668E1', icon: 'https://cdn.simpleicons.org/meta/0668E1', model: 'Llama 3 70B', inputToken: '$0.50 / 1M', outputToken: '$0.50 / 1M', type: 'Free', badgeClass: styles.badgeFree },
    { provider: 'Meta', providerColor: '#0668E1', icon: 'https://cdn.simpleicons.org/meta/0668E1', model: 'Llama 3 8B', inputToken: '$0.05 / 1M', outputToken: '$0.05 / 1M', type: 'Free', badgeClass: styles.badgeFree },
    { provider: 'DeepSeek', providerColor: '#1A53E8', icon: 'https://logo.clearbit.com/deepseek.com', model: 'DeepSeek Coder V2', inputToken: '$0.14 / 1M', outputToken: '$0.28 / 1M', type: 'Cheap Rate', badgeClass: styles.badgeCheap },
    { provider: 'DeepSeek', providerColor: '#1A53E8', icon: 'https://logo.clearbit.com/deepseek.com', model: 'DeepSeek Chat', inputToken: '$0.14 / 1M', outputToken: '$0.28 / 1M', type: 'Cheap Rate', badgeClass: styles.badgeCheap },
    { provider: 'X.AI', providerColor: '#000000', icon: 'https://cdn.simpleicons.org/x/000000', model: 'Grok 1.5', inputToken: '$5.00 / 1M', outputToken: '$15.00 / 1M', type: 'Premium', badgeClass: '' },
    { provider: 'Mistral', providerColor: '#F54E42', icon: 'https://logo.clearbit.com/mistral.ai', model: 'Mistral Large', inputToken: '$4.00 / 1M', outputToken: '$12.00 / 1M', type: 'Premium', badgeClass: '' },
  ];

  return (
    <main>
      {/* WhatsApp Floating Action Button with Animated Tooltip */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="tooltip">
          <div className="tooltip__content">
            <MessageCircle size={32} />
          </div>
          <svg className="tooltip__label" viewBox="0 0 100 100">
            <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
            <text>
              <textPath href="#circlePath">
                Chat with us on WhatsApp • Chat with us on WhatsApp •
              </textPath>
            </text>
          </svg>
        </a>
      </div>

      {/* Announcement Bar */}
      <div className={styles.announcementBar}>
        <span className={styles.announcementBadge}>New</span>
        DeepSeek Coder V2 & Llama 3.1 405B are now available! 🎉
      </div>

      <div className="container">
        {/* Navbar */}
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}><Zap size={28} fill="currentColor" /></span>
            <TextRoll transition={{ ease: 'easeInOut', repeat: Infinity, repeatDelay: 5 }}>CheapModels</TextRoll>
          </div>
          <div className={styles.navLinks}>
            <Link href="/">Home</Link>
            <Link href="#models">Models</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="/docs">API Docs</Link>
          </div>
          <div className={styles.authGroup}>
            <Link href="/login" style={{ fontWeight: 600 }}>Log In</Link>
            <Link href="/signup" className="btn-primary">Get Started</Link>
          </div>
        </nav>

        {/* Hero Section with Particles and Static Waves */}
        <div className={styles.heroBackground}>
          {/* Falling Particles */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={styles.particle}
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDuration: `${Math.random() * 8 + 4}s`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}

          <div className={styles.heroWaves}>
            {/* Horizontal Wavy Path 1 (Bottom aligned, Static) */}
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ fill: 'var(--color-bg-soft)', stroke: 'rgba(204,0,0,0.2)', strokeWidth: '1px' }}>
              <path d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 C1350,120 1550,0 1800,60 C2050,120 2250,0 2400,60 L2400,120 L0,120 Z" />
            </svg>
          </div>
        </div>

        <section className={styles.hero}>
          <div style={{ flex: '0 0 40%', maxWidth: '40%' }}>
            <h1 className={styles.heroTitle}>
              All AI Models At <br />
              <TextLoop
                style={{ color: 'var(--color-primary)' }}
                interval={3.5}
                variants={{
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0, position: 'absolute' },
                }}
                transition={{ duration: 0.1 }}
              >
                <TextRoll>Cheap Rate.</TextRoll>
                <TextRoll>High Speed.</TextRoll>
                <TextRoll>Top Quality.</TextRoll>
                <TextRoll>One API Key.</TextRoll>
              </TextLoop>
            </h1>
            <p className={styles.heroSubtitle}>
              From Basic to Highly Capable Models.<br />
              Access <strong style={{ color: '#aaaaaa' }}>ChatGPT 5.6, Claude Code, Fable, Grok, DeepSeek V4 Flash, Skana, GLM 5.2, Qwen 3.7</strong> and more.<br />
              These models are available at unbeatable cheap rates or even for free!
            </p>
            <div className="item-hints" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              
              <div className="hint" data-position="1">
                <Link href="/models" className="btn-primary shimmer-btn" style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '30px' }}>Try free AI models</Link>
                <div className="hint-content">
                  Access 100+ premium AI models (GPT-4o, Claude 3.5) with our free tier or BYOK.
                </div>
              </div>

              <div className="hint" data-position="1">
                <Link href="/cli" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '30px', background: 'transparent' }}>Try free code CLI</Link>
                <div className="hint-content">
                  Install the cheap-cli to route API requests securely from your terminal.
                </div>
              </div>

              <div className="hint" data-position="1">
                <Link href="/chat" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '30px', background: 'transparent' }}>Start chat</Link>
                <div className="hint-content">
                  Test and compare all AI models instantly in our interactive Chat Playground.
                </div>
              </div>

              <div className="hint" data-position="1">
                <Link href="/docs" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '30px', background: 'transparent' }}>Connect by API</Link>
                <div className="hint-content">
                  Drop-in replacement for OpenAI SDK. Just change baseURL and API key.
                </div>
              </div>

            </div>
          </div>
          <div style={{ flex: '0 0 55%', maxWidth: '55%', display: 'flex', justifyContent: 'center' }}>
            <HeroTerminal />
          </div>
        </section>
      </div>

      {/* Marquee Providers Line */}
      <div className={styles.marqueeContainer} style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div className={styles.marqueeContent}>
          {[...Array(2)].map((_, index) => (
            <React.Fragment key={index}>
              <span className={styles.providerLogo}><img src="https://cdn.simpleicons.org/openai/10A37F" width="24" height="24" alt="OpenAI" /> OpenAI</span>
              <span className={styles.providerLogo}><img src="https://cdn.simpleicons.org/anthropic/D97757" width="24" height="24" alt="Anthropic" /> Anthropic</span>
              <span className={styles.providerLogo}><img src="https://cdn.simpleicons.org/google/4285F4" width="24" height="24" alt="Google" /> Google</span>
              <span className={styles.providerLogo}><img src="https://cdn.simpleicons.org/meta/0668E1" width="24" height="24" alt="Meta" /> Meta</span>
              <span className={styles.providerLogo}><img src="https://cdn.simpleicons.org/x/000000" width="24" height="24" alt="X.AI" /> X.AI</span>
              <span className={styles.providerLogo}><img src="https://logo.clearbit.com/deepseek.com" width="24" height="24" alt="DeepSeek" style={{ borderRadius: '4px' }} /> DeepSeek</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="container">

        {/* Models Table Section (Moved up) */}
        <section id="models" className={styles.section}>
          <h2 className={styles.sectionTitle}>Models We Support</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '18px', maxWidth: '700px', margin: '0 auto 40px' }}>
            Transparent pricing per million tokens. Pay as you go, or Bring Your Own Key (BYOK) for free routing.
          </p>
          <ModelsTable />
        </section>

        {/* Branch Flow Section */}
        <section className={styles.section} style={{ paddingTop: '20px' }}>
          <h2 className={styles.sectionTitle}>One Core, Many Features</h2>
          <BranchFeatures />
        </section>

        {/* API / Code Snippet Section (Split Layout) */}
        <section className={styles.section} style={{ paddingTop: '0' }}>
          <div className={styles.apiSplitSection}>
            <div className={styles.apiContent}>
              <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>Drop-in Replacement for OpenAI</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', lineHeight: '1.6', marginBottom: '24px' }}>
                No need to learn a new SDK or change your entire architecture. Just change the base URL and API key, and you're immediately ready to route traffic to Anthropic, Google, Meta, or DeepSeek models using the exact same code you already wrote.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}><Check color="var(--color-primary)" /> Native Streaming Support (SSE)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}><Check color="var(--color-primary)" /> Function Calling Works Out of the Box</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}><Check color="var(--color-primary)" /> JSON Mode Fully Supported</li>
              </ul>
              <Link href="/docs" className="btn-primary" style={{ display: 'inline-block', marginTop: '32px' }}>View Full API Docs</Link>
            </div>

            <div className={`${styles.codeSection} ${styles.apiTerminal}`}>
              <div className={styles.codeHeader}>
                <Terminal size={20} />
                <span>index.js</span>
              </div>
              <pre style={{ margin: 0, fontSize: '14px' }}>
                <code>
                  <span style={{ color: '#FF7B72' }}>import</span> OpenAI <span style={{ color: '#FF7B72' }}>from</span> <span style={{ color: '#A5D6FF' }}>"openai"</span>;<br /><br />
                  <span style={{ color: '#FF7B72' }}>const</span> client = <span style={{ color: '#FF7B72' }}>new</span> OpenAI(&#123;<br />
                  &nbsp;&nbsp;apiKey: <span style={{ color: '#A5D6FF' }}>"YOUR_CHEAPMODELS_API_KEY"</span>,<br />
                  &nbsp;&nbsp;baseURL: <span style={{ color: '#A5D6FF' }}>"https://api.cheapmodels.com/v1"</span>, <span style={{ color: '#8b949e' }}>// Just change this!</span><br />
                  &#125;);<br /><br />
                  <span style={{ color: '#FF7B72' }}>const</span> response = <span style={{ color: '#FF7B72' }}>await</span> client.chat.completions.create(&#123;<br />
                  &nbsp;&nbsp;model: <span style={{ color: '#A5D6FF' }}>"claude-3-5-sonnet"</span>, <span style={{ color: '#8b949e' }}>// Or gemini-1.5-pro, llama-3-70b...</span><br />
                  &nbsp;&nbsp;messages: [&#123; role: <span style={{ color: '#A5D6FF' }}>"user"</span>, content: <span style={{ color: '#A5D6FF' }}>"Hello World!"</span> &#125;],<br />
                  &#125;);
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className={styles.section} style={{ paddingTop: '0' }}>
          <h2 className={styles.sectionTitle}>Transparent Pricing</h2>
          <div className={styles.grid3} style={{ justifyContent: 'center' }}>
            {/* Plan 1: Free */}
            <div className={`card ${styles.pricingCard}`}>
              <h3 className={styles.featureTitle}>Free</h3>
              <p className={styles.featureDesc}>Get started with no commitment.</p>
              <div className={styles.price}>Free</div>
              <ul className={styles.pricingList}>
                <li><span style={{ color: 'var(--color-primary)' }}><Check size={18} strokeWidth={3} /></span> Some basic AI models are free</li>
                <li><span style={{ color: 'var(--color-primary)' }}><Check size={18} strokeWidth={3} /></span> You can see details in the table</li>
                <li><span style={{ color: 'var(--color-primary)' }}><Check size={18} strokeWidth={3} /></span> Bring Your Own Key (BYOK)</li>
              </ul>
              <Link href="/signup" className="btn-secondary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>Get Started</Link>
            </div>

            {/* Plan 2: $2/mo */}
            <div className={`card ${styles.pricingCard}`}>
              <h3 className={styles.featureTitle}>Starter</h3>
              <p className={styles.featureDesc}>Perfect for testing and small projects.</p>
              <div className={styles.price}>$2<span>/mo</span></div>
              <ul className={styles.pricingList}>
                <li><span style={{ color: 'var(--color-primary)' }}><Check size={18} strokeWidth={3} /></span> Basic AI models access</li>
                <li><span style={{ color: 'var(--color-primary)' }}><Check size={18} strokeWidth={3} /></span> Priority support</li>
                <li><span style={{ color: 'var(--color-primary)' }}><Check size={18} strokeWidth={3} /></span> Enhanced Rate Limits</li>
              </ul>
              <Link href="/signup" className="btn-secondary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>Subscribe</Link>
            </div>

            {/* Plan 3: $15/mo */}
            <div className={`card ${styles.pricingCard}`} style={{ border: '2px solid var(--color-primary)', transform: 'scale(1.05)', zIndex: 10 }}>
              <div className={styles.pricingPopular}>MOST POPULAR</div>
              <h3 className={styles.featureTitle}>Pro Developer</h3>
              <p className={styles.featureDesc}>For serious builders and production apps.</p>
              <div className={styles.price}>$15<span>/mo</span></div>
              <ul className={styles.pricingList}>
                <li><span style={{ color: 'var(--color-primary)' }}><Check size={18} strokeWidth={3} /></span> Highly capable models included</li>
                <li><span style={{ color: 'var(--color-primary)' }}><Check size={18} strokeWidth={3} /></span> Grok, Claude, GLM</li>
                <li><span style={{ color: 'var(--color-primary)' }}><Check size={18} strokeWidth={3} /></span> ChatGPT (GPT-5.6, Fable 5.6)</li>
              </ul>
              <Link href="/signup" className="btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>Upgrade to Pro</Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Everything You Need</h2>
          <div className={styles.grid3}>
            <div className="card glass-card animate-float" style={{ animationDelay: '0s' }}>
              <div className={styles.featureIcon}><RefreshCw size={40} /></div>
              <h3 className={styles.featureTitle}>Unified API Format</h3>
              <p className={styles.featureDesc}>Use the exact same OpenAI SDK. Just change the base URL and API key, and instantly access any model globally without code changes.</p>
            </div>
            <div className="card glass-card animate-float" style={{ animationDelay: '1s' }}>
              <div className={styles.featureIcon}><Zap size={40} /></div>
              <h3 className={styles.featureTitle}>Zero Latency SSE Streams</h3>
              <p className={styles.featureDesc}>True streaming responses with zero extra delay. We pipe the streams directly to your users ensuring a native typing experience.</p>
            </div>
            <div className="card glass-card animate-float" style={{ animationDelay: '2s' }}>
              <div className={styles.featureIcon}><Key size={40} /></div>
              <h3 className={styles.featureTitle}>Bring Your Own Key</h3>
              <p className={styles.featureDesc}>Have your own provider keys? Plug them in and use our dashboard and unified interface entirely for free. No limits.</p>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Loved by Developers</h2>
          <div className={styles.grid3}>
            <div className={styles.reviewCard}>
              <p className={styles.reviewText}>"I switched all my apps to CheapModels. The ability to use Claude, GPT-4, and Gemini with one API key saved me countless hours."</p>
              <div className={styles.reviewer}>
                <div className={styles.reviewerAvatar}>SA</div>
                <div>
                  <div style={{ fontWeight: 700 }}>Syed Ali</div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Full Stack Dev</div>
                </div>
              </div>
            </div>
            <div className={styles.reviewCard}>
              <p className={styles.reviewText}>"The Bring Your Own Key (BYOK) feature is a game changer. I manage all my client API keys in one clean dashboard now."</p>
              <div className={styles.reviewer}>
                <div className={styles.reviewerAvatar}>MK</div>
                <div>
                  <div style={{ fontWeight: 700 }}>Maria Khan</div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Agency Owner</div>
                </div>
              </div>
            </div>
            <div className={styles.reviewCard}>
              <p className={styles.reviewText}>"Latency is practically zero. The SSE streaming works perfectly just like the native OpenAI SDK. Highly recommended!"</p>
              <div className={styles.reviewer}>
                <div className={styles.reviewerAvatar}>JD</div>
                <div>
                  <div style={{ fontWeight: 700 }}>John Doe</div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>AI Engineer</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Contact Support */}
        <section id="contact" className={styles.section} style={{ paddingBottom: '40px' }}>
          <div className={styles.contactCard}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>Need Custom Enterprise Limits?</h2>
            <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 32px' }}>
              Our dedicated support team is available 24/7 to help you scale your AI applications. We offer custom rate limits and dedicated infrastructure.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn-secondary" style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 700, backgroundColor: 'white', color: 'var(--color-primary)' }}>
                Contact Sales
              </button>
              <button className="btn-secondary" style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 700, backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.5)' }}>
                View Documentation
              </button>
            </div>
          </div>
        </section>

      </div>

      <PixelatedCanvasDemo />

      {/* Enhanced Footer */}
      <footer className={styles.footer} style={{ marginTop: '0', paddingTop: '64px', paddingBottom: '64px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', marginBottom: '48px', textAlign: 'left' }}>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <div className={styles.logo} style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--color-text-main)' }}>
                <span className={styles.logoIcon}><Zap size={24} fill="currentColor" /></span> CheapModels
              </div>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', maxWidth: '300px' }}>
                The unified API for all premium AI models. Build faster, cheaper, and more reliably with our global infrastructure.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href="#" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><img src="https://cdn.simpleicons.org/github/8b949e" width="24" height="24" alt="GitHub" /></a>
                <a href="#" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><img src="https://cdn.simpleicons.org/twitter/8b949e" width="24" height="24" alt="Twitter" /></a>
              </div>
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="#models">Models</Link>
                <Link href="#pricing">Pricing</Link>
                <Link href="/docs">API Documentation</Link>
                <Link href="/dashboard">Dashboard</Link>
              </div>
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="#">About Us</Link>
                <Link href="#contact">Contact Sales</Link>
                <Link href="#">Privacy Policy</Link>
                <Link href="#">Terms of Service</Link>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>© 2026 CheapModels. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#25D366' }}></span> Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
