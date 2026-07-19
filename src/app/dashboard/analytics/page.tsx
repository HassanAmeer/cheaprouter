'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, AreaChart, DonutChart } from '@/components/ui/charts';
import { Badge } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import styles from '../dashboard.module.css';
import { TrendingUp, Zap, DollarSign, BarChart3, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    api.analytics().then(setData).catch(() => setData({ usageOverTime: [], topModels: [], costBreakdown: [], totalTokens: 0, totalCost: 0 }));
  }, []);

  if (!data) return (
    <div className="card" style={{ padding: 64, textAlign: 'center', color: 'var(--color-text-muted)' }}>
      <div className={styles.emptyStateIcon}><BarChart3 size={28} /></div>
      <p>Loading analytics…</p>
    </div>
  );

  const hasData = data.totalTokens > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 6 }}>Usage Analytics</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Track your token consumption, model usage, and spending across all providers.
          </p>
        </div>
        {/* Time Range Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <Calendar size={14} style={{ marginLeft: 8, color: 'var(--color-text-muted)' }} />
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600,
                background: timeRange === range ? 'var(--color-card-bg)' : 'transparent',
                color: timeRange === range ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                boxShadow: timeRange === range ? 'var(--shadow-sm)' : 'none',
                border: 'none', transition: 'all 0.15s ease',
              }}
            >
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
            <Zap size={18} />
          </div>
          <div className={styles.statLabel}>Total Tokens</div>
          <div className={styles.statValue}>{data.totalTokens.toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
            <DollarSign size={18} />
          </div>
          <div className={styles.statLabel}>Total Cost</div>
          <div className={styles.statValue}>${data.totalCost?.toFixed(2) ?? '0.00'}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(66,133,244,0.1)', color: '#4285F4' }}>
            <TrendingUp size={18} />
          </div>
          <div className={styles.statLabel}>Avg Tokens/Day</div>
          <div className={styles.statValue}>{hasData ? Math.round(data.totalTokens / 7).toLocaleString() : '0'}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(217,119,6,0.1)', color: 'var(--color-warning)' }}>
            <BarChart3 size={18} />
          </div>
          <div className={styles.statLabel}>Models Used</div>
          <div className={styles.statValue}>{data.topModels?.filter((m: any) => m.model !== 'No data yet')?.length ?? 0}</div>
        </div>
      </div>

      {!hasData && (
        <div className="card" style={{ marginBottom: 24, padding: '24px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--color-primary-soft)', border: '1px solid rgba(204,0,0,0.1)' }}>
          <TrendingUp size={20} color="var(--color-primary)" />
          <div>
            <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: 2 }}>No usage data yet</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Send API requests or use the chat playground to start seeing analytics here.</p>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 4 }}>Token Usage Over Time</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Daily token consumption breakdown</p>
          </div>
          <Badge tone="primary">{data.totalTokens.toLocaleString()} total</Badge>
        </div>
        <AreaChart data={data.usageOverTime} />
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 4 }}>Top Models Used</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Ranked by token consumption</p>
          </div>
          {data.topModels[0]?.model === 'No data yet' ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
              <BarChart3 size={24} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px' }}>No model usage recorded yet</p>
            </div>
          ) : (
            <>
              <BarChart data={data.topModels.map((m: any) => ({ label: m.model.split(' ')[0], value: Math.round(m.tokens / 1000) }))} />
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 12, textAlign: 'center' }}>Values in thousands of tokens (K)</p>
            </>
          )}
        </div>

        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 4 }}>Cost Breakdown</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Spending distribution by provider</p>
          </div>
          {data.costBreakdown[0]?.label === 'No data yet' ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
              <DollarSign size={24} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px' }}>No cost data recorded yet</p>
            </div>
          ) : (
            <DonutChart data={data.costBreakdown} />
          )}
        </div>
      </div>
    </div>
  );
}
