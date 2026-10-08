"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import MessageThread from "@cheapchats/frontend/components/Chat/MessageThread";
import ChatInput from "@cheapchats/frontend/components/Chat/ChatInput";
import { Message } from "@cheapchats/frontend/components/Chat/MessageItem";
import {
  isArtifactCodeIncomplete,
  mergeContinuedArtifact,
  parseAllArtifactFiles,
} from "@cheapchats/frontend/lib/artifactParser";
import type { Artifact, ArtifactFile } from "@cheapchats/frontend/lib/store";
import {
  playResponseCompletionSound,
  primeResponseCompletionSound,
} from "@cheapchats/frontend/lib/responseCompletionSound";
import {
  CustomProvider,
  getCustomProviderKey,
  isAllowedCustomProviderUrl,
  readCustomProviders,
} from "@cheapchats/frontend/lib/customProviders";
import { SYSTEM_PROMPT as DEFAULT_SYSTEM_PROMPT } from "@cheapchats/frontend/lib/systemPrompt";

function detectAndOpenArtifact(
  content: string,
  setActiveArtifact: (artifact: Artifact) => void,
  continuationBase?: Artifact | null
) {
  const artifact = parseAllArtifactFiles(content);
  if (artifact && artifact.files && artifact.files.length > 0) {
    const resolvedArtifact = continuationBase
      ? mergeContinuedArtifact(continuationBase, artifact)
      : artifact;
    const totalLines = (resolvedArtifact.files || []).reduce((acc, f) => acc + f.content.split("\n").length, 0);
    if (totalLines > 3) setActiveArtifact(resolvedArtifact);
  }
}

interface ChatWorkspaceProps {
  initialConversationId?: string | null;
}

export default function ChatWorkspace({ initialConversationId }: ChatWorkspaceProps) {
  const router = useRouter();
  const {
    selectedModel,
    selectedProvider,
    activeProjectId,
    isIncognito,
    setDebugData,
    setActiveArtifact,
    activeArtifact,
    activeTools,
    selectedSkills,
    rollingWindowLimit,
    chatPreferences,
    setSelectedProviderAndModel,
    isCallAssistantOpen,
    setCallAssistantOpen,
    setConversationUsage,
  } = useAppStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(Boolean(initialConversationId));
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);

  // Real context-usage accounting: every message actually in this conversation
  // is measured (~4 chars = 1 token, same estimate the debug console uses) and
  // compared against the model's selected context window.
  useEffect(() => {
    const parseWindow = (value: string | undefined): number => {
      if (!value) return 128000;
      const raw = value.trim().toLowerCase();
      const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
      if (!isFinite(num) || num <= 0) return 128000;
      if (raw.includes("k")) return Math.round(num * 1000);
      if (raw.includes("m")) return Math.round(num * 1000000);
      return Math.round(num);
    };

    const usedTokens = messages.reduce((total, m) => {
      const text = typeof m.content === "string" ? m.content : "";
      return total + Math.ceil(text.length / 4) + 4;
    }, 0);

    setConversationUsage({
      usedTokens,
      maxTokens: parseWindow(chatPreferences?.contextWindow),
      messageCount: messages.length,
    });
  }, [messages, chatPreferences?.contextWindow, setConversationUsage]);

  interface QueuedMessage {
    id: string;
    content: string;
    attachments: any[];
  }
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const isStreamingRef = useRef(false);
  const streamAbortControllerRef = useRef<AbortController | null>(null);

  // Load conversation if initialConversationId is provided
  useEffect(() => {
    setActiveArtifact(null);

    if (initialConversationId) {
      setActiveConvId(initialConversationId);
      setIsLoadingConversation(true);
      let isCancelled = false;

      fetch(`/api/cheapchats/conversations/${initialConversationId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Conversation not found");
          return res.json();
        })
        .then((data) => {
          if (!isCancelled && data.messages) {
            setMessages(data.messages);
            let restoredArtifact: Artifact | null = null;
            for (const message of data.messages as Message[]) {
              if (
                message.sender !== "assistant" ||
                !message.content.includes("<cheapchatArtifact")
              ) {
                continue;
              }

              if (restoredArtifact) {
                useAppStore.setState({ activeArtifact: restoredArtifact });
              }
              const parsedArtifact = parseAllArtifactFiles(message.content);
              if (parsedArtifact?.files?.length) {
                const isPatch = /<cheapchatAction\s+type="patch"/i.test(message.content);
                if (isPatch && restoredArtifact) {
                  const previousMainFile: ArtifactFile | undefined = restoredArtifact.files?.find(
                    (file) => file.content === restoredArtifact?.content
                  );
                  const updatedMainFile: ArtifactFile | undefined = previousMainFile
                    ? parsedArtifact.files.find((file) => file.name === previousMainFile.name)
                    : parsedArtifact.files.find(
                        (file) => file.language === "html" || file.name.endsWith(".html")
                      );
                  restoredArtifact = {
                    ...parsedArtifact,
                    content: updatedMainFile?.content || restoredArtifact.content,
                  };
                } else {
                  restoredArtifact = parsedArtifact;
                }
              }
            }
            if (restoredArtifact) setActiveArtifact(restoredArtifact);

            // Keep the user's explicitly chosen provider and model from localStorage if one exists
            const savedProv = typeof window !== "undefined" ? localStorage.getItem("cheapchats_selected_provider") : null;
            const savedModel = typeof window !== "undefined" ? localStorage.getItem("cheapchats_selected_model") : null;
            if (!savedProv && !savedModel && data.conversation?.model) {
              const rawProv = data.conversation.provider || "OpenRouter";
              const matchedCustom = readCustomProviders().find(
                (p) =>
                  p.name.toLowerCase() === rawProv.toLowerCase() ||
                  p.id.toLowerCase() === rawProv.toLowerCase() ||
                  getCustomProviderKey(p.id) === rawProv
              );
              const effProv = matchedCustom ? getCustomProviderKey(matchedCustom.id) : rawProv;
              setSelectedProviderAndModel(effProv, data.conversation.model);
            }
          }
        })
        .catch(() => {
          if (!isCancelled) setMessages([]);
        })
        .finally(() => {
          if (!isCancelled) setIsLoadingConversation(false);
        });

      return () => {
        isCancelled = true;
      };
    } else {
      setActiveConvId(null);
      setMessages([]);
      setIsLoadingConversation(false);
    }
  }, [initialConversationId, setActiveArtifact, setSelectedProviderAndModel]);

  const executeSend = async (
    content: string,
    attachments: any[] = [],
    isRetry = false,
    queuedMsgId?: string,
    continuationArtifactOverride?: Artifact,
    isCallMode = false,
    queuedMsgIds?: string[]
  ): Promise<string> => {
    let assistantMsgContent = "";
    let responseFailed = false;
    let responseHasEnoughContent = false;
    const artifactForRequest = continuationArtifactOverride || activeArtifact;
    const activeArtifactCode =
      artifactForRequest?.files?.find((file) => file.language === "html" || file.name.endsWith(".html"))?.content ||
      artifactForRequest?.content ||
      "";
    const activeArtifactIsIncomplete = isArtifactCodeIncomplete(activeArtifactCode);
    const isContinuationRequest =
      /\bcontinue\b|\baagay\b|\bagay\b|\bresume\b|\bfinish\b|\bincomplete\b|\bhalf\b|\bcarry\s+on\b/i.test(content) ||
      (isRetry && activeArtifactIsIncomplete);
    const continuationArtifactBase = isContinuationRequest ? artifactForRequest : null;
    if (useAppStore.getState().chatPreferences.responseCompletionSound) {
      primeResponseCompletionSound();
    }

    let customProvider: CustomProvider | undefined;
    if (selectedProvider) {
      if (selectedProvider.startsWith("custom:")) {
        const customProviderId = selectedProvider.slice("custom:".length);
        customProvider = readCustomProviders().find((provider) => provider.id === customProviderId);
        if (!customProvider) {
          throw new Error("This custom provider is no longer saved in Settings.");
        }
      } else {
        customProvider = readCustomProviders().find(
          (provider) =>
            provider.name.toLowerCase() === selectedProvider.toLowerCase() ||
            provider.id.toLowerCase() === selectedProvider.toLowerCase()
        );
      }
    }

    const assistantMsg: Message = {
      id: `msg_a_${Date.now()}`,
      sender: "assistant",
      content: "",
      model: selectedModel,
      provider: customProvider?.name || selectedProvider || "OpenRouter",
      createdAt: Date.now(),
    };

    if (isRetry) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.sender === "assistant") {
          return [...prev.slice(0, -1), assistantMsg];
        }
        return [...prev, assistantMsg];
      });
    } else if (queuedMsgIds && queuedMsgIds.length > 0) {
      setMessages((prev) => {
        const updated = prev.map((m) =>
          queuedMsgIds.includes(m.id) ? { ...m, queueStatus: undefined } : m
        );
        return [...updated, assistantMsg];
      });
    } else if (queuedMsgId) {
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === queuedMsgId ? { ...m, queueStatus: undefined } : m
        );
        return [...updated, assistantMsg];
      });
    } else {
      const userMsg: Message = {
        id: `msg_u_${Date.now()}`,
        sender: "user",
        content,
        attachments,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
    }

    setIsStreaming(true);
    isStreamingRef.current = true;

    // Check for user configured BYOK key in localStorage
    let userKey: string | undefined;
    const abortController = new AbortController();
    streamAbortControllerRef.current = abortController;

    try {
      const raw = localStorage.getItem("cheapchats_provider_keys");
      if (raw) {
        const keys = JSON.parse(raw);
        if (customProvider) {
          userKey = keys[customProvider.id];
        } else {
          const pName = (selectedProvider || "openrouter").toLowerCase();
          const pNorm = pName.replace(/[^a-z0-9]/g, "");
          userKey =
            keys[selectedProvider || ""] ||
            keys[pName] ||
            keys[`ap_${pName}`] ||
            keys[`ap_${pNorm}`] ||
            keys[pNorm];
          if (!userKey) {
            for (const [k, v] of Object.entries(keys)) {
              const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, "");
              if (kNorm && pNorm && (kNorm === pNorm || pNorm.includes(kNorm) || kNorm.includes(pNorm))) {
                if (typeof v === "string" && v.trim()) {
                  userKey = v;
                  break;
                }
              }
            }
          }
        }
      }
    } catch {}

    const reqStartTime = Date.now();
    const effTemperature = chatPreferences?.temperature ?? 0.7;
    const effContextWindow = chatPreferences?.contextWindow ?? "128k";
    const effRollingLimit = chatPreferences?.rollingWindowLimit || rollingWindowLimit || 20;
    const isLiveCallMode =
      isCallMode ||
      (typeof window !== "undefined" && Boolean((window as any).__cheapchats_is_call_active)) ||
      useAppStore.getState().isCallAssistantOpen;

    const baseSystemPrompt = chatPreferences?.systemPrompt || DEFAULT_SYSTEM_PROMPT;
    const effSystemPrompt = isLiveCallMode
      ? `${baseSystemPrompt}

[CRITICAL INSTRUCTIONS FOR LIVE VOICE TELEPHONE CALL]:
1. You are talking to the user on a REAL-TIME TELEPHONE / VOICE CALL. The user is speaking to you via microphone and hearing your spoken response through speech synthesis.
2. Speak like a natural, warm, helpful human on a live telephone call.
3. Keep ALL responses SHORT, CONCISE, and direct (strictly 1 to 3 short spoken sentences). Never write long paragraphs, essays, or multiple sections unless the user explicitly asks for deep detail.
4. Do NOT use markdown symbols, bullet points (*, -), numbered lists, asterisks (**bold**), hashtags (#), or code snippets because your response is being read aloud to the user.
5. If the user asks if you can hear them ("meri aawaz aa rahi hai?", "can you hear me?", "hello?", etc.), immediately and warmly confirm (e.g. "Jee haan! Aap ki aawaz bilkul saaf aa rahi hai. Farmayein, main aap ki kya madad kar sakta hoon?").
6. Answer directly to save the user time. Only explain in deep detail if the user explicitly asks for details.`
      : baseSystemPrompt;

    const requestPayloadObj = {
      conversationId: isIncognito ? undefined : (activeConvId || undefined),
      message: content,
      model: selectedModel,
      provider: customProvider?.name || selectedProvider || "OpenRouter",
      apiKey: userKey ? `${userKey.slice(0, 4)}...${userKey.slice(-4)}` : undefined,
      projectId: isIncognito ? undefined : activeProjectId,
      isIncognito,
      attachments,
      tools: activeTools,
      selectedSkills,
      rollingWindowLimit: effRollingLimit,
      temperature: effTemperature,
      contextWindow: effContextWindow,
      systemPrompt: effSystemPrompt,
    };

    setDebugData({
      timestamp: new Date().toLocaleTimeString(),
      endpoint: customProvider
        ? "/api/cheapchats/custom-provider"
        : "/api/cheapchats/chat",
      method: "POST",
      model: selectedModel,
      provider: customProvider?.name || selectedProvider || "OpenRouter",
      baseUrl: customProvider?.baseUrl || "Connecting to provider...",
      statusState: "streaming",
      statusCode: "Pending...",
      statusText: "Connecting...",
      latencyMs: 0,
      tokens: Math.ceil(content.length / 4),
      promptTokens: Math.ceil(content.length / 4),
      completionTokens: 0,
      cost: 0,
      temperature: effTemperature,
      contextWindow: effContextWindow,
      rawSystemPrompt: effSystemPrompt,
      rawMessages: [{ role: "user", content }],
      userMessage: content,
      attachments,
      tools: activeTools,
      requestHeaders: {
        "Content-Type": "application/json",
        ...(customProvider && userKey ? { Authorization: "Bearer ••••••••" } : {}),
      },
      requestPayload: requestPayloadObj,
    });

    try {
      const customEndpoint = customProvider
        ? "/api/cheapchats/custom-provider"
        : null;
      if (customProvider) {
        const parsedEndpoint = new URL(customProvider.baseUrl);
        if (!isAllowedCustomProviderUrl(parsedEndpoint.toString())) {
          throw new Error("Custom API endpoint must use HTTP or HTTPS without embedded credentials.");
        }
      }
      const customMessages = customProvider
        ? [
            { role: "system", content: effSystemPrompt },
            ...messages
              .filter((item) => item.sender === "user" || item.sender === "assistant")
              .slice(-20)
              .map((item) => ({ role: item.sender, content: item.content })),
            { role: "user", content },
          ]
        : undefined;
      const res = await fetch(customEndpoint || "/api/cheapchats/chat", {
        method: "POST",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customProvider ? {
          baseUrl: customProvider.baseUrl,
          apiKey: userKey || "",
          action: "chat",
          payload: {
            model: selectedModel,
            messages: customMessages,
            stream: true,
            temperature: effTemperature,
            max_tokens: 4096,
          },
          tools: activeTools,
          message: content,
        } : {
          conversationId: isIncognito ? undefined : (activeConvId || undefined),
          message: content,
          model: selectedModel,
          provider: selectedProvider || "OpenRouter",
          apiKey: userKey,
          projectId: isIncognito ? undefined : activeProjectId,
          isIncognito,
          attachments,
          tools: activeTools,
          selectedSkills,
          rollingWindowLimit: effRollingLimit,
          temperature: effTemperature,
          contextWindow: effContextWindow,
          systemPrompt: effSystemPrompt,
          activeArtifact: artifactForRequest
            ? {
                title: artifactForRequest.title,
                files: artifactForRequest.files,
                content: artifactForRequest.content,
              }
            : null,
        }),
      });

      if (!res.ok || !res.body) {
        const errorText = await res.text().catch(() => "");
        console.error("Chat stream error status:", res.status, errorText);
        setDebugData({
          timestamp: new Date().toLocaleTimeString(),
          endpoint: "/api/cheapchats/chat",
          method: "POST",
          model: selectedModel,
          provider: selectedProvider || "OpenRouter",
          statusState: "error",
          statusCode: res.status,
          statusText: res.statusText || (res.status === 401 ? "Unauthorized" : "Error"),
          latencyMs: Date.now() - reqStartTime,
          tokens: 0,
          cost: 0,
          temperature: effTemperature,
          contextWindow: effContextWindow,
          rawSystemPrompt: effSystemPrompt,
          rawMessages: [{ role: "user", content }],
          userMessage: content,
          attachments,
          requestHeaders: {
            "Content-Type": "application/json",
            ...(customProvider && userKey ? { Authorization: "Bearer ••••••••" } : {}),
          },
          requestPayload: requestPayloadObj,
          responseHeaders: Object.fromEntries(res.headers.entries()),
          rawResponse: errorText,
          errorCode: res.status,
          errorText: errorText || `HTTP ${res.status} Error`,
          errorReason: res.status === 401
            ? "API Key rejected or unauthorized."
            : res.status === 429
            ? "Rate limit or quota exceeded on upstream provider."
            : res.status === 500
            ? "Server error occurred while handling chat completion."
            : `Request failed with HTTP status ${res.status}`,
        });
        throw new Error(`Chat stream error (HTTP ${res.status}): ${errorText || "empty response"}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      assistantMsgContent = "";
      let newConvId = "";
      let streamError = false;
      let canRetry = true;
      let eventBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        eventBuffer += decoder.decode(value, { stream: true });
        const events = eventBuffer.split("\n\n");
        eventBuffer = events.pop() || "";

        for (const event of events) {
          const dataPayload = event
            .split("\n")
            .filter((line) => line.startsWith("data: "))
            .map((line) => line.slice(6))
            .join("\n");
          if (dataPayload) {
            try {
              if (customProvider && dataPayload.trim() === "[DONE]") continue;
              const data = JSON.parse(dataPayload);
              if (customProvider && data.error) {
                streamError = true;
                canRetry = true;
                const errorText = data.error.message || "The custom provider returned an error.";
                assistantMsgContent += `⚠️ ${customProvider.name}: ${errorText}`;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...assistantMsg,
                    content: assistantMsgContent,
                    isError: true,
                    canRetry,
                  };
                  return updated;
                });
                continue;
              }
              if (customProvider) {
                const customToken = data.choices?.[0]?.delta?.content;
                if (typeof customToken === "string" && customToken) {
                  assistantMsgContent += customToken;
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("cheapchat:stream_token", {
                        detail: { token: customToken, fullText: assistantMsgContent },
                      })
                    );
                  }
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...assistantMsg,
                      content: assistantMsgContent,
                    };
                    return updated;
                  });
                  if (assistantMsgContent.includes("```") || assistantMsgContent.includes("<cheapchatArtifact")) {
                    detectAndOpenArtifact(assistantMsgContent, setActiveArtifact, continuationArtifactBase);
                  }
                }
                continue;
              }
              if (data.conversationId && !newConvId && !isIncognito) {
                newConvId = data.conversationId;
                if (!activeConvId) {
                  window.history.replaceState(null, "", `/chats/c/${newConvId}`);
                  setActiveConvId(newConvId);
                  window.dispatchEvent(new Event("refreshConversations"));
                }
              }

              if (data.token) {
                assistantMsgContent += data.token;
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("cheapchat:stream_token", {
                      detail: { token: data.token, fullText: assistantMsgContent },
                    })
                  );
                }
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...assistantMsg,
                    content: assistantMsgContent,
                  };
                  return updated;
                });

                if (
                  assistantMsgContent.includes("```") ||
                  assistantMsgContent.includes("<cheapchatArtifact")
                ) {
                  detectAndOpenArtifact(assistantMsgContent, setActiveArtifact, continuationArtifactBase);
                }
              }

              if (data.error === true) {
                streamError = true;
                canRetry = data.canRetry !== false;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...assistantMsg,
                    content: assistantMsgContent,
                    isError: true,
                    canRetry,
                  };
                  return updated;
                });
              }

              if (data.debug) {
                setDebugData(data.debug);
              }
            } catch {}
          }
        }
      }

      responseFailed = streamError;
      responseHasEnoughContent = assistantMsgContent.trim().length >= 1000;

      if (!streamError) {
        detectAndOpenArtifact(assistantMsgContent, setActiveArtifact, continuationArtifactBase);
        if (customProvider && !isIncognito && assistantMsgContent) {
          try {
            let conversationId = activeConvId;
            if (!conversationId) {
              const createResponse = await fetch("/api/cheapchats/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: content.slice(0, 60) || "New Chat",
                  model: selectedModel,
                  provider: customProvider.name,
                }),
              });
              if (!createResponse.ok) throw new Error(`Conversation save failed (${createResponse.status}).`);
              const createdConversation = await createResponse.json();
              conversationId = createdConversation.id;
              if (conversationId) {
                setActiveConvId(conversationId);
                window.history.replaceState(null, "", `/chats/c/${conversationId}`);
              }
            }
            if (!conversationId) throw new Error("Conversation ID was not returned.");
            const persistResponse = await fetch(`/api/cheapchats/conversations/${conversationId}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: selectedModel,
                provider: customProvider.name,
                messages: [
                  { sender: "user", content, attachments },
                  { sender: "assistant", content: assistantMsgContent },
                ],
              }),
            });
            if (!persistResponse.ok) throw new Error(`Message history save failed (${persistResponse.status}).`);
            window.dispatchEvent(new Event("refreshConversations"));
          } catch (error) {
            console.error("Custom provider reply was not saved to chat history:", error);
            setDebugData({
              ...(useAppStore.getState().debugData || {
                model: selectedModel,
                provider: customProvider.name,
                latencyMs: Date.now() - reqStartTime,
                tokens: 0,
                cost: 0,
                temperature: effTemperature,
              }),
              statusState: "error",
              errorReason: `Reply generated, but chat history could not be saved: ${error instanceof Error ? error.message : String(error)}`,
            });
          }
        }
      }
    } catch (err: any) {
      if (abortController.signal.aborted) {
        const currentDebug = useAppStore.getState().debugData;
        if (currentDebug) {
          setDebugData({ ...currentDebug, statusState: "completed", statusText: "Stopped by user" });
        }
      } else {
        responseFailed = true;
        console.error("Stream failed:", err);
        const currentDebug = useAppStore.getState().debugData;
        setDebugData({
          ...(currentDebug || {
            model: selectedModel,
            provider: selectedProvider || "OpenRouter",
            latencyMs: Date.now() - reqStartTime,
            tokens: 0,
            cost: 0,
            temperature: 0.7,
          }),
          statusState: "error",
          errorCode: currentDebug?.errorCode || "NETWORK_ERROR",
          errorText: currentDebug?.errorText || err?.message || "Stream disconnected unexpectedly",
          errorReason: currentDebug?.errorReason || (err?.message ? `Network/Stream error: ${err.message}` : "Connection stalled or closed unexpectedly"),
          latencyMs: currentDebug?.latencyMs || (Date.now() - reqStartTime),
        });
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.sender === "assistant" && !last.content.trim()) {
            return [
              ...prev.slice(0, -1),
              {
                ...last,
                content: "Network error occurred while fetching response.",
                isError: true,
                canRetry: true,
              },
            ];
          }
          return prev;
        });
      }
    } finally {
      if (streamAbortControllerRef.current === abortController) {
        streamAbortControllerRef.current = null;
      }
      if (
        !abortController.signal.aborted &&
        (responseFailed || responseHasEnoughContent) &&
        useAppStore.getState().chatPreferences.responseCompletionSound
      ) {
        void playResponseCompletionSound().catch((error) => {
          console.warn("Could not play response completion sound:", error);
        });
      }
      setIsStreaming(false);
      isStreamingRef.current = false;

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cheapchat:stream_end", {
            detail: { fullText: assistantMsgContent, aborted: abortController.signal.aborted },
          })
        );
      }

      const isCallActive =
        typeof window !== "undefined" &&
        Boolean((window as any).__cheapchats_is_call_active);

      if (!isCallActive && messageQueueRef.current.length > 0) {
        const nextItem = messageQueueRef.current.shift()!;
        setMessages((prev) => {
          let qIdx = 1;
          return prev.map((m) => {
            if (m.queueStatus && m.id !== nextItem.id) {
              return { ...m, queueStatus: `Q${qIdx++}` };
            }
            return m;
          });
        });
        setTimeout(() => {
          executeSend(nextItem.content, nextItem.attachments, false, nextItem.id);
        }, 150);
      }
    }
    return assistantMsgContent;
  };

  // When a voice call assistant finishes speaking, batch process all queued messages accumulated in the conversation
  useEffect(() => {
    const handleCallTurnFinished = () => {
      if (messageQueueRef.current.length > 0) {
        const queuedItems = [...messageQueueRef.current];
        messageQueueRef.current = [];
        const queuedIds = queuedItems.map((item) => item.id);
        const combinedContent = queuedItems.map((item) => item.content).join(" ");
        setTimeout(() => {
          executeSend(combinedContent, [], false, undefined, undefined, true, queuedIds);
        }, 150);
      }
    };

    window.addEventListener("cheapchat:call_turn_finished", handleCallTurnFinished);
    return () => {
      window.removeEventListener("cheapchat:call_turn_finished", handleCallTurnFinished);
    };
  }, []);

  const handleSendMessage = async (
    content: string,
    attachments: any[] = [],
    isRetry = false,
    isCallMode = false
  ): Promise<string | undefined> => {
    if (!content.trim() && attachments.length === 0) return undefined;

    if (isStreamingRef.current && !isRetry) {
      const qNum = messageQueueRef.current.length + 1;
      const queuedId = `msg_u_q_${Date.now()}`;
      const queuedUserMsg: Message = {
        id: queuedId,
        sender: "user",
        content,
        attachments,
        queueStatus: `Q${qNum}`,
        createdAt: Date.now(),
      };
      messageQueueRef.current.push({ id: queuedId, content, attachments });
      setMessages((prev) => [...prev, queuedUserMsg]);
      return undefined;
    }

    return await executeSend(content, attachments, isRetry, undefined, undefined, isCallMode);
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user" && !m.queueStatus);
    if (lastUserMsg) {
      const atts = Array.isArray(lastUserMsg.attachments) ? lastUserMsg.attachments : [];
      const lastAssistantMsg = [...messages].reverse().find((m) => m.sender === "assistant");
      const continuationArtifact =
        activeArtifact || (lastAssistantMsg ? parseAllArtifactFiles(lastAssistantMsg.content) : null);
      if (continuationArtifact) setActiveArtifact(continuationArtifact);
      executeSend(lastUserMsg.content, atts, true, undefined, continuationArtifact || undefined);
    }
  };

  const handleEditUserMessage = (newContent: string) => {
    handleSendMessage(newContent);
  };

  return (
    <div className="flex-1 min-w-0 flex h-full overflow-hidden bg-[#130a0c]">
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        <MessageThread
          messages={messages}
          onSendMessage={handleSendMessage}
          onRegenerate={handleRegenerate}
          onEditUserMessage={handleEditUserMessage}
          isStreaming={isStreaming}
          isLoading={isLoadingConversation}
        />
        <ChatInput
          onSend={handleSendMessage}
          onStop={() => streamAbortControllerRef.current?.abort()}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
