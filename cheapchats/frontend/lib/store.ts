import { create } from "zustand";

export type SidebarView = "chats" | "favourites" | "agents" | "prompts" | "skills" | "mcp" | "files" | "memory";

export interface User {
  id: string;
  username: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BANNED";
  avatar?: string;
}

export interface ArtifactFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

export interface Artifact {
  title: string;
  type: "code" | "html" | "svg" | "markdown" | "mermaid";
  language?: string;
  content: string;
  files?: ArtifactFile[];
}

export type SpeechEngine = "azure" | "browser";

/** Azure voice keys are always prefixed, browser personas always use "persona:". */
export function toAzureVoiceKey(voice: string): string {
  // Persona ids may carry a "|roman" marker (Roman Urdu accent mode). The marker
  // is part of the selection, so it must survive saving and page reloads.
  const raw = (voice || "").trim();
  if (!raw) return "azure:ur-PK-AsadNeural";
  const [base, ...rest] = raw.split("|");
  const marker = rest.length ? `|${rest.join("|")}` : "";
  return `${base.startsWith("azure:") ? base : `azure:${base}`}${marker}`;
}

/** The real Azure voice id to send to the TTS API (persona marker removed). */
export function azureVoiceOnly(voice: string): string {
  const v = (voice || "").split("|")[0].trim();
  if (!v) return "azure:ur-PK-AsadNeural";
  return v.startsWith("azure:") ? v : `azure:${v}`;
}

export function toBrowserVoiceKey(voice: string): string {
  const v = (voice || "").trim();
  if (!v || v === "default" || v.startsWith("azure:")) return "persona:ayesha";
  return v.startsWith("persona:") ? v : `persona:${v}`;
}

/**
 * Engine + voice must always agree, otherwise the app ends up speaking with a
 * voice the user never selected. If they disagree, the stored voice wins when it
 * clearly belongs to one engine, otherwise we fall back to the saved engine.
 */
export function resolveSpeechEngine(
  engine: string | null | undefined,
  voice: string | null | undefined
): SpeechEngine {
  const v = (voice || "").trim();
  if (v.startsWith("azure:")) return "azure";
  if (v.startsWith("persona:") && v !== "persona:default") return "browser";
  // Default source is the offline built-in one
  return engine === "azure" ? "azure" : "browser";
}

export interface SpeechProfile {
  engine: SpeechEngine;
  /** Exactly what the user selected (may include the "|roman" persona marker) */
  voice: string;
  /** Voice id to send to the TTS API (marker removed) */
  apiVoice: string;
  /** Roman-Urdu personas must be synthesized in native Urdu script */
  script: "urdu" | "latin";
  /** Auto Detect accents pick the voice per message from its language */
  auto: boolean;
  /** Gender for Auto Detect accents */
  gender: "male" | "female";
}

/**
 * The single speech profile used by Read Aloud and the voice call. Engine and
 * voice are always normalized together, so the app can never speak with a voice
 * the user did not select.
 */
export function resolveSpeechProfile(
  engine: string | null | undefined,
  voice: string | null | undefined
): SpeechProfile | null {
  const raw = (voice || "").trim();
  // Nothing saved yet -> use the offline built-in source
  if (!raw || raw === "default") {
    return {
      engine: "browser",
      voice: "persona:ayesha",
      apiVoice: "persona:ayesha",
      script: "latin",
      auto: false,
      gender: "female",
    };
  }

  // Auto Detect accents: the voice is chosen per message from its language
  const isAuto = /\|auto-(male|female)$/.test(raw);
  const autoGender: "male" | "female" = raw.endsWith("auto-male") ? "male" : "female";
  if (isAuto) {
    const engineAuto: SpeechEngine = raw.startsWith("azure:") ? "azure" : "browser";
    const persona = engineAuto === "azure" ? `azure:auto|auto-${autoGender}` : `persona:auto-${autoGender}`;
    return {
      engine: engineAuto,
      voice: persona,
      apiVoice: persona,
      script: "latin",
      auto: true,
      gender: autoGender,
    };
  }

  const resolvedEngine = resolveSpeechEngine(engine, raw);

  if (resolvedEngine === "browser") {
    const v = toBrowserVoiceKey(raw);
    // Offline Auto Detect personas
    if (v === "persona:auto-female" || v === "persona:auto-male") {
      return { engine: "browser", voice: v, apiVoice: v, script: "latin", auto: true, gender: v.endsWith("male") ? "male" : "female" };
    }
    return { engine: "browser", voice: v, apiVoice: v, script: "latin", auto: false, gender: "female" };
  }

  const v = toAzureVoiceKey(raw);
  // Roman-Urdu personas cannot be read letter-by-letter by neural voices
  const romanPersona = v.startsWith("persona:")
    ? ROMAN_URDU_AZURE_VOICE_BY_PERSONA[v.replace("persona:", "")]
    : undefined;
  const finalVoice = romanPersona ? `azure:${romanPersona}` : v;
  const apiVoice = azureVoiceOnly(finalVoice);
  // Only Urdu neural voices need the roman -> Urdu script conversion; English
  // and other voices must keep the original text untouched.
  const script: "urdu" | "latin" = apiVoice.includes("ur-PK") ? "urdu" : "latin";
  return {
    engine: "azure",
    voice: finalVoice,
    apiVoice,
    script,
    auto: /\|auto-(male|female)$/.test(finalVoice),
    gender: finalVoice.endsWith("auto-male") ? "male" : "female",
  };
}

// Roman-Urdu personas -> Azure neural Urdu voices
const ROMAN_URDU_AZURE_VOICE_BY_PERSONA: Record<string, string> = {
  "urdu-male": "ur-PK-AsadNeural",
  kashif: "ur-PK-AsadNeural",
  "vikram-roman": "ur-PK-AsadNeural",
  "urdu-female": "ur-PK-UzmaNeural",
  ayesha: "ur-PK-UzmaNeural",
  "neha-roman": "ur-PK-UzmaNeural",
};

export interface DebugData {
  timestamp?: string;
  endpoint?: string;
  method?: string;
  model: string;
  provider: string;
  baseUrl?: string;
  statusCode?: number | string;
  statusText?: string;
  statusState?: 'idle' | 'streaming' | 'completed' | 'error';
  latencyMs: number;
  tokens: number;
  promptTokens?: number;
  completionTokens?: number;
  cost: number;
  temperature: number;
  contextWindow?: string;
  rawSystemPrompt?: string;
  rawMessages?: any[];
  userMessage?: string;
  attachments?: any[];
  tools?: any;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestPayload?: any;
  rawResponse?: string;
  errorCode?: string | number;
  errorText?: string;
  errorReason?: string;
}

export interface ChatPreferences {
  temperature: number;
  contextWindow: "64k" | "128k" | "512k" | "1m" | string;
  systemPrompt: string;
  streamResponse: boolean;
  autoOpenArtifacts: boolean;
  responseCompletionSound: boolean;
  thinkingWaveSound: boolean;
  rollingWindowLimit: number;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;

  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  sidebarView: SidebarView;
  setSidebarView: (view: SidebarView) => void;

  selectedProvider: string | null; // e.g. 'OpenRouter', 'OpenAI', 'Anthropic', 'Google Gemini'
  selectedModel: string; // e.g. 'openai/gpt-4o'
  setSelectedProviderAndModel: (provider: string | null, model: string) => void;

  isIncognito: boolean;
  setIncognito: (incognito: boolean) => void;
  toggleIncognito: () => void;

  isDebugConsoleOpen: boolean;
  setDebugConsoleOpen: (open: boolean) => void;
  toggleDebugConsole: () => void;

  isAutoVoiceEnabled: boolean;
  toggleAutoVoice: () => void;

  isHandsFreeMode: boolean;
  toggleHandsFreeMode: () => void;
  setHandsFreeMode: (enabled: boolean) => void;

  isCallAssistantOpen: boolean;
  setCallAssistantOpen: (open: boolean) => void;
  toggleCallAssistant: () => void;

  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;

  isSttEnabled: boolean;
  setIsSttEnabled: (val: boolean) => void;
  toggleSttEnabled: () => void;

  isTtsEnabled: boolean;
  setIsTtsEnabled: (val: boolean) => void;
  toggleTtsEnabled: () => void;

  sttLang: string;
  setSttLang: (lang: string) => void;

  ttsVoice: string;
  setTtsVoice: (voice: string) => void;

  ttsRate: number;
  setTtsRate: (rate: number) => void;

  ttsPitch: number;
  setTtsPitch: (pitch: number) => void;

  ttsEngine: "azure" | "browser";
  setTtsEngine: (engine: "azure" | "browser") => void;

  // Single source of truth for speech: engine + voice are always saved together,
  // so Read Aloud / call assistant can never use a different voice than the one
  // selected in Settings. There is only ever ONE active speech.
  saveSpeechSelection: (engine: "azure" | "browser", voice: string) => void;

  isArtifactsOpen: boolean;
  setArtifactsOpen: (open: boolean) => void;
  toggleArtifacts: () => void;
  activeArtifact: Artifact | null;
  setActiveArtifact: (artifact: Artifact | null) => void;

  activeModal: "agentBuilder" | "mcpServer" | "prompts" | "settings" | "share" | null;
  setActiveModal: (modal: "agentBuilder" | "mcpServer" | "prompts" | "settings" | "share" | null) => void;

  activePromptId: string | null;
  setActivePromptId: (id: string | null) => void;
  sendPromptsOnSelect: boolean;
  setSendPromptsOnSelect: (val: boolean) => void;

  pendingPromptText: string | { text: string; autoSubmit?: boolean } | null;
  setPendingPromptText: (text: string | { text: string; autoSubmit?: boolean } | null) => void;

  debugData: DebugData | null;
  setDebugData: (data: DebugData | null) => void;

  // Real, live token accounting for the current conversation (used by the
  // usage quota ring in the chat input).
  conversationUsage: { usedTokens: number; maxTokens: number; messageCount: number };
  setConversationUsage: (usage: { usedTokens: number; maxTokens: number; messageCount: number }) => void;

  activeTools: {
    webSearch: boolean;
    fileSearch: boolean;
    skills: boolean;
    artifacts: boolean;
  };
  toggleTool: (tool: "webSearch" | "fileSearch" | "skills" | "artifacts") => void;

  unreadNotificationsCount: number;
  setUnreadNotificationsCount: (count: number) => void;
  isNotificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  toggleNotifications: () => void;

  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;

  activeSuggestionChip: { label: string; prefix: string; type?: string } | null;
  setActiveSuggestionChip: (chip: { label: string; prefix: string; type?: string } | null) => void;

  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  addSelectedSkill: (skillName: string) => void;
  removeSelectedSkill: (skillName: string) => void;
  clearSelectedSkills: () => void;

  rollingWindowLimit: number;
  setRollingWindowLimit: (limit: number) => void;

  chatPreferences: ChatPreferences;
  setChatPreferences: (prefs: Partial<ChatPreferences>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    id: "usr_user1",
    username: "user1",
    role: "USER",
    status: "ACTIVE",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=user1",
  },
  setUser: (user) => set({ user }),

  isSidebarOpen: true,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  sidebarView: "chats",
  setSidebarView: (view) => set({ sidebarView: view, isSidebarOpen: true }),

  unreadNotificationsCount: 0,
  setUnreadNotificationsCount: (count) => set({ unreadNotificationsCount: count }),
  isNotificationsOpen: false,
  setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),
  toggleNotifications: () => set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen })),

  selectedProvider: (() => {
    if (typeof window === "undefined") return "OpenAI";
    try {
      const saved = localStorage.getItem("cheapchats_selected_provider");
      if (saved) return saved;
    } catch {}
    return "OpenAI";
  })(),
  selectedModel: (() => {
    if (typeof window === "undefined") return "gpt-4o";
    try {
      const saved = localStorage.getItem("cheapchats_selected_model");
      if (saved) return saved;
    } catch {}
    return "gpt-4o";
  })(),
  setSelectedProviderAndModel: (provider, model) => {
    try {
      if (typeof window !== "undefined") {
        if (provider) {
          localStorage.setItem("cheapchats_selected_provider", provider);
        } else {
          localStorage.removeItem("cheapchats_selected_provider");
        }
        if (model) {
          localStorage.setItem("cheapchats_selected_model", model);
        } else {
          localStorage.removeItem("cheapchats_selected_model");
        }
      }
    } catch {}
    set({ selectedProvider: provider, selectedModel: model });
  },

  isIncognito: false,
  setIncognito: (incognito) => set({ isIncognito: incognito }),
  toggleIncognito: () => set((state) => ({ isIncognito: !state.isIncognito })),

  isDebugConsoleOpen: false,
  setDebugConsoleOpen: (open) => set({ isDebugConsoleOpen: open }),
  toggleDebugConsole: () => set((state) => ({ isDebugConsoleOpen: !state.isDebugConsoleOpen })),

  isAutoVoiceEnabled: false, // Default to false
  toggleAutoVoice: () => set((state) => ({ isAutoVoiceEnabled: !state.isAutoVoiceEnabled })),

  isHandsFreeMode: false,
  toggleHandsFreeMode: () => set((state) => ({ isHandsFreeMode: !state.isHandsFreeMode })),
  setHandsFreeMode: (enabled) => set({ isHandsFreeMode: enabled }),

  isCallAssistantOpen: false,
  setCallAssistantOpen: (open) => set({ isCallAssistantOpen: open }),
  toggleCallAssistant: () => set((state) => ({ isCallAssistantOpen: !state.isCallAssistantOpen })),

  isSpeaking: false,
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),

  isSttEnabled: typeof window !== "undefined" && localStorage.getItem("cheapchat_stt_enabled") !== null
    ? localStorage.getItem("cheapchat_stt_enabled") === "true"
    : true,
  setIsSttEnabled: (val) => {
    if (typeof window !== "undefined") localStorage.setItem("cheapchat_stt_enabled", String(val));
    set({ isSttEnabled: val });
  },
  toggleSttEnabled: () =>
    set((state) => {
      const next = !state.isSttEnabled;
      if (typeof window !== "undefined") localStorage.setItem("cheapchat_stt_enabled", String(next));
      return { isSttEnabled: next };
    }),

  isTtsEnabled: typeof window !== "undefined" && localStorage.getItem("cheapchat_tts_enabled") !== null
    ? localStorage.getItem("cheapchat_tts_enabled") === "true"
    : true,
  setIsTtsEnabled: (val) => {
    if (typeof window !== "undefined") localStorage.setItem("cheapchat_tts_enabled", String(val));
    set({ isTtsEnabled: val });
  },
  toggleTtsEnabled: () =>
    set((state) => {
      const next = !state.isTtsEnabled;
      if (typeof window !== "undefined") localStorage.setItem("cheapchat_tts_enabled", String(next));
      return { isTtsEnabled: next };
    }),

  sttLang: typeof window !== "undefined" ? localStorage.getItem("cheapchat_stt_lang") || "auto" : "auto",
  setSttLang: (lang) => {
    if (typeof window !== "undefined") localStorage.setItem("cheapchat_stt_lang", lang);
    set({ sttLang: lang });
  },

  // Built-in offline is the default source
  ttsVoice:
    typeof window !== "undefined" ? localStorage.getItem("cheapchat_tts_voice") || "persona:ayesha" : "persona:ayesha",
  setTtsVoice: (voice) => {
    if (typeof window !== "undefined") localStorage.setItem("cheapchat_tts_voice", voice);
    set({ ttsVoice: voice });
  },

  ttsRate: typeof window !== "undefined" && localStorage.getItem("cheapchat_tts_rate") !== null
    ? Number(localStorage.getItem("cheapchat_tts_rate")) || 1.0
    : 1.0,
  setTtsRate: (rate) => {
    if (typeof window !== "undefined") localStorage.setItem("cheapchat_tts_rate", String(rate));
    set({ ttsRate: rate });
  },

  ttsPitch: typeof window !== "undefined" && localStorage.getItem("cheapchat_tts_pitch") !== null
    ? Number(localStorage.getItem("cheapchat_tts_pitch")) || 1.0
    : 1.0,
  setTtsPitch: (pitch) => {
    if (typeof window !== "undefined") localStorage.setItem("cheapchat_tts_pitch", String(pitch));
    set({ ttsPitch: pitch });
  },

  ttsEngine: resolveSpeechEngine(
    typeof window !== "undefined" ? localStorage.getItem("cheapchat_tts_engine") : null,
    typeof window !== "undefined" ? localStorage.getItem("cheapchat_tts_voice") : null
  ),
  setTtsEngine: (engine: "azure" | "browser") => {
    if (typeof window !== "undefined") localStorage.setItem("cheapchat_tts_engine", engine);
    set({ ttsEngine: engine });
  },

  saveSpeechSelection: (engine: "azure" | "browser", voice: string) => {
    const safeEngine = resolveSpeechEngine(engine, voice);
    const safeVoice = safeEngine === "azure" ? toAzureVoiceKey(voice) : toBrowserVoiceKey(voice);
    if (typeof window !== "undefined") {
      localStorage.setItem("cheapchat_tts_engine", safeEngine);
      localStorage.setItem("cheapchat_tts_voice", safeVoice);
    }
    set({ ttsEngine: safeEngine, ttsVoice: safeVoice });
  },

  isArtifactsOpen: false,
  setArtifactsOpen: (open) => set({ isArtifactsOpen: open }),
  toggleArtifacts: () => set((state) => ({ isArtifactsOpen: !state.isArtifactsOpen })),
  activeArtifact: null,
  setActiveArtifact: (artifact) => set({ activeArtifact: artifact, isArtifactsOpen: !!artifact }),

  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),

  activePromptId: null,
  setActivePromptId: (id) => set({ activePromptId: id }),
  sendPromptsOnSelect: true,
  setSendPromptsOnSelect: (val) => set({ sendPromptsOnSelect: val }),

  pendingPromptText: null,
  setPendingPromptText: (text) => set({ pendingPromptText: text }),

  debugData: null,
  setDebugData: (data) => set({ debugData: data }),

  conversationUsage: { usedTokens: 0, maxTokens: 128000, messageCount: 0 },
  setConversationUsage: (usage) => set({ conversationUsage: usage }),

  activeTools: {
    webSearch: false,
    fileSearch: false,
    skills: false,
    artifacts: false,
  },
  toggleTool: (tool) =>
    set((state) => ({
      activeTools: { ...state.activeTools, [tool]: !state.activeTools[tool] },
    })),

  activeProjectId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id }),

  activeSuggestionChip: null,
  setActiveSuggestionChip: (chip) => set({ activeSuggestionChip: chip }),

  selectedSkills: [],
  setSelectedSkills: (skills) => set({ selectedSkills: skills }),
  addSelectedSkill: (skillName) =>
    set((state) => ({
      selectedSkills: state.selectedSkills.includes(skillName)
        ? state.selectedSkills
        : [...state.selectedSkills, skillName],
    })),
  removeSelectedSkill: (skillName) =>
    set((state) => ({
      selectedSkills: state.selectedSkills.filter((s) => s !== skillName),
    })),
  clearSelectedSkills: () => set({ selectedSkills: [] }),

  rollingWindowLimit: (() => {
    if (typeof window === "undefined") return 20;
    try {
      const saved = localStorage.getItem("cheapchat_rolling_window_limit");
      if (saved) return parseInt(saved, 10) || 20;
      const rawPrefs = localStorage.getItem("cheapchats_chat_preferences");
      if (rawPrefs) {
        const p = JSON.parse(rawPrefs);
        if (p?.rollingWindowLimit) return parseInt(p.rollingWindowLimit, 10) || 20;
      }
    } catch {}
    return 20;
  })(),
  setRollingWindowLimit: (limit: number) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("cheapchat_rolling_window_limit", String(limit));
      }
    } catch {}
    set((state) => ({
      rollingWindowLimit: limit,
      chatPreferences: { ...state.chatPreferences, rollingWindowLimit: limit },
    }));
  },

  chatPreferences: (() => {
    const defaultPrefs: ChatPreferences = {
      temperature: 0.7,
      contextWindow: "128k", // Default 128k context window
      systemPrompt: "You are a helpful, brilliant AI assistant.",
      streamResponse: true,
      autoOpenArtifacts: true,
      responseCompletionSound: true,
      thinkingWaveSound: true,
      rollingWindowLimit: 20,
    };
    if (typeof window === "undefined") return defaultPrefs;
    try {
      const raw = localStorage.getItem("cheapchats_chat_preferences");
      if (raw) {
        return { ...defaultPrefs, ...JSON.parse(raw) };
      }
    } catch {}
    return defaultPrefs;
  })(),
  setChatPreferences: (prefs) => {
    set((state) => {
      const updated = { ...state.chatPreferences, ...prefs };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("cheapchats_chat_preferences", JSON.stringify(updated));
          if (updated.rollingWindowLimit) {
            localStorage.setItem("cheapchat_rolling_window_limit", String(updated.rollingWindowLimit));
          }
        } catch {}
      }
      return {
        chatPreferences: updated,
        rollingWindowLimit: updated.rollingWindowLimit ?? state.rollingWindowLimit,
      };
    });
  },
}));
