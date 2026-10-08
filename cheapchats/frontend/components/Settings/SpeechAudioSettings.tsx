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
  RotateCcw,
  Star,
  Settings2,
} from "lucide-react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  SPEECH_LANGUAGES,
  SpeechLanguageOption,
  VOICE_PERSONAS,
  VoicePersona,
  AZURE_VOICE_PERSONAS,
  AzureVoicePersona,
  getEffectiveSttLang,
  getBestVoice,
  cleanTextForSpeech,
  transliterateToRomanUrdu,
  getEffectiveTtsSettings,
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
    ttsRate,
    setTtsRate,
    ttsPitch,
    setTtsPitch,
    ttsEngine,
    setTtsEngine,
  } = useAppStore();

  // Active Tab: "mic" (Speech to Text) or "speech" (Text to Speech)
  const [activeTab, setActiveTab] = useState<"mic" | "speech">("mic");

  // Browser Speech APIs Support
  const [speechSupport, setSpeechSupport] = useState({
    recognition: false,
    synthesis: false,
  });
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Local state initialized from store / localStorage
  const [playbackRate, setPlaybackRate] = useState<number>(() => ttsRate || 1.0);
  const [pitch, setPitch] = useState<number>(() => ttsPitch || 1.0);

  useEffect(() => {
    if (ttsRate) setPlaybackRate(ttsRate);
  }, [ttsRate]);

  useEffect(() => {
    if (ttsPitch) setPitch(ttsPitch);
  }, [ttsPitch]);

  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    setTtsRate(newRate);
  };

  const handlePitchChange = (newPitch: number) => {
    setPitch(newPitch);
    setTtsPitch(newPitch);
  };

  // STT Testing State
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [testMicTranscript, setTestMicTranscript] = useState("");
  const [micStatusText, setMicStatusText] = useState("Ready to test");
  const testRecognitionRef = useRef<any>(null);

  // Filters for Accent Cards
  const [sttFilter, setSttFilter] = useState<"all" | "pakistan" | "india" | "global">("all");
  const [speechFilter, setSpeechFilter] = useState<"all" | "famous" | "pakistan" | "india">("all");

  // TTS Testing State
  const currentLangOption = SPEECH_LANGUAGES.find((l) => l.id === sttLang) || SPEECH_LANGUAGES[0];
  const [testText, setTestText] = useState(currentLangOption.samplePhrase);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [playingPersonaId, setPlayingPersonaId] = useState<string | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

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
      const activeLangId = overrideLang || sttLang;
      const effectiveLang = getEffectiveSttLang(activeLangId);
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
        let formatted = full;
        // Transliterate to Roman Urdu (English alphabet) if Roman Urdu is active
        if (activeLangId === "ur-roman") {
          formatted = transliterateToRomanUrdu(formatted);
        }
        setTestMicTranscript(formatted);
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

  const fallbackToBrowserSpeech = (
    textToSpeak: string,
    persona: VoicePersona | null,
    targetVoiceKey: string
  ) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsPlayingTts(false);
      setPlayingPersonaId(null);
      return;
    }

    let cleaned = textToSpeak;
    const targetRole = persona ? persona.langCodes[0] : sttLang;
    const bestVoice = getBestVoice(browserVoices, targetVoiceKey, cleaned, targetRole);

    if (/[\u0600-\u06FF]/.test(cleaned)) {
      const isNativeUrduOrArabic =
        bestVoice &&
        (bestVoice.lang.toLowerCase().startsWith("ur") || bestVoice.lang.toLowerCase().startsWith("ar"));
      if (!isNativeUrduOrArabic) {
        cleaned = transliterateToRomanUrdu(cleaned);
      }
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);

    if (persona) {
      utterance.rate = persona.rate;
      utterance.pitch = persona.pitch;
    } else {
      utterance.rate = playbackRate;
      utterance.pitch = pitch;
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
      if (bestVoice.lang) {
        utterance.lang = bestVoice.lang;
      }
    }

    utterance.onstart = () => {
      setIsPlayingTts(true);
      if (persona) {
        setPlayingPersonaId(persona.id);
      }
    };

    utterance.onend = () => {
      setIsPlayingTts(false);
      setPlayingPersonaId(null);
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.warn("TTS test error:", e);
      }
      setIsPlayingTts(false);
      setPlayingPersonaId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // ─── TTS (Voice Playback) Test Handlers ───────────────────────────────────────
  const playTtsTest = async (overrideText?: string, personaId?: string) => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
      } catch {}
      activeAudioRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (isPlayingTts && !overrideText && (!personaId || playingPersonaId === personaId)) {
      setIsPlayingTts(false);
      setPlayingPersonaId(null);
      return;
    }

    const persona = personaId
      ? (VOICE_PERSONAS.find((p) => p.id === personaId) as any) ||
        AZURE_VOICE_PERSONAS.find((p) => p.id === personaId) ||
        null
      : null;

    const phraseToSpeak = (
      overrideText ||
      (persona ? persona.samplePhrase : testText) ||
      "Hello, this is a voice test."
    ).trim();

    const cleaned = cleanTextForSpeech(phraseToSpeak);
    if (!cleaned) return;

    const targetVoiceKey = persona
      ? (persona.id.startsWith("azure:") ? persona.id : `persona:${persona.id}`)
      : ttsVoice;

    setIsPlayingTts(true);
    if (personaId) {
      setPlayingPersonaId(personaId);
    }

    const isAzureTarget =
      targetVoiceKey.startsWith("azure:") ||
      (ttsEngine === "azure" && !targetVoiceKey.startsWith("persona:"));

    // 1. Play Ultra-Realistic Free Edge Neural AI Voice
    if (isAzureTarget) {
      try {
        const resp = await fetch("/api/cheapchats/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleaned,
            voice: targetVoiceKey,
          }),
        });

        if (resp.ok) {
          const blob = await resp.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          activeAudioRef.current = audio;

          audio.onended = () => {
            setIsPlayingTts(false);
            setPlayingPersonaId(null);
            activeAudioRef.current = null;
          };

          audio.onerror = () => {
            activeAudioRef.current = null;
            fallbackToBrowserSpeech(cleaned, persona, targetVoiceKey);
          };

          await audio.play();
          return;
        }
      } catch {
        // Fallback on network failure
      }
    }

    fallbackToBrowserSpeech(cleaned, persona, targetVoiceKey);
  };

  const handleSelectAzurePersona = (azureP: AzureVoicePersona) => {
    setTtsEngine("azure");
    setTtsVoice(azureP.id);

    // Auto-align STT language when an Azure persona is picked
    if (azureP.flag === "🇵🇰") {
      setSttLang("ur-roman");
    } else if (azureP.flag === "🇮🇳") {
      setSttLang("hi-IN");
    } else if (azureP.azureVoice.startsWith("en-US")) {
      setSttLang("en-US");
    } else if (azureP.azureVoice.startsWith("en-GB")) {
      setSttLang("en-GB");
    } else if (azureP.azureVoice.startsWith("ar-")) {
      setSttLang("ar-SA");
    }
  };

  const handleSelectPersona = (persona: VoicePersona) => {
    setTtsEngine("browser");
    setTtsVoice(`persona:${persona.id}`);
    handleRateChange(persona.rate);
    handlePitchChange(persona.pitch);

    // Auto-align STT language when a persona is picked
    if (
      persona.flag === "🇵🇰" ||
      persona.id === "zoya" ||
      persona.id === "bilal" ||
      persona.id === "pari" ||
      persona.id === "sameer" ||
      persona.id === "ayesha" ||
      persona.id === "asad" ||
      persona.id === "gul"
    ) {
      setSttLang("ur-roman");
    } else if (persona.id === "swara" || persona.id === "madhur") {
      setSttLang("hi-IN");
    } else if (persona.id === "neerja" || persona.id === "rohan") {
      setSttLang("en-IN");
    } else if (persona.id === "jenny" || persona.id === "guy") {
      setSttLang("en-US");
    } else if (persona.id === "sonia") {
      setSttLang("en-GB");
    } else if (persona.id === "fatima" || persona.id === "hamdan") {
      setSttLang("ar-SA");
    }
  };

  // Filtered STT Accents
  const filteredSttLangs = SPEECH_LANGUAGES.filter((lang) => {
    if (sttFilter === "all") return true;
    if (sttFilter === "pakistan") return lang.id === "ur-roman" || lang.id === "ur-PK";
    if (sttFilter === "india") return lang.id === "hi-IN" || lang.id === "en-IN";
    if (sttFilter === "global") return lang.id !== "ur-roman" && lang.id !== "ur-PK" && lang.id !== "hi-IN" && lang.id !== "en-IN";
    return true;
  });

  // Filtered Speech Personas (Built-in)
  const filteredPersonas = VOICE_PERSONAS.filter((p) => {
    if (speechFilter === "all") return true;
    if (speechFilter === "famous") return p.id === "jenny" || p.id === "guy" || p.id === "sonia" || p.id === "hamdan" || p.id === "fatima";
    if (speechFilter === "pakistan") return p.flag === "🇵🇰";
    if (speechFilter === "india") return p.flag === "🇮🇳";
    return true;
  });

  // Filtered Azure Personas (By API)
  const filteredAzurePersonas = AZURE_VOICE_PERSONAS.filter((p) => {
    if (speechFilter === "all") return true;
    if (speechFilter === "famous") return p.flag !== "🇵🇰" && p.flag !== "🇮🇳";
    if (speechFilter === "pakistan") return p.flag === "🇵🇰";
    if (speechFilter === "india") return p.flag === "🇮🇳";
    return true;
  });

  const activePersona =
    (VOICE_PERSONAS.find((p) => `persona:${p.id}` === ttsVoice) as any) ||
    AZURE_VOICE_PERSONAS.find((p) => p.id === ttsVoice) ||
    null;

  return (
    <div className="space-y-6 max-w-3xl pb-8 animate-in fade-in duration-200">
      {/* ─── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-red-600/30 to-purple-600/30 border border-red-500/30 text-rose-300">
              <AudioWaveform className="w-5 h-5" />
            </span>
            Speech & Audio Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure live microphone recognition accents and AI speech synthesis personas.
          </p>
        </div>

        {/* Chrome Capability Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
              speechSupport.recognition
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{speechSupport.recognition ? "Mic STT Ready" : "Mic Limited"}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
              speechSupport.synthesis
                ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{speechSupport.synthesis ? `${browserVoices.length} Voices Ready` : "TTS Unavailable"}</span>
          </div>
        </div>
      </div>

      {/* ─── 2 MAIN TABS: "Mic" and "Speech" ───────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("mic")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "mic"
              ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/30 font-bold"
              : "text-slate-400 hover:text-white hover:bg-zinc-800/60"
          }`}
        >
          <Mic className={`w-4 h-4 ${activeTab === "mic" ? "text-white" : "text-rose-400"}`} />
          <span>Mic (Speech to Text)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 border border-white/10 hidden sm:inline-block">
            {currentLangOption.flag} {currentLangOption.label}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("speech")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "speech"
              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30 font-bold"
              : "text-slate-400 hover:text-white hover:bg-zinc-800/60"
          }`}
        >
          <Volume2 className={`w-4 h-4 ${activeTab === "speech" ? "text-white" : "text-purple-400"}`} />
          <span>Speech (Text to Speech)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 border border-white/10 hidden sm:inline-block">
            {activePersona ? `${activePersona.flag} ${activePersona.name}` : "Auto Voice"}
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 1: MIC (SPEECH TO TEXT)
      ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "mic" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* ── Top Customization & Mic Toggle ───────────────────────────────── */}
          <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-[#1a1215] via-[#141013] to-[#101012] p-4.5 shadow-xl shadow-rose-950/20 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-400" />
                  Microphone Recognition Customization
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Microphone on/off karein aur live speech-to-text test karein.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Mic Enabled:</span>
                <button
                  type="button"
                  onClick={toggleSttEnabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    isSttEnabled ? "bg-rose-600" : "bg-zinc-700"
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

            {/* Live Microphone Test Playground */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {isTestingMic && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isTestingMic ? "bg-rose-500" : "bg-slate-600"
                      }`}
                    />
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    Live Microphone Test Area
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/40 text-rose-300">
                    Selected: {currentLangOption.flag} {currentLangOption.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {testMicTranscript && (
                    <button
                      type="button"
                      onClick={() => setTestMicTranscript("")}
                      className="px-2 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-700 border border-white/5 transition flex items-center gap-1 cursor-pointer"
                      title="Clear transcript"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => (isTestingMic ? stopMicTest() : startMicTest())}
                    className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                      isTestingMic
                        ? "bg-rose-600 text-white animate-pulse shadow-rose-600/50 hover:bg-rose-700"
                        : "bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    {isTestingMic ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-rose-400" />
                        <span>Start Mic Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Real-time Waveform Box */}
              <div className="bg-black/50 border border-white/5 rounded-xl p-3 flex flex-col gap-2 min-h-[90px] justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {micStatusText}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    Active BCP-47: {getEffectiveSttLang(sttLang)}
                  </span>
                </div>

                <div className="text-xs font-sans text-slate-100 min-h-[30px] flex items-center">
                  {testMicTranscript ? (
                    <span className="text-rose-200 bg-rose-950/30 px-2.5 py-1.5 rounded-lg border border-rose-800/30 w-full block">
                      "{testMicTranscript}"
                    </span>
                  ) : (
                    <span className="text-slate-500 italic text-[11.5px]">
                      {isTestingMic
                        ? `Listening... Bolna shuru karein (e.g., "${currentLangOption.samplePhrase}")`
                        : `Click 'Start Mic Test' aur bol kar check karein. Roman Urdu mein English letters mein likha aayega!`}
                    </span>
                  )}
                </div>

                {/* Equalizer bars */}
                <div className="flex items-center gap-1 h-3 pt-1">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-150 ${
                        isTestingMic
                          ? "bg-gradient-to-t from-rose-600 to-amber-400 animate-pulse"
                          : "bg-zinc-800"
                      }`}
                      style={{
                        height: isTestingMic ? `${Math.max(20, ((i * 17) % 100))}%` : "20%",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom: Unified STT Accent Cards Grid (One Place!) ───────────── */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-rose-400" />
                  Select Mic Recognition Accent (Ek Sath Grid)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Jo bhi accent select karenge wo foran save ho jayega.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSttFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    sttFilter === "all" ? "bg-rose-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({SPEECH_LANGUAGES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSttFilter("pakistan")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    sttFilter === "pakistan" ? "bg-rose-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🇵🇰 Pakistan
                </button>
                <button
                  type="button"
                  onClick={() => setSttFilter("india")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    sttFilter === "india" ? "bg-rose-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🇮🇳 India
                </button>
                <button
                  type="button"
                  onClick={() => setSttFilter("global")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    sttFilter === "global" ? "bg-rose-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🌐 Global
                </button>
              </div>
            </div>

            {/* The Unified Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredSttLangs.map((lang) => {
                const isSelected = sttLang === lang.id;
                return (
                  <div
                    key={lang.id}
                    onClick={() => setSttLang(lang.id)}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-br from-rose-950/70 via-zinc-900 to-zinc-950 border-rose-500 shadow-md shadow-rose-950/40 ring-1 ring-rose-500/50"
                        : "bg-[#18181b] border-white/10 hover:border-rose-500/40 hover:bg-[#202026]"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl select-none">{lang.flag}</span>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              {lang.label}
                              {isSelected && <Check className="w-3.5 h-3.5 text-rose-400 stroke-[3]" />}
                            </div>
                            <div className="text-[10px] text-slate-400">{lang.nativeLabel}</div>
                          </div>
                        </div>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-slate-400">
                          {lang.sttLang}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                        {lang.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSttLang(lang.id);
                          startMicTest(lang.id);
                        }}
                        className="text-[10.5px] font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                      >
                        <Mic className="w-3 h-3" />
                        <span>Test Mic</span>
                      </button>

                      {isSelected ? (
                        <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Saved & Active
                        </span>
                      ) : (
                        <span className="text-[10.5px] text-slate-500 group-hover:text-slate-300 font-medium">
                          Click to Select →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 2: SPEECH (TEXT TO SPEECH)
      ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "speech" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* ── Top Customization & Voice Audio Settings ─────────────────────── */}
          <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-br from-[#1b1220] via-[#141018] to-[#101012] p-4.5 shadow-xl shadow-purple-950/20 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  Voice Audio & Pronunciation Customization
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Voice playback on/off karein, speed aur pitch sliders customize karein (Chat Assistant par automatically apply hoga).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Voice Audio:</span>
                <button
                  type="button"
                  onClick={toggleTtsEnabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
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

            {/* Test Phrase Input & Quick Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Custom Voice Sound Test
                </span>
                <span className="text-[10px] text-slate-500">Live preview with selected persona</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Type any sentence to test voice pronunciation..."
                  className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400/50"
                />

                <button
                  type="button"
                  onClick={() => playTtsTest()}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer whitespace-nowrap ${
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
                      <span>Play Sample</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Sample Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-500">Quick tests:</span>
                {[
                  { label: "🇵🇰 Bilal (Bhari Aawaz)", text: "Assalam-o-Alaikum! Main Bilal hoon. Boliye beta aaj main aap ki kya madad kar sakta hoon?" },
                  { label: "🇵🇰 Aryan (Young Boy)", text: "Assalam-o-Alaikum! Main Aryan hoon. Aaj kya naya banana hai?" },
                  { label: "🇵🇰 Pari (Child Kid)", text: "Hello! Mera naam Pari hai, mujh se koi bhi baat karein!" },
                  { label: "🇵🇰 Zoya (Human Female)", text: "Assalam-o-Alaikum! Main Zoya hoon, CheapChats par aap ki madad ke liye hazir hoon." },
                  { label: "🇺🇸 Jenny (English US)", text: "Hello! CheapChats voice system is responding instantaneously and clearly." },
                  { label: "🇦🇪 Hamdan (Arabic)", text: "أهلاً وسهلاً! أنا حمدان، جاهز لمساعدتك في أي استفسار." },
                ].map((pill, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setTestText(pill.text);
                      playTtsTest(pill.text);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-white/5 hover:border-white/10 text-[10px] text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed & Pitch Sliders - Saves Automatically & Applies to Chat! */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    Voice Speed (Rate)
                  </span>
                  <span className="font-mono text-[11px] text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-800/40">
                    {playbackRate.toFixed(2)}x
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
                    Voice Pitch (Bhari Aawaz / High Pitch)
                  </span>
                  <span className="font-mono text-[11px] text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-800/40">
                    {pitch.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.65"
                  max="1.45"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => handlePitchChange(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.70 Bhari / Deep Male</span>
                  <span>1.00 Natural</span>
                  <span>1.40 Child / High</span>
                </div>
              </div>
            </div>

            {/* Direct Browser Voice Override Selector */}
            <div className="pt-2 border-t border-white/5">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between mb-1.5">
                <span>System Voice Engine (Advanced):</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {ttsEngine === "azure"
                    ? "⚡ Microsoft Azure Edge Neural (Active)"
                    : `${browserVoices.length} browser voices detected`}
                </span>
              </label>
              <select
                value={
                  ttsVoice.startsWith("azure:")
                    ? ttsVoice
                    : browserVoices.some((v) => v.voiceURI === ttsVoice)
                    ? ttsVoice
                    : activePersona
                    ? (activePersona.id.startsWith("azure:") ? activePersona.id : `persona:${activePersona.id}`)
                    : "default"
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith("azure:")) {
                    setTtsEngine("azure");
                    setTtsVoice(val);
                  } else {
                    setTtsEngine("browser");
                    setTtsVoice(val);
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-zinc-900/90 p-2 text-xs text-white outline-none focus:border-purple-400/50 cursor-pointer"
              >
                <option value="default">
                  🌟 Automatic Persona Voice (Recommended)
                </option>
                {activePersona && (
                  <option
                    value={activePersona.id.startsWith("azure:") ? activePersona.id : `persona:${activePersona.id}`}
                  >
                    ✨ Active Persona: {activePersona.name} ({activePersona.accentTitle})
                  </option>
                )}
                {browserVoices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} · {voice.lang} {voice.default ? " (System Default)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Bottom: Unified Voice Accent Cards Grid (One Place!) ─────────── */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
                  Voice Accent Cards ({ttsEngine === "azure" ? "⚡ By API - Azure Neural HD" : "🌐 Built-in Browser Accents"})
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {ttsEngine === "azure"
                    ? "Microsoft Azure Neural AI voices (100% Free & No API Key). Human-like expressions & natural tone. Card click karne se foran save ho jayega."
                    : "Browser ke built-in local accents. Fast & offline speech synthesis. Card click karne se foran save ho jayega."}
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSpeechFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    speechFilter === "all" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({ttsEngine === "azure" ? AZURE_VOICE_PERSONAS.length : VOICE_PERSONAS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechFilter("famous")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    speechFilter === "famous" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🌐 Famous Global
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechFilter("pakistan")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    speechFilter === "pakistan" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🇵🇰 Pakistan
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechFilter("india")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    speechFilter === "india" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🇮🇳 India
                </button>
              </div>
            </div>

            {/* ── Sub-tabs: [⚡ By API (Azure Neural HD)] vs [🌐 Built-in Accents (Browser)] ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-black/60 border border-purple-500/20 rounded-2xl shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setTtsEngine("azure");
                  if (!ttsVoice.startsWith("azure:")) {
                    setTtsVoice("azure:ur-PK-AsadNeural");
                  }
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  ttsEngine === "azure"
                    ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/50"
                    : "text-slate-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ By API (Azure Neural HD - Free)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline-block">
                  100% Human Sound
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTtsEngine("browser");
                  if (ttsVoice.startsWith("azure:")) {
                    setTtsVoice("persona:asad");
                  }
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  ttsEngine === "browser"
                    ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/50"
                    : "text-slate-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <Globe2 className="w-4 h-4 text-purple-300" />
                <span>🌐 Built-in Accents (Browser)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-700 text-slate-300 border border-white/10 hidden sm:inline-block">
                  Offline Local
                </span>
              </button>
            </div>

            {/* If By API selected: Render Azure Neural Accent Cards */}
            {ttsEngine === "azure" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredAzurePersonas.map((azureP) => {
                  const isSelected = ttsVoice === azureP.id;
                  const isPlayingThis = isPlayingTts && playingPersonaId === azureP.id;

                  return (
                    <div
                      key={azureP.id}
                      onClick={() => handleSelectAzurePersona(azureP)}
                      className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-gradient-to-br from-purple-950/70 via-indigo-950/40 to-zinc-950 border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50"
                          : "bg-[#18181b] border-white/10 hover:border-purple-500/40 hover:bg-[#202026]"
                      }`}
                    >
                      <div>
                        {/* Header: Flag Avatar, Name, Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-sm shadow-md flex-shrink-0">
                              {azureP.flag}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{azureP.name}</span>
                                {isSelected && (
                                  <span className="p-0.5 rounded-full bg-purple-500/20 text-purple-400">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-purple-300 font-medium">
                                {azureP.accentTitle}
                              </div>
                            </div>
                          </div>

                          <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300">
                            {azureP.badge}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                          {azureP.description}
                        </p>

                        {/* Sample Phrase Quote */}
                        <div className="text-[10.5px] text-purple-200/90 italic bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 mb-2.5 line-clamp-2">
                          "{azureP.samplePhrase}"
                        </div>

                        {/* Tags */}
                        <div className="flex items-center gap-1 flex-wrap mb-3">
                          {azureP.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[9.5px] px-1.5 py-0.5 rounded bg-zinc-800/80 border border-white/5 text-slate-400 font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playTtsTest(azureP.samplePhrase, azureP.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                            isPlayingThis
                              ? "bg-purple-600 text-white animate-pulse"
                              : "bg-zinc-800 hover:bg-zinc-700 text-purple-300 hover:text-purple-200 border border-purple-500/20"
                          }`}
                        >
                          {isPlayingThis ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Preview Azure Voice</span>
                            </>
                          )}
                        </button>

                        {isSelected ? (
                          <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Saved & Active
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 group-hover:text-white transition font-medium">
                            Click to Select →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* If Built-in selected: Render Browser Personas Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPersonas.map((persona) => {
                  const isPersonaSelected = ttsVoice === `persona:${persona.id}`;
                  const isPlayingThisPersona = isPlayingTts && playingPersonaId === persona.id;

                  return (
                    <div
                      key={persona.id}
                      onClick={() => handleSelectPersona(persona)}
                      className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isPersonaSelected
                          ? "bg-gradient-to-br from-purple-950/70 via-zinc-900 to-zinc-950 border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50"
                          : "bg-[#18181b] border-white/10 hover:border-purple-500/40 hover:bg-[#202026]"
                      }`}
                    >
                      <div>
                        {/* Header: Avatar, Name, Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-sm shadow-md flex-shrink-0">
                              {persona.flag}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{persona.name}</span>
                                {isPersonaSelected && (
                                  <span className="p-0.5 rounded-full bg-purple-500/20 text-purple-400">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-purple-300 font-medium">
                                {persona.accentTitle}
                              </div>
                            </div>
                          </div>

                          <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10 text-slate-300">
                            {persona.badge}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                          {persona.description}
                        </p>

                        {/* Sample Phrase Quote */}
                        <div className="text-[10.5px] text-purple-200/90 italic bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 mb-2.5 line-clamp-2">
                          "{persona.samplePhrase}"
                        </div>

                        {/* Tags */}
                        <div className="flex items-center gap-1 flex-wrap mb-3">
                          {persona.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[9.5px] px-1.5 py-0.5 rounded bg-zinc-800/80 border border-white/5 text-slate-400 font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playTtsTest(persona.samplePhrase, persona.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                            isPlayingThisPersona
                              ? "bg-purple-600 text-white animate-pulse"
                              : "bg-zinc-800 hover:bg-zinc-700 text-purple-300 hover:text-purple-200 border border-purple-500/20"
                          }`}
                        >
                          {isPlayingThisPersona ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Preview</span>
                            </>
                          )}
                        </button>

                        {isPersonaSelected ? (
                          <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Saved & Active
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 group-hover:text-white transition font-medium">
                            Click to Select →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
