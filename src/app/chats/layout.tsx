"use client";

import React, { useState, useEffect } from "react";
import "@cheapchats/frontend/styles/globals.css";
import Header from "@cheapchats/frontend/components/Header/Header";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid SSR hydration mismatch from browser extensions
  if (!mounted) {
    return (
      <div className="flex h-screen w-screen bg-[#0B0D10] text-slate-100 overflow-hidden font-sans" suppressHydrationWarning>
        <div className="w-64 h-full bg-[#0F1217] border-r border-[#1E232B] flex-shrink-0" />
        <div className="flex-1 flex flex-col h-full bg-[#0E1116] overflow-hidden">
          <div className="h-14 border-b border-[#1E232B] bg-[#0B0D10]" />
          <div className="flex-1 bg-[#0E1116]" />
        </div>
      </div>
    );
  }

  // If on settings page, render the full-screen Settings view directly
  if (isSettings) {
    return (
      <div className="h-screen w-screen bg-[#0B0D10] overflow-hidden" suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-screen bg-[#0B0D10] text-slate-100 overflow-hidden font-sans"
      suppressHydrationWarning
    >
      {/* Unified Left Sidebar */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Top Header Navigation */}
        <Header />

        {/* Workspace Body */}
        <div className="flex-1 flex overflow-hidden relative min-w-0">
          {/* Chat Workspace / Prompt Workspace */}
          <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative bg-[#0E1116]">
            {sidebarView === "prompts" ? <PromptEditorView /> : children}
          </main>

          {/* Side-panel Artifacts Engine */}
          <ArtifactsViewer />

          {/* Debug Console Drawer */}
          <DebugConsole />
        </div>
      </div>

      {/* Global Modals */}
      <AgentBuilderModal />
      <MCPServerModal />
      <PromptsModal />
      <ShareModal />
    </div>
  );
}
