"use client";

import { useState, useEffect } from "react";
import { Shield, Check, Save } from "lucide-react";

export default function PermissionsMatrix() {
  const [matrix, setMatrix] = useState<any>({
    USER: { webSearch: true, mcpTools: true, fileUploads: true, customPrompts: true, agentBuilder: true },
    ADMIN: { webSearch: true, mcpTools: true, fileUploads: true, customPrompts: true, agentBuilder: true, fullModeration: true }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/groups")
      .then((r) => r.json())
      .then((d) => {
        if (d.matrix) setMatrix(d.matrix);
      });
  }, []);

  const togglePermission = (role: "USER" | "ADMIN", perm: string) => {
    setMatrix({
      ...matrix,
      [role]: {
        ...matrix[role],
        [perm]: !matrix[role][perm],
      },
    });
  };

  const handleSave = async () => {
    await fetch("/api/admin/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matrix }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const permissions = [
    { key: "webSearch", label: "Web Search Tool Access" },
    { key: "mcpTools", label: "MCP Connectors Execution" },
    { key: "fileUploads", label: "File & Multi-Modal Attachments" },
    { key: "customPrompts", label: "System Prompts Library" },
    { key: "agentBuilder", label: "Custom Agent Builder" },
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4 text-xs text-slate-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-base font-bold text-white">Roles & Capabilities Matrix</h3>
            <p className="text-[11px] text-slate-400">Configure global permission toggles for USER vs ADMIN roles</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? "Capabilities Saved!" : "Save Matrix"}</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
        <table className="w-full text-left">
          <thead className="bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10">
            <tr>
              <th className="p-3">Capability / Feature</th>
              <th className="p-3 text-center">USER Role</th>
              <th className="p-3 text-center">ADMIN Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {permissions.map((p) => (
              <tr key={p.key} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-semibold text-white">{p.label}</td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={!!matrix.USER?.[p.key]}
                    onChange={() => togglePermission("USER", p.key)}
                    className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={!!matrix.ADMIN?.[p.key]}
                    onChange={() => togglePermission("ADMIN", p.key)}
                    className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
