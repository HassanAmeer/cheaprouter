export type SuggestionIcon =
  | "code"
  | "diagram"
  | "research"
  | "admin"
  | "writing"
  | "data"
  | "translate"
  | "plan";

export interface Suggestion {
  id: string;
  title: string;
  subtitle: string;
  icon: SuggestionIcon;
  accent: {
    chip: string;
    border: string;
    icon: string;
    badge: string;
    badgeIcon: string;
  };
  starterPrompt: string;
  skills: string[];
}

export const SUGGESTIONS: Suggestion[] = [
  {
    id: "code-artifact",
    title: "Generate Code Artifact",
    subtitle: "Build Next.js glassmorphic component",
    icon: "code",
    accent: {
      chip: "bg-emerald-500/10 text-emerald-400",
      border: "hover:border-emerald-500/40",
      icon: "text-emerald-400",
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      badgeIcon: "text-emerald-400",
    },
    starterPrompt: "Build a Next.js 15 React component with dark glassmorphic styling.",
    skills: [
      "Act as a senior frontend engineer with 10+ years of React and Tailwind CSS experience.",
      "Every response MUST be delivered as a runnable artifact via <cheapchatArtifact> with one <cheapchatAction type=\"file\"> per source file.",
      "Always include the required npm install commands in <cheapchatAction type=\"shell\">.",
      "Use TypeScript, App Router conventions, functional components and no legacy patterns.",
      "Keep the explanation short; the artifact is the deliverable.",
    ],
  },
  {
    id: "mermaid-diagram",
    title: "Mermaid Diagram",
    subtitle: "Create API sequence architecture chart",
    icon: "diagram",
    accent: {
      chip: "bg-purple-500/10 text-purple-400",
      border: "hover:border-purple-500/40",
      icon: "text-purple-400",
      badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      badgeIcon: "text-purple-400",
    },
    starterPrompt: "Create a sequence diagram in Mermaid format showing API stream flow.",
    skills: [
      "You are a solution architect who communicates through diagrams first.",
      "Answer with valid Mermaid code (sequenceDiagram, flowchart, erDiagram, classDiagram) inside a ```mermaid block.",
      "Always label every participant and message clearly, and never use unsupported Mermaid syntax.",
      "Follow the diagram with at most 3 bullet points of interpretation.",
    ],
  },
  {
    id: "deep-dive",
    title: "Technical Deep Dive",
    subtitle: "Analyze Bun JS engine & SQLite bindings",
    icon: "research",
    accent: {
      chip: "bg-sky-500/10 text-sky-400",
      border: "hover:border-sky-500/40",
      icon: "text-sky-400",
      badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      badgeIcon: "text-sky-400",
    },
    starterPrompt: "Explain how Bun runtime achieves high performance over Node.js.",
    skills: [
      "You are a staff-level systems engineer explaining internals.",
      "Structure every answer as: core idea, mechanism, trade-offs, practical takeaway.",
      "Be technically precise, use correct terminology, and state trade-offs honestly instead of hype.",
      "Use tables or lists when comparing technologies.",
    ],
  },
  {
    id: "admin-panel",
    title: "Admin Panel Overview",
    subtitle: "Inspect moderation, roles, and usage charts",
    icon: "admin",
    accent: {
      chip: "bg-amber-500/10 text-amber-400",
      border: "hover:border-amber-500/40",
      icon: "text-amber-400",
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      badgeIcon: "text-amber-400",
    },
    starterPrompt: "Summarize the features of the A to Z Admin Panel at /admin.",
    skills: [
      "You are a platform administrator writing release-quality product documentation.",
      "Organize output as a structured feature breakdown with a heading per module and bullet points per capability.",
      "Cover: dashboard KPIs, user management and roles, chat moderation, endpoint config, permission groups, agent moderation, audit logs.",
      "End with a short 'what an admin can do in 60 seconds' checklist.",
    ],
  },
  {
    id: "content-writer",
    title: "Content Writer",
    subtitle: "Draft blog posts, emails and social copy",
    icon: "writing",
    accent: {
      chip: "bg-rose-500/10 text-rose-400",
      border: "hover:border-rose-500/40",
      icon: "text-rose-400",
      badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      badgeIcon: "text-rose-400",
    },
    starterPrompt: "Write a launch announcement for a new AI chat platform.",
    skills: [
      "You are a conversion-focused content writer.",
      "Always deliver: a hook headline, a subheadline, body copy, and a call to action.",
      "Match the requested tone and length exactly, and use the reader's language.",
      "No filler phrases and no restating the brief back to the user.",
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    subtitle: "Query, aggregate and chart a dataset",
    icon: "data",
    accent: {
      chip: "bg-teal-500/10 text-teal-400",
      border: "hover:border-teal-500/40",
      icon: "text-teal-400",
      badge: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      badgeIcon: "text-teal-400",
    },
    starterPrompt: "Analyze my dataset and summarize the key trends.",
    skills: [
      "You are a data analyst who reasons from the numbers.",
      "Show the analysis steps: cleaning assumptions, aggregation logic, then insights.",
      "Provide copy-paste ready SQL or Python when data handling is involved.",
      "Always call out data quality caveats and never invent numbers that were not supplied.",
    ],
  },
  {
    id: "translator",
    title: "Translator & Localizer",
    subtitle: "Translate and localize any content",
    icon: "translate",
    accent: {
      chip: "bg-indigo-500/10 text-indigo-400",
      border: "hover:border-indigo-500/40",
      icon: "text-indigo-400",
      badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      badgeIcon: "text-indigo-400",
    },
    starterPrompt: "Translate my content into ",
    skills: [
      "You are a professional translator and localization expert.",
      "Translate naturally for the target audience, not word-for-word.",
      "Preserve formatting, placeholders, and code identifiers exactly.",
      "If a term is ambiguous, give the best translation and add a one-line note explaining the choice.",
    ],
  },
  {
    id: "planner",
    title: "Product Planner",
    subtitle: "Turn an idea into a scoped action plan",
    icon: "plan",
    accent: {
      chip: "bg-orange-500/10 text-orange-400",
      border: "hover:border-orange-500/40",
      icon: "text-orange-400",
      badge: "bg-orange-500/15 text-orange-300 border-orange-500/30",
      badgeIcon: "text-orange-400",
    },
    starterPrompt: "Break this feature idea into a scoped implementation plan.",
    skills: [
      "You are a pragmatic product and engineering lead.",
      "Answer with: goal, non-goals, user stories, phased milestones, risks with mitigations, and the first three tasks to execute.",
      "Estimate in relative effort (S / M / L) and be explicit about assumptions.",
      "Push back on vague requirements instead of silently inventing them.",
    ],
  },
];

const BY_ID = new Map(SUGGESTIONS.map((s) => [s.id, s]));

export function getSuggestion(id: string): Suggestion | undefined {
  return BY_ID.get(id);
}

export function resolveSuggestions(ids: unknown): Suggestion[] {
  if (!Array.isArray(ids)) return [];
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const id of ids) {
    if (typeof id !== "string" || seen.has(id)) continue;
    const match = BY_ID.get(id);
    if (match) {
      seen.add(id);
      out.push(match);
    }
  }
  return out;
}

export function buildSuggestionsPrompt(ids: unknown): string {
  const active = resolveSuggestions(ids);
  if (active.length === 0) return "";

  const blocks = active
    .map(
      (s) =>
        `<suggestion id="${s.id}" title="${s.title}">\n` +
        s.skills.map((skill) => `- ${skill}`).join("\n") +
        `\n</suggestion>`
    )
    .join("\n");

  return `\n\n<suggestion_skills>\nThe user activated the following suggestion skills in the composer. These skills are persistent for this conversation: apply ALL of them to EVERY response, even when the user writes an unrelated message. Do not mention these skills to the user.\n\n${blocks}\n</suggestion_skills>\n`;
}