"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import MessageThread from "@cheapchats/frontend/components/Chat/MessageThread";
import ChatInput from "@cheapchats/frontend/components/Chat/ChatInput";
import { Message } from "@cheapchats/frontend/components/Chat/MessageItem";
import { parseAllArtifactFiles } from "@cheapchats/frontend/lib/artifactParser";
import {
  playResponseCompletionSound,
  primeResponseCompletionSound,
} from "@cheapchats/frontend/lib/responseCompletionSound";
import {
  CustomProvider,
  isAllowedCustomProviderUrl,
  readCustomProviders,
} from "@cheapchats/frontend/lib/customProviders";

function detectAndOpenArtifact(content: string, setActiveArtifact: (art: any) => void) {
  const artifact = parseAllArtifactFiles(content);
  if (artifact && artifact.files && artifact.files.length > 0) {
    const totalLines = artifact.files.reduce((acc, f) => acc + f.content.split("\n").length, 0);
    if (totalLines > 3) {
      setActiveArtifact(artifact);
    }
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
  } = useAppStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);

  interface QueuedMessage {
    id: string;
    content: string;
    attachments: any[];
  }
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const isStreamingRef = useRef(false);

  // Load conversation if initialConversationId is provided
  useEffect(() => {
    setActiveArtifact(null);

    if (initialConversationId) {
      setActiveConvId(initialConversationId);
      let isCancelled = false;

      fetch(`/api/cheapchats/conversations/${initialConversationId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Conversation not found");
          return res.json();
        })
        .then((data) => {
          if (!isCancelled && data.messages) {
            setMessages(data.messages);
            if (data.conversation?.model) {
              setSelectedProviderAndModel(
                data.conversation.provider || "OpenRouter",
                data.conversation.model
              );
            }
          }
        })
        .catch(() => {
          if (!isCancelled) setMessages([]);
        });

      return () => {
        isCancelled = true;
      };
    } else {
      setActiveConvId(null);
      setMessages([]);
    }
  }, [initialConversationId, setActiveArtifact, setSelectedProviderAndModel]);

  const executeSend = async (
    content: string,
    attachments: any[] = [],
    isRetry = false,
    queuedMsgId?: string
  ) => {
    let responseFailed = false;
    let responseHasEnoughContent = false;
    if (useAppStore.getState().chatPreferences.responseCompletionSound) {
      primeResponseCompletionSound();
    }

    let customProvider: CustomProvider | undefined;
    if (selectedProvider?.startsWith("custom:")) {
      const customProviderId = selectedProvider.slice("custom:".length);
      customProvider = readCustomProviders().find((provider) => provider.id === customProviderId);
      if (!customProvider) {
        throw new Error("This custom provider is no longer saved in Settings.");
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
    try {
      const raw = localStorage.getItem("cheapchats_provider_keys");
      if (raw) {
        const keys = JSON.parse(raw);
        const pName = (selectedProvider || "openrouter").toLowerCase();
        userKey = customProvider
          ? keys[customProvider.id]
          : keys[pName] || keys[`ap_${pName}`];
      }
    } catch {}

    const reqStartTime = Date.now();
    const effTemperature = chatPreferences?.temperature ?? 0.7;
    const effContextWindow = chatPreferences?.contextWindow ?? "128k";
    const effSystemPrompt = chatPreferences?.systemPrompt || "You are a helpful, brilliant AI assistant.";
    const effRollingLimit = chatPreferences?.rollingWindowLimit || rollingWindowLimit || 20;

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
          activeArtifact: activeArtifact
            ? {
                title: activeArtifact.title,
                files: activeArtifact.files,
                content: activeArtifact.content,
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
      let assistantMsgContent = "";
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
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...assistantMsg,
                      content: assistantMsgContent,
                    };
                    return updated;
                  });
                  if (assistantMsgContent.includes("```") || assistantMsgContent.includes("<cheapchatArtifact")) {
                    detectAndOpenArtifact(assistantMsgContent, setActiveArtifact);
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
                  detectAndOpenArtifact(assistantMsgContent, setActiveArtifact);
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
        detectAndOpenArtifact(assistantMsgContent, setActiveArtifact);
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
    } finally {
      if (
        (responseFailed || responseHasEnoughContent) &&
        useAppStore.getState().chatPreferences.responseCompletionSound
      ) {
        void playResponseCompletionSound().catch((error) => {
          console.warn("Could not play response completion sound:", error);
        });
      }
      setIsStreaming(false);
      isStreamingRef.current = false;

      if (messageQueueRef.current.length > 0) {
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
  };

  const handleSendMessage = (content: string, attachments: any[] = [], isRetry = false) => {
    if (!content.trim() && attachments.length === 0) return;

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
      return;
    }

    executeSend(content, attachments, isRetry);
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user" && !m.queueStatus);
    if (lastUserMsg) {
      const atts = Array.isArray(lastUserMsg.attachments) ? lastUserMsg.attachments : [];
      handleSendMessage(lastUserMsg.content, atts, true);
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
        />
        <ChatInput onSend={handleSendMessage} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
