"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  X,
  Search,
  MessageSquare,
  Volume2,
  ShieldCheck,
  User,
  Info,
  HelpCircle,
  Key,
  Check,
  Sliders,
  Upload,
  Copy,
  Image as ImageIcon,
  Cpu,
  Server,
  Globe,
  RotateCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type SettingsTab = "general" | "chat" | "providers" | "speech" | "privacy" | "account" | "about";

export default function SettingsModal() {
  const { activeModal, setActiveModal, rollingWindowLimit, setRollingWindowLimit } = useAppStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [searchQuery, setSearchQuery] = useState("");

  // API Keys state (Provider API keys)
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [deepseekKey, setDeepseekKey] = useState("");
  const [mistralKey, setMistralKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [customEndpoint, setCustomEndpoint] = useState("http://187.52.117.2:8377/v1/models");
  const [customApiKey, setCustomApiKey] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [diagnosticsCopied, setDiagnosticsCopied] = useState(false);

  // 1. General Tab States (Screenshot 0)
  const [theme, setTheme] = useState("System");
  const [language, setLanguage] = useState("English");
  const [fontSize, setFontSize] = useState("Medium");
  const [chatDirection, setChatDirection] = useState("ltr");

  const [maximizeChatSpace, setMaximizeChatSpace] = useState(false);
  const [centerInputOnWelcome, setCenterInputOnWelcome] = useState(true);
  const [scrollToEndBtn, setScrollToEndBtn] = useState(true);
  const [keepScreenAwake, setKeepScreenAwake] = useState(true);

  // 2. Chat Tab States
  const [pressEnterToSend, setPressEnterToSend] = useState(true);
  const [enterWhileGenerating, setEnterWhileGenerating] = useState("Steer the response");
  const [saveDraftsLocally, setSaveDraftsLocally] = useState(true);
  const [saveBadgesState, setSaveBadgesState] = useState(false);

  const [toggleCmdAt, setToggleCmdAt] = useState(true);
  const [toggleCmdPlus, setToggleCmdPlus] = useState(true);
  const [toggleCmdSlash, setToggleCmdSlash] = useState(true);

  const [renderUserMarkdown, setRenderUserMarkdown] = useState(true);
  const [displayUsername, setDisplayUsername] = useState(true);
  const [parseLatex, setParseLatex] = useState(true);
  const [openThinkingDefault, setOpenThinkingDefault] = useState(false);
  const [autoExpandTools, setAutoExpandTools] = useState(false);

  const [switchToHistoryOnNew, setSwitchToHistoryOnNew] = useState(true);
  const [autoScrollOnOpen, setAutoScrollOnOpen] = useState(false);
  const [enableMidConvEndpoint, setEnableMidConvEndpoint] = useState(true);
  const [tempChatByDefault, setTempChatByDefault] = useState(false);
  const [useDefaultFork, setUseDefaultFork] = useState(false);
  const [startForkFromTarget, setStartForkFromTarget] = useState(false);

  const [advancedPromptsEditor, setAdvancedPromptsEditor] = useState(false);
  const [alwaysProdPrompts, setAlwaysProdPrompts] = useState(true);
  const [sendPromptsOnSelect, setSendPromptsOnSelect] = useState(true);

  // 3. Speech Tab States (Screenshot 1)
  const [sttEnabled, setSttEnabled] = useState(true);
  const [sttEngine, setSttEngine] = useState("Browser");
  const [sttLang, setSttLang] = useState("");
  const [autoTranscribe, setAutoTranscribe] = useState(false);
  const [decibelSensitivity, setDecibelSensitivity] = useState(-45);
  const [autoSendText, setAutoSendText] = useState(false);

  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsEngine, setTtsEngine] = useState("Browser");
  const [ttsVoice, setTtsVoice] = useState("");
  const [conversationMode, setConversationMode] = useState(false);
  const [autoplayLatest, setAutoplayLatest] = useState(false);
  const [useCloudVoices, setUseCloudVoices] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [enableCacheTts, setEnableCacheTts] = useState(true);

  // 4. Data & Privacy Tab States (Screenshot 2)
  const [refSavedMemories, setRefSavedMemories] = useState(true);

  useEffect(() => {
    if (activeModal === "settings") {
      setSearchQuery("");
          fetch("/api/provider-endpoints")
            .then((r) => r.json())
            .then((d) => {
              if (d.endpoint) {
                setCustomEndpoint((d.endpoint?.baseUrl || "http://187.52.117.2:8377/v1").trim());
                setCustomApiKey(d.endpoint?.apiKey === "CUSTOM_API_KEY_SET" ? "saved" : "");
          }
        })
        .catch((e) => console.error(e));
    }
  }, [activeModal]);

  useEffect(() => {
    try {
      const savedLimit = localStorage.getItem("cheapchat_rolling_window_limit");
      if (savedLimit) {
        const parsed = parseInt(savedLimit);
        if (!isNaN(parsed) && parsed > 0) {
          setRollingWindowLimit(parsed);
        }
      }
    } catch {}
  }, [setRollingWindowLimit]);

  if (activeModal !== "settings") return null;

  const handleSaveKeys = async () => {
    try {
      await fetch("/api/provider-endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: customEndpoint,
          apiKey: customApiKey === "saved" ? undefined : customApiKey,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestCustomEndpoint = async () => {
    if (!customEndpoint.trim()) {
      setTestStatus("error");
      setTestMessage("Please enter an endpoint URL first.");
      return;
    }
    setTestStatus("testing");
    setTestMessage("Testing connection and fetching models...");
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: customEndpoint.trim(),
          apiKey: customApiKey.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus("success");
        setTestMessage(`Connected successfully! Retrieved ${data.count} models from endpoint.`);
      } else {
        setTestStatus("error");
        setTestMessage(data.error || "Connection failed. Please check endpoint URL.");
      }
    } catch (err: any) {
      setTestStatus("error");
      setTestMessage(err.message || "Failed to reach endpoint.");
    }
  };

  const handleClearAllChats = async () => {
    if (confirm("Are you sure you want to permanently delete all chat history? This cannot be undone.")) {
      try {
        const res = await fetch("/api/conversations", { method: "DELETE" });
        if (res.ok) {
          alert("All conversations have been deleted.");
          window.location.href = "/new";
        }
      } catch (err) {
        console.error("Failed to delete chats:", err);
      }
    }
  };

  const handleClearTtsCache = () => {
    if (confirm("Clear speech synthesis and audio caches?")) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        localStorage.removeItem("cheapchat_tts_cache");
      }
      alert("TTS audio cache cleared.");
    }
  };

  const handleImportConversations = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const items = Array.isArray(data) ? data : (data.conversations || [data]);
        for (const item of items) {
          await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: item.title || "Imported Chat",
              model: item.model || "openai/gpt-4o",
              provider: item.provider || "OpenRouter",
            }),
          });
        }
        alert(`Successfully imported ${items.length} conversation(s).`);
        window.location.reload();
      } catch (err) {
        alert("Invalid JSON file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to log out and clear your session?")) {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    }
  };

  const ToggleSwitch = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (val: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex items-center px-1 flex-shrink-0 cursor-pointer ${
        checked ? "bg-white" : "bg-[#242424] border border-white/15"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${
          checked ? "bg-black translate-x-5" : "bg-slate-400 translate-x-0"
        }`}
      />
    </button>
  );

  const SettingRow = ({
    label,
    subtitle,
    checked,
    onChange,
    helpTooltip,
    rightElement,
    danger,
  }: {
    label: string;
    subtitle?: string;
    checked?: boolean;
    onChange?: (val: boolean) => void;
    helpTooltip?: boolean;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <div
      className={`flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border transition gap-3 ${
        danger ? "border-red-500/30 hover:border-red-500/50" : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-slate-200 leading-snug">
            {label}
          </span>
          {helpTooltip && (
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 cursor-help" />
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {rightElement ? (
        rightElement
      ) : onChange !== undefined && checked !== undefined ? (
        <ToggleSwitch checked={checked} onChange={onChange} />
      ) : null}
    </div>
  );

  const tabsNav: { id: SettingsTab; label: string; icon: any }[] = [
    { id: "general", label: "General", icon: Sliders },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "providers", label: "Providers", icon: Cpu },
    { id: "speech", label: "Speech", icon: Volume2 },
    { id: "privacy", label: "Data & Privacy", icon: ShieldCheck },
    { id: "account", label: "Account", icon: User },
    { id: "about", label: "About", icon: Info },
  ];

  const handleCopyDiagnostics = () => {
    const text = `Version: v0.9.7\nCommit: 31dc4a3\nBranch: main\nBuilt: 2026-07-23 15:49:19 UTC`;
    navigator.clipboard.writeText(text);
    setDiagnosticsCopied(true);
    setTimeout(() => setDiagnosticsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[85vh] max-h-[780px] bg-[#141414] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs text-slate-200 select-none relative">
        {/* ── Modal Header ─────────────────────────────────────────────────── */}
        <div className="px-5 py-3.5 border-b border-white/10 bg-[#161616] flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">Settings</h2>
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ── 2-Column Body Layout ─────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar Tabs */}
          <div className="w-56 bg-[#161616] border-r border-white/10 p-3 flex flex-col gap-1 overflow-y-auto flex-shrink-0">
            {/* Search Settings Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                name="settings_search_query"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings"
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/20 transition"
              />
            </div>

            {/* Navigation Tabs List */}
            {tabsNav.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-xs transition text-left ${
                    isActive
                      ? "bg-[#282828] text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#1e1e1e]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 bg-[#121212] p-6 overflow-y-auto space-y-6">
            {/* ── General Tab (Exact Screenshot 0 Design) ─────────────────── */}
            {activeTab === "general" && (
              <div className="space-y-6 max-w-2xl">
                {/* Section 1: APPEARANCE */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    APPEARANCE
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label="Theme"
                      rightElement={
                        <select
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          className="bg-[#222] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="System">System</option>
                          <option value="Dark">Dark</option>
                          <option value="Light">Light</option>
                        </select>
                      }
                    />
                    <SettingRow
                      label="Language"
                      rightElement={
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="bg-[#222] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="English">English</option>
                          <option value="Urdu">Urdu</option>
                          <option value="Spanish">Spanish</option>
                        </select>
                      }
                    />
                    <SettingRow
                      label="Message Font Size"
                      rightElement={
                        <select
                          value={fontSize}
                          onChange={(e) => setFontSize(e.target.value)}
                          className="bg-[#222] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="Medium">Medium</option>
                          <option value="Small">Small</option>
                          <option value="Large">Large</option>
                        </select>
                      }
                    />
                    <SettingRow
                      label="Chat direction"
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setChatDirection(chatDirection === "ltr" ? "rtl" : "ltr")}
                          className="px-3.5 py-1.5 rounded-xl bg-[#222] border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 transition font-mono uppercase"
                        >
                          {chatDirection}
                        </button>
                      }
                    />
                  </div>
                </div>

                {/* Section 2: LAYOUT */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    LAYOUT
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label="Maximize chat space"
                      checked={maximizeChatSpace}
                      onChange={setMaximizeChatSpace}
                    />
                    <SettingRow
                      label="Center Chat Input on Welcome Screen"
                      checked={centerInputOnWelcome}
                      onChange={setCenterInputOnWelcome}
                    />
                    <SettingRow
                      label="Scroll to the end button"
                      checked={scrollToEndBtn}
                      onChange={setScrollToEndBtn}
                    />
                  </div>
                </div>

                {/* Section 3: ACCESSIBILITY */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    ACCESSIBILITY
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label="Keep screen awake during response generation"
                      checked={keepScreenAwake}
                      onChange={setKeepScreenAwake}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Chat Tab ────────────────────────────────────────────────── */}
            {activeTab === "chat" && (
              <div className="space-y-6 max-w-2xl">
                {/* Section 1: SENDING */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    SENDING
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label="Press Enter to send messages"
                      checked={pressEnterToSend}
                      onChange={setPressEnterToSend}
                      helpTooltip
                    />
                    <SettingRow
                      label="While generating, Enter will"
                      helpTooltip
                      rightElement={
                        <button
                          type="button"
                          onClick={() =>
                            setEnterWhileGenerating(
                              enterWhileGenerating === "Steer the response"
                                ? "Queue message"
                                : "Steer the response"
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-[#222] border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 transition"
                        >
                          {enterWhileGenerating}
                        </button>
                      }
                    />
                    <SettingRow
                      label="Save drafts locally"
                      checked={saveDraftsLocally}
                      onChange={setSaveDraftsLocally}
                      helpTooltip
                    />
                    <SettingRow
                      label="Save badges state"
                      checked={saveBadgesState}
                      onChange={setSaveBadgesState}
                      helpTooltip
                    />
                  </div>
                </div>

                {/* Section 2: COMMANDS */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    COMMANDS
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label='Toggle command "@" for switching endpoints, models, presets, etc.'
                      checked={toggleCmdAt}
                      onChange={setToggleCmdAt}
                    />
                    <SettingRow
                      label='Toggle command "+" for adding a multi-response setting'
                      checked={toggleCmdPlus}
                      onChange={setToggleCmdPlus}
                    />
                    <SettingRow
                      label='Toggle command "/" for selecting a prompt via keyboard'
                      checked={toggleCmdSlash}
                      onChange={setToggleCmdSlash}
                    />
                  </div>
                </div>

                {/* Section 3: MESSAGES */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    MESSAGES
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label="Render user messages as markdown"
                      checked={renderUserMarkdown}
                      onChange={setRenderUserMarkdown}
                    />
                    <SettingRow
                      label="Display username in messages"
                      checked={displayUsername}
                      onChange={setDisplayUsername}
                      helpTooltip
                    />
                    <SettingRow
                      label="Parsing LaTeX in messages (may affect performance)"
                      checked={parseLatex}
                      onChange={setParseLatex}
                      helpTooltip
                    />
                    <SettingRow
                      label="Open Thinking Dropdowns by Default"
                      checked={openThinkingDefault}
                      onChange={setOpenThinkingDefault}
                    />
                    <SettingRow
                      label="Auto-expand tool details"
                      checked={autoExpandTools}
                      onChange={setAutoExpandTools}
                    />
                  </div>
                </div>

                {/* Section 4: CONVERSATIONS */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    CONVERSATIONS
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label="Switch to Chat History on new chat"
                      checked={switchToHistoryOnNew}
                      onChange={setSwitchToHistoryOnNew}
                    />
                    <SettingRow
                      label="Auto-Scroll to latest message on chat open"
                      checked={autoScrollOnOpen}
                      onChange={setAutoScrollOnOpen}
                    />
                    <SettingRow
                      label="Enable switching Endpoints mid-conversation"
                      checked={enableMidConvEndpoint}
                      onChange={setEnableMidConvEndpoint}
                    />
                    <SettingRow
                      label="Temporary Chat by default"
                      checked={tempChatByDefault}
                      onChange={setTempChatByDefault}
                      helpTooltip
                    />
                  </div>
                </div>

                {/* Section 5: PROMPTS */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    PROMPTS
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label="Advanced prompts editor"
                      checked={advancedPromptsEditor}
                      onChange={setAdvancedPromptsEditor}
                      helpTooltip
                    />
                    <SettingRow
                      label="Always make new prompt versions production"
                      checked={alwaysProdPrompts}
                      onChange={setAlwaysProdPrompts}
                    />
                    <SettingRow
                      label="Send prompts on select"
                      checked={sendPromptsOnSelect}
                      onChange={setSendPromptsOnSelect}
                      helpTooltip
                    />
                  </div>
                </div>

                {/* Section 6: CONTEXT & ROLLING AUTO-SUMMARY */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    CONTEXT WINDOW & AUTO-SUMMARY
                  </h3>

                  <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white">
                          Rolling Auto-Summary Message Window
                        </div>
                        <div className="text-[11px] text-slate-400 leading-relaxed">
                          Kitne active messages 100% full detail mein rakhein pehle ke purani history automatically summarize ho jaye. (By default: 20 messages)
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <input
                          type="number"
                          min={5}
                          max={100}
                          step={1}
                          value={rollingWindowLimit}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 20;
                            setRollingWindowLimit(val);
                          }}
                          className="w-16 px-2.5 py-1.5 text-center text-xs font-mono font-bold bg-[#1e1e1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                        <span className="text-xs text-slate-400 font-mono">msgs</span>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 mr-1">Presets:</span>
                      {[10, 20, 30, 50, 75].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRollingWindowLimit(preset)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                            rollingWindowLimit === preset
                              ? "bg-red-600 text-white font-bold"
                              : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    {/* Warning if rollingWindowLimit > 50 */}
                    {rollingWindowLimit > 50 && (
                      <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-300 text-[11px] flex items-start gap-2.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-0.5 leading-relaxed">
                          <strong className="font-semibold text-amber-200">Warning: High Context Window (&gt;50 messages)</strong>
                          <p>
                            50 messages se barhaane par context window bohat heavy ho sakta hai. Response ke doran model shayad kuch pichli memory ya instructions yaad na rakh paaye (attention dilution), aur chote/free models context limit exceed kar sakte hain.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Providers Tab (Dedicated Provider List) ───────────────────── */}
            {activeTab === "providers" && (
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Providers & Endpoints</h3>
                    <p className="text-[11px] text-slate-400">
                      Configure API keys and endpoint settings for all supported AI providers
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveKeys}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-xs text-white shadow-md transition flex items-center gap-1.5"
                  >
                    {saved && <Check className="w-4 h-4" />}
                    <span>{saved ? "Keys Saved!" : "Save All Keys"}</span>
                  </button>
                </div>

                {/* Provider 1: OpenRouter */}
                <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-red-400" />
                      <span className="font-bold text-white text-xs">OpenRouter</span>
                    </div>
                    <span className="text-[10px] bg-red-500/20 text-red-400 font-semibold px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-or-v1-..."
                    value={openrouterKey}
                    onChange={(e) => setOpenrouterKey(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Provider 2: OpenAI */}
                <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-rose-400" />
                      <span className="font-bold text-white text-xs">OpenAI</span>
                    </div>
                    <span className="text-[10px] bg-rose-500/20 text-rose-400 font-semibold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-proj-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Provider 3: Anthropic Claude */}
                <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-red-400" />
                      <span className="font-bold text-white text-xs">Anthropic Claude</span>
                    </div>
                    <span className="text-[10px] bg-red-500/20 text-red-400 font-semibold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Provider 4: Google Gemini */}
                <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-rose-400" />
                      <span className="font-bold text-white text-xs">Google Gemini</span>
                    </div>
                    <span className="text-[10px] bg-rose-500/20 text-rose-400 font-semibold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Provider 5: Groq */}
                <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-rose-400" />
                      <span className="font-bold text-white text-xs">Groq AI</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded-full">
                      Ultra Fast LPU
                    </span>
                  </div>
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Provider 6: DeepSeek */}
                <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-red-400" />
                      <span className="font-bold text-white text-xs">DeepSeek</span>
                    </div>
                    <span className="text-[10px] bg-red-500/20 text-red-400 font-semibold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={deepseekKey}
                    onChange={(e) => setDeepseekKey(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Provider 7: Ollama (Local) */}
                <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-red-400" />
                      <span className="font-bold text-white text-xs">Ollama (Local LLM)</span>
                    </div>
                    <span className="text-[10px] bg-red-500/20 text-red-400 font-semibold px-2 py-0.5 rounded-full">
                      Local Endpoint
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="http://localhost:11434"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Provider 8: Custom Provider (Custom API) */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1b1214] to-[#140e10] border border-red-500/30 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-red-400" />
                      <div>
                        <span className="font-bold text-white text-xs">Custom Provider (Custom API)</span>
                        <p className="text-[10px] text-slate-400">OpenAI compatible endpoint (AntSeed, vLLM, LiteLLM, Ollama, etc.)</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-red-500/20 border border-red-500/30 text-red-400 font-semibold px-2.5 py-0.5 rounded-full">
                      Custom API
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        placeholder="http://187.52.117.2:8377/v1/models"
                        value={customEndpoint}
                        onChange={(e) => {
                          setCustomEndpoint(e.target.value);
                          setTestStatus("idle");
                        }}
                        className="w-full bg-[#180d0f] border border-red-500/20 focus:border-red-500 rounded-xl p-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none transition"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Accepts full models endpoint (e.g. <code className="text-red-300 bg-red-950/40 px-1 py-0.5 rounded">http://187.52.117.2:8377/v1/models</code>) or base URL.
                      </p>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        API Key / Bearer Token <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Leave blank if no authorization token is required"
                        value={customApiKey}
                        onChange={(e) => {
                          setCustomApiKey(e.target.value);
                          setTestStatus("idle");
                        }}
                        className="w-full bg-[#180d0f] border border-red-500/20 focus:border-red-500 rounded-xl p-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none transition"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleTestCustomEndpoint}
                        disabled={testStatus === "testing"}
                        className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                      >
                        {testStatus === "testing" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Testing...</span>
                          </>
                        ) : (
                          <>
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Test Connection</span>
                          </>
                        )}
                      </button>

                      {testStatus === "success" && (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>{testMessage}</span>
                        </div>
                      )}

                      {testStatus === "error" && (
                        <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{testMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Speech Tab (Exact Screenshot 1 Design) ─────────────────── */}
            {activeTab === "speech" && (
              <div className="space-y-6 max-w-2xl">
                {/* Section 1: SPEECH TO TEXT */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    SPEECH TO TEXT
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label="Speech to Text"
                      checked={sttEnabled}
                      onChange={setSttEnabled}
                    />
                    <SettingRow
                      label="Engine"
                      rightElement={
                        <select
                          value={sttEngine}
                          onChange={(e) => setSttEngine(e.target.value)}
                          className="bg-[#222] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="Browser">Browser</option>
                          <option value="Whisper">Whisper API</option>
                        </select>
                      }
                    />
                    <SettingRow
                      label="Language"
                      rightElement={
                        <select
                          value={sttLang}
                          onChange={(e) => setSttLang(e.target.value)}
                          className="bg-[#222] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer w-24"
                        >
                          <option value="">Auto</option>
                          <option value="en">English</option>
                          <option value="ur">Urdu</option>
                        </select>
                      }
                    />
                    <SettingRow
                      label="Auto transcribe audio"
                      checked={autoTranscribe}
                      onChange={setAutoTranscribe}
                    />
                    <SettingRow
                      label="Decibel sensitivity (default: -45)"
                      rightElement={
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="-100"
                            max="0"
                            value={decibelSensitivity}
                            onChange={(e) => setDecibelSensitivity(Number(e.target.value))}
                            className="w-28 accent-white cursor-pointer"
                          />
                          <span className="bg-[#222] border border-white/10 px-2 py-0.5 rounded-lg text-[11px] font-mono text-slate-300">
                            {decibelSensitivity}
                          </span>
                        </div>
                      }
                    />
                    <SettingRow
                      label="Auto send text"
                      checked={autoSendText}
                      onChange={setAutoSendText}
                    />
                  </div>
                </div>

                {/* Section 2: TEXT TO SPEECH */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    TEXT TO SPEECH
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label="Text to Speech"
                      checked={ttsEnabled}
                      onChange={setTtsEnabled}
                    />
                    <SettingRow
                      label="Engine"
                      rightElement={
                        <select
                          value={ttsEngine}
                          onChange={(e) => setTtsEngine(e.target.value)}
                          className="bg-[#222] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="Browser">Browser</option>
                          <option value="OpenAI TTS">OpenAI TTS</option>
                        </select>
                      }
                    />
                    <SettingRow
                      label="Voice"
                      rightElement={
                        <select
                          value={ttsVoice}
                          onChange={(e) => setTtsVoice(e.target.value)}
                          className="bg-[#222] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer w-24"
                        >
                          <option value="default">Default</option>
                          <option value="alloy">Alloy</option>
                          <option value="echo">Echo</option>
                        </select>
                      }
                    />
                    <SettingRow
                      label="Conversation Mode"
                      checked={conversationMode}
                      onChange={setConversationMode}
                    />
                    <SettingRow
                      label="Autoplay Latest Message"
                      checked={autoplayLatest}
                      onChange={setAutoplayLatest}
                    />
                    <SettingRow
                      label="Use cloud-based voices"
                      checked={useCloudVoices}
                      onChange={setUseCloudVoices}
                    />
                    <SettingRow
                      label="Audio Playback Rate (default: 1)"
                      rightElement={
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={playbackRate}
                            onChange={(e) => setPlaybackRate(Number(e.target.value))}
                            className="w-28 accent-white cursor-pointer"
                          />
                          <span className="bg-[#222] border border-white/10 px-2 py-0.5 rounded-lg text-[11px] font-mono text-slate-300">
                            {playbackRate}
                          </span>
                        </div>
                      }
                    />
                    <SettingRow
                      label="Enable cache TTS"
                      checked={enableCacheTts}
                      onChange={setEnableCacheTts}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Data & Privacy Tab (Exact Screenshot 2 Design) ─────────── */}
            {activeTab === "privacy" && (
              <div className="space-y-6 max-w-2xl">
                {/* Section 1: MEMORY */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    MEMORY
                  </h3>
                  <SettingRow
                    label="Reference saved memories"
                    subtitle="Allow the assistant to reference and use your saved memories when responding"
                    checked={refSavedMemories}
                    onChange={setRefSavedMemories}
                  />
                </div>

                {/* Section 2: YOUR DATA */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    YOUR DATA
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label="Import conversations from a JSON file"
                      rightElement={
                        <label className="px-3.5 py-1.5 rounded-xl bg-[#222] hover:bg-[#2a2a2a] border border-white/10 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Import</span>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportConversations}
                            className="hidden"
                          />
                        </label>
                      }
                    />
                    <SettingRow
                      label="Shared links"
                      rightElement={
                        <button
                          type="button"
                          onClick={() => alert("All conversations in CheapChat can be shared using the Share button in header.")}
                          className="px-3.5 py-1.5 rounded-xl bg-[#222] hover:bg-[#2a2a2a] border border-white/10 text-xs font-semibold text-slate-200 transition"
                        >
                          Manage
                        </button>
                      }
                    />
                  </div>
                </div>

                {/* Section 3: DANGER ZONE (Red Border Card) */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider px-1">
                    DANGER ZONE
                  </h3>
                  <div className="space-y-2">
                    <SettingRow
                      label="Delete TTS cache storage"
                      danger
                      rightElement={
                        <button
                          type="button"
                          onClick={handleClearTtsCache}
                          className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-xs text-white transition"
                        >
                          Delete
                        </button>
                      }
                    />
                    <SettingRow
                      label="Clear all chats"
                      danger
                      rightElement={
                        <button
                          type="button"
                          onClick={handleClearAllChats}
                          className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-xs text-white transition"
                        >
                          Delete
                        </button>
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Account Tab (Exact Screenshot 3 Design) ───────────────── */}
            {activeTab === "account" && (
              <div className="space-y-6 max-w-2xl">
                {/* Section 1: PROFILE */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    PROFILE
                  </h3>
                  <SettingRow
                    label="Profile Picture"
                    rightElement={
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400">
                        CC
                      </div>
                    }
                  />
                </div>

                {/* Section 2: DANGER ZONE (Red Border Card) */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider px-1">
                    DANGER ZONE
                  </h3>
                  <SettingRow
                    label="Log out & clear session"
                    danger
                    rightElement={
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-xs text-white transition"
                      >
                        Log out
                      </button>
                    }
                  />
                </div>
              </div>
            )}

            {/* ── About Tab (Exact Screenshot 4 Design) ─────────────────── */}
            {activeTab === "about" && (
              <div className="space-y-6 max-w-2xl">
                {/* ABOUT Section Card */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    ABOUT
                  </h3>
                  <div className="border border-white/10 bg-[#161616] rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-3.5 border-b border-white/10 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Version</span>
                      <span className="font-mono text-slate-400">v0.9.7</span>
                    </div>
                    <div className="p-3.5 border-b border-white/10 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Commit</span>
                      <span className="font-mono text-slate-400">31dc4a3</span>
                    </div>
                    <div className="p-3.5 border-b border-white/10 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Branch</span>
                      <span className="font-mono text-slate-400">main</span>
                    </div>
                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Built</span>
                      <span className="font-mono text-slate-400">2026-07-23 15:49:19 UTC</span>
                    </div>
                  </div>

                  {/* Help text */}
                  <p className="text-[11px] text-slate-400 px-1 pt-1 leading-relaxed">
                    Copy this block when opening a support issue so maintainers can identify the exact build you're running.
                  </p>

                  {/* Copy diagnostics Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleCopyDiagnostics}
                      className="px-4 py-2 rounded-xl bg-[#1e1e1e] hover:bg-[#252525] border border-white/10 text-xs font-semibold text-white transition flex items-center gap-2"
                    >
                      {diagnosticsCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{diagnosticsCopied ? "Copied!" : "Copy diagnostics"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
