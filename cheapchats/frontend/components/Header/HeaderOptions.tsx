"use client";

import { useAppStore } from "@cheapchats/frontend/lib/store";
import { Layout } from "lucide-react";

export default function HeaderOptions() {
  const { isArtifactsOpen, toggleArtifacts } = useAppStore();

  return (
    <div className="flex items-center gap-1.5">
      {/* Live Preview Panel Toggle Button */}
      <button
        onClick={toggleArtifacts}
        title="Toggle Live Preview Panel"
        className={`p-1.5 rounded-lg border transition duration-200 ${
          isArtifactsOpen
            ? "bg-red-500/20 text-red-300 border-red-500/40"
            : "bg-[#1c1214] text-slate-400 border-white/10 hover:text-slate-200 hover:bg-[#251619]"
        }`}
      >
        <Layout className="w-4 h-4" />
      </button>
    </div>
  );
}
