"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Trash2,
  Save,
  Server,
  Zap,
  ShieldCheck,
  Cpu,
} from "lucide-react";

export interface ProviderItem {
  id: string;
  name: string;
  icon: string;
  baseUrl?: string;
  apiFormat?: string;
  isCustom?: boolean;
  byokEnabled?: boolean;
  chatsEnabled?: boolean;
  models: Array<{
    id: string;
    name: string;
    description?: string;
    isPopular?: boolean;
  }>;
}

interface ProviderKeyDrawerProps {
  provider: ProviderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (providerId: string, hasKey: boolean) => void;
}

const PROVIDER_DOC_LINKS: Record<string, string> = {
  openai: "https://platform.openai.com/api-keys",
  anthropic: "https://console.anthropic.com/settings/keys",
  google: "https://aistudio.google.com/app/apikey",
  gemini: "https://aistudio.google.com/app/apikey",
  openrouter: "https://openrouter.ai/keys",
  opencode: "https://opencode.ai/zen/keys",
  deepseek: "https://platform.deepseek.com/api_keys",
  groq: "https://console.groq.com/keys",
  mistral: "https://console.mistral.ai/api-keys",
  cohere: "https://dashboard.cohere.com/api-keys",
  together: "https://api.together.ai/settings/api-keys",
  fireworks: "https://fireworks.ai/api-keys",
  huggingface: "https://huggingface.co/settings/tokens",
  cerebras: "https://cloud.cerebras.ai",
  sambanova: "https://cloud.sambanova.ai",
};

export default function ProviderKeyDrawer({
  provider,
  isOpen,
  onClose,
  onKeySaved,
}: ProviderKeyDrawerProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing key from localStorage when provider opens
  useEffect(() => {
    if (!provider) return;
    try {
      const keysRaw = localStorage.getItem("cheapchats_provider_keys");
      const keys = keysRaw ? JSON.parse(keysRaw) : {};
      const existing = keys[provider.id] || keys[provider.name.toLowerCase()] || "";
      setApiKey(existing);
    } catch {
      setApiKey("");
    }
    setTestResult(null);
    setSaveSuccess(false);
    setShowKey(false);
  }, [provider]);

  if (!isOpen || !provider) return null;

  const getDocUrl = () => {
    const key = provider.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [k, url] of Object.entries(PROVIDER_DOC_LINKS)) {
      if (key.includes(k)) return url;
    }
    return provider.baseUrl || "";
  };

  const handleSave = () => {
    try {
      const keysRaw = localStorage.getItem("cheapchats_provider_keys");
      const keys = keysRaw ? JSON.parse(keysRaw) : {};

      if (apiKey.trim()) {
        keys[provider.id] = apiKey.trim();
        keys[provider.name.toLowerCase()] = apiKey.trim();
        onKeySaved(provider.id, true);
      } else {
        delete keys[provider.id];
        delete keys[provider.name.toLowerCase()];
        onKeySaved(provider.id, false);
      }

      localStorage.setItem("cheapchats_provider_keys", JSON.stringify(keys));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (e) {
      console.error("Failed to save key:", e);
    }
  };

  const handleRemove = () => {
    try {
      const keysRaw = localStorage.getItem("cheapchats_provider_keys");
      const keys = keysRaw ? JSON.parse(keysRaw) : {};
      delete keys[provider.id];
      delete keys[provider.name.toLowerCase()];
      localStorage.setItem("cheapchats_provider_keys", JSON.stringify(keys));
      setApiKey("");
      setTestResult(null);
      onKeySaved(provider.id, false);
    } catch (e) {
      console.error("Failed to remove key:", e);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ ok: false, message: "Please enter an API key to test." });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/cheapchats/providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          baseUrl: provider.baseUrl,
          apiKey: apiKey.trim(),
          apiFormat: provider.apiFormat,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setTestResult({
          ok: true,
          message: data.message || `Successfully connected (${data.latencyMs || 0}ms)`,
        });
      } else {
        setTestResult({
          ok: false,
          message: data.error || "Connection failed. Please check the key.",
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || "Connection test request failed.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const docUrl = getDocUrl();

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-white/10 bg-gradient-to-b from-[#1a1d23] via-[#13161b] to-[#0d0f13] text-slate-100 shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-slate-300/[0.08] to-transparent px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-300/15 to-black/50 border border-white/15 flex items-center justify-center p-2 shadow-inner">
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
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {provider.name}
                {provider.isCustom && (
                  <span className="text-[10px] bg-white/10 text-slate-200 px-2 py-0.5 rounded-full border border-white/15 font-semibold">
                    Custom
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Configure BYOK API Key</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-300/[0.09] to-white/[0.02] border border-white/10 flex gap-3 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-100">Client-Side Secure Key Storage</p>
              <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                Your API key is saved locally in your browser storage. Requests are authenticated directly with this provider. No login required.
              </p>
            </div>
          </div>

          {/* Upstream Endpoint Info */}
          {provider.baseUrl && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Upstream Endpoint
              </label>
              <div className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 font-mono text-[11px] text-slate-300 truncate">
                {provider.baseUrl}
              </div>
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-300" />
                API Key
              </label>
              {docUrl && (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder={`Enter your ${provider.name} API Key (e.g. sk-...)`}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-black/35 border border-white/10 focus:border-slate-300/40 focus:ring-1 focus:ring-slate-300/15 outline-none text-xs text-white placeholder-slate-500 font-mono transition"
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" />
                  Testing Connection…
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Test Connection
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in duration-150 ${
                  testResult.ok
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/30 border-red-500/40 text-red-300"
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 leading-snug">{testResult.message}</div>
              </div>
            )}
          </div>

          {/* Models Catalog for this Provider */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-300" />
                Supported Models ({provider.models?.length || 0})
              </span>
            </div>

            {provider.models && provider.models.length > 0 ? (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-black/40 divide-y divide-white/5 p-1">
                {provider.models.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 text-xs flex items-center justify-between hover:bg-white/5 rounded-lg transition"
                  >
                    <div>
                      <span className="font-medium text-white">{m.name}</span>
                      {m.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {m.description}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 ml-2 truncate max-w-[120px]">
                      {m.id}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-slate-400">
                All models compatible with this provider are supported.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-black/30 flex items-center gap-2">
          {apiKey && (
            <button
              onClick={handleRemove}
              className="p-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
              title="Remove this key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-medium text-slate-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 hover:from-white hover:to-slate-300 text-xs font-semibold text-slate-900 shadow-lg shadow-black/30 flex items-center justify-center gap-1.5 transition"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Key
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}
