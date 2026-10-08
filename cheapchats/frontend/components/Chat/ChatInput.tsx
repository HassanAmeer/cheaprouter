"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore, resolveSpeechProfile, type SpeechProfile } from "@cheapchats/frontend/lib/store";
import { detectLanguageWithAI } from "@cheapchats/frontend/lib/autoLanguage";
import Tooltip from "@cheapchats/frontend/components/Common/Tooltip";
import ModelSelector from "@cheapchats/frontend/components/Header/ModelSelector";
import UsageQuotaCircle from "@cheapchats/frontend/components/Chat/UsageQuotaCircle";
import styles from "./ChatInput.module.css";
import { getSuggestionSkillName } from "@cheapchats/frontend/lib/suggestionSkills";
import { readCustomProviders, CustomProvider } from "@cheapchats/frontend/lib/customProviders";
import {
  ArrowUp,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
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
import {
  cleanTextForSpeech,
  getBestVoice,
  containsStopKeyword,
  containsEndCallKeyword,
  getEffectiveSttLang,
  SPEECH_LANGUAGES,
  transliterateToRomanUrdu,
  romanUrduToUrduScript,
  getAutoAzureVoice,
  getAutoBrowserVoice,
  getEffectiveTtsSettings,
} from "@cheapchats/frontend/lib/speechUtils";
import { startThinkingWaveSound, stopThinkingWaveSound } from "@cheapchats/frontend/lib/thinkingWaveSound";

interface ChatInputProps {
  onSend: (message: string, attachments: any[], isRetry?: boolean, isCallMode?: boolean) => Promise<string | undefined> | void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
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

const WAVE_BAR_FACTORS = [
  0.22, 0.32, 0.45, 0.38, 0.6, 0.78, 0.52, 0.88, 0.72, 0.98,
  0.82, 0.58, 0.92, 0.68, 0.82, 0.48, 0.72, 0.88, 0.58, 0.98,
  0.78, 0.62, 0.92, 0.72, 0.84, 0.72, 0.92, 0.62, 0.78, 0.98,
  0.58, 0.88, 0.72, 0.48, 0.82, 0.68, 0.92, 0.58, 0.82, 0.98,
  0.72, 0.88, 0.52, 0.78, 0.6, 0.38, 0.45, 0.32, 0.22, 0.18
];

export default function ChatInput({ onSend, onStop, disabled = false, isStreaming = false }: ChatInputProps) {
  const {
    activeTools,
    toggleTool,
    selectedProvider,
    selectedModel,
    setActiveModal,
    pendingPromptText,
    setPendingPromptText,
    isHandsFreeMode,
    isSttEnabled,
    sttLang,
    isSpeaking,
    setIsSpeaking,
    activeSuggestionChip,
    setActiveSuggestionChip,
    isIncognito,
    selectedSkills,
    addSelectedSkill,
    removeSelectedSkill,
    clearSelectedSkills,
    ttsVoice,
    ttsEngine,
    setCallAssistantOpen,
  } = useAppStore();
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Inline Call Assistant state
  const [isCallActive, setIsCallActive] = useState(false);
  // ── Call latency tuning ────────────────────────────────────────────────────
  // How long the mic must stay quiet before the sentence is sent. Lower = faster
  // reply, higher = safer for slow speakers / noisy rooms.
  const CALL_SILENCE_MS = 550;
  // Speak the first chunk after this many words (before a sentence ends), so the
  // agent starts talking while the rest of the answer is still streaming.
  const CALL_FIRST_CHUNK_WORDS = 5;

  const [callStatus, setCallStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [callSpeechError, setCallSpeechError] = useState(false);

  // Surfaced in the call panel; never silently switches to another voice
  const reportCallSpeechError = () => {
    setCallSpeechError(true);
    window.setTimeout(() => setCallSpeechError(false), 5000);
    drainSpeechQueue();
  };
  const isCallActiveRef = useRef(false);
  const callStatusRef = useRef<"idle" | "listening" | "thinking" | "speaking">("idle");
  const callRecognitionRef = useRef<any>(null);
  const callSilenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const userSpeakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserSpeakingRef = useRef(false);

  // Web Audio Analyser for genuine audio-reactive waves
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>(() => new Array(50).fill(0.12));

  // Streaming Speech Synthesis (TTS) queue & buffer
  const streamingTtsBufferRef = useRef("");
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingUtteranceRef = useRef(false);
  const isStreamFinishedRef = useRef(false);
  const didStreamSpeakRef = useRef(false);
  const turnIdRef = useRef(0);
  // Language detected by the AI for the current spoken turn (Auto Detect accents)
  const callLangRef = useRef<string | null>(null);
  const callLangPromiseRef = useRef<Promise<string> | null>(null);
  const lastSpokenTranscriptRef = useRef<string>("");

  useEffect(() => {
    isCallActiveRef.current = isCallActive;
    if (typeof window !== "undefined") {
      (window as any).__cheapchats_is_call_active = isCallActive;
    }
  }, [isCallActive]);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    isUserSpeakingRef.current = isUserSpeaking;
  }, [isUserSpeaking]);
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
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const slashMenuDismissedRef = useRef(false);

  useEffect(() => {
    if (!showSlashPrompts) return;

    const dismissOnOutsidePointer = (event: PointerEvent) => {
      if (!slashMenuRef.current?.contains(event.target as Node)) {
        slashMenuDismissedRef.current = true;
        setShowSlashPrompts(false);
      }
    };

    document.addEventListener("pointerdown", dismissOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", dismissOnOutsidePointer);
  }, [showSlashPrompts]);

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
    if (!val.startsWith("/")) {
      slashMenuDismissedRef.current = false;
      setShowSlashPrompts(false);
    } else if (!content.startsWith("/")) {
      slashMenuDismissedRef.current = false;
      setShowSlashPrompts(true);
    } else if (!slashMenuDismissedRef.current) {
      setShowSlashPrompts(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" && showSlashPrompts) {
      slashMenuDismissedRef.current = true;
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

  // Speech to text (standard mic button)
  const startListening = () => {
    if (!isSttEnabled) return;
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getEffectiveSttLang(sttLang);

    const baseText = contentRef.current ? contentRef.current.trim() : "";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let fullTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      let trimmed = fullTranscript.trim();
      if (sttLang === "ur-roman") {
        trimmed = transliterateToRomanUrdu(trimmed);
      }
      const updated = baseText ? `${baseText} ${trimmed}` : trimmed;
      setContent(updated);

      if (isHandsFreeMode && event.results[event.results.length - 1]?.isFinal) {
        onSend(updated, attachmentsRef.current);
        setContent("");
        setAttachments([]);
      }
    };

    recognition.start();
  };

  const handleStopSpeaking = () => {
    if (currentAudioElementRef.current) {
      try {
        currentAudioElementRef.current.pause();
      } catch {}
      currentAudioElementRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Inline Call Assistant Handlers
  const stopCallSpeaking = () => {
    if (currentAudioElementRef.current) {
      try {
        currentAudioElementRef.current.pause();
      } catch {}
      currentAudioElementRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    currentUtteranceRef.current = null;
    speechQueueRef.current = [];
    streamingTtsBufferRef.current = "";
    isSpeakingUtteranceRef.current = false;
    isStreamFinishedRef.current = true;
    setIsSpeaking(false);
    if (isStreaming && onStop) {
      onStop();
    }
    if (isCallActiveRef.current) {
      setCallStatus("listening");
      callStatusRef.current = "listening";
      setContent("");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cheapchat:call_turn_finished"));
      }
      startCallRecognition();
    }
  };

  const cleanupMicAudioAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const startMicAudioAnalyser = async () => {
    try {
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      if (!mediaStreamRef.current && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.5;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
      }
    } catch (err) {
      console.warn("Audio analyser start failed:", err);
    }
  };

  const handleEndCall = () => {
    if (currentAudioElementRef.current) {
      try {
        currentAudioElementRef.current.pause();
      } catch {}
      currentAudioElementRef.current = null;
    }
    setIsCallActive(false);
    isCallActiveRef.current = false;
    setCallAssistantOpen(false);
    if (typeof window !== "undefined") {
      (window as any).__cheapchats_is_call_active = false;
    }
    setCallStatus("idle");
    callStatusRef.current = "idle";
    setIsSpeaking(false);
    setIsUserSpeaking(false);
    isUserSpeakingRef.current = false;
    if (userSpeakingTimeoutRef.current) {
      clearTimeout(userSpeakingTimeoutRef.current);
      userSpeakingTimeoutRef.current = null;
    }

    speechQueueRef.current = [];
    streamingTtsBufferRef.current = "";
    isSpeakingUtteranceRef.current = false;
    isStreamFinishedRef.current = true;

    lastSpokenTranscriptRef.current = "";
    cleanupMicAudioAnalyser();

    if (callSilenceTimerRef.current) {
      clearTimeout(callSilenceTimerRef.current);
      callSilenceTimerRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    currentUtteranceRef.current = null;

    if (callRecognitionRef.current) {
      const rec = callRecognitionRef.current;
      rec.onend = null;
      rec.onerror = null;
      rec.onresult = null;
      rec.onstart = null;
      try {
        rec.abort();
      } catch {}
      callRecognitionRef.current = null;
    }

    if (isStreaming && onStop) {
      onStop();
    }
  };

  useEffect(() => {
    return () => {
      if (isCallActiveRef.current) {
        handleEndCall();
      }
    };
  }, []);

  // Play a soft wave sound while AI is thinking during call
  useEffect(() => {
    if (isCallActive && callStatus === "thinking" && useAppStore.getState().chatPreferences.thinkingWaveSound !== false) {
      startThinkingWaveSound();
    } else {
      stopThinkingWaveSound();
    }

    return () => {
      stopThinkingWaveSound();
    };
  }, [isCallActive, callStatus]);

  // Audio-reactive visualizer loop that reacts to real sound (STT) and voice cadence (TTS)
  useEffect(() => {
    if (!isCallActive) {
      cleanupMicAudioAnalyser();
      return;
    }

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning || !isCallActiveRef.current) return;

      const status = callStatusRef.current;

      if (status === "speaking") {
        // TTS: Assistant speech waveform cadence with syllables and frequency modulation
        const t = performance.now() * 0.007;
        const newAmps = WAVE_BAR_FACTORS.map((factor, i) => {
          const syllable = Math.sin(t * 3.6 + i * 0.28) * 0.5 + 0.5;
          const formant = Math.sin(t * 6.4 - i * 0.35) * 0.4 + 0.6;
          const bass = Math.sin(t * 2.1 + i * 0.15) * 0.3 + 0.7;
          const combined = (syllable * 0.45 + formant * 0.35 + bass * 0.2) * factor;
          return Math.min(1.0, Math.max(0.12, combined * 1.1));
        });
        setWaveAmplitudes(newAmps);
      } else if (status === "thinking") {
        // AI thinking: smooth travelling shimmer wave
        const t = performance.now() * 0.0035;
        const newAmps = WAVE_BAR_FACTORS.map((factor, i) => {
          const travel = Math.sin(t * 3.5 + i * 0.32) * 0.35 + 0.45;
          return Math.min(0.8, Math.max(0.12, travel * factor));
        });
        setWaveAmplitudes(newAmps);
      } else {
        // STT: Real-time live audio reaction from microphone!
        if (analyserRef.current) {
          const analyser = analyserRef.current;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avgVolume = sum / bufferLength;
          const isVoiceActive = avgVolume > 4.5;

          if (isVoiceActive) {
            if (!isUserSpeakingRef.current) {
              isUserSpeakingRef.current = true;
              setIsUserSpeaking(true);
            }
            if (userSpeakingTimeoutRef.current) clearTimeout(userSpeakingTimeoutRef.current);
            userSpeakingTimeoutRef.current = setTimeout(() => {
              isUserSpeakingRef.current = false;
              setIsUserSpeaking(false);
            }, 600);
          }

          const newAmps = WAVE_BAR_FACTORS.map((factor, i) => {
            const binIndex = Math.min(
              bufferLength - 1,
              Math.floor((i / WAVE_BAR_FACTORS.length) * (bufferLength * 0.85))
            );
            const freqVal = dataArray[binIndex] / 255;

            if (isVoiceActive) {
              const boost = (freqVal * 2.0 + (avgVolume / 160)) * factor;
              return Math.min(1.0, Math.max(0.15, boost));
            } else {
              const idle = 0.12 + 0.04 * Math.sin(performance.now() * 0.0025 + i * 0.22);
              return Math.max(0.08, idle * factor);
            }
          });
          setWaveAmplitudes(newAmps);
        } else {
          const idle = 0.12;
          setWaveAmplitudes(new Array(50).fill(idle));
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isCallActive]);

  // Drains speech queue sentence by sentence as they stream in
  const drainSpeechQueue = async () => {
    if (!isCallActiveRef.current) {
      speechQueueRef.current = [];
      streamingTtsBufferRef.current = "";
      isSpeakingUtteranceRef.current = false;
      return;
    }

    // Mutex lock: if an audio chunk is currently being fetched or spoken, wait for it to finish!
    if (isSpeakingUtteranceRef.current) {
      return;
    }

    if (speechQueueRef.current.length === 0) {
      if (isStreamFinishedRef.current) {
        currentUtteranceRef.current = null;
        currentAudioElementRef.current = null;
        isSpeakingUtteranceRef.current = false;
        setIsSpeaking(false);
        setCallStatus("listening");
        callStatusRef.current = "listening";
        setContent("");

        // Notify ChatWorkspace to batch process any queued sender messages accumulated in the conversation!
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cheapchat:call_turn_finished"));
        }

        startCallRecognition();
      }
      return;
    }

    const nextChunk = speechQueueRef.current.shift();
    if (!nextChunk) {
      drainSpeechQueue();
      return;
    }

    // ACQUIRE LOCK IMMEDIATELY to prevent duplicate concurrent playback
    isSpeakingUtteranceRef.current = true;
    const currentTurn = turnIdRef.current;

    const playBrowserFallback = (chunk: string, voiceKey?: string, callProfile?: SpeechProfile | null) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !isCallActiveRef.current || turnIdRef.current !== currentTurn) {
        isSpeakingUtteranceRef.current = false;
        drainSpeechQueue();
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      const bestVoice = callProfile?.auto
        ? getAutoBrowserVoice(voices, callProfile.gender, chunk, callLangRef.current || undefined)
        : getBestVoice(voices, voiceKey ?? ttsVoice, chunk, sttLang);

      let chunkToSpeak = chunk;
      if (
        callProfile?.auto &&
        getAutoAzureVoice(chunk, callProfile.gender, callLangRef.current || undefined).includes("ur-PK")
      ) {
        chunkToSpeak = romanUrduToUrduScript(chunk);
      }
      if (/[\u0600-\u06FF]/.test(chunkToSpeak)) {
        const isNativeUrduOrArabic =
          bestVoice &&
          (bestVoice.lang.toLowerCase().startsWith("ur") || bestVoice.lang.toLowerCase().startsWith("ar"));
        if (!isNativeUrduOrArabic) {
          chunkToSpeak = transliterateToRomanUrdu(chunkToSpeak);
        }
      }

      const utterance = new SpeechSynthesisUtterance(chunkToSpeak);
      currentUtteranceRef.current = utterance;
      const ttsSettings = getEffectiveTtsSettings(ttsVoice);
      utterance.rate = ttsSettings.rate;
      utterance.pitch = ttsSettings.pitch;

      if (bestVoice) {
        utterance.voice = bestVoice;
        if (bestVoice.lang) {
          utterance.lang = bestVoice.lang;
        }
      }

      utterance.onstart = () => {
        if (!isCallActiveRef.current || turnIdRef.current !== currentTurn) {
          window.speechSynthesis.cancel();
          isSpeakingUtteranceRef.current = false;
          return;
        }
        setCallStatus("speaking");
        callStatusRef.current = "speaking";
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        currentUtteranceRef.current = null;
        isSpeakingUtteranceRef.current = false;
        drainSpeechQueue();
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("Speech synthesis chunk error:", e);
        }
        currentUtteranceRef.current = null;
        isSpeakingUtteranceRef.current = false;
        drainSpeechQueue();
      };

      window.speechSynthesis.speak(utterance);
    };

    // Exactly ONE saved speech profile drives the call: the same voice saved in
    // Settings. No cross-fallback — if this source fails the chunk is skipped
    // instead of speaking with the other engine.
    const profile = resolveSpeechProfile(ttsEngine, ttsVoice);

    if (!profile) {
      isSpeakingUtteranceRef.current = false;
      return;
    }

    // Auto Detect: AI identifies the language once per turn, every chunk of this
    // answer then uses the accent that matches it.
    if (profile.auto) {
      if (!callLangPromiseRef.current) {
        callLangPromiseRef.current = detectLanguageWithAI(nextChunk).then((lang) => {
          callLangRef.current = lang;
          return lang;
        });
      }
      await callLangPromiseRef.current;
      if (turnIdRef.current !== currentTurn || !isCallActiveRef.current) {
        isSpeakingUtteranceRef.current = false;
        return;
      }
    }

    if (profile.engine === "browser") {
      playBrowserFallback(nextChunk, profile.voice, profile);
      return;
    }

    // By API: Azure neural voice (Roman-Urdu personas get native Urdu script)
    try {
      const resp = await fetch("/api/cheapchats/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: profile.auto
            ? getAutoAzureVoice(nextChunk, profile.gender).includes("ur-PK")
              ? romanUrduToUrduScript(nextChunk)
              : nextChunk
            : profile.script === "urdu"
            ? romanUrduToUrduScript(nextChunk)
            : nextChunk,
          voice: profile.auto
            ? `azure:${getAutoAzureVoice(nextChunk, profile.gender)}`
            : profile.apiVoice,
        }),
      });

      // Discard chunk if turn changed or call ended while awaiting network
      if (turnIdRef.current !== currentTurn || !isCallActiveRef.current) {
        isSpeakingUtteranceRef.current = false;
        return;
      }

      if (resp.ok) {
        const blob = await resp.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        currentAudioElementRef.current = audio;

        audio.onplay = () => {
          if (!isCallActiveRef.current || turnIdRef.current !== currentTurn) {
            audio.pause();
            currentAudioElementRef.current = null;
            isSpeakingUtteranceRef.current = false;
            return;
          }
          setCallStatus("speaking");
          callStatusRef.current = "speaking";
          setIsSpeaking(true);
        };

        audio.onended = () => {
          currentAudioElementRef.current = null;
          isSpeakingUtteranceRef.current = false;
          drainSpeechQueue();
        };

        audio.onerror = () => {
          currentAudioElementRef.current = null;
          isSpeakingUtteranceRef.current = false;
          reportCallSpeechError();
        };

        await audio.play();
        return;
      }
    } catch {
      // Network error: stay on the same selected voice, skip this chunk
    }

    isSpeakingUtteranceRef.current = false;
    reportCallSpeechError();
  };

  const processStreamBuffer = (isFinal = false) => {
    if (!isCallActiveRef.current) return;

    let buf = streamingTtsBufferRef.current;
    // Complete sentences only (. ! ? \n or Urdu khatam ۔) to avoid choppy word pauses
    const sentenceRegex = /([.!?۔\n]+)(\s+|$)/g;

    while (true) {
      sentenceRegex.lastIndex = 0;
      let match = sentenceRegex.exec(buf);

      // Fast initial response: break on clause if buffer has accumulated >= 10 words without sentence punctuation
      if (!match) {
        const words = buf.trim().split(/\s+/).filter(Boolean);
        if (words.length >= CALL_FIRST_CHUNK_WORDS) {
          const clauseRegex = /([,;:—])(\s+)/g;
          match = clauseRegex.exec(buf);
        }
      }

      if (match && match.index !== undefined) {
        const endPos = match.index + match[1].length;
        const rawChunk = buf.slice(0, endPos).trim();
        buf = buf.slice(match.index + match[0].length);

        if (rawChunk) {
          const cleaned = cleanTextForSpeech(rawChunk);
          if (cleaned) {
            speechQueueRef.current.push(cleaned);
          }
        }
      } else {
        break;
      }
    }

    if (isFinal) {
      const remaining = buf.trim();
      if (remaining) {
        const cleaned = cleanTextForSpeech(remaining);
        if (cleaned) {
          speechQueueRef.current.push(cleaned);
        }
      }
      buf = "";
    }

    streamingTtsBufferRef.current = buf;
    drainSpeechQueue();
  };

  // Real-time listener for streaming tokens to start speaking immediately as response streams!
  useEffect(() => {
    if (!isCallActive) return;

    const handleStreamToken = (e: any) => {
      if (!isCallActiveRef.current) return;
      const token = e.detail?.token;
      if (typeof token === "string" && token) {
        didStreamSpeakRef.current = true;
        streamingTtsBufferRef.current += token;
        processStreamBuffer(false);
      }
    };

    const handleStreamEnd = () => {
      if (!isCallActiveRef.current) return;
      isStreamFinishedRef.current = true;
      processStreamBuffer(true);
    };

    window.addEventListener("cheapchat:stream_token", handleStreamToken);
    window.addEventListener("cheapchat:stream_end", handleStreamEnd);

    return () => {
      window.removeEventListener("cheapchat:stream_token", handleStreamToken);
      window.removeEventListener("cheapchat:stream_end", handleStreamEnd);
    };
  }, [isCallActive]);

  const speakCallResponse = (text: string) => {
    if (!isCallActiveRef.current) return;
    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) {
      setCallStatus("listening");
      callStatusRef.current = "listening";
      setContent("");
      startCallRecognition();
      return;
    }
    didStreamSpeakRef.current = true;
    streamingTtsBufferRef.current = cleaned;
    isStreamFinishedRef.current = true;
    processStreamBuffer(true);
  };

  const triggerCallSend = async (text: string) => {
    const cleanPrompt = text.trim();
    if (!cleanPrompt || !isCallActiveRef.current) return;

    if (callRecognitionRef.current) {
      try {
        callRecognitionRef.current.abort();
      } catch {}
    }

    // Advance turn ID so any obsolete in-flight audio fetches or utterances are discarded
    turnIdRef.current += 1;
    callLangRef.current = null;
    callLangPromiseRef.current = null;

    // Reset streaming TTS queue & pause active audio elements for new response
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioElementRef.current) {
      try {
        currentAudioElementRef.current.pause();
        currentAudioElementRef.current.currentTime = 0;
      } catch {}
      currentAudioElementRef.current = null;
    }
    currentUtteranceRef.current = null;
    speechQueueRef.current = [];
    streamingTtsBufferRef.current = "";
    isSpeakingUtteranceRef.current = false;
    isStreamFinishedRef.current = false;
    didStreamSpeakRef.current = false;

    setCallStatus("thinking");
    callStatusRef.current = "thinking";
    setIsUserSpeaking(false);
    if (userSpeakingTimeoutRef.current) {
      clearTimeout(userSpeakingTimeoutRef.current);
      userSpeakingTimeoutRef.current = null;
    }
    setContent("");

    // Restart speech recognition so it actively listens and queues any user words during thinking/speaking!
    setTimeout(() => {
      if (isCallActiveRef.current) {
        startCallRecognition();
      }
    }, 150);

    try {
      const assistantReply = await onSend(cleanPrompt, attachmentsRef.current, false, true);
      setAttachments([]);

      if (isCallActiveRef.current) {
        isStreamFinishedRef.current = true;
        processStreamBuffer(true);

        // Fallback: ONLY if no streaming speech was ever queued or spoken, speak once
        if (!didStreamSpeakRef.current && !isSpeakingUtteranceRef.current && speechQueueRef.current.length === 0) {
          if (assistantReply && assistantReply.trim()) {
            speakCallResponse(assistantReply);
          } else {
            setCallStatus("listening");
            callStatusRef.current = "listening";
            setContent("");
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("cheapchat:call_turn_finished"));
            }
            startCallRecognition();
          }
        }
      }
    } catch (err) {
      console.error("Call assistant send error:", err);
      if (isCallActiveRef.current) {
        isStreamFinishedRef.current = true;
        if (!isSpeakingUtteranceRef.current && speechQueueRef.current.length === 0) {
          setCallStatus("listening");
          callStatusRef.current = "listening";
          setContent("");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("cheapchat:call_turn_finished"));
          }
          startCallRecognition();
        }
      }
    }
  };

  const startCallRecognition = () => {
    if (!isCallActiveRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Chrome Speech Recognition is required. Please open CheapChats in Google Chrome.");
      handleEndCall();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getEffectiveSttLang(sttLang);
    callRecognitionRef.current = recognition;

    recognition.onspeechstart = () => {
      if (isCallActiveRef.current) {
        setIsUserSpeaking(true);
      }
    };

    recognition.onspeechend = () => {
      if (isCallActiveRef.current) {
        setIsUserSpeaking(false);
      }
    };

    recognition.onsoundstart = () => {
      if (isCallActiveRef.current) {
        setIsUserSpeaking(true);
      }
    };

    recognition.onsoundend = () => {
      if (isCallActiveRef.current) {
        setIsUserSpeaking(false);
      }
    };

    recognition.onresult = (event: any) => {
      if (!isCallActiveRef.current) return;

      let fullTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      let combinedText = fullTranscript.trim();
      if (sttLang === "ur-roman") {
        combinedText = transliterateToRomanUrdu(combinedText);
      }

      if (containsEndCallKeyword(combinedText)) {
        handleEndCall();
        return;
      }

      if (containsStopKeyword(combinedText)) {
        stopCallSpeaking();
        return;
      }

      if (combinedText) {
        setIsUserSpeaking(true);
        if (userSpeakingTimeoutRef.current) {
          clearTimeout(userSpeakingTimeoutRef.current);
        }
        userSpeakingTimeoutRef.current = setTimeout(() => {
          setIsUserSpeaking(false);
        }, 800);

        lastSpokenTranscriptRef.current = combinedText;

        if (callSilenceTimerRef.current) {
          clearTimeout(callSilenceTimerRef.current);
        }

        callSilenceTimerRef.current = setTimeout(() => {
          if (!isCallActiveRef.current) return;
          const textToSend = lastSpokenTranscriptRef.current.trim();
          lastSpokenTranscriptRef.current = "";
          if (textToSend) {
            // NEVER put text into input field! Directly send into conversation thread as sender bubble box!
            if (callStatusRef.current === "listening") {
              triggerCallSend(textToSend);
            } else {
              // Assistant is thinking or speaking: onSend creates a queued user sender bubble in the chat thread!
              onSend(textToSend, [], false, true);
            }

            try {
              if (callRecognitionRef.current) {
                callRecognitionRef.current.abort();
              }
            } catch {}
          }
        }, CALL_SILENCE_MS);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        alert("Microphone permission denied. Please enable microphone permissions in Chrome.");
        handleEndCall();
      } else if (event.error !== "no-speech" && isCallActiveRef.current) {
        console.warn("Call speech recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      if (isCallActiveRef.current && callRecognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {}
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Speech recognition already running or start error:", e);
    }
  };

  const handleStartCall = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Chrome Speech Recognition is required. Please open CheapChats in Google Chrome.");
      return;
    }

    setIsCallActive(true);
    isCallActiveRef.current = true;
    setCallAssistantOpen(true);
    if (typeof window !== "undefined") {
      (window as any).__cheapchats_is_call_active = true;
    }
    setCallStatus("listening");
    callStatusRef.current = "listening";
    setContent("");

    // Warm up the offline speech engine so the very first reply is not delayed
    if (ttsEngine === "browser" && typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const warm = new SpeechSynthesisUtterance(" ");
        warm.volume = 0;
        window.speechSynthesis.speak(warm);
      } catch {}
    }

    await startMicAudioAnalyser();
    startCallRecognition();
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

    // Resolve user's active BYOK key and custom provider if applicable
    let customProvider: CustomProvider | undefined;
    if (selectedProvider) {
      if (selectedProvider.startsWith("custom:")) {
        const customProviderId = selectedProvider.slice("custom:".length);
        try {
          customProvider = readCustomProviders().find((provider) => provider.id === customProviderId);
        } catch {}
      } else {
        try {
          customProvider = readCustomProviders().find(
            (provider) =>
              provider.name.toLowerCase() === selectedProvider.toLowerCase() ||
              provider.id.toLowerCase() === selectedProvider.toLowerCase()
          );
        } catch {}
      }
    }

    let userKey: string | undefined;
    try {
      const raw = localStorage.getItem("cheapchats_provider_keys");
      if (raw) {
        const keys = JSON.parse(raw);
        const pName = (selectedProvider || "openrouter").toLowerCase();
        userKey = customProvider
          ? keys[customProvider.id]
          : keys[pName] || keys[`ap_${pName}`] || (selectedProvider ? keys[selectedProvider] : undefined);
      }
    } catch {}

    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          model: selectedModel,
          provider: customProvider ? customProvider.name : selectedProvider,
          apiKey: userKey,
          customEndpoint: customProvider?.baseUrl,
          isCustom: !!customProvider,
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
    const skillName = getSuggestionSkillName(item.title, item.type);
    if (skillName) addSelectedSkill(skillName);
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
      {showSlashPrompts && (filteredSkills.length > 0 || filteredSuggestions.length > 0) && (
        <div
          ref={slashMenuRef}
          className="absolute bottom-full mb-2 left-4 right-4 z-50 max-h-80 overflow-y-auto rounded-[18px] border border-white/[0.09] bg-[#202023]/95 p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          {filteredSkills.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-rose-300/80">/</span>
                  <span>Skills</span>
                </div>
                <span className="text-[10px] font-normal normal-case tracking-normal text-white/35">{filteredSkills.length}</span>
              </div>
              <div className="space-y-0.5">
                {filteredSkills.map((s, idx) => (
                  <button
                    key={`skill-${idx}`}
                    type="button"
                    onClick={() => handleSelectSkill(s)}
                    className="group flex w-full items-start gap-2 rounded-[11px] px-2 py-1.5 text-left text-xs transition-colors hover:bg-white/[0.07]"
                  >
                    <div className="mt-px flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-md bg-white/[0.06] font-mono text-[10px] font-semibold text-white/45 transition-colors group-hover:bg-rose-500/20 group-hover:text-rose-200">
                      /
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-white/90 transition-colors group-hover:text-white">
                        {s.name}
                      </div>
                      {s.description && (
                        <div className="mt-0.5 truncate text-[10px] leading-tight text-white/45">
                          {s.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredSuggestions.length > 0 && (
            <div className={filteredSkills.length > 0 ? "mt-1.5 border-t border-white/[0.07] pt-1.5" : ""}>
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">
                <div className="flex items-center gap-1.5">
                  <Command className="h-3 w-3 text-rose-300/75" />
                  <span>Suggestions</span>
                </div>
                <span className="text-[10px] font-normal normal-case tracking-normal text-white/35">{filteredSuggestions.length}</span>
              </div>
              <div className="space-y-0.5">
                {filteredSuggestions.map((item, idx) => (
                  <button
                    key={`sug-${idx}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="group flex w-full items-start justify-between gap-2 rounded-[11px] px-2 py-1.5 text-left text-xs transition-colors hover:bg-white/[0.07]"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <div className="mt-px flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-white/45 transition-colors group-hover:bg-rose-500/20 group-hover:text-rose-200">
                        {item.title === "Web Search" ? (
                          <Globe className="h-3 w-3" />
                        ) : item.title === "Mermaid Diagram" ? (
                          <Zap className="h-3 w-3" />
                        ) : (item.title === "HTML page / game" || item.title === "HTML & 2D Game") ? (
                          <Gamepad2 className="h-3 w-3" />
                        ) : item.title === "Summarize" ? (
                          <FileText className="h-3 w-3" />
                        ) : (
                          <Command className="h-3 w-3" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-white/90 transition-colors group-hover:text-white">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="mt-0.5 truncate text-[10px] leading-tight text-white/45">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="hidden max-w-[140px] flex-shrink-0 truncate pt-0.5 font-mono text-[10px] text-white/35 sm:inline-block">
                      {item.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Model Selector Top-Left Bar */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <ModelSelector />
      </div>

      {/* Container wrapping Main Input Box */}
      <div className="flex items-end gap-2.5">
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
          className={`relative flex-1 min-w-0 bg-[#1b1013] rounded-3xl pt-3 px-3.5 pb-2 border transition-all duration-150 shadow-2xl flex flex-col gap-2 ${
            isStreaming
              ? styles.streamingBorder
              : isDraggingOver
                ? "border-emerald-500/80 ring-2 ring-emerald-500/30 bg-[#16201b]"
                : "border-red-500/20 focus-within:border-red-500/40 focus-within:ring-1 focus-within:ring-red-500/30"
          }`}
        >
        {/* Call Assistant Button: absolutely at top-right, just above the input field */}
        <div className="absolute top-2 right-2 z-10">
            <button
              type="button"
              onClick={isCallActive ? handleEndCall : handleStartCall}
              className={`p-0 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center ${
                isCallActive
                  ? "text-red-500 hover:text-red-400 animate-pulse"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              aria-label={isCallActive ? "End Call" : "Start Voice Call"}
            >
              {isCallActive ? (
                <PhoneOff className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <PhoneCall className="w-5 h-5 stroke-[2]" />
              )}
            </button>
        </div>

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
            isCallActive
              ? "Listening to your voice..."
              : activeSuggestionChip
              ? `Add details for ${activeSuggestionChip.label}...`
              : "Ask anything — / for types or skills"
          }
          rows={1}
          disabled={disabled}
          className={`w-full bg-transparent border-none text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus-visible:outline-none resize-none max-h-44 leading-relaxed pr-6 ${styles.messageTextarea}`}
        />

        {/* Bottom Area: If isCallActive, show full-width sound waves; else show normal tools */}
        {isCallActive ? (
          <div className="w-full pt-1.5 pb-0.5 border-t border-zinc-800/80 animate-in fade-in duration-200 select-none">
            {/* Status indicator badge above waves */}
            {/* Status indicator badge above waves */}
            <div className="flex items-center justify-between px-1 pb-1 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 min-w-0">
                {isUserSpeaking || (waveAmplitudes.reduce((a, b) => a + b, 0) / (waveAmplitudes.length || 1) > 0.18) ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 ring-1 ring-red-500 animate-pulse flex-shrink-0" />
                    <span className="text-white font-semibold tracking-wide truncate">
                      Listening to You (Speaking)
                    </span>
                  </>
                ) : callStatus === "speaking" ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    <span className="text-red-400 font-semibold tracking-wide truncate">
                      Assistant Speaking
                    </span>
                  </>
                ) : callStatus === "thinking" ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping flex-shrink-0" />
                    <span className="text-amber-300 tracking-wide truncate">
                      Thinking & Preparing Response...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
                    <span className="text-slate-300 tracking-wide truncate">
                      Connected • Silent (Sakin)
                    </span>
                  </>
                )}
              </span>
              <span className="text-zinc-500 text-[9px] uppercase tracking-wider font-semibold flex-shrink-0">
                Voice Call
              </span>
            </div>

            {/* 4-State Waves:
                1) Silent / Sakin: Dark grey -> grey -> silver metallic
                2) User Speaking: Silver body with glowing Red outline on every wave bar
                3) Thinking / Time lag raha ho: Dark red to orange / amber
                4) Response Speaking: Dark red -> red -> dark red
            */}
            <div className="w-full flex items-center justify-between gap-[2px] sm:gap-1 px-0.5 overflow-hidden min-h-[36px]">
              {WAVE_BAR_FACTORS.map((_, i) => {
                const amp = waveAmplitudes[i] ?? 0.12;
                const isSpeaking = callStatus === "speaking";
                const isThinking = callStatus === "thinking";
                const avgAmp = waveAmplitudes.reduce((acc, v) => acc + v, 0) / (waveAmplitudes.length || 1);
                const isUserTalking = isUserSpeaking || avgAmp > 0.18 || amp > 0.24;

                let barClass = "";
                let barHeight = Math.max(4, Math.round(amp * 18));

                if (isUserTalking) {
                  // 2) User Speaking: Silver body with red outline/border on every wave bar
                  barClass = "bg-gradient-to-t from-zinc-600 via-zinc-300 to-slate-100 border-[1.5px] border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]";
                  barHeight = Math.max(5, Math.round(amp * 36));
                } else if (isSpeaking) {
                  // 4) Response Speaking: Dark red -> red -> dark red
                  barClass = "bg-gradient-to-t from-red-950 via-red-600 to-red-950 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.65)]";
                  barHeight = Math.max(5, Math.round(amp * 36));
                } else if (isThinking) {
                  // 3) Response aane mein time lag raha ho / Thinking: Dark red se orange
                  barClass = "bg-gradient-to-t from-red-900 via-orange-600 to-amber-400 border border-orange-500/40 shadow-[0_0_8px_rgba(249,115,22,0.45)]";
                  barHeight = Math.max(4, Math.round(amp * 22));
                } else {
                  // 1) Silent / Sakin: Dark grey -> grey -> silver metallic
                  barClass = "bg-gradient-to-t from-zinc-700 via-zinc-400 to-slate-200 border border-zinc-500/20 shadow-[0_0_4px_rgba(203,213,225,0.25)]";
                  barHeight = Math.max(4, Math.round(amp * 16));
                }

                return (
                  <span
                    key={i}
                    className={`flex-1 min-w-[2px] max-w-[8px] rounded-full transition-all duration-75 ease-out ${barClass}`}
                    style={{
                      height: `${barHeight}px`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ) : (
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

              {/* Saved-voice playback error: never silently use another voice */}
              {callSpeechError && (
                <Tooltip content="Saved voice failed to play. Open Settings → Speech & Audio and press Save Speech." side="top">
                  <span className="px-2 py-1 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 text-[10px] font-bold animate-pulse">
                    Voice failed
                  </span>
                </Tooltip>
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
              {content.trim() || attachments.length > 0 || activeSuggestionChip ? (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isUploading}
                  className="p-1.5 rounded-xl border border-zinc-700/60 bg-zinc-800/60 text-zinc-200 hover:text-white hover:bg-zinc-700/70 hover:border-zinc-600 transition-all duration-150 flex items-center justify-center shadow-sm cursor-pointer"
                  title="Send Message"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              ) : isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="p-1.5 rounded-xl border border-red-900/80 bg-red-950/80 text-rose-200 hover:bg-red-900/80 hover:text-white transition-all duration-150 flex items-center justify-center shadow-sm cursor-pointer"
                  title="Stop generating"
                  aria-label="Stop generating"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  disabled={!isSttEnabled}
                  className={`p-1.5 rounded-xl border transition-all duration-150 flex items-center justify-center select-none cursor-pointer ${isListening
                      ? "bg-red-600 text-white border-red-500 animate-pulse shadow-lg shadow-red-600/50"
                      : "bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-700/70 hover:border-zinc-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                    }`}
                  title={!isSttEnabled ? "Enable speech input in Settings" : isListening ? "Stop Voice Input" : "Voice Input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>

      {/* Centered Footer Text */}
      <div className="mt-2 text-center text-[11px] text-red-300/50">
        <span>CheapChat - Open Source, Free to Use - v1.0 Beta</span>
      </div>
    </div>
  );
}
