export type ToolStatus = 'ready' | 'soon';
export type ToolIconKey = 'Terminal' | 'Code' | 'Zap' | 'MessageSquare';

export interface ManagedTool {
  id: string;
  name: string;
  description: string;
  icon: ToolIconKey;
  href: string | null;
  enabled: boolean;
  status: ToolStatus;
}

export const TOOLS_DEFAULT: ManagedTool[] = [
  {
    id: 'free-unlimited-coding',
    name: 'Free Unlimited Coding',
    description: 'Code with AI in your terminal. No usage limits, no credit card.',
    icon: 'Terminal',
    href: '/cli',
    enabled: true,
    status: 'ready',
  },
  {
    id: 'connect-by-api',
    name: 'Connect by API',
    description: 'Drop-in OpenAI replacement. Change one line of code.',
    icon: 'Code',
    href: '/docs',
    enabled: true,
    status: 'ready',
  },
  {
    id: 'earn-all-ai',
    name: 'Earn All AI',
    description: 'BYOK — bring your own keys, earn tokens on every request.',
    icon: 'Zap',
    href: '/dashboard',
    enabled: true,
    status: 'ready',
  },
  {
    id: 'cheapcode-ide',
    name: 'CheapCode IDE',
    description: 'AI-powered code editor with inline completions and refactoring.',
    icon: 'Code',
    href: null,
    enabled: true,
    status: 'soon',
  },
  {
    id: 'cheap-chats',
    name: 'Cheap Chats',
    description: 'Chat with leading AI models from one simple workspace.',
    icon: 'MessageSquare',
    href: '/chats',
    enabled: true,
    status: 'ready',
  },
];

/**
 * Settings arrive from the admin API as free-form JSON, so anything can be
 * missing or malformed. Fill gaps from the default catalog and drop entries we
 * cannot identify. Deterministic fallbacks keep server and client markup equal.
 */
export function normalizeTools(input: unknown): ManagedTool[] {
  if (!Array.isArray(input) || input.length === 0) return TOOLS_DEFAULT;

  const defaultsById = new Map(TOOLS_DEFAULT.map((tool) => [tool.id, tool]));

  return input.map((raw, index) => {
    const base = defaultsById.get(raw?.id) ?? {
      id: typeof raw?.id === 'string' && raw.id ? raw.id : `tool_${index}`,
      name: '',
      description: '',
      icon: 'Code' as ToolIconKey,
      href: null as string | null,
      enabled: true,
      status: 'soon' as ToolStatus,
    };
    const icon = base.icon;
    return {
      id: base.id,
      name: typeof raw?.name === 'string' && raw.name ? raw.name : base.name,
      description:
        typeof raw?.description === 'string' && raw.description
          ? raw.description
          : base.description,
      icon: icon in { Terminal: 1, Code: 1, Zap: 1, MessageSquare: 1 }
        ? (raw?.icon as ToolIconKey) || icon
        : icon,
      href: typeof raw?.href === 'string' && raw.href ? raw.href : base.href,
      enabled: typeof raw?.enabled === 'boolean' ? raw.enabled : base.enabled,
      status: raw?.status === 'ready' || raw?.status === 'soon' ? raw.status : base.status,
    };
  });
}