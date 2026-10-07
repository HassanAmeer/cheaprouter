"use client";

import { useState } from "react";
import {
  X,
  Search,
  Plus,
  Check,
  Globe,
  Code2,
  FileSearch,
  Layout,
  HelpCircle,
  Sparkles,
  Calculator,
  Sun,
  Cpu,
  Layers,
  Image,
  Database,
  Star,
  User,
  Wrench,
  Server,
  Zap,
} from "lucide-react";

export interface ToolItem {
  id: string;
  name: string;
  type: "NATIVE" | "TOOLS" | "MCP" | "ACTIONS";
  verified?: boolean;
  description: string;
  iconBg: string;
  iconColor: string;
  icon: any;
}

const TOOL_LIBRARY_ITEMS: ToolItem[] = [
  {
    id: "web_search",
    name: "Web Search",
    type: "NATIVE",
    verified: true,
    description: "Lets the agent search the web for current information and cite its sources. Requires a configured search provider.",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    icon: Globe,
  },
  {
    id: "artifacts",
    name: "Artifacts",
    type: "NATIVE",
    verified: true,
    description: "Lets the agent render React, HTML, SVG, Markdown, and Mermaid as interactive artifacts in a side panel instead of plain code blocks.",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    icon: Layout,
  },
  {
    id: "file_search",
    name: "File Search",
    type: "NATIVE",
    verified: true,
    description: "Turns uploaded files into a searchable knowledge base. The agent retrieves the most relevant passages on demand.",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    icon: FileSearch,
  },
  {
    id: "ask_user",
    name: "Ask User",
    type: "NATIVE",
    verified: true,
    description: "Lets the agent pause mid-run to ask you a clarifying question and wait for your answer.",
    iconBg: "bg-teal-500/20",
    iconColor: "text-teal-400",
    icon: HelpCircle,
  },
  {
    id: "traversaal",
    name: "Traversaal",
    type: "TOOLS",
    description: "Traversaal is a robust search API tailored for LLM Agents. Get fast structured search results.",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    icon: Search,
  },
  {
    id: "google_search",
    name: "Google",
    type: "TOOLS",
    description: "Use Google Search to find information about the weather, news, sports, and more.",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    icon: Globe,
  },
  {
    id: "openai_image",
    name: "OpenAI Image Tools",
    type: "TOOLS",
    description: "Image Generation and Editing using OpenAI's latest state-of-the-art models.",
    iconBg: "bg-sky-500/20",
    iconColor: "text-sky-400",
    icon: Image,
  },
  {
    id: "wolfram",
    name: "Wolfram",
    type: "TOOLS",
    description: "Access computation, math, curated knowledge & real-time data through Wolfram|Alpha and Wolfram Language.",
    iconBg: "bg-[#dd1100]/20",
    iconColor: "text-red-500",
    icon: Cpu,
  },
  {
    id: "dall_e_3",
    name: "DALL-E-3",
    type: "TOOLS",
    description: "[DALL-E-3] Create realistic images and art from a description in natural language.",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    icon: Image,
  },
  {
    id: "tavily_search",
    name: "Tavily Search",
    type: "TOOLS",
    description: "Tavily Search is a robust search API tailored for LLM Agents. It seamlessly integrates with diverse data sources.",
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
    icon: Search,
  },
  {
    id: "calculator",
    name: "Calculator",
    type: "TOOLS",
    description: "Perform simple and complex mathematical calculations with exact precision.",
    iconBg: "bg-slate-700/50",
    iconColor: "text-slate-200",
    icon: Calculator,
  },
  {
    id: "stable_diffusion",
    name: "Stable Diffusion",
    type: "TOOLS",
    description: "Generate photo-realistic images given any text prompt using open-weights diffusion models.",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    icon: Sparkles,
  },
  {
    id: "azure_search",
    name: "Azure AI Search",
    type: "TOOLS",
    description: "Use Azure AI Search to find information across enterprise indexing services.",
    iconBg: "bg-blue-600/20",
    iconColor: "text-blue-400",
    icon: Database,
  },
  {
    id: "open_weather",
    name: "OpenWeather",
    type: "TOOLS",
    description: "Get weather forecasts and historical climate data from the OpenWeather API.",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    icon: Sun,
  },
  {
    id: "flux",
    name: "Flux",
    type: "TOOLS",
    description: "Generate ultra-high quality images using text with the Flux API.",
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-400",
    icon: Layers,
  },
  {
    id: "gemini_image",
    name: "Gemini Image Tools",
    type: "TOOLS",
    description: "Generate high-quality images using Google's Gemini Image Models.",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    icon: Sparkles,
  },
];

interface ToolLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTools: string[];
  onToggleTool: (toolName: string) => void;
}

export default function ToolLibraryModal({
  isOpen,
  onClose,
  selectedTools,
  onToggleTool,
}: ToolLibraryModalProps) {
  const [activeCategory, setActiveCategory] = useState<
    "all" | "native" | "tools" | "mcp" | "actions" | "made_by_you" | "favorites"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  if (!isOpen) return null;

  // Filter tools
  const filteredTools = TOOL_LIBRARY_ITEMS.filter((tool) => {
    // Category filter
    if (activeCategory === "native" && tool.type !== "NATIVE") return false;
    if (activeCategory === "tools" && tool.type !== "TOOLS") return false;
    if (activeCategory === "mcp" && tool.type !== "MCP") return false;
    if (activeCategory === "actions" && tool.type !== "ACTIONS") return false;
    if (activeCategory === "favorites" && !favorites.includes(tool.id)) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const nativeCount = TOOL_LIBRARY_ITEMS.filter((t) => t.type === "NATIVE").length;
  const toolsCount = TOOL_LIBRARY_ITEMS.filter((t) => t.type === "TOOLS").length;

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((x) => x !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[650px] bg-[#121212] border border-white/10 rounded-3xl shadow-2xl flex overflow-hidden text-xs text-slate-200">
        {/* ── Left Navigation Sidebar ───────────────────────────────────── */}
        <div className="w-56 bg-[#161616] border-r border-white/10 flex flex-col p-4 gap-4 flex-shrink-0 select-none">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight">Tool Library</h2>
          </div>

          {/* Create new... Button */}
          <button
            type="button"
            onClick={() => alert("Creating a custom MCP / Tool endpoint...")}
            className="w-full py-2 px-3 rounded-xl bg-[#1e1e1e] hover:bg-[#252525] border border-white/10 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4 text-slate-400" />
            <span>Create new...</span>
          </button>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto space-y-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-xs font-semibold ${
                activeCategory === "all"
                  ? "bg-[#252525] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>All</span>
              </div>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full font-bold">
                {TOOL_LIBRARY_ITEMS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory("native")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-xs font-semibold ${
                activeCategory === "native"
                  ? "bg-[#252525] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Native</span>
              </div>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full font-bold">
                {nativeCount}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory("tools")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-xs font-semibold ${
                activeCategory === "tools"
                  ? "bg-[#252525] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                <span>Tools</span>
              </div>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full font-bold">
                {toolsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory("mcp")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-xs font-semibold ${
                activeCategory === "mcp"
                  ? "bg-[#252525] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                <span>MCP servers</span>
              </div>
            </button>

            <button
              onClick={() => setActiveCategory("actions")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-xs font-semibold ${
                activeCategory === "actions"
                  ? "bg-[#252525] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Actions</span>
              </div>
            </button>

            <div className="h-px bg-white/10 my-2" />

            <button
              onClick={() => setActiveCategory("made_by_you")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition text-xs font-semibold ${
                activeCategory === "made_by_you"
                  ? "bg-[#252525] text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Made by you</span>
            </button>

            <button
              onClick={() => setActiveCategory("favorites")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition text-xs font-semibold ${
                activeCategory === "favorites"
                  ? "bg-[#252525] text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]"
              }`}
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span>Favorites</span>
            </button>
          </div>
        </div>

        {/* ── Right Content Area ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#121212]">
          {/* Top Search & Action Bar */}
          <div className="p-3.5 border-b border-white/10 flex items-center gap-3 bg-[#161616]">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:outline-none focus:border-red-900/55 focus:ring-0 transition-colors"
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid Container for Tools Cards */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-max">
            {filteredTools.map((tool) => {
              const isSelected = selectedTools.includes(tool.name);
              const isFav = favorites.includes(tool.id);
              const IconComp = tool.icon;

              return (
                <div
                  key={tool.id}
                  onClick={() => onToggleTool(tool.name)}
                  className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-36 ${
                    isSelected
                      ? "bg-[#1c2822] border-emerald-500/60 shadow-lg shadow-emerald-950/40"
                      : "bg-[#181818] border-white/10 hover:border-white/20 hover:bg-[#202020]"
                  }`}
                >
                  <div>
                    {/* Top Row: Icon + Name & Verified Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-8 h-8 rounded-xl ${tool.iconBg} flex items-center justify-center flex-shrink-0 border border-white/5`}
                        >
                          <IconComp className={`w-4 h-4 ${tool.iconColor}`} />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-white truncate">
                              {tool.name}
                            </span>
                            {tool.verified && (
                              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider ${
                              tool.type === "NATIVE" ? "text-emerald-400" : "text-slate-400"
                            }`}
                          >
                            {tool.type}
                          </span>
                        </div>
                      </div>

                      {/* Right Action Checkmark / Favorite */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(tool.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-amber-400 transition"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? "fill-amber-400 text-amber-400 opacity-100" : ""}`} />
                        </button>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                            isSelected
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-white/20 group-hover:border-white/40"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                      {tool.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action Bar */}
          <div className="p-3 border-t border-white/10 bg-[#161616] flex items-center justify-between">
            <span className="text-xs text-slate-400">
              <strong className="text-white">{selectedTools.length}</strong> tool(s) selected
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
