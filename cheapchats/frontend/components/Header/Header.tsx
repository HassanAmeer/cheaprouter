"use client";

import Link from "next/link";
import ModelSelector from "./ModelSelector";
import IncognitoToggle from "./IncognitoToggle";
import HeaderOptions from "./HeaderOptions";
import DebugConsoleToggle from "./DebugConsoleToggle";
import { ArrowLeft, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="h-14 border-b border-[#1E232B] bg-[#0B0D10]/95 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none flex-shrink-0">
      {/* Left side: Back to Dashboard & Model Selector */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-[#15191E] border border-transparent hover:border-[#1E232B] transition flex-shrink-0"
          title="Back to CheapRouter Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <div className="h-4 w-px bg-[#1E232B] hidden sm:block flex-shrink-0" />

        <ModelSelector />
      </div>

      {/* Right side: Incognito, Live Preview, Debug Console, Settings */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <IncognitoToggle />
        <HeaderOptions />
        <DebugConsoleToggle />
        <Link
          href="/chats/settings"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#15191E] border border-[#1E232B] hover:border-slate-700 transition"
          title="CheapChats Settings & Providers"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
