"use client";

import { useState } from "react";
import {
  Search,
  UserPlus,
  Shield,
  Key,
  Ban,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  X,
  UserCheck,
} from "lucide-react";

interface UserItem {
  id: string;
  username: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BANNED";
  avatar?: string;
  createdAt: number;
  conversationsCount?: number;
  totalTokens?: number;
}

interface UserTableProps {
  users: UserItem[];
  onRefresh: () => void;
}

export default function UserTable({ users, onRefresh }: UserTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("1234");
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleResetPassword = async (userId: string, username: string) => {
    if (confirm(`Reset password for '${username}' to default '1234'?`)) {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "RESET_PASSWORD" }),
      });
      alert(`Password for '${username}' reset to 1234.`);
      onRefresh();
      setActiveMenuId(null);
    }
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const targetRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "CHANGE_ROLE", role: targetRole }),
    });
    onRefresh();
    setActiveMenuId(null);
  };

  const handleToggleBan = async (userId: string) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "TOGGLE_BAN" }),
    });
    onRefresh();
    setActiveMenuId(null);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (confirm(`Are you sure you want to delete user '${username}'?`)) {
      await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      onRefresh();
      setActiveMenuId(null);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) return;
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
    });
    if (res.ok) {
      setIsCreateOpen(false);
      setNewUsername("");
      setNewPassword("1234");
      onRefresh();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create user");
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">USER Role</option>
            <option value="ADMIN">ADMIN Role</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/20 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* Users Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Conversations</th>
              <th className="p-3">Tokens</th>
              <th className="p-3">Joined Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((u) => {
              const isMenuOpen = activeMenuId === u.id;
              return (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-white flex items-center gap-2.5">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                      alt={u.username}
                      className="w-7 h-7 rounded-full bg-slate-800 border border-white/10"
                    />
                    <span>{u.username}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                        u.role === "ADMIN"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : "bg-slate-800 text-slate-300 border-white/10"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`flex items-center gap-1 font-semibold text-[11px] ${
                        u.status === "ACTIVE" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {u.status === "ACTIVE" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{u.status}</span>
                    </span>
                  </td>
                  <td className="p-3 font-mono">{u.conversationsCount || 0}</td>
                  <td className="p-3 font-mono text-emerald-300">{(u.totalTokens || 0).toLocaleString()}</td>
                  <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right relative">
                    <button
                      onClick={() => setActiveMenuId(isMenuOpen ? null : u.id)}
                      className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Actions Dropdown */}
                    {isMenuOpen && (
                      <div className="absolute right-4 top-10 w-48 glass-dropdown rounded-2xl p-1.5 z-50 shadow-2xl border border-white/10 flex flex-col gap-1 text-xs text-slate-200">
                        <button
                          onClick={() => handleResetPassword(u.id, u.username)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-700 text-left"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span>Reset Pass (1234)</span>
                        </button>

                        <button
                          onClick={() => handleChangeRole(u.id, u.role)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-700 text-left"
                        >
                          <Shield className="w-3.5 h-3.5 text-purple-400" />
                          <span>Make {u.role === "ADMIN" ? "USER" : "ADMIN"}</span>
                        </button>

                        <button
                          onClick={() => handleToggleBan(u.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-700 text-left"
                        >
                          <Ban className="w-3.5 h-3.5 text-red-400" />
                          <span>{u.status === "ACTIVE" ? "Ban Account" : "Unban Account"}</span>
                        </button>

                        <div className="h-px bg-white/10 my-0.5" />

                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-red-500/20 text-red-400 text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete User</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create New User Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-dropdown rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4 text-xs text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Create New Test Account</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-300">Username</label>
                <input
                  type="text"
                  placeholder="e.g. user4"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-300">Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-300">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
              >
                Save User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
