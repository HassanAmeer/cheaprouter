"use client";

import { useAppStore } from "@cheapchats/frontend/lib/store";
import { Terminal } from "lucide-react";

export default function DebugConsoleToggle() {
  const { isDebugConsoleOpen, toggleDebugConsole } = useAppStore();

  return (
    <button
      onClick={toggleDebugConsole}
      title="Toggle Debug Console (Raw prompts, latency, token usage)"
      className={`p-2 rounded-lg border transition-all duration-150 cursor-pointer ${
        isDebugConsoleOpen
          ? "bg-red-500/20 text-red-300 border-red-500/40 shadow-sm"
          : "bg-[#15191E] text-slate-400 border-[#1E232B] hover:text-white hover:bg-[#1A1F26] hover:border-slate-700"
      }`}
    >
      <Terminal className="w-4 h-4 text-red-400" />
    </button>
  );
}
