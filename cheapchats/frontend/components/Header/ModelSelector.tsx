"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  CustomProvider,
  fetchCustomProviderModels,
  getCustomProviderKey,
  readCustomProviders,
  writeCustomProviders,
} from "@cheapchats/frontend/lib/customProviders";
import { getProviderIcon } from "@cheapchats/frontend/lib/providerIcons";
import {
  ChevronDown,
  Sparkles,
  Server,
  Bot,
  Cpu,
  Zap,
  Check,
  Settings,
  Search,
  X,
  RotateCw,
  Loader2,
  Router,
} from "lucide-react";
import { ModelSelectorSkeleton } from "@cheapchats/frontend/components/Common/SkeletonLoader";

interface ModelItem {
  id: string;
  name: string;
  provider: string;
  description?: string;
  isPopular?: boolean;
}

const PROVIDER_ICONS: Record<string, any> = {
  OpenRouter: Zap,
  OpenAI: Sparkles,
  Anthropic: Cpu,
  "Google Gemini": Server,
  DeepSeek: Cpu,
  "Meta Llama": Bot,
  Mistral: Zap,
  Other: Server,
  "Custom API": Server,
  "Custom Endpoints": Server,
  Agents: Bot,
};

function ProviderIcon({
  provider,
  className = "w-3.5 h-3.5",
}: {
  provider: string;
  className?: string;
}) {
  if (provider.startsWith("custom:")) {
    return <Router className={`${className} text-red-400 flex-shrink-0`} />;
  }
  return (
    <img
      src={getProviderIcon(provider)}
      alt={provider}
      className={`${className} object-contain flex-shrink-0`}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

export default function ModelSelector() {
  const router = useRouter();
  const { selectedProvider, selectedModel, setSelectedProviderAndModel } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileProviderMenuOpen, setMobileProviderMenuOpen] = useState(false);
  const [activeHoverProvider, setActiveHoverProvider] = useState<string | null>(null);
  const [providersData, setProvidersData] = useState<Record<string, ModelItem[]>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const cached = localStorage.getItem("cheapchat_cached_models");
      const base = cached ? JSON.parse(cached) : {};
      const next = { ...(typeof base === "object" && base ? base : {}) };
      for (const provider of readCustomProviders()) {
        const key = getCustomProviderKey(provider.id);
        next[key] = provider.models.map((model) => ({
          ...model,
          provider: key,
        }));
      }
      return next;
    } catch {
      return {};
    }
  });
  const [customProviderNames, setCustomProviderNames] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const names: Record<string, string> = {};
      for (const provider of readCustomProviders()) {
        const key = getCustomProviderKey(provider.id);
        names[key] = provider.name;
        names[provider.id] = provider.name;
        names[provider.name] = provider.name;
      }
      return names;
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingCustomModels, setIsLoadingCustomModels] = useState(false);
  const [customModelsError, setCustomModelsError] = useState("");
  const [userKeys, setUserKeys] = useState<Record<string, string>>({});

  const loadKeys = () => {
    try {
      const raw = localStorage.getItem("cheapchats_provider_keys");
      if (raw) {
        setUserKeys(JSON.parse(raw));
      } else {
        setUserKeys({});
      }
    } catch {
      setUserKeys({});
    }
  };

  useEffect(() => {
    loadKeys();
    const handleStorage = () => loadKeys();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Hydrate user's chosen provider & model from localStorage on mount
  useEffect(() => {
    try {
      const savedProv = localStorage.getItem("cheapchats_selected_provider");
      const savedModel = localStorage.getItem("cheapchats_selected_model");
      if (savedProv || savedModel) {
        setSelectedProviderAndModel(
          savedProv || selectedProvider || "OpenAI",
          savedModel || selectedModel || "gpt-4o"
        );
      }
    } catch {}
  }, []);

  const mergeCustomProviders = (source: Record<string, ModelItem[]>) => {
    const next = { ...source };
    const names: Record<string, string> = {};
    for (const provider of readCustomProviders()) {
      const key = getCustomProviderKey(provider.id);
      names[key] = provider.name;
      names[provider.id] = provider.name;
      names[provider.name] = provider.name;
      next[key] = provider.models.map((model) => ({
        ...model,
        provider: key,
      }));
    }
    setCustomProviderNames((prev) => ({ ...prev, ...names }));
    return next;
  };

  const fetchModels = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);

      const res = await fetch(`/api/cheapchats/models${forceRefresh ? "?refresh=true" : ""}`);
      if (res.ok) {
        const data = await res.json();
        const pData = mergeCustomProviders(data.providers || {});
        setProvidersData(pData);
        try {
          localStorage.setItem("cheapchat_cached_models", JSON.stringify(pData));
        } catch {}

        const keys = Object.keys(pData);
        if (keys.length > 0) {
          setActiveHoverProvider((prev) => {
            if (prev && pData[prev]) return prev;
            if (selectedProvider && pData[selectedProvider]) return selectedProvider;
            return keys[0];
          });
        }
      }
    } catch (err) {
      console.error("Failed to load models:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadCustomProviderModels = async (providerKey: string) => {
    const providerId = providerKey.startsWith("custom:")
      ? providerKey.slice("custom:".length)
      : "";
    const provider = readCustomProviders().find((item) => item.id === providerId);
    if (!provider) {
      setCustomModelsError("This custom provider is no longer saved. Reopen settings and add it again.");
      return;
    }

    setIsLoadingCustomModels(true);
    setCustomModelsError("");
    try {
      let apiKey = "";
      const rawKeys = localStorage.getItem("cheapchats_provider_keys");
      if (rawKeys) {
        const keys: unknown = JSON.parse(rawKeys);
        if (keys && typeof keys === "object" && !Array.isArray(keys)) {
          const savedKey = (keys as Record<string, unknown>)[provider.id];
          if (typeof savedKey === "string") apiKey = savedKey;
        }
      }

      const models = await fetchCustomProviderModels(provider.baseUrl, apiKey);
      if (models.length === 0) {
        setCustomModelsError("The API returned no model IDs from GET /models.");
        return;
      }

      const providers: CustomProvider[] = readCustomProviders().map((item) =>
        item.id === provider.id ? { ...item, models } : item
      );
      writeCustomProviders(providers);
      setProvidersData((current) => ({
        ...current,
        [providerKey]: models.map((model) => ({ ...model, provider: providerKey })),
      }));
      setCustomModelsError("");
    } catch (error) {
      console.error(`Failed to load models for custom provider "${provider.name}":`, error);
      setCustomModelsError(
        error instanceof Error
          ? `${error.message} Check GET /models and that the API is reachable by CheapRouter.`
          : "Could not load models. Check the API URL and network access."
      );
    } finally {
      setIsLoadingCustomModels(false);
    }
  };

  useEffect(() => {
    // 1. Instant hydration from cache for 0ms load
    try {
      const cached = localStorage.getItem("cheapchat_cached_models");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          const merged = mergeCustomProviders(parsed);
          setProvidersData(merged);
          const keys = Object.keys(merged);
          if (keys.length > 0) {
            setActiveHoverProvider((prev) => prev || (selectedProvider && merged[selectedProvider] ? selectedProvider : keys[0]));
          }
        } else {
          setLoading(true);
        }
      } else {
        setLoading(true);
      }
    } catch {
      setLoading(true);
    }

    // 2. Fetch fresh in background
    fetchModels();
  }, []);

  const handleSelectModel = (provider: string, modelId: string) => {
    setSelectedProviderAndModel(provider, modelId);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("cheapchats_selected_provider", provider);
        localStorage.setItem("cheapchats_selected_model", modelId);
      }
    } catch {}
    setIsOpen(false);
  };

  const providerName = (provider: string) => {
    if (!provider) return "";
    if (customProviderNames[provider]) return customProviderNames[provider];
    if (provider.startsWith("custom:")) {
      const id = provider.slice("custom:".length);
      const found = readCustomProviders().find((p) => p.id === id || p.name === id);
      if (found) return found.name;
    }
    const foundDirect = readCustomProviders().find(
      (p) => p.name.toLowerCase() === provider.toLowerCase() || p.id === provider
    );
    if (foundDirect) return foundDirect.name;
    return provider;
  };

  const isProviderConfigured = (pKey: string) => {
    // 1. All custom providers created by the user are configured
    if (pKey.startsWith("custom:") || pKey === "Custom API") {
      return true;
    }
    const customList = readCustomProviders();
    if (
      customList.some(
        (c) =>
          getCustomProviderKey(c.id) === pKey ||
          c.name.toLowerCase() === pKey.toLowerCase() ||
          c.id.toLowerCase() === pKey.toLowerCase()
      )
    ) {
      return true;
    }
    // 2. Currently selected provider is always active and visible
    if (
      pKey === selectedProvider ||
      (selectedProvider && pKey.toLowerCase() === selectedProvider.toLowerCase()) ||
      (selectedProvider && providerName(pKey).toLowerCase() === selectedProvider.toLowerCase())
    ) {
      return true;
    }
    // 3. OpenRouter is available by default through the backend proxy
    if (pKey.toLowerCase() === "openrouter") {
      return true;
    }
    // 4. Check BYOK userKeys
    const pNorm = pKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [k, v] of Object.entries(userKeys)) {
      if (!v || typeof v !== "string" || !v.trim()) continue;
      const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (
        k === pKey ||
        k.toLowerCase() === pKey.toLowerCase() ||
        k === `ap_${pNorm}` ||
        (kNorm && pNorm && (kNorm === pNorm || pNorm.includes(kNorm) || kNorm.includes(pNorm)))
      ) {
        return true;
      }
    }
    return false;
  };

  // Only display providers that are actively connected / configured
  const allProviderKeys = Object.keys(providersData);
  const configuredProviderKeys = allProviderKeys.filter(isProviderConfigured);
  const effectiveProviderKeys = configuredProviderKeys.length > 0 ? configuredProviderKeys : allProviderKeys;
  const regularProviders = effectiveProviderKeys.filter((p) => p !== "Custom API");
  const sortedProviderKeys = effectiveProviderKeys.includes("Custom API")
    ? [...regularProviders, "Custom API"]
    : regularProviders;

  useEffect(() => {
    if (sortedProviderKeys.length > 0) {
      const matchedKey = selectedProvider
        ? sortedProviderKeys.find(
            (k) =>
              k === selectedProvider ||
              k.toLowerCase() === selectedProvider.toLowerCase() ||
              providerName(k).toLowerCase() === selectedProvider.toLowerCase() ||
              providerName(selectedProvider).toLowerCase() === k.toLowerCase()
          )
        : null;

      if (matchedKey) {
        setActiveHoverProvider(matchedKey);
      } else if (!activeHoverProvider || !sortedProviderKeys.includes(activeHoverProvider)) {
        setActiveHoverProvider(sortedProviderKeys[0]);
      }
    } else {
      setActiveHoverProvider(null);
    }
  }, [sortedProviderKeys.length, selectedProvider]);

  const rawList = activeHoverProvider && providersData[activeHoverProvider] ? providersData[activeHoverProvider] : [];
  const filteredList = searchQuery.trim()
    ? rawList.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawList;

  return (
    <div className="relative">
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => {
          loadKeys();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/20 hover:bg-white/5 border border-white/5 hover:border-red-500/30 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition duration-150 cursor-pointer focus:outline-none"
      >
        {selectedProvider ? (
          <div className="flex items-center gap-1.5 truncate text-xs sm:text-sm">
            <ProviderIcon provider={selectedProvider} />
            <span className="text-slate-400 font-medium truncate">{providerName(selectedProvider)}</span>
            <span className="text-slate-500 font-normal">·</span>
            <span className="text-slate-100 font-bold truncate max-w-[140px] sm:max-w-[220px]">
              {selectedModel}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-slate-400 font-medium">Select a provider</span>
          </div>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu - Explicitly does NOT close on outside clicks! */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="hidden sm:flex absolute left-0 bottom-full mb-2.5 w-[480px] md:w-[540px] bg-[#140b0d]/98 backdrop-blur-2xl rounded-2xl z-50 border border-red-500/30 shadow-2xl shadow-black/90 flex-col select-none overflow-hidden"
        >
          {/* Top Header Bar with Title, Refresh, and Close (X) Icon Button */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#1b0d10] border-b border-red-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                Select Provider & AI Model
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/20 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-300 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Main Dropdown Body: Providers Column (Left) & Models Column (Right) */}
          {sortedProviderKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">No Connected Providers</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Only providers with connected BYOK keys or custom endpoints appear here. Connect your keys in Settings to get started.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/chats/settings");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 text-xs font-semibold transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                Configure in Settings
              </button>
            </div>
          ) : (
            <>
            {/* DESKTOP: two-column provider + models layout */}
            <div className="hidden sm:flex flex-col sm:flex-row gap-2.5 p-2.5">
              {/* Provider List (Left side) */}
            <div className="w-full sm:w-48 flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-red-500/15 pb-2 sm:pb-0 sm:pr-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider">
                  Providers ({sortedProviderKeys.length})
                </span>
                <button
                  type="button"
                  onClick={() => fetchModels(true)}
                  title="Reload providers"
                  className="text-slate-400 hover:text-white transition"
                >
                  <RotateCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-red-400" : ""}`} />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
                {sortedProviderKeys.map((providerKey) => {
                  const Icon = PROVIDER_ICONS[providerKey] || Server;
                  const isHovered = activeHoverProvider === providerKey;
                  const count = providersData[providerKey]?.length || 0;
                  const isCustom = providerKey === "Custom API";

                  return (
                    <div
                      key={providerKey}
                      className={`group flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs font-medium transition duration-150 cursor-pointer ${
                        isHovered
                          ? "bg-red-500/20 text-white border border-red-500/30"
                          : isCustom
                          ? "text-red-200 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20"
                          : "text-slate-300 hover:bg-[#251417] border border-transparent"
                      }`}
                      onClick={() => setActiveHoverProvider(providerKey)}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ProviderIcon provider={providerKey} />
                        <span className={`truncate ${isCustom ? "font-bold text-red-300" : ""}`}>
                          {providerName(providerKey)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 ml-1">
                        <span className="text-[10px] text-slate-400 font-mono bg-black/30 px-1.5 py-0.5 rounded-md">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Provider API Settings Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/chats/settings");
                }}
                className="mt-2 flex items-center justify-center gap-1.5 w-full px-2.5 py-2 rounded-xl bg-transparent hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/60 text-red-400 text-xs font-medium transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-red-400" />
                <span>Provider Settings</span>
              </button>
            </div>

            {/* Dynamic Models Submenu (Right side with Search) */}
            <div className="w-full sm:w-64 md:w-72 flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {/* Search Input & Header */}
              <div className="relative px-1 pt-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#200f13] border border-red-950/50 rounded-xl pl-8 pr-2 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:outline-none focus:border-red-900/60 focus:ring-0 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between px-2 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="truncate">
                  {activeHoverProvider ? `${providerName(activeHoverProvider)} (${filteredList.length})` : "Select a Provider"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    activeHoverProvider?.startsWith("custom:")
                      ? loadCustomProviderModels(activeHoverProvider)
                      : fetchModels(true)
                  }
                  disabled={isRefreshing || isLoadingCustomModels}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition cursor-pointer lowercase font-normal"
                >
                  <RotateCw className={`w-3 h-3 ${isRefreshing || isLoadingCustomModels ? "animate-spin text-red-400" : ""}`} />
                  <span>{activeHoverProvider?.startsWith("custom:") ? "load models" : "refresh"}</span>
                </button>
              </div>

              {activeHoverProvider?.startsWith("custom:") && isLoadingCustomModels ? (
                <ModelSelectorSkeleton count={5} />
              ) : customModelsError && activeHoverProvider?.startsWith("custom:") ? (
                <div className="px-3 py-6 text-xs text-amber-200/90 text-center leading-relaxed">
                  {customModelsError}
                </div>
              ) : loading ? (
                <ModelSelectorSkeleton count={5} />
              ) : filteredList.length > 0 ? (
                filteredList.map((m) => {
                  const isSelected = selectedModel === m.id && selectedProvider === activeHoverProvider;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectModel(activeHoverProvider!, m.id)}
                      className={`flex flex-col text-left px-2.5 py-2 rounded-xl text-xs transition duration-150 border cursor-pointer ${
                        isSelected
                          ? "bg-red-500/20 border-red-500/40 text-red-300 font-semibold"
                          : "border-transparent text-slate-200 hover:bg-[#251417]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span className="truncate">{m.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-red-400 flex-shrink-0 ml-1" />}
                      </div>
                      {m.description && (
                        <span className="text-[10px] text-slate-400 truncate mt-0.5">{m.description}</span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-6 text-xs text-slate-400 text-center leading-relaxed">
                  {activeHoverProvider?.startsWith("custom:")
                    ? "No models listed. Select “load models” above to fetch them from this API."
                    : "No matching models found."}
                </div>
              )}
            </div>
          </div>
          </>
        )}
      </div>
    )}

      {/* MOBILE: bottom sheet rendered in a portal so it sits above the sidebar/nav rail */}
{isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="sm:hidden fixed inset-0 z-[9999] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <div className="relative bg-[#140b0d]/98 border-t border-red-500/30 rounded-t-3xl shadow-2xl shadow-black/90 flex flex-col h-[70vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between px-3.5 py-3 bg-[#1b0d10] border-b border-red-500/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    Select Provider & AI Model
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/20 transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-300" />
                </button>
              </div>
              <div className="flex flex-col flex-1 min-h-0">
                <div className="px-3.5 pt-3 pb-2 flex-shrink-0 relative">
                  <div
                    className="w-full p-[1.5px]"
                    style={{
                      clipPath:
                        "polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%)",
                      background:
                        "linear-gradient(120deg, rgba(255,255,255,0.22), rgba(239,68,68,0.55) 45%, rgba(255,255,255,0.14))",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setMobileProviderMenuOpen((v) => !v)}
                      className="w-full flex items-center gap-2 pl-9 pr-8 py-3 text-sm text-white transition cursor-pointer hover:bg-white/5"
                      style={{
                        clipPath:
                          "polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%)",
                        background: "rgba(10,6,8,0.72)",
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                      }}
                    >
                      {activeHoverProvider && (
                        <ProviderIcon
                          provider={activeHoverProvider}
                          className="w-4 h-4 absolute left-7 top-1/2 -translate-y-1/2 pointer-events-none"
                        />
                      )}
                      <span className="truncate text-left font-medium">
                        {activeHoverProvider
                          ? `${providerName(activeHoverProvider)} (${providersData[activeHoverProvider]?.length || 0})`
                          : "Select Provider"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 ml-auto text-slate-300 transition-transform duration-200 flex-shrink-0 ${
                          mobileProviderMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  {mobileProviderMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setMobileProviderMenuOpen(false)}
                      />
                      <div className="absolute left-3.5 right-3.5 top-full mt-2 z-[9999] overflow-hidden rounded-[6px] border border-red-950/70 bg-[#1d0e11]/98 shadow-2xl shadow-black/90 backdrop-blur-md">
                        <div className="flex items-center justify-between px-3.5 py-2 bg-black/30 border-b border-red-950/40">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Providers
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {sortedProviderKeys.length}
                          </span>
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                          {sortedProviderKeys.map((key) => {
                            const isActive = key === activeHoverProvider;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setActiveHoverProvider(key);
                                  setMobileProviderMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-[5px] text-left text-sm transition duration-150 border cursor-pointer ${
                                  isActive
                                    ? "bg-red-500/15 border-red-500/40 text-white font-semibold"
                                    : "border-transparent text-slate-200 hover:bg-white/5 active:bg-white/10"
                                }`}
                              >
                                <ProviderIcon provider={key} className="w-4 h-4" />
                                <span className="truncate">{providerName(key)}</span>
                                <span className="ml-auto text-[10px] font-mono bg-black/40 px-1.5 py-0.5 rounded-md text-slate-400 flex-shrink-0">
                                  {providersData[key]?.length || 0}
                                </span>
                                {isActive && <Check className="w-4 h-4 text-red-400 flex-shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="px-3.5 pt-1 pb-1.5 flex items-center justify-between flex-shrink-0">
                  <span className="text-[11px] font-semibold text-slate-500">Select AI Model</span>
                  <button
                    type="button"
                    onClick={() =>
                      activeHoverProvider?.startsWith("custom:")
                        ? loadCustomProviderModels(activeHoverProvider)
                        : fetchModels(true)
                    }
                    disabled={isRefreshing || isLoadingCustomModels}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-white transition cursor-pointer"
                  >
                    <RotateCw
                      className={`w-3 h-3 ${
                        isRefreshing || isLoadingCustomModels ? "animate-spin text-red-400" : ""
                      }`}
                    />
                    <span>{activeHoverProvider?.startsWith("custom:") ? "load" : "refresh"}</span>
                  </button>
                </div>

                <div className="relative px-3.5 pb-2 flex-shrink-0">
                  <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 outline-none rounded-[10px] border border-slate-500/40 focus:border-slate-400/70 transition"
                    style={{
                      background: "rgba(28,28,30,0.62)",
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                    }}
                  />
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3.5 pb-3">
                  <div className="rounded-xl overflow-hidden divide-y divide-white/[0.07] border border-white/[0.06] bg-white/[0.04] backdrop-blur-md">
                  {activeHoverProvider?.startsWith("custom:") && isLoadingCustomModels ? (
                    <ModelSelectorSkeleton count={4} />
                  ) : customModelsError && activeHoverProvider?.startsWith("custom:") ? (
                    <div className="py-6 text-xs text-amber-200/90 text-center leading-relaxed">
                      {customModelsError}
                    </div>
                  ) : loading ? (
                    <ModelSelectorSkeleton count={4} />
                  ) : filteredList.length > 0 ? (
                    filteredList.map((m) => {
                      const isSel = selectedModel === m.id && selectedProvider === activeHoverProvider;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectModel(activeHoverProvider!, m.id)}
                          className={`w-full flex flex-col text-left px-3.5 py-3 text-sm transition duration-100 active:bg-white/10 cursor-pointer ${
                            isSel ? "bg-red-500/20 text-white font-semibold" : "text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{m.name}</span>
                            {isSel && <Check className="w-4 h-4 text-red-400 flex-shrink-0" />}
                          </div>
                          {m.description && (
                            <span className="text-[11px] text-slate-500 truncate mt-0.5">
                              {m.description}
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-6 text-xs text-slate-400 text-center leading-relaxed">
                      {activeHoverProvider?.startsWith("custom:")
                        ? "No models listed. Tap “load” above to fetch them from this API."
                        : "No matching models found."}
                    </div>
                  )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/chats/settings");
                  }}
                  className="mx-3.5 mb-4 flex-shrink-0 flex items-center justify-center gap-1.5 w-[calc(100%-1.75rem)] px-3 py-3 rounded-xl bg-transparent hover:bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium transition cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-red-400" />
                  <span>Provider Settings</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
  </div>
);
}
