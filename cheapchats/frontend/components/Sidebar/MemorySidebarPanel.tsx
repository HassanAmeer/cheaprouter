"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  CheckSquare,
  Square,
  Brain,
  Trash2,
  X,
  Check,
  Edit2,
  Sparkles,
  Search,
} from "lucide-react";
import { SidebarCardsSkeleton } from "@cheapchats/frontend/components/Common/SkeletonLoader";

export default function MemorySidebarPanel() {
  const [memoriesList, setMemoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [useMemory, setUseMemory] = useState(true);

  // Create / Edit Memory Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memoryKey, setMemoryKey] = useState("");
  const [memoryValue, setMemoryValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadMemories = async () => {
    try {
      const res = await fetch("/api/memories");
      if (res.ok) {
        const data = await res.json();
        const list = data.memories || [];
        setMemoriesList(list);
        try {
          localStorage.setItem("cheapchat_cached_memories", JSON.stringify(list));
        } catch {}
      }
    } catch (err) {
      console.error("Failed to load memories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();

    const handleMemoryUpdated = () => {
      loadMemories();
    };

    window.addEventListener("cheapchat:memory_updated", handleMemoryUpdated);
    return () => {
      window.removeEventListener("cheapchat:memory_updated", handleMemoryUpdated);
    };
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setMemoryKey("");
    setMemoryValue("");
    setShowModal(true);
  };

  const openEditModal = (mem: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(mem.id);
    setMemoryKey(mem.key || "");
    setMemoryValue(mem.value || mem.content || "");
    setShowModal(true);
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryKey.trim() && !memoryValue.trim()) return;
    setIsSaving(true);

    try {
      if (editingId) {
        // Edit existing
        await fetch("/api/memories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            key: memoryKey.trim(),
            value: memoryValue.trim(),
            content: `${memoryKey.trim()}: ${memoryValue.trim()}`,
          }),
        });
      } else {
        // Create new
        await fetch("/api/memories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: memoryKey.trim(),
            value: memoryValue.trim(),
            content: `${memoryKey.trim()}: ${memoryValue.trim()}`,
            isUsed: true,
          }),
        });
      }

      setShowModal(false);
      setMemoryKey("");
      setMemoryValue("");
      setEditingId(null);
      await loadMemories();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMemory = async (id: string, currentUsed: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch("/api/memories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isUsed: !currentUsed }),
      });
      await loadMemories();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMemory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this memory?")) return;
    try {
      await fetch(`/api/memories?id=${id}`, { method: "DELETE" });
      await loadMemories();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear ALL memories?")) return;
    try {
      await fetch(`/api/memories?all=true`, { method: "DELETE" });
      await loadMemories();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMemories = memoriesList.filter((m) =>
    (m.content || m.key || m.value || "").toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#100a0c] text-slate-200 select-none overflow-hidden border-r border-white/5 relative">
      {/* ── Top Bar Header ────────────────────────────────────────────────── */}
      <div className="p-3 border-b border-white/5 bg-[#170e10] flex items-center gap-2">
        {/* Filter Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search knowledge..."
            className="w-full bg-[#11080a] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:outline-none focus:border-red-900/55 focus:ring-0 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>

        {/* Plus (+) Button to Create Memory */}
        <button
          type="button"
          onClick={openCreateModal}
          className="p-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950/40 transition flex-shrink-0"
          title="Add Memory Knowledge"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* ── Checkbox Toggle Row: Use memory ───────────────────────────────── */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setUseMemory(!useMemory)}
          className={`flex-1 py-1.5 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition ${
            useMemory
              ? "bg-red-500/15 border-red-500/30 text-red-300"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
          }`}
        >
          {useMemory ? (
            <CheckSquare className="w-4 h-4 text-red-400" />
          ) : (
            <Square className="w-4 h-4 text-slate-500" />
          )}
          <span>Use Memory Knowledge</span>
        </button>

        {memoriesList.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg text-xs"
            title="Clear all memories"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Explanation & Example in grey text ─────────────────────────────── */}
      <div className="px-3 py-1.5">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
          <p className="text-[11px] text-zinc-400 leading-snug">
            Save personal facts & preferences for the AI to remember across chats.
          </p>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-normal">
            <span className="text-zinc-400 font-medium">Example:</span> My name is Hasan, I prefer dark mode, I build apps in TypeScript.
          </p>
        </div>
      </div>

      {/* ── Main Memory Content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {loading && memoriesList.length === 0 ? (
          <SidebarCardsSkeleton count={3} />
        ) : filteredMemories.length === 0 ? (
          <div className="border border-white/5 bg-[#160d10]/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center my-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3 text-red-400">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No memories stored</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[220px]">
              Add custom facts manually or tell the AI in chat: <span className="text-red-300 font-mono">"Remember that..."</span>
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-red-400" />
              <span>Add First Fact</span>
            </button>
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const isUsed = mem.isUsed !== 0;

            return (
              <div
                key={mem.id}
                className={`p-3 rounded-2xl border transition flex flex-col gap-2 group ${
                  isUsed
                    ? "bg-[#180f12] border-red-500/20 hover:border-red-500/40"
                    : "bg-[#12080a] border-white/5 opacity-60 hover:opacity-100"
                }`}
              >
                {/* Top Row: Key Tag + Checkbox + Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div
                    onClick={(e) => handleToggleMemory(mem.id, isUsed, e)}
                    className="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
                  >
                    {isUsed ? (
                      <CheckSquare className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    )}
                    {mem.key ? (
                      <span className="text-[10px] font-mono font-bold uppercase text-red-300 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 truncate">
                        {mem.key}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Memory Item</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={(e) => openEditModal(mem, e)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5"
                      title="Edit Memory"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteMemory(mem.id, e)}
                      className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-white/5"
                      title="Delete Memory"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Content / Value */}
                <div className="text-xs text-slate-200 leading-relaxed font-sans select-text">
                  {mem.value || mem.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Create / Edit Memory Modal ────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-text"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg bg-[#180f12] border border-red-500/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-xs text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-red-400" />
                <h2 className="text-base font-bold text-white tracking-tight">
                  {editingId ? "Edit Memory Knowledge" : "Create Memory Knowledge"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="flex flex-col gap-4">
              {/* Key Field */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-200 text-xs">
                  Key / Subject (e.g. <code className="text-red-300">user_preferences</code>, <code className="text-red-300">tech_stack</code>)
                </label>
                <input
                  type="text"
                  value={memoryKey}
                  onChange={(e) => setMemoryKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="e.g. user_name, project_stack, database_type"
                  className="w-full bg-[#12080a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Use lowercase letters and underscores only
                </p>
              </div>

              {/* Value Field */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-200 text-xs">
                  Value / Fact Content
                </label>
                <textarea
                  value={memoryValue}
                  required
                  onChange={(e) => setMemoryValue(e.target.value)}
                  placeholder="Enter what the AI should remember about you, your project, or guidelines..."
                  rows={4}
                  className="w-full bg-[#12080a] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 leading-relaxed resize-y"
                />
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-red-950/50"
                >
                  {isSaving ? "Saving..." : editingId ? "Save Changes" : "Create Fact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
