"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import Tooltip from "@cheapchats/frontend/components/Common/Tooltip";
import ModelSelector from "@cheapchats/frontend/components/Header/ModelSelector";
import UsageQuotaCircle from "@cheapchats/frontend/components/Chat/UsageQuotaCircle";
import {
  ArrowUp,
  Mic,
  MicOff,
  Paperclip,
  Sliders,
  Globe,
  Code,
  Wrench,
  Sparkles,
  X,
  FileText,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  Music,
  Video,
  Volume2,
  Headphones,
  Square,
  Globe2,
  Loader2,
  Command,
  File,
  Zap,
  Gamepad2,
  Check,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, attachments: any[]) => void;
  disabled?: boolean;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  mimeType?: string;
  size?: number;
  url?: string;
  content?: string;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getAttachmentIcon(type?: string, name?: string) {
  const ext = (name || "").split(".").pop()?.toLowerCase();
  if (type === "image" || ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || "")) {
    return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
  }
  if (type === "code" || ["js", "jsx", "ts", "tsx", "py", "html", "css", "json", "sql"].includes(ext || "")) {
    return <FileCode className="w-3.5 h-3.5 text-purple-400" />;
  }
  if (type === "document" || ["pdf", "doc", "docx", "txt", "md", "csv"].includes(ext || "")) {
    return <FileText className="w-3.5 h-3.5 text-rose-400" />;
  }
  if (type === "audio" || ["mp3", "wav", "ogg"].includes(ext || "")) {
    return <Music className="w-3.5 h-3.5 text-amber-400" />;
  }
  if (type === "video" || ["mp4", "webm", "mov"].includes(ext || "")) {
    return <Video className="w-3.5 h-3.5 text-sky-400" />;
  }
  if (type === "archive" || ["zip", "rar", "tar", "gz"].includes(ext || "")) {
    return <FileArchive className="w-3.5 h-3.5 text-orange-400" />;
  }
  return <File className="w-3.5 h-3.5 text-slate-400" />;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const {
    activeTools,
    toggleTool,
    selectedProvider,
    selectedModel,
    setActiveModal,
    pendingPromptText,
    setPendingPromptText,
    isHandsFreeMode,
    isSpeaking,
    setIsSpeaking,
    activeSuggestionChip,
    setActiveSuggestionChip,
    isIncognito,
    selectedSkills,
    addSelectedSkill,
    removeSelectedSkill,
    clearSelectedSkills,
  } = useAppStore();
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSlashPrompts, setShowSlashPrompts] = useState(false);
  const [dbPrompts, setDbPrompts] = useState<{ title: string; prompt: string }[]>([]);
  const [skillsList, setSkillsList] = useState<{ name: string; description: string }[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [historyContent, setHistoryContent] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<{
    title: string;
    description: string;
    canRetry?: boolean;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (toastInfo) {
      const timer = setTimeout(() => {
        setToastInfo(null);
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [toastInfo]);

  useEffect(() => {
    // 1. Instant hydration from cache for 0ms render
    try {
      const cachedSkills = localStorage.getItem("cheapchat_cached_skills");
      if (cachedSkills) {
        const parsed = JSON.parse(cachedSkills);
        if (Array.isArray(parsed) && parsed.length > 0) setSkillsList(parsed);
      }
      const cachedPrompts = localStorage.getItem("cheapchat_cached_prompts");
      if (cachedPrompts) {
        const parsed = JSON.parse(cachedPrompts);
        if (Array.isArray(parsed) && parsed.length > 0) setDbPrompts(parsed);
      }
    } catch { }

    fetch("/api/prompts")
      .then((r) => r.json())
      .then((d) => {
        if (d.prompts && Array.isArray(d.prompts)) {
          const mapped = d.prompts.map((p: any) => ({
            title: p.title,
            prompt: p.command ? `/${p.command.replace(/^\//, "")} ${p.content}` : p.content,
          }));
          setDbPrompts(mapped);
          try { localStorage.setItem("cheapchat_cached_prompts", JSON.stringify(mapped)); } catch { }
        }
      })
      .catch(() => { });

    const fetchSkills = () => {
      fetch("/api/skills")
        .then((r) => r.json())
        .then((d) => {
          if (d.skills && Array.isArray(d.skills) && d.skills.length > 0) {
            setSkillsList(d.skills);
            try { localStorage.setItem("cheapchat_cached_skills", JSON.stringify(d.skills)); } catch { }
          }
        })
        .catch(() => { });
    };

    fetchSkills();

    window.addEventListener("cheapchat:skills_updated", fetchSkills);
    return () => {
      window.removeEventListener("cheapchat:skills_updated", fetchSkills);
    };
  }, []);

  const contentRef = useRef(content);
  const attachmentsRef = useRef(attachments);
  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { attachmentsRef.current = attachments; }, [attachments]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const providerName = selectedProvider || "OpenRouter";

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [content]);

  // Auto-fill textarea when a prompt is selected with "Send prompts on select" or Fix with AI
  useEffect(() => {
    if (pendingPromptText) {
      const isObj = typeof pendingPromptText === "object" && pendingPromptText !== null;
      const textToSet = isObj ? pendingPromptText.text : pendingPromptText;
      const shouldAutoSubmit = isObj ? Boolean(pendingPromptText.autoSubmit) : false;

      setContent(textToSet);
      setPendingPromptText(null);

      if (shouldAutoSubmit && textToSet.trim()) {
        setTimeout(() => {
          onSend(textToSet.trim(), []);
          setContent("");
        }, 40);
      } else if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [pendingPromptText, setPendingPromptText, onSend]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (val.startsWith("/")) {
      setShowSlashPrompts(true);
    } else {
      setShowSlashPrompts(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" && showSlashPrompts) {
      setShowSlashPrompts(false);
      return;
    }
    if (e.key === "Backspace" && content === "" && activeSuggestionChip) {
      setActiveSuggestionChip(null);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const rawContent = content.trim();
    if ((!rawContent && attachments.length === 0 && !activeSuggestionChip) || disabled || isUploading) return;

    // Combine active suggestion chip prefix with user's typed content
    let finalPrompt = rawContent;
    if (activeSuggestionChip) {
      finalPrompt = rawContent
        ? `${activeSuggestionChip.prefix} ${rawContent}`
        : activeSuggestionChip.prefix;
    }

    // Auto-detect if user is requesting a project, UI design, 3D game/app, or web component
    const isProjectPrompt = /create|build|design|make|project|app|game|website|landing page|3d|html|react|component|salon|airplane|mermaid|diagram/i.test(finalPrompt);
    if (isProjectPrompt && !activeTools.artifacts) {
      useAppStore.setState((state: any) => ({
        activeTools: { ...state.activeTools, artifacts: true }
      }));
    }

    onSend(finalPrompt, attachments);
    setContent("");
    setAttachments([]);
    setShowSlashPrompts(false);
    setActiveSuggestionChip(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Upload files handler (uploads to /api/attachments for persistent storage & AI usage)
  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      formData.append("isIncognito", isIncognito ? "true" : "false");

      const res = await fetch("/api/attachments", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload attachments");
      }

      const data = await res.json();
      if (data.files && Array.isArray(data.files)) {
        setAttachments((prev) => [...prev, ...data.files]);
      } else if (data.file) {
        setAttachments((prev) => [...prev, data.file]);
      }

      // Notify FilesSidebarPanel in real-time only if not incognito
      if (!isIncognito && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cheapchat:files_updated"));
      }
    } catch (err) {
      console.error("Error uploading attachments:", err);
      alert("Failed to upload attachments. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
  };

  // Support clipboard paste (e.g. pasting screenshots or files directly into chat input)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const filesToUpload: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const f = items[i].getAsFile();
        if (f) filesToUpload.push(f);
      }
    }
    if (filesToUpload.length > 0) {
      uploadFiles(filesToUpload);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Speech to text
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = ""; // Auto-detect based on browser / system language

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (isHandsFreeMode) {
        const finalContent = contentRef.current ? `${contentRef.current} ${transcript}`.trim() : transcript;
        onSend(finalContent, attachmentsRef.current);
        setContent("");
        setAttachments([]);
      } else {
        setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };

    recognition.start();
  };

  const handleStopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      startListening();
    }
  };

  const handleCorrectWords = async () => {
    if (!content.trim()) {
      setToastInfo({
        title: "Input is empty",
        description: "Please type some words or a prompt first to correct.",
        canRetry: false,
      });
      return;
    }

    setIsCorrecting(true);
    setToastInfo(null);

    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          model: selectedModel,
          provider: selectedProvider,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.correctedText) {
        setHistoryContent(content); // Save original words so user can revert/back
        setContent(data.correctedText);
      } else {
        const errorMsg = data.error || `Error (${res.status}): Failed to correct text.`;
        const isNetwork = data.errorType === "network_error" || errorMsg.toLowerCase().includes("network");
        setToastInfo({
          title: isNetwork ? "Network Error" : "Model Error",
          description: `${errorMsg} Please try again or choose a different model above.`,
          canRetry: true,
        });
      }
    } catch (err: any) {
      setToastInfo({
        title: "Network Error",
        description: "Failed to connect to the model provider. Please check your network connection, try again, or choose a different model above.",
        canRetry: true,
      });
    } finally {
      setIsCorrecting(false);
    }
  };

  const handleRevertText = () => {
    if (historyContent !== null) {
      setContent(historyContent);
      setHistoryContent(null);
    }
  };

  useEffect(() => {
    if (isHandsFreeMode && !disabled && !isSpeaking && !isListening) {
      const timeout = setTimeout(() => {
        if (!isListening) startListening();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [isHandsFreeMode, disabled, isSpeaking, isListening]);

  const slashQuery = content.startsWith("/") ? content.slice(1).toLowerCase().trim() : "";

  const filteredSkills = skillsList.filter(
    (s) =>
      !slashQuery ||
      s.name.toLowerCase().includes(slashQuery) ||
      (s.description && s.description.toLowerCase().includes(slashQuery))
  );

  const defaultSuggestions = [
    {
      title: "Web Search",
      prompt: "Search the web for:",
      description: "Search live web for real-time answers and sources",
      type: "search",
    },
    {
      title: "Mermaid Diagram",
      prompt: "Create a complete Mermaid.js architecture diagram for:",
      description: "Generate flowcharts, sequence diagrams & system architectures",
      type: "diagram",
    },
    {
      title: "HTML page / game",
      prompt: "Generate an interactive HTML,CSS,JS page or playable game with sound effects for:",
      description: "Build interactive HTML pages, web apps & playable games with sound",
      type: "game",
    },
    {
      title: "Summarize",
      prompt: "Summarize and extract key takeaways of:",
      description: "Extract core takeaways and concise key insights",
      type: "summary",
    },
  ];

  const allSuggestions = [
    ...defaultSuggestions,
    ...dbPrompts.map((p) => ({
      title: p.title,
      prompt: p.prompt,
      description: p.prompt.length > 60 ? p.prompt.slice(0, 60) + "..." : p.prompt,
      type: "prompt",
    })),
  ];

  const filteredSuggestions = allSuggestions.filter(
    (item) =>
      !slashQuery ||
      item.title.toLowerCase().includes(slashQuery) ||
      item.prompt.toLowerCase().includes(slashQuery) ||
      (item.description && item.description.toLowerCase().includes(slashQuery))
  );

  const handleSelectSkill = (skill: { name: string; description: string }) => {
    addSelectedSkill(skill.name);
    if (content.startsWith("/")) {
      setContent("");
    }
    setShowSlashPrompts(false);
    textareaRef.current?.focus();
  };

  const handleSelectSuggestion = (item: { title: string; prompt: string; type?: string }) => {
    setActiveSuggestionChip({
      label: item.title,
      prefix: item.prompt,
      type: item.type,
    });
    if (item.type === "game" || item.title === "HTML page / game" || item.title === "HTML & 2D Game") {
      addSelectedSkill("HTML Page / Game & Sound");
    }
    setContent("");
    setShowSlashPrompts(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full max-w-3xl min-w-0 mx-auto px-2 sm:px-4 pb-2 pt-1 relative z-10 select-none">
      {/* Toast Notification for Model / Network Errors */}
      {toastInfo && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] max-w-md w-[92%] sm:w-auto bg-[#1b0d10]/95 border border-red-500/40 shadow-2xl shadow-red-950/70 rounded-2xl p-3.5 backdrop-blur-xl animate-in slide-in-from-top-4 fade-in duration-200 select-none">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white tracking-wide">
                {toastInfo.title}
              </div>
              <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                {toastInfo.description}
              </p>
              {toastInfo.canRetry && (
                <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleCorrectWords}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold transition shadow-sm cursor-pointer"
                  >
                    Try Again
                  </button>
                  <span className="text-[10px] text-zinc-400">or choose a different model above</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToastInfo(null)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer flex-shrink-0"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Slash Menu: 1. Skills Section, 2. Suggestions Section */}
      {showSlashPrompts && (
        <div className="absolute bottom-full mb-2 left-4 right-4 bg-[#180d11]/95 backdrop-blur-xl rounded-2xl p-2.5 border border-red-500/25 shadow-2xl z-50 max-h-80 overflow-y-auto">
          {/* Section 1: Skills */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-1 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-zinc-400 font-bold">/</span>
                <span>Skills</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal lowercase">({filteredSkills.length} available)</span>
            </div>
            {filteredSkills.length === 0 ? (
              <div className="px-3 py-1 text-xs text-slate-500 italic">No matching skills found</div>
            ) : (
              <div className="space-y-0.5">
                {filteredSkills.map((s, idx) => (
                  <button
                    key={`skill-${idx}`}
                    type="button"
                    onClick={() => handleSelectSkill(s)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-red-500/15 flex items-start gap-2.5 transition group"
                  >
                    <div className="w-5 h-5 rounded-md bg-white/5 text-zinc-400 group-hover:bg-red-500 group-hover:text-white transition flex items-center justify-center flex-shrink-0 font-mono text-[11px] font-bold">
                      /
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white group-hover:text-rose-200 transition truncate">
                        {s.name}
                      </div>
                      {s.description && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {s.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Suggestions */}
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="px-3 py-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-1 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Command className="w-3.5 h-3.5 text-amber-400" />
                <span>Suggestions</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal lowercase">({filteredSuggestions.length} prompts)</span>
            </div>
            {filteredSuggestions.length === 0 ? (
              <div className="px-3 py-1 text-xs text-slate-500 italic">No matching suggestions found</div>
            ) : (
              <div className="space-y-0.5">
                {filteredSuggestions.map((item, idx) => (
                  <button
                    key={`sug-${idx}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-red-500/15 flex items-start justify-between gap-2 transition group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="p-1 rounded-lg bg-white/5 text-slate-400 group-hover:bg-red-500 group-hover:text-white transition mt-0.5 flex-shrink-0">
                        {item.title === "Web Search" ? (
                          <Globe className="w-3.5 h-3.5 text-blue-400 group-hover:text-white" />
                        ) : item.title === "Mermaid Diagram" ? (
                          <Zap className="w-3.5 h-3.5 text-purple-400 group-hover:text-white" />
                        ) : (item.title === "HTML page / game" || item.title === "HTML & 2D Game") ? (
                          <Gamepad2 className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                        ) : item.title === "Summarize" ? (
                          <FileText className="w-3.5 h-3.5 text-amber-400 group-hover:text-white" />
                        ) : (
                          <Command className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white group-hover:text-rose-200 transition truncate">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 hidden sm:inline-block max-w-[140px] truncate">
                      {item.prompt}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Model Selector Top-Left Bar */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <ModelSelector />
      </div>

      {/* Main Input Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            uploadFiles(e.dataTransfer.files);
          }
        }}
        className={`bg-[#1b1013] rounded-3xl pt-3 px-3.5 pb-2 border transition-all duration-150 shadow-2xl flex flex-col gap-2 ${isDraggingOver
            ? "border-emerald-500/80 ring-2 ring-emerald-500/30 bg-[#16201b]"
            : "border-red-500/20 focus-within:border-red-500/40 focus-within:ring-1 focus-within:ring-red-500/30"
          }`}
      >
        {/* Attachments Row */}
        {(attachments.length > 0 || isUploading) && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {attachments.map((att) => {
              const isImage = att.type === "image" || att.name.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i);
              return (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-slate-200 shadow-sm flex-shrink-0 group"
                >
                  <div className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {isImage && (att.url || att.content) ? (
                      <img
                        src={att.url || att.content}
                        alt={att.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getAttachmentIcon(att.type, att.name)
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 max-w-[120px]">
                    <span className="truncate font-medium text-[11px] text-white">
                      {att.name}
                    </span>
                    {att.size && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        {formatBytes(att.size)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="p-0.5 rounded-full hover:bg-red-500/30 text-slate-400 hover:text-white transition ml-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {isUploading && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-400 animate-pulse flex-shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[11px] font-medium">Uploading...</span>
              </div>
            )}
          </div>
        )}

        {/* Selected Skills & Active Suggestion Chips (Ultra-compact, low-height slim grey pills) */}
        {((selectedSkills && selectedSkills.length > 0) || activeSuggestionChip) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 pb-1">
            {/* Selected Skills */}
            {selectedSkills?.map((skName: string) => (
              <div
                key={skName}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[11px] text-zinc-300 shadow-sm animate-in fade-in zoom-in-95 duration-150 h-5.5 select-none"
              >
                <Sparkles className="w-2.5 h-2.5 text-zinc-400 flex-shrink-0" />
                <span className="font-medium text-zinc-200 truncate max-w-[140px]">{skName}</span>
                <button
                  type="button"
                  onClick={() => removeSelectedSkill(skName)}
                  className="p-0.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                  title={`Remove ${skName} skill`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}

            {/* Active Suggestion Chip */}
            {activeSuggestionChip && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[11px] text-zinc-300 shadow-sm animate-in fade-in zoom-in-95 duration-150 h-5.5 select-none">
                {activeSuggestionChip.label === "Web Search" ? (
                  <Globe className="w-2.5 h-2.5 text-zinc-400 flex-shrink-0" />
                ) : activeSuggestionChip.label === "Mermaid Diagram" ? (
                  <Zap className="w-2.5 h-2.5 text-zinc-400 flex-shrink-0" />
                ) : (activeSuggestionChip.label === "HTML page / game" || activeSuggestionChip.label === "HTML & 2D Game") ? (
                  <Gamepad2 className="w-2.5 h-2.5 text-zinc-400 flex-shrink-0" />
                ) : activeSuggestionChip.label === "Summarize" ? (
                  <FileText className="w-2.5 h-2.5 text-zinc-400 flex-shrink-0" />
                ) : null}
                <span className="font-medium text-zinc-200 truncate max-w-[140px]">{activeSuggestionChip.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (activeSuggestionChip.label === "HTML page / game" || activeSuggestionChip.type === "game" || activeSuggestionChip.label === "HTML & 2D Game") {
                      removeSelectedSkill("HTML Page / Game & Sound");
                    }
                    setActiveSuggestionChip(null);
                  }}
                  className="p-0.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Remove suggestion"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            activeSuggestionChip
              ? `Add specifics for "${activeSuggestionChip.label}" (or press Enter to send)...`
              : `Message ${providerName} (paste/drop files, type / for skills & suggestions)...`
          }
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent border-none text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none resize-none max-h-44 leading-relaxed"
        />

        {/* Bottom Bar: Pinned Tools + Controls */}
        <div className="flex items-center justify-between pt-0.5 text-xs gap-1.5 min-w-0">
          {/* Left Pinned Tools Bar */}
          <div className="flex items-center gap-1.5 overflow-visible min-w-0 flex-shrink-0">
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <Tooltip content="Attach any files (images, docs, code, zip...)" side="top">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/15 transition relative cursor-pointer"
              >
                <Paperclip className="w-3.5 h-3.5" />
                {attachments.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#1b1013]" />
                )}
              </button>
            </Tooltip>

            {/* Web Search Button (Subtle dark red translucent highlight with plain red check icon) */}
            <button
              type="button"
              onClick={() => toggleTool("webSearch")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all duration-150 select-none cursor-pointer ${activeTools.webSearch
                  ? "bg-red-500/15 border-red-500/40 text-red-300 shadow-sm shadow-red-950/30"
                  : "bg-zinc-800/40 border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70"
                }`}
              title="Web Search"
            >
              <Globe className={`w-3.5 h-3.5 ${activeTools.webSearch ? "text-red-400" : "text-zinc-400"}`} />
              <span>Search</span>
              {activeTools.webSearch && (
                <Check className="w-3 h-3 text-red-400 stroke-[2.5] flex-shrink-0" />
              )}
            </button>

            {/* Static / skill hint text - Pure text, no icon, no badge, no background, no border, not clickable */}
            <span className="text-xs text-zinc-500 font-normal select-none pointer-events-none px-1">
              / skill
            </span>
          </div>

          {/* Right Side: Stop Voice + Usage Quota + Artifacts + Send / Mic */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isSpeaking && (
              <button
                type="button"
                onClick={handleStopSpeaking}
                className="px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold shadow-md shadow-red-950/60 animate-pulse flex items-center gap-1"
                title="Stop Agent Voice Immediately"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop Voice</span>
              </button>
            )}

            {/* 1. Usage Quota Area with Tooltip */}
            <UsageQuotaCircle />

            {/* Revert / Back Button: Appears after text is corrected to undo and go back */}
            {historyContent !== null && (
              <Tooltip content="Revert back to original text" side="top">
                <button
                  type="button"
                  onClick={handleRevertText}
                  className="p-1 transition-colors select-none cursor-pointer flex items-center justify-center text-zinc-400 hover:text-white"
                  title="Undo correction"
                >
                  <RotateCcw className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
                </button>
              </Tooltip>
            )}

            {/* Sparkles: AI Prompt & Word Correction Tool */}
            <Tooltip content={isCorrecting ? "Correcting words..." : "Correct words with AI"} side="top">
              <button
                type="button"
                onClick={handleCorrectWords}
                disabled={isCorrecting}
                className="p-1 transition-colors select-none cursor-pointer flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-50"
                title="Correct words"
              >
                {isCorrecting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
                )}
              </button>
            </Tooltip>

            {/* 3. Send / Mic Button in a styled grey box (Far Right) */}
            {content.trim() || attachments.length > 0 || activeSuggestionChip || (selectedSkills && selectedSkills.length > 0) ? (
              <button
                type="button"
                onClick={handleSend}
                disabled={isUploading}
                className="p-2 rounded-xl border border-zinc-700/60 bg-zinc-800/60 text-zinc-200 hover:text-white hover:bg-zinc-700/70 hover:border-zinc-600 transition-all duration-150 flex items-center justify-center shadow-sm cursor-pointer"
                title="Send Message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-xl border transition-all duration-150 flex items-center justify-center select-none cursor-pointer ${isListening
                    ? "bg-red-600 text-white border-red-500 animate-pulse shadow-lg shadow-red-600/50"
                    : "bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-700/70 hover:border-zinc-600 shadow-sm"
                  }`}
                title={isListening ? "Stop Voice Input" : "Voice Input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Centered Footer Text */}
      <div className="mt-2 text-center text-[11px] text-red-300/50">
        <span>CheapChat - Every AI for Everyone. </span>
        <a href="#" className="underline hover:text-red-200">Privacy policy</a>
        <span> | </span>
        <a href="#" className="underline hover:text-red-200">Terms of service</a>
      </div>
    </div>
  );
}
