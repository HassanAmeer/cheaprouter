"use client";

import { useEffect, useRef } from "react";
import MessageItem, { Message } from "./MessageItem";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import { Sparkles, Globe, Zap, FileText, Gamepad2 } from "lucide-react";

interface MessageThreadProps {
  messages: Message[];
  onSendMessage?: (content: string) => void;
  onRegenerate?: () => void;
  onEditUserMessage?: (newContent: string) => void;
  isStreaming?: boolean;
}

export default function MessageThread({
  messages,
  onSendMessage,
  onRegenerate,
  onEditUserMessage,
  isStreaming = false,
}: MessageThreadProps) {
  const { setActiveSuggestionChip, addSelectedSkill } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSelectSuggestion = (label: string, prefix: string, type?: string) => {
    setActiveSuggestionChip({ label, prefix, type });
    if (type === "game" || label === "HTML page / game") {
      addSelectedSkill("HTML Page / Game & Sound");
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        {/* Sleek Hero Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-950/40 mb-3.5 border border-red-400/30">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
          What can I help with today?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-7 leading-relaxed">
          Select any provider from the top header or choose a quick prompt shortcut below.
        </p>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl w-full">
          {/* 1. Web Search */}
          <button
            type="button"
            onClick={() => handleSelectSuggestion("Web Search", "Search the web for:")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#15191E] hover:bg-[#1A1F26] border border-[#262C34] hover:border-slate-600 text-slate-300 hover:text-white transition shadow-sm text-xs cursor-pointer group select-none"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="font-medium">Web Search</span>
          </button>

          {/* 2. Mermaid Diagram */}
          <button
            type="button"
            onClick={() => handleSelectSuggestion("Mermaid Diagram", "Create a complete Mermaid.js architecture diagram for:")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#15191E] hover:bg-[#1A1F26] border border-[#262C34] hover:border-slate-600 text-slate-300 hover:text-white transition shadow-sm text-xs cursor-pointer group select-none"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="font-medium">Mermaid Diagram</span>
          </button>

          {/* 3. HTML page / game */}
          <button
            type="button"
            onClick={() => handleSelectSuggestion("HTML page / game", "Generate an interactive HTML,CSS,JS page or playable game with sound effects for:", "game")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#15191E] hover:bg-[#1A1F26] border border-[#262C34] hover:border-slate-600 text-slate-300 hover:text-white transition shadow-sm text-xs cursor-pointer group select-none"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">HTML Page / Game</span>
          </button>

          {/* 4. Summarize */}
          <button
            type="button"
            onClick={() => handleSelectSuggestion("Summarize", "Summarize and extract key takeaways of:")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#15191E] hover:bg-[#1A1F26] border border-[#262C34] hover:border-slate-600 text-slate-300 hover:text-white transition shadow-sm text-xs cursor-pointer group select-none"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <span className="font-medium">Summarize</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 overflow-y-auto relative custom-scrollbar">
      {messages.map((msg, index) => (
        <MessageItem
          key={msg.id || index}
          message={msg}
          onRegenerate={msg.sender === "assistant" ? onRegenerate : undefined}
          onEdit={msg.sender === "user" ? onEditUserMessage : undefined}
          isStreaming={isStreaming && index === messages.length - 1}
        />
      ))}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
