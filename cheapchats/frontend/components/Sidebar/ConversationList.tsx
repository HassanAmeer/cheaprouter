"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  MessageSquare,
  Pin,
  Download,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Search,
  EyeOff,
  Eye,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { SidebarChatsSkeleton } from "@cheapchats/frontend/components/Common/SkeletonLoader";
import { prefetchConversation } from "@cheapchats/frontend/lib/conversationCache";
import { clearConversationCache } from "@cheapchats/frontend/lib/conversationCache";

interface Conversation {
  id: string;
  title: string;
  model: string;
  provider: string;
  projectId?: string;
  isPinned: number;
  isBookmarked?: number;
  createdAt: number;
  updatedAt: number;
}

export default function ConversationList() {
  const router = useRouter();
  const params = useParams();
  const currentId = params?.id as string;

  const { isIncognito, toggleIncognito } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  interface MenuTarget {
    id: string;
    title: string;
    isPinned: number;
    top: number;
    left: number;
  }
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteChats, setConfirmDeleteChats] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        const list = data.conversations || [];
        setConversations(list);
        try {
          localStorage.setItem("cheapchat_cached_conversations", JSON.stringify(list));
        } catch {}
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Instant hydration from cache for 0ms render
    try {
      const cached = localStorage.getItem("cheapchat_cached_conversations");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setLoading(false);
        }
      }
    } catch {}

    fetchConversations();
    
    const handleRefresh = () => fetchConversations();
    window.addEventListener('refreshConversations', handleRefresh);
    return () => window.removeEventListener('refreshConversations', handleRefresh);
  }, [currentId]);

  useEffect(() => {
    const handleClose = () => setMenuTarget(null);
    if (menuTarget) {
      window.addEventListener("click", handleClose);
      window.addEventListener("scroll", handleClose, true);
      window.addEventListener("resize", handleClose);
    }
    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [menuTarget]);

  const handleRename = async (id: string, currentTitle: string) => {
    const newTitle = prompt("Enter new conversation title:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    fetchConversations();
    window.dispatchEvent(new Event('refreshConversations'));
    setMenuTarget(null);
  };

  const handleTogglePin = async (id: string, currentPinned: number) => {
    await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: currentPinned ? 0 : 1 }),
    });
    fetchConversations();
    window.dispatchEvent(new Event('refreshConversations'));
    setMenuTarget(null);
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    window.dispatchEvent(new Event('refreshConversations'));
    if (currentId === id) {
      router.push("/new");
    } else {
      fetchConversations();
    }
    setMenuTarget(null);
  };

  const handleExportJSON = async (id: string, title: string) => {
    const res = await fetch(`/api/conversations/${id}`);
    if (res.ok) {
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_")}_export.json`;
      a.click();
    }
    setMenuTarget(null);
  };

  const handleExportMarkdown = async (id: string, title: string) => {
    const res = await fetch(`/api/conversations/${id}`);
    if (res.ok) {
      const data = await res.json();
      let md = `# ${data.conversation?.title || title}\n\n`;
      (data.messages || []).forEach((m: any) => {
        md += `### ${m.sender === "user" ? "User" : "Assistant"}\n${m.content}\n\n`;
      });
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_")}_export.md`;
      a.click();
    }
    setMenuTarget(null);
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const normalChats = filtered;

  const pinned = normalChats.filter((c) => c.isPinned === 1);
  const unpinned = normalChats.filter((c) => c.isPinned !== 1);

  const now = Date.now();
  const ONE_DAY = 86400000;
  const today = unpinned.filter((c) => now - c.updatedAt < ONE_DAY);
  const yesterday = unpinned.filter((c) => now - c.updatedAt >= ONE_DAY && now - c.updatedAt < ONE_DAY * 2);
  const past7Days = unpinned.filter((c) => now - c.updatedAt >= ONE_DAY * 2 && now - c.updatedAt < ONE_DAY * 7);
  const older = unpinned.filter((c) => now - c.updatedAt >= ONE_DAY * 7);

  const renderChatGroup = (label: string, items: Conversation[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-2">
        <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </div>
        <div className="space-y-0.5 mt-0.5">
          {items.map((conv) => {
            const isActive = currentId === conv.id;
            const isMenuOpen = menuTarget?.id === conv.id;

            return (
              <div key={conv.id} className="relative group">
                <button
                  onClick={() => router.push(`/c/${conv.id}`)}
                  onMouseEnter={() => prefetchConversation(conv.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-left font-medium transition ${
                    isActive
                      ? "bg-red-500/20 text-white shadow-sm font-semibold border border-red-500/30"
                      : "text-slate-300 hover:bg-[#1f1215] hover:text-slate-100"
                  }`}
                >
                  <MessageSquare
                    className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-red-400" : "text-slate-400"}`}
                  />
                  <span className="truncate flex-1 text-[12px]">{conv.title}</span>
                  {conv.isPinned === 1 && <Pin className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                </button>

                {/* More Actions Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMenuOpen) {
                      setMenuTarget(null);
                    } else {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const menuHeight = 220;
                      const menuWidth = 192;
                      const openUpwards = rect.bottom + menuHeight > window.innerHeight;
                      setMenuTarget({
                        id: conv.id,
                        title: conv.title,
                        isPinned: conv.isPinned,
                        top: openUpwards ? Math.max(10, rect.top - menuHeight) : rect.bottom + 4,
                        left: Math.max(10, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 10)),
                      });
                    }
                  }}
                  className={`absolute right-2 top-1.5 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition ${
                    isMenuOpen || isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3 text-xs text-slate-300">
      {/* Incognito Temporary Chat Toggle Row */}
      <div
        className={`px-2.5 py-2 rounded-xl border transition-all duration-200 flex items-center justify-between select-none ${
          isIncognito
            ? "bg-red-950/25 border-red-500/30 shadow-sm shadow-red-950/40 opacity-100"
            : "bg-[#181012] border-white/5 opacity-60 hover:opacity-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
              isIncognito ? "bg-red-500/20 text-red-400" : "bg-white/5 text-slate-400"
            }`}
          >
            {isIncognito ? <EyeOff className="w-3.5 h-3.5 animate-pulse" /> : <Eye className="w-3.5 h-3.5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold leading-none ${isIncognito ? "text-white" : "text-slate-300"}`}>
                Incognito
              </span>
              {isIncognito && (
                <span className="text-[9px] bg-red-500/20 text-red-300 font-semibold px-1.5 py-0.2 rounded-full border border-red-500/30">
                  Active
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Temporary Chat</p>
          </div>
        </div>

        {/* Switch Toggle Button */}
        <button
          type="button"
          onClick={toggleIncognito}
          className={`w-9 h-5 rounded-full transition-colors duration-200 relative flex items-center px-0.5 flex-shrink-0 cursor-pointer ${
            isIncognito ? "bg-red-600 shadow-md shadow-red-900/40" : "bg-[#252525] border border-white/15"
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full transition-transform duration-200 shadow-sm ${
              isIncognito ? "bg-white translate-x-4" : "bg-slate-400 translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Live Search Input for Chats */}
      <div className="relative px-1 mb-1">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-red-400/60" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter chats..."
          className="w-full bg-[#1b1013] border border-red-500/15 rounded-xl pl-8 pr-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
        />
      </div>

      {/* Chats Section with Chronological Grouping */}
      <div className="mt-1">
        {loading && conversations.length === 0 ? (
          <SidebarChatsSkeleton count={7} />
        ) : normalChats.length === 0 ? (
          <div className="px-3 py-2 text-[11px] text-slate-500 font-medium">No active chats found</div>
        ) : (
          <>
            {renderChatGroup("Pinned", pinned)}
            {renderChatGroup("Today", today)}
            {renderChatGroup("Yesterday", yesterday)}
            {renderChatGroup("Previous 7 Days", past7Days)}
            {renderChatGroup("Older", older)}
          </>
        )}
      </div>

      {/* Delete All Chats Confirmation Modal */}
      {confirmDeleteChats && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#1a0c0f] border border-red-500/30 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 select-none animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Clear All Chat History?</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Are you sure you want to delete all chat history and messages? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-500/15">
              <button
                type="button"
                onClick={() => setConfirmDeleteChats(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch("/api/conversations", { method: "DELETE" });
                    clearConversationCache();
                    setConversations([]);
                    router.push("/new");
                  } catch (err) {
                    console.error("Failed to delete chats:", err);
                  }
                  setConfirmDeleteChats(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-900/40"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Context Menu (Portaled to document.body to ensure zero clipping and topmost z-index) */}
      {mounted && menuTarget && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed",
            top: `${menuTarget.top}px`,
            left: `${menuTarget.left}px`,
            zIndex: 99999,
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-48 bg-[#180a0d]/95 backdrop-blur-2xl rounded-2xl p-1 shadow-2xl border border-red-500/30 flex flex-col text-xs divide-y divide-red-500/15 select-none animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            onClick={() => handleRename(menuTarget.id, menuTarget.title)}
            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/15 text-left transition font-medium text-slate-200"
          >
            <span>Rename Title</span>
            <Edit2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          </button>
          <button
            onClick={() => handleTogglePin(menuTarget.id, menuTarget.isPinned)}
            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/15 text-left transition font-medium text-slate-200"
          >
            <span>{menuTarget.isPinned ? "Unpin Chat" : "Pin to Top"}</span>
            <Pin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          </button>
          <button
            onClick={() => handleExportJSON(menuTarget.id, menuTarget.title)}
            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/15 text-left transition font-medium text-slate-200"
          >
            <span>Export JSON</span>
            <Download className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          </button>
          <button
            onClick={() => handleExportMarkdown(menuTarget.id, menuTarget.title)}
            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/15 text-left transition font-medium text-slate-200"
          >
            <span>Export Markdown</span>
            <Download className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
          </button>
          <button
            onClick={() => handleDelete(menuTarget.id)}
            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-400 text-left transition font-semibold"
          >
            <span>Delete Chat</span>
            <Trash2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
