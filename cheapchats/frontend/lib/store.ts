import create from "zustand";

export type SidebarView = "chats" | "agents" | "prompts" | "skills" | "mcp" | "files" | "memory";

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

export interface DebugData {
  rawSystemPrompt: string;
  rawMessages: any[];
  model: string;
  provider: string;
  tokens: number;
  cost: number;
  latencyMs: number;
  temperature: number;
  errorCode?: string | number;
  errorText?: string;
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

  sidebarView: "agents",
  setSidebarView: (view) => set({ sidebarView: view, isSidebarOpen: true }),

  unreadNotificationsCount: 0,
  setUnreadNotificationsCount: (count) => set({ unreadNotificationsCount: count }),
  isNotificationsOpen: false,
  setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),
  toggleNotifications: () => set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen })),

  selectedProvider: "OpenAI",
  selectedModel: "gpt-4o",
  setSelectedProviderAndModel: (provider, model) => set({ selectedProvider: provider, selectedModel: model }),

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

  sttLang: typeof window !== "undefined" ? localStorage.getItem("cheapchat_stt_lang") || "" : "",
  setSttLang: (lang) => {
    if (typeof window !== "undefined") localStorage.setItem("cheapchat_stt_lang", lang);
    set({ sttLang: lang });
  },

  ttsVoice: typeof window !== "undefined" ? localStorage.getItem("cheapchat_tts_voice") || "default" : "default",
  setTtsVoice: (voice) => {
    if (typeof window !== "undefined") localStorage.setItem("cheapchat_tts_voice", voice);
    set({ ttsVoice: voice });
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

  rollingWindowLimit: 20,
  setRollingWindowLimit: (limit: number) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("cheapchat_rolling_window_limit", String(limit));
      }
    } catch {}
    set({ rollingWindowLimit: limit });
  },
}));
