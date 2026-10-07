"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  ChevronDown,
  Sparkles,
  Server,
  Bot,
  Cpu,
  Zap,
  Check,
  Search,
  X,
  RotateCw,
  Loader2,
} from "lucide-react";

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

export default function ModelSelector() {
  const { selectedProvider, selectedModel, setSelectedProviderAndModel } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeHoverProvider, setActiveHoverProvider] = useState<string | null>(null);
  const [providersData, setProvidersData] = useState<Record<string, ModelItem[]>>({});
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchModels = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);

      const res = await fetch(`/api/cheapchats/models${forceRefresh ? "?refresh=true" : ""}`);
      if (res.ok) {
        const data = await res.json();
        const pData: Record<string, ModelItem[]> = data.providers || {};
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

  useEffect(() => {
    try {
      const cached = localStorage.getItem("cheapchat_cached_models");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Object.keys(parsed).length > 0) {
          setProvidersData(parsed);
          setActiveHoverProvider(selectedProvider || Object.keys(parsed)[0]);
        }
      }
    } catch {}

    fetchModels();
  }, [selectedProvider]);

  const handleSelectModel = (provider: string, modelId: string) => {
    setSelectedProviderAndModel(provider, modelId);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#model-selector-container")) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("click", handleOutside);
    }
    return () => document.removeEventListener("click", handleOutside);
  }, [isOpen]);

  const providerKeys = Object.keys(providersData);
  const sortedProviderKeys = [...providerKeys].sort((a, b) => {
    if (a === "Custom API") return 1;
    if (b === "Custom API") return -1;
    return a.localeCompare(b);
  });

  const rawList = activeHoverProvider && providersData[activeHoverProvider] ? providersData[activeHoverProvider] : [];
  const filteredList = searchQuery.trim()
    ? rawList.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawList;

  return (
    <div className="relative" id="model-selector-container">
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#15191E] hover:bg-[#1A1F26] border border-[#262C34] hover:border-slate-600 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition shadow-sm cursor-pointer focus:outline-none"
      >
        <Sparkles className="w-4 h-4 text-red-400 flex-shrink-0" />
        {selectedProvider ? (
          <div className="flex items-center gap-1.5 truncate text-xs sm:text-sm">
            <span className="text-slate-400 font-medium truncate">{selectedProvider}</span>
            <span className="text-slate-600 font-normal">·</span>
            <span className="text-slate-100 font-bold truncate max-w-[140px] sm:max-w-[200px]">
              {selectedModel}
            </span>
          </div>
        ) : (
          <span className="text-slate-400 font-medium">Select a provider</span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu - Opens downwards from Top Header */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-2 w-80 sm:w-[480px] md:w-[540px] bg-[#15191E] backdrop-blur-2xl rounded-2xl z-50 border border-[#262C34] shadow-2xl shadow-black/80 flex flex-col select-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Top Header Bar with Title, Refresh, and Close */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0F1217] border-b border-[#1E232B]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                Select Provider & AI Model
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fetchModels(true)}
                disabled={isRefreshing}
                title="Refresh models from all providers"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-400" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search Models Input Bar */}
          <div className="p-2.5 border-b border-[#1E232B] bg-[#11141A]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search models in ${activeHoverProvider || "selected provider"}...`}
                className="w-full bg-[#0B0D10] border border-[#1E232B] rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Main Dropdown Body: Providers Column (Left) & Models Column (Right) */}
          <div className="flex flex-col sm:flex-row gap-2.5 p-3">
            {/* Provider List (Left side) */}
            <div className="w-full sm:w-48 flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-[#1E232B] pb-2 sm:pb-0 sm:pr-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Providers ({sortedProviderKeys.length})
                </span>
                <button
                  type="button"
                  onClick={() => fetchModels(true)}
                  title="Reload providers"
                  className="text-slate-500 hover:text-white transition"
                >
                  <RotateCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-red-400" : ""}`} />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
                {sortedProviderKeys.map((providerKey) => {
                  const Icon = PROVIDER_ICONS[providerKey] || Server;
                  const isSelected = selectedProvider === providerKey;
                  const isHovered = activeHoverProvider === providerKey;
                  const count = providersData[providerKey]?.length || 0;
                  const isCustom = providerKey === "Custom API";

                  return (
                    <div
                      key={providerKey}
                      className={`group flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs font-medium transition duration-150 cursor-pointer ${
                        isHovered || isSelected
                          ? "bg-red-500/15 text-white border border-red-500/30"
                          : isCustom
                          ? "text-red-300 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20"
                          : "text-slate-300 hover:bg-[#1A1F26] border border-transparent"
                      }`}
                      onMouseEnter={() => setActiveHoverProvider(providerKey)}
                      onClick={() => setActiveHoverProvider(providerKey)}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isSelected || isCustom ? "text-red-400" : "text-slate-400"
                          }`}
                        />
                        <span className={`truncate ${isCustom ? "font-bold text-red-300" : ""}`}>
                          {providerKey}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 ml-1">
                        <span className="text-[10px] text-slate-400 font-mono bg-black/40 px-1.5 py-0.5 rounded-md border border-white/5">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Model List (Right side) */}
            <div className="flex-1 flex flex-col gap-1 max-h-64 overflow-y-auto pr-0.5 custom-scrollbar">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {activeHoverProvider || "Select a Provider"} ({filteredList.length})
                </span>
                <button
                  type="button"
                  onClick={() => fetchModels(true)}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 text-slate-500 hover:text-white transition cursor-pointer text-[11px]"
                >
                  <RotateCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-red-400" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {loading ? (
                <div className="px-3 py-8 text-xs text-slate-400 text-center flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-red-400" />
                  <span>Loading models...</span>
                </div>
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
                          ? "bg-red-500/15 border-red-500/40 text-red-200 font-semibold"
                          : "border-transparent text-slate-200 hover:bg-[#1A1F26]"
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
                <div className="px-3 py-6 text-xs text-slate-500 text-center leading-relaxed">
                  No matching models found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
