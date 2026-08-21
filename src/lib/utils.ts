import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Terminal, Plug, MessageSquare, Globe, Bot, Zap } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map a tab/source id to its plan column deterministically. Relies on the tab
// id ('cli' | 'api' | 'chat' | 'agents') rather than guessing from the plan id,
// so a plan id containing two keywords can never be misclassified into the
// wrong plan column.
export function planFieldFor(id: string): string {
  const v = String(id || '').toLowerCase();
  if (v === 'cli' || v.startsWith('cli')) return 'plan_cli';
  if (v === 'api' || v.startsWith('api')) return 'plan_api';
  if (v === 'chat' || v.startsWith('chat')) return 'plan_chat';
  if (v === 'agent' || v.startsWith('agent') || v === 'agents') return 'plan_agents';
  return 'plan';
}

export function parsePrice(price: string | undefined): number {
  if (price === undefined || price === null) return 0;
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

// Plan request limit. Prefers an explicit `limit` from the plan config (the
// single source of truth, shared with the backend's getPlanLimitFromSettings)
// and only falls back to the legacy id-substring heuristic when it's absent.
export function parseLimit(plan: any): number {
  const id = typeof plan === 'string' ? plan : (plan?.id || '');
  const explicit = typeof plan === 'object' && plan?.limit != null ? Number(plan.limit) : NaN;
  if (!isNaN(explicit) && explicit > 0) return Math.round(explicit);
  const s = String(id);
  if (s.includes('3')) return 10000;
  if (s.includes('2')) return 2000;
  return 500;
}

export function money(n: number): string {
  return `$${Number(n || 0).toFixed(2)}`;
}

export type MetricInfo = {
  label: string;
  unit: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

export function getMetricInfo(tabName: string = ''): MetricInfo {
  const name = tabName.toLowerCase();
  if (name.includes('cli')) return { label: 'CLI Requests', unit: 'CLI requests executed', icon: Terminal };
  if (name.includes('api')) return { label: 'API Hits', unit: 'API hits used', icon: Plug };
  if (name.includes('chat')) return { label: 'Chats', unit: 'chats completed', icon: MessageSquare };
  if (name.includes('website')) return { label: 'Websites Built', unit: 'websites deployed', icon: Globe };
  if (name.includes('agent')) return { label: 'Agent Runs', unit: 'agent runs executed', icon: Bot };
  return { label: 'Requests', unit: 'requests used', icon: Zap };
}
