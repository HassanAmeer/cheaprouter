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
