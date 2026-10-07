"use client";

import { useAppStore } from "@cheapchats/frontend/lib/store";
import ConversationList from "./ConversationList";
import UserProfileMenu from "./UserProfileMenu";
import Link from "next/link";
import {
  PanelLeft,
  Zap,
  Bot,
  FileText,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import AgentsSidebarPanel from "./AgentsSidebarPanel";
import PromptsSidebarPanel from "./PromptsSidebarPanel";
import SkillsSidebarPanel from "./SkillsSidebarPanel";
import MemorySidebarPanel from "./MemorySidebarPanel";
import FilesSidebarPanel from "./FilesSidebarPanel";

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar, sidebarView, setSidebarView } = useAppStore();

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-64 md:w-72 h-full bg-[#0F1217] border-r border-[#1E232B] flex flex-col z-20 flex-shrink-0 select-none transition-all duration-200">
      {/* Top Header of Sidebar */}
      <div className="h-14 px-4 border-b border-[#1E232B] flex items-center justify-between flex-shrink-0 bg-[#0B0D10]">
        <Link
          href="/chats"
          onClick={() => setSidebarView("chats")}
          className="flex items-center gap-2.5 font-bold text-sm text-white hover:text-red-400 transition"
        >
          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-sm shadow-red-950/40">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="tracking-tight">CheapChats</span>
        </Link>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#15191E] border border-transparent hover:border-[#1E232B] transition cursor-pointer"
          title="Collapse sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main Dynamic Panel Body */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-[#0F1217]">
        {sidebarView === "agents" ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-2 border-b border-[#1E232B] bg-[#0B0D10]">
              <button
                onClick={() => setSidebarView("chats")}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Chats</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AgentsSidebarPanel />
            </div>
          </div>
        ) : sidebarView === "prompts" ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-2 border-b border-[#1E232B] bg-[#0B0D10]">
              <button
                onClick={() => setSidebarView("chats")}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Chats</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PromptsSidebarPanel />
            </div>
          </div>
        ) : sidebarView === "skills" ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-2 border-b border-[#1E232B] bg-[#0B0D10]">
              <button
                onClick={() => setSidebarView("chats")}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Chats</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SkillsSidebarPanel />
            </div>
          </div>
        ) : sidebarView === "memory" ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-2 border-b border-[#1E232B] bg-[#0B0D10]">
              <button
                onClick={() => setSidebarView("chats")}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Chats</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MemorySidebarPanel />
            </div>
          </div>
        ) : sidebarView === "files" ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-2 border-b border-[#1E232B] bg-[#0B0D10]">
              <button
                onClick={() => setSidebarView("chats")}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Chats</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <FilesSidebarPanel />
            </div>
          </div>
        ) : (
          <ConversationList />
        )}
      </div>

      {/* Bottom Footer Section: Quick Tools + User Profile */}
      <div className="border-t border-[#1E232B] p-2.5 space-y-2 bg-[#0B0D10] flex-shrink-0">
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setSidebarView(sidebarView === "agents" ? "chats" : "agents")}
            className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
              sidebarView === "agents"
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Agents & Assistants"
          >
            <Bot className="w-3.5 h-3.5 text-rose-400" />
            <span>Agents</span>
          </button>

          <button
            onClick={() => setSidebarView(sidebarView === "prompts" ? "chats" : "prompts")}
            className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
              sidebarView === "prompts"
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Prompts Library"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Prompts</span>
          </button>

          <button
            onClick={() => setSidebarView(sidebarView === "skills" ? "chats" : "skills")}
            className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
              sidebarView === "skills"
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Skills & MCP"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Skills</span>
          </button>
        </div>

        {/* User Account Row */}
        <div className="pt-1.5 border-t border-[#1E232B]/80">
          <UserProfileMenu />
        </div>
      </div>
    </aside>
  );
}
