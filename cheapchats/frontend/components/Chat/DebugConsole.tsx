"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  X,
  Terminal,
  Cpu,
  DollarSign,
  Clock,
  Hash,
  Code,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  MessageSquare,
  FileText,
  HelpCircle,
  Trash2,
  Activity,
  Layers,
} from "lucide-react";

export default function DebugConsole() {
  const { isDebugConsoleOpen, setDebugConsoleOpen, debugData, setDebugData } = useAppStore();
  const [activeTab, setActiveTab] = useState<"overview" | "request" | "response" | "headers" | "error">("response");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // By default, ensure "response" tab is selected every time the inspector opens
  useEffect(() => {
    if (isDebugConsoleOpen) {
      setActiveTab("response");
    }
  }, [isDebugConsoleOpen]);

  // Close on Escape key (Cupertino modal behavior)
  useEffect(() => {
    if (!isDebugConsoleOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDebugConsoleOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDebugConsoleOpen, setDebugConsoleOpen]);

  if (!isDebugConsoleOpen) return null;

  const data = debugData || {
    timestamp: new Date().toLocaleTimeString(),
    endpoint: "/api/cheapchats/chat",
    method: "POST",
    model: "openai/gpt-4o",
    provider: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    statusCode: 200,
    statusText: "OK",
    statusState: "completed" as const,
    latencyMs: 342,
    tokens: 284,
    promptTokens: 45,
    completionTokens: 239,
    cost: 0.00284,
    temperature: 0.7,
    rawSystemPrompt: "You are a senior principal full-stack AI assistant for CheapChat.",
    rawMessages: [
      { role: "system", content: "System prompt active" },
      { role: "user", content: "Hello! Show me the debug console data." },
    ],
    userMessage: "Hello! Show me the debug console data.",
    rawResponse: "Hello! This is a simulated response demonstrating the debug console telemetry.",
    requestHeaders: {
      "Content-Type": "application/json",
      "Authorization": "Bearer sk-or-v1-****************",
    },
    responseHeaders: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache",
    },
  };

  const hasError = !!(data.errorCode || data.statusState === "error" || (typeof data.statusCode === "number" && data.statusCode >= 400));

  const copyToClipboard = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  return (
    <>
      {/* Cupertino Dimmed Backdrop Overlay (Click to dismiss) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
        onClick={() => setDebugConsoleOpen(false)}
      />

      {/* Cupertino Right Slide-over Sheet */}
      <div className="fixed top-0 bottom-0 right-0 w-[540px] max-w-[95vw] h-full bg-[#0d070a]/90 backdrop-blur-3xl border-l border-white/[0.08] shadow-[-12px_0_50px_rgba(0,0,0,0.7)] z-50 flex flex-col transition-all duration-300 font-sans animate-in slide-in-from-right duration-250 select-text">
        {/* 1. Cupertino Navigation Header */}
        <div className="h-14 px-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[13px] tracking-tight text-white">Live Telemetry</span>
                {/* Cupertino Status Pill */}
                {hasError ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 font-mono font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                    {data.statusCode || data.errorCode || 500} {data.statusText || "Error"}
                  </span>
                ) : data.statusState === "streaming" || data.statusCode === "Pending..." ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-semibold animate-pulse">
                    Streaming...
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    {data.statusCode || 200} OK
                  </span>
                )}
              </div>
              <div className="text-[11px] text-white/50 truncate font-mono">
                {data.model} <span className="text-white/30">•</span> {data.provider}
              </div>
            </div>
          </div>

          {/* Action buttons + Cupertino Close (X) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2), "all_json")}
              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/80 hover:text-white transition active:scale-95 cursor-pointer"
              title="Copy entire debug payload"
            >
              {copiedKey === "all_json" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedKey === "all_json" ? "Copied" : "JSON"}</span>
            </button>

            <button
              onClick={() => setDebugData(null)}
              className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-red-400 transition active:scale-95 cursor-pointer"
              title="Clear telemetry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Cupertino Circular Close Button */}
            <button
              onClick={() => setDebugConsoleOpen(false)}
              className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:scale-90 flex items-center justify-center text-white/70 hover:text-white transition ml-1 cursor-pointer"
              title="Close Inspector (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Cupertino Metric Tiles (Inset Grid) */}
        <div className="p-4 border-b border-white/[0.06] bg-white/[0.01] shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Latency */}
            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-semibold">
                <span>Latency</span>
                <Clock className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-sm font-mono font-bold text-white mt-1">
                {data.latencyMs} <span className="text-[10px] font-normal text-white/50">ms</span>
              </div>
            </div>

            {/* Tokens */}
            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-semibold">
                <span>Tokens</span>
                <Hash className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm font-mono font-bold text-emerald-300 mt-1">
                {data.tokens || 0}
              </div>
              <div className="text-[9px] text-white/40 font-mono">
                {data.promptTokens || 0}in / {data.completionTokens || 0}out
              </div>
            </div>

            {/* Cost */}
            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-semibold">
                <span>Est. Cost</span>
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                ${(data.cost || 0).toFixed(5)}
              </div>
              <div className="text-[9px] text-white/40 font-mono truncate">
                Temp: {data.temperature ?? 0.7} • Ctx: {data.contextWindow || "128k"}
              </div>
            </div>

            {/* Status */}
            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-white/50 uppercase font-semibold">
                <span>HTTP Code</span>
                <Globe className={`w-3.5 h-3.5 ${hasError ? "text-red-400" : "text-emerald-400"}`} />
              </div>
              <div className={`text-sm font-mono font-bold truncate mt-1 ${hasError ? "text-red-300" : "text-emerald-300"}`}>
                {data.statusCode || (hasError ? 500 : 200)}
              </div>
              <div className="text-[9px] text-white/40 truncate font-mono">
                {data.statusText || (hasError ? "Error" : "OK")}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Cupertino Segmented Control (Tabs) */}
        <div className="p-3 border-b border-white/[0.06] bg-white/[0.01] shrink-0">
          <div className="bg-black/40 p-1 rounded-2xl flex items-center gap-1 border border-white/[0.06] overflow-x-auto text-[11px]">
            <button
              onClick={() => setActiveTab("response")}
              className={`flex-1 py-1.5 px-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                activeTab === "response"
                  ? "bg-white/[0.14] text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Response
            </button>

            <button
              onClick={() => setActiveTab("request")}
              className={`flex-1 py-1.5 px-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                activeTab === "request"
                  ? "bg-white/[0.14] text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              Request
            </button>

            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-1.5 px-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-white/[0.14] text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-red-400" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab("headers")}
              className={`flex-1 py-1.5 px-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                activeTab === "headers"
                  ? "bg-white/[0.14] text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              Headers
            </button>

            {hasError && (
              <button
                onClick={() => setActiveTab("error")}
                className={`flex-1 py-1.5 px-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap animate-pulse ${
                  activeTab === "error"
                    ? "bg-red-500/25 text-red-200 border border-red-500/40 shadow-sm"
                    : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                Error
              </button>
            )}
          </div>
        </div>

        {/* 4. Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Error Callout if any */}
              {hasError && (
                <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Issue Encountered ({data.errorCode || data.statusCode || 500})</span>
                  </div>
                  <div className="text-xs font-mono text-red-200/90 bg-black/40 p-2.5 rounded-xl border border-red-500/20 break-words">
                    {data.errorReason || data.errorText || "Upstream provider failed to return a response."}
                  </div>
                  <div className="text-[11px] text-red-300/80 leading-relaxed">
                    <span className="font-semibold text-white">Suggested Remedy: </span>
                    {data.statusCode === 401 || data.errorCode === 401
                      ? "The upstream provider rejected the API Key. Check your API key in Settings → Providers."
                      : data.statusCode === 429
                      ? "Rate limit or account credits exhausted. Switch provider/model or retry in a moment."
                      : data.statusCode === 404
                      ? `Model ID '${data.model}' was not found at '${data.provider}'.`
                      : "Check server connection or examine the raw response tab."}
                  </div>
                </div>
              )}

              {/* Cupertino Grouped List: Route Information */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 space-y-2.5 text-xs">
                <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Connection Details</span>
                </div>
                <div className="divide-y divide-white/[0.06] font-mono">
                  <div className="flex justify-between py-2">
                    <span className="text-white/50">Timestamp:</span>
                    <span className="text-white font-medium">{data.timestamp || "Active"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-white/50">Endpoint:</span>
                    <span className="text-emerald-400">{data.method || "POST"} {data.endpoint || "/api/cheapchats/chat"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-white/50">Provider:</span>
                    <span className="text-sky-300 font-bold">{data.provider}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-white/50">Model:</span>
                    <span className="text-amber-300 font-bold">{data.model}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-white/50">Upstream Base URL:</span>
                    <span className="text-purple-300 truncate max-w-[240px]" title={data.baseUrl || "Default"}>
                      {data.baseUrl || "Direct"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cupertino Grouped List: Token Breakdown */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 space-y-2.5 text-xs">
                <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Token Metrics</span>
                </div>
                <div className="divide-y divide-white/[0.06] font-mono">
                  <div className="flex justify-between py-2">
                    <span className="text-white/50">Prompt (Input):</span>
                    <span className="text-white">{data.promptTokens || 0} tokens</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-white/50">Completion (Output):</span>
                    <span className="text-emerald-300 font-semibold">{data.completionTokens || 0} tokens</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-white/50">Total Tokens:</span>
                    <span className="text-white font-bold">{data.tokens || 0} tokens</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-white/50">Total Latency:</span>
                    <span className="text-sky-300">{data.latencyMs} ms</span>
                  </div>
                </div>
              </div>

              {/* User Prompt Snapshot */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 text-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                  <span>Last Message Preview</span>
                  <button
                    onClick={() => copyToClipboard(data.userMessage || "", "user_msg")}
                    className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 cursor-pointer font-sans normal-case"
                  >
                    {copiedKey === "user_msg" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "user_msg" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80 font-mono whitespace-pre-wrap max-h-28 overflow-y-auto leading-relaxed">
                  {data.userMessage || "(No prompt text)"}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REQUEST PAYLOAD */}
          {activeTab === "request" && (
            <div className="space-y-4 text-xs font-mono">
              {/* System Instructions */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 font-sans">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-400" />
                    System Instructions
                  </span>
                  <button
                    onClick={() => copyToClipboard(data.rawSystemPrompt || "", "sys_prompt")}
                    className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 cursor-pointer normal-case"
                  >
                    {copiedKey === "sys_prompt" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "sys_prompt" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] text-white/80 overflow-x-auto whitespace-pre-wrap max-h-36 leading-relaxed">
                  {data.rawSystemPrompt || "Default assistant instructions"}
                </pre>
              </div>

              {/* Messages Array JSON */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 font-sans">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Messages Sent ({data.rawMessages?.length || 0} turns)
                  </span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(data.rawMessages || [], null, 2), "req_msgs")}
                    className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 cursor-pointer normal-case"
                  >
                    {copiedKey === "req_msgs" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "req_msgs" ? "Copied" : "Copy Array"}
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] text-emerald-300 overflow-x-auto whitespace-pre-wrap max-h-72 leading-relaxed">
                  {JSON.stringify(data.rawMessages || [{ role: "user", content: data.userMessage }], null, 2)}
                </pre>
              </div>

              {/* Attachments if any */}
              {data.attachments && data.attachments.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 font-sans">
                    Attachments ({data.attachments.length})
                  </div>
                  <pre className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] text-white/80 overflow-x-auto whitespace-pre-wrap max-h-32">
                    {JSON.stringify(data.attachments, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESPONSE DATA */}
          {activeTab === "response" && (
            <div className="space-y-4 text-xs font-mono">
              {/* Response Metrics Pill Bar */}
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] font-sans text-[11px]">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 font-mono font-semibold border border-emerald-500/20">
                  {data.statusCode || 200} {data.statusText || "OK"}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-white/70">
                  <span className="font-semibold text-white">{data.completionTokens || 0}</span> completion tokens
                </span>
                <span className="text-white/40">•</span>
                <span className="text-white/70">
                  <span className="font-semibold text-sky-300">{data.latencyMs || 0}</span> ms
                </span>
                {typeof data.rawResponse === "string" && data.rawResponse.length > 0 && (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="text-white/50">
                      {data.rawResponse.length} chars
                    </span>
                  </>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 font-sans">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Assistant Output Stream
                  </span>
                  <button
                    onClick={() => copyToClipboard(typeof data.rawResponse === "string" ? data.rawResponse : JSON.stringify(data.rawResponse, null, 2), "resp_body")}
                    className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 cursor-pointer normal-case"
                  >
                    {copiedKey === "resp_body" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "resp_body" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-black/50 border border-white/[0.08] text-white/90 overflow-x-auto whitespace-pre-wrap max-h-96 leading-relaxed selection:bg-emerald-500/30">
                  {typeof data.rawResponse === "string" && data.rawResponse.trim().length > 0
                    ? data.rawResponse
                    : typeof data.rawResponse === "object" && data.rawResponse !== null
                    ? JSON.stringify(data.rawResponse, null, 2)
                    : "(No response data received yet)"}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: HEADERS & NETWORK */}
          {activeTab === "headers" && (
            <div className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 font-sans">
                  <span>Client Request Headers</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(data.requestHeaders || {}, null, 2), "req_hdr")}
                    className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 cursor-pointer normal-case"
                  >
                    {copiedKey === "req_hdr" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "req_hdr" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] text-white/80 overflow-x-auto whitespace-pre-wrap max-h-44">
                  {JSON.stringify(data.requestHeaders || { "Content-Type": "application/json" }, null, 2)}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 font-sans">
                  <span>Upstream Server Response Headers</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(data.responseHeaders || {}, null, 2), "resp_hdr")}
                    className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 cursor-pointer normal-case"
                  >
                    {copiedKey === "resp_hdr" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "resp_hdr" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] text-white/80 overflow-x-auto whitespace-pre-wrap max-h-48">
                  {JSON.stringify(data.responseHeaders || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: ERROR DETAILS */}
          {activeTab === "error" && hasError && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/35 space-y-2">
                <div className="font-bold text-sm text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>HTTP {data.errorCode || data.statusCode || 500} ({data.statusText || "Failed"})</span>
                </div>
                <div className="text-xs text-red-200 font-semibold leading-relaxed">
                  Reason: {data.errorReason || data.errorText || "Upstream provider call failed."}
                </div>
                <div className="text-[11px] text-red-300/80 bg-black/40 p-3 rounded-xl border border-red-500/20 font-sans leading-relaxed">
                  <div className="font-bold text-white mb-1">Troubleshooting:</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Target URL: <span className="font-mono text-white/90">{data.baseUrl || "Default"}</span></li>
                    <li>Verify whether your API key is configured and active in Settings → Providers.</li>
                    <li>Confirm that the model name <span className="font-mono text-white/90">{data.model}</span> is supported by <span className="font-mono text-white/90">{data.provider}</span>.</li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 font-sans">
                  <span>Raw Error Response Text</span>
                  <button
                    onClick={() => copyToClipboard(data.errorText || data.rawResponse || "", "err_raw")}
                    className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 cursor-pointer normal-case"
                  >
                    {copiedKey === "err_raw" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "err_raw" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-black/50 border border-red-500/30 text-red-300 overflow-x-auto whitespace-pre-wrap max-h-56 leading-relaxed">
                  {data.errorText || data.rawResponse || "No raw error body captured"}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
