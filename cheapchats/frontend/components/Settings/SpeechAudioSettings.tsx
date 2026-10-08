"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Check,
  RefreshCw,
  Globe2,
  Sliders,
  Radio,
  AudioWaveform,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  SPEECH_LANGUAGES,
  SpeechLanguageOption,
  getEffectiveSttLang,
  getBestVoice,
  cleanTextForSpeech,
} from "@cheapchats/frontend/lib/speechUtils";

export default function SpeechAudioSettings() {
  const {
    isSttEnabled,
    setIsSttEnabled,
    toggleSttEnabled,
    isTtsEnabled,
    setIsTtsEnabled,
    toggleTtsEnabled,
    sttLang,
    setSttLang,
    ttsVoice,
    setTtsVoice,
  } = useAppStore();

  // Browser Speech APIs Support
  const [speechSupport, setSpeechSupport] = useState({
    recognition: false,
    synthesis: false,
  });
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Speech Customization Sliders (Persisted in localStorage)
  const [playbackRate, setPlaybackRate] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cheapchat_tts_rate");
      if (saved) return Number(saved) || 1.0;
    }
    return 1.0;
  });

  const [pitch, setPitch] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cheapchat_tts_pitch");
      if (saved) return Number(saved) || 1.0;
    }
    return 1.0;
  });

  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    if (typeof window !== "undefined") {
      localStorage.setItem("cheapchat_tts_rate", String(newRate));
    }
  };

  const handlePitchChange = (newPitch: number) => {
    setPitch(newPitch);
    if (typeof window !== "undefined") {
      localStorage.setItem("cheapchat_tts_pitch", String(newPitch));
    }
  };

  // STT Testing State
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [testMicTranscript, setTestMicTranscript] = useState("");
  const [micStatusText, setMicStatusText] = useState("Ready to test");
  const testRecognitionRef = useRef<any>(null);

  // TTS Testing State
  const currentLangOption = SPEECH_LANGUAGES.find((l) => l.id === sttLang) || SPEECH_LANGUAGES[0];
  const [testText, setTestText] = useState(currentLangOption.samplePhrase);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [playingAccentId, setPlayingAccentId] = useState<string | null>(null);

  // Filter tabs for accent cards
  const [sttFilter, setSttFilter] = useState<"popular" | "all">("popular");
  const [ttsFilter, setTtsFilter] = useState<"popular" | "all">("popular");

  // Load browser voices & speech recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasRec = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
      const hasSyn = "speechSynthesis" in window;
      setSpeechSupport({ recognition: hasRec, synthesis: hasSyn });

      if (hasSyn) {
        const updateVoices = () => {
          const v = window.speechSynthesis.getVoices();
          setBrowserVoices(v);
        };
        updateVoices();
        window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
        return () => window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
      }
    }
  }, []);

  // Update test sample text when active language changes
  useEffect(() => {
    const lang = SPEECH_LANGUAGES.find((l) => l.id === sttLang);
    if (lang && lang.samplePhrase) {
      setTestText(lang.samplePhrase);
    }
  }, [sttLang]);

  // Clean up ongoing speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (testRecognitionRef.current) {
        try {
          testRecognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // ─── STT (Microphone) Test Handlers ──────────────────────────────────────────
  const startMicTest = (overrideLang?: string) => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Chrome Speech Recognition is not supported in this browser.");
      return;
    }

    if (isTestingMic) {
      stopMicTest();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      const effectiveLang = getEffectiveSttLang(overrideLang || sttLang);
      recognition.lang = effectiveLang;

      recognition.onstart = () => {
        setIsTestingMic(true);
        setMicStatusText("Listening... Speak into your microphone now.");
      };

      recognition.onresult = (event: any) => {
        let full = "";
        for (let i = 0; i < event.results.length; i++) {
          full += event.results[i][0].transcript;
        }
        setTestMicTranscript(full);
        setMicStatusText("Transcribing speech in real-time...");
      };

      recognition.onerror = (e: any) => {
        console.warn("Test recognition error:", e);
        if (e.error === "not-allowed") {
          setMicStatusText("Microphone permission denied. Enable mic in browser address bar.");
        } else {
          setMicStatusText(`Error (${e.error}). Click to retry.`);
        }
        setIsTestingMic(false);
      };

      recognition.onend = () => {
        setIsTestingMic(false);
        setMicStatusText("Test complete. Click start to test again.");
      };

      testRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech test:", err);
      setIsTestingMic(false);
      setMicStatusText("Could not start test microphone.");
    }
  };

  const stopMicTest = () => {
    if (testRecognitionRef.current) {
      try {
        testRecognitionRef.current.stop();
      } catch {}
      testRecognitionRef.current = null;
    }
    setIsTestingMic(false);
    setMicStatusText("Stopped.");
  };

  // ─── TTS (Voice Playback) Test Handlers ───────────────────────────────────────
  const playTtsTest = (overrideText?: string, overrideAccentRole?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    if (isPlayingTts && !overrideAccentRole && !overrideText) {
      setIsPlayingTts(false);
      setPlayingAccentId(null);
      return;
    }

    const phraseToSpeak = (overrideText || testText || "Hello, this is a voice test.").trim();
    const cleaned = cleanTextForSpeech(phraseToSpeak);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = playbackRate;
    utterance.pitch = pitch;

    const targetRole = overrideAccentRole || sttLang;
    const bestVoice = getBestVoice(browserVoices, ttsVoice, cleaned, targetRole);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      setIsPlayingTts(true);
      if (overrideAccentRole) {
        setPlayingAccentId(overrideAccentRole);
      }
    };

    utterance.onend = () => {
      setIsPlayingTts(false);
      setPlayingAccentId(null);
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.warn("TTS test error:", e);
      }
      setIsPlayingTts(false);
      setPlayingAccentId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopTtsTest = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingTts(false);
    setPlayingAccentId(null);
  };

  const visibleSttLangs =
    sttFilter === "popular" ? SPEECH_LANGUAGES.filter((l) => l.popular) : SPEECH_LANGUAGES;

  const visibleTtsLangs =
    ttsFilter === "popular" ? SPEECH_LANGUAGES.filter((l) => l.popular) : SPEECH_LANGUAGES;

  return (
    <div className="space-y-8 max-w-3xl pb-8 animate-in fade-in duration-200">
      {/* ─── Top Header & System Capability Indicators ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-red-600/30 to-purple-600/30 border border-red-500/30 text-rose-300">
              <AudioWaveform className="w-5 h-5" />
            </span>
            Speech & Audio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure live microphone recognition accents, AI speech synthesis voices, and test audio in real-time.
          </p>
        </div>

        {/* Chrome Capability Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
              speechSupport.recognition
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>STT: {speechSupport.recognition ? "Supported" : "Unavailable"}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
              speechSupport.synthesis
                ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>TTS: {speechSupport.synthesis ? `${browserVoices.length} Voices` : "Unavailable"}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 1: SPEECH TO TEXT (STT) - LIVE RECOGNITION & ACCENTS
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-rose-400">
              <Mic className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Speech to Text (STT)
              </h3>
              <p className="text-[11px] text-slate-400">
                Aapki aawaz ko live text me convert karne ke liye accent aur microphone ki settings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Mic Input:</span>
            <button
              type="button"
              onClick={toggleSttEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isSttEnabled ? "bg-red-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSttEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── STT Live Microphone Testing Playground Card ────────────────────── */}
        <div className="rounded-2xl border border-red-500/25 bg-gradient-to-br from-[#1f1315] via-[#161214] to-[#101012] p-4.5 shadow-xl shadow-red-950/20 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-semibold text-slate-200">
                Live Microphone Test Playground
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/40 border border-red-700/40 text-rose-300 font-mono">
                {currentLangOption.flag} {currentLangOption.label} ({getEffectiveSttLang(sttLang)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startMicTest()}
                className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  isTestingMic
                    ? "bg-red-600 text-white animate-pulse shadow-red-600/50 hover:bg-red-700"
                    : "bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700 hover:border-zinc-500"
                }`}
              >
                {isTestingMic ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Mic Test</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-rose-400" />
                    <span>Test Microphone Now</span>
                  </>
                )}
              </button>

              {testMicTranscript && (
                <button
                  type="button"
                  onClick={() => setTestMicTranscript("")}
                  className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 transition"
                  title="Clear transcript"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Live Wave & Transcript Output Area */}
          <div className="relative rounded-xl border border-white/10 bg-black/40 p-3 min-h-[75px] flex flex-col justify-between">
            <div className="text-xs text-slate-200 leading-relaxed font-sans">
              {testMicTranscript ? (
                <span>{testMicTranscript}</span>
              ) : (
                <span className="text-slate-500 italic">
                  {isTestingMic
                    ? "Aap bolna shuru karein... aapke alfaz yahan real-time stream honge."
                    : 'Click "Test Microphone Now" aur kuch bol kar apna mic aur accent check karein.'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isTestingMic ? "bg-red-500 animate-pulse" : "bg-zinc-600"
                  }`}
                />
                <span className={isTestingMic ? "text-rose-300 font-medium" : "text-slate-400"}>
                  {micStatusText}
                </span>
              </div>

              {isTestingMic && (
                <div className="flex items-center gap-0.5 h-3">
                  {[40, 75, 100, 60, 85, 50, 90, 65, 45].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${i * 80}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STT Accents Grid & Selection ──────────────────────────────────── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Select Active Speech-to-Text Accent / Language
            </label>
            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setSttFilter("popular")}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  sttFilter === "popular" ? "bg-zinc-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Popular
              </button>
              <button
                type="button"
                onClick={() => setSttFilter("all")}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  sttFilter === "all" ? "bg-zinc-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                All Accents ({SPEECH_LANGUAGES.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {visibleSttLangs.map((lang) => {
              const isSelected = sttLang === lang.id;
              return (
                <div
                  key={lang.id}
                  onClick={() => setSttLang(lang.id)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-gradient-to-br from-red-950/60 to-zinc-900 border-red-500/70 shadow-md shadow-red-950/40 ring-1 ring-red-500/40"
                      : "bg-[#18181b] border-white/10 hover:border-white/20 hover:bg-[#202024]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base select-none">{lang.flag}</span>
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          {lang.label}
                          {isSelected && <Check className="w-3.5 h-3.5 text-red-400 stroke-[2.5]" />}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">{lang.nativeLabel}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-400">
                      {lang.sttLang}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-slate-400 line-clamp-1 mb-2">
                    {lang.description}
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSttLang(lang.id);
                        startMicTest(lang.id);
                      }}
                      className="text-[10px] font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                    >
                      <Mic className="w-3 h-3" />
                      <span>Test Mic in {lang.label}</span>
                    </button>

                    {isSelected ? (
                      <span className="text-[10px] font-semibold text-emerald-400">Active</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-300">Select</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 2: TEXT TO SPEECH (TTS) - SPEECH SYNTHESIS VOICES & ACCENTS
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4 border-t border-white/10 pt-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Volume2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Text to Speech (TTS)
              </h3>
              <p className="text-[11px] text-slate-400">
                Assistant ke bolne ke liye voice accents, speed, pitch, aur natural sound settings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Voice Audio:</span>
            <button
              type="button"
              onClick={toggleTtsEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isTtsEnabled ? "bg-purple-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isTtsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── TTS Voice Testing Playground Card ──────────────────────────────── */}
        <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-br from-[#1b1220] via-[#141018] to-[#101012] p-4.5 shadow-xl shadow-purple-950/20 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-200">
                Interactive Voice Sound Test
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-700/40 text-purple-300">
                Speed: {playbackRate.toFixed(1)}x · Pitch: {pitch.toFixed(1)}x
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => playTtsTest()}
                className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  isPlayingTts
                    ? "bg-purple-600 text-white animate-pulse shadow-purple-600/50 hover:bg-purple-700"
                    : "bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700 hover:border-zinc-500"
                }`}
              >
                {isPlayingTts ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current text-purple-300" />
                    <span>Play Voice Sample</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Input Text Field */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
              <span>Test Phrase (type any text or use sample below):</span>
              <span className="text-[10px] text-slate-500">Live preview in real voice</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Type any sentence to test voice pronunciation..."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400/50"
              />
            </div>

            {/* Quick Sample Phrase Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-500">Quick tests:</span>
              {[
                { label: "🇵🇰 Roman Urdu", text: "Assalam-o-Alaikum! CheapChats ka voice system bohot fast hai." },
                { label: "🇵🇰 Urdu", text: "السلام علیکم! چیپ چیٹس کی اردو آواز بہت صاف ہے۔" },
                { label: "🇮🇳 Hindi", text: "नमस्ते! CheapChats का आवाज़ सिस्टम बहुत अच्छा काम कर रहा है।" },
                { label: "🇺🇸 English", text: "Hello! CheapChats voice system is responding instantaneously." },
                { label: "🇸🇦 Arabic", text: "مرحباً! نظام الصوت في CheapChats يعمل بكفاءة ممتازة." },
              ].map((pill, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTestText(pill.text);
                    playTtsTest(pill.text);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-white/5 hover:border-white/10 text-[10.5px] text-slate-300 hover:text-white transition"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Speed & Pitch Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Voice Speed (Rate)
                </span>
                <span className="font-mono text-[11px] text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-800/40">
                  {playbackRate.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.05"
                value={playbackRate}
                onChange={(e) => handleRateChange(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.5x Slow</span>
                <span>1.0x Normal</span>
                <span>1.8x Fast</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  Voice Pitch
                </span>
                <span className="font-mono text-[11px] text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-800/40">
                  {pitch.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.05"
                value={pitch}
                onChange={(e) => handlePitchChange(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.7 Deep</span>
                <span>1.0 Natural</span>
                <span>1.4 High</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Installed Voices Selector ─────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Installed Browser Voices (Chrome & System Voices)</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {browserVoices.length} voices installed
            </span>
          </label>
          <select
            value={browserVoices.some((v) => v.voiceURI === ttsVoice) ? ttsVoice : "default"}
            onChange={(e) => setTtsVoice(e.target.value)}
            disabled={!speechSupport.synthesis || browserVoices.length === 0}
            className="w-full rounded-xl border border-white/10 bg-zinc-900/90 p-2.5 text-xs text-white outline-none focus:border-purple-400/50 cursor-pointer"
          >
            <option value="default">
              🌟 Automatic Matching (Recommended: Role matched to {currentLangOption.label})
            </option>
            {browserVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} · {voice.lang} {voice.default ? " (System Default)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* ── TTS Famous Accent Cards with Instant Sound Test ───────────────── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Famous Voice Accents (Click sound icon to test instant pronunciation)
            </label>
            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setTtsFilter("popular")}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  ttsFilter === "popular" ? "bg-zinc-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Popular
              </button>
              <button
                type="button"
                onClick={() => setTtsFilter("all")}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  ttsFilter === "all" ? "bg-zinc-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                All Voices ({SPEECH_LANGUAGES.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {visibleTtsLangs.map((lang) => {
              const isSelected = sttLang === lang.id;
              const isCurrentlyPlayingThis = isPlayingTts && playingAccentId === lang.id;

              return (
                <div
                  key={lang.id}
                  onClick={() => setSttLang(lang.id)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-gradient-to-br from-purple-950/60 to-zinc-900 border-purple-500/70 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/40"
                      : "bg-[#18181b] border-white/10 hover:border-white/20 hover:bg-[#202024]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base select-none">{lang.flag}</span>
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          {lang.label}
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 stroke-[2.5]" />}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">{lang.nativeLabel}</div>
                      </div>
                    </div>

                    {/* Instant Sound Test Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSttLang(lang.id);
                        playTtsTest(lang.samplePhrase, lang.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isCurrentlyPlayingThis
                          ? "bg-purple-600 text-white border-purple-400 animate-pulse shadow-md shadow-purple-600/50"
                          : "bg-zinc-800 text-slate-300 border-zinc-700 hover:text-white hover:bg-purple-900/40 hover:border-purple-600/50"
                      }`}
                      title={`Listen to sample in ${lang.label}`}
                    >
                      {isCurrentlyPlayingThis ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-purple-300" />
                      )}
                    </button>
                  </div>

                  <p className="text-[10.5px] text-slate-400 line-clamp-1 mb-2 italic">
                    "{lang.samplePhrase}"
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                    <span className="text-[10px] font-mono text-slate-500">
                      {lang.ttsLangPrefix} voice profile
                    </span>

                    {isSelected ? (
                      <span className="text-[10px] font-semibold text-purple-400">Selected</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-300">Select</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
