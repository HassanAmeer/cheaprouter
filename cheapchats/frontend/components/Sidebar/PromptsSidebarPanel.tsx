"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  Filter,
  Plus,
  CheckSquare,
  Square,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
} from "lucide-react";
import { SidebarCardsSkeleton } from "@cheapchats/frontend/components/Common/SkeletonLoader";

export default function PromptsSidebarPanel() {
  const {
    activePromptId,
    setActivePromptId,
    sendPromptsOnSelect,
    setSendPromptsOnSelect,
    setPendingPromptText,
  } = useAppStore();

  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const loadPrompts = async () => {
    try {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      const list = data.prompts || [];
      setPrompts(list);
      try {
        localStorage.setItem("cheapchat_cached_prompts", JSON.stringify(list));
      } catch {}
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, [activePromptId]);

  const filteredPrompts = prompts.filter((p) => {
    const q = filterQuery.toLowerCase();
    const title = (p.title || p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    return title.includes(q) || desc.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredPrompts.length / itemsPerPage));
  const displayedPrompts = filteredPrompts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleCreateNew = () => {
    setActivePromptId("new");
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    try {
      await fetch(`/api/prompts/${id}`, { method: "DELETE" });
      if (activePromptId === id) setActivePromptId(null);
      loadPrompts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-slate-200 select-none overflow-hidden border-r border-white/10">
      {/* ── Top Bar: Filter & Add Button (Screenshot 1) ────────────────────── */}
      <div className="p-3 border-b border-white/10 bg-[#161616] flex items-center gap-2">
        {/* Filter Icon Button */}
        <button
          type="button"
          className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-[#252525] border border-white/10 text-slate-400 hover:text-white transition flex-shrink-0"
          title="Filter options"
        >
          <Filter className="w-4 h-4" />
        </button>

        {/* Filter Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => {
              setFilterQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Filter prompts by name"
            className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/20 transition"
          />
        </div>

        {/* Plus (+) Button to Create Prompt */}
        <button
          type="button"
          onClick={handleCreateNew}
          className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-[#252525] border border-white/10 text-slate-200 hover:text-white transition flex-shrink-0"
          title="Create New Prompt"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* ── Checkbox Toggle Row: Send prompts on select (Screenshot 1) ──────── */}
      <div className="px-3 pt-2.5 pb-1">
        <button
          type="button"
          onClick={() => setSendPromptsOnSelect(!sendPromptsOnSelect)}
          className="w-full py-2 px-3 rounded-xl bg-[#1e1e1e] hover:bg-[#252525] border border-white/10 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
        >
          {sendPromptsOnSelect ? (
            <CheckSquare className="w-4 h-4 text-red-400" />
          ) : (
            <Square className="w-4 h-4 text-slate-500" />
          )}
          <span>Send prompts on select</span>
        </button>
      </div>

      {/* ── Main Prompt List / Empty State (Screenshot 1) ──────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && prompts.length === 0 ? (
          <SidebarCardsSkeleton count={4} />
        ) : displayedPrompts.length === 0 ? (
          /* Empty Card State */
          <div className="border border-white/10 bg-[#161616] rounded-2xl p-6 flex flex-col items-center justify-center text-center my-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No prompts yet</h3>
            <p className="text-xs text-slate-400">
              Create your first prompt to get started
            </p>
          </div>
        ) : (
          /* Prompts List */
          displayedPrompts.map((prompt) => {
            const isSelected = activePromptId === prompt.id;
            return (
              <div
                key={prompt.id}
                onClick={async () => {
                  setActivePromptId(prompt.id);
                  if (sendPromptsOnSelect && prompt.content) {
                    setPendingPromptText(prompt.content);
                  } else if (sendPromptsOnSelect) {
                    // Fetch content if not loaded yet
                    try {
                      const res = await fetch(`/api/prompts/${prompt.id}`);
                      const data = await res.json();
                      if (data.prompt?.content) setPendingPromptText(data.prompt.content);
                    } catch {}
                  }
                }}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between gap-2 ${
                  isSelected
                    ? "bg-[#222222] border-white/30 text-white"
                    : "bg-[#181818] border-white/10 hover:border-white/20 text-slate-300 hover:bg-[#1e1e1e]"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-white truncate">
                        {prompt.title || prompt.name}
                      </span>
                      {prompt.command && (
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded text-slate-400 font-mono">
                          /{prompt.command}
                        </span>
                      )}
                    </div>
                    {prompt.description && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {prompt.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(prompt.id, e)}
                  className="text-slate-500 hover:text-red-400 p-1 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ── Bottom Pagination Controls (Screenshot 1) ──────────────────────── */}
      <div className="p-3 border-t border-white/10 bg-[#161616] flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1.5 rounded-xl bg-[#1e1e1e] hover:bg-[#252525] border border-white/10 text-xs font-medium text-slate-300 disabled:opacity-40 disabled:hover:bg-[#1e1e1e] transition"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1.5 rounded-xl bg-[#1e1e1e] hover:bg-[#252525] border border-white/10 text-xs font-medium text-slate-300 disabled:opacity-40 disabled:hover:bg-[#1e1e1e] transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
