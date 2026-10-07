"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  ChevronDown,
  ChevronLeft,
  Plus,
  HelpCircle,
  Maximize2,
  Share2,
  X,
  Check,
  Bot,
  Sliders,
  Sparkles,
  Globe,
  FileSearch,
  Wrench,
  Layout,
  Code2,
  CheckSquare,
  Search,
  Trash2,
  Edit2,
  MessageSquare,
  Paperclip,
  FileText,
} from "lucide-react";
import Tooltip from "@cheapchats/frontend/components/Common/Tooltip";
import ToolLibraryModal from "@cheapchats/frontend/components/Modals/ToolLibraryModal";
import { SidebarCardsSkeleton } from "@cheapchats/frontend/components/Common/SkeletonLoader";

const AVAILABLE_MODELS = [
  { id: "openrouter/auto-beta", name: "openrouter/auto-beta", provider: "OpenRouter" },
  { id: "openai/gpt-4o", name: "openai/gpt-4o", provider: "OpenAI" },
  { id: "anthropic/claude-3-5-sonnet", name: "anthropic/claude-3-5-sonnet", provider: "Anthropic" },
  { id: "google/gemini-2.5-flash", name: "google/gemini-2.5-flash", provider: "Google" },
  { id: "deepseek/deepseek-r1", name: "deepseek/deepseek-r1", provider: "DeepSeek" },
];

const CATEGORIES = ["general", "coding", "writing", "productivity", "research", "utility"];

const PRESET_TOOLS = [
  { id: "web_search", name: "Web Search", description: "Search the live web for real-time information", icon: Globe },
  { id: "file_search", name: "File Search", description: "Search uploaded workspace files & docs", icon: FileSearch },
  { id: "code_execution", name: "Code Interpreter", description: "Run Python & JS code in sandbox", icon: Code2 },
  { id: "mcp_tools", name: "MCP Tools", description: "Access connected Model Context Protocol servers", icon: Wrench },
  { id: "artifacts", name: "Live Preview Engine", description: "Render live interactive web apps and visual components", icon: Layout },
];

const PRESET_SKILLS = [
  { id: "web-dev", name: "Web Application Development", category: "Coding" },
  { id: "react-next", name: "React & Next.js Best Practices", category: "Coding" },
  { id: "game-audio", name: "HTML Page / Game & Sound", category: "Coding" },
  { id: "tailwind", name: "Tailwind CSS & Styling", category: "UI/UX" },
  { id: "firebase", name: "Firebase & Firestore Integration", category: "Backend" },
  { id: "api-design", name: "REST & GraphQL API Design", category: "Backend" },
  { id: "testing", name: "Jest & Integration Testing", category: "DevOps" },
  { id: "database-tools", name: "PostgreSQL & SQLite Queries", category: "Utility" }
];

const AVATAR_OPTIONS = ["🤖", "🧠", "⚡", "🔮", "🛠️", "🚀", "🎨", "💻", "🛡️", "📊"];

export default function AgentsSidebarPanel() {
  const { setSidebarView, setSelectedProviderAndModel } = useAppStore();
  const router = useRouter();

  // Navigation / View states
  const [viewMode, setViewMode] = useState<"main" | "advanced">("main");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Form Fields (Screenshot 2)
  const [avatar, setAvatar] = useState("🤖");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("openrouter/auto-beta");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [category, setCategory] = useState("general");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);

  // Tools & Skills
  const [tools, setTools] = useState<string[]>([]);
  const [showToolsPicker, setShowToolsPicker] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [useAllSkills, setUseAllSkills] = useState(false);
  const [showSkillsPicker, setShowSkillsPicker] = useState(false);

  // Contact
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  // File Context
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((f) => ({
      name: f.name,
      size: (f.size / 1024).toFixed(1) + " KB",
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  // Advanced Fields (Screenshot 1)
  const [maxSteps, setMaxSteps] = useState("System");
  const [handoffs, setHandoffs] = useState<string[]>([]);
  const [showHandoffPicker, setShowHandoffPicker] = useState(false);

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch agents on mount
  const loadAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      const list = data.agents || [];
      setAgents(list);
      try {
        localStorage.setItem("cheapchat_cached_agents", JSON.stringify(list));
      } catch {}
    } catch (err) {
      console.error("Failed to load agents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // Reset form to blank "Create New Agent"
  const handleCreateNew = () => {
    setSelectedAgentId(null);
    setAvatar("🤖");
    setName("");
    setDescription("");
    setModel("openrouter/auto-beta");
    setCategory("general");
    setInstructions("");
    setTools([]);
    setSkills([]);
    setUseAllSkills(false);
    setSupportName("");
    setSupportEmail("");
    setMaxSteps("System");
    setHandoffs([]);
    setViewMode("main");
    setDropdownOpen(false);
  };

  // Select an existing agent to view/edit
  const handleSelectAgent = (agent: any) => {
    setSelectedAgentId(agent.id);
    setAvatar(agent.avatar || "🤖");
    setName(agent.name || "");
    setDescription(agent.description || "");
    setModel(agent.model || "openrouter/auto-beta");
    setCategory("general");
    setInstructions(agent.systemPrompt || "");

    try {
      const caps = typeof agent.capabilities === "string" ? JSON.parse(agent.capabilities) : agent.capabilities || {};
      setTools(caps.tools || (caps.webSearch ? ["Web Search", "MCP Tools"] : []));
      setSkills(caps.skillsList || []);
      setUseAllSkills(!!caps.useAllSkills);
    } catch (e) {
      setTools([]);
      setSkills([]);
    }

    setDropdownOpen(false);
  };

  // Save or Create agent handler
  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter an Agent name");
      return;
    }
    setIsSaving(true);
    setSuccessMsg("");

    const capabilitiesObj = {
      tools,
      skillsList: skills,
      useAllSkills,
      webSearch: tools.includes("Web Search"),
      mcpTools: tools.includes("MCP Tools"),
      fileSearch: tools.includes("File Search"),
      artifacts: tools.includes("Live Preview Engine") || tools.includes("Artifacts Engine"),
      maxSteps,
      handoffs,
      supportName,
      supportEmail,
    };

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedAgentId || undefined,
          name,
          description,
          avatar,
          systemPrompt: instructions || "You are a helpful AI assistant.",
          model,
          temperature: 0.7,
          capabilities: capabilitiesObj,
          isPublic: true,
        }),
      });

      if (res.ok) {
        setSuccessMsg(selectedAgentId ? "Agent updated!" : "Agent created!");
        setTimeout(() => setSuccessMsg(""), 3000);
        await loadAgents();
      } else {
        alert("Failed to save agent");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving agent");
    } finally {
      setIsSaving(false);
    }
  };

  // Chat with agent handler — creates a new conversation pre-seeded with agent's model and opens it
  const handleChatWithAgent = async () => {
    if (!selectedAgent) return;
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Chat with ${selectedAgent.name}`,
          model: selectedAgent.model || "openai/gpt-4o",
          provider: "OpenRouter",
          systemPrompt: selectedAgent.systemPrompt || "",
          agentId: selectedAgent.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation?.id) {
          setSidebarView("chats");
          router.push(`/c/${data.conversation.id}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete agent handler
  const handleDelete = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this agent?")) return;
    try {
      await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      if (selectedAgentId === agentId) handleCreateNew();
      loadAgents();
    } catch (err) {
      console.error(err);
    }
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  return (
    <div className="flex flex-col h-full bg-[#121212] text-slate-200 select-none overflow-hidden relative">
      {/* ── Top Header Dropdown ────────────────────────────────────────────── */}
      <div className="p-3 border-b border-white/10 bg-[#161616] relative z-30">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#1e1e1e] hover:bg-[#252525] border border-white/10 text-white transition font-medium text-xs"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-base">{selectedAgent?.avatar || (selectedAgentId ? "🤖" : "✨")}</span>
            <span className="font-semibold text-white truncate text-xs">
              {selectedAgent ? selectedAgent.name : "Create New Agent"}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown menu options */}
        {dropdownOpen && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-[#1a1a1a] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 text-xs">
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold transition text-left"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Create New Agent</span>
            </button>

            {agents.length > 0 && <div className="h-px bg-white/10 my-0.5" />}

            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {loading && agents.length === 0 ? (
                <div className="p-2">
                  <SidebarCardsSkeleton count={2} />
                </div>
              ) : (
                agents.map((ag) => (
                  <div
                    key={ag.id}
                    onClick={() => handleSelectAgent(ag)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition ${
                      selectedAgentId === ag.id ? "bg-[#282828] text-white" : "hover:bg-[#222222] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm">{ag.avatar || "🤖"}</span>
                      <span className="font-medium truncate text-xs">{ag.name}</span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(ag.id, e)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Main Body Content (Scrollable) ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        {viewMode === "main" ? (
          /* =========================================================================
             SCREENSHOT 2: MAIN AGENT BUILDER VIEW
             ========================================================================= */
          <>
            {/* Agent Avatar Circle & Name / Description Inputs */}
            <div className="flex items-start gap-3">
              {/* Avatar Upload Circle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 hover:border-emerald-500/60 bg-[#1c1c1c] flex items-center justify-center text-xl transition flex-shrink-0 text-slate-400 hover:text-white"
                >
                  {avatar || <Plus className="w-5 h-5 text-slate-400" />}
                </button>
                {showAvatarPicker && (
                  <div className="absolute top-14 left-0 bg-[#222222] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 grid grid-cols-5 gap-1.5 w-44">
                    {AVATAR_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setAvatar(emoji);
                          setShowAvatarPicker(false);
                        }}
                        className="w-7 h-7 flex items-center justify-center text-base hover:bg-white/10 rounded-lg transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Inputs */}
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Agent name"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition"
                />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What this agent does"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition"
                />
              </div>
            </div>

            {/* Model * and Category * Row */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* MODEL * */}
              <div className="flex flex-col gap-1 relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  MODEL <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-200 flex items-center justify-between hover:border-white/20 transition truncate"
                >
                  <span className="truncate">{model}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
                </button>
                {modelDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#222] border border-white/10 rounded-xl p-1 shadow-2xl z-50 space-y-0.5">
                    {AVAILABLE_MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setModel(m.id);
                          setModelDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                          model === m.id ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "hover:bg-white/5 text-slate-300"
                        }`}
                      >
                        <span className="truncate">{m.name}</span>
                        {model === m.id && <Check className="w-3 h-3 text-emerald-400 ml-1" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CATEGORY * */}
              <div className="flex flex-col gap-1 relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  CATEGORY <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-200 flex items-center justify-between hover:border-white/20 transition capitalize"
                >
                  <span>{category}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                </button>
                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#222] border border-white/10 rounded-xl p-1 shadow-2xl z-50 space-y-0.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs capitalize transition flex items-center justify-between ${
                          category === cat ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "hover:bg-white/5 text-slate-300"
                        }`}
                      >
                        <span>{cat}</span>
                        {category === cat && <Check className="w-3 h-3 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* INSTRUCTIONS Section */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  INSTRUCTIONS
                </span>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <button
                    type="button"
                    onClick={() =>
                      setInstructions((prev) =>
                        prev
                          ? prev + "\n- Respond clearly and concisely with structured output."
                          : "You are a professional assistant specialized in system architecture and execution."
                      )
                    }
                    className="p-1 hover:text-white rounded transition"
                    title="Add template"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstructionsExpanded(true)}
                    className="p-1 hover:text-white rounded transition"
                    title="Expand view"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="The system instructions that the agent uses"
                rows={4}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono leading-relaxed resize-y"
              />
            </div>

            {/* TOOLS Section */}
            <div className="flex flex-col gap-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  TOOLS
                </span>
                <button
                  type="button"
                  onClick={() => setShowToolsPicker(!showToolsPicker)}
                  className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {tools.length === 0 ? (
                <div
                  onClick={() => setShowToolsPicker(true)}
                  className="border border-dashed border-white/15 hover:border-white/30 bg-[#161616] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition"
                >
                  <Plus className="w-5 h-5 text-slate-500 mb-1" />
                  <p className="text-xs font-semibold text-slate-300">No tools yet</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Add a tool to give your agent extra abilities.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#161616] border border-white/10 rounded-xl">
                  {tools.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                    >
                      <Wrench className="w-3 h-3 text-emerald-400" />
                      {t}
                      <button
                        onClick={() => setTools(tools.filter((x) => x !== t))}
                        className="hover:text-red-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tool Library Modal Popup */}
              <ToolLibraryModal
                isOpen={showToolsPicker}
                onClose={() => setShowToolsPicker(false)}
                selectedTools={tools}
                onToggleTool={(toolName) => {
                  if (tools.includes(toolName)) {
                    setTools(tools.filter((t) => t !== toolName));
                  } else {
                    setTools([...tools, toolName]);
                  }
                }}
              />
            </div>

            {/* SKILLS Section */}
            <div className="flex flex-col gap-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  SKILLS
                </span>
                <button
                  type="button"
                  onClick={() => setShowSkillsPicker(!showSkillsPicker)}
                  className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Use all skills Toggle Row */}
              <div className="flex items-center justify-between py-1 px-1 text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">Use all skills</span>
                  <Tooltip content="Allow agent to automatically invoke any installed skill" side="top">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
                  </Tooltip>
                </div>
                <button
                  type="button"
                  onClick={() => setUseAllSkills(!useAllSkills)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center ${
                    useAllSkills ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      useAllSkills ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {skills.length === 0 && !useAllSkills ? (
                <div
                  onClick={() => setShowSkillsPicker(true)}
                  className="border border-dashed border-white/15 hover:border-white/30 bg-[#161616] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition"
                >
                  <Plus className="w-5 h-5 text-slate-500 mb-1" />
                  <p className="text-xs font-semibold text-slate-300">No skills yet</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Add a skill to give your agent reusable instructions.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#161616] border border-white/10 rounded-xl">
                  {useAllSkills && (
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                      ⚡ All System Skills Enabled
                    </span>
                  )}
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                    >
                      {s}
                      <button
                        onClick={() => setSkills(skills.filter((x) => x !== s))}
                        className="hover:text-red-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Skills Picker Overlay */}
              {showSkillsPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#222] border border-white/10 rounded-xl p-2 shadow-2xl z-50 space-y-1">
                  <div className="flex items-center justify-between pb-1 border-b border-white/10 text-slate-400">
                    <span className="font-semibold text-white text-xs">Select Skills</span>
                    <button onClick={() => setShowSkillsPicker(false)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {PRESET_SKILLS.map((sk) => {
                    const isSelected = skills.includes(sk.name);
                    return (
                      <button
                        key={sk.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) setSkills(skills.filter((s) => s !== sk.name));
                          else setSkills([...skills, sk.name]);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                          isSelected ? "bg-indigo-500/20 text-indigo-300" : "hover:bg-white/5 text-slate-300"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-xs text-white">{sk.name}</p>
                          <p className="text-[10px] text-slate-400">{sk.category}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FILE CONTEXT Section */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  FILE CONTEXT
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
              />

              {attachedFiles.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-white/15 hover:border-white/30 bg-[#161616] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition"
                >
                  <Paperclip className="w-5 h-5 text-slate-500 mb-1" />
                  <p className="text-xs font-semibold text-slate-300">No context files attached</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Click to upload documents or files for agent context
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 p-2 bg-[#161616] border border-white/10 rounded-xl">
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-[#222222] border border-white/5 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-200 truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-500">{file.size}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-400 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUPPORT CONTACT Section */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                SUPPORT CONTACT
              </span>
              <input
                type="text"
                value={supportName}
                onChange={(e) => setSupportName(e.target.value)}
                placeholder="Support contact name"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition"
              />
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@example.com"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition"
              />
            </div>

            {/* Advanced Settings Switcher Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setViewMode("advanced")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1a1a1a] hover:bg-[#242424] border border-white/10 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Advanced</span>
              </button>
            </div>
          </>
        ) : (
          /* =========================================================================
             SCREENSHOT 1: ADVANCED SETTINGS VIEW
             ========================================================================= */
          <>
            {/* Nav Row with Back Arrow */}
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("main")}
                className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-white/10 text-slate-300 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-bold text-white">Advanced Settings</h2>
            </div>

            {/* Essentials Section */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-white">Essentials</h3>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-slate-300 font-medium">Max Agent Steps</label>
                  <Tooltip content="Maximum number of steps the agent can execute per invocation" side="top">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
                  </Tooltip>
                </div>
                <input
                  type="text"
                  value={maxSteps}
                  onChange={(e) => setMaxSteps(e.target.value)}
                  placeholder="System"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition"
                />
              </div>
            </div>

            {/* Multi-agent orchestration Section */}
            <div className="flex flex-col gap-2.5 pt-2">
              <div>
                <h3 className="text-xs font-bold text-white">Multi-agent orchestration</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Choose how this agent works with other agents.
                </p>
              </div>

              {/* Handoffs Card */}
              <div className="p-3 bg-[#161616] border border-white/10 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">Handoffs</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold tracking-wider uppercase">
                      BETA
                    </span>
                    <Tooltip content="Transfer conversations seamlessly to specialized secondary agents" side="top">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
                    </Tooltip>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">{handoffs.length} / 10</span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Transfer the conversation to a specialist agent.
                </p>

                {/* Added Handoff Agents List */}
                {handoffs.length > 0 && (
                  <div className="space-y-1 my-1">
                    {handoffs.map((hId) => {
                      const target = agents.find((a) => a.id === hId);
                      return (
                        <div
                          key={hId}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#222] border border-white/10 text-xs text-white"
                        >
                          <div className="flex items-center gap-2">
                            <span>{target?.avatar || "🤖"}</span>
                            <span className="font-semibold">{target?.name || hId}</span>
                          </div>
                          <button
                            onClick={() => setHandoffs(handoffs.filter((id) => id !== hId))}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add handoff agent Dashed Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowHandoffPicker(!showHandoffPicker)}
                    className="w-full border border-dashed border-white/20 hover:border-white/40 bg-[#1c1c1c] rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-slate-300 hover:text-white font-medium transition"
                  >
                    <Plus className="w-4 h-4 text-slate-400" />
                    <span>Add handoff agent</span>
                  </button>

                  {/* Handoff Picker Overlay */}
                  {showHandoffPicker && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#222] border border-white/10 rounded-xl p-2 shadow-2xl z-50 space-y-1">
                      <div className="flex items-center justify-between pb-1 border-b border-white/10 text-slate-400">
                        <span className="font-semibold text-white text-xs">Select Target Agent</span>
                        <button onClick={() => setShowHandoffPicker(false)}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {agents
                        .filter((a) => a.id !== selectedAgentId)
                        .map((ag) => (
                          <button
                            key={ag.id}
                            type="button"
                            onClick={() => {
                              if (!handoffs.includes(ag.id)) setHandoffs([...handoffs, ag.id]);
                              setShowHandoffPicker(false);
                            }}
                            className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-white/5 text-slate-200 transition"
                          >
                            <span>{ag.avatar || "🤖"}</span>
                            <span className="font-semibold text-xs">{ag.name}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Expanded Instructions Overlay Modal ────────────────────────────── */}
      {instructionsExpanded && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#161616] border border-white/15 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-white text-sm">System Instructions</span>
              <button
                onClick={() => setInstructionsExpanded(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Full system instructions..."
              rows={16}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono leading-relaxed"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setInstructionsExpanded(false)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold text-xs hover:brightness-110"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed Bottom Action Buttons ─────────────────────────────── */}
      <div className="p-3 border-t border-white/10 bg-[#161616] flex gap-2">
        {selectedAgent && (
          <button
            type="button"
            onClick={handleChatWithAgent}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/20 transition duration-150"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center shadow-lg shadow-red-900/30 transition duration-150 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : selectedAgentId ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}
