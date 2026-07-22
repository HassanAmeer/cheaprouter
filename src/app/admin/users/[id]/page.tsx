'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Ban, CheckCircle, Mail, Key } from 'lucide-react';
import styles from '../../admin.module.css';
import Link from 'next/link';

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.resolve(params).then(p => {
      fetch(`/api/admin/users/${p.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    });
  }, [params]);

  const handleToggleBan = () => {
    if (!user) return;
    const updatedStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    Promise.resolve(params).then(p => {
      fetch(`/api/admin/users/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, status: updatedStatus })
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
        })
        .catch(err => console.error(err));
    });
  };

  const handleSave = () => {
    if (!user) return;
    setSaving(true);
    Promise.resolve(params).then(p => {
      fetch(`/api/admin/users/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)

      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
        })
        .catch(err => console.error(err))
        .finally(() => setSaving(false));
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500 }}>Loading User Details...</span>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--color-text-main)', marginBottom: '16px' }}>User Not Found</h3>
        <Link href="/admin/users" style={{ color: 'var(--color-primary)' }}>Back to User List</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/admin/users" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={20} /> Back
        </Link>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>User Profile</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>

        {/* Left Col - Edit Form */}
        <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Edit Details</h3>
            <span className={`${styles.badge} ${user.status === 'Active' ? styles.badgeActive : styles.badgeInactive}`}>
              {user.status}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={e => setUser({ ...user, name: e.target.value })}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  onChange={e => setUser({ ...user, email: e.target.value })}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Subscription Plan</label>
                <select
                  value={user.plan}
                  onChange={e => setUser({ ...user, plan: e.target.value })}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                >
                  <option value="Free">Free</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Account Status</label>
                <select
                  value={user.status}
                  onChange={e => setUser({ ...user, status: e.target.value })}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Plan Start Date</label>
                <input
                  type="text"
                  value={user.planStart || ''}
                  onChange={e => setUser({ ...user, planStart: e.target.value })}
                  placeholder="YYYY-MM-DD"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Plan End Date</label>
                <input
                  type="text"
                  value={user.planEnd || ''}
                  onChange={e => setUser({ ...user, planEnd: e.target.value })}
                  placeholder="YYYY-MM-DD or N/A"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Plan Purchased Duration</label>
                <input
                  type="text"
                  value={user.planDuration || ''}
                  onChange={e => setUser({ ...user, planDuration: e.target.value })}
                  placeholder="e.g. 1 Month, 1 Year, Lifetime"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Calls</label>
                <input
                  type="number"
                  value={user.calls}
                  onChange={e => setUser({ ...user, calls: parseInt(e.target.value) || 0 })}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Joined Date</label>
                <input
                  type="text"
                  value={user.joined}
                  onChange={e => setUser({ ...user, joined: e.target.value })}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
                />
              </div>
            </div>

            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '12px', marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>

        {/* Right Col - Actions & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>User Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Joined</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{user.joined}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Total Calls</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{user.calls.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Danger Zone</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Suspending this user will instantly revoke their API access.
            </p>
            <button
              onClick={handleToggleBan}
              style={{
                width: '100%',
                padding: '10px',
                background: user.status === 'Active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: user.status === 'Active' ? '#ef4444' : '#10B981',
                border: user.status === 'Active' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {user.status === 'Active' ? <><Ban size={16} /> Suspend User</> : <><CheckCircle size={16} /> Unsuspend User</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
