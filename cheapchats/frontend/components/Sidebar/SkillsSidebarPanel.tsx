"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Plus,
  Search,
  CheckSquare,
  Square,
  Trash2,
  Edit2,
  Shield,
  X,
  Check,
  FolderGit2,
  FileCode,
  Info,
} from "lucide-react";
import Tooltip from "@cheapchats/frontend/components/Common/Tooltip";
import { SidebarCardsSkeleton } from "@cheapchats/frontend/components/Common/SkeletonLoader";
import { useAppStore } from "@cheapchats/frontend/lib/store";

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  content: string;
  isDefault: number;
  isAlwaysActive: number;
  sourceType?: string;
  createdAt: number;
  updatedAt?: number;
}

export default function SkillsSidebarPanel() {
  const { selectedSkills, addSelectedSkill, removeSelectedSkill } = useAppStore();
  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State for Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillDesc, setSkillDesc] = useState("");
  const [skillContent, setSkillContent] = useState("");
  const [skillAlwaysActive, setSkillAlwaysActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSkills = async () => {
    try {
      const res = await fetch("/api/skills");
      if (res.ok) {
        const data = await res.json();
        const list: SkillItem[] = data.skills || [];
        setSkillsList(list);
        try {
          localStorage.setItem("cheapchat_cached_skills", JSON.stringify(list));
        } catch {}
      }
    } catch (err) {
      console.error("Failed to load skills", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();

    const handleSkillsUpdated = () => {
      loadSkills();
    };

    window.addEventListener("cheapchat:skills_updated", handleSkillsUpdated);
    return () => {
      window.removeEventListener("cheapchat:skills_updated", handleSkillsUpdated);
    };
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setSkillName("");
    setSkillDesc("");
    setSkillContent("");
    setSkillAlwaysActive(false);
    setShowModal(true);
  };

  const openEditModal = (skill: SkillItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(skill.id);
    setSkillName(skill.name || "");
    setSkillDesc(skill.description || "");
    setSkillContent(skill.content || "");
    setSkillAlwaysActive(skill.isAlwaysActive === 1);
    setShowModal(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    setIsSaving(true);

    try {
      if (editingId) {
        // Edit existing
        await fetch("/api/skills", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            name: skillName.trim(),
            description: skillDesc.trim(),
            content: skillContent.trim(),
            isAlwaysActive: skillAlwaysActive,
          }),
        });
      } else {
        // Create new
        await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: skillName.trim(),
            description: skillDesc.trim(),
            content: skillContent.trim(),
            isAlwaysActive: skillAlwaysActive,
          }),
        });
      }

      setShowModal(false);
      setEditingId(null);
      setSkillName("");
      setSkillDesc("");
      setSkillContent("");
      await loadSkills();
      window.dispatchEvent(new Event("cheapchat:skills_updated"));
    } catch (e) {
      console.error("Failed to save skill", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAlwaysActive = async (skill: SkillItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const nextVal = skill.isAlwaysActive === 1 ? 0 : 1;
      await fetch("/api/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: skill.id,
          isAlwaysActive: nextVal === 1,
        }),
      });
      await loadSkills();
      window.dispatchEvent(new Event("cheapchat:skills_updated"));
    } catch (e) {
      console.error("Failed to toggle skill active state", e);
    }
  };

  const handleDeleteSkill = async (skill: SkillItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (skill.isDefault === 1) {
      alert("System default skills are protected and cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the skill "${skill.name}"?`)) return;

    try {
      const res = await fetch(`/api/skills?id=${skill.id}`, { method: "DELETE" });
      if (res.ok) {
        await loadSkills();
        window.dispatchEvent(new Event("cheapchat:skills_updated"));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete skill");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredSkills = skillsList.filter((s) => {
    const q = filterQuery.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.description || "").toLowerCase().includes(q) ||
      (s.content || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#100a0c] text-slate-200 select-none overflow-hidden border-r border-white/5 relative">
      {/* ── Top Bar Header ────────────────────────────────────────────────── */}
      <div className="p-3 border-b border-white/5 bg-[#170e10] flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search skills & rules..."
            className="w-full bg-[#11080a] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>

        {/* Plus (+) Button to Create Skill */}
        <button
          type="button"
          onClick={openCreateModal}
          className="p-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950/40 transition flex-shrink-0 cursor-pointer"
          title="Add New Skill (.agents/skills)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* ── Info & Antigravity Structure Banner ────────────────────────────── */}
      <div className="px-3 pt-2 pb-1">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Agent Skills & Antigravity Rules</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-snug">
            Stored in <span className="font-mono text-zinc-300">.agents/skills/&lt;name&gt;/SKILL.md</span>.
          </p>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Skills marked with <span className="text-rose-400 font-medium">Use every time</span> are always active. Others can be triggered anytime with <span className="text-zinc-300 font-mono">/ skill</span> in chat.
          </p>
        </div>
      </div>

      {/* ── Main Skills List Content ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
        {loading && skillsList.length === 0 ? (
          <SidebarCardsSkeleton count={4} />
        ) : filteredSkills.length === 0 ? (
          <div className="border border-white/5 bg-[#160d10]/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center my-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3 text-rose-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No skills found</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[220px]">
              Create custom skills with reusable instructions or trigger them via slash commands.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>Add First Skill</span>
            </button>
          </div>
        ) : (
          filteredSkills.map((skill) => {
            const isAlwaysActive = skill.isAlwaysActive === 1;
            const isDefault = skill.isDefault === 1;

            return (
              <div
                key={skill.id}
                className={`p-3 rounded-2xl border transition-all duration-150 flex flex-col gap-2 group ${
                  isAlwaysActive
                    ? "bg-[#190f12] border-rose-500/30 hover:border-rose-500/50 shadow-sm shadow-rose-950/20"
                    : "bg-[#130b0d] border-white/5 hover:border-white/10 opacity-90 hover:opacity-100"
                }`}
              >
                {/* Header Row: Title + Badges + Edit/Delete */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/15 border border-rose-500/25 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-xs text-slate-100 truncate block">
                        {skill.name}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isAlwaysActive && (
                      <span
                        className="text-[9px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm"
                        title="Active in all chats"
                      >
                        <Check className="w-2.5 h-2.5 text-rose-400" />
                        All Chats
                      </span>
                    )}

                    {isDefault ? (
                      <span
                        className="text-[9px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1"
                        title="Protected system default skill"
                      >
                        <Shield className="w-2.5 h-2.5" />
                        Default
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded-md">
                        Custom
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => openEditModal(skill, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
                      title="Edit skill"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {!isDefault && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSkill(skill, e)}
                        className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-white/10 transition"
                        title="Delete skill"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                {skill.description && (
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>
                )}

                {/* "Use every time" Toggle Checkbox & Chat Selection Row */}
                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleToggleAlwaysActive(skill, e)}
                    className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg transition border cursor-pointer ${
                      isAlwaysActive
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 bg-white/[0.03] border-white/5 hover:border-white/10"
                    }`}
                    title={isAlwaysActive ? "Always active in every chat (click to disable)" : "Click to enable in every chat automatically"}
                  >
                    {isAlwaysActive ? (
                      <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                    <span>{isAlwaysActive ? "Always Active" : "Always"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedSkills.includes(skill.name)) {
                          removeSelectedSkill(skill.name);
                        } else {
                          addSelectedSkill(skill.name);
                        }
                      }}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                        selectedSkills.includes(skill.name)
                          ? "bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm"
                          : "bg-white/[0.03] text-zinc-400 hover:text-white border-white/10 hover:bg-white/10"
                      }`}
                      title={selectedSkills.includes(skill.name) ? "Active in current chat (click to remove)" : "Add skill to current chat"}
                    >
                      <Sparkles className="w-2.5 h-2.5 text-zinc-400" />
                      <span>{selectedSkills.includes(skill.name) ? "In Chat" : "+ Chat"}</span>
                    </button>
                    <span className="text-[9px] text-zinc-600 font-mono hidden sm:inline">
                      /{skill.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 10)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal: Create / Edit Skill ────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#160d10] border border-red-500/30 rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="font-semibold text-sm text-white">
                  {editingId ? "Edit Skill" : "Create New Skill"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-3.5 pt-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Code Reviewer, UI Polisher"
                  className="w-full bg-[#11080a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={skillDesc}
                  onChange={(e) => setSkillDesc(e.target.value)}
                  placeholder="e.g. Audit code changes for security and maintainability"
                  className="w-full bg-[#11080a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Skill Instructions / Content (Markdown)
                </label>
                <textarea
                  rows={5}
                  value={skillContent}
                  onChange={(e) => setSkillContent(e.target.value)}
                  placeholder="# Skill Instructions&#10;Define rules, conventions, or constraints for this skill..."
                  className="w-full bg-[#11080a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 resize-none font-mono"
                />
              </div>

              {/* Checkbox: Use every time */}
              <div
                onClick={() => setSkillAlwaysActive(!skillAlwaysActive)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.06] transition"
              >
                {skillAlwaysActive ? (
                  <CheckSquare className="w-4 h-4 text-rose-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                )}
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-200">Use every time</p>
                  <p className="text-[10px] text-zinc-400">
                    Automatically inject into system prompt for every message without needing / slash command.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !skillName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-md shadow-red-950/50 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? "Saving..." : <><Check className="w-3.5 h-3.5" /> Save Skill</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
