"use client";

import { useEffect, useRef } from "react";
import MessageItem, { Message } from "./MessageItem";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import { getSuggestionSkillName } from "@cheapchats/frontend/lib/suggestionSkills";
import { ConversationThreadSkeleton } from "@cheapchats/frontend/components/Common/SkeletonLoader";
import { Sparkles, Code, Globe, Zap, ArrowDown, FileText, Workflow, Gamepad2 } from "lucide-react";

interface MessageThreadProps {
  messages: Message[];
  onSendMessage?: (content: string) => void;
  onRegenerate?: () => void;
  onEditUserMessage?: (newContent: string) => void;
  isStreaming?: boolean;
  isLoading?: boolean;
}

export default function MessageThread({
  messages,
  onSendMessage,
  onRegenerate,
  onEditUserMessage,
  isStreaming = false,
  isLoading = false,
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
    const skillName = getSuggestionSkillName(label, type);
    if (skillName) addSelectedSkill(skillName);
  };

  if (isLoading) {
    return <ConversationThreadSkeleton />;
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-xl shadow-red-950/40 mb-4 animate-bounce">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          What can I help with today?
        </h1>

        {/* Quick Suggestion Chips (Compact, Slim Low-Height, Grey Color) */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl w-full mt-6">
          {/* 1. Web Search */}
          <button
            type="button"
            onClick={() => handleSelectSuggestion("Web Search", "Search the web for:")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition shadow-sm text-xs cursor-pointer group select-none"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400 transition flex-shrink-0" />
            <span className="font-medium">Web Search</span>
          </button>

          {/* 2. Mermaid Diagram */}
          <button
            type="button"
            onClick={() => handleSelectSuggestion("Mermaid Diagram", "Create a complete Mermaid.js architecture diagram for:")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition shadow-sm text-xs cursor-pointer group select-none"
          >
            <Zap className="w-3.5 h-3.5 text-zinc-400 group-hover:text-purple-400 transition flex-shrink-0" />
            <span className="font-medium">Mermaid Diagram</span>
          </button>

          {/* 3. HTML page / game */}
          <button
            type="button"
            onClick={() => handleSelectSuggestion("HTML page / game", "Generate an interactive HTML,CSS,JS page or playable game with sound effects for:", "game")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition shadow-sm text-xs cursor-pointer group select-none"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 transition flex-shrink-0" />
            <span className="font-medium">HTML Page / Game</span>
          </button>

          {/* 4. Summarize */}
          <button
            type="button"
            onClick={() => handleSelectSuggestion("Summarize", "Summarize and extract key takeaways of:")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition shadow-sm text-xs cursor-pointer group select-none"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 transition flex-shrink-0" />
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
