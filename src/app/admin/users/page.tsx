'use client';
import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Search, MoreVertical, Edit2, Ban, Mail } from 'lucide-react';

const MOCK_USERS = [
  { id: 'usr_1a9b', name: 'John Doe', email: 'john@example.com', plan: 'Free', calls: 1450, status: 'Active' },
  { id: 'usr_2x8c', name: 'Alice Smith', email: 'alice@startup.io', plan: 'Pro', calls: 89200, status: 'Active' },
  { id: 'usr_9z1l', name: 'Bob Johnson', email: 'bob@agency.com', plan: 'Free', calls: 0, status: 'Inactive' },
  { id: 'usr_7q4w', name: 'Eve Hacker', email: 'eve@shadow.net', plan: 'Free', calls: 4000, status: 'Suspended' },
  { id: 'usr_5p2m', name: 'Michael Tech', email: 'mike@tech.co', plan: 'Pro', calls: 120500, status: 'Active' },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = MOCK_USERS.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>User Management</h2>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              background: 'var(--color-card-bg)', 
              border: '1px solid var(--color-border)', 
              padding: '10px 16px 10px 36px', 
              borderRadius: '8px',
              color: 'var(--color-text-main)',
              outline: 'none',
              width: '260px'
            }} 
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name / Email</th>
              <th>Plan</th>
              <th>API Calls</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{user.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{user.email}</div>
                </td>
                <td>
                  <span className={`${styles.badge} ${user.plan === 'Pro' ? styles.badgePro : ''}`} style={{ background: user.plan === 'Free' ? 'var(--color-bg-soft)' : undefined, color: user.plan === 'Free' ? 'var(--color-text-muted)' : undefined }}>
                    {user.plan}
                  </span>
                </td>
                <td>{user.calls.toLocaleString()}</td>
                <td>
                  <span className={`${styles.badge} ${user.status === 'Active' ? styles.badgeActive : styles.badgeInactive}`}>
                    {user.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className={styles.actionBtn} title="Email User"><Mail size={14} /></button>
                    <button className={styles.actionBtn} title="Edit User"><Edit2 size={14} /></button>
                    <button className={styles.actionBtn} title="Suspend"><Ban size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                  No users found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
