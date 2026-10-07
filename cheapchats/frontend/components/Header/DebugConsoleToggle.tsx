"use client";

import { useAppStore } from "@cheapchats/frontend/lib/store";
import { Terminal } from "lucide-react";
import { BRAND_CONFIG } from "@cheapchats/frontend/lib/brandConfig";

export default function DebugConsoleToggle() {
  const { isDebugConsoleOpen, toggleDebugConsole } = useAppStore();

  if (!BRAND_CONFIG.showDebugConsole) {
    return null;
  }

  return (
    <button
      onClick={toggleDebugConsole}
      title="Toggle Debug Console (Raw prompts, latency, token usage)"
      className={`fixed top-3 right-4 z-50 p-2.5 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer ${
        isDebugConsoleOpen
          ? "bg-red-600/30 text-red-300 border-red-500/50 shadow-red-950/50 scale-105"
          : "bg-[#180f11]/90 text-slate-300 border-red-500/20 hover:text-white hover:bg-red-950/60 hover:border-red-500/40 shadow-black/40"
      }`}
    >
      <Terminal className="w-4 h-4 text-red-400" />
    </button>
  );
}
