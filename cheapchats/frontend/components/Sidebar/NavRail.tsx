"use client";

import { useAppStore } from "@cheapchats/frontend/lib/store";
import type { SidebarView } from "@cheapchats/frontend/lib/store";
import Tooltip from "@cheapchats/frontend/components/Common/Tooltip";
import UserProfileMenu from "@cheapchats/frontend/components/Sidebar/UserProfileMenu";
import {
  PanelLeft,
  SquarePen,
  MessageSquare,
  Bot,
  FileText,
  Sparkles,
  Wrench,
  Brain,
  Paperclip,
  Sliders,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function NavRail() {
  const {
    isSidebarOpen,
    toggleSidebar,
    sidebarView,
    setSidebarView,
    setActiveModal,
  } = useAppStore();
  const router = useRouter();

  const navTo = (view: SidebarView) => {
    if (isSidebarOpen && sidebarView === view) {
      useAppStore.getState().setSidebarOpen(false);
    } else {
      setSidebarView(view);
    }
  };

  const isActive = (view: SidebarView) => isSidebarOpen && sidebarView === view;

  const btnClass = (view?: SidebarView) =>
    `p-2.5 rounded-xl transition duration-150 ${
      view && isActive(view)
        ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40 shadow-lg shadow-red-600/10"
        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
    }`;

  return (
    <aside className="w-14 h-full bg-[#0B0D10] border-r border-[#1E232B] flex flex-col items-center justify-between py-3.5 z-30 flex-shrink-0 select-none">
      {/* Top Icons Section */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Toggle Secondary Sidebar */}
        <Tooltip content="Toggle Sidebar" side="right">
          <button onClick={toggleSidebar} className={btnClass()}>
            <PanelLeft className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="w-8 h-px bg-[#1E232B] my-1" />

        {/* New Chat */}
        <Tooltip content="New Chat" side="right">
          <button
            onClick={() => {
              useAppStore.getState().setActiveProjectId(null);
              setSidebarView("chats");
              router.push("/new");
              router.refresh();
            }}
            className={btnClass()}
          >
            <SquarePen className="w-5 h-5" />
          </button>
        </Tooltip>

        {/* Chats / History */}
        <Tooltip content="Chats & History" side="right">
          <button onClick={() => navTo("chats")} className={btnClass("chats")}>
            <MessageSquare className="w-5 h-5" />
          </button>
        </Tooltip>

        {/* Agents */}
        <Tooltip content="Agents & Assistants" side="right">
          <button onClick={() => navTo("agents")} className={btnClass("agents")}>
            <Bot className="w-5 h-5 text-rose-400" />
          </button>
        </Tooltip>

        {/* System Prompts */}
        <Tooltip content="Prompts Library" side="right">
          <button onClick={() => navTo("prompts")} className={btnClass("prompts")}>
            <FileText className="w-5 h-5 text-amber-400" />
          </button>
        </Tooltip>

        {/* Skills */}
        <Tooltip content="Skills & Rules" side="right">
          <button onClick={() => navTo("skills")} className={btnClass("skills")}>
            <Sparkles className="w-5 h-5 text-rose-400" />
          </button>
        </Tooltip>

        {/* Memory */}
        <Tooltip content="Memory & Knowledge" side="right">
          <button onClick={() => navTo("memory")} className={btnClass("memory")}>
            <Brain className="w-5 h-5 text-rose-300" />
          </button>
        </Tooltip>


        {/* Attachments */}
        <Tooltip content="Uploaded Files" side="right">
          <button onClick={() => navTo("files")} className={btnClass("files")}>
            <Paperclip className="w-5 h-5 text-slate-400" />
          </button>
        </Tooltip>
      </div>

      {/* Bottom Section Icons */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Settings */}
        <Tooltip content="Settings & API Keys" side="right">
          <button
            onClick={() => router.push("/chats/settings")}
            className={btnClass()}
          >
            <Sliders className="w-5 h-5" />
          </button>
        </Tooltip>

        {/* User Account Profile Dropdown */}
        <UserProfileMenu />
      </div>
    </aside>
  );
}
