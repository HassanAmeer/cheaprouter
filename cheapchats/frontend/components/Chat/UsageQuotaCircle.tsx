"use client";

import { useState } from "react";
import Tooltip from "@cheapchats/frontend/components/Common/Tooltip";
import { Zap } from "lucide-react";

export default function UsageQuotaCircle() {
  // Usage quota state (75% used, 25% grey)
  const [quotaPercent] = useState(75);
  const [usedTokens] = useState(7500);
  const [maxTokens] = useState(10000);
  const [showDetails, setShowDetails] = useState(false);

  // Compact size parameters
  const size = 20;
  const strokeWidth = 2;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Calculate dash offset for percentage fill (75% filled)
  const strokeDashoffset = circumference - (quotaPercent / 100) * circumference;

  return (
    <div className="relative flex items-center">
      <Tooltip content={`Usage Quota: ${quotaPercent}% (${usedTokens.toLocaleString()} / ${maxTokens.toLocaleString()} tokens)`} side="top">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="relative flex items-center justify-center p-0.5 rounded-full bg-transparent border-none transition duration-150 cursor-pointer opacity-70 hover:opacity-100 focus:outline-none"
        >
          {/* Dashed / Dotted Segmented Ring SVG (No background, no outer border) */}
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Grey Dashed Segments (25% remaining) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#2e2426"
              strokeWidth={strokeWidth}
              strokeDasharray="2 1.5"
            />
            {/* Active Muted Red Filled Dashed Segments (75% used) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#a82828"
              strokeWidth={strokeWidth}
              strokeDasharray="2 1.5"
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
        </button>
      </Tooltip>

      {/* Quota Details Popover Modal Card */}
      {showDetails && (
        <div className="absolute right-0 bottom-full mb-2.5 w-64 bg-[#160b0d]/95 backdrop-blur-xl rounded-2xl p-3.5 border border-red-500/30 shadow-2xl shadow-black/80 z-50 text-xs text-slate-200 space-y-2 select-none">
          <div className="flex items-center justify-between border-b border-red-500/15 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span>Usage Quota</span>
            </div>
            <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-semibold">
              {quotaPercent}% Used
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Tokens Used:</span>
              <span className="font-mono text-white font-semibold">{usedTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Monthly Limit:</span>
              <span className="font-mono text-slate-300">{maxTokens.toLocaleString()}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#251417] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-600 to-red-700 h-full rounded-full transition-all duration-300"
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
