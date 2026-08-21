// API Response Types for type-safe frontend/backend communication

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  created_at?: string;
  password_changed_at?: string | null;
  plan_cli?: string;
  plan_api?: string;
  plan_chat?: string;
  plan_agents?: string;
  plan_cli_start?: string | null;
  plan_cli_expiry?: string | null;
  plan_api_start?: string | null;
  plan_api_expiry?: string | null;
  plan_chat_start?: string | null;
  plan_chat_expiry?: string | null;
  plan_agents_start?: string | null;
  plan_agents_expiry?: string | null;
  profile_picture?: string | null;
  last_login?: string | null;
  last_ip?: string | null;
  user_agent?: string | null;
  hardware_info?: string | null;
  is_student?: boolean | null;
  experience_level?: string | null;
  use_cases?: string | null;
  earning_goal?: string | null;
  onboarding_completed?: boolean | null;
  balance?: number;
  status?: string;
  referred_by?: string | null;
  referral_rewarded?: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  secret: string;
  prefix: string;
  created: string;
  lastUsed?: string | null;
}

export interface Provider {
  id: string;
  provider: string;
  name: string;
  icon: string;
  color: string;
  masked: string;
  status: 'active' | 'paused';
  added: string;
}

export interface BillingData {
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created: string | null;
}

export interface TopupRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created: string | null;
  processed: string | null;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created: string | null;
  processed: string | null;
}

export interface UsageBreakdown {
  models: UsageModel[];
  totalModels: number;
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  conversations: number;
  messages: number;
}

export interface UsageModel {
  model: string;
  hits: number;
  tokens: number;
  cost: number;
  last_used: string | null;
}

export interface AnalyticsData {
  usageOverTime: { label: string; value: number }[];
  topModels: { model: string; tokens: number }[];
  costBreakdown: { label: string; value: number; color: string }[];
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
}

export interface PlanLimitData {
  planName: string;
  limit: number;
  used: number;
  remaining: number;
  percent: number;
}

export interface SummaryData {
  limit: number;
  used: number;
  remaining: number;
  percent: number;
  providers: number;
  planLimits?: Record<string, PlanLimitData>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface Submission {
  id: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  date: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow?: number;
  maxTokens?: number;
  features?: string[];
  freeTier?: { limit: string; resetPeriod: string };
  pricing?: { input: number; output: number };
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ConversationResponse {
  id: string;
  messages: Message[];
}

export interface SettingsData {
  brandName?: string;
  heroAnimatedTexts?: string[];
  heroSubtitle?: string;
  heroPromoText?: string;
  heroPromoHighlight?: string;
  marqueeProviders?: { id: string; name: string; iconUrl: string }[];
  dashboardSettings?: {
    welcomeTitle?: string;
    welcomeSubtitle?: string;
    announcementBanner?: string;
    allowByok?: boolean;
  };
  install?: { websiteUrl?: string };
  pricingSection?: {
    tabs: PricingTab[];
  };
  modelsSection?: { title: string; subtitle: string };
  featuresGrid?: { title: string; subtitle: string; features: Feature[] };
  demandSection?: { title: string; subtitle: string; items: DemandItem[] };
  faqSection?: { title: string; subtitle: string };
  comparisonSection?: ComparisonSection;
  faqs?: FaqItem[];
  withdrawSettings?: WithdrawSettings;
  referralSettings?: ReferralSettings;
}

export interface PricingTab {
  id: string;
  name: string;
  plans: PricingPlan[];
}

export interface PricingPlan {
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
  limit?: number;
}

export interface Feature {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export interface DemandItem {
  id: string;
  text: string;
  badgeText: string;
  badgeColor: string;
}

export interface ComparisonSection {
  title: string;
  subtitle: string;
  beforeLabel: string;
  beforeSubLabel: string;
  beforePoints: { id: string; text: string; detail: string }[];
  afterLabel: string;
  afterSubLabel: string;
  afterPoints: { id: string; text: string; detail: string }[];
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface WithdrawSettings {
  enabled: boolean;
  minAmount: number;
  announcement: string;
}

export interface ReferralSettings {
  isEnabled: boolean;
  standardBonus: string;
  creatorBonus: string;
  alertMessage: string;
}

// Admin types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  balance: number;
  plan_cli: string;
  plan_api: string;
  plan_chat: string;
  plan_agents: string;
  plan_cli_start: string | null;
  plan_cli_expiry: string | null;
  plan_api_start: string | null;
  plan_api_expiry: string | null;
  plan_chat_start: string | null;
  plan_chat_expiry: string | null;
  plan_agents_start: string | null;
  plan_agents_expiry: string | null;
  created_at: string;
  joined: string;
  password_changed_at: string | null;
  last_login: string | null;
  last_ip: string | null;
  os: string;
  calls: number;
  status: string;
  profile_picture: string | null;
  is_student: boolean;
  experience_level: string | null;
  use_cases: string | null;
  earning_goal: string | null;
  onboarding_completed: boolean;
}

export interface AdminAnalytics {
  totalCost: number;
  totalRevenue: number;
  mrr: number;
  revenueTrend: { date: string; revenue: number; cost: number }[];
  topModels: { model: string; requests: number; tokens: number; revenue: number; margin: number }[];
  topUsers: { name: string; email: string; calls: number; spend: number }[];
  costBreakdown: { label: string; value: number; color: string }[];
}

export interface AdminProvider {
  id: string;
  name: string;
  status: boolean;
  key: string;
  priority: number;
  base_url: string | null;
  use_models_api: boolean;
  models_api_link: string | null;
  api_format: string | null;
  is_custom: boolean;
  models: any[];
  headers: any[];
  icon: string | null;
}