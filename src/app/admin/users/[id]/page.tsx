'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Ban, CheckCircle, Mail, Key } from 'lucide-react';
import styles from '../../admin.module.css';
import Link from 'next/link';

// Mock DB call based on ID
const MOCK_USER = { 
  id: 'usr_1a9b', 
  name: 'John Doe', 
  email: 'john@example.com', 
  plan: 'Free', 
  calls: 1450, 
  status: 'Active',
  joined: '2026-05-12',
  keys: 2
};

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState(MOCK_USER); // In real app, fetch based on params.id
  const [saving, setSaving] = useState(false);
  
  const handleToggleBan = () => {
    setUser(prev => ({
      ...prev,
      status: prev.status === 'Active' ? 'Suspended' : 'Active'
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      // router.push('/admin/users'); // Could return to list
    }, 1000);
  };

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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Full Name</label>
              <input 
                type="text" 
                value={user.name}
                onChange={e => setUser({...user, name: e.target.value})}
                style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Email Address</label>
              <input 
                type="email" 
                value={user.email}
                onChange={e => setUser({...user, email: e.target.value})}
                style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Subscription Plan</label>
              <select 
                value={user.plan}
                onChange={e => setUser({...user, plan: e.target.value})}
                style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}
              >
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
              </select>
            </div>

            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '12px', marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>API Keys</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{user.keys}</span>
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
              {user.status === 'Active' ? <><Ban size={16}/> Suspend User</> : <><CheckCircle size={16}/> Unsuspend User</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
