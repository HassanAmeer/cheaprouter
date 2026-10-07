"use client";

import { useAppStore } from "@cheapchats/frontend/lib/store";
import { EyeOff, Eye } from "lucide-react";

export default function IncognitoHeaderToggle() {
  const { isIncognito, toggleIncognito } = useAppStore();

  return (
    <div
      className={`px-4 py-2.5 border-b flex items-center justify-between transition-all duration-200 select-none ${
        isIncognito
          ? "bg-red-950/20 border-red-500/30 opacity-100"
          : "bg-[#140c0e]/50 border-white/5 opacity-50 hover:opacity-90"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
            isIncognito
              ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-900/30"
              : "bg-white/5 text-slate-400 border border-white/10"
          }`}
        >
          {isIncognito ? <EyeOff className="w-4 h-4 text-red-400 animate-pulse" /> : <Eye className="w-4 h-4" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${isIncognito ? "text-white" : "text-slate-400"}`}>
              Incognito
            </span>
            {isIncognito && (
              <span className="text-[10px] bg-red-500/20 text-red-300 font-semibold px-2 py-0.5 rounded-full border border-red-500/30">
                Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Temporary Chat</p>
        </div>
      </div>

      {/* Switch Toggle Button */}
      <button
        type="button"
        onClick={toggleIncognito}
        className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex items-center px-1 flex-shrink-0 cursor-pointer ${
          isIncognito ? "bg-red-600 shadow-md shadow-red-900/40" : "bg-[#252525] border border-white/15"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${
            isIncognito ? "bg-white translate-x-5" : "bg-slate-400 translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
