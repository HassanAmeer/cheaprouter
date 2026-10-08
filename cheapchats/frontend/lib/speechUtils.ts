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
  sttLang: string;
  ttsLangPrefix: string;
  description: string;
}

export const SPEECH_LANGUAGES: SpeechLanguageOption[] = [
  {
    id: "auto",
    label: "Auto-Detect (Default: English)",
    sttLang: "en-US",
    ttsLangPrefix: "en",
    description: "Automatically detects speech with English as primary default",
  },
  {
    id: "ur-roman",
    label: "Urdu / Roman Urdu",
    sttLang: "ur-PK",
    ttsLangPrefix: "ur",
    description: "Urdu and Roman Urdu natural accent and speech recognition",
  },
  {
    id: "hi-IN",
    label: "Hindi (हिन्दी)",
    sttLang: "hi-IN",
    ttsLangPrefix: "hi",
    description: "Hindi native accent and recognition",
  },
  {
    id: "en-US",
    label: "English (United States)",
    sttLang: "en-US",
    ttsLangPrefix: "en",
    description: "Standard American English voice and recognition",
  },
  {
    id: "en-GB",
    label: "English (United Kingdom)",
    sttLang: "en-GB",
    ttsLangPrefix: "en",
    description: "British English accent and recognition",
  },
  {
    id: "ar-SA",
    label: "Arabic (العربية)",
    sttLang: "ar-SA",
    ttsLangPrefix: "ar",
    description: "Standard Arabic voice and recognition",
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
 * 2. Language role / accent selected by user (Urdu/Roman Urdu, Hindi, English, Arabic, Auto).
 * 3. Script-based auto-detection (Urdu/Arabic characters, Hindi characters).
 * 4. High quality natural English voice (Default).
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
    // Pick Urdu voice first, or Hindi voice (which provides natural Hindustani/Roman Urdu phonetics)
    const urVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ur"));
    if (urVoice) return urVoice;
    const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (hiVoice) return hiVoice;
  } else if (languageRole === "hi-IN" || languageRole === "hi") {
    const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (hiVoice) return hiVoice;
  } else if (languageRole === "ar-SA" || languageRole === "ar") {
    const arVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ar"));
    if (arVoice) return arVoice;
  } else if (languageRole === "en-US" || languageRole === "en-GB") {
    const enVoice = voices.find(
      (v) =>
        (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium") || v.name.includes("Online")) &&
        v.lang.toLowerCase().startsWith("en")
    );
    if (enVoice) return enVoice;
    const exactEn = voices.find((v) => v.lang.toLowerCase() === languageRole.toLowerCase());
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
