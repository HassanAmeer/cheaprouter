'use client';
import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';
import { Users, UserPlus, Calendar, Filter, Server, DollarSign, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    last7Days: 0,
    last30Days: 0,
    filteredCount: 0
  });
  const [system, setSystem] = useState({ providersActive: 0, providersTotal: 0, mrr: 0, totalRevenue: 0, health: 100 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'30' | '60' | '90' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const tokenHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return { 'Authorization': `Bearer ${token || ''}` };
  };

  const fetchStats = () => {
    setLoading(true);
    let url = '/api/admin/users?';
    if (activeFilter !== 'all') {
      url += `filter=${activeFilter}&`;
    }
    if (activeFilter === 'custom') {
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          return res.json().catch(() => null);
        }
        return null;
      })
      .then(data => {
        // Prefer the server-computed stats (SQL COUNT(*) over ALL users). The
        // users array is capped at 50 rows by default, so deriving stats from
        // it undercounts everything once the platform has more users.
        const st = data && data.stats;
        if (st) {
          setStats({
            total: Number(st.total) || 0,
            today: Number(st.today) || 0,
            last7Days: Number(st.last7Days) || 0,
            last30Days: Number(st.last30Days) || 0,
            filteredCount: Number(st.filteredCount) || 0
          });
          return;
        }
        const users: any[] = (data && data.users) || [];
        const now = Date.now();
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        let filtered = users;
        if (activeFilter === 'custom' && startDate) {
          const s = new Date(startDate + 'T00:00:00').getTime();
          const e = endDate ? new Date(endDate + 'T23:59:59').getTime() : now;
          filtered = users.filter(u => {
            const t = new Date(u.created_at).getTime();
            return t >= s && t <= e;
          });
        } else if (activeFilter !== 'all') {
          const days = parseInt(activeFilter, 10) || 0;
          const cutoff = now - days * 86400000;
          filtered = users.filter(u => new Date(u.created_at).getTime() >= cutoff);
        }
        const byDay = (n: number) => users.filter(u => new Date(u.created_at).getTime() >= now - n * 86400000).length;
        setStats({
          total: users.length,
          today: users.filter(u => new Date(u.created_at) >= todayStart).length,
          last7Days: byDay(7),
          last30Days: byDay(30),
          filteredCount: filtered.length
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchSystem = () => {
    Promise.all([
      fetch('/api/admin/analytics', { headers: tokenHeader() }),
      fetch('/api/admin/providers', { headers: tokenHeader() })
    ])
      .then(async ([aRes, pRes]) => {
        const a = aRes.ok ? await aRes.json().catch(() => null) : null;
        const p = pRes.ok ? await pRes.json().catch(() => []) : [];
        const providers = Array.isArray(p) ? p : [];
        const active = providers.filter((x: any) => x.status === true || x.status === 'true').length;
        setSystem({
          providersActive: active,
          providersTotal: providers.length,
          mrr: a?.mrr ?? 0,
          totalRevenue: a?.totalRevenue ?? 0,
          health: providers.length ? Math.round((active / providers.length) * 100) : 100
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
  }, [activeFilter, startDate, endDate]);

  useEffect(() => {
    fetchSystem();
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    fetch('/api/admin/users', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.users) {
          setRecentUsers([...data.users]
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 8));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ─── FILTER CONTROLS BAR ─── */}
      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>
            <Filter size={15} color="var(--color-primary)" /> Filter Registration Date:
          </span>
          <button
            className={`${styles.filterPill} ${activeFilter === 'all' ? styles.filterPillActive : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Time
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === '30' ? styles.filterPillActive : ''}`}
            onClick={() => setActiveFilter('30')}
          >
            Last 30 Days
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === '60' ? styles.filterPillActive : ''}`}
            onClick={() => setActiveFilter('60')}
          >
            Last 60 Days
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === '90' ? styles.filterPillActive : ''}`}
            onClick={() => setActiveFilter('90')}
          >
            Last 90 Days
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'custom' ? styles.filterPillActive : ''}`}
            onClick={() => setActiveFilter('custom')}
          >
            Custom Range
          </button>
        </div>

        {activeFilter === 'custom' && (
          <div className={styles.customDateContainer}>
            <input
              type="date"
              className={styles.dateInput}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>to</span>
            <input
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div>
        )}

        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          Matching users: <strong style={{ color: 'var(--color-primary)' }}>{stats.filteredCount}</strong>
        </div>
      </div>

      {/* ─── REGISTERED USERS STATS CARDS ─── */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-main)' }}>
        User Registration Summary
      </h3>
      <div className={styles.statsGrid} style={{ marginBottom: '32px' }}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Total Users Registered <Users size={16} color="var(--color-primary)" />
          </div>
          <div className={styles.statValue}>{loading ? '...' : stats.total.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            All-time platform registrations
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Registered Today <UserPlus size={16} color="#10B981" />
          </div>
          <div className={styles.statValue} style={{ color: '#10B981' }}>{loading ? '...' : stats.today}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            New signups in the last 24h
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Registered Last 7 Days <Calendar size={16} color="#8B5CF6" />
          </div>
          <div className={styles.statValue} style={{ color: '#8B5CF6' }}>{loading ? '...' : stats.last7Days}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            New signups in past week
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Registered Last 30 Days <Calendar size={16} color="#F59E0B" />
          </div>
          <div className={styles.statValue} style={{ color: '#F59E0B' }}>{loading ? '...' : stats.last30Days}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            New signups in past month
          </div>
        </div>
      </div>

      {/* ─── SYSTEM OVERVIEW CARDS ─── */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-main)' }}>
        System Overview
      </h3>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Active Providers <Server size={16} />
          </div>
          <div className={styles.statValue}>{system.providersActive} / {system.providersTotal}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Enabled upstream providers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Estimated Monthly Revenue <DollarSign size={16} />
          </div>
          <div className={styles.statValue}>${system.mrr.toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: '#10B981' }}>{system.totalRevenue.toFixed(2)} total received</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Provider Health <Activity size={16} />
          </div>
          <div className={styles.statValue} style={{ color: '#10B981' }}>{system.health}%</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{system.providersActive} of {system.providersTotal} providers enabled</div>
        </div>
      </div>

      {/* ─── RECENT ACTIVITY LOG ─── */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Recent Activity</h3>
          <Link href="/admin/users" style={{ fontSize: '13px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Users <ArrowRight size={14} />
          </Link>
        </div>
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
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No user activity yet
                  </td>
                </tr>
              )}
              {recentUsers.map(u => (
                <tr key={u.id}>
                  <td><span className={styles.badge} style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>User Signup</span></td>
                  <td>{u.email} ({u.name})</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {(() => {
                      const t = new Date(u.created_at).getTime();
                      const days = Math.max(0, Math.floor((Date.now() - t) / 86400000));
                      if (days === 0) return 'Today';
                      if (days === 1) return '1 day ago';
                      return `${days} days ago`;
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

