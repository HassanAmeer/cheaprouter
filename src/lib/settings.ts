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
  footer: {
    copyrightText: string;
    socialLinks: { id: string; platform: string; url: string }[];
  };
}

const defaultSettings: SiteSettings = {
  brandName: 'CheapAgents',
  heroHeading: 'One API Key for Every',
  heroSubtitle: 'Access OpenAI, Anthropic, Google, and Meta through a single, unified endpoint. Zero margins. Infinite possibilities.',
  heroAnimatedTexts: ['AI Model', 'Provider', 'LLM', 'Inference'],
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
  footer: {
    copyrightText: '© 2026 CheapAgents Inc. All rights reserved.',
    socialLinks: [
      { id: 'sl_1', platform: 'Twitter', url: 'https://twitter.com' },
      { id: 'sl_2', platform: 'GitHub', url: 'https://github.com' },
      { id: 'sl_3', platform: 'Discord', url: 'https://discord.com' },
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
