'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface FooterColumn {
  title: string;
  links: { href: string; label: string }[];
}

export interface SiteSettings {
  brandName: string;
  heroHeading: string;
  heroSubtitle: string;
  heroAnimatedTexts: string[];
  heroPromoText: string;
  heroPromoHighlight: string;
  primaryBtnText: string;
  primaryBtnTooltip: string;
  faviconUrl: string;
  logoUrl: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
  ctaHeading: string;
  ctaSubtitle: string;
  modelsSection: { title: string; subtitle: string };
  integrationsSection: { title: string };
  faqSection: { title: string; subtitle: string };
  footerColumn1?: FooterColumn;
  footerColumn2?: FooterColumn;
  footerColumn3?: FooterColumn;
  marqueeProviders: { id: string; name: string; iconBase64?: string; iconUrl?: string }[];
  faqs: { id: string; q: string; a: string }[];
  demandSection: {
    title: string;
    subtitle: string;
    items: { id: string; text: string; badgeText: string; badgeColor: 'green' | 'red' | 'blue' | 'gray' | 'purple' }[];
  };
  contactInfo: {
    supportEmail: string;
    supportPhone: string;
    officeAddress: string;
    discordUrl: string;
    enableContactForm: boolean;
  };
  dashboardSettings: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    defaultMonthlyQuota: string;
    allowByok: boolean;
    announcementBanner: string;
  };
  footer: {
    copyrightText: string;
    socialLinks: { id: string; platform: string; url: string; isEnabled?: boolean }[];
  };
  featureSplit: {
    title: string;
    description: string;
    checkList: string[];
    buttonText: string;
    buttonLink: string;
    codeSnippet: string;
  };
  pricingSection: {
    title: string;
    subtitle: string;
    tabs: {
      id: string;
      name: string;
      plans: {
        id: string;
        name: string;
        price: string;
        period: string;
        desc: string;
        features: string[];
        cta: string;
        ctaLink: string;
        featured: boolean;
        durationDays?: number;
      }[];
    }[];
  };
  comparisonSection: {
    title: string;
    subtitle: string;
    beforeLabel: string;
    beforeSubLabel: string;
    beforePoints: { id: string; text: string; detail: string }[];
    afterLabel: string;
    afterSubLabel: string;
    afterPoints: { id: string; text: string; detail: string }[];
  };
  featuresGrid: {
    title: string;
    subtitle: string;
    features: { id: string; icon: string; title: string; desc: string }[];
  };
  referralSettings?: {
    isEnabled: boolean;
    standardBonus: string;
    creatorBonus: string;
    alertMessage: string;
  };
}

const defaultSettings: SiteSettings = {
  brandName: 'CheapRouter',
  heroHeading: '',
  heroSubtitle: 'Access OpenAI, Anthropic, Google, and Meta through a single, unified endpoint. Zero margins. Infinite possibilities.',
  heroAnimatedTexts: ['Free Coding', 'Free Chat', 'Cheap API', 'Cheap Agents'],
  heroPromoText: 'Buy Just for',
  heroPromoHighlight: '$2 USD / month',
  primaryBtnText: 'Get Started',
  primaryBtnTooltip: 'Create your free account today',
  faviconUrl: '/favicon.ico',
  logoUrl: '',
  seo: {
    metaTitle: 'CheapRouter - Unified AI Gateway',
    metaDescription: 'Access OpenAI, Anthropic, Google, and Meta through a single, unified endpoint. Zero margins. Infinite possibilities.',
    ogImage: '',
  },
  ctaHeading: 'Ready to cut your AI costs?',
  ctaSubtitle: 'Join thousands of developers saving up to 80% on AI API costs. Get started in seconds with your existing OpenAI SDK.',
  modelsSection: {
    title: 'Every model. One endpoint.',
    subtitle: 'Transparent per-token pricing with no hidden fees.',
  },
  integrationsSection: {
    title: 'Connect with APIs',
  },
  faqSection: {
    title: 'Common questions',
    subtitle: "Can't find what you're looking for? Reach out to our support team.",
  },
  footerColumn1: {
    title: 'Product',
    links: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/models', label: 'Models' },
      { href: '/docs', label: 'Documentation' },
      { href: '/changelog', label: 'Changelog' },
    ],
  },
  footerColumn2: {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/blog', label: 'Blog' },
      { href: '/careers', label: 'Careers' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  footerColumn3: {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/security', label: 'Security' },
    ],
  },
  marqueeProviders: [
    { id: 'mq_1', name: 'Meta', iconUrl: '/logos/meta.svg' },
    { id: 'mq_2', name: 'DeepSeek', iconUrl: '/logos/deepseek.svg' },
    { id: 'mq_3', name: 'OpenAI', iconUrl: '/logos/openai.svg' },
    { id: 'mq_4', name: 'Anthropic', iconUrl: '/logos/anthropic.svg' },
    { id: 'mq_5', name: 'Google', iconUrl: '/logos/google.svg' },
    { id: 'mq_6', name: 'Meta', iconUrl: '/logos/meta.svg' },
  ],
  faqs: [
    { id: 'faq_1', q: 'How does CheapRouter work?', a: 'CheapRouter is a unified AI gateway. You get a single API key that routes requests to OpenAI, Anthropic, Google, Meta, DeepSeek and more through one OpenAI-compatible endpoint.' },
    { id: 'faq_2', q: 'How is it so cheap?', a: 'We aggregate volume, leverage bulk enterprise tiers, and use intelligent caching. For non-cached queries, you pay exactly the underlying cost—zero markup.' },
    { id: 'faq_3', q: 'Is it really a drop-in replacement?', a: 'Yes! Just change the base URL to our endpoint and swap out your OpenAI key for your CheapRouter key. No new SDKs or libraries required.' },
    { id: 'faq_4', q: 'What is BYOK?', a: 'Bring Your Own Key (BYOK) allows you to use your own provider API keys through our gateway. This gives you our unified logging and analytics for free.' },
    { id: 'faq_5', q: 'How secure is my data?', a: 'We never log or train on your prompts. All requests are securely proxied directly to the providers. We are SOC2 compliant.' }
  ],
  demandSection: {
    title: 'Unprecedented Demand',
    subtitle: 'We are scaling rapidly to accommodate massive interest. Secure your spot or track our capacity.',
    items: [
      { id: 'di_1', text: 'Daily active developers', badgeText: '10k+', badgeColor: 'green' },
      { id: 'di_2', text: 'API availability', badgeText: 'Waitlisted', badgeColor: 'red' },
      { id: 'di_3', text: 'Enterprise bypass', badgeText: 'Open', badgeColor: 'green' },
      { id: 'di_4', text: 'New model support', badgeText: 'Coming Soon', badgeColor: 'gray' },
    ]
  },
  contactInfo: {
    supportEmail: 'support@cheaprouter.ai',
    supportPhone: '+1 (800) 555-0199',
    officeAddress: '100 Tech Boulevard, Suite 400, San Francisco, CA 94107',
    discordUrl: 'https://discord.gg/cheaprouter',
    enableContactForm: true,
  },
  dashboardSettings: {
    welcomeTitle: 'Welcome back, {userName}!',
    welcomeSubtitle: "You've used {percent}% of your monthly token limit. {remaining} tokens remaining.",
    defaultMonthlyQuota: '$50.00',
    allowByok: false,
    announcementBanner: '⚡ New DeepSeek-R1 and Claude 3.5 Sonnet v2 models are now live!',
  },
  footer: {
    copyrightText: '© 2026 CheapRouter Inc. All rights reserved.',
    socialLinks: [
      { id: 'sl_1', platform: 'GitHub', url: 'https://github.com', isEnabled: true },
      { id: 'sl_2', platform: 'WhatsApp', url: 'https://whatsapp.com', isEnabled: true },
      { id: 'sl_3', platform: 'YouTube', url: 'https://youtube.com', isEnabled: true },
    ]
  },
  featureSplit: {
    title: 'Change one line.<br />Access every model.',
    description: 'No new SDK. No new patterns. CheapRouter speaks the exact same OpenAI API protocol, so your existing code works immediately — just point it at our endpoint.',
    checkList: [
      'SSE streaming — first token in <100ms',
      'Function calling & tool use, out of the box',
      'JSON mode & structured outputs',
      'Automatic retry with smart fallback chains',
      'Per-model rate limiting & usage tracking',
    ],
    buttonText: 'Read the API Docs',
    buttonLink: '/docs',
    codeSnippet: 'import OpenAI from "openai";\n\nconst client = new OpenAI({\n  apiKey: "cm-xxxxxxxxxxxx",\n  baseURL: "https://api.cheaprouter.com/v1",\n});\n\nconst response = await client.chat.completions.create({\n  model: "claude-3-5-sonnet",\n  messages: [\n    { role: "user", content: "Hello!" }\n  ],\n  stream: true,\n});'
  },
  pricingSection: {
    title: 'Simple, honest pricing',
    subtitle: 'No surprise bills. No hidden token markups. Start free, pay as you grow.',
    tabs: [
      {
        id: 'tab_cli',
        name: 'Cheap CLI',
        plans: [
          { id: 'p_cli_1', name: 'Free', price: '$0', period: '', desc: 'For personal projects', features: ['Basic features', 'Community support'], cta: 'Start Free', ctaLink: '/signup', featured: false },
          { id: 'p_cli_2', name: 'Starter', price: '$2', period: '/mo', desc: 'For indie hackers', features: ['Advanced features', 'Email support'], cta: 'Get Started', ctaLink: '/signup', featured: false },
          { id: 'p_cli_3', name: 'Pro', price: '$15', period: '/mo', desc: 'For teams', features: ['All features', 'Priority support'], cta: 'Upgrade to Pro', ctaLink: '/signup', featured: true },
        ]
      },
      {
        id: 'tab_api',
        name: 'API',
        plans: [
          { id: 'p_api_1', name: 'Free', price: '$0', period: '', desc: 'For personal projects', features: ['Basic features', 'Community support'], cta: 'Start Free', ctaLink: '/signup', featured: false },
          { id: 'p_api_2', name: 'Starter', price: '$5', period: '/mo', desc: 'For indie hackers', features: ['Advanced features', 'Email support'], cta: 'Get Started', ctaLink: '/signup', featured: false },
          { id: 'p_api_3', name: 'Pro', price: '$20', period: '/mo', desc: 'For teams', features: ['All features', 'Priority support'], cta: 'Upgrade to Pro', ctaLink: '/signup', featured: true },
        ]
      },
      {
        id: 'tab_chat',
        name: 'Chat',
        plans: [
          { id: 'p_chat_1', name: 'Free', price: '$0', period: '', desc: 'For personal projects', features: ['Basic features', 'Community support'], cta: 'Start Free', ctaLink: '/signup', featured: false },
          { id: 'p_chat_2', name: 'Starter', price: '$3', period: '/mo', desc: 'For indie hackers', features: ['Advanced features', 'Email support'], cta: 'Get Started', ctaLink: '/signup', featured: false },
          { id: 'p_chat_3', name: 'Pro', price: '$10', period: '/mo', desc: 'For teams', features: ['All features', 'Priority support'], cta: 'Upgrade to Pro', ctaLink: '/signup', featured: true },
        ]
      },
      {
        id: 'tab_agents',
        name: 'Build Website',
        plans: [
          { id: 'p_agents_1', name: 'Free', price: '$0', period: '', desc: 'For personal projects', features: ['Basic features', 'Community support'], cta: 'Start Free', ctaLink: '/signup', featured: false },
          { id: 'p_agents_2', name: 'Starter', price: '$10', period: '/mo', desc: 'For indie hackers', features: ['Advanced features', 'Email support'], cta: 'Get Started', ctaLink: '/signup', featured: false },
          { id: 'p_agents_3', name: 'Pro', price: '$25', period: '/mo', desc: 'For teams', features: ['All features', 'Priority support'], cta: 'Upgrade to Pro', ctaLink: '/signup', featured: true },
        ]
      }
    ]
  },
  comparisonSection: {
    title: 'Without <span class="text-gradient">Cheap Agents</span>',
    subtitle: 'See what changes when you unify your AI infrastructure.',
    beforeLabel: 'Without CheapRouter',
    beforeSubLabel: 'The painful way',
    beforePoints: [
      { id: 'bp_1', text: 'Separate API key for each provider', detail: 'OpenAI, Anthropic, Google, Meta…' },
      { id: 'bp_2', text: 'Different SDKs and response formats', detail: 'Rewrite code for every model switch' },
      { id: 'bp_3', text: 'Manual retry and fallback logic', detail: 'Hours of engineering per provider' },
      { id: 'bp_4', text: 'Scattered usage data across dashboards', detail: 'No unified cost visibility' },
      { id: 'bp_5', text: 'Vendor lock-in on every integration', detail: 'Switching costs you weeks' },
      { id: 'bp_6', text: 'Multiple billing accounts to manage', detail: 'Finance team nightmare' },
    ],
    afterLabel: 'With CheapRouter',
    afterSubLabel: 'The smart way',
    afterPoints: [
      { id: 'ap_1', text: 'One key for every AI provider', detail: 'All models, one credential' },
      { id: 'ap_2', text: 'Same OpenAI SDK, same interface', detail: 'Change one line, zero refactoring' },
      { id: 'ap_3', text: 'Built-in retry and smart fallbacks', detail: 'Automatic zero-downtime routing' },
      { id: 'ap_4', text: 'Unified real-time analytics', detail: 'Cost, latency & tokens in one view' },
      { id: 'ap_5', text: 'Switch models with one parameter', detail: 'GPT → Claude → Gemini instantly' },
      { id: 'ap_6', text: 'Single consolidated bill', detail: 'One invoice, full transparency' },
    ]
  },
  featuresGrid: {
    title: 'Built for production',
    subtitle: 'Everything you need to ship AI features — from prototype to planet-scale.',
    features: [
      { id: 'fg_1', icon: 'RefreshCw', title: 'Unified API', desc: 'Same OpenAI SDK format. Change one URL, access every model on the market.' },
      { id: 'fg_2', icon: 'Zap', title: 'Real-time Streaming', desc: 'Native SSE streaming piped directly from provider to your users, <100ms to first token.' },
      { id: 'fg_3', icon: 'Key', title: 'Bring Your Own Key', desc: 'Add your provider keys for free routing. Zero margins, zero limits on your own keys.' },
      { id: 'fg_4', icon: 'Shield', title: 'Enterprise Security', desc: 'SOC 2 compliant, AES-256 encrypted key vault, automatic rotation, zero-knowledge architecture.' },
      { id: 'fg_5', icon: 'Globe', title: 'Global Edge Routing', desc: 'Requests served from the nearest edge node for consistently low latency worldwide.' },
      { id: 'fg_6', icon: 'Layers', title: 'Smart Fallbacks', desc: 'Automatic failover chains. If one provider is down, traffic routes to your next best model.' },
      { id: 'fg_7', icon: 'Eye', title: 'Live Analytics', desc: 'Real-time dashboards tracking tokens, cost, latency, and errors per model and per user.' },
      { id: 'fg_8', icon: 'DollarSign', title: 'Cost Optimization', desc: 'Automatic model suggestions based on cost/performance. Save up to 70% vs direct provider pricing.' },
      { id: 'fg_9', icon: 'Workflow', title: 'Rate Limiting', desc: 'Fine-grained per-model, per-user rate limits. Set budgets and caps at the API key level.' },
    ]
  },
  referralSettings: {
    isEnabled: true,
    standardBonus: '$5.00',
    creatorBonus: '$20.00',
    alertMessage: 'Attention Content Creators! Make a video about CheapRouter on YouTube or TikTok, get 100+ views, and earn a $20.00 platform credit instantly!'
  }
};

interface SettingsContextType {
  settings: SiteSettings;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json().catch(() => null);
          if (data) {
            setSettings({
              ...defaultSettings,
              ...data,
            });
            
            // Dynamically update document title / favicon if we are on client side
            if (typeof window !== 'undefined') {
              document.title = (data.brandName || 'CheapRouter') + ' | Unified AI Gateway';
              const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
              (link as any).type = 'image/x-icon';
              (link as any).rel = 'shortcut icon';
              (link as any).href = data.faviconUrl || '/favicon.ico';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SettingsContext);
}
