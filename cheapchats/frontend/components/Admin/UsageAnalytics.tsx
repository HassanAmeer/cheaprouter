"use client";

import { TrendingUp, PieChart, Activity } from "lucide-react";

interface UsageAnalyticsProps {
  tokenChart: { day: string; tokens: number; cost: number }[];
  modelDistribution: { name: string; percentage: number; color: string }[];
}

export default function UsageAnalytics({ tokenChart = [], modelDistribution = [] }: UsageAnalyticsProps) {
  const maxTokens = Math.max(...tokenChart.map((d) => d.tokens), 20000);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Token & API Cost Usage Line Chart */}
      <div className="lg:col-span-2 glass-panel rounded-3xl p-5 border border-white/10 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Token Usage & Estimated Cost Trend</h3>
              <p className="text-[11px] text-slate-400">Tokens consumed over the last 7 days</p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
            Real-time SSE
          </span>
        </div>

        {/* SVG Chart */}
        <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-white/10 relative">
          {tokenChart.map((item, idx) => {
            const heightPercent = Math.min((item.tokens / maxTokens) * 100, 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] text-emerald-300 font-mono opacity-0 group-hover:opacity-100 transition duration-150">
                  {item.tokens.toLocaleString()}
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[32px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl group-hover:brightness-125 transition-all duration-300 shadow-lg shadow-emerald-500/20"
                />
                <span className="text-[11px] text-slate-400 font-medium">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Usage Distribution Pie Chart */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="font-bold text-sm text-white">Model Distribution</h3>
            <p className="text-[11px] text-slate-400">Usage breakdown by AI provider</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-3 pt-2">
          {modelDistribution.map((m, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">{m.name}</span>
                <span className="text-slate-400 font-mono">{m.percentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${m.percentage}%`, backgroundColor: m.color }}
                  className="h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
