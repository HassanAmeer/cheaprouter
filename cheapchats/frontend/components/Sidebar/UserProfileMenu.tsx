"use client";

import Tooltip from "@cheapchats/frontend/components/Common/Tooltip";
import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserProfileMenu() {
  const router = useRouter();

  return (
    <Tooltip content="Log in" side="right">
      <button
        type="button"
        onClick={() => router.push("/login")}
        aria-label="Log in"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-red-800/70 bg-gradient-to-br from-[#3a1118] via-[#240d12] to-[#171012] text-rose-200 shadow-[0_3px_12px_rgba(75,8,16,0.3)] transition hover:border-red-600 hover:from-[#50141d] hover:to-[#2b0d13] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700/70"
      >
        <UserRound className="h-4 w-4" />
      </button>
    </Tooltip>
  );
}
