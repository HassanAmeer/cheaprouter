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
  Brain,
  Heart,
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
    `px-1.5 py-2.5 sm:p-2.5 rounded-xl transition duration-150 ${
      view && isActive(view)
        ? "bg-[#2b1016] text-rose-400 border border-red-500/40 shadow-lg shadow-red-950/40"
        : "text-slate-400 hover:text-red-300 hover:bg-[#1a0f12]"
    }`;

  return (
    <aside className="w-[56px] sm:w-[68px] h-full bg-[#121011] border-r border-[#2a1b1e] flex flex-col items-center justify-between py-3 z-30 flex-shrink-0 select-none">
      {/* Top Icons Section */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Toggle Secondary Sidebar */}
        <Tooltip content="Toggle Sidebar" side="right">
          <button onClick={toggleSidebar} className={btnClass()}>
            <PanelLeft className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="w-8 h-px bg-red-500/15 my-0.5" />

        {/* New Chat */}
        <Tooltip content="New Chat" side="right">
          <button
            onClick={() => {
              useAppStore.getState().setActiveProjectId(null);
              setSidebarView("chats");
              router.push("/chats");
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


        {/* Skills / Memory */}
        <Tooltip content="Skills & Brain" side="right">
          <button onClick={() => navTo("skills")} className={btnClass("skills")}>
            <Brain className="w-5 h-5 text-rose-300" />
          </button>
        </Tooltip>

        {/* Favourites */}
        <Tooltip content="Favourites" side="right">
          <button
            onClick={() => navTo("favourites")}
            className={btnClass("favourites")}
            aria-label="Favourites"
          >
            <Heart className="w-5 h-5 text-rose-400" />
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
