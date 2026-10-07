"use client";

import { useState, ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: "right" | "top" | "bottom" | "left";
}

export default function Tooltip({ content, children, side = "right" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const sideClasses = {
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute ${sideClasses[side]} z-50 px-2.5 py-1 text-[11px] font-medium text-slate-100 bg-slate-900 border border-white/10 rounded-lg shadow-xl whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
