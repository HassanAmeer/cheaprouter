"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  Moon,
  Bell,
  Key,
  Sliders,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserProfileMenu() {
  const { user, setActiveModal } = useAppStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userInitials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "DU";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Red Avatar Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-700 via-rose-600 to-red-500 border-2 border-red-400/50 flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-red-600/30 hover:scale-105 hover:border-red-300 transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-400/60"
        title={`${user?.username || "Demo User"} — click for account options`}
      >
        {userInitials}
      </button>

      {/* Red Glass Dropdown Menu */}
      {open && (
        <div className="absolute bottom-12 left-2 w-56 z-[200] glass-dropdown rounded-2xl border border-red-500/20 shadow-2xl shadow-black/80 overflow-hidden text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2">
          {/* User Info Header */}
          <div className="px-3 py-3 border-b border-red-500/15 bg-red-950/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-700 to-rose-600 flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-md shadow-red-600/20">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {user?.username || "Demo User"}
                </p>
                <p className="text-red-300 text-[10px] flex items-center gap-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      user?.role === "ADMIN" ? "bg-rose-400 animate-pulse" : "bg-red-400"
                    }`}
                  />
                  {user?.role || "USER"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1 space-y-0.5">
            <button
              onClick={() => {
                router.push("/chats/settings");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/15 transition text-left group"
            >
              <Key className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>API Keys & Providers</span>
              <ChevronRight className="w-3 h-3 text-slate-500 ml-auto group-hover:text-red-300 transition" />
            </button>

            <button
              onClick={() => {
                router.push("/chats/settings");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/15 transition text-left group"
            >
              <Sliders className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Preferences</span>
              <ChevronRight className="w-3 h-3 text-slate-500 ml-auto group-hover:text-red-300 transition" />
            </button>

            <button
              onClick={() => {
                setActiveModal("settings");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/15 transition text-left group"
            >
              <Bell className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Notifications</span>
              <ChevronRight className="w-3 h-3 text-slate-500 ml-auto group-hover:text-red-300 transition" />
            </button>

            <button
              onClick={() => {
                setActiveModal("settings");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/15 transition text-left group"
            >
              <Moon className="w-4 h-4 text-rose-300 flex-shrink-0" />
              <span>Appearance (Red Obsidian)</span>
              <ChevronRight className="w-3 h-3 text-slate-500 ml-auto group-hover:text-red-300 transition" />
            </button>

            {/* Admin Panel Link — for ADMIN role */}
            {user?.role === "ADMIN" && (
              <button
                onClick={() => {
                  router.push("/admin");
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-600/25 transition text-left group"
              >
                <Shield className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-300 font-semibold">Admin Panel</span>
                <ChevronRight className="w-3 h-3 text-red-400 ml-auto group-hover:text-white transition" />
              </button>
            )}
          </div>

          {/* Divider + Logout */}
          <div className="p-1 border-t border-red-500/15">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 transition text-left"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
