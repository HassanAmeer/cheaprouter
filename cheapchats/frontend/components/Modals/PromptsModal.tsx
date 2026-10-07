"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import { X, FolderPlus, Search, Copy, Check } from "lucide-react";

export default function PromptsModal() {
  const { activeModal, setActiveModal } = useAppStore();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal === "prompts") {
      fetch("/api/prompts")
        .then((r) => r.json())
        .then((d) => setPrompts(d.prompts || []));
    }
  }, [activeModal]);

  if (activeModal !== "prompts") return null;

  const handleCreate = async () => {
    if (!title || !content) return;
    const res = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, content, isPublic: true }),
    });
    if (res.ok) {
      setTitle("");
      setContent("");
      const updated = await (await fetch("/api/prompts")).json();
      setPrompts(updated.prompts || []);
    }
  };

  const handleCopyPrompt = (p: any) => {
    navigator.clipboard.writeText(p.content);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = prompts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-dropdown rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4 text-xs text-slate-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">System Prompts Library</h2>
          </div>
          <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Prompts List */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search prompts by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
          {filtered.map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-semibold text-white">
                  <span>{p.title}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    {p.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 line-clamp-2 mt-1 font-mono">{p.content}</div>
              </div>
              <button
                onClick={() => handleCopyPrompt(p)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                {copiedId === p.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>

        {/* Create Prompt Form */}
        <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
          <label className="font-semibold text-slate-300">Add New System Prompt</label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Prompt Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Category (e.g. Coding)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleCreate}
              className="py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
            >
              Save Prompt
            </button>
          </div>
          <textarea
            placeholder="Prompt content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>
    </div>
  );
}
