export interface SiteSettings {
  brandName: string;
  heroHeading: string;
  heroSubtitle: string;
  heroAnimatedTexts: string[];
  primaryBtnText: string;
  primaryBtnTooltip: string;
  faviconUrl: string;
  logoUrl: string;
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
    welcomeMessage: string;
    defaultMonthlyQuota: string;
    allowByok: boolean;
    announcementBanner: string;
  };
  footer: {
    copyrightText: string;
    socialLinks: { id: string; platform: string; url: string }[];
  };
  referralSettings?: {
    isEnabled: boolean;
    standardBonus: string;
    creatorBonus: string;
    alertMessage: string;
  };
}

const defaultSettings: SiteSettings = {
  brandName: 'CheapAgents',
  heroHeading: '',
  heroSubtitle: 'Access OpenAI, Anthropic, Google, and Meta through a single, unified endpoint. Zero margins. Infinite possibilities.',
  heroAnimatedTexts: ['Free Coding', 'Free Chat', 'Cheap API', 'Cheap Agents'],
  primaryBtnText: 'Get Started',
  primaryBtnTooltip: 'Create your free account today',
  faviconUrl: '/favicon.ico',
  logoUrl: '',
  marqueeProviders: [
    { id: 'mq_1', name: 'OpenAI', iconUrl: '/logos/openai.svg' },
    { id: 'mq_2', name: 'Anthropic', iconUrl: '/logos/anthropic.svg' },
    { id: 'mq_3', name: 'Google', iconUrl: '/logos/google.svg' },
    { id: 'mq_4', name: 'Meta', iconUrl: '/logos/meta.svg' },
    { id: 'mq_5', name: 'DeepSeek', iconUrl: '/logos/deepseek.svg' },
  ],
  faqs: [
    { id: 'faq_1', q: 'How does CheapAgents work?', a: 'CheapAgents is a unified AI gateway. You get a single API key that routes requests to OpenAI, Anthropic, Google, Meta, DeepSeek and more through one OpenAI-compatible endpoint.' },
    { id: 'faq_2', q: 'How is it so cheap?', a: 'We aggregate volume, leverage bulk enterprise tiers, and use intelligent caching. For non-cached queries, you pay exactly the underlying cost—zero markup.' },
    { id: 'faq_3', q: 'Is it really a drop-in replacement?', a: 'Yes! Just change the base URL to our endpoint and swap out your OpenAI key for your CheapAgents key. No new SDKs or libraries required.' },
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
    supportEmail: 'support@cheapagents.ai',
    supportPhone: '+1 (800) 555-0199',
    officeAddress: '100 Tech Boulevard, Suite 400, San Francisco, CA 94107',
    discordUrl: 'https://discord.gg/cheapagents',
    enableContactForm: true,
  },
  dashboardSettings: {
    welcomeMessage: 'Welcome to CheapAgents AI Gateway Dashboard',
    defaultMonthlyQuota: '$50.00',
    allowByok: false,
    announcementBanner: '⚡ New DeepSeek-R1 and Claude 3.5 Sonnet v2 models are now live!',
  },
  footer: {
    copyrightText: '© 2026 CheapAgents Inc. All rights reserved.',
    socialLinks: [
      { id: 'x', platform: 'Twitter (X)', url: 'https://twitter.com/cheapagents' },
      { id: 'sl_2', platform: 'GitHub', url: 'https://github.com' },
      { id: 'sl_3', platform: 'Discord', url: 'https://discord.com' },
    ]
  },
  referralSettings: {
    isEnabled: true,
    standardBonus: '$5.00',
    creatorBonus: '$20.00',
    alertMessage: 'Attention Content Creators! Make a video about CheapAgents on YouTube or TikTok, get 100+ views, and earn a $20.00 platform credit instantly!'
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
        name: 'Build Websites',
        plans: [
          { id: 'p_agents_1', name: 'Free', price: '$0', period: '', desc: 'For personal projects', features: ['Basic features', 'Community support'], cta: 'Start Free', ctaLink: '/signup', featured: false },
          { id: 'p_agents_2', name: 'Starter', price: '$10', period: '/mo', desc: 'For indie hackers', features: ['Advanced features', 'Email support'], cta: 'Get Started', ctaLink: '/signup', featured: false },
          { id: 'p_agents_3', name: 'Pro', price: '$25', period: '/mo', desc: 'For teams', features: ['All features', 'Priority support'], cta: 'Upgrade to Pro', ctaLink: '/signup', featured: true },
        ]
      }
    ]
  }
};

let currentSettings = { ...defaultSettings };

export const settingsDb = {
  getSettings: () => currentSettings,
  updateSettings: (newSettings: Partial<SiteSettings>) => {
    currentSettings = { ...currentSettings, ...newSettings };
    return currentSettings;
  }
};
