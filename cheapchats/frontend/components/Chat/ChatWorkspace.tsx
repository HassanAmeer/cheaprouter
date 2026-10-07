"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import MessageThread from "@cheapchats/frontend/components/Chat/MessageThread";
import ChatInput from "@cheapchats/frontend/components/Chat/ChatInput";
import { Message } from "@cheapchats/frontend/components/Chat/MessageItem";
import { parseAllArtifactFiles } from "@cheapchats/frontend/lib/artifactParser";

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
    const assistantMsg: Message = {
      id: `msg_a_${Date.now()}`,
      sender: "assistant",
      content: "",
      model: selectedModel,
      provider: selectedProvider || "OpenRouter",
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
        userKey = keys[pName] || keys[`ap_${pName}`];
      }
    } catch {}

    try {
      const res = await fetch("/api/cheapchats/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          rollingWindowLimit,
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
          rawSystemPrompt: "Request failed before SSE stream started",
          rawMessages: [{ role: "user", content }],
          model: selectedModel,
          provider: selectedProvider || "OpenRouter",
          tokens: 0,
          cost: 0,
          latencyMs: 0,
          temperature: 0.7,
          errorCode: res.status,
          errorText,
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
              const data = JSON.parse(dataPayload);
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

      if (!streamError) {
        detectAndOpenArtifact(assistantMsgContent, setActiveArtifact);
      }
    } catch (err: any) {
      console.error("Stream failed:", err);
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
    <div className="flex-1 min-w-0 flex h-full overflow-hidden bg-[#0E1116]">
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        {isIncognito && (
          <div className="bg-purple-950/40 border-b border-purple-500/30 px-4 py-2 flex items-center justify-between text-xs text-purple-200 select-none animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
              <span className="font-semibold text-purple-300">Incognito Mode Active:</span>
              <span className="text-purple-200/80">
                Messages are temporary and will not be saved to your history or database.
              </span>
            </div>
            <button
              onClick={() => useAppStore.getState().setIncognito(false)}
              className="text-[11px] underline text-purple-300 hover:text-white"
            >
              Turn Off
            </button>
          </div>
        )}
        <MessageThread
          messages={messages}
          onSendMessage={handleSendMessage}
          onRegenerate={handleRegenerate}
          onEditUserMessage={handleEditUserMessage}
          isStreaming={isStreaming}
        />
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
