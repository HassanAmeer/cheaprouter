"use client";

import { useAppStore } from "@cheapchats/frontend/lib/store";
import { Layout } from "lucide-react";

export default function HeaderOptions() {
  const { isArtifactsOpen, toggleArtifacts } = useAppStore();

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={toggleArtifacts}
        title="Toggle Live Preview / Artifacts Panel"
        className={`p-2 rounded-lg border transition-all duration-150 cursor-pointer ${
          isArtifactsOpen
            ? "bg-red-500/20 text-red-300 border-red-500/40 shadow-sm"
            : "bg-[#15191E] text-slate-400 border-[#1E232B] hover:text-white hover:bg-[#1A1F26] hover:border-slate-700"
        }`}
      >
        <Layout className="w-4 h-4" />
      </button>
    </div>
  );
}
