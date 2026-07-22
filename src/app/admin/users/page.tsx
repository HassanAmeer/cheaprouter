'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import { Search, Edit2, Ban, Mail, Eye, ChevronLeft, ChevronRight, Trash2, Users, UserPlus, Calendar, Filter } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    let url = '/api/admin/users?';
    if (activeFilter !== 'all') url += `filter=${activeFilter}&`;
    if (activeFilter === 'custom') {
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
        if (data.stats) setStats(data.stats);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [activeFilter, startDate, endDate]);

  const toggleBan = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    
    fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    }).catch(err => {
      console.error(err);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: currentStatus } : u));
    });
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    const targetId = userToDelete.id;
    setUserToDelete(null);
    
    // Optimistic delete
    setUsers(prev => prev.filter(u => u.id !== targetId));
    
    fetch(`/api/admin/users/${targetId}`, {
      method: 'DELETE'
    })
    .catch(err => {
      console.error(err);
      fetchUsers();
    });
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>User Management</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage user accounts, view registration stats, and inspect access permissions.</p>
      </div>

      {/* ─── REGISTERED USERS STATS CARDS ─── */}
      <div className={styles.statsGrid} style={{ marginBottom: '28px' }}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Total Users Registered <Users size={16} color="var(--color-primary)" />
          </div>
          <div className={styles.statValue}>{loading ? '...' : stats.total.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>All platform registrations</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Registered Today <UserPlus size={16} color="#10B981" />
          </div>
          <div className={styles.statValue} style={{ color: '#10B981' }}>{loading ? '...' : stats.today}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Signups today</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Registered Last 7 Days <Calendar size={16} color="#8B5CF6" />
          </div>
          <div className={styles.statValue} style={{ color: '#8B5CF6' }}>{loading ? '...' : stats.last7Days}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Signups past 7 days</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            Registered Last 30 Days <Calendar size={16} color="#F59E0B" />
          </div>
          <div className={styles.statValue} style={{ color: '#F59E0B' }}>{loading ? '...' : stats.last30Days}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Signups past 30 days</div>
        </div>
      </div>

      {/* ─── FILTER CONTROLS BAR ─── */}
      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>
            <Filter size={15} color="var(--color-primary)" /> Registration Range:
          </span>
          <button
            className={`${styles.filterPill} ${activeFilter === 'all' ? styles.filterPillActive : ''}`}
            onClick={() => { setActiveFilter('all'); setCurrentPage(1); }}
          >
            All Time
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === '30' ? styles.filterPillActive : ''}`}
            onClick={() => { setActiveFilter('30'); setCurrentPage(1); }}
          >
            Last 30 Days
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === '60' ? styles.filterPillActive : ''}`}
            onClick={() => { setActiveFilter('60'); setCurrentPage(1); }}
          >
            Last 60 Days
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === '90' ? styles.filterPillActive : ''}`}
            onClick={() => { setActiveFilter('90'); setCurrentPage(1); }}
          >
            Last 90 Days
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'custom' ? styles.filterPillActive : ''}`}
            onClick={() => { setActiveFilter('custom'); setCurrentPage(1); }}
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
              onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>to</span>
            <input
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
        )}

        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ 
              background: 'var(--color-card-bg)', 
              border: '1px solid var(--color-border)', 
              padding: '10px 16px 10px 36px', 
              borderRadius: '8px',
              color: 'var(--color-text-main)',
              outline: 'none',
              width: '240px'
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
              <th>Registered Date</th>
              <th>Subscription details</th>
              <th>API Calls</th>
              <th>Banned</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <tr key={idx} style={{ opacity: 0.5 }}>
                  <td style={{ padding: '24px' }}><div style={{ height: '14px', width: '80px', background: 'var(--color-border)', borderRadius: '4px' }}></div></td>
                  <td style={{ padding: '24px' }}>
                    <div style={{ height: '14px', width: '120px', background: 'var(--color-border)', borderRadius: '4px', marginBottom: '8px' }}></div>
                    <div style={{ height: '10px', width: '160px', background: 'var(--color-border)', borderRadius: '4px' }}></div>
                  </td>
                  <td style={{ padding: '24px' }}><div style={{ height: '14px', width: '90px', background: 'var(--color-border)', borderRadius: '4px' }}></div></td>
                  <td style={{ padding: '24px' }}><div style={{ height: '20px', width: '150px', background: 'var(--color-border)', borderRadius: '4px' }}></div></td>
                  <td style={{ padding: '24px' }}><div style={{ height: '14px', width: '60px', background: 'var(--color-border)', borderRadius: '4px' }}></div></td>
                  <td style={{ padding: '24px' }}><div style={{ height: '20px', width: '50px', background: 'var(--color-border)', borderRadius: '12px' }}></div></td>
                  <td style={{ padding: '24px', textAlign: 'right' }}><div style={{ height: '28px', width: '28px', background: 'var(--color-border)', borderRadius: '6px', marginLeft: 'auto' }}></div></td>
                </tr>
              ))
            ) : paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{user.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{user.email}</div>
                </td>
                <td style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {user.joined}
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`${styles.badge} ${user.plan === 'Premium' ? styles.badgePro : ''}`} style={{ background: user.plan === 'Free' ? 'var(--color-bg-soft)' : undefined, color: user.plan === 'Free' ? 'var(--color-text-muted)' : undefined }}>
                        {user.plan}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                        ({user.planDuration || 'Lifetime'})
                      </span>
                    </div>
                  </div>
                </td>
                <td>{user.calls.toLocaleString()}</td>
                <td>
                  <label className={styles.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={user.status === 'Suspended'} 
                      onChange={() => toggleBan(user.id, user.status)} 
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/users/${user.id}`}>
                      <button className={styles.actionBtn} style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary-soft)' }} title="Edit User Details"><Edit2 size={14} /></button>
                    </Link>
                    <Link href={`/admin/users/${user.id}`}>
                      <button className={styles.actionBtn} title="View Profile"><Eye size={14} /></button>
                    </Link>
                    <button 
                      className={styles.actionBtn} 
                      onClick={() => setUserToDelete(user)} 
                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} 
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                  No users found matching search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        
        {totalPages > 1 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={styles.actionBtn} 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              ><ChevronLeft size={16} /></button>
              <button 
                className={styles.actionBtn} 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              ><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Delete User Modal */}
      {userToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card glass-card" style={{ maxWidth: '400px', width: '90%', padding: '24px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text-main)' }}>Delete User?</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{userToDelete.name}</strong> ({userToDelete.email})? This action is permanent and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setUserToDelete(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} style={{ padding: '8px 16px', background: '#ef4444', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
