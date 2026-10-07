"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Cpu,
  MessageSquare,
  Mic,
  Palette,
  Shield,
  Search,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Sliders,
  Server,
  Zap,
  RefreshCw,
  Trash2,
  Eye,
  Plus,
  Volume2,
  Lock,
} from "lucide-react";
import ProviderKeyDrawer, { ProviderItem } from "./ProviderKeyDrawer";
import { useAppStore } from "@cheapchats/frontend/lib/store";

export type SettingsTab =
  | "providers"
  | "chat"
  | "speech"
  | "appearance"
  | "privacy";

export default function SettingsPage() {
  const router = useRouter();
  const {
    isIncognito,
    setIncognito,
    isSttEnabled,
    toggleSttEnabled,
    isTtsEnabled,
    toggleTtsEnabled,
    sttLang,
    setSttLang,
    ttsVoice,
    setTtsVoice,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("providers");
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userKeys, setUserKeys] = useState<Record<string, string>>({});
  const [selectedProviderForDrawer, setSelectedProviderForDrawer] =
    useState<ProviderItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Chat settings state
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful, brilliant AI assistant."
  );
  const [streamResponse, setStreamResponse] = useState(true);
  const [autoOpenArtifacts, setAutoOpenArtifacts] = useState(true);

  // Load configured keys from localStorage
  const loadUserKeys = () => {
    try {
      const raw = localStorage.getItem("cheapchats_provider_keys");
      if (raw) {
        setUserKeys(JSON.parse(raw));
      }
    } catch {}
  };

  // Fetch providers from CheapRouter Provider Engine endpoint
  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cheapchats/providers");
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (e) {
      console.error("Failed to load providers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    loadUserKeys();
  }, []);

  const handleKeySaved = (providerId: string, hasKey: boolean) => {
    loadUserKeys();
  };

  const openDrawerForProvider = (p: ProviderItem) => {
    setSelectedProviderForDrawer(p);
    setIsDrawerOpen(true);
  };

  // Filtered providers based on search
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    const q = searchQuery.toLowerCase();
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.baseUrl?.toLowerCase().includes(q) ||
        p.models?.some((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))
    );
  }, [providers, searchQuery]);

  const configuredCount = useMemo(() => {
    let count = 0;
    for (const p of providers) {
      if (userKeys[p.id] || userKeys[p.name.toLowerCase()]) {
        count++;
      }
    }
    return count;
  }, [providers, userKeys]);

  const totalModelsCount = useMemo(() => {
    return providers.reduce((acc, p) => acc + (p.models?.length || 0), 0);
  }, [providers]);

  return (
    <div className="flex h-screen w-screen bg-[#0d0709] text-slate-100 overflow-hidden font-sans">
      {/* ──────────────── Left Sidebar ──────────────── */}
      <aside className="w-64 md:w-72 bg-[#12080b] border-r border-red-500/15 flex flex-col h-full flex-shrink-0 select-none">
        {/* Top Header */}
        <div className="p-5 border-b border-red-500/15">
          <button
            onClick={() => router.push("/chats")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 transition mb-3 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Chat
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Sliders className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">Settings</h1>
              <p className="text-[11px] text-slate-400">CheapChats Control Center</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab("providers")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              activeTab === "providers"
                ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-red-400" />
              <span>Providers & API Keys</span>
            </div>
            {configuredCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/30 text-red-200 border border-red-500/40">
                {configuredCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              activeTab === "chat"
                ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-rose-400" />
            <span>Chat Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab("speech")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              activeTab === "speech"
                ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Mic className="w-4 h-4 text-amber-400" />
            <span>Speech & Audio</span>
          </button>

          <button
            onClick={() => setActiveTab("appearance")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              activeTab === "appearance"
                ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Palette className="w-4 h-4 text-purple-400" />
            <span>Appearance</span>
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              activeTab === "privacy"
                ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Privacy & Storage</span>
          </button>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-red-500/10 text-[11px] text-slate-500">
          <p className="font-semibold text-slate-400">CheapChats 2.0</p>
          <p className="mt-0.5">Powered by CheapRouter Engine</p>
        </div>
      </aside>

      {/* ──────────────── Main Center Content ──────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d0709] relative">
        {/* Scrollable Center Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 max-w-6xl w-full mx-auto space-y-8">
          {/* TAB 1: PROVIDERS & API KEYS (GRID VIEW) */}
          {activeTab === "providers" && (
            <div className="space-y-6">
              {/* Header Title & Subtitle */}
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-red-500" />
                  AI Providers & API Keys
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Connect your own API keys (BYOK) for any AI provider. Click any card to enter and test keys in the right drawer.
                </p>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/20 to-black/40 border border-red-500/20 shadow-md">
                  <div className="text-[11px] font-semibold text-slate-400">Available Providers</div>
                  <div className="text-2xl font-bold text-white mt-1">{providers.length}</div>
                  <div className="text-[10px] text-red-400/80 mt-1">Syncing from CheapRouter Engine</div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/20 to-black/40 border border-emerald-500/20 shadow-md">
                  <div className="text-[11px] font-semibold text-slate-400">Configured BYOK Keys</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{configuredCount}</div>
                  <div className="text-[10px] text-emerald-400/80 mt-1">Stored securely in your browser</div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/20 to-black/40 border border-rose-500/20 shadow-md">
                  <div className="text-[11px] font-semibold text-slate-400">Supported Models</div>
                  <div className="text-2xl font-bold text-rose-300 mt-1">{totalModelsCount}</div>
                  <div className="text-[10px] text-rose-400/80 mt-1">Ready for zero-latency chats</div>
                </div>
              </div>

              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search provider or model..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-red-500/20 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 text-xs text-white placeholder-slate-500 outline-none transition"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={fetchProviders}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition"
                    title="Refresh providers list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Providers Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-40 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredProviders.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <Cpu className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No providers found</p>
                  <p className="text-xs text-slate-500">
                    Try adjusting your search query or verify admin settings.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProviders.map((provider) => {
                    const hasKey = !!(
                      userKeys[provider.id] ||
                      userKeys[provider.name.toLowerCase()]
                    );

                    return (
                      <div
                        key={provider.id}
                        onClick={() => openDrawerForProvider(provider)}
                        className={`group relative p-5 rounded-2xl bg-gradient-to-b from-[#180a0f] to-[#110709] border transition-all duration-200 cursor-pointer shadow-lg hover:-translate-y-1 hover:shadow-red-600/10 ${
                          hasKey
                            ? "border-emerald-500/30 hover:border-emerald-500/60"
                            : "border-red-500/20 hover:border-red-500/50"
                        }`}
                      >
                        {/* Top Indicator Accent */}
                        <div
                          className={`absolute top-0 left-6 right-6 h-0.5 rounded-full transition ${
                            hasKey ? "bg-emerald-500/70" : "bg-red-500/30 group-hover:bg-red-500/60"
                          }`}
                        />

                        {/* Top Card Row: Icon + Name + Badge */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center p-2 group-hover:scale-105 transition-transform flex-shrink-0">
                              <img
                                src={provider.icon}
                                alt={provider.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.currentTarget as any).src =
                                    "https://api.iconify.design/lucide:server.svg";
                                }}
                              />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white group-hover:text-red-300 transition">
                                {provider.name}
                              </h3>
                              <p className="text-[11px] text-slate-400">
                                {provider.models?.length || 0} models catalog
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {hasKey ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-sm">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Key Saved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-400 border border-white/10 group-hover:text-red-300 group-hover:border-red-500/30 transition">
                              <Plus className="w-3 h-3" />
                              Add Key
                            </span>
                          )}
                        </div>

                        {/* Middle: Endpoint preview */}
                        <div className="my-3">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                            Endpoint
                          </p>
                          <p className="text-[11px] font-mono text-slate-300 truncate mt-0.5">
                            {provider.baseUrl || "Standard Cloud Gateway"}
                          </p>
                        </div>

                        {/* Bottom Action Footer */}
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition">
                            {hasKey ? "Click to manage key" : "Click to enter key"}
                          </span>
                          <span className="text-red-400 font-semibold group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHAT PREFERENCES */}
          {activeTab === "chat" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-red-500" />
                  Chat Preferences
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust default conversation settings, creativity temperature, and code execution.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#180a0f] to-[#110709] border border-red-500/20 space-y-5">
                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-200">
                      Creativity & Temperature ({temperature})
                    </label>
                    <span className="text-slate-400 text-[11px]">
                      {temperature < 0.4 ? "Precise & Deterministic" : temperature > 0.8 ? "Highly Creative" : "Balanced"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.2"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>

                {/* System Prompt */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200">
                    Default System Prompt
                  </label>
                  <textarea
                    rows={4}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/40 border border-red-500/20 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500/60 transition"
                  />
                </div>

                {/* Streaming Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Stream Token Responses</p>
                    <p className="text-[11px] text-slate-400">Stream words in real-time as they generate.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={streamResponse}
                    onChange={(e) => setStreamResponse(e.target.checked)}
                    className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                  />
                </div>

                {/* Auto open artifacts */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Auto-Open Code & Artifacts</p>
                    <p className="text-[11px] text-slate-400">Automatically open code previews in the right inspector panel.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoOpenArtifacts}
                    onChange={(e) => setAutoOpenArtifacts(e.target.checked)}
                    className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPEECH & AUDIO */}
          {activeTab === "speech" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Mic className="w-5 h-5 text-amber-500" />
                  Speech & Voice Configuration
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure speech recognition input and text-to-speech audio playback.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#180a0f] to-[#110709] border border-red-500/20 space-y-5">
                {/* Speech to Text Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Speech-to-Text Microphone</p>
                    <p className="text-[11px] text-slate-400">Speak prompts directly into the chat input.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSttEnabled}
                    onChange={toggleSttEnabled}
                    className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                  />
                </div>

                {/* STT Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Recognition Language</label>
                  <select
                    value={sttLang}
                    onChange={(e) => setSttLang(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-red-500/20 text-xs text-white outline-none"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="ur-PK">Urdu (Pakistan)</option>
                    <option value="hi-IN">Hindi (India)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="zh-CN">Chinese (Mandarin)</option>
                    <option value="ar-SA">Arabic</option>
                  </select>
                </div>

                {/* TTS Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Text-to-Speech Playback</p>
                    <p className="text-[11px] text-slate-400">Listen to model responses spoken out loud.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isTtsEnabled}
                    onChange={toggleTtsEnabled}
                    className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                  />
                </div>

                {/* Voice Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">AI Voice</label>
                  <select
                    value={ttsVoice}
                    onChange={(e) => setTtsVoice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-red-500/20 text-xs text-white outline-none"
                  >
                    <option value="natural-female">Natural Female (Alloy style)</option>
                    <option value="natural-male">Natural Male (Echo style)</option>
                    <option value="warm-female">Warm Female (Nova style)</option>
                    <option value="deep-male">Deep Male (Onyx style)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  Appearance & Design
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Tailored high-contrast dark aesthetic with glowing accents.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#180a0f] to-[#110709] border border-red-500/20 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200">Theme Preset</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 text-xs font-semibold text-red-200 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      Cyber Crimson (Default)
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-slate-400 flex items-center gap-2 opacity-60 cursor-not-allowed">
                      <span className="w-3 h-3 rounded-full bg-slate-600" />
                      Obsidian Minimal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY & DATA */}
          {activeTab === "privacy" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  Privacy & Local Storage
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Control conversation history, incognito mode, and local keys.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#180a0f] to-[#110709] border border-red-500/20 space-y-5">
                {/* Incognito mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Incognito Mode</p>
                    <p className="text-[11px] text-slate-400">
                      When active, chats are temporary and not saved to the database.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isIncognito}
                    onChange={(e) => setIncognito(e.target.checked)}
                    className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                  />
                </div>

                {/* Clear local keys */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Clear Saved API Keys</p>
                    <p className="text-[11px] text-slate-400">
                      Remove all stored BYOK provider keys from this browser.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to remove all saved API keys?")) {
                        localStorage.removeItem("cheapchats_provider_keys");
                        setUserKeys({});
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-950/40 text-xs font-medium transition"
                  >
                    Clear Keys
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ──────────────── Right Drawer (Bottom Sheet) for Provider Key ──────────────── */}
      <ProviderKeyDrawer
        provider={selectedProviderForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onKeySaved={handleKeySaved}
      />
    </div>
  );
}
