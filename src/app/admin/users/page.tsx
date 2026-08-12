'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';
import { Search, Edit2, Ban, Mail, Eye, ChevronLeft, ChevronRight, Trash2, Edit3, Users, UserPlus, Calendar, Filter, Monitor, Apple, Smartphone, Terminal, Globe } from 'lucide-react';

const ITEMS_PER_PAGE = 50;

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: 'New',
  intermediate: 'Intermediate',
  advanced: 'Pro',
  'not-programmer': 'Non-dev',
};

const GOAL_LABELS: Record<string, string> = {
  coding: 'Coding',
  chats: 'Chats',
  agents: 'Agents',
  apis: 'APIs',
  resellers: 'Reseller',
  affiliate: 'Affiliate',
  earn: 'Earning',
  free: 'Free use',
};

const OS_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Windows: { icon: <Monitor size={10} />, color: '#38BDF8', bg: 'rgba(56,189,248,0.12)' },
  macOS: { icon: <Apple size={10} />, color: '#E2E8F0', bg: 'rgba(226,232,240,0.12)' },
  Android: { icon: <Smartphone size={10} />, color: '#4ADE80', bg: 'rgba(74,222,128,0.12)' },
  iOS: { icon: <Smartphone size={10} />, color: '#CBD5E1', bg: 'rgba(203,213,225,0.12)' },
  Linux: { icon: <Terminal size={10} />, color: '#FACC15', bg: 'rgba(250,204,21,0.12)' },
  Unknown: { icon: <Globe size={10} />, color: 'var(--color-text-muted)', bg: 'rgba(150,150,150,0.1)' },
};

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
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handleBulkEdit = () => {
    localStorage.setItem('bulkEditUserIds', JSON.stringify(Array.from(selectedUserIds)));
    router.push('/admin/users/bulk-edit');
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedUserIds.size} users?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: Array.from(selectedUserIds) })
      });
      if (res.ok) {
        setUsers(users.filter(u => !selectedUserIds.has(u.id)));
        setSelectedUserIds(new Set());
      } else {
        alert('Failed to delete selected users');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting users');
    }
  };

  const fetchUsers = () => {
    setLoading(true);
    let url = '/api/admin/users?';
    if (activeFilter !== 'all') url += `filter=${activeFilter}&`;
    if (activeFilter === 'custom') {
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
    }

    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    fetch(url, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
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
        if (!data) return;
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
    
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
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
    
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    fetch(`/api/admin/users/${targetId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
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

      {selectedUserIds.size > 0 && (
        <div style={{ padding: '16px 24px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '14px' }}>{selectedUserIds.size} users selected</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleBulkEdit} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <Edit3 size={16} /> Bulk Edit Plans
            </button>
            <button onClick={handleDeleteSelected} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <Trash2 size={16} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        {totalPages > 1 && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <div className={styles.tableScroll}>
          <table className={styles.dataTable}>
            <thead>
            <tr>
              <th style={{ width: 40, paddingLeft: '24px' }}>
                <input 
                  type="checkbox" 
                  checked={paginatedUsers.length > 0 && selectedUserIds.size === paginatedUsers.length}
                  onChange={e => {
                    if (e.target.checked) {
                      const newSet = new Set(selectedUserIds);
                      paginatedUsers.forEach(u => newSet.add(u.id));
                      setSelectedUserIds(newSet);
                    } else {
                      const newSet = new Set(selectedUserIds);
                      paginatedUsers.forEach(u => newSet.delete(u.id));
                      setSelectedUserIds(newSet);
                    }
                  }}
                  style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
              </th>
              <th>User ID</th>
              <th>Name / Email</th>
              <th>Registered Date</th>
              <th>IP Address</th>
              <th>Active Plans</th>
              <th>Onboarding</th>
              <th>API Calls</th>
              <th>Banned</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <tr key={idx} style={{ opacity: 0.5 }}>
                  <td style={{ padding: '24px' }}><div style={{ height: '14px', width: '14px', background: 'var(--color-border)', borderRadius: '4px' }}></div></td>
                  <td style={{ padding: '24px' }}><div style={{ height: '14px', width: '80px', background: 'var(--color-border)', borderRadius: '4px' }}></div></td>
                  <td style={{ padding: '24px' }}>
                    <div style={{ height: '14px', width: '120px', background: 'var(--color-border)', borderRadius: '4px', marginBottom: '8px' }}></div>
                    <div style={{ height: '10px', width: '160px', background: 'var(--color-border)', borderRadius: '4px' }}></div>
                  </td>
                  <td style={{ padding: '24px' }}><div style={{ height: '14px', width: '90px', background: 'var(--color-border)', borderRadius: '4px' }}></div></td>
                  <td style={{ padding: '24px' }}><div style={{ height: '14px', width: '80px', background: 'var(--color-border)', borderRadius: '4px' }}></div></td>
                  <td style={{ padding: '24px' }}><div style={{ height: '20px', width: '150px', background: 'var(--color-border)', borderRadius: '4px' }}></div></td>
                  <td style={{ padding: '24px' }}><div style={{ height: '14px', width: '60px', background: 'var(--color-border)', borderRadius: '4px' }}></div></td>
                  <td style={{ padding: '24px' }}><div style={{ height: '20px', width: '50px', background: 'var(--color-border)', borderRadius: '12px' }}></div></td>
                  <td style={{ padding: '24px', textAlign: 'right' }}><div style={{ height: '28px', width: '28px', background: 'var(--color-border)', borderRadius: '6px', marginLeft: 'auto' }}></div></td>
                </tr>
              ))
            ) : paginatedUsers.map((user) => (
              <tr key={user.id} style={{ background: selectedUserIds.has(user.id) ? 'rgba(16, 185, 129, 0.05)' : '' }}>
                <td style={{ paddingLeft: '24px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedUserIds.has(user.id)}
                    onChange={e => {
                      const newSet = new Set(selectedUserIds);
                      if (e.target.checked) newSet.add(user.id);
                      else newSet.delete(user.id);
                      setSelectedUserIds(newSet);
                    }}
                    style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  />
                </td>
                <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{user.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{user.email}</div>
                </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    <div style={{ color: 'var(--color-text-main)' }}>Signup: {user.joined}</div>
                    <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>Last Login: {user.last_login}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span title={user.os || 'Unknown device'} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '5px', lineHeight: 1.4, whiteSpace: 'nowrap', background: (OS_META[user.os] || OS_META.Unknown).bg, color: (OS_META[user.os] || OS_META.Unknown).color, border: '1px solid rgba(150,150,150,0.2)' }}>
                        {(OS_META[user.os] || OS_META.Unknown).icon} {user.os || 'Unknown'}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-muted)' }}>{user.last_ip || '—'}</span>
                    </div>
                  </td>
                <td>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '2px 6px', width: 'fit-content', maxWidth: '100%' }}>
                    {[
                      { name: 'CLI', val: user.plan_cli || 'Free' },
                      { name: 'API', val: user.plan_api || 'Free' },
                      { name: 'Chat', val: user.plan_chat || 'Free' },
                      { name: 'Web', val: user.plan_agents || 'Free' }
                    ].map(p => {
                      const isFree = p.val.toLowerCase() === 'free';
                      const bg = isFree ? 'rgba(150,150,150,0.1)' : 'var(--color-primary-soft)';
                      const color = isFree ? 'var(--color-text-muted)' : 'var(--color-primary)';
                      const border = isFree ? '1px solid rgba(150,150,150,0.2)' : '1px solid var(--color-primary)';
                      return (
                        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '9px', lineHeight: 1.3, background: bg, padding: '1px 5px', borderRadius: '5px', border: border, whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 500, opacity: 0.8 }}>{p.name}:</span>
                          <span style={{ fontWeight: 700, color: color }}>{p.val}</span>
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '2px 6px', width: 'fit-content', maxWidth: '100%' }} title={`Student: ${user.is_student ? 'Yes' : 'No'} · Level: ${user.experience_level || '—'} · Uses: ${user.use_cases || '—'} · Goal: ${user.earning_goal || '—'}`}>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 4px', borderRadius: '5px', lineHeight: 1.3, whiteSpace: 'nowrap', textDecoration: user.is_student ? 'none' : 'line-through', background: user.is_student ? 'transparent' : 'rgba(150,150,150,0.1)', color: user.is_student ? 'var(--color-text-main)' : 'var(--color-text-muted)', border: `1px solid ${user.is_student ? 'rgba(255,255,255,0.5)' : 'rgba(150,150,150,0.2)'}` }}>
                      Student
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 4px', borderRadius: '5px', lineHeight: 1.3, whiteSpace: 'nowrap', background: user.experience_level ? 'var(--color-primary-soft)' : 'rgba(150,150,150,0.1)', color: user.experience_level ? 'var(--color-primary)' : 'var(--color-text-muted)', border: user.experience_level ? '1px solid var(--color-primary)' : '1px solid rgba(150,150,150,0.2)' }}>
                      {EXPERIENCE_LABELS[user.experience_level] ?? (user.experience_level || 'Empty')}
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 4px', borderRadius: '5px', lineHeight: 1.3, whiteSpace: 'nowrap', background: user.earning_goal ? 'rgba(245, 158, 11, 0.12)' : 'rgba(150,150,150,0.1)', color: user.earning_goal ? '#F59E0B' : 'var(--color-text-muted)', border: user.earning_goal ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(150,150,150,0.2)' }}>
                      {GOAL_LABELS[user.earning_goal] ?? (user.earning_goal || 'Empty')}
                    </span>
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
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                  No users found matching search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>

        
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
