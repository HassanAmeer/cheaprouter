"use client";

import { useState } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import { Settings, Key, Shield, LogOut, ChevronUp, Bot } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserAccountMenu() {
  const { user, setUser, setActiveModal } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="relative border-t border-white/10 p-2 bg-slate-900/40">
      {/* Account Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-14 left-2 right-2 glass-dropdown rounded-2xl p-1.5 z-50 shadow-2xl border border-white/10 flex flex-col gap-1 text-xs text-slate-200">
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 font-semibold transition"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          <button
            onClick={() => {
              setActiveModal("settings");
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-700/60 text-left font-medium transition"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & Preferences</span>
          </button>

          <button
            onClick={() => {
              setActiveModal("settings");
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-700/60 text-left font-medium transition"
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>Provider API Keys</span>
          </button>

          <button
            onClick={() => {
              useAppStore.getState().setSidebarView("agents");
              useAppStore.getState().setSidebarOpen(true);
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-700/60 text-left font-medium transition"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Agent Builder</span>
          </button>

          <div className="h-px bg-white/10 my-0.5" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-400 text-left font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      )}

      {/* Main Account Trigger Card */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 transition duration-150"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col text-left truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white truncate">{user.username}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${user.role === "ADMIN" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-700 text-slate-300"}`}>
                {user.role}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate">Free Plan</span>
          </div>
        </div>
        <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
