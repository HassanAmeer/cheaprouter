"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "./SettingsPage.module.css";
import {
  ArrowLeft,
  Cpu,
  MessageSquare,
  Mic,
  Volume2,
  Play,
  Search,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Plus,
  Sparkles,
  Layers,
  RotateCcw,
  Check,
  Zap,
  Info,
  AlertTriangle,
  Pencil,
  Trash2,
  Server,
  ChevronDown,
  UserRound,
  Mail,
  BadgeCheck,
} from "lucide-react";
import ProviderKeyDrawer, { ProviderItem } from "./ProviderKeyDrawer";
import CustomProviderDialog from "./CustomProviderDialog";
import {
  CustomProvider,
  readCustomProviders,
  writeCustomProviders,
} from "@cheapchats/frontend/lib/customProviders";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import { useAuth } from "@/components/auth-provider";
import { playResponseCompletionSound } from "@cheapchats/frontend/lib/responseCompletionSound";
import { BRAND_CONFIG } from "@cheapchats/frontend/lib/brandConfig";
import {
  SettingsAccountSkeleton,
  SettingsStatsSkeleton,
  SettingsProviderGridSkeleton,
} from "@cheapchats/frontend/components/Common/SkeletonLoader";

export type SettingsTab =
  | "account"
  | "providers"
  | "chat"
  | "speech";

export default function SettingsPage() {
  const router = useRouter();
  const { user: accountUser, loading: isAccountLoading } = useAuth();
  const {
    isSttEnabled,
    toggleSttEnabled,
    isTtsEnabled,
    toggleTtsEnabled,
    sttLang,
    setSttLang,
    ttsVoice,
    setTtsVoice,
    chatPreferences,
    setChatPreferences,
    rollingWindowLimit,
    setRollingWindowLimit,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("providers");
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userKeys, setUserKeys] = useState<Record<string, string>>({});
  const [customEndpoints, setCustomEndpoints] = useState<CustomProvider[]>([]);
  const [isCustomProviderDialogOpen, setIsCustomProviderDialogOpen] = useState(false);
  const [editingCustomProvider, setEditingCustomProvider] = useState<CustomProvider | null>(null);
  const [isCustomExpanded, setIsCustomExpanded] = useState(true);
  const [selectedProviderForDrawer, setSelectedProviderForDrawer] =
    useState<ProviderItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechSupport, setSpeechSupport] = useState({ recognition: false, synthesis: false });

  const [customContextInput, setCustomContextInput] = useState("");
  const [showCustomContext, setShowCustomContext] = useState(false);

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
    setCustomEndpoints(readCustomProviders());
    const loadSpeechCapabilities = () => {
      const synthesisAvailable = "speechSynthesis" in window;
      setSpeechSupport({
        recognition: "SpeechRecognition" in window || "webkitSpeechRecognition" in window,
        synthesis: synthesisAvailable,
      });
      if (synthesisAvailable) {
        setBrowserVoices(window.speechSynthesis.getVoices());
      }
    };
    loadSpeechCapabilities();
    window.speechSynthesis?.addEventListener?.("voiceschanged", loadSpeechCapabilities);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", loadSpeechCapabilities);
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

  const filteredCustomEndpoints = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return customEndpoints;
    return customEndpoints.filter((provider) =>
      [provider.name, provider.baseUrl, ...provider.models.map((model) => model.id)]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [customEndpoints, searchQuery]);

  const configuredCount = useMemo(() => {
    let count = 0;
    for (const p of providers) {
      if (userKeys[p.id] || userKeys[p.name.toLowerCase()]) {
        count++;
      }
    }
    count += customEndpoints.filter((provider) => userKeys[provider.id]).length;
    return count;
  }, [providers, customEndpoints, userKeys]);

  const customProviderCount = useMemo(
    () => customEndpoints.length,
    [customEndpoints]
  );

  const handleCustomProvidersSaved = (nextProviders: CustomProvider[]) => {
    setCustomEndpoints(nextProviders);
    loadUserKeys();
  };

  const removeCustomProvider = (provider: CustomProvider) => {
    if (!window.confirm(`Remove ${provider.name} from this browser? Its saved API key will also be removed.`)) return;
    const nextProviders = customEndpoints.filter((item) => item.id !== provider.id);
    try {
      writeCustomProviders(nextProviders);
      const rawKeys = localStorage.getItem("cheapchats_provider_keys");
      const keys = rawKeys ? JSON.parse(rawKeys) : {};
      delete keys[provider.id];
      localStorage.setItem("cheapchats_provider_keys", JSON.stringify(keys));
      handleCustomProvidersSaved(nextProviders);
    } catch (error) {
      console.error("Failed to remove custom provider:", error);
      window.alert("Could not remove this provider from browser storage.");
    }
  };

  const renderProviderCards = (providerList: ProviderItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {providerList.map((provider) => {
        const hasKey = !!(
          userKeys[provider.id] ||
          userKeys[provider.name.toLowerCase()]
        );

        return (
          <div
            key={provider.id}
            onClick={() => openDrawerForProvider(provider)}
            className={`group relative cursor-pointer rounded-2xl border bg-gradient-to-br from-[#242831] via-[#191c22] to-[#111419] p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-black/40 ${
              hasKey
                ? "border-emerald-500/30 hover:border-emerald-500/50"
                : "border-white/10 hover:border-rose-300/30"
            }`}
          >
            <div
              className={`absolute top-0 left-6 right-6 h-0.5 rounded-full transition ${
                hasKey ? "bg-emerald-500/70" : "bg-gradient-to-r from-rose-300/55 via-slate-300/25 to-white/10 group-hover:from-rose-300/80"
              }`}
            />
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-slate-300/10 to-black/50 p-2 transition-transform group-hover:scale-105">
                  <img
                    src={provider.icon}
                    alt={provider.name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "https://api.iconify.design/lucide:server.svg";
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white transition group-hover:text-slate-200">
                    {provider.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {provider.models?.length || 0} models catalog
                  </p>
                </div>
              </div>
              {hasKey ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 shadow-sm">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Key Saved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 transition group-hover:border-white/20 group-hover:text-slate-200">
                  <Plus className="h-3 w-3" />
                  Add Key
                </span>
              )}
            </div>
            <div className="my-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Endpoint
              </p>
              <p className="mt-0.5 truncate font-mono text-[11px] text-slate-300">
                {provider.baseUrl || "Standard Cloud Gateway"}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs">
              <span className="text-[11px] text-slate-400 transition group-hover:text-slate-200">
                {hasKey ? "Click to manage key" : "Click to enter key"}
              </span>
              <span className="font-semibold text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-rose-200">
                →
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`${styles.settingsRoot} flex h-screen w-screen overflow-hidden bg-[#0b0d10] font-sans text-slate-100`}>
      {/* ──────────────── Left Sidebar ──────────────── */}
      <aside className="flex h-full w-[3.25rem] flex-shrink-0 select-none flex-col border-r border-white/10 bg-gradient-to-b from-[#171a20] via-[#12151a] to-[#0e1014] sm:w-64 md:w-72">
        {/* Top Header */}
        <div className="border-b border-white/10 px-0 py-1.5 sm:p-5">
          <div className="flex items-center justify-center gap-2.5 sm:justify-start">
            <button
              type="button"
              onClick={() => router.push("/chats")}
              aria-label="Back to Chat"
              title="Back to Chat"
              className="group flex h-8 w-full flex-shrink-0 items-center justify-center rounded-[5px] border border-red-500/35 bg-gradient-to-br from-red-500/30 via-red-950/80 to-[#1a0c0f] text-rose-300 shadow-lg shadow-red-950/40 transition hover:border-red-400/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700/60 sm:w-8"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div className="hidden min-w-0 sm:block">
              <h1 className="text-sm font-bold text-white tracking-tight">Settings</h1>
              <p className="text-[11px] text-slate-400">{BRAND_CONFIG.cheapChatsTitle}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab("account")}
            title="Account"
            aria-label="Account"
            className={`w-full flex items-center justify-center sm:justify-start gap-2.5 px-0 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-medium transition ${
              activeTab === "account"
                ? "bg-gradient-to-r from-rose-400/[0.09] via-white/[0.06] to-transparent text-white border border-rose-300/20 shadow-sm shadow-black/20"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <UserRound className="w-4 h-4 text-rose-300" />
            <span className="hidden sm:inline">Account</span>
          </button>

          <button
            onClick={() => setActiveTab("providers")}
            title="Providers & API Keys"
            aria-label="Providers & API Keys"
            className={`w-full flex items-center justify-center sm:justify-between px-0 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-medium transition ${
              activeTab === "providers"
                ? "bg-gradient-to-r from-rose-400/[0.09] via-white/[0.06] to-transparent text-white border border-rose-300/20 shadow-sm shadow-black/20"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-rose-300" />
              <span className="hidden sm:inline">Providers & API Keys</span>
            </div>
            {loading ? (
              <span className="hidden sm:inline w-5 h-4 rounded-full shimmer-effect opacity-50" />
            ) : configuredCount > 0 ? (
              <span className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-slate-200 border border-white/15">
                {configuredCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            title="Chat Settings"
            aria-label="Chat Settings"
            className={`w-full flex items-center justify-center sm:justify-start gap-2.5 px-0 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-medium transition ${
              activeTab === "chat"
                ? "bg-gradient-to-r from-rose-400/[0.09] via-white/[0.06] to-transparent text-white border border-rose-300/20 shadow-sm shadow-black/20"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Chat Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("speech")}
            title="Speech & Audio"
            aria-label="Speech & Audio"
            className={`w-full flex items-center justify-center sm:justify-start gap-2.5 px-0 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-medium transition ${
              activeTab === "speech"
                ? "bg-gradient-to-r from-rose-400/[0.09] via-white/[0.06] to-transparent text-white border border-rose-300/20 shadow-sm shadow-black/20"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Mic className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Speech & Audio</span>
          </button>



        </nav>

        {/* Footer info */}
        <div className="hidden border-t border-white/10 p-4 text-[11px] text-slate-500 sm:block">
          <p className="font-semibold text-slate-400">{BRAND_CONFIG.cheapChatsName} {BRAND_CONFIG.cheapChatsVersion}</p>
          <p className="mt-0.5">{BRAND_CONFIG.cheapRouterTagline}</p>
        </div>
      </aside>

      {/* ──────────────── Main Center Content ──────────────── */}
      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(148,163,184,0.08),transparent_45%),#0b0d10]">
        {/* Scrollable Center Body */}
        <div className="mx-auto w-full max-w-6xl flex-1 space-y-7 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {activeTab === "account" && (
            <section className="mx-auto w-full max-w-3xl space-y-6">
              <header>
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
                  <UserRound className="h-5 w-5 text-rose-300" />
                  Account
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Your {BRAND_CONFIG.cheapRouterName} profile and plan details.
                </p>
              </header>

              {isAccountLoading ? (
                <SettingsAccountSkeleton />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#202126] via-[#191a1e] to-[#17181c] shadow-xl shadow-black/20">
                  <div className="flex items-center gap-4 border-b border-white/[0.07] p-5 sm:p-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-red-800/70 bg-gradient-to-br from-[#50141d] via-[#321016] to-[#1c0d11] text-lg font-semibold text-rose-100 shadow-[0_4px_18px_rgba(75,8,16,0.28)]">
                      {accountUser?.profile_picture ? (
                        <img
                          src={accountUser.profile_picture}
                          alt={`${accountUser.name} profile`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (accountUser?.name || "Demo User")
                          .split(/\s+/)
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold tracking-tight text-white">
                          {accountUser?.name || "Demo User"}
                        </h3>
                        {!accountUser && (
                          <span className="rounded-full border border-rose-300/15 bg-rose-300/[0.07] px-2 py-0.5 text-[10px] font-medium text-rose-200/75">
                            Sample profile
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {accountUser?.email || "demo@cheaprouter.ai"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
                    <div className="bg-[#191a1e] p-4 sm:p-5">
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                        <Mail className="h-3.5 w-3.5 text-rose-300/80" />
                        Email address
                      </div>
                      <p className="mt-2 break-all text-sm text-slate-100">
                        {accountUser?.email || "demo@cheaprouter.ai"}
                      </p>
                    </div>
                    <div className="bg-[#191a1e] p-4 sm:p-5">
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                        <BadgeCheck className="h-3.5 w-3.5 text-rose-300/80" />
                        Current plan
                      </div>
                      <p className="mt-2 text-sm capitalize text-slate-100">
                        {accountUser?.plan || "Free"}
                      </p>
                    </div>
                  </div>
                  {!accountUser && (
                    <p className="border-t border-white/[0.07] px-5 py-3 text-[11px] text-slate-500">
                      These sample details are placeholders until you log in.
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* TAB 1: PROVIDERS & API KEYS (GRID VIEW) */}
          {activeTab === "providers" && (
            <div className="space-y-6">
              {/* Header Title & Subtitle */}
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-rose-300" />
                  AI Providers & API Keys
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Connect your own API keys (BYOK) for any AI provider. Click any card to enter and test keys in the right drawer.
                </p>
              </div>

              {/* Statistics Row */}
              {loading ? (
                <SettingsStatsSkeleton />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-rose-300/[0.09] via-slate-500/[0.06] to-[#111419] p-4 shadow-lg shadow-black/20">
                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-rose-300/70 via-slate-200/30 to-transparent" />
                    <div className="text-[11px] font-semibold text-slate-400">Total Providers</div>
                    <div className="text-2xl font-bold text-white mt-1">{providers.length + customEndpoints.length}</div>
                    <div className="text-[10px] text-rose-200/70 mt-1">Provider Engine &amp; Custom Providers</div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-rose-300/15 bg-gradient-to-br from-rose-300/[0.08] via-slate-500/[0.06] to-[#111419] p-4 shadow-lg shadow-black/20">
                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-rose-300/50 via-slate-200/20 to-transparent" />
                    <div className="text-[11px] font-semibold text-slate-400">Custom Connected Providers</div>
                    <div className="mt-1 text-2xl font-bold text-slate-100">{customEndpoints.length}</div>
                    <div className="mt-1 text-[10px] text-rose-200/70">Custom endpoints &amp; Ollama APIs</div>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-400/[0.09] via-slate-700/[0.08] to-[#111419] p-4 shadow-lg shadow-black/20">
                    <div className="text-[11px] font-semibold text-slate-400">BYOK Configured Providers</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">{configuredCount}</div>
                    <div className="text-[10px] text-emerald-400/80 mt-1">Active user API keys saved</div>
                  </div>
                </div>
              )}

              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search provider or model..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] py-2 pl-9 pr-4 text-xs text-white outline-none transition-colors placeholder:text-slate-500 focus:border-red-900/55 focus:ring-0"
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
                <SettingsProviderGridSkeleton count={6} />
              ) : filteredProviders.length === 0 && filteredCustomEndpoints.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <Cpu className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No providers found</p>
                  <p className="text-xs text-slate-500">
                    Try adjusting your search query or verify admin settings.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-300/15 bg-white/[0.02] p-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsCustomExpanded(!isCustomExpanded)}
                          className="flex items-center gap-2 text-sm font-semibold text-white hover:text-rose-200 transition cursor-pointer"
                        >
                          <ChevronDown
                            className={`h-4 w-4 text-rose-300 transition-transform duration-200 ${
                              isCustomExpanded ? "rotate-0" : "-rotate-90"
                            }`}
                          />
                          <span>Custom Providers</span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                            {customEndpoints.length}
                          </span>
                        </button>
                        <p className="hidden md:inline text-[11px] text-slate-400">
                          Add custom endpoints, local Ollama, vLLM or OpenAI-compatible APIs
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCustomProvider(null);
                          setIsCustomProviderDialogOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300/20 bg-rose-300/[0.07] px-3 py-2 text-xs font-medium text-rose-100 transition hover:border-rose-300/35 hover:bg-rose-300/[0.12] cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add custom provider
                      </button>
                    </div>

                    {isCustomExpanded && (
                      filteredCustomEndpoints.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {filteredCustomEndpoints.map((provider) => {
                            const hasKey = Boolean(userKeys[provider.id]);
                            return (
                              <article
                                key={provider.id}
                                className="relative rounded-2xl border border-rose-300/15 bg-gradient-to-br from-[#29252b] via-[#191c22] to-[#111419] p-5 shadow-lg shadow-black/20"
                              >
                                <div className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-gradient-to-r from-rose-300/60 via-slate-300/25 to-transparent" />
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200/15 bg-rose-200/[0.06] text-rose-200">
                                      <Server className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0">
                                      <h4 className="truncate text-sm font-bold text-white">{provider.name}</h4>
                                      <p className="text-[11px] text-slate-400">{provider.models.length} models</p>
                                    </div>
                                  </div>
                                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${hasKey ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-slate-400"}`}>
                                    {hasKey ? "Key saved" : "No key"}
                                  </span>
                                </div>
                                <p className="mt-4 truncate font-mono text-[11px] text-slate-400" title={provider.baseUrl}>
                                  {provider.baseUrl}
                                </p>
                                <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCustomProvider(provider);
                                      setIsCustomProviderDialogOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-slate-300 transition hover:bg-white/5 hover:text-white cursor-pointer"
                                  >
                                    <Pencil className="h-3 w-3" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeCustomProvider(provider)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-slate-400 transition hover:border-red-400/25 hover:bg-red-400/[0.06] hover:text-red-200 cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Remove
                                  </button>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCustomProvider(null);
                            setIsCustomProviderDialogOpen(true);
                          }}
                          className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] text-center transition hover:border-rose-300/30 hover:bg-rose-300/[0.03] cursor-pointer"
                        >
                          <Plus className="h-5 w-5 text-rose-200" />
                          <span className="text-xs font-medium text-slate-200">
                            {customEndpoints.length ? "No custom providers match your search" : "Add your first custom provider"}
                          </span>
                          <span className="text-[11px] text-slate-500">API URL, optional key and model IDs</span>
                        </button>
                      )
                    )}
                  </section>
                  {filteredProviders.length > 0 && (
                    <section className="space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200">Provider Engine Providers</h3>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Pre-configured providers from {BRAND_CONFIG.cheapRouterName} engine. Click to connect your BYOK API keys.
                        </p>
                      </div>
                      {renderProviderCards(filteredProviders)}
                    </section>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHAT PREFERENCES */}
          {activeTab === "chat" && (
            <div className="space-y-6 max-w-3xl">
              {/* Header with Title and Auto-saved status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-rose-300" />
                    Chat Settings
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure model intelligence, temperature, context window limit, and conversation defaults.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved to Browser</span>
                  </div>

                  <button
                    onClick={() => {
                      setChatPreferences({
                        temperature: 0.7,
                        contextWindow: "128k",
                        systemPrompt: "You are a helpful, brilliant AI assistant.",
                        streamResponse: true,
                        autoOpenArtifacts: true,
                        rollingWindowLimit: 20,
                      });
                      setRollingWindowLimit(20);
                    }}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
                    title="Reset all preferences to default"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Defaults
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#20242c] via-[#171a20] to-[#111419] p-6 shadow-xl shadow-black/25 space-y-7">
                {/* 1. TEMPERATURE & CREATIVITY */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Model Temperature & Creativity</span>
                      <span className="font-mono text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md text-[11px]">
                        {chatPreferences.temperature.toFixed(2)}
                      </span>
                    </label>
                    <span className="text-slate-400 text-[11px]">
                      {chatPreferences.temperature <= 0.35
                        ? "Precise & Deterministic (Code / Math)"
                        : chatPreferences.temperature >= 0.85
                        ? "Highly Creative (Ideas / Roleplay)"
                        : "Balanced (General Reasoning)"}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={chatPreferences.temperature}
                    onChange={(e) =>
                      setChatPreferences({ temperature: parseFloat(e.target.value) })
                    }
                    className="w-full accent-rose-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                  />

                  {/* Temperature Quick Presets */}
                  <div className="flex items-center gap-2 pt-1">
                    {[
                      { label: "Precise", val: 0.2, desc: "0.20 (Factual)" },
                      { label: "Balanced", val: 0.7, desc: "0.70 (Standard)" },
                      { label: "Creative", val: 1.0, desc: "1.00 (Expressive)" },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        onClick={() => setChatPreferences({ temperature: preset.val })}
                        className={`text-[11px] px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                          Math.abs(chatPreferences.temperature - preset.val) < 0.04
                            ? "bg-rose-500/20 border-rose-500/50 text-rose-200 font-semibold shadow-xs"
                            : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        <span>{preset.label}</span>
                        <span className="text-[10px] opacity-70">({preset.val})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. CONTEXT WINDOW (CRITICAL: Default 128k, configurable to 64k, 512k, 1M, etc.) */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-400" />
                      <span>Context Window Limit</span>
                      <span className="font-mono text-sky-300 bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 rounded-md text-[11px] uppercase">
                        {chatPreferences.contextWindow}
                      </span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Default: <span className="text-emerald-400 font-semibold">128k</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Determines how many tokens of conversation context and attachments are sent to the AI.
                    Select from optimized presets or enter a custom limit.
                  </p>

                  {/* Context Window Preset Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "64k", title: "64k", label: "64,000 Tokens", badge: "Compact" },
                      { id: "128k", title: "128k", label: "128,000 Tokens", badge: "Default", isDefault: true },
                      { id: "512k", title: "512k", label: "512,000 Tokens", badge: "Extended" },
                      { id: "1m", title: "1M", label: "1,000,000 Tokens", badge: "Ultra" },
                    ].map((opt) => {
                      const isSelected = chatPreferences.contextWindow?.toLowerCase() === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setChatPreferences({ contextWindow: opt.id as any });
                            setShowCustomContext(false);
                          }}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between relative ${
                            isSelected
                              ? "bg-sky-500/15 border-sky-500/50 text-white shadow-md shadow-sky-950/30"
                              : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.07] hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold tracking-tight">{opt.title}</span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md uppercase ${
                                opt.isDefault
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-white/10 text-slate-400"
                              }`}
                            >
                              {opt.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 font-mono">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Context Window Toggle & Input */}
                  <div className="pt-1">
                    {!showCustomContext ? (
                      <button
                        onClick={() => setShowCustomContext(true)}
                        className="text-[11px] text-slate-400 hover:text-sky-300 underline underline-offset-4 cursor-pointer"
                      >
                        + Set custom context window (e.g. 256k, 2M)
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10 mt-2">
                        <input
                          type="text"
                          placeholder="e.g. 256k, 32k, 2M"
                          value={customContextInput}
                          onChange={(e) => setCustomContextInput(e.target.value)}
                          className="flex-1 bg-transparent px-2 text-xs text-white placeholder-slate-500 outline-none font-mono"
                        />
                        <button
                          onClick={() => {
                            if (customContextInput.trim()) {
                              setChatPreferences({ contextWindow: customContextInput.trim().toLowerCase() });
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 text-xs font-semibold cursor-pointer"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => setShowCustomContext(false)}
                          className="px-2 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. MESSAGE MEMORY & RETENTION (DEFAULT: 20 MESSAGES, RANGE: 5+, WARNING IF > 50) */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-100 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span>Message Memory & History Retention</span>
                      <span className="font-mono text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md text-[11px]">
                        {rollingWindowLimit || 20} messages
                      </span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Default: <span className="text-emerald-400 font-semibold">20 messages</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Specifies how many previous messages the model remembers in the conversation.
                    Adjust from 5 messages up to any custom limit.
                  </p>

                  {/* Slider and direct numeric input */}
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="1"
                      value={rollingWindowLimit || 20}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 5;
                        setRollingWindowLimit(val);
                        setChatPreferences({ rollingWindowLimit: val });
                      }}
                      className="flex-1 accent-emerald-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                    />

                    <div className="flex items-center gap-1.5 shrink-0 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={rollingWindowLimit || 20}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setRollingWindowLimit(val);
                          setChatPreferences({ rollingWindowLimit: val });
                        }}
                        className="w-12 bg-transparent text-xs font-mono font-bold text-emerald-300 text-center outline-none"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">msgs</span>
                    </div>
                  </div>

                  {/* Presets (5, 10, 20 [Default], 30, 40, 50) */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {[
                      { val: 5, label: "5 msgs" },
                      { val: 10, label: "10 msgs" },
                      { val: 20, label: "20 msgs", isDefault: true },
                      { val: 30, label: "30 msgs" },
                      { val: 40, label: "40 msgs" },
                      { val: 50, label: "50 msgs" },
                    ].map((opt) => {
                      const isSelected = (rollingWindowLimit || 20) === opt.val;
                      return (
                        <button
                          key={opt.val}
                          onClick={() => {
                            setRollingWindowLimit(opt.val);
                            setChatPreferences({ rollingWindowLimit: opt.val });
                          }}
                          className={`text-[11px] px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-semibold shadow-xs"
                              : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {opt.isDefault && (
                            <span className="text-[9px] px-1 py-0.2 rounded-xs bg-emerald-500/30 text-emerald-300 font-bold uppercase">
                              Default
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Warning: ONLY if > 50 messages, and strictly text without border/box/background as user requested */}
                  {(rollingWindowLimit || 20) > 50 && (
                    <p className="text-[11px] text-amber-400/90 flex items-center gap-1.5 mt-2 font-normal">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>Warning: AI can forget earlier context or lose focus with more than 50 messages in memory.</span>
                    </p>
                  )}
                </div>

                {/* 4. DEFAULT SYSTEM INSTRUCTIONS */}
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-200">
                      Default System Instructions (Prompt)
                    </label>
                    <button
                      onClick={() =>
                        setChatPreferences({
                          systemPrompt: "You are a helpful, brilliant AI assistant.",
                        })
                      }
                      className="text-[10px] text-slate-400 hover:text-rose-300 cursor-pointer"
                    >
                      Reset prompt
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={chatPreferences.systemPrompt}
                    onChange={(e) =>
                      setChatPreferences({ systemPrompt: e.target.value })
                    }
                    placeholder="Enter instructions for how the model should behave across all chats..."
                    className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-rose-400/40 font-mono leading-relaxed"
                  />
                </div>

                {/* 5. TOGGLES (STREAMING, ARTIFACTS & RESPONSE SOUND) */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  {/* Streaming Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        Stream Responses (SSE)
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Stream tokens in real-time word by word as they generate.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={chatPreferences.streamResponse}
                      onChange={(e) =>
                        setChatPreferences({ streamResponse: e.target.checked })
                      }
                      className="w-4 h-4 accent-rose-400 rounded cursor-pointer"
                    />
                  </div>

                  {/* Auto Open Artifacts */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        Auto-Open Code & Artifacts
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Automatically open code previews in the inspector panel when created.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={chatPreferences.autoOpenArtifacts}
                      onChange={(e) =>
                        setChatPreferences({ autoOpenArtifacts: e.target.checked })
                      }
                      className="w-4 h-4 accent-rose-400 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-start gap-2.5">
                      <Volume2 className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">
                          Response completion sound
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Play a subtle tone for errors or responses of 1,000+ characters. This setting is saved in this browser.
                        </p>
                      </div>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          playResponseCompletionSound().catch((error) => {
                            console.error("Could not play response completion test sound:", error);
                          });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/50 bg-red-950/20 px-2.5 py-1.5 text-[11px] font-medium text-rose-200 transition hover:border-red-800 hover:bg-red-950/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800/50"
                      >
                        <Play className="h-3 w-3" />
                        Play test
                      </button>
                      <input
                        type="checkbox"
                        checked={chatPreferences.responseCompletionSound}
                        onChange={(e) =>
                          setChatPreferences({ responseCompletionSound: e.target.checked })
                        }
                        aria-label="Response completion sound"
                        className="h-4 w-4 shrink-0 cursor-pointer rounded accent-rose-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPEECH & AUDIO */}
          {activeTab === "speech" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Mic className="w-5 h-5 text-rose-300" />
                  Speech & Audio
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Uses speech recognition and voices provided by Chrome and your operating system.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#20242c] via-[#171a20] to-[#111419] p-6 shadow-lg shadow-black/20 space-y-5">
                <section className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">Speech to text</h3>
                      <p className="mt-1 text-[11px] text-slate-400">Use Chrome’s built-in speech recognition for microphone input.</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium ${speechSupport.recognition ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-200"}`}>
                      {speechSupport.recognition ? "Available" : "Not available"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-4">
                    <div>
                      <p className="text-xs font-medium text-slate-200">Microphone input</p>
                      <p className="text-[11px] text-slate-500">Enable or disable voice input in chat.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSttEnabled}
                      onChange={toggleSttEnabled}
                      disabled={!speechSupport.recognition}
                      className="h-4 w-4 cursor-pointer accent-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200" htmlFor="speech-recognition-language">
                      Voice Language & Accent Role
                    </label>
                    <select
                      id="speech-recognition-language"
                      value={sttLang}
                      onChange={(e) => setSttLang(e.target.value)}
                      disabled={!speechSupport.recognition}
                      className="w-full rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs text-white outline-none focus:border-rose-300/35 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="auto">🌐 Auto-Detect (Default: English)</option>
                      <option value="ur-roman">🇵🇰 Urdu / Roman Urdu (اردو)</option>
                      <option value="hi-IN">🇮🇳 Hindi (हिन्दी)</option>
                      <option value="en-US">🇺🇸 English (United States)</option>
                      <option value="en-GB">🇬🇧 English (United Kingdom)</option>
                      <option value="ar-SA">🇸🇦 Arabic (العربية)</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Controls speech recognition and AI voice accent. "Urdu / Roman Urdu" mode uses native phonetics so Roman Urdu and Urdu are recognized and spoken naturally.
                    </p>
                  </div>
                </section>

                <section className="space-y-4 border-t border-white/10 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                        <Volume2 className="h-4 w-4 text-rose-300" />
                        Text to speech
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-400">Read assistant responses aloud with voices installed in your browser or system.</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium ${speechSupport.synthesis ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-200"}`}>
                      {speechSupport.synthesis ? `${browserVoices.length} voices` : "Not available"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-4">
                    <div>
                      <p className="text-xs font-medium text-slate-200">Speech playback</p>
                      <p className="text-[11px] text-slate-500">Enable or disable read-aloud controls on messages.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isTtsEnabled}
                      onChange={toggleTtsEnabled}
                      disabled={!speechSupport.synthesis}
                      className="h-4 w-4 cursor-pointer accent-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200" htmlFor="speech-voice">Browser voice accent</label>
                    <select
                      id="speech-voice"
                      value={browserVoices.some((voice) => voice.voiceURI === ttsVoice) ? ttsVoice : "default"}
                      onChange={(e) => setTtsVoice(e.target.value)}
                      disabled={!speechSupport.synthesis || !isTtsEnabled || browserVoices.length === 0}
                      className="w-full rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs text-white outline-none focus:border-rose-300/35 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="default">
                        Automatic (Match Role: {sttLang === "ur-roman" ? "Urdu / Roman Urdu" : sttLang === "hi-IN" ? "Hindi" : sttLang === "ar-SA" ? "Arabic" : "English"})
                      </option>
                      {browserVoices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} · {voice.lang}{voice.default ? " · Default" : ""}
                        </option>
                      ))}
                    </select>
                    {speechSupport.synthesis && browserVoices.length === 0 && (
                      <p className="text-[11px] text-amber-200/80">Chrome has not reported any available voices yet. Check your system’s speech settings and reload this page.</p>
                    )}
                  </div>
                </section>
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
      <CustomProviderDialog
        isOpen={isCustomProviderDialogOpen}
        provider={editingCustomProvider}
        onClose={() => setIsCustomProviderDialogOpen(false)}
        onSaved={handleCustomProvidersSaved}
      />
    </div>
  );
}
