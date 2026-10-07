"use client";

import { useAppStore } from "@cheapchats/frontend/lib/store";
import { EyeOff, Eye } from "lucide-react";

export default function IncognitoToggle() {
  const { isIncognito, toggleIncognito } = useAppStore();

  return (
    <button
      onClick={toggleIncognito}
      title={isIncognito ? "Incognito Chat Active (History not saved)" : "Toggle Incognito Temporary Chat"}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition duration-150 border cursor-pointer ${
        isIncognito
          ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/10"
          : "bg-[#15191E] text-slate-400 border-[#1E232B] hover:text-white hover:bg-[#1A1F26] hover:border-slate-700"
      }`}
    >
      {isIncognito ? <EyeOff className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> : <Eye className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{isIncognito ? "Incognito" : "Temporary"}</span>
    </button>
  );
}
