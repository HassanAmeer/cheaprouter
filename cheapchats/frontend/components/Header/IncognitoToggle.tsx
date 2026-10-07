"use client";

import { useAppStore } from "@cheapchats/frontend/lib/store";
import { EyeOff, Eye } from "lucide-react";

export default function IncognitoToggle() {
  const { isIncognito, toggleIncognito } = useAppStore();

  return (
    <button
      onClick={toggleIncognito}
      title={isIncognito ? "Incognito Chat Active (History not saved)" : "Toggle Incognito Temporary Chat"}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition duration-200 border ${
        isIncognito
          ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-500/10"
          : "bg-slate-800/60 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-slate-700/60"
      }`}
    >
      {isIncognito ? <EyeOff className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> : <Eye className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{isIncognito ? "Temporary" : "Incognito"}</span>
    </button>
  );
}
