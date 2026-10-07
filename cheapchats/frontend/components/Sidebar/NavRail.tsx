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
    `flex h-9 w-full items-center justify-center rounded-[5px] p-1.5 transition-none focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7f1d1d] focus-visible:outline-offset-0 sm:h-auto sm:w-auto sm:rounded-xl sm:p-2.5 sm:transition-all sm:duration-150 ${
      view && isActive(view)
        ? "border border-red-500/40 bg-[#2b1016] text-rose-400 shadow-sm shadow-red-950/30 sm:shadow-lg sm:shadow-red-950/40"
        : "text-slate-400 hover:text-red-300 hover:bg-[#1a0f12]"
    }`;

  return (
    <aside className="mobile-nav-rail z-30 flex h-full w-12 flex-shrink-0 select-none flex-col items-center justify-between border-r border-[#2a1b1e] bg-[#121011] py-1.5 sm:w-[68px] sm:py-3">
      {/* Top Icons Section */}
      <div className="flex w-full flex-col items-center gap-2 sm:gap-3">
        {/* Toggle Secondary Sidebar */}
        <Tooltip content="Toggle Sidebar" side="right">
          <button onClick={toggleSidebar} className={btnClass()}>
            <PanelLeft className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          </button>
        </Tooltip>

        <div className="my-0 w-6 h-px bg-red-500/15 sm:my-0.5 sm:w-8" />

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
            <SquarePen className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          </button>
        </Tooltip>

        {/* Chats / History */}
        <Tooltip content="Chats & History" side="right">
          <button onClick={() => navTo("chats")} className={btnClass("chats")}>
            <MessageSquare className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          </button>
        </Tooltip>

        {/* Agents */}
        <Tooltip content="Agents & Assistants" side="right">
          <button onClick={() => navTo("agents")} className={btnClass("agents")}>
            <Bot className="h-[18px] w-[18px] text-rose-400 sm:h-5 sm:w-5" />
          </button>
        </Tooltip>

        {/* System Prompts */}
        <Tooltip content="Prompts Library" side="right">
          <button onClick={() => navTo("prompts")} className={btnClass("prompts")}>
            <FileText className="h-[18px] w-[18px] text-amber-400 sm:h-5 sm:w-5" />
          </button>
        </Tooltip>


        {/* Skills / Memory */}
        <Tooltip content="Skills & Brain" side="right">
          <button onClick={() => navTo("skills")} className={btnClass("skills")}>
            <Brain className="h-[18px] w-[18px] text-rose-300 sm:h-5 sm:w-5" />
          </button>
        </Tooltip>

        {/* Favourites */}
        <Tooltip content="Favourites" side="right">
          <button
            onClick={() => navTo("favourites")}
            className={btnClass("favourites")}
            aria-label="Favourites"
          >
            <Heart className="h-[18px] w-[18px] text-rose-400 sm:h-5 sm:w-5" />
          </button>
        </Tooltip>

        {/* Attachments */}
        <Tooltip content="Uploaded Files" side="right">
          <button onClick={() => navTo("files")} className={btnClass("files")}>
            <Paperclip className="h-[18px] w-[18px] text-rose-300 sm:h-5 sm:w-5" />
          </button>
        </Tooltip>
      </div>

      {/* Bottom Section Icons */}
      <div className="flex w-full flex-col items-center gap-2 sm:gap-3">
        {/* Settings */}
        <Tooltip content="Settings & API Keys" side="right">
          <button
            onClick={() => router.push("/chats/settings")}
            className={btnClass()}
          >
            <Sliders className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          </button>
        </Tooltip>

        {/* User Account Profile Dropdown */}
        <UserProfileMenu />
      </div>
    </aside>
  );
}
