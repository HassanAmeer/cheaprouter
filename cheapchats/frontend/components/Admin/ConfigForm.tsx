"use client";

import { useState, useEffect } from "react";
import { Key, Save, Check, Sparkles } from "lucide-react";

export default function ConfigForm() {
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("http://187.52.117.2:8377/v1/models");
  const [customApiKey, setCustomApiKey] = useState("");
  const [defaultModel, setDefaultModel] = useState("openai/gpt-4o");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/endpoints")
      .then((r) => r.json())
      .then((d) => {
        if (d.config) {
          setOpenrouterKey(d.config.OPENROUTER_API_KEY || "");
          setOpenaiKey(d.config.OPENAI_API_KEY || "");
          setAnthropicKey(d.config.ANTHROPIC_API_KEY || "");
          setGeminiKey(d.config.GEMINI_API_KEY || "");
          setCustomEndpoint(d.config.CUSTOM_API_ENDPOINT || "http://187.52.117.2:8377/v1/models");
          setCustomApiKey(d.config.CUSTOM_API_KEY || "");
          setDefaultModel(d.config.DEFAULT_MODEL || "openai/gpt-4o");
        }
      });
  }, []);

  const handleSave = async () => {
    await fetch("/api/admin/endpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        OPENROUTER_API_KEY: openrouterKey,
        OPENAI_API_KEY: openaiKey,
        ANTHROPIC_API_KEY: anthropicKey,
        GEMINI_API_KEY: geminiKey,
        CUSTOM_API_ENDPOINT: customEndpoint,
        CUSTOM_API_KEY: customApiKey,
        DEFAULT_MODEL: defaultModel,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4 text-xs text-slate-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-white">Global Endpoints & API Keys Config</h3>
            <p className="text-[11px] text-slate-400">Configure global provider credentials for server-side execution</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? "Keys Saved!" : "Save Credentials"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-300">OpenRouter API Key (`OPENROUTER_API_KEY`)</label>
          <input
            type="password"
            placeholder="sk-or-v1-..."
            value={openrouterKey}
            onChange={(e) => setOpenrouterKey(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-300">OpenAI API Key (`OPENAI_API_KEY`)</label>
          <input
            type="password"
            placeholder="sk-proj-..."
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-300">Anthropic API Key (`ANTHROPIC_API_KEY`)</label>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-300">Google Gemini API Key (`GEMINI_API_KEY`)</label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-300">Custom Provider Endpoint (`CUSTOM_API_ENDPOINT`)</label>
          <input
            type="text"
            placeholder="http://187.52.117.2:8377/v1/models"
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-300">Custom Provider API Key (`CUSTOM_API_KEY`)</label>
          <input
            type="password"
            placeholder="Optional auth token..."
            value={customApiKey}
            onChange={(e) => setCustomApiKey(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
          <label className="font-semibold text-slate-300">Default System Fallback Model</label>
          <input
            type="text"
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
