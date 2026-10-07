"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Key,
  ShieldAlert,
  Bot,
  ScrollText,
  ArrowLeft,
  Shield,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Chat Moderation", href: "/admin/chats", icon: MessageSquare },
    { label: "Endpoints & Keys", href: "/admin/endpoints", icon: Key },
    { label: "Roles & Matrix", href: "/admin/groups", icon: ShieldAlert },
    { label: "Agent Moderation", href: "/admin/agents", icon: Bot },
    { label: "Audit & Error Logs", href: "/admin/logs", icon: ScrollText },
  ];

  return (
    <aside className="w-64 h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col z-20 flex-shrink-0">
      {/* Top Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white">Admin Panel</h1>
            <p className="text-[10px] text-emerald-400 font-mono">CheapChat A-to-Z</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition duration-150 ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Back to Chat App button */}
      <div className="p-3 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Chat</span>
        </Link>
      </div>
    </aside>
  );
}
