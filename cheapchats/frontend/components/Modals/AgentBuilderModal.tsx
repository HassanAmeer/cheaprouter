"use client";

import { useState } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import { X, Bot, Sparkles, Wrench, Globe, FileSearch, Layout } from "lucide-react";

export default function AgentBuilderModal() {
  const { activeModal, setActiveModal } = useAppStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("🤖");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [model, setModel] = useState("openai/gpt-4o");
  const [capabilities, setCapabilities] = useState({
    webSearch: true,
    agentReach: true,
    playwright: true,
    mcpTools: true,
    skills: true,
    fileSearch: true,
    artifacts: true,
  });

  const [sources, setSources] = useState<string[]>(["google", "reddit", "youtube"]);
  const [mode, setMode] = useState<"background" | "tabs" | "both">("background");
  const [schedule, setSchedule] = useState("none");

  if (activeModal !== "agentBuilder") return null;

  const handleSave = async () => {
    if (!name || !systemPrompt) {
      alert("Agent name and system prompt are required.");
      return;
    }

    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        avatar,
        systemPrompt,
        temperature,
        model,
        capabilities: {
          ...capabilities,
          sources,
          mode,
          schedule,
        },
        isPublic: true,
      }),
    });

    if (res.ok) {
      alert("Custom Agent created successfully!");
      setActiveModal(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl glass-dropdown rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4 text-xs text-slate-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Custom Agent Builder</h2>
          </div>
          <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1 flex flex-col gap-1">
            <label className="font-semibold text-slate-300">Avatar Icon</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-center text-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="col-span-3 flex flex-col gap-1">
            <label className="font-semibold text-slate-300">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Senior Rust Architect"
              className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-300">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of agent capabilities"
            className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-300">System Prompt Instructions</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            placeholder="Define custom persona, behavior constraints, and output formatting instructions..."
            className="bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500 font-mono text-xs leading-relaxed"
          />
        </div>

        {/* Capabilities Toggles Grid */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-300">Agent Capabilities</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setCapabilities({ ...capabilities, webSearch: !capabilities.webSearch })}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                capabilities.webSearch ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-slate-900 border-white/10 text-slate-400"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Web Search</span>
            </button>

            <button
              type="button"
              onClick={() => setCapabilities({ ...capabilities, agentReach: !capabilities.agentReach })}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                capabilities.agentReach ? "bg-teal-500/20 border-teal-500/40 text-teal-300" : "bg-slate-900 border-white/10 text-slate-400"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Agent Reach</span>
            </button>

            <button
              type="button"
              onClick={() => setCapabilities({ ...capabilities, playwright: !capabilities.playwright })}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                capabilities.playwright ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-slate-900 border-white/10 text-slate-400"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Playwright Web</span>
            </button>

            <button
              type="button"
              onClick={() => setCapabilities({ ...capabilities, mcpTools: !capabilities.mcpTools })}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                capabilities.mcpTools ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-slate-900 border-white/10 text-slate-400"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>MCP Tools</span>
            </button>

            <button
              type="button"
              onClick={() => setCapabilities({ ...capabilities, artifacts: !capabilities.artifacts })}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                capabilities.artifacts ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-slate-900 border-white/10 text-slate-400"
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Live Preview Engine</span>
            </button>
          </div>
        </div>

        {/* Research Sources & Platforms */}
        <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-900/60 border border-white/10">
          <label className="font-semibold text-slate-300 text-xs flex items-center justify-between">
            <span>Research Platforms & Targets</span>
            <span className="text-[10px] text-purple-400 font-normal">{sources.length} selected</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "google", label: "Google / Web" },
              { id: "twitter", label: "Twitter / X" },
              { id: "reddit", label: "Reddit" },
              { id: "linkedin", label: "LinkedIn" },
              { id: "youtube", label: "YouTube" },
              { id: "github", label: "GitHub" },
              { id: "facebook", label: "Facebook" },
              { id: "instagram", label: "Instagram" },
              { id: "others", label: "Others / Custom" },
            ].map((s) => {
              const active = sources.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (active) setSources(sources.filter((x) => x !== s.id));
                    else setSources([...sources, s.id]);
                  }}
                  className={`p-1.5 rounded-xl border text-[11px] font-medium text-left transition flex items-center justify-between ${
                    active ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-slate-900 border-white/10 text-slate-400"
                  }`}
                >
                  <span className="truncate">{s.label}</span>
                  {active && <span className="text-purple-400 text-xs">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-slate-400">Automation Mode:</span>
            <div className="flex gap-1">
              {(["background", "tabs", "both"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-2 py-0.5 rounded-lg border capitalize transition ${
                    mode === m ? "bg-purple-500/20 border-purple-500/40 text-purple-300 font-semibold" : "border-white/5 text-slate-400"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl border border-red-800/80 bg-red-950/35 px-4 py-2 font-semibold text-rose-200 shadow-[0_6px_20px_rgba(70,8,12,0.2)] transition hover:border-red-700 hover:bg-red-950/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700/60"
          >
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}
