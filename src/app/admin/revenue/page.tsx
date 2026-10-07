'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import { 
  DollarSign, Users, Zap, Crown, Cpu, Award, 
  ArrowUpRight, RefreshCw, Flame, Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

function formatTokens(num: number): string {
  if (!num || isNaN(num)) return '0';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function PlanBadge({ plan }: { plan: string }) {
  const p = (plan || 'Free').toLowerCase();
  const isPrem = p.includes('prem') || p.includes('enterprise');
  const isPro = !isPrem && (p.includes('pro') || p.includes('starter'));
  
  if (isPrem) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px',
        background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.35)'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
        Premium
      </span>
    );
  }
  if (isPro) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px',
        background: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6' }} />
        Pro
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px',
      background: 'rgba(150, 150, 150, 0.1)', color: 'var(--color-text-muted)', border: '1px solid rgba(150, 150, 150, 0.25)'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-muted)' }} />
      Free
    </span>
  );
}

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState<'7d' | '15d' | '30d' | 'last_month' | 'all'>('all');

  const fetchAnalytics = (range = activeRange) => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${range}`, { 
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` } 
    })
      .then(res => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          return res.json().catch(() => null);
        }
        return null;
      })
      .then(d => { if (d) setData(d); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics(activeRange);
  }, [activeRange]);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '60px', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>Loading revenue & consumption analytics...</span>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const estimatedRevenue = data?.totalRevenue ?? 0;
  const planStats = data?.planStats ?? {
    freeUsersCount: 0,
    proUsersCount: 0,
    premiumUsersCount: 0,
    freeTokens: 0,
    proTokens: 0,
    premiumTokens: 0,
  };

  const periodStats = data?.periodStats ?? {
    '7d': 0,
    '15d': 0,
    '30d': 0,
    'last_month': 0,
    'all': estimatedRevenue
  };

  const topModels = data?.topModels || [];
  const mostUsedModel = data?.mostUsedModel || topModels[0] || null;
  const topTokenUsers = data?.topTokenUsers || [];

  // Setup Chart.js Data
  const trendLabels = data?.revenueTrend?.map((d: any) => d.date) || [];
  const trendRevenue = data?.revenueTrend?.map((d: any) => d.revenue) || [];
  const trendCost = data?.revenueTrend?.map((d: any) => d.cost) || [];

  const chartData = {
    labels: trendLabels.length > 0 ? trendLabels : ['No Data in Selected Window'],
    datasets: [
      {
        fill: true,
        label: 'Revenue ($)',
        data: trendRevenue.length > 0 ? trendRevenue : [0],
        borderColor: '#10B981',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          return gradient;
        },
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        fill: true,
        label: 'Cost ($)',
        data: trendCost.length > 0 ? trendCost : [0],
        borderColor: '#EF4444',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
          return gradient;
        },
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#888',
          usePointStyle: true,
          boxWidth: 8,
          font: { family: 'Inter, sans-serif', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#888', maxTicksLimit: 12, font: { family: 'Inter, sans-serif' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#888',
          font: { family: 'Inter, sans-serif' },
          callback: function(value: any) { return '$' + value; }
        }
      }
    }
  };

  const currentWindowRevenue = periodStats[activeRange] ?? estimatedRevenue;

  const RANGE_LABELS: Record<string, string> = {
    '7d': 'Last 7 Days',
    '15d': 'Last 15 Days',
    '30d': 'Last 30 Days',
    'last_month': 'Last Month',
    'all': 'All Time'
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .revenue-card {
          background: var(--color-card-bg);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .revenue-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          color: var(--color-text-muted);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-card-bg-2, rgba(255,255,255,0.02));
        }
        td {
          padding: 14px 16px;
          font-size: 13px;
          color: var(--color-text-main);
          border-bottom: 1px solid var(--color-border);
        }
        tr:last-child td {
          border-bottom: none;
        }
        tr:hover td {
          background: rgba(255,255,255, 0.02);
        }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', background: 'linear-gradient(90deg, var(--color-text-main) 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Revenue & Consumption
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Platform total revenue, user plan tiers, token consumption, and financial growth trends.
          </p>
        </div>
        <button
          onClick={() => fetchAnalytics(activeRange)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: '10px',
            background: 'var(--color-card-bg)', border: '1px solid var(--color-border)',
            color: 'var(--color-text-main)', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP CARDS ROW:
          1. Total Revenue Card
          2. Free Plan Card (Users + Tokens)
          3. Pro Plan Card (Subscriptions + Tokens)
          4. Premium Plan Card (Subscriptions + Tokens)
         ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* 1. TOTAL REVENUE CARD */}
        <div className="revenue-card" style={{
          background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, var(--color-card-bg) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Revenue
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#10B981', marginBottom: '8px' }}>
            ${estimatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            All-time calculated revenue (top-ups minus payouts)
          </div>
        </div>

        {/* 2. FREE USERS & TOKENS CARD */}
        <div className="revenue-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Free Plan
            </span>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px',
              background: 'rgba(150, 150, 150, 0.12)', color: 'var(--color-text-muted)', border: '1px solid rgba(150, 150, 150, 0.25)'
            }}>
              Free Tier
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {planStats.freeUsersCount.toLocaleString()}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Free Users
            </span>
          </div>

          {/* Divider Line as requested */}
          <div style={{ height: 1, background: 'var(--color-border)', margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Tokens Consumed (Free)
            </span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {formatTokens(planStats.freeTokens)} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>({planStats.freeTokens.toLocaleString()})</span>
            </span>
          </div>
        </div>

        {/* 3. PRO USERS & TOKENS CARD */}
        <div className="revenue-card" style={{
          border: '1px solid rgba(139, 92, 246, 0.35)',
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.04) 0%, var(--color-card-bg) 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pro Plan
            </span>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              $19 / mo
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#8B5CF6' }}>
              {planStats.proUsersCount.toLocaleString()}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Pro Subscriptions
            </span>
          </div>

          {/* Divider Line as requested */}
          <div style={{ height: 1, background: 'rgba(139, 92, 246, 0.25)', margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Tokens Consumed (Pro)
            </span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#8B5CF6' }}>
              {formatTokens(planStats.proTokens)} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>({planStats.proTokens.toLocaleString()})</span>
            </span>
          </div>
        </div>

        {/* 4. PREMIUM USERS & TOKENS CARD */}
        <div className="revenue-card" style={{
          border: '1px solid rgba(245, 158, 11, 0.35)',
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.04) 0%, var(--color-card-bg) 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Premium Plan
            </span>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              $49 / mo
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#F59E0B' }}>
              {planStats.premiumUsersCount.toLocaleString()}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Premium Subscriptions
            </span>
          </div>

          {/* Divider Line as requested */}
          <div style={{ height: 1, background: 'rgba(245, 158, 11, 0.25)', margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Tokens Consumed (Premium)
            </span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#F59E0B' }}>
              {formatTokens(planStats.premiumTokens)} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>({planStats.premiumTokens.toLocaleString()})</span>
            </span>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: REVENUE CHART WITH PERIOD FILTERS
          (Last 7 Days, 15 Days, 30 Days, Last Month, All Time)
         ───────────────────────────────────────────────────────────── */}
      <div className="revenue-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: '22px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Revenue Growth & Trend</h3>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: 4, marginLeft: 44 }}>
              Filter revenue performance by time period: 7 Days, 15 Days, 30 Days, Last Month, or All Time.
            </p>
          </div>

          {/* Filter Range Switcher Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
            {(['7d', '15d', '30d', 'last_month', 'all'] as const).map((r) => {
              const active = activeRange === r;
              return (
                <button
                  key={r}
                  onClick={() => setActiveRange(r)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: active ? 700 : 500,
                    background: active ? 'var(--color-primary)' : 'transparent',
                    color: active ? '#fff' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {RANGE_LABELS[r]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Period Stats Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px', borderRadius: '12px',
          background: 'var(--color-bg)', border: '1px solid var(--color-border)',
          marginBottom: '20px', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Revenue for <strong style={{ color: 'var(--color-text-main)' }}>{RANGE_LABELS[activeRange]}</strong>:
            </span>
            <strong style={{ fontSize: '18px', color: '#10B981' }}>
              ${currentWindowRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <span>Last Month: <strong style={{ color: 'var(--color-text-main)' }}>${periodStats['last_month']?.toFixed(2) ?? '0.00'}</strong></span>
            <span>All Time: <strong style={{ color: 'var(--color-text-main)' }}>${periodStats['all']?.toFixed(2) ?? '0.00'}</strong></span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div style={{ height: '320px', width: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: AI MODELS CONSUMPTION TELEMETRY
         ───────────────────────────────────────────────────────────── */}
      <div className="revenue-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>AI Models Consumption & Telemetry</h3>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: 4, marginLeft: 44 }}>
              Which models are used the most and how many tokens they have consumed.
            </p>
          </div>

          {mostUsedModel && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#EF4444', fontSize: '12px', fontWeight: 700
            }}>
              <Flame size={15} />
              <span>#1 Most Used: {mostUsedModel.model}</span>
            </div>
          )}
        </div>

        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Tokens Consumed</th>
                <th>Usage Share %</th>
                <th>Total Requests</th>
                <th>Revenue Generated</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {topModels.map((model: any, i: number) => {
                const percent = model.tokenPercent || 0;
                return (
                  <tr key={model.model || i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: 6,
                          background: i === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(150,150,150,0.1)',
                          color: i === 0 ? '#EF4444' : 'var(--color-text-muted)',
                          fontSize: '11px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {i + 1}
                        </span>
                        <div style={{ fontWeight: 600 }}>{model.model}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong style={{ color: 'var(--color-text-main)' }}>{formatTokens(model.tokens)}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {(model.tokens || 0).toLocaleString()} tokens
                        </div>
                      </div>
                    </td>
                    <td style={{ minWidth: 140 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(percent, 100)}%`, height: '100%', background: i === 0 ? '#EF4444' : 'var(--color-primary)' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', width: 38 }}>
                          {percent}%
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                      {(model.requests || 0).toLocaleString()} calls
                    </td>
                    <td style={{ fontWeight: 600, color: '#10B981' }}>
                      ${(model.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: 600 }}>
                        {model.margin || 85.6}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {topModels.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No model telemetry recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: TOP 10 USERS BY TOKEN CONSUMPTION
         ───────────────────────────────────────────────────────────── */}
      <div className="revenue-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Top 10 Users by Token Consumption</h3>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: 4, marginLeft: 44 }}>
              Ranking of users who have consumed the most tokens.
            </p>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {topTokenUsers.length} of 10 Ranked
          </span>
        </div>

        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>User / Account</th>
                <th>Active Plan</th>
                <th>Tokens Consumed</th>
                <th>API Requests</th>
                <th>Total Spend</th>
                <th style={{ textAlign: 'right' }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {topTokenUsers.map((u: any, i: number) => {
                const rankColor = i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#D97706' : 'var(--color-text-muted)';
                return (
                  <tr key={u.id || i}>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: '8px',
                        background: i < 3 ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                        color: rankColor, fontWeight: 800, fontSize: '12px'
                      }}>
                        #{i + 1}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{u.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{u.email}</div>
                      </div>
                    </td>
                    <td>
                      <PlanBadge plan={u.plan} />
                    </td>
                    <td>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#3B82F6' }}>{formatTokens(u.tokens)}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {(u.tokens || 0).toLocaleString()} tokens
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                      {(u.calls || 0).toLocaleString()} calls
                    </td>
                    <td style={{ fontWeight: 700, color: '#10B981' }}>
                      ${(u.spend || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/users/${u.id}`}>
                        <button
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-main)',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          View <ArrowUpRight size={13} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {topTokenUsers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No usage tokens recorded for users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
