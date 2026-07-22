'use client';
import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Activity, DollarSign, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, AreaChart, DonutChart } from '@/components/ui/charts';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500 }}>Loading system analytics...</span>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const hasData = data && data.totalTokens > 0;

  // Mock revenue metrics based on usage
  const estimatedCost = data?.totalCost ?? 1105.00;
  const estimatedRevenue = estimatedCost * 3.9; // Platform markup mock
  const marginPercent = ((estimatedRevenue - estimatedCost) / estimatedRevenue) * 100;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Analytics & Revenue</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Financial overview and platform-wide token usage metrics.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>Monthly Recurring Revenue (MRR) <DollarSign size={16} /></div>
          <div className={styles.statValue}>${estimatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div style={{ fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            <TrendingUp size={14} /> +12.5% from last month
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>Total Provider Costs <Activity size={16} /></div>
          <div className={styles.statValue}>${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div style={{ fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            Within expected budget
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>Gross Margin <PieChartIcon size={16} /></div>
          <div className={styles.statValue}>{marginPercent > 0 ? marginPercent.toFixed(1) : '74.4'}%</div>
          <div style={{ fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            Healthy margin
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>API Token Usage (Last 7 Days)</h3>
          {hasData ? (
            <AreaChart data={data.usageOverTime} />
          ) : (
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              No API token usage recorded yet.
            </div>
          )}
        </div>

        <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Cost Breakdown by Provider</h3>
          {hasData ? (
            <DonutChart data={data.costBreakdown} />
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              No provider cost recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Model Distribution Chart */}
      <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Top Models Used</h3>
        {hasData && data.topModels[0]?.model !== 'No data yet' ? (
          <BarChart data={data.topModels.map((m: any) => ({ label: m.model, value: Math.round(m.tokens) }))} />
        ) : (
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            No model usage data recorded yet.
          </div>
        )}
      </div>

      {/* Recent Activity Log */}
      <div>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>System Event Logs</h3>
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Event</th>
                <th>User / Entity</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className={styles.badge} style={{ background: 'var(--color-bg-soft)', color: 'var(--color-text-main)' }}>User Signup</span></td>
                <td>sarah@frontend.dev</td>
                <td style={{ color: 'var(--color-text-muted)' }}>2 minutes ago</td>
              </tr>
              <tr>
                <td><span className={styles.badge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>API Key Created</span></td>
                <td>usr_2x8c (Alice Smith)</td>
                <td style={{ color: 'var(--color-text-muted)' }}>15 minutes ago</td>
              </tr>
              <tr>
                <td><span className={styles.badge} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Provider Offline</span></td>
                <td>Meta Llama (Routing disabled)</td>
                <td style={{ color: 'var(--color-text-muted)' }}>1 hour ago</td>
              </tr>
              <tr>
                <td><span className={styles.badge} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>Plan Upgrade</span></td>
                <td>mike@tech.co (Upgraded to Pro)</td>
                <td style={{ color: 'var(--color-text-muted)' }}>3 hours ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
