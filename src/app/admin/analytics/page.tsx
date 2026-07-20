'use client';
import React from 'react';
import styles from '../admin.module.css';
import { Activity, DollarSign, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Analytics & Revenue</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Financial overview and platform-wide token usage metrics.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>Monthly Recurring Revenue (MRR) <DollarSign size={16} /></div>
          <div className={styles.statValue}>$4,320</div>
          <div style={{ fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            <TrendingUp size={14} /> +12.5% from last month
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>Total Provider Costs <Activity size={16} /></div>
          <div className={styles.statValue}>$1,105</div>
          <div style={{ fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            <TrendingUp size={14} /> +8.2% from last month
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>Gross Margin <PieChartIcon size={16} /></div>
          <div className={styles.statValue}>74.4%</div>
          <div style={{ fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            Healthy margin
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Mock Chart Area */}
        <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>API Requests (Last 7 Days)</h3>
          
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingTop: '20px' }}>
            {[45, 60, 35, 80, 50, 95, 70].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '100%', 
                  height: `${h}%`, 
                  background: 'linear-gradient(180deg, var(--color-primary), rgba(255, 59, 59, 0.1))',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 1s ease'
                }} />
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Model Usage Pie */}
        <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Model Distribution</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'GPT-4o', percent: 45, color: '#10A37F' },
              { name: 'Claude 3.5 Sonnet', percent: 30, color: '#D97757' },
              { name: 'Gemini 1.5 Pro', percent: 15, color: '#4285F4' },
              { name: 'Llama 3', percent: 10, color: '#0668E1' },
            ].map(model => (
              <div key={model.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{model.name}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{model.percent}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-soft)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${model.percent}%`, height: '100%', background: model.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
