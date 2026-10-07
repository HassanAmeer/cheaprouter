"use client";

import { useState, useEffect } from "react";
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
  Folder,
  Search,
  X,
  EyeOff,
  Eye,
  Plus,
  AlertTriangle,
  Heart,
  Check,
} from "lucide-react";

interface ProjectFolder {
  id: string;
  name: string;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  provider: string;
  projectId?: string;
  isPinned: number;
  isBookmarked: number;
  createdAt: number;
  updatedAt: number;
}

interface ConversationListProps {
  favouritesOnly?: boolean;
}

export default function ConversationList({ favouritesOnly = false }: ConversationListProps) {
  const router = useRouter();
  const params = useParams();
  const currentId = params?.id as string;

  const { isIncognito, toggleIncognito, activeProjectId, setActiveProjectId } = useAppStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<"projects" | "chats" | "selected" | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const [projects, setProjects] = useState<ProjectFolder[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cheapchats_projects");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cheapchats_projects", JSON.stringify(projects));
    }
  }, [projects]);

  const handleCreateProject = () => {
    const name = prompt("Enter new project folder name:");
    if (name && name.trim()) {
      const newProj: ProjectFolder = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: name.trim(),
      };
      setProjects((prev) => [...prev, newProj]);
      setExpandedProjects((prev) => ({ ...prev, [newProj.id]: true }));
      setIsProjectsOpen(true);
      setActiveProjectId(newProj.id);
      router.push("/chats");
    }
  };

  const handleDeleteProject = (projId: string, projName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the project folder "${projName}"?`)) {
      setProjects((prev) => prev.filter((p) => p.id !== projId));
      if (activeProjectId === projId) {
        setActiveProjectId(null);
      }
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    const handleRefresh = () => fetchConversations();
    window.addEventListener('refreshConversations', handleRefresh);
    return () => window.removeEventListener('refreshConversations', handleRefresh);
  }, [currentId]);

  useEffect(() => {
    setSelectedChatIds((selectedIds) =>
      selectedIds.filter((id) => conversations.some((conversation) => conversation.id === id))
    );
  }, [conversations]);

  useEffect(() => {
    const handleGlobalClick = () => setActiveMenuId(null);
    if (activeMenuId) {
      window.addEventListener("click", handleGlobalClick);
    }
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [activeMenuId]);

  const handleRename = async (id: string, currentTitle: string) => {
    const newTitle = prompt("Enter new conversation title:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    fetchConversations();
    setActiveMenuId(null);
  };

  const handleTogglePin = async (id: string, currentPinned: number) => {
    await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: currentPinned ? 0 : 1 }),
    });
    fetchConversations();
    setActiveMenuId(null);
  };

  const handleToggleBookmark = async (id: string, currentBookmarked: number) => {
    await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBookmarked: currentBookmarked ? 0 : 1 }),
    });
    fetchConversations();
    setActiveMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    if (currentId === id) {
      router.push("/chats");
    } else {
      fetchConversations();
    }
    setActiveMenuId(null);
  };

  const toggleChatSelection = (id: string) => {
    setSelectedChatIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  };

  const cancelChatSelection = () => {
    setIsSelectionMode(false);
    setSelectedChatIds([]);
    setActiveMenuId(null);
  };

  const handleDeleteSelected = async () => {
    if (selectedChatIds.length === 0 || isDeletingSelected) return;
    setIsDeletingSelected(true);
    setDeleteError("");

    const results = await Promise.allSettled(
      selectedChatIds.map(async (id) => {
        const response = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error || `Failed to delete chat (HTTP ${response.status})`);
        }
        return id;
      })
    );

    const deletedIds = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : []
    );
    const failedCount = results.length - deletedIds.length;
    if (failedCount > 0) {
      const failure = results.find((result) => result.status === "rejected");
      const reason = failure?.status === "rejected" ? failure.reason : null;
      console.error("Some selected chats could not be deleted:", reason);
      setDeleteError(`${deletedIds.length} deleted; ${failedCount} could not be deleted. Please retry.`);
      setSelectedChatIds((current) => current.filter((id) => !deletedIds.includes(id)));
      fetchConversations();
    } else {
      setSelectedChatIds([]);
      setIsSelectionMode(false);
      setConfirmDeleteTarget(null);
    }

    setConversations((current) => current.filter((conversation) => !deletedIds.includes(conversation.id)));
    if (currentId && deletedIds.includes(currentId)) router.push("/chats");
    setIsDeletingSelected(false);
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
    setActiveMenuId(null);
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
    setActiveMenuId(null);
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProjectIds = new Set(projects.map((p) => p.id));
  const normalChats = favouritesOnly
    ? filtered.filter((conversation) => conversation.isBookmarked === 1)
    : filtered.filter((c) => !c.projectId || !activeProjectIds.has(c.projectId));

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
            const isMenuOpen = activeMenuId === conv.id;
            const isSelected = selectedChatIds.includes(conv.id);

            return (
              <div key={conv.id} className="relative group">
                <div className="flex items-center">
                  {isSelectionMode && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleChatSelection(conv.id);
                      }}
                      aria-label={`${isSelected ? "Deselect" : "Select"} chat ${conv.title}`}
                      aria-pressed={isSelected}
                      className={`ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 ${
                        isSelected
                          ? "border-red-500 bg-red-600 text-white"
                          : "border-white/20 bg-black/20 text-transparent hover:border-red-400/70"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => isSelectionMode ? toggleChatSelection(conv.id) : router.push(`/chats/c/${conv.id}`)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-red-500/15 text-white font-semibold ring-1 ring-inset ring-red-400/25"
                        : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <MessageSquare
                      className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-red-400" : "text-slate-500 group-hover:text-slate-300"}`}
                    />
                    <span className="truncate flex-1">{conv.title}</span>
                    {conv.isPinned === 1 && <Pin className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                    {conv.isBookmarked === 1 && <Heart className="w-3 h-3 fill-rose-400 text-rose-400 flex-shrink-0" />}
                  </button>
                </div>

                {/* More Actions Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(isMenuOpen ? null : conv.id);
                  }}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition ${
                    isMenuOpen || isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                  }`}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* iOS Cupertino Style Context Menu Dropdown */}
                {isMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-2 top-7 w-48 bg-[#180a0d]/95 backdrop-blur-2xl rounded-2xl p-1 z-[100] shadow-2xl border border-red-500/30 flex flex-col text-xs divide-y divide-red-500/15 select-none"
                  >
                    {!isSelectionMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsSelectionMode(true);
                          setSelectedChatIds([]);
                          setActiveMenuId(null);
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/15 text-left transition font-medium text-slate-200"
                      >
                        <span>Select chats</span>
                        <Check className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRename(conv.id, conv.title)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/15 text-left transition font-medium text-slate-200"
                    >
                      <span>Rename Title</span>
                      <Edit2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    </button>
                    <button
                      onClick={() => handleTogglePin(conv.id, conv.isPinned)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/15 text-left transition font-medium text-slate-200"
                    >
                      <span>{conv.isPinned ? "Unpin Chat" : "Pin to Top"}</span>
                      <Pin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(conv.id, conv.isBookmarked)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/15 text-left transition font-medium text-slate-200"
                    >
                      <span>{conv.isBookmarked ? "Remove from Favourites" : "Add to Favourites"}</span>
                      <Heart className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    </button>
                    <button
                      onClick={() => handleExportJSON(conv.id, conv.title)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/15 text-left transition font-medium text-slate-200"
                    >
                      <span>Export JSON</span>
                      <Download className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    </button>
                    <button
                      onClick={() => handleExportMarkdown(conv.id, conv.title)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/15 text-left transition font-medium text-slate-200"
                    >
                      <span>Export Markdown</span>
                      <Download className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    </button>
                    <button
                      onClick={() => handleDelete(conv.id)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-400 text-left transition font-semibold"
                    >
                      <span>Delete Chat</span>
                      <Trash2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2 py-2 space-y-3 text-xs text-slate-300">
      {/* Incognito Temporary Chat Toggle Row */}
      {!favouritesOnly && <div
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
      </div>}

      {/* Live Search Input for Chats */}
      <div className="relative px-1 mb-1">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-red-400/60" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter chats..."
          className="w-full bg-[#1b1013] border border-red-950/50 rounded-xl pl-8 pr-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 outline-none shadow-none transition-colors focus:outline-none focus:border-red-950/50 focus:ring-0 focus:shadow-none"
        />
      </div>

      {/* Projects Accordion Section */}
      {!favouritesOnly && <div>
        <div className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#1f1215] text-slate-300 hover:text-white font-semibold transition select-none">
          <button
            onClick={() => {
              if (isProjectsOpen) {
                setIsProjectsOpen(false);
                setActiveProjectId(null);
              } else {
                setIsProjectsOpen(true);
              }
            }}
            className="flex items-center gap-1.5 flex-1 text-left"
          >
            <span className="font-semibold text-slate-200">Projects</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setConfirmDeleteTarget("projects");
              }}
              title="Delete All Projects"
              className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/15 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleCreateProject();
              }}
              title="Create New Project Folder"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <Plus className="w-3.5 h-3.5 text-red-400" />
            </button>
            <button
              onClick={() => {
                if (isProjectsOpen) {
                  setIsProjectsOpen(false);
                  setActiveProjectId(null);
                } else {
                  setIsProjectsOpen(true);
                }
              }}
              aria-label={isProjectsOpen ? "Collapse projects" : "Expand projects"}
            >
              {isProjectsOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>

        {isProjectsOpen && (
          <div className="pl-1 mt-1 space-y-1">
            {projects.length === 0 ? (
              <div className="px-3 py-1.5 text-[10px] text-slate-500 italic">No project folders yet</div>
            ) : (
              projects.map((project) => {
                const isExpanded = !!expandedProjects[project.id];
                const projectChats = conversations.filter((conversation) => conversation.projectId === project.id);
                const isSelected = activeProjectId === project.id;

                return (
                  <div key={project.id} className="space-y-0.5">
                    <div
                      onClick={() => {
                        setActiveProjectId(project.id);
                        setExpandedProjects((previous) => ({ ...previous, [project.id]: true }));
                        router.push("/chats");
                      }}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition select-none group ${
                        isSelected
                          ? "bg-red-500/20 text-white border border-red-500/30"
                          : "text-slate-300 hover:bg-[#1f1215] hover:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-red-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        )}
                        <Folder className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span className="truncate font-semibold">{project.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({projectChats.length})</span>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => handleDeleteProject(project.id, project.name, event)}
                        title="Delete Project Folder"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/15 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="pl-4 space-y-0.5 border-l border-red-500/15 ml-3">
                        {projectChats.length === 0 ? (
                          <div className="px-2 py-1 text-[10px] text-slate-500 italic">No chats in project</div>
                        ) : (
                          projectChats.map((conversation) => {
                            const isActive = currentId === conversation.id;
                            const isSelected = selectedChatIds.includes(conversation.id);
                            return (
                              <div key={conversation.id} className="flex items-center gap-1">
                                {isSelectionMode && (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      toggleChatSelection(conversation.id);
                                    }}
                                    aria-label={`${isSelected ? "Deselect" : "Select"} chat ${conversation.title}`}
                                    aria-pressed={isSelected}
                                    className={`ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 ${
                                      isSelected
                                        ? "border-red-500 bg-red-600 text-white"
                                        : "border-white/20 bg-black/20 text-transparent hover:border-red-400/70"
                                    }`}
                                  >
                                    {isSelected && <Check className="h-3 w-3" />}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => isSelectionMode ? toggleChatSelection(conversation.id) : router.push(`/chats/c/${conversation.id}`)}
                                  className={`w-full flex min-w-0 items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition ${
                                    isActive
                                      ? "bg-red-500/25 text-white font-semibold border border-red-500/40"
                                      : "text-slate-300 hover:bg-[#1f1215] hover:text-white"
                                  }`}
                                >
                                  <MessageSquare className={`w-3 h-3 flex-shrink-0 ${isActive ? "text-red-400" : "text-slate-400"}`} />
                                  <span className="truncate flex-1 text-[11px]">{conversation.title}</span>
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>}

      {/* Chats Accordion Section with Chronological Grouping */}
      <div>
        <div className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#1f1215] text-slate-300 hover:text-white font-semibold transition select-none">
          <button
            onClick={() => setIsChatsOpen(!isChatsOpen)}
            className="flex items-center gap-1.5 flex-1 text-left"
          >
            <span className="font-semibold text-slate-200">{favouritesOnly ? "Favourites" : "Chats"}</span>
          </button>
          {(isSelectionMode || !favouritesOnly) && <div className="flex items-center gap-1">
            {isSelectionMode && (
              <button
                type="button"
                onClick={cancelChatSelection}
                title="Cancel chat selection"
                className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-3 w-3" />
                <span>Cancel</span>
              </button>
            )}
            {!favouritesOnly && <>
              {isSelectionMode
                ? selectedChatIds.length > 0 && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteError("");
                        setConfirmDeleteTarget("selected");
                      }}
                      title={`Delete ${selectedChatIds.length} selected chat${selectedChatIds.length === 1 ? "" : "s"}`}
                      aria-label={`Delete ${selectedChatIds.length} selected chats`}
                      className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold text-rose-300 transition hover:bg-red-500/15 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{selectedChatIds.length}</span>
                    </button>
                  )
                : (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteError("");
                        setConfirmDeleteTarget("chats");
                      }}
                      title="Delete All Chat History"
                      aria-label="Delete All Chat History"
                      className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/15 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveProjectId(null);
                  router.push("/chats");
                }}
                title="New Normal Chat"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <Plus className="w-3.5 h-3.5 text-red-400" />
              </button>
              <button onClick={() => setIsChatsOpen(!isChatsOpen)}>
                {isChatsOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </>}
          </div>}
        </div>

        {isChatsOpen && (
          <div className="mt-1">
            {normalChats.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-slate-500 font-medium">
                {favouritesOnly ? "No favourite chats yet. Add a chat to Favourites from its menu." : "No active chats found"}
              </div>
            ) : (
              <>
                {favouritesOnly
                  ? renderChatGroup("Favourites", normalChats)
                  : <>
                      {renderChatGroup("Pinned", pinned)}
                      {renderChatGroup("Today", today)}
                      {renderChatGroup("Yesterday", yesterday)}
                      {renderChatGroup("Previous 7 Days", past7Days)}
                      {renderChatGroup("Older", older)}
                    </>}
              </>
            )}
          </div>
        )}
      </div>

      {/* Theme Delete Confirmation Modal */}
      {confirmDeleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#1a0c0f] border border-red-500/30 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 select-none animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  {confirmDeleteTarget === "projects"
                    ? "Delete All Projects?"
                    : confirmDeleteTarget === "selected"
                    ? `Delete ${selectedChatIds.length} selected chat${selectedChatIds.length === 1 ? "" : "s"}?`
                    : "Clear All Chat History?"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {confirmDeleteTarget === "projects"
                    ? "Are you sure you want to delete all project folders? This action cannot be undone."
                    : confirmDeleteTarget === "selected"
                    ? "Selected chats and their messages will be permanently deleted."
                    : "Are you sure you want to delete all chat history and messages? This action cannot be undone."}
                </p>
              </div>
            </div>

            {deleteError && (
              <p role="alert" className="rounded-lg border border-red-500/20 bg-red-950/30 px-3 py-2 text-xs text-rose-200">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-500/15">
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteTarget(null);
                  setDeleteError("");
                }}
                disabled={isDeletingSelected}
                className="rounded-xl border border-white/5 bg-slate-700/35 px-3.5 py-2 text-xs font-medium text-slate-400 transition hover:border-white/10 hover:bg-slate-700/50 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (confirmDeleteTarget === "selected") {
                    await handleDeleteSelected();
                  } else {
                    if (confirmDeleteTarget === "projects") {
                      setProjects([]);
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("cheapchats_projects");
                      }
                      setActiveProjectId(null);
                    } else if (confirmDeleteTarget === "chats") {
                      try {
                        await fetch("/api/conversations", { method: "DELETE" });
                        setConversations([]);
                        router.push("/chats");
                      } catch (err) {
                        console.error("Failed to delete chats:", err);
                      }
                    }
                    setConfirmDeleteTarget(null);
                  }
                }}
                disabled={isDeletingSelected}
                className="rounded-xl border border-red-800/70 bg-red-950/40 px-3.5 py-2 text-xs font-bold text-rose-200 shadow-sm shadow-red-950/30 transition hover:border-red-600/80 hover:bg-red-900/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700/50 disabled:cursor-wait disabled:opacity-60"
              >
                {isDeletingSelected
                  ? "Deleting..."
                  : confirmDeleteTarget === "selected"
                  ? "Delete selected"
                  : "Yes, Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
