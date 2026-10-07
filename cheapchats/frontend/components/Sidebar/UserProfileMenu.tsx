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
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserProfileMenu() {
  const { user, setActiveModal } = useAppStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userInitials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "US";

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
      {/* Sleek User Avatar Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-xl bg-[#15191E] hover:bg-[#1A1F26] border border-[#262C34] hover:border-slate-500 flex items-center justify-center font-bold text-xs text-slate-200 transition duration-150 cursor-pointer shadow-sm focus:outline-none"
        title={`${user?.username || "Account"} — options`}
      >
        {userInitials}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute bottom-12 left-2 w-60 z-[200] bg-[#15191E] rounded-2xl border border-[#262C34] shadow-2xl shadow-black/90 overflow-hidden text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* User Info Header */}
          <div className="px-3.5 py-3 border-b border-[#1E232B] bg-[#0F1217]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center font-bold text-xs text-red-300 flex-shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {user?.username || "Developer"}
                </p>
                <p className="text-slate-400 text-[10px] flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      user?.role === "ADMIN" ? "bg-red-400 animate-pulse" : "bg-emerald-400"
                    }`}
                  />
                  {user?.role || "USER"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => {
                router.push("/chats/settings");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#1A1F26] transition text-left group cursor-pointer"
            >
              <Key className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>API Keys & Providers</span>
              <ChevronRight className="w-3 h-3 text-slate-500 ml-auto group-hover:text-white transition" />
            </button>

            <button
              onClick={() => {
                router.push("/dashboard");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#1A1F26] transition text-left group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>CheapRouter Dashboard</span>
              <ChevronRight className="w-3 h-3 text-slate-500 ml-auto group-hover:text-white transition" />
            </button>

            {user?.role === "ADMIN" && (
              <button
                onClick={() => {
                  router.push("/admin");
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/15 transition text-left group cursor-pointer"
              >
                <Shield className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-300 font-semibold">Admin Panel</span>
                <ChevronRight className="w-3 h-3 text-red-400 ml-auto group-hover:text-white transition" />
              </button>
            )}

            <div className="my-1 border-t border-[#1E232B]" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 transition text-left group cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
