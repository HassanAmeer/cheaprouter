/**
 * Speech utilities for Speech Synthesis (TTS) and Speech Recognition (STT).
 */

export const STOP_WORDS = [
  "stop",
  "ruk jao",
  "ruk ja",
  "ruk",
  "chup",
  "chup raho",
  "chup ho jao",
  "bas",
  "bas karo",
  "pause",
  "cancel",
  "quiet",
  "hush",
  "shut up",
  "stop please",
];

export interface SpeechLanguageOption {
  id: string;
  label: string;
  nativeLabel: string;
  flag: string;
  sttLang: string;
  ttsLangPrefix: string;
  samplePhrase: string;
  description: string;
  popular?: boolean;
}

export const SPEECH_LANGUAGES: SpeechLanguageOption[] = [
  {
    id: "auto",
    label: "Auto-Detect",
    nativeLabel: "Auto (Default: English)",
    flag: "🌐",
    sttLang: "en-US",
    ttsLangPrefix: "en",
    samplePhrase: "Hello! CheapChats voice system is clear, fast, and responsive.",
    description: "Automatically detects speech with English as primary default",
    popular: true,
  },
  {
    id: "ur-roman",
    label: "Roman Urdu",
    nativeLabel: "اردو (Roman Script)",
    flag: "🇵🇰",
    sttLang: "ur-PK",
    ttsLangPrefix: "ur",
    samplePhrase: "Assalam-o-Alaikum! CheapChats ka voice system kaisa kaam kar raha hai?",
    description: "Urdu and Roman Urdu natural accent and speech recognition",
    popular: true,
  },
  {
    id: "ur-PK",
    label: "Urdu (Pakistan)",
    nativeLabel: "اردو (پاکستان)",
    flag: "🇵🇰",
    sttLang: "ur-PK",
    ttsLangPrefix: "ur",
    samplePhrase: "السلام علیکم! چیپ چیٹس کی آواز کیسی ہے؟",
    description: "Native Urdu speech recognition and voice synthesis",
    popular: true,
  },
  {
    id: "hi-IN",
    label: "Hindi (India)",
    nativeLabel: "हिन्दी (भारत)",
    flag: "🇮🇳",
    sttLang: "hi-IN",
    ttsLangPrefix: "hi",
    samplePhrase: "नमस्ते! CheapChats की आवाज़ कैसी लग रही है?",
    description: "Native Hindi accent and recognition",
    popular: true,
  },
  {
    id: "en-US",
    label: "English (US)",
    nativeLabel: "English (United States)",
    flag: "🇺🇸",
    sttLang: "en-US",
    ttsLangPrefix: "en",
    samplePhrase: "Hello! The quick brown fox jumps over the lazy dog.",
    description: "Standard American English voice and recognition",
    popular: true,
  },
  {
    id: "en-GB",
    label: "English (UK)",
    nativeLabel: "English (United Kingdom)",
    flag: "🇬🇧",
    sttLang: "en-GB",
    ttsLangPrefix: "en",
    samplePhrase: "Good day! The speech engine is functioning splendidly.",
    description: "British English accent and recognition",
    popular: true,
  },
  {
    id: "en-IN",
    label: "English (India)",
    nativeLabel: "English (India)",
    flag: "🇮🇳",
    sttLang: "en-IN",
    ttsLangPrefix: "en",
    samplePhrase: "Hello! CheapChats voice and speech test is running.",
    description: "Indian English accent and recognition",
    popular: true,
  },
  {
    id: "ar-SA",
    label: "Arabic (Saudi)",
    nativeLabel: "العربية (السعودية)",
    flag: "🇸🇦",
    sttLang: "ar-SA",
    ttsLangPrefix: "ar",
    samplePhrase: "مرحباً! نظام الصوت في CheapChats يعمل بكفاءة عالية.",
    description: "Standard Arabic (Saudi Arabia) voice and recognition",
    popular: true,
  },
  {
    id: "ar-AE",
    label: "Arabic (UAE)",
    nativeLabel: "العربية (الإمارات)",
    flag: "🇦🇪",
    sttLang: "ar-AE",
    ttsLangPrefix: "ar",
    samplePhrase: "مرحباً بك! تجربة الصوت والتعرف على الكلام ممتازة.",
    description: "Gulf Arabic accent and speech recognition",
  },
  {
    id: "es-ES",
    label: "Spanish (Spain)",
    nativeLabel: "Español (España)",
    flag: "🇪🇸",
    sttLang: "es-ES",
    ttsLangPrefix: "es",
    samplePhrase: "¡Hola! El sistema de voz de CheapChats funciona de maravilla.",
    description: "Castilian Spanish accent and recognition",
  },
  {
    id: "fr-FR",
    label: "French (France)",
    nativeLabel: "Français (France)",
    flag: "🇫🇷",
    sttLang: "fr-FR",
    ttsLangPrefix: "fr",
    samplePhrase: "Bonjour! Le système vocal de CheapChats fonctionne parfaitement.",
    description: "French native accent and recognition",
  },
  {
    id: "de-DE",
    label: "German (Germany)",
    nativeLabel: "Deutsch (Deutschland)",
    flag: "🇩🇪",
    sttLang: "de-DE",
    ttsLangPrefix: "de",
    samplePhrase: "Hallo! Das Sprachsystem von CheapChats funktioniert einwandfrei.",
    description: "German standard accent and recognition",
  },
  {
    id: "zh-CN",
    label: "Chinese (Mandarin)",
    nativeLabel: "中文 (普通话)",
    flag: "🇨🇳",
    sttLang: "zh-CN",
    ttsLangPrefix: "zh",
    samplePhrase: "你好！CheapChats语音识别和合成系统运行良好。",
    description: "Simplified Chinese Mandarin accent and recognition",
  },
  {
    id: "tr-TR",
    label: "Turkish (Turkey)",
    nativeLabel: "Türkçe (Türkiye)",
    flag: "🇹🇷",
    sttLang: "tr-TR",
    ttsLangPrefix: "tr",
    samplePhrase: "Merhaba! CheapChats ses sistemi harika bir şekilde çalışıyor.",
    description: "Turkish native accent and speech recognition",
  },
  {
    id: "ja-JP",
    label: "Japanese",
    nativeLabel: "日本語",
    flag: "🇯🇵",
    sttLang: "ja-JP",
    ttsLangPrefix: "ja",
    samplePhrase: "こんにちは！CheapChatsの音声システムは正常に動作しています。",
    description: "Japanese native accent and recognition",
  },
];

/**
 * Returns the effective BCP-47 language tag for Chrome SpeechRecognition.
 */
export function getEffectiveSttLang(sttLangId?: string): string {
  if (!sttLangId || sttLangId === "auto") {
    return "en-US";
  }
  const found = SPEECH_LANGUAGES.find((l) => l.id === sttLangId);
  if (found) {
    return found.sttLang;
  }
  return sttLangId || "en-US";
}

/**
 * Checks if the spoken transcript contains an interruption/stop keyword.
 */
export function containsStopKeyword(transcript: string): boolean {
  if (!transcript) return false;
  const lower = transcript.toLowerCase().trim();
  return STOP_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lower) || lower.includes(word);
  });
}

/**
 * Cleans markdown, formatting tags, code snippets, URLs, emojis, and artifacts
 * so the browser TTS sounds natural, conversational, and human-like.
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/<cheapchatAgent[^>]*\/?>(?:<\/cheapchatAgent>)?/gi, "")
    .replace(/<cheapchatArtifact[\s\S]*?<\/cheapchatArtifact>/gi, "")
    .replace(/```[\s\S]*?```/gi, " [code block omitted] ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/https?:\/\/[^\s)]+/gi, "")
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/[#*_~>[\]()📱📧🐙🎵🔗👉🟢✅💡🗣️🔍✓\\]/g, "")
    .replace(/---+/g, "")
    .replace(/[\n\r]+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Picks the best voice available in the browser.
 * Priority:
 * 1. User configured voiceURI from settings.
 * 2. Language role / accent selected by user.
 * 3. Script-based auto-detection.
 * 4. High quality natural English voice.
 */
export function getBestVoice(
  voices: SpeechSynthesisVoice[],
  ttsVoiceUri?: string,
  sampleText?: string,
  languageRole?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Explicit user selected specific voice
  if (ttsVoiceUri && ttsVoiceUri !== "default") {
    const found = voices.find((v) => v.voiceURI === ttsVoiceUri);
    if (found) return found;
  }

  // 2. Language role / accent matching
  if (languageRole === "ur-roman" || languageRole === "ur-PK" || languageRole === "ur") {
    const urVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ur"));
    if (urVoice) return urVoice;
    const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (hiVoice) return hiVoice;
  } else if (languageRole === "hi-IN" || languageRole === "hi") {
    const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (hiVoice) return hiVoice;
  } else if (languageRole === "ar-SA" || languageRole === "ar-AE" || languageRole === "ar") {
    const arVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ar"));
    if (arVoice) return arVoice;
  } else if (languageRole === "es-ES" || languageRole === "es") {
    const esVoice = voices.find((v) => v.lang.toLowerCase().startsWith("es"));
    if (esVoice) return esVoice;
  } else if (languageRole === "fr-FR" || languageRole === "fr") {
    const frVoice = voices.find((v) => v.lang.toLowerCase().startsWith("fr"));
    if (frVoice) return frVoice;
  } else if (languageRole === "de-DE" || languageRole === "de") {
    const deVoice = voices.find((v) => v.lang.toLowerCase().startsWith("de"));
    if (deVoice) return deVoice;
  } else if (languageRole === "zh-CN" || languageRole === "zh") {
    const zhVoice = voices.find((v) => v.lang.toLowerCase().startsWith("zh"));
    if (zhVoice) return zhVoice;
  } else if (languageRole === "tr-TR" || languageRole === "tr") {
    const trVoice = voices.find((v) => v.lang.toLowerCase().startsWith("tr"));
    if (trVoice) return trVoice;
  } else if (languageRole === "ja-JP" || languageRole === "ja") {
    const jaVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ja"));
    if (jaVoice) return jaVoice;
  } else if (languageRole === "en-GB") {
    const gbVoice = voices.find((v) => v.lang.toLowerCase() === "en-gb" || v.lang.toLowerCase() === "en_gb");
    if (gbVoice) return gbVoice;
  } else if (languageRole === "en-IN") {
    const inVoice = voices.find((v) => v.lang.toLowerCase() === "en-in" || v.lang.toLowerCase() === "en_in");
    if (inVoice) return inVoice;
  } else if (languageRole === "en-US") {
    const enVoice = voices.find(
      (v) =>
        (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium") || v.name.includes("Online")) &&
        v.lang.toLowerCase().startsWith("en")
    );
    if (enVoice) return enVoice;
    const exactEn = voices.find((v) => v.lang.toLowerCase() === "en-us" || v.lang.toLowerCase() === "en_us");
    if (exactEn) return exactEn;
  }

  // 3. Script-based content auto-detection
  const isUrduScript = sampleText ? /[\u0600-\u06FF]/.test(sampleText) : false;
  if (isUrduScript) {
    const urVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith("ur") || v.lang.toLowerCase().startsWith("ar") || v.lang.toLowerCase().startsWith("hi")
    );
    if (urVoice) return urVoice;
  }

  const isHindiScript = sampleText ? /[\u0900-\u097F]/.test(sampleText) : false;
  if (isHindiScript) {
    const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (hiVoice) return hiVoice;
  }

  // 4. Default: High quality natural English voice (Auto-Detect defaults to English)
  const naturalEn = voices.find(
    (v) =>
      (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium") || v.name.includes("Neural")) &&
      v.lang.toLowerCase().startsWith("en")
  );
  if (naturalEn) return naturalEn;

  const browserLang = typeof navigator !== "undefined" ? navigator.language : "en-US";
  const exactLang = voices.find((v) => v.lang === browserLang);
  if (exactLang) return exactLang;

  const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  if (anyEn) return anyEn;

  return voices[0] || null;
}
