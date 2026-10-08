"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, KeyRound, Loader2, RefreshCw, X, Terminal, Copy, Check } from "lucide-react";
import {
  CustomProvider,
  CustomProviderModel,
  fetchCustomProviderModels,
  isAllowedCustomProviderUrl,
  writeCustomProviders,
} from "@cheapchats/frontend/lib/customProviders";

interface CustomProviderDialogProps {
  isOpen: boolean;
  provider: CustomProvider | null;
  onClose: () => void;
  onSaved: (providers: CustomProvider[]) => void;
}

function readSavedKeys(): Record<string, string> {
  try {
    const raw = localStorage.getItem("cheapchats_provider_keys");
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Saved provider keys are not a valid object.");
    }
    return parsed as Record<string, string>;
  } catch (error) {
    console.error("Failed to load saved provider keys:", error);
    return {};
  }
}

export default function CustomProviderDialog({
  isOpen,
  provider,
  onClose,
  onSaved,
}: CustomProviderDialogProps) {
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [modelIds, setModelIds] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [copiedLocalCmd, setCopiedLocalCmd] = useState(false);
  const [copiedOllamaCmd, setCopiedOllamaCmd] = useState(false);
  const usesHttp = /^http:\/\//i.test(baseUrl.trim());

  useEffect(() => {
    if (!isOpen) return;
    setName(provider?.name ?? "");
    setBaseUrl(provider?.baseUrl ?? "");
    setModelIds(provider?.models.map((model) => model.id).join("\n") ?? "");
    setApiKey(provider ? readSavedKeys()[provider.id] ?? "" : "");
    setError("");
    setShowKey(false);
    setIsLoadingModels(false);
  }, [isOpen, provider]);

  if (!isOpen) return null;

  const handleLoadModels = async () => {
    setError("");
    const cleanBaseUrl = baseUrl.trim().replace(/\/+$/, "");
    if (!isAllowedCustomProviderUrl(cleanBaseUrl)) {
      setError("Enter a valid HTTP or HTTPS API URL before loading models.");
      return;
    }
    setIsLoadingModels(true);
    try {
      const models = await fetchCustomProviderModels(cleanBaseUrl, apiKey.trim());
      if (models.length === 0) {
        setError("The API returned no model IDs. Enter model IDs manually or check the API's /models response.");
        return;
      }
      setModelIds(models.map((model) => model.id).join("\n"));
    } catch (loadError) {
      console.error("Failed to load custom provider models:", loadError);
      setError(
        loadError instanceof Error
          ? `${loadError.message} Check that the API supports GET /models and is reachable by CheapRouter.`
          : "Could not load models. Check the API URL and network access."
      );
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSave = () => {
    setError("");
    const cleanName = name.trim();
    const cleanBaseUrl = baseUrl.trim().replace(/\/+$/, "");
    const models: CustomProviderModel[] = Array.from(
      new Set(modelIds.split(/[\n,]/).map((id) => id.trim()).filter(Boolean))
    ).map((id) => ({ id, name: id }));

    if (!cleanName) {
      setError("Enter a name for this provider.");
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(cleanBaseUrl);
    } catch {
      setError("Enter a valid HTTP or HTTPS API base URL, including its /v1 path if required.");
      return;
    }
    if (!isAllowedCustomProviderUrl(parsedUrl.toString())) {
      setError("Custom providers must use an HTTP or HTTPS URL without embedded credentials.");
      return;
    }
    const savedProvider: CustomProvider = {
      id: provider?.id ?? `user_${crypto.randomUUID()}`,
      name: cleanName,
      baseUrl: cleanBaseUrl,
      models,
    };

    try {
      const existing = JSON.parse(localStorage.getItem("cheapchats_provider_keys") || "{}") as Record<string, string>;
      if (apiKey.trim()) existing[savedProvider.id] = apiKey.trim();
      else delete existing[savedProvider.id];
      localStorage.setItem("cheapchats_provider_keys", JSON.stringify(existing));

      const providers = JSON.parse(localStorage.getItem("cheapchats_custom_providers") || "[]") as CustomProvider[];
      const next = provider
        ? providers.map((item) => item.id === provider.id ? savedProvider : item)
        : [...providers, savedProvider];
      writeCustomProviders(next);
      onSaved(next);
      onClose();
    } catch (saveError) {
      console.error("Failed to save custom provider:", saveError);
      setError("Could not save this provider in browser storage. Check available storage and try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close custom provider form"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-provider-title"
        className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-[#20242c] via-[#171a20] to-[#111419] p-5 text-slate-100 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="custom-provider-title" className="text-base font-semibold text-white">
              {provider ? "Edit custom provider" : "Add custom provider"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Connect an OpenAI-compatible API. Ollama on localhost is not available from the hosted website yet.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-200">Provider name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. My AI endpoint"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-rose-300/35"
              maxLength={64}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-200">API base URL</span>
            <input
              type="url"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://api.example.com/v1 or http://192.0.2.10:8377/v1"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-xs text-white outline-none placeholder:text-slate-500 focus:border-rose-300/35"
              autoComplete="url"
            />
            <span className="block text-[11px] leading-relaxed text-slate-500">
              CheapRouter relays requests to this endpoint, so the API does not need browser CORS enabled. Do not include your API key in the URL.
            </span>
            {usesHttp && (
              <span className="block rounded-lg border border-amber-400/20 bg-amber-400/[0.07] px-2.5 py-2 text-[11px] leading-relaxed text-amber-200/90">
                HTTP traffic between CheapRouter and the provider is unencrypted. Use HTTPS to protect API keys and chat data in transit.
              </span>
            )}

            {/* Quick helper for local OpenCode/Ollama/Local LLM tunnel */}
            <div className="rounded-xl border border-rose-300/15 bg-white/[0.02] p-3 text-[11px] space-y-2 text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Terminal className="h-3.5 w-3.5 text-rose-300" />
                <span>Laptop se Local Ollama ya OpenCode CLI connect karna hai?</span>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-normal">
                Terminal me tunnel command run karein aur milne wala <code className="text-emerald-300 font-mono">https://...trycloudflare.com/v1</code> URL upar paste karein:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                {/* 1. Ollama Command */}
                <div className="p-2 rounded-lg bg-black/50 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="font-semibold text-emerald-300">🦙 Ollama (11434):</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("npx cloudflared tunnel --url http://localhost:11434");
                        setCopiedOllamaCmd(true);
                        setTimeout(() => setCopiedOllamaCmd(false), 2000);
                      }}
                      className="text-[10px] text-emerald-400 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition cursor-pointer"
                    >
                      {copiedOllamaCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedOllamaCmd ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-emerald-400 truncate select-all">
                    npx cloudflared tunnel --url http://localhost:11434
                  </div>
                </div>

                {/* 2. OpenCode Command */}
                <div className="p-2 rounded-lg bg-black/50 border border-rose-500/20 space-y-1">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="font-semibold text-rose-300">💻 OpenCode (8080):</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("npx cloudflared tunnel --url http://localhost:8080");
                        setCopiedLocalCmd(true);
                        setTimeout(() => setCopiedLocalCmd(false), 2000);
                      }}
                      className="text-[10px] text-rose-300 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 transition cursor-pointer"
                    >
                      {copiedLocalCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLocalCmd ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-rose-300 truncate select-all">
                    npx cloudflared tunnel --url http://localhost:8080
                  </div>
                </div>
              </div>
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="flex items-center justify-between gap-3 text-xs font-medium text-slate-200">
              <span>Model IDs <span className="font-normal text-slate-500">(optional)</span></span>
              <button
                type="button"
                onClick={handleLoadModels}
                disabled={isLoadingModels}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                {isLoadingModels ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Load from API
              </button>
            </span>
            <textarea
              rows={4}
              value={modelIds}
              onChange={(event) => setModelIds(event.target.value)}
              placeholder={"Optional — load from API or enter IDs\nmodel-id-one\nmodel-id-two"}
              className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-xs text-white outline-none placeholder:text-slate-500 focus:border-rose-300/35"
            />
            <span className="block text-[11px] text-slate-500">Load model IDs from the API or add them manually. You can also save now and load them later in the chat model picker.</span>
          </label>

          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <KeyRound className="h-3.5 w-3.5 text-rose-200" />
              API key <span className="font-normal text-slate-500">(optional)</span>
            </span>
            <div className="flex gap-2">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Paste API key"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-xs text-white outline-none placeholder:text-slate-500 focus:border-rose-300/35"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowKey((visible) => !visible)}
                className="rounded-xl border border-white/10 px-3 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <span className="block text-[11px] text-slate-500">
              The key is stored in this browser and sent through CheapRouter to the configured provider. CheapRouter does not save it.
            </span>
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <a
            href="https://platform.openai.com/docs/api-reference/chat/create"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 transition hover:text-slate-200"
          >
            OpenAI-compatible format
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 px-4 py-2.5 text-xs font-semibold text-slate-900 transition hover:from-white hover:to-slate-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            Save provider
          </button>
        </div>
      </section>
    </div>
  );
}
