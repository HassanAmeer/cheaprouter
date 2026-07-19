'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AreaChart } from '@/components/ui/charts';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import styles from './dashboard.module.css';
import { Zap, Key, Plug, LineChart, ArrowUpRight, ArrowDownRight, MessageSquare, Plus, Send, Shield, Activity, Clock } from 'lucide-react';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    api.summary().then(setSummary).catch(() => setSummary({ limit: 1000000, used: 0, remaining: 1000000, percent: 0, providers: 0 }));
    api.analytics().then((a) => { setUsage(a.usageOverTime); setAnalytics(a); }).catch(() => setUsage([]));
  }, []);

  const s = summary ?? { limit: 1000000, used: 0, remaining: 1000000, percent: 0, providers: 0 };
  const userName = user?.name?.split(' ')[0] ?? 'Developer';

  const recentActivity = [
    { icon: <MessageSquare size={14} />, bg: 'var(--color-primary-soft)', title: 'Chat request to GPT-4o', time: '2 min ago' },
    { icon: <Key size={14} />, bg: 'rgba(34,197,94,0.1)', title: 'New API key "Production" created', time: '1 hour ago' },
    { icon: <Plug size={14} />, bg: 'rgba(66,133,244,0.1)', title: 'OpenAI provider connected', time: '3 hours ago' },
    { icon: <Shield size={14} />, bg: 'rgba(217,119,6,0.1)', title: 'Account security settings updated', time: '1 day ago' },
    { icon: <Activity size={14} />, bg: 'var(--color-success-soft)', title: '15,240 tokens used via Claude 3.5', time: '2 days ago' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeTitle}>Welcome back, {userName}!</div>
        <div className={styles.welcomeSubtitle}>
          You&apos;ve used {s.percent}% of your monthly token limit. {s.remaining.toLocaleString()} tokens remaining.
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
            <Zap size={20} />
          </div>
          <div className={styles.statLabel}>Total Tokens Used</div>
          <div className={styles.statValue}>{s.used.toLocaleString()}</div>
          <span className={`${styles.statChange} ${styles.statChangeUp}`}>
            <ArrowUpRight size={12} /> 12.5%
          </span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
            <LineChart size={20} />
          </div>
          <div className={styles.statLabel}>Remaining Tokens</div>
          <div className={styles.statValue}>{s.remaining.toLocaleString()}</div>
          <span className={`${styles.statChange} ${styles.statChangeUp}`}>
            {s.percent < 80 ? 'Healthy' : 'Watch usage'}
          </span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(66,133,244,0.1)', color: '#4285F4' }}>
            <Plug size={20} />
          </div>
          <div className={styles.statLabel}>Connected Providers</div>
          <div className={styles.statValue}>{s.providers}</div>
          <span className={`${styles.statChange} ${styles.statChangeUp}`}>
            Active
          </span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(217,119,6,0.1)', color: 'var(--color-warning)' }}>
            <Clock size={20} />
          </div>
          <div className={styles.statLabel}>API Requests (7d)</div>
          <div className={styles.statValue}>{analytics?.totalTokens ? Math.round(analytics.totalTokens / 150) : 24}</div>
          <span className={`${styles.statChange} ${styles.statChangeUp}`}>
            <ArrowUpRight size={12} /> 8.3%
          </span>
        </div>
      </div>

      {/* Platform Credits Progress */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div className="card glass-card" style={{ flex: 1, minWidth: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>Platform Credits</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Monthly token allocation</p>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: s.percent > 80 ? 'var(--color-warning)' : 'var(--color-primary)' }}>
              {s.percent}%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${s.percent}%`,
                background: s.percent > 80
                  ? 'linear-gradient(90deg, #D97706, #F59E0B)'
                  : 'linear-gradient(90deg, var(--color-primary), #ff6b6b)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{s.used.toLocaleString()} used</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{s.limit.toLocaleString()} total</span>
          </div>
        </div>

        <div className="card glass-card" style={{ flex: 1, minWidth: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>BYOK Providers</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Unlimited usage with own keys</p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-success)', background: 'var(--color-success-soft)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
              ∞ Unlimited
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{s.providers}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Provider keys connected</p>
              <Link href="/dashboard/providers" style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Manage Providers <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '28px' }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
        </div>
        <div className={styles.quickActions}>
          <Link href="/dashboard/keys" className={styles.quickAction}>
            <div className={styles.quickActionIcon}><Plus size={18} /></div>
            <div>
              <div className={styles.quickActionText}>Create API Key</div>
              <div className={styles.quickActionDesc}>Generate a new key for your app</div>
            </div>
          </Link>
          <Link href="/chat" className={styles.quickAction}>
            <div className={styles.quickActionIcon}><Send size={18} /></div>
            <div>
              <div className={styles.quickActionText}>Open Chat Playground</div>
              <div className={styles.quickActionDesc}>Test models interactively</div>
            </div>
          </Link>
          <Link href="/dashboard/providers" className={styles.quickAction}>
            <div className={styles.quickActionIcon}><Plug size={18} /></div>
            <div>
              <div className={styles.quickActionText}>Add Provider</div>
              <div className={styles.quickActionDesc}>Connect your BYOK</div>
            </div>
          </Link>
          <Link href="/docs" className={styles.quickAction}>
            <div className={styles.quickActionIcon}><MessageSquare size={18} /></div>
            <div>
              <div className={styles.quickActionText}>View API Docs</div>
              <div className={styles.quickActionDesc}>Integration reference</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Usage Chart + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        <div className="card glass-card">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Usage Over Time</h2>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>This week</span>
          </div>
          <AreaChart data={usage ?? [
            { label: 'Mon', value: 0 },
            { label: 'Tue', value: 0 },
            { label: 'Wed', value: 0 },
            { label: 'Thu', value: 0 },
            { label: 'Fri', value: 0 },
            { label: 'Sat', value: 0 },
            { label: 'Sun', value: 0 },
          ]} />
        </div>

        <div className="card glass-card">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <Link href="/dashboard/analytics" className={styles.sectionLink}>View all</Link>
          </div>
          <div className={styles.activityList}>
            {recentActivity.map((item, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityIcon} style={{ background: item.bg, color: 'var(--color-text-main)' }}>
                  {item.icon}
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTitle}>{item.title}</div>
                  <div className={styles.activityTime}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
