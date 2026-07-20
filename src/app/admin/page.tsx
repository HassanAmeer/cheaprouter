'use client';
import React from 'react';
import styles from './admin.module.css';
import { Users, Server, DollarSign, Activity } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Total Users <Users size={16} />
          </div>
          <div className={styles.statValue}>1,248</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Active Providers <Server size={16} />
          </div>
          <div className={styles.statValue}>8</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Monthly Revenue <DollarSign size={16} />
          </div>
          <div className={styles.statValue}>$4,320</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            System Health <Activity size={16} />
          </div>
          <div className={styles.statValue} style={{ color: '#10B981' }}>99.9%</div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>Recent Activity</h3>
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
