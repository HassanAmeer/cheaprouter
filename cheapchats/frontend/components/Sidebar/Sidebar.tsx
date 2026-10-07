"use client";

import { useAppStore } from "@cheapchats/frontend/lib/store";
import ConversationList from "./ConversationList";
import Tooltip from "@cheapchats/frontend/components/Common/Tooltip";
import {
  FolderPlus,
  SquarePen,
  Bot,
  FileText,
  Wrench,
  Brain,
  Paperclip,
  Plus,
  Search,
  Server,
  PlugZap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ── Agents Panel ──────────────────────────────────────────────────────────────
function AgentsPanel() {
  const { setActiveModal } = useAppStore();
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => setAgents(d.agents || []));
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Agents</span>
        </div>
        <Tooltip content="Create New Agent" side="bottom">
          <button
            onClick={() => setActiveModal("agentBuilder")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252525] transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {agents.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-[11px] text-slate-500">No agents yet</p>
            <button
              onClick={() => setActiveModal("agentBuilder")}
              className="mt-2 text-[11px] text-purple-400 hover:underline"
            >
              Create your first agent
            </button>
          </div>
        ) : (
          agents.map((agent: any) => (
            <div
              key={agent.id}
              className="flex items-start gap-2 px-2.5 py-2 rounded-xl hover:bg-[#212121] cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-200 truncate">{agent.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{agent.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Prompts Panel ─────────────────────────────────────────────────────────────
function PromptsPanel() {
  const { setActiveModal } = useAppStore();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/prompts")
      .then((r) => r.json())
      .then((d) => setPrompts(d.prompts || []));
  }, []);

  const filtered = prompts.filter((p) => {
    const name = (p?.name || "").toLowerCase();
    const content = (p?.content || "").toLowerCase();
    const q = (query || "").toLowerCase();
    return name.includes(q) || content.includes(q);
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Prompts</span>
        </div>
        <Tooltip content="New Prompt" side="bottom">
          <button
            onClick={() => setActiveModal("prompts")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252525] transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
      <div className="px-2 pt-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full bg-[#1e1e1e] border border-white/5 rounded-xl pl-7 pr-2 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 mt-1">
        {filtered.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-[11px] text-slate-500">No prompts found</p>
          </div>
        ) : (
          filtered.map((p: any) => (
            <div
              key={p.id}
              className="flex items-start gap-2 px-2.5 py-2 rounded-xl hover:bg-[#212121] cursor-pointer group border border-transparent hover:border-white/5"
            >
              <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-3 h-3 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-200 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-500 line-clamp-2">{p.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── MCP / Skills Panel ────────────────────────────────────────────────────────
function MCPPanel() {
  const { setActiveModal } = useAppStore();
  const [servers, setServers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/mcp")
      .then((r) => r.json())
      .then((d) => setServers(d.servers || []))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">Skills & MCP</span>
        </div>
        <Tooltip content="Add MCP Server" side="bottom">
          <button
            onClick={() => setActiveModal("mcpServer")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252525] transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {servers.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <Server className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-[11px] text-slate-500">No MCP servers connected</p>
            <button
              onClick={() => setActiveModal("mcpServer")}
              className="mt-2 text-[11px] text-emerald-400 hover:underline"
            >
              Connect a server
            </button>
          </div>
        ) : (
          servers.map((s: any) => (
            <div
              key={s.id}
              className="flex items-start gap-2 px-2.5 py-2 rounded-xl hover:bg-[#212121] cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <PlugZap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-200 truncate">{s.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{s.transport} · {s.url || s.command}</p>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${s.status === "connected" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                {s.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


// ── Files / Memory Panel ──────────────────────────────────────────────────────
function FilesPanel() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-semibold text-white">Memory & Files</span>
        </div>
        <Tooltip content="Upload File" side="bottom">
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252525] transition">
            <Plus className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="px-2 py-4 text-center">
          <Paperclip className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-[11px] text-slate-500">No files uploaded yet</p>
          <p className="text-[10px] text-slate-600 mt-1">Files attached in chats appear here</p>
        </div>
      </div>
    </div>
  );
}

import AgentsSidebarPanel from "./AgentsSidebarPanel";
import PromptsSidebarPanel from "./PromptsSidebarPanel";
import SkillsSidebarPanel from "./SkillsSidebarPanel";
import MemorySidebarPanel from "./MemorySidebarPanel";
import FilesSidebarPanel from "./FilesSidebarPanel";

// ── Main Sidebar Component ────────────────────────────────────────────────────
export default function Sidebar() {
  const { isSidebarOpen, sidebarView, setSidebarView } = useAppStore();
  const router = useRouter();

  if (!isSidebarOpen) return null;

  if (sidebarView === "agents") {
    return (
      <aside className="w-80 md:w-[340px] h-full bg-[#121212] border-r border-white/10 flex flex-col z-20 flex-shrink-0 select-none transition-all duration-200">
        <AgentsSidebarPanel />
      </aside>
    );
  }

  if (sidebarView === "prompts") {
    return (
      <aside className="w-72 md:w-80 h-full bg-[#121212] border-r border-white/10 flex flex-col z-20 flex-shrink-0 select-none transition-all duration-200">
        <PromptsSidebarPanel />
      </aside>
    );
  }

  if (sidebarView === "skills") {
    return (
      <aside className="w-72 md:w-80 h-full bg-[#121212] border-r border-white/10 flex flex-col z-20 flex-shrink-0 select-none transition-all duration-200">
        <SkillsSidebarPanel />
      </aside>
    );
  }

  if (sidebarView === "memory") {
    return (
      <aside className="w-72 md:w-80 h-full bg-[#121212] border-r border-white/10 flex flex-col z-20 flex-shrink-0 select-none transition-all duration-200">
        <MemorySidebarPanel />
      </aside>
    );
  }

  if (sidebarView === "files") {
    return (
      <aside className="w-72 md:w-80 h-full bg-[#121212] border-r border-white/10 flex flex-col z-20 flex-shrink-0 select-none transition-all duration-200">
        <FilesSidebarPanel />
      </aside>
    );
  }


  const renderPanel = () => {
    return <ChatsPanel />;
  };

  return (
    <aside className="w-56 md:w-60 h-full bg-[#140d0f] border-r border-red-500/10 flex flex-col z-20 flex-shrink-0 select-none transition-all duration-200">
      {/* Dynamic panel content */}

      {/* Dynamic panel content */}
      <div className="flex-1 overflow-hidden">
        {renderPanel()}
      </div>
    </aside>
  );
}

// ── Chats Panel (default) ─────────────────────────────────────────────────────
function ChatsPanel() {
  return <ConversationList />;
}
