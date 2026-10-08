"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Square,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { useAppStore } from "../../lib/store";
import { Message } from "./MessageItem";
import {
  cleanTextForSpeech,
  getBestVoice,
  containsStopKeyword,
} from "../../lib/speechUtils";

type CallState = "listening" | "thinking" | "speaking" | "interrupted";

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<string | undefined>;
  selectedModel: string;
  selectedProvider: string | null;
  latestAssistantMessage?: Message | null;
  isStreaming: boolean;
  onStopStreaming?: () => void;
}

export default function VoiceCallModal({
  isOpen,
  onClose,
  onSendMessage,
  selectedModel,
  selectedProvider,
  latestAssistantMessage,
  isStreaming,
  onStopStreaming,
}: VoiceCallModalProps) {
  const { sttLang, ttsVoice } = useAppStore();

  const [callState, setCallState] = useState<CallState>("listening");
  const [userTranscript, setUserTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [assistantSpokenText, setAssistantSpokenText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // References
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callStateRef = useRef<CallState>("listening");
  const isMutedRef = useRef(false);
  const isCallActiveRef = useRef(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastProcessedTextRef = useRef<string>("");

  // Sync ref with state
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Audio waveform pulse simulation based on state
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      if (callStateRef.current === "speaking") {
        setAudioLevel(0.4 + Math.random() * 0.6);
      } else if (callStateRef.current === "listening") {
        setAudioLevel(0.15 + Math.random() * 0.25);
      } else {
        setAudioLevel(0.1);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Stop TTS speech and return to listening immediately
  const handleStopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    currentUtteranceRef.current = null;
    if (isCallActiveRef.current) {
      setCallState("listening");
      setUserTranscript("");
      setInterimTranscript("");
    }
  }, []);

  // Play Assistant Speech (TTS)
  const speakAssistantResponse = useCallback(
    (textToSpeak: string) => {
      if (!isCallActiveRef.current) return;
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setCallState("listening");
        return;
      }

      const cleaned = cleanTextForSpeech(textToSpeak);
      if (!cleaned) {
        setCallState("listening");
        return;
      }

      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();

      setAssistantSpokenText(cleaned);
      setCallState("speaking");

      const utterance = new SpeechSynthesisUtterance(cleaned);
      currentUtteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      const bestVoice = getBestVoice(voices, ttsVoice, cleaned);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onstart = () => {
        if (!isCallActiveRef.current) {
          window.speechSynthesis.cancel();
          return;
        }
        setCallState("speaking");
      };

      utterance.onend = () => {
        currentUtteranceRef.current = null;
        if (isCallActiveRef.current) {
          setCallState("listening");
          setUserTranscript("");
          setInterimTranscript("");
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("Speech synthesis error:", e);
        }
        currentUtteranceRef.current = null;
        if (isCallActiveRef.current) {
          setCallState("listening");
          setUserTranscript("");
          setInterimTranscript("");
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [ttsVoice]
  );

  // Send the transcribed speech to the LLM model
  const handleSendPrompt = useCallback(
    async (textToSend: string) => {
      const cleanPrompt = textToSend.trim();
      if (!cleanPrompt || !isCallActiveRef.current) return;

      // Transition to Thinking
      setCallState("thinking");
      setUserTranscript(cleanPrompt);
      setInterimTranscript("");

      try {
        const assistantResponse = await onSendMessage(cleanPrompt);

        // If the call is still active, speak the returned response
        if (isCallActiveRef.current) {
          if (assistantResponse && assistantResponse.trim()) {
            speakAssistantResponse(assistantResponse);
          } else {
            // If response was empty or error, return to listening
            setCallState("listening");
          }
        }
      } catch (err: any) {
        console.error("Voice call LLM send error:", err);
        if (isCallActiveRef.current) {
          setErrorMessage("Failed to get response. Retrying voice listener...");
          setTimeout(() => setErrorMessage(null), 3000);
          setCallState("listening");
        }
      }
    },
    [onSendMessage, speakAssistantResponse]
  );

  // Setup Continuous Web Speech API Recognition
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        "Chrome Speech Recognition is not supported or enabled in this browser. Please use Google Chrome."
      );
      return;
    }

    isCallActiveRef.current = true;
    setCallState("listening");
    setUserTranscript("");
    setInterimTranscript("");
    setAssistantSpokenText("");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = sttLang || navigator.language || "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      if (!isCallActiveRef.current || isMutedRef.current) return;

      let final = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      const combinedText = (final || interim).trim();

      // Check for Barge-in ("Stop" keyword) while Assistant is speaking
      if (callStateRef.current === "speaking") {
        if (containsStopKeyword(combinedText)) {
          handleStopSpeaking();
        }
        // Do not process non-stop words while assistant is speaking
        return;
      }

      // Normal listening mode (user is speaking)
      if (callStateRef.current === "listening") {
        if (final) {
          setUserTranscript((prev) => (prev ? `${prev} ${final}` : final).trim());
          setInterimTranscript("");
        } else {
          setInterimTranscript(interim);
        }

        // Reset silence countdown timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // 1.8-second silence gap detection (as requested: 1 to 2 seconds gap)
        silenceTimerRef.current = setTimeout(() => {
          if (callStateRef.current === "listening" && isCallActiveRef.current) {
            setUserTranscript((prev) => {
              const fullSpeech = `${prev} ${interim}`.trim();
              if (fullSpeech.length > 0 && fullSpeech !== lastProcessedTextRef.current) {
                lastProcessedTextRef.current = fullSpeech;
                handleSendPrompt(fullSpeech);
              }
              return "";
            });
            setInterimTranscript("");
          }
        }, 1800);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setErrorMessage("Microphone permission denied. Please allow microphone in browser.");
      } else if (event.error !== "no-speech") {
        console.warn("Call assistant speech recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      // Chrome automatically stops recognition after periods of silence; auto-restart if call is active
      if (isCallActiveRef.current && !isMutedRef.current) {
        try {
          recognition.start();
        } catch {
          // already running or restarting
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Speech recognition already running or start error:", e);
    }

    return () => {
      isCallActiveRef.current = false;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      try {
        recognition.stop();
      } catch {}
      recognitionRef.current = null;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, sttLang, handleSendPrompt, handleStopSpeaking]);

  // Handle Mute Toggle
  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        try {
          recognitionRef.current?.stop();
        } catch {}
      } else {
        try {
          recognitionRef.current?.start();
        } catch {}
      }
      return next;
    });
  };

  // Close / Hang up call
  const handleEndCall = () => {
    isCallActiveRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    try {
      recognitionRef.current?.stop();
    } catch {}
    if (isStreaming && onStopStreaming) {
      onStopStreaming();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] transition-all duration-700 ${
            callState === "speaking"
              ? "bg-purple-600/35 scale-125"
              : callState === "thinking"
              ? "bg-amber-600/35 scale-110"
              : "bg-emerald-600/35 scale-100"
          }`}
        />
        <div
          className={`absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[140px] transition-all duration-700 ${
            callState === "speaking"
              ? "bg-pink-600/25"
              : callState === "thinking"
              ? "bg-indigo-600/25"
              : "bg-teal-600/25"
          }`}
        />
      </div>

      {/* Main Glassmorphic Container */}
      <div className="relative w-full max-w-xl bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between shadow-2xl shadow-black/80 overflow-hidden min-h-[520px]">
        
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between gap-3 border-b border-zinc-800/60 pb-4 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <PhoneCall className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  Call Assistant
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      callState === "speaking"
                        ? "bg-purple-400"
                        : callState === "thinking"
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      callState === "speaking"
                        ? "bg-purple-500"
                        : callState === "thinking"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Live hands-free conversation with browser voice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Model Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 max-w-[180px]">
              <Cpu className="w-3 h-3 text-red-400 flex-shrink-0" />
              <span className="truncate font-mono">{selectedModel}</span>
            </div>

            <button
              type="button"
              onClick={handleEndCall}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Visualizer: Dynamic ChatGPT-Style Glowing Pulsing Orb */}
        <div className="my-auto flex flex-col items-center justify-center py-6 w-full relative z-10">
          <div
            onClick={callState === "speaking" ? handleStopSpeaking : undefined}
            title={callState === "speaking" ? 'Click or say "Stop" to interrupt' : undefined}
            className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center cursor-pointer select-none transition-transform duration-300 ${
              callState === "speaking" ? "hover:scale-105 active:scale-95" : ""
            }`}
          >
            {/* Outer Ripple Layers */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                callState === "speaking"
                  ? "bg-purple-500/20 animate-ping opacity-60"
                  : callState === "thinking"
                  ? "bg-amber-500/20 animate-pulse opacity-50"
                  : isMuted
                  ? "bg-zinc-700/20 opacity-20"
                  : "bg-emerald-500/20 animate-ping opacity-40"
              }`}
              style={{ animationDuration: callState === "speaking" ? "1.4s" : "2.4s" }}
            />

            <div
              className={`absolute -inset-3 rounded-full blur-xl transition-all duration-500 ${
                callState === "speaking"
                  ? "bg-gradient-to-tr from-purple-600 to-pink-500 opacity-60"
                  : callState === "thinking"
                  ? "bg-gradient-to-tr from-amber-500 to-orange-500 opacity-60"
                  : isMuted
                  ? "bg-zinc-800 opacity-30"
                  : "bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-60"
              }`}
            />

            {/* Glowing Core Orb with Dynamic Sound Scales */}
            <div
              className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 border border-white/20 overflow-hidden ${
                callState === "speaking"
                  ? "bg-gradient-to-br from-purple-700 via-pink-600 to-rose-700 shadow-purple-900/60"
                  : callState === "thinking"
                  ? "bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 shadow-amber-900/60 animate-spin"
                  : isMuted
                  ? "bg-zinc-900 border-zinc-700 shadow-black"
                  : "bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 shadow-emerald-900/60"
              }`}
              style={{
                transform: `scale(${1 + audioLevel * 0.12})`,
                animationDuration: callState === "thinking" ? "6s" : "3s",
              }}
            >
              {/* Internal Glass Highlights */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/30 pointer-events-none" />

              {/* Center State Icon */}
              {callState === "speaking" ? (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-10 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-8 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="w-1.5 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: "450ms" }} />
                </div>
              ) : callState === "thinking" ? (
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              ) : isMuted ? (
                <MicOff className="w-9 h-9 text-zinc-400" />
              ) : (
                <Mic className="w-10 h-10 text-white animate-pulse" />
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-6 flex flex-col items-center gap-1.5">
            <div
              className={`px-3.5 py-1 rounded-full text-xs font-medium tracking-wide flex items-center gap-2 border shadow-sm ${
                callState === "speaking"
                  ? "bg-purple-950/60 border-purple-500/40 text-purple-200"
                  : callState === "thinking"
                  ? "bg-amber-950/60 border-amber-500/40 text-amber-200"
                  : isMuted
                  ? "bg-zinc-900 border-zinc-700 text-zinc-400"
                  : "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  callState === "speaking"
                    ? "bg-purple-400 animate-pulse"
                    : callState === "thinking"
                    ? "bg-amber-400 animate-spin"
                    : isMuted
                    ? "bg-zinc-500"
                    : "bg-emerald-400 animate-pulse"
                }`}
              />
              <span>
                {callState === "speaking"
                  ? "Assistant Speaking..."
                  : callState === "thinking"
                  ? "Generating Answer..."
                  : isMuted
                  ? "Microphone Muted"
                  : "Listening... Speak anytime"}
              </span>
            </div>

            <p className="text-[12px] text-zinc-400 text-center max-w-sm">
              {callState === "speaking" ? (
                <span className="text-purple-300 font-medium">
                  Say <span className="underline font-bold text-white">"Stop"</span> or click Stop to interrupt
                </span>
              ) : callState === "thinking" ? (
                <span>Selected model is thinking...</span>
              ) : isMuted ? (
                <span>Unmute to resume conversation</span>
              ) : (
                <span>Pause speaking for ~2s to send automatically</span>
              )}
            </p>
          </div>

          {/* Live Transcript Cards */}
          <div className="w-full mt-5 px-2 max-h-28 overflow-y-auto space-y-2">
            {/* User transcript card */}
            {(userTranscript || interimTranscript) && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 text-xs text-zinc-200 shadow-sm animate-in fade-in">
                <span className="text-emerald-400 font-semibold mr-1.5">You:</span>
                <span>{userTranscript}</span>
                {interimTranscript && (
                  <span className="text-zinc-500 italic ml-1">{interimTranscript}</span>
                )}
              </div>
            )}

            {/* Assistant transcript card */}
            {assistantSpokenText && (
              <div className="bg-zinc-900/80 border border-purple-900/40 rounded-2xl p-3 text-xs text-zinc-200 shadow-sm animate-in fade-in">
                <span className="text-purple-400 font-semibold mr-1.5">Assistant:</span>
                <span className="line-clamp-3">{assistantSpokenText}</span>
              </div>
            )}

            {/* Error Message Card */}
            {errorMessage && (
              <div className="bg-red-950/60 border border-red-500/40 rounded-2xl p-2.5 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="w-full flex items-center justify-center gap-4 sm:gap-6 pt-4 border-t border-zinc-800/60 z-10">
          {/* Mute / Unmute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`p-3.5 rounded-full border transition-all duration-150 flex items-center justify-center cursor-pointer shadow-md ${
              isMuted
                ? "bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30"
                : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call / Hang Up Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/70 hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Interrupt / Stop Button */}
          <button
            type="button"
            onClick={handleStopSpeaking}
            disabled={callState !== "speaking"}
            className={`p-3.5 rounded-full border transition-all duration-150 flex items-center justify-center cursor-pointer shadow-md ${
              callState === "speaking"
                ? "bg-purple-600/25 border-purple-500/50 text-purple-200 hover:bg-purple-600/40 animate-pulse"
                : "bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
            title="Stop Assistant Voice (Or say 'Stop')"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        </div>

      </div>
    </div>
  );
}
