"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import { X, Server, Plus, CheckCircle, Terminal } from "lucide-react";

export default function MCPServerModal() {
  const { activeModal, setActiveModal } = useAppStore();
  const [servers, setServers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("stdio");
  const [urlOrCommand, setUrlOrCommand] = useState("");


  useEffect(() => {
    if (activeModal === "mcpServer") {
      fetch("/api/mcp")
        .then((r) => r.json())
        .then((d) => setServers(d.servers || []));
    }
  }, [activeModal]);

  if (activeModal !== "mcpServer") return null;

  const handleAddServer = async () => {
    if (!name || !urlOrCommand) return;
    const res = await fetch("/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, urlOrCommand, tools: [{ name: "read_file" }] }),
    });
    if (res.ok) {
      setName("");
      setUrlOrCommand("");
      const updated = await (await fetch("/api/mcp")).json();
      setServers(updated.servers || []);
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this MCP server?")) return;
    try {
      await fetch(`/api/mcp?id=${id}`, { method: "DELETE" });
      const updated = await (await fetch("/api/mcp")).json();
      setServers(updated.servers || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl glass-dropdown rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4 text-xs text-slate-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">MCP (Model Context Protocol) Hub</h2>
          </div>
          <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing MCP Servers List */}
        <div className="space-y-2">
          <label className="font-semibold text-slate-300">Registered MCP Connectors</label>
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {servers.map((s) => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between group">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>{s.name}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                      {s.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.urlOrCommand}</div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <button
                    onClick={() => handleDeleteServer(s.id)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    title="Remove Server"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New MCP Server Form */}
        <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
          <label className="font-semibold text-slate-300">Register New MCP Server</label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Server Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="stdio">stdio</option>
              <option value="sse">SSE (HTTP)</option>
            </select>
            <input
              type="text"
              placeholder="Command / URL"
              value={urlOrCommand}
              onChange={(e) => setUrlOrCommand(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleAddServer}
            className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-600 transition mt-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add MCP Server</span>
          </button>
        </div>
      </div>
    </div>
  );
}
