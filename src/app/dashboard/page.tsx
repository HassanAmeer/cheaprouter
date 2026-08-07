'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AreaChart } from '@/components/ui/charts';
import { useAuth } from '@/components/auth-provider';
import { useSiteSettings } from '@/components/settings-provider';
import { api } from '@/lib/api';
import styles from './dashboard.module.css';
import pageStyles from '@/app/page.module.css';
import { Zap, Key, Plug, LineChart, ArrowUpRight, ArrowDownRight, MessageSquare, Plus, Send, Shield, Activity, Clock, Crown, Megaphone, X, Bell } from 'lucide-react';

export default function DashboardOverview() {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [summary, setSummary] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeFilter, setTimeFilter] = useState('7D');
  const [hideWelcome, setHideWelcome] = useState(false);
  const [recentNotify, setRecentNotify] = useState<any[]>([]);

  useEffect(() => {
    api.summary().then(setSummary).catch(() => setSummary({ limit: 1000000, used: 0, remaining: 1000000, percent: 0, providers: 0 }));
    api.analytics().then((a) => { setUsage(a.usageOverTime); setAnalytics(a); }).catch(() => setUsage([]));
    api.getNotifications().then((res) => setRecentNotify(res.notifications?.slice(0, 5) || [])).catch(() => {});
  }, []);

  const s = summary ?? { limit: 1000000, used: 0, remaining: 1000000, percent: 0, providers: 0 };
  const userName = user?.name?.split(' ')[0] ?? 'Developer';


  return (
    <div>
      {/* Welcome Banner */}
      {!hideWelcome && (
        <div className={styles.welcomeBanner} style={{ position: 'relative', overflow: 'hidden' }}>
          <div className={pageStyles.cardStarsBg} style={{ opacity: 0.6, zIndex: 0, pointerEvents: 'none' }}>
            <div className={`${pageStyles.cardStar} ${pageStyles.cardStar1}`} />
            <div className={`${pageStyles.cardStar} ${pageStyles.cardStar2}`} />
            <div className={`${pageStyles.cardStar} ${pageStyles.cardStar3}`} />
            <div className={`${pageStyles.cardStar} ${pageStyles.cardStar4}`} />
            <div className={`${pageStyles.cardStar} ${pageStyles.cardStar5}`} />
            <div className={`${pageStyles.cardStar} ${pageStyles.cardStar6}`} />
            <div className={`${pageStyles.cardShootingStar} ${pageStyles.cardShootingStar1}`} />
            <div className={`${pageStyles.cardShootingStar} ${pageStyles.cardShootingStar2}`} />
            <div className={`${pageStyles.cardShootingStar} ${pageStyles.cardShootingStar3}`} />
          </div>

          <div style={{ position: 'absolute', right: '80px', top: '50%', transform: 'translateY(-50%)', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }}>
            <Megaphone size={120} />
          </div>

          <button 
            onClick={() => setHideWelcome(true)}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, color: '#fff', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            title="Dismiss Announcement"
          >
            <X size={16} />
          </button>

          <div className={styles.welcomeTitle} style={{ position: 'relative', zIndex: 1 }}>
            {(settings.dashboardSettings.welcomeTitle || 'Welcome back, {userName}!').replace('{userName}', userName)}
          </div>
          <div className={styles.welcomeSubtitle} style={{ position: 'relative', zIndex: 1, maxWidth: '85%' }}>
            {(settings.dashboardSettings.welcomeSubtitle || "You've used {percent}% of your monthly token limit. {remaining} tokens remaining.")
              .replace('{percent}', s.percent.toString())
              .replace('{remaining}', s.remaining.toLocaleString())}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
            <Crown size={20} />
          </div>
          <div className={styles.statLabel}>Plan</div>
          <div className={styles.statValue} style={{ textTransform: 'capitalize' }}>{user?.plan || 'Free'}</div>
          <span className={`${styles.statChange} ${styles.statChangeUp}`}>
            Active
          </span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
            <Zap size={20} />
          </div>
          <div className={styles.statLabel}>Usage Tokens</div>
          <div className={styles.statValue}>{s.used.toLocaleString()}</div>
          <span className={`${styles.statChange} ${styles.statChangeUp}`}>
            <ArrowUpRight size={12} /> 12.5%
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

      {/* Plan Usage Progress */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div className="card glass-card" style={{ flex: 1, minWidth: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>Plan Usage</h3>
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
          <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Usage Over Time</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', '7D', '15D', '1M', '3M'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setTimeFilter(f)}
                  style={{ 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    border: '1px solid ' + (timeFilter === f ? 'var(--color-primary)' : 'var(--color-border)'), 
                    background: timeFilter === f ? 'var(--color-primary)' : 'transparent', 
                    color: timeFilter === f ? '#fff' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                  {f}
                </button>
              ))}
            </div>
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
            <h2 className={styles.sectionTitle}>Recent Notify</h2>
          </div>
          <div className={styles.activityList}>
            {recentNotify.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No recent notifications
              </div>
            )}
            {recentNotify.map((item, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityIcon} style={{ background: item.read ? 'var(--color-bg-soft)' : 'var(--color-primary-soft)', color: item.read ? 'var(--color-text-muted)' : 'var(--color-primary)' }}>
                  <Bell size={14} />
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTitle}>{item.title}</div>
                  <div className={styles.activityTime}>{new Date(item.created_at || new Date()).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
