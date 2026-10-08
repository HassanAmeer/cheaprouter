"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  isArtifactCodeIncomplete,
  parseAllArtifactFiles,
} from "@cheapchats/frontend/lib/artifactParser";
import {
  cleanTextForSpeech,
  getBestVoice,
  getEffectiveTtsSettings,
} from "@cheapchats/frontend/lib/speechUtils";
import Tooltip from "@cheapchats/frontend/components/Common/Tooltip";
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Edit3,
  GitFork,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  Terminal,
  FileCode,
  Zap,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Brain,
  Globe,
  Sparkles,
  AlertTriangle,
  User,
} from "lucide-react";

const executedAgentActions = new Set<string>();

export interface Message {
  id: string;
  sender: "user" | "assistant" | "system";
  content: string;
  model?: string;
  provider?: string;
  tokens?: number;
  cost?: number;
  feedback?: "up" | "down" | null;
  attachments?: any[] | string;
  queueStatus?: string;
  isError?: boolean;
  canRetry?: boolean;
  createdAt: number;
}

interface MessageItemProps {
  message: Message;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  isStreaming?: boolean;
}

// Simple markdown renderer for assistant messages
function renderMarkdown(
  text: string,
  onOpenArtifact?: (lang: string, code: string) => void,
  isStreaming = false,
  messageHasError = false
): React.ReactNode {
  // Strip out memory XML tags so they don't show up in the UI (forgiving regex for AI typos)
  const cleanedText = text.replace(/<cheapchat(?:Memory)?[^>]*>[\s\S]*?<\/cheapchat(?:Memory)?>/gi, "");
  const lines = cleanedText.split("\n");
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      const cleanLang = lang || "code";
      const codeContent = codeLines.join("\n");

      const isPatch = cleanLang === "artifact" && (codeContent.includes('type="patch"') || codeContent.includes("<<<<<<< SEARCH") || codeContent.includes("<<<< SEARCH"));
      const parsedCodeArtifact = cleanLang === "artifact" && !isPatch
        ? parseAllArtifactFiles(codeContent)
        : null;
      const isPartialCode = !isPatch && (
        parsedCodeArtifact?.files?.some((file) => isArtifactCodeIncomplete(file.content, file.language)) ??
        isArtifactCodeIncomplete(codeContent, cleanLang)
      );
      const canResume = !isStreaming && !isPatch && (isPartialCode || messageHasError);

      // Extract Artifact Title & File Name
      let displayTitle = "";
      let displayFileName = "index.html";

      // 1. Try to extract title from <cheapchatArtifact ... title="...">
      const artifactTitleMatch = codeContent.match(/<cheapchatArtifact[^>]*title=["']([^"']+)["']/i);
      if (artifactTitleMatch && artifactTitleMatch[1]) {
        displayTitle = artifactTitleMatch[1].trim();
      }

      // 2. Try to extract filePath from <cheapchatAction ... filePath="...">
      const actionFileMatch = codeContent.match(/<cheapchatAction[^>]*filePath=["']([^"']+)["']/i);
      if (actionFileMatch && actionFileMatch[1]) {
        displayFileName = actionFileMatch[1].trim();
      } else {
        const commentFileMatch = codeContent.match(/(?:<!--|\/\*|\/\/)\s*([a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+)/i);
        if (commentFileMatch && commentFileMatch[1]) {
          displayFileName = commentFileMatch[1].trim();
        } else if (cleanLang === "css") {
          displayFileName = "style.css";
        } else if (cleanLang === "javascript" || cleanLang === "js") {
          displayFileName = "script.js";
        } else if (cleanLang === "svg") {
          displayFileName = "graphic.svg";
        } else if (cleanLang === "python" || cleanLang === "py") {
          displayFileName = "main.py";
        } else {
          displayFileName = "index.html";
        }
      }

      // 3. Fallback title from HTML <title> tag if not found
      if (!displayTitle) {
        const htmlTitleMatch = codeContent.match(/<title>([^<]+)<\/title>/i);
        if (htmlTitleMatch && htmlTitleMatch[1]) {
          displayTitle = htmlTitleMatch[1].trim();
        }
      }

      // 4. Try <h1> tag
      if (!displayTitle) {
        const h1Match = codeContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match && h1Match[1] && h1Match[1].trim().length < 50) {
          displayTitle = h1Match[1].trim();
        }
      }

      // 5. Try leading comment title (e.g. <!-- Flappy Bird Game --> or // Pong Game)
      if (!displayTitle) {
        const commentMatch = codeContent.match(/^(?:<!--|\/\*|\/\/)\s*(?:title|project|game|app)?[:\s-]*([a-zA-Z0-9\s-]{3,40})(?:-->|\*\/)?/im);
        if (commentMatch && commentMatch[1]) {
          const cand = commentMatch[1].trim();
          if (!cand.toLowerCase().startsWith("doctype") && !cand.toLowerCase().startsWith("eslint") && !cand.includes(".html")) {
            displayTitle = cand;
          }
        }
      }

      // 6. Clean up any generic "Generated Project Artifact" or raw "artifact" words
      if (displayTitle) {
        displayTitle = displayTitle.replace(/\bartifact\b/gi, "").replace(/generated\s+/gi, "").trim();
      }

      // 7. If still empty, synthesize an intelligent title based on code content
      if (!displayTitle || displayTitle.length < 3) {
        if (isPatch) {
          displayTitle = "Targeted Code Patch";
        } else if (/snake/i.test(codeContent)) {
          displayTitle = "Classic Snake Game";
        } else if (/pong|paddle/i.test(codeContent)) {
          displayTitle = "Pong Arcade Game";
        } else if (/flappy|bird/i.test(codeContent)) {
          displayTitle = "Flappy Bird Game";
        } else if (/space|shooter|invader|asteroid/i.test(codeContent)) {
          displayTitle = "Space Shooter Game";
        } else if (/canvas|requestAnimationFrame|gameLoop/i.test(codeContent)) {
          displayTitle = "Playable Web Game";
        } else if (cleanLang === "svg") {
          displayTitle = "Vector Graphic";
        } else if (cleanLang === "html" || codeContent.includes("<!DOCTYPE")) {
          displayTitle = "Interactive Web Application";
        } else {
          displayTitle = `${cleanLang.toUpperCase()} Code`;
        }
      }

      result.push(
        <div
          key={`code-${i}`}
          onClick={() => onOpenArtifact && onOpenArtifact(cleanLang, codeContent)}
          className={`my-3 p-3 rounded-2xl backdrop-blur-xl border flex items-center justify-between gap-2.5 cursor-pointer transition group select-none shadow-xl w-full min-w-0 ${
            isPatch
              ? "bg-[#18140a]/90 border-amber-500/30 hover:border-amber-500/60 shadow-amber-950/40"
              : "bg-[var(--surface-card,#180a0d)]/90 border-red-500/30 hover:border-red-500/60 shadow-black/60"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold group-hover:scale-105 transition flex-shrink-0 ${
                isPatch
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-red-500/20 border-red-500/40 text-red-400"
              }`}
            >
              {isPatch ? <Zap className="w-5 h-5 animate-pulse" /> : <FileCode className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-xs text-white truncate">
                {displayTitle}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate font-mono flex items-center gap-1.5">
                <span>{displayFileName}</span>
                {isPatch && <span className="text-[10px] text-amber-400/90 font-sans">• Patch</span>}
                {isPartialCode && <span className="text-[10px] text-amber-400 font-sans font-medium">• Incomplete</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canResume && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  useAppStore.getState().setPendingPromptText({
                    text: `Continue writing ${displayFileName} from where you stopped. Complete the remaining code seamlessly.`,
                    autoSubmit: true,
                  });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1 transition"
                title="Resume writing remaining code with selected model"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenArtifact && onOpenArtifact(cleanLang, codeContent);
              }}
              className={`px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5 ${
                isPatch
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-900/50"
                  : "bg-red-600 hover:bg-red-500 shadow-red-900/50"
              }`}
            >
              <span>{isPatch ? "Patch" : "Preview"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
      i++; // skip closing ```
      continue;
    }

    // Heading h3
    if (line.startsWith("### ")) {
      result.push(
        <h3 key={`h3-${i}`} className="text-sm font-bold text-white mt-3 mb-1">
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Heading h2
    if (line.startsWith("## ")) {
      result.push(
        <h2 key={`h2-${i}`} className="text-base font-bold text-white mt-4 mb-1">
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // Heading h1
    if (line.startsWith("# ")) {
      result.push(
        <h1 key={`h1-${i}`} className="text-lg font-bold text-white mt-4 mb-2">
          {parseInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line === "---" || line === "***" || line === "___") {
      result.push(<hr key={`hr-${i}`} className="border-white/10 my-3" />);
      i++;
      continue;
    }

    // Bullet list item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(
          <li key={`li-${i}`} className="ml-4 text-slate-200 list-disc">
            {parseInline(lines[i].slice(2))}
          </li>
        );
        i++;
      }
      result.push(<ul key={`ul-${i}`} className="my-1.5 space-y-0.5">{items}</ul>);
      continue;
    }

    // Numbered list item
    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(
          <li key={`oli-${i}`} className="ml-4 text-slate-200 list-decimal">
            {parseInline(lines[i].replace(/^\d+\.\s/, ""))}
          </li>
        );
        i++;
      }
      result.push(<ol key={`ol-${i}`} className="my-1.5 space-y-0.5">{items}</ol>);
      continue;
    }

    // Blockquote (Detect Agent Action)
    if (line.startsWith("> ")) {
      const bqContent = line.slice(2);
      if (bqContent.includes("🤖 **Agent Action:**")) {
        const actionDataMatch = bqContent.match(/`([^`]+)` on `([^`]+)`/);
        const action = actionDataMatch ? actionDataMatch[1] : "open_browser";
        const dataUrl = actionDataMatch ? actionDataMatch[2] : "";

        result.push(
          <div key={`bq-${i}`} className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-[#180f12] to-slate-900/80 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-xl shadow-emerald-950/60">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                <Zap className="w-4 h-4 animate-pulse text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">Live Dispatch Triggered</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-xs text-slate-200 mt-0.5 truncate font-mono">
                  {dataUrl ? `Target: ${dataUrl}` : "Executed live MCP dispatch action"}
                </p>
              </div>
            </div>

            {dataUrl && dataUrl.startsWith("http") && (
              <button
                type="button"
                onClick={() => window.open(dataUrl, "_blank")}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/60 transition flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Open Live Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      } else {
        result.push(
          <blockquote key={`bq-${i}`} className="border-l-2 border-red-400/50 pl-3 my-2 text-slate-300 italic text-sm">
            {parseInline(bqContent)}
          </blockquote>
        );
      }
      i++;
      continue;
    }

    // Empty line — paragraph break
    if (line.trim() === "") {
      result.push(<div key={`br-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // Normal paragraph line
    result.push(
      <p key={`p-${i}`} className="text-slate-200 leading-relaxed">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <>{result}</>;
}

// Parse inline markdown: bold, italic, inline code, links
function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^([\s\S]*?)`([^`]+)`/);
    if (codeMatch) {
      if (codeMatch[1]) parts.push(<span key={key++}>{parseSimpleInline(codeMatch[1])}</span>);
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-white/10 font-mono text-[11px] text-red-300">
          {codeMatch[2]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold **text**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([^*]+)\*\*/);
    if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={key++}>{parseSimpleInline(boldMatch[1])}</span>);
      parts.push(<strong key={key++} className="font-bold text-white">{boldMatch[2]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic *text* or _text_
    const italicMatch = remaining.match(/^([\s\S]*?)(?:\*([^*]+)\*|_([^_]+)_)/);
    if (italicMatch) {
      if (italicMatch[1]) parts.push(<span key={key++}>{italicMatch[1]}</span>);
      parts.push(<em key={key++} className="italic text-slate-300">{italicMatch[2] || italicMatch[3]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return <>{parts}</>;
}

function parseSimpleInline(text: string): React.ReactNode {
  // Basic bold/italic for nested inline
  if (!text) return null;
  return text;
}

export default function MessageItem({ message, onRegenerate, onEdit, isStreaming = false }: MessageItemProps) {
  const {
    toggleDebugConsole,
    setActiveArtifact,
    user,
    isAutoVoiceEnabled,
    isTtsEnabled,
    ttsVoice,
    sttLang,
    setIsSpeaking,
    setHandsFreeMode,
  } = useAppStore();
  const [copiedText, setCopiedText] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(message.feedback || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isThinkingOpen, setIsThinkingOpen] = useState(true);
  const [statusIndex, setStatusIndex] = useState(0);
  const prevStreamingRef = useRef(isStreaming);

  const statusPhases = [
    { text: "Thinking...", icon: Sparkles },
    { text: "Researching sources...", icon: Globe },
    { text: "Analyzing context...", icon: Brain },
    { text: "Synthesizing response...", icon: Zap },
  ];

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusPhases.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isStreaming, statusPhases.length]);

  const isUser = message.sender === "user";
  const userInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : "DU";

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleToggleAudio = () => {
    if (!isTtsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setIsSpeaking(false);
    } else {
      const speechText = cleanTextForSpeech(message.content);
      if (!speechText) return;

      window.speechSynthesis.cancel(); // cancel any active speech first
      const utterance = new SpeechSynthesisUtterance(speechText);
      
      const ttsSettings = getEffectiveTtsSettings(ttsVoice);
      utterance.rate = ttsSettings.rate;
      utterance.pitch = ttsSettings.pitch;

      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = getBestVoice(voices, ttsVoice, speechText, sttLang);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  useEffect(() => {
    // Detect when streaming finishes (isStreaming changes from true to false)
    if (prevStreamingRef.current === true && isStreaming === false) {
      setIsThinkingOpen(false);
      if (!isUser && isAutoVoiceEnabled && isTtsEnabled && message.content.trim()) {
        // Trigger auto speak
        handleToggleAudio();
      }
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, isAutoVoiceEnabled, isTtsEnabled, isUser, message.content]);

  useEffect(() => {
    if (isUser || !message.content) return;

    const regex = /<cheapchatAgent\s+action="([^"]+)"\s+data="([^"]+)"\s*\/?>(?:<\/cheapchatAgent>)?/g;
    let match;
    while ((match = regex.exec(message.content)) !== null) {
      const action = match[1];
      const data = match[2];
      const actionId = `${message.id}-${action}-${data}`;

      if (!executedAgentActions.has(actionId)) {
        executedAgentActions.add(actionId);
        
        if (action === "open_browser") {
          window.open(data, "_blank");
        } else if (action === "stop_listening") {
          setHandsFreeMode(false);
          setIsSpeaking(false);
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
          }
        }
      }
    }
  }, [message.content, message.id, isStreaming, isUser]);

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(feedback === type ? null : type);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent !== message.content) {
      onEdit(editContent);
    }
    setIsEditing(false);
  };

  let processedContent = message.content;
  const agentRegex = /<cheapchatAgent\s+action="([^"]+)"\s+data="([^"]+)"\s*\/?>(?:<\/cheapchatAgent>)?/gi;
  if (processedContent.match(agentRegex)) {
    processedContent = processedContent.replace(agentRegex, (match, action, data) => {
      return `\n\n> 🤖 **Agent Action:** Executed \`${action}\` on \`${data}\`\n\n`;
    });
  }
  
  if (isStreaming) {
    // Hide incomplete agent tag while it's typing out to prevent raw XML flashing
    processedContent = processedContent.replace(/<cheapchatAgent[^>]*$/gi, "");
  }

  const artifactRegex = /<cheapchatArtifact\s+id="([^"]+)"\s+title="([^"]+)">([\s\S]*?)(?:<\/cheapchatArtifact>|$)/gi;
  if (processedContent.match(artifactRegex)) {
    processedContent = processedContent.replace(artifactRegex, (match) => {
      return `\`\`\`artifact\n${match}\n\`\`\``;
    });
  }

  const hasCodeBlock = processedContent.includes("```");
  const openArtifact = () => {
    const parsed = parseAllArtifactFiles(message.content);
    if (parsed) {
      setActiveArtifact(parsed);
      return;
    }
    
    const codeMatch = processedContent.match(/```(\w+)?\n([\s\S]*?)```/);
    if (codeMatch) {
      const lang = codeMatch[1] || "html";
      const code = codeMatch[2];
      setActiveArtifact({
        title: `${lang.toUpperCase()} Code`,
        type: lang === "html" || lang === "svg" ? (lang as any) : "code",
        language: lang,
        content: code,
      });
    }
  };

  let thoughtContent: string | null = null;
  let displayContent = processedContent;

  const thinkMatch = processedContent.match(/<think>([\s\S]*?)(?:<\/think>|$)/i);
  if (thinkMatch) {
    thoughtContent = thinkMatch[1].trim();
    const parts = processedContent.split(/<\/think>/i);
    displayContent = parts.length > 1 ? parts.slice(1).join("").trim() : "";
  }
  const isStillThinking = isStreaming && processedContent.includes("<think>") && !processedContent.includes("</think>");

  // ── USER MESSAGE (Right Aligned, Pure Text, Grey Icon on Right) ──────
  if (isUser) {
    return (
      <div className="w-full min-w-0 py-3.5 px-3 sm:px-6 md:px-8 flex justify-end transition duration-150">
        <div className="max-w-3xl w-full min-w-0 flex items-start gap-3 justify-end">
          {/* Edit Mode vs Render Mode */}
          {isEditing ? (
            <div className="w-full min-w-[280px] sm:min-w-[420px] flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-[var(--surface-input,#1c1013)] border border-red-500/50 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                rows={4}
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-lg bg-[var(--surface-hover,#251417)] text-xs text-slate-300 hover:bg-[var(--surface-hover,#30181c)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 rounded-lg bg-red-600 text-xs text-white font-medium hover:bg-red-500 shadow-md shadow-red-600/30"
                >
                  Save & Submit
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              {/* Attachments */}
              {(() => {
                const attList = Array.isArray(message.attachments)
                  ? message.attachments
                  : typeof message.attachments === "string"
                  ? (() => { try { return JSON.parse(message.attachments); } catch { return []; } })()
                  : [];
                if (!attList || attList.length === 0) return null;
                return (
                  <div className="flex flex-wrap gap-2 mb-2 justify-end">
                    {attList.map((att: any, idx: number) => {
                      const isImage = att.type === "image" || (att.name && att.name.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i));
                      const fileUrl = att.url || (isImage && att.content ? att.content : undefined);

                      if (isImage && fileUrl) {
                        return (
                          <a
                            key={att.id || idx}
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl overflow-hidden border border-red-500/30 hover:border-red-500 transition group max-w-xs max-h-56 bg-black/40 shadow-md"
                          >
                            <img
                              src={fileUrl}
                              alt={att.name || "Attachment"}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            />
                          </a>
                        );
                      }

                      return (
                        <div
                          key={att.id || idx}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--surface-card,#221215)] border border-red-500/25 text-xs text-slate-200 shadow-sm"
                        >
                          <div className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 text-red-400">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col min-w-0 max-w-[140px]">
                            <span className="truncate font-medium text-white text-[11px]">{att.name}</span>
                            {att.size && (
                              <span className="text-[9px] text-slate-400 font-mono">
                                {att.size > 1048576 ? `${(att.size / 1048576).toFixed(1)} MB` : `${Math.ceil(att.size / 1024)} KB`}
                              </span>
                            )}
                          </div>
                          {att.url && (
                            <a
                              href={`${att.url}?download=1`}
                              download={att.name}
                              className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-white/10 transition ml-1"
                              title="Download file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Queue Status Badge if message is queued */}
              {message.queueStatus && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-medium mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>In Queue ({message.queueStatus})</span>
                </div>
              )}

              {/* Message Content: Just pure text, no box, no outline, no bubble */}
              {message.content && (
                <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-slate-200 text-right font-normal">
                  {message.content}
                </div>
              )}

              {/* User Action Controls */}
              {!isEditing && (
                <div className="mt-1.5 flex items-center gap-1 text-slate-500 hover:text-slate-400 transition justify-end">
                  <Tooltip content="Copy text" side="bottom">
                    <button
                      onClick={handleCopyText}
                      className="p-1 rounded-md hover:bg-white/5 hover:text-white transition"
                    >
                      {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </Tooltip>

                  <Tooltip content="Edit message" side="bottom">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 rounded-md hover:bg-white/5 hover:text-white transition"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          )}

          {/* User Icon on Right Side: Grey icon, no circle/avatar box, just icon */}
          <div className="flex-shrink-0 pt-0.5 text-zinc-400 select-none">
            <User className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </div>
    );
  }

  // ── ASSISTANT MESSAGE (Left Aligned - No Circle Avatar) ──────────────
  const isFailedResponse =
    !isStreaming &&
    (
      (!displayContent.trim() && !thoughtContent) ||
      message.isError ||
      displayContent.toLowerCase().includes("network error") ||
      displayContent.toLowerCase().includes("chat stream failure") ||
      displayContent.toLowerCase().includes("custom api error") ||
      displayContent.toLowerCase().includes("api key error") ||
      displayContent.toLowerCase().includes("ai configured nahi hai") ||
      displayContent.toLowerCase().startsWith("error:")
    );

  return (
    <div className="w-full min-w-0 py-3.5 px-3 sm:px-6 md:px-8 flex justify-start border-b border-white/[0.02] hover:bg-white/[0.01] transition duration-150">
      <div className="max-w-3xl w-full min-w-0 flex flex-col break-words">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 select-none">
            <span className="font-bold text-xs text-white">
              {message.provider || "CheapChat AI"}
            </span>
            {message.model && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-red-500/10 text-rose-300 font-mono border border-red-500/20">
                {message.model}
              </span>
            )}
          </div>

          {/* Thought Process (Clean, border-l only, NO BOX) */}
          {thoughtContent && (
            <div className="mb-3 border-l-2 border-rose-500/30 pl-3 py-1 transition-all">
              <button
                type="button"
                onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                className="flex items-center gap-2 text-xs text-rose-300/80 hover:text-rose-200 transition"
              >
                <Brain className={`w-3.5 h-3.5 text-rose-400 ${isStillThinking ? "animate-pulse" : ""}`} />
                <span className="font-semibold">
                  {isStillThinking ? "Thinking Process (Streaming)..." : "Thought Process"}
                </span>
                {isStillThinking && (
                  <span className="text-[9px] uppercase tracking-wider text-rose-400 font-bold animate-pulse">
                    Live
                  </span>
                )}
                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isThinkingOpen ? "rotate-90" : ""}`} />
              </button>

              {isThinkingOpen && (
                <div className="mt-2 text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                  {thoughtContent}
                </div>
              )}
            </div>
          )}

        {/* Empty or Failed Response - Pure Text, No Box, No Outline, No Border, No Background */}
        {isFailedResponse ? (
          <div className="py-2 flex items-center gap-2 select-none">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-rose-300">
              {message.canRetry === false ? "AI not configured" : "Network Error / Try Again"}
            </span>
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium text-rose-400 hover:text-white hover:bg-red-500/10 transition cursor-pointer"
                title="Retry response"
              >
                <RotateCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Main Response Markdown */}
            <div className="text-xs sm:text-sm leading-relaxed text-slate-200">
              {displayContent ? (
                renderMarkdown(displayContent, (lang, code) => {
                  const parsed = parseAllArtifactFiles(message.content);
                  if (parsed) {
                    setActiveArtifact(parsed);
                  } else {
                    setActiveArtifact({
                      title: `${lang.toUpperCase()} Code`,
                      type: lang === "html" || lang === "svg" ? (lang as any) : "code",
                      language: lang,
                      content: code,
                    });
                  }
                }, isStreaming, message.isError)
              ) : null}
            </div>

            {/* Shimmer Status Header (Thinking / Researching / Analyzing) while streaming - BELOW RESPONSE, Pure text, NO BOX */}
            {isStreaming && (
              <div className="flex items-center gap-2 py-1.5 mt-1 select-none">
                {React.createElement(statusPhases[statusIndex].icon, { className: "w-3.5 h-3.5 text-rose-400 animate-pulse flex-shrink-0" })}
                <span className="text-xs font-semibold animate-shimmer-text tracking-wide">
                  {statusPhases[statusIndex].text}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping flex-shrink-0" />
              </div>
            )}

            {/* Assistant Action Row */}
            <div className="mt-3 flex items-center gap-1 text-slate-400">
              {/* Speaker / Read Aloud */}
              <Tooltip content="Read Aloud" side="top">
                <button
                  onClick={handleToggleAudio}
                  disabled={!isTtsEnabled}
                  title={isTtsEnabled ? "Read Aloud" : "Enable text to speech in Settings"}
                  className={`p-1.5 rounded-lg transition ${
                    !isTtsEnabled ? "cursor-not-allowed opacity-40" : isPlayingAudio ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-[#252525] hover:text-white"
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </Tooltip>

              {/* Copy */}
              <Tooltip content="Copy text" side="top">
                <button
                  onClick={handleCopyText}
                  className="p-1.5 rounded-lg hover:bg-[#252525] hover:text-white transition"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </Tooltip>

              {/* Thumbs Up */}
              <Tooltip content="Good response" side="top">
                <button
                  onClick={() => handleFeedback("up")}
                  className={`p-1.5 rounded-lg transition ${
                    feedback === "up" ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-[#252525] hover:text-white"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              {/* Thumbs Down */}
              <Tooltip content="Bad response" side="top">
                <button
                  onClick={() => handleFeedback("down")}
                  className={`p-1.5 rounded-lg transition ${
                    feedback === "down" ? "bg-red-500/20 text-red-400" : "hover:bg-[#252525] hover:text-white"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              {/* Regenerate */}
              {onRegenerate && (
                <Tooltip content="Regenerate response" side="top">
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-lg hover:bg-[#252525] hover:text-white transition"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
