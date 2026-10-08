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

/**
 * Checks if the spoken transcript contains an interruption/stop keyword.
 */
export function containsStopKeyword(transcript: string): boolean {
  if (!transcript) return false;
  const lower = transcript.toLowerCase().trim();
  return STOP_WORDS.some((word) => {
    // Check whole word or substring boundary
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
 * 2. Urdu/Hindi if text contains Urdu characters.
 * 3. High quality natural English voice (Google, Natural, Premium).
 * 4. Browser language or first available English voice.
 */
export function getBestVoice(
  voices: SpeechSynthesisVoice[],
  ttsVoiceUri?: string,
  sampleText?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  if (ttsVoiceUri && ttsVoiceUri !== "default") {
    const found = voices.find((v) => v.voiceURI === ttsVoiceUri);
    if (found) return found;
  }

  const isUrduScript = sampleText ? /[\u0600-\u06FF]/.test(sampleText) : false;
  if (isUrduScript) {
    const urVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith("ur") || v.lang.toLowerCase().startsWith("hi")
    );
    if (urVoice) return urVoice;
  }

  // Look for Google, Natural or Premium English voices first
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
