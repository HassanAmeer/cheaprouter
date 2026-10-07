"use client";

import { useState } from "react";
import { Search, Eye, Trash2, MessageSquare, X, User } from "lucide-react";

interface ChatItem {
  id: string;
  userId: string;
  ownerUsername: string;
  title: string;
  model: string;
  provider: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

interface ChatTableProps {
  chats: ChatItem[];
  onRefresh: () => void;
}

export default function ChatTable({ chats, onRefresh }: ChatTableProps) {
  const [search, setSearch] = useState("");
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [transcriptMessages, setTranscriptMessages] = useState<any[]>([]);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.ownerUsername.toLowerCase().includes(search.toLowerCase()) ||
    c.model.toLowerCase().includes(search.toLowerCase())
  );

  const handleInspectTranscript = async (chat: ChatItem) => {
    setSelectedChat(chat);
    const res = await fetch(`/api/admin/chats?id=${chat.id}`);
    if (res.ok) {
      const data = await res.json();
      setTranscriptMessages(data.messages || []);
    }
  };

  const handleDeleteChat = async (id: string) => {
    if (confirm("Delete this conversation and all its messages?")) {
      await fetch(`/api/admin/chats?id=${id}`, { method: "DELETE" });
      onRefresh();
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter conversations by owner or model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Conversations Moderation Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Model</th>
              <th className="p-3">Messages</th>
              <th className="p-3">Last Activity</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-semibold text-white truncate max-w-xs">{c.title}</td>
                <td className="p-3 font-medium text-emerald-400">{c.ownerUsername}</td>
                <td className="p-3 font-mono text-[11px] text-slate-300">{c.model}</td>
                <td className="p-3 font-mono">{c.messageCount}</td>
                <td className="p-3 text-slate-400">{new Date(c.updatedAt).toLocaleString()}</td>
                <td className="p-3 text-right flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleInspectTranscript(c)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Read-Only Transcript Drawer"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteChat(c.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Read-Only Chat Transcript Drawer Drawer */}
      {selectedChat && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl">
          <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
            <div>
              <h3 className="font-bold text-xs text-white truncate max-w-xs">{selectedChat.title}</h3>
              <p className="text-[10px] text-emerald-400 font-mono">Owner: {selectedChat.ownerUsername}</p>
            </div>
            <button onClick={() => setSelectedChat(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {transcriptMessages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                  m.sender === "user" ? "bg-slate-900 border-white/10 text-slate-200" : "bg-slate-900/40 border-emerald-500/20 text-emerald-100"
                }`}
              >
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{m.sender}</span>
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
