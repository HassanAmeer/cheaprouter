const SUGGESTION_SKILLS: Record<string, string> = {
  "web search": "Web Search & Research",
  "mermaid diagram": "Mermaid Diagram Creation",
  "html page / game": "HTML Page / Game & Sound",
  "html & 2d game": "HTML Page / Game & Sound",
  summarize: "Summarization & Key Takeaways",
};

export function getSuggestionSkillName(label: string, type?: string): string | null {
  if (type === "game") return SUGGESTION_SKILLS["html page / game"];
  return SUGGESTION_SKILLS[label.trim().toLowerCase()] ?? null;
}
