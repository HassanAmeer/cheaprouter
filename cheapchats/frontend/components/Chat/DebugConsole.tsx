"use client";

import { useAppStore } from "@cheapchats/frontend/lib/store";
import { AlertTriangle } from "lucide-react";
import { X, Terminal, Cpu, DollarSign, Clock, Hash, Code } from "lucide-react";

export default function DebugConsole() {
  const { isDebugConsoleOpen, toggleDebugConsole, debugData } = useAppStore();

  const data = debugData || {
    rawSystemPrompt: "You are a senior principal full-stack AI assistant for CheapChat.",
    rawMessages: [
      { role: "system", content: "System prompt active" },
      { role: "user", content: "Hello! Show me the debug console data." }
    ],
    model: "openai/gpt-4o",
    provider: "OpenRouter",
    tokens: 284,
    cost: 0.00284,
    latencyMs: 342,
    temperature: 0.7,
  };

  const hasError = data.errorCode !== undefined;
  if (!isDebugConsoleOpen && !hasError) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-80 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 z-40 flex flex-col shadow-2xl transition-all duration-300">
      {/* Header Bar */}
      <div className="h-10 px-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-xs text-white">Debug Console Drawer</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
            {data.model} ({data.provider})
          </span>
        </div>

        <button
          onClick={toggleDebugConsole}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {(isDebugConsoleOpen || hasError) && (
      <>
      <div className="grid grid-cols-4 gap-2 p-3 border-b border-white/10 bg-slate-900/40">
        <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Latency</div>
            <div className="text-xs font-mono font-bold text-white">{data.latencyMs} ms</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2.5">
          <Hash className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Tokens</div>
            <div className="text-xs font-mono font-bold text-emerald-300">{data.tokens}</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2.5">
          <DollarSign className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Est. Cost</div>
            <div className="text-xs font-mono font-bold text-amber-300">${data.cost.toFixed(5)}</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Temperature</div>
            <div className="text-xs font-mono font-bold text-purple-300">{data.temperature}</div>
          </div>
        </div>
      </div>

      {data.errorCode !== undefined && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-red-950/30 border border-red-500/30">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-red-300 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            HTTP {data.errorCode}
          </div>
          <pre className="text-red-200 whitespace-pre-wrap break-words max-h-20 overflow-y-auto font-mono">
            {data.errorText || "No response body"}
          </pre>
        </div>
      )}

      {/* Raw Payload Inspector */}
      <div className="flex-1 p-3 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Code className="w-3.5 h-3.5 text-blue-400" />
            <span>Raw System Prompt</span>
          </div>
          <pre className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-36">
            {data.rawSystemPrompt}
          </pre>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>Raw Messages JSON Payload</span>
          </div>
          <pre className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-36">
            {JSON.stringify(data.rawMessages, null, 2)}
          </pre>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
