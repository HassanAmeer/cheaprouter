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
  const [activeFilter, setActiveFilter] = useState<'30' | '60' | '90' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

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

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats(data.stats);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, [activeFilter, startDate, endDate]);

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
          <div className={styles.statValue}>4</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>OpenAI, Anthropic, Google, DeepSeek</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Estimated Monthly Revenue <DollarSign size={16} />
          </div>
          <div className={styles.statValue}>$4,320</div>
          <div style={{ fontSize: '12px', color: '#10B981' }}>+12.5% vs last month</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            System Health <Activity size={16} />
          </div>
          <div className={styles.statValue} style={{ color: '#10B981' }}>99.9%</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>All proxy nodes operational</div>
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
              <tr>
                <td><span className={styles.badge} style={{ background: 'var(--color-bg-soft)', color: 'var(--color-text-main)' }}>User Signup</span></td>
                <td>john@example.com (John Doe)</td>
                <td style={{ color: 'var(--color-text-muted)' }}>Today</td>
              </tr>
              <tr>
                <td><span className={styles.badge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>API Key Created</span></td>
                <td>usr_2x8c (Alice Smith)</td>
                <td style={{ color: 'var(--color-text-muted)' }}>2 days ago</td>
              </tr>
              <tr>
                <td><span className={styles.badge} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>Plan Upgrade</span></td>
                <td>mike@tech.co (Upgraded to Pro)</td>
                <td style={{ color: 'var(--color-text-muted)' }}>25 days ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

