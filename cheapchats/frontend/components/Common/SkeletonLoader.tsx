"use client";

import React from "react";

/**
 * ConversationThreadSkeleton
 * Renders an ultra-premium simulated chat conversation skeleton with shimmer wave animation
 */
export function ConversationThreadSkeleton() {
  return (
    <div className="flex-1 w-full max-w-3xl min-w-0 mx-auto px-4 py-8 space-y-7 overflow-hidden select-none animate-in fade-in duration-200">
      {/* 1. Assistant Message Skeleton */}
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl shimmer-effect border border-red-500/15 flex-shrink-0" />
        <div className="flex-1 space-y-2.5 max-w-xl">
          <div className="h-4 w-32 rounded-md shimmer-effect opacity-70" />
          <div className="space-y-2 pt-1">
            <div className="h-3.5 w-[92%] rounded-md shimmer-effect" />
            <div className="h-3.5 w-[85%] rounded-md shimmer-effect" />
            <div className="h-3.5 w-[65%] rounded-md shimmer-effect" />
          </div>
        </div>
      </div>

      {/* 2. User Message Skeleton (Right-aligned) */}
      <div className="flex justify-end items-start gap-3">
        <div className="w-[58%] sm:w-[48%] p-3.5 rounded-2xl rounded-tr-sm shimmer-effect-red border border-red-500/20 space-y-2 shadow-sm">
          <div className="h-3.5 w-[88%] rounded-md bg-white/20" />
          <div className="h-3.5 w-[60%] rounded-md bg-white/20" />
        </div>
        <div className="w-8 h-8 rounded-xl shimmer-effect-red border border-red-500/25 flex-shrink-0" />
      </div>

      {/* 3. Assistant Message with Code Block Skeleton */}
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl shimmer-effect border border-red-500/15 flex-shrink-0" />
        <div className="flex-1 space-y-3 max-w-2xl">
          <div className="h-4 w-28 rounded-md shimmer-effect opacity-70" />
          <div className="space-y-2">
            <div className="h-3.5 w-[96%] rounded-md shimmer-effect" />
            <div className="h-3.5 w-[80%] rounded-md shimmer-effect" />
          </div>
          {/* Mock Code Block Container */}
          <div className="rounded-xl border border-white/5 p-4 space-y-2.5 bg-black/30">
            <div className="h-3 w-36 rounded shimmer-effect opacity-80" />
            <div className="h-3 w-[75%] rounded shimmer-effect" />
            <div className="h-3 w-[88%] rounded shimmer-effect" />
            <div className="h-3 w-[50%] rounded shimmer-effect" />
          </div>
          <div className="h-3.5 w-[70%] rounded-md shimmer-effect" />
        </div>
      </div>

      {/* 4. Second User Message Skeleton */}
      <div className="flex justify-end items-start gap-3">
        <div className="w-[45%] sm:w-[38%] p-3.5 rounded-2xl rounded-tr-sm shimmer-effect-red border border-red-500/20 space-y-2 shadow-sm">
          <div className="h-3.5 w-[90%] rounded-md bg-white/20" />
        </div>
        <div className="w-8 h-8 rounded-xl shimmer-effect-red border border-red-500/25 flex-shrink-0" />
      </div>

      {/* 5. Incoming Assistant Typing Skeleton */}
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl shimmer-effect border border-red-500/15 flex-shrink-0" />
        <div className="flex-1 space-y-2 max-w-lg">
          <div className="h-3.5 w-[70%] rounded-md shimmer-effect" />
          <div className="h-3.5 w-[45%] rounded-md shimmer-effect" />
        </div>
      </div>
    </div>
  );
}

/**
 * SidebarChatsSkeleton
 * Skeletons for sidebar chat history list
 */
export function SidebarChatsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="px-2 py-1 space-y-2 select-none animate-in fade-in duration-150">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`chat-skel-${i}`}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.03]"
        >
          <div className="w-6 h-6 rounded-lg shimmer-effect flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div
              className="h-3 rounded-md shimmer-effect"
              style={{ width: `${Math.max(50, 85 - (i * 7))}%` }}
            />
            <div className="h-2 w-16 rounded shimmer-effect opacity-50" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * SidebarCardsSkeleton
 * Skeletons for Sidebar Cards: Skills, Memories, Agents, Prompts
 */
export function SidebarCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2.5 select-none animate-in fade-in duration-150">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`card-skel-${i}`}
          className="p-3 rounded-2xl border border-white/5 bg-[#140b0e]/70 space-y-2.5"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-6 h-6 rounded-lg shimmer-effect flex-shrink-0" />
              <div
                className="h-3 rounded-md shimmer-effect"
                style={{ width: `${Math.max(55, 75 - (i * 6))}%` }}
              />
            </div>
            <div className="w-12 h-4 rounded-md shimmer-effect opacity-60 flex-shrink-0" />
          </div>

          {/* Description Lines */}
          <div className="space-y-1.5 pt-0.5">
            <div className="h-2.5 w-[92%] rounded shimmer-effect opacity-80" />
            <div className="h-2.5 w-[65%] rounded shimmer-effect opacity-60" />
          </div>

          {/* Footer Toggle Row */}
          <div className="pt-1.5 border-t border-white/5 flex items-center justify-between">
            <div className="w-20 h-3 rounded shimmer-effect opacity-50" />
            <div className="w-12 h-2.5 rounded shimmer-effect opacity-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * SettingsAccountSkeleton
 * Ultra-sleek shimmer skeleton for Settings Account tab
 */
export function SettingsAccountSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#202126] via-[#191a1e] to-[#17181c] shadow-xl shadow-black/20 select-none animate-in fade-in duration-200">
      <div className="flex items-center gap-4 border-b border-white/[0.07] p-5 sm:p-6">
        <div className="h-14 w-14 shrink-0 rounded-full shimmer-effect-red border border-red-500/25" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-36 rounded-md shimmer-effect" />
            <div className="h-4 w-20 rounded-full shimmer-effect opacity-50" />
          </div>
          <div className="h-3.5 w-48 rounded shimmer-effect opacity-50" />
        </div>
      </div>

      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
        <div className="bg-[#191a1e] p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded shimmer-effect opacity-60" />
            <div className="h-3 w-24 rounded shimmer-effect opacity-60" />
          </div>
          <div className="h-4 w-44 rounded shimmer-effect" />
        </div>
        <div className="bg-[#191a1e] p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded shimmer-effect opacity-60" />
            <div className="h-3 w-20 rounded shimmer-effect opacity-60" />
          </div>
          <div className="h-4 w-20 rounded shimmer-effect" />
        </div>
      </div>
      <div className="border-t border-white/[0.07] px-5 py-3">
        <div className="h-3 w-56 rounded shimmer-effect opacity-40" />
      </div>
    </div>
  );
}

/**
 * SettingsStatsSkeleton
 * Shimmer skeleton for Top 3 Analytics Cards
 */
export function SettingsStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 select-none animate-in fade-in duration-150">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#202126] via-[#191a1e] to-[#17181c] p-4 shadow-lg shadow-black/20 space-y-2.5">
        <div className="h-3 w-24 rounded shimmer-effect opacity-60" />
        <div className="h-7 w-16 rounded-md shimmer-effect" />
        <div className="h-2.5 w-44 rounded shimmer-effect opacity-50" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#202126] via-[#191a1e] to-[#17181c] p-4 shadow-lg shadow-black/20 space-y-2.5">
        <div className="h-3 w-36 rounded shimmer-effect opacity-60" />
        <div className="h-7 w-12 rounded-md shimmer-effect" />
        <div className="h-2.5 w-40 rounded shimmer-effect opacity-50" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#122019] via-[#151a1e] to-[#111419] p-4 shadow-lg shadow-black/20 space-y-2.5">
        <div className="h-3 w-36 rounded shimmer-effect opacity-60" />
        <div className="h-7 w-14 rounded-md shimmer-effect" />
        <div className="h-2.5 w-36 rounded shimmer-effect opacity-50" />
      </div>
    </div>
  );
}

/**
 * SettingsProviderGridSkeleton
 * Ultra-realistic shimmer skeleton for Providers Cards Grid
 */
export function SettingsProviderGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 select-none animate-in fade-in duration-200">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`prov-skel-${i}`}
          className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#242831]/80 via-[#191c22]/80 to-[#111419]/80 p-5 shadow-lg shadow-black/20 overflow-hidden space-y-3.5"
        >
          {/* Top subtle accent bar */}
          <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full shimmer-effect opacity-40" />

          {/* Provider Header (Icon + Name + Key badge) */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 flex-shrink-0 rounded-xl shimmer-effect border border-white/10" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <div
                  className="h-4 rounded-md shimmer-effect"
                  style={{ width: `${Math.max(45, 80 - (i % 3) * 12)}%` }}
                />
                <div className="h-2.5 w-24 rounded shimmer-effect opacity-60" />
              </div>
            </div>
            <div className="h-5 w-16 rounded-full shimmer-effect opacity-70 flex-shrink-0" />
          </div>

          {/* Endpoint Section */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 w-14 rounded shimmer-effect opacity-50" />
            <div className="h-3 w-[85%] rounded shimmer-effect opacity-70 font-mono" />
          </div>

          {/* Footer Action Row */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div className="h-3 w-28 rounded shimmer-effect opacity-50" />
            <div className="h-3 w-3 rounded shimmer-effect opacity-40" />
          </div>
        </div>
      ))}
    </div>
  );
}
