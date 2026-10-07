"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  FileText,
  Sparkles,
  ChevronDown,
  Info,
  Edit3,
  Check,
  X,
  Plus,
} from "lucide-react";

const CATEGORIES = [
  "Ideas",
  "Travel",
  "Learning",
  "Writing",
  "Shopping",
  "Code",
  "Misc.",
  "Roleplay",
  "Finance",
];

const SPECIAL_VARIABLES = [
  {
    name: "Current Date",
    description: "Today's date and day of the week",
    tag: "{{current_date}}",
  },
  {
    name: "Current User",
    description: "Your account display name",
    tag: "{{current_user}}",
  },
  {
    name: "UTC ISO Datetime",
    description: "UTC datetime in ISO 8601 format",
    tag: "{{utc_iso_datetime}}",
  },
  {
    name: "Current Date & Time",
    description: "Local date and time in your timezone",
    tag: "{{current_date_time}}",
  },
];

export default function PromptEditorView() {
  const { activePromptId, setActivePromptId, setSidebarView } = useAppStore();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Ideas");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [command, setCommand] = useState("");
  const [specialVarsOpen, setSpecialVarsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load existing prompt details when editing an existing prompt
  useEffect(() => {
    if (activePromptId && activePromptId !== "new") {
      fetch("/api/prompts")
        .then((r) => r.json())
        .then((data) => {
          const found = (data.prompts || []).find((p: any) => p.id === activePromptId);
          if (found) {
            setTitle(found.title || found.name || "");
            setCategory(found.category || "Ideas");
            setContent(found.content || "");
            setDescription(found.description || "");
            setCommand(found.command || "");
          }
        })
        .catch(console.error);
    } else {
      // Blank template for new prompt
      setTitle("");
      setCategory("General");
      setContent("");
      setDescription("");
      setCommand("");
    }
  }, [activePromptId]);

  // Insert special variable tag at cursor position inside textarea
  const insertVariable = (varTag: string) => {
    if (!textareaRef.current) {
      setContent((prev) => prev + varTag);
    } else {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent =
        content.substring(0, start) + varTag + content.substring(end);
      setContent(newContent);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
            start + varTag.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
    setSpecialVarsOpen(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Prompt Name is required.");
      return;
    }
    if (!content.trim()) {
      alert("Prompt Text input is required.");
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");

    try {
      const isEditing = activePromptId && activePromptId !== "new";

      const res = await fetch(
        isEditing ? `/api/prompts/${activePromptId}` : "/api/prompts",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            category,
            content,
            description,
            command,
            isPublic: true,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSuccessMessage(isEditing ? "Prompt updated successfully!" : "Prompt created successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        if (!isEditing && data.promptId) {
          setActivePromptId(data.promptId);
        }
      } else {
        alert("Failed to save prompt.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving prompt.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#121212] text-slate-100 p-6 overflow-y-auto select-none">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-5">
        {/* Top Notification Banner */}
        {successMessage && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ── Row 1: Prompt Name* & Category Dropdown (Screenshot 2) ──────────── */}
        <div className="flex items-center justify-between gap-4">
          {/* Prompt Name Input */}
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Prompt Name*"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-xs text-slate-200 flex items-center gap-2 hover:border-white/30 transition min-w-[120px] justify-between"
            >
              <span>{category}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {categoryDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-[#1f1f1f] border border-white/10 rounded-xl p-1 shadow-2xl z-50 min-w-[140px] space-y-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                      category === cat
                        ? "bg-white/10 text-white font-semibold"
                        : "hover:bg-white/5 text-slate-300"
                    }`}
                  >
                    <span>{cat}</span>
                    {category === cat && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: Text Area Section + Special Variables (Screenshot 2) ─────── */}
        <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          {/* Header Row above Textarea */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Text*</span>
            </div>

            {/* Special variables dropdown button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSpecialVarsOpen(!specialVarsOpen)}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium transition px-2.5 py-1 rounded-lg hover:bg-white/5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Special variables</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Special variables Menu */}
              {specialVarsOpen && (
                <div className="absolute top-full right-0 mt-1 bg-[#1f1f1f] border border-white/15 rounded-2xl p-1.5 shadow-2xl z-50 w-72 space-y-1">
                  <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 border-b border-white/10 uppercase tracking-wider">
                    Special Variables
                  </div>
                  {SPECIAL_VARIABLES.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => insertVariable(v.tag)}
                      className="w-full text-left p-2 rounded-xl hover:bg-white/10 transition flex flex-col gap-0.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white group-hover:text-purple-300">
                          {v.name}
                        </span>
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                          {v.tag}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {v.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Text Area Input */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Prompt input"
            rows={10}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-white/30 leading-relaxed resize-y"
          />
        </div>

        {/* ── Row 3: Optional Description Input (Screenshot 2) ────────────────── */}
        <div className="relative flex items-center">
          <Info className="w-4 h-4 absolute left-3 text-slate-500" />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 120))}
            placeholder="Optional: Enter a description to display for the prompt"
            maxLength={120}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-14 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition"
          />
          <span className="absolute right-3 text-[10px] text-slate-500 font-mono">
            {description.length}/120
          </span>
        </div>

        {/* ── Row 4: Optional Command Input (Screenshot 2) ────────────────────── */}
        <div className="relative flex items-center">
          <Edit3 className="w-4 h-4 absolute left-3 text-slate-500" />
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value.slice(0, 56))}
            placeholder="Optional: Enter a command for the prompt or name will be used"
            maxLength={56}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-14 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition"
          />
          <span className="absolute right-3 text-[10px] text-slate-500 font-mono">
            {command.length}/56
          </span>
        </div>

        {/* ── Row 5: Action Button (Screenshot 2) ─────────────────────────────── */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#e0e0e0] hover:bg-white text-black font-semibold text-xs shadow-md transition disabled:opacity-50"
          >
            {isSaving
              ? "Saving..."
              : activePromptId && activePromptId !== "new"
              ? "Save Prompt"
              : "Create Prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
