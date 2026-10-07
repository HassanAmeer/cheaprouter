"use client";

import React from "react";
import Header from "@cheapchats/frontend/components/Header/Header";
import DebugConsoleToggle from "@cheapchats/frontend/components/Header/DebugConsoleToggle";
import NavRail from "@cheapchats/frontend/components/Sidebar/NavRail";
import Sidebar from "@cheapchats/frontend/components/Sidebar/Sidebar";
import DebugConsole from "@cheapchats/frontend/components/Chat/DebugConsole";
import ArtifactsViewer from "@cheapchats/frontend/components/Chat/ArtifactsViewer";
import AgentBuilderModal from "@cheapchats/frontend/components/Modals/AgentBuilderModal";
import MCPServerModal from "@cheapchats/frontend/components/Modals/MCPServerModal";
import PromptsModal from "@cheapchats/frontend/components/Modals/PromptsModal";
import ShareModal from "@cheapchats/frontend/components/Modals/ShareModal";
import PromptEditorView from "@cheapchats/frontend/components/Prompt/PromptEditorView";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import { usePathname } from "next/navigation";

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  const { sidebarView } = useAppStore();
  const pathname = usePathname();
  const isSettings = pathname === "/chats/settings";

  // If on settings page, render the full-screen Settings view directly
  if (isSettings) {
    return <div className="h-screen w-screen bg-[#0d0709] overflow-hidden">{children}</div>;
  }

  return (
    <div className="flex h-screen w-screen bg-[#12090b] text-slate-100 overflow-hidden font-sans">
      {/* Floating Top-Right Terminal Debug Button */}
      <DebugConsoleToggle />

      {/* Far-Left Narrow Icon Rail */}
      <NavRail />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Navigation */}
        <Header />

        {/* Workspace Body */}
        <div className="flex-1 flex overflow-hidden relative min-w-0">
          {/* Secondary Left Drawer (Projects & Chats) */}
          <Sidebar />

          {/* Chat Workspace / Prompt Workspace */}
          <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative bg-[#130a0c]">
            {sidebarView === "prompts" ? <PromptEditorView /> : children}
          </main>

          {/* Side-panel Artifacts Engine */}
          <ArtifactsViewer />

          {/* Debug Console Drawer */}
          <DebugConsole />
        </div>
      </div>

      {/* Global Modals (SettingsModal removed in favor of full SettingsPage) */}
      <AgentBuilderModal />
      <MCPServerModal />
      <PromptsModal />
      <ShareModal />
    </div>
  );
}
