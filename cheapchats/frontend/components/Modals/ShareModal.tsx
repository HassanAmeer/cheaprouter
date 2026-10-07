"use client";

import { useState } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import { X, Share2, Copy, Check } from "lucide-react";

export default function ShareModal() {
  const { activeModal, setActiveModal } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (activeModal !== "share") return null;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "http://localhost:3000";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-dropdown rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4 text-xs text-slate-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Share Conversation Link</h2>
          </div>
          <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-400">
          Anyone with this link will be able to view this conversation snapshot.
        </p>

        <div className="flex items-center gap-2 bg-slate-900 border border-white/10 p-2 rounded-xl">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-semibold flex items-center gap-1 hover:bg-emerald-600 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
