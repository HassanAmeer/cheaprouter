'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Ban, CheckCircle, Mail, Key, User, Calendar, Activity, Zap, HardDrive, Shield, AlertTriangle, Camera } from 'lucide-react';
import styles from '../../admin.module.css';
import Link from 'next/link';

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUser({ ...user, profile_picture: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    Promise.resolve(params).then(p => {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      fetch(`/api/admin/users/${p.id}`, {
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
          if (data && data.user) setUser(data.user);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    });
  }, [params]);

  const handleToggleBan = () => {
    if (!user) return;
    const updatedStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    Promise.resolve(params).then(p => {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      fetch(`/api/admin/users/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
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
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      fetch(`/api/admin/users/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
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
      <div style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--color-card-bg)', borderRadius: '24px', border: '1px solid var(--color-border)', margin: '40px 0' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <User size={32} color="var(--color-text-muted)" />
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>User Not Found</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>The user profile you are trying to view does not exist or has been removed.</p>
        <Link href="/admin/users" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 24px', borderRadius: '12px', fontWeight: 600 }}>
          Return to User Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/admin/users" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, padding: '8px 12px', background: 'var(--color-card-bg)', borderRadius: '8px', border: '1px solid var(--color-border)', transition: 'all 0.2s' }} className="hover-lift">
          <ChevronLeft size={16} /> Directory
        </Link>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>User Profile</h2>
      </div>

      {/* Hero Header */}
      <div style={{ 
        position: 'relative', 
        background: 'var(--color-card-bg)', 
        borderRadius: '24px', 
        border: '1px solid var(--color-border)', 
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        {/* Abstract Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(135deg, var(--color-primary-soft), var(--color-bg-main))', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '10%', top: '-50%', width: '300px', height: '300px', background: 'var(--color-primary)', filter: 'blur(80px)', opacity: 0.15, borderRadius: '50%' }} />
        </div>

        <div style={{ position: 'relative', padding: '32px', paddingTop: '80px', display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Avatar with Upload */}
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: 100, height: 100, borderRadius: '24px', 
              background: 'var(--color-bg-main)', 
              border: '4px solid var(--color-card-bg)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'var(--color-primary)', fontWeight: 800, fontSize: 36,
              overflow: 'hidden',
              position: 'relative'
            }}>
              {user.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <label style={{ 
              position: 'absolute', bottom: -8, right: -8, 
              width: 36, height: 36, borderRadius: '50%', 
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
              border: '3px solid var(--color-card-bg)', transition: 'transform 0.2s'
            }} className="hover-scale">
              <Camera size={16} />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{user.name}</h1>
              <span style={{ 
                padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                background: user.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: user.status === 'Active' ? '#10B981' : '#EF4444',
                border: `1px solid ${user.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {user.status}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {user.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Joined {user.joined}</div>
            </div>
          </div>
          
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        
        {/* Left Column: Form Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Identity Section */}
          <div className="card glass-card" style={{ padding: '32px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <User size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Identity Details</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={e => setUser({ ...user, name: e.target.value })}
                  className="modern-input"
                  style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '12px 16px', borderRadius: '12px', color: 'var(--color-text-main)', fontSize: '15px', outline: 'none', transition: 'border 0.2s', width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  onChange={e => setUser({ ...user, email: e.target.value })}
                  style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '12px 16px', borderRadius: '12px', color: 'var(--color-text-main)', fontSize: '15px', outline: 'none', transition: 'border 0.2s', width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Subscriptions / Plans */}
          <div className="card glass-card" style={{ padding: '32px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Zap size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Active Subscriptions</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HardDrive size={12} /> CLI Plan
                </label>
                <select 
                  value={(user.plan_cli || 'Free').toLowerCase()} 
                  onChange={e => setUser({ ...user, plan_cli: e.target.value })} 
                  style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '12px 16px', borderRadius: '12px', color: 'var(--color-text-main)', fontSize: '15px', outline: 'none', width: '100%', cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="free" style={{ background: '#1a1a1a', color: '#fff' }}>Free</option>
                  <option value="starter" style={{ background: '#1a1a1a', color: '#fff' }}>Starter</option>
                  <option value="pro" style={{ background: '#1a1a1a', color: '#fff' }}>Pro</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={12} /> API Plan
                </label>
                <select 
                  value={(user.plan_api || 'Free').toLowerCase()} 
                  onChange={e => setUser({ ...user, plan_api: e.target.value })} 
                  style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '12px 16px', borderRadius: '12px', color: 'var(--color-text-main)', fontSize: '15px', outline: 'none', width: '100%', cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="free" style={{ background: '#1a1a1a', color: '#fff' }}>Free</option>
                  <option value="starter" style={{ background: '#1a1a1a', color: '#fff' }}>Starter</option>
                  <option value="pro" style={{ background: '#1a1a1a', color: '#fff' }}>Pro</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={12} /> Chat Plan
                </label>
                <select 
                  value={(user.plan_chat || 'Free').toLowerCase()} 
                  onChange={e => setUser({ ...user, plan_chat: e.target.value })} 
                  style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '12px 16px', borderRadius: '12px', color: 'var(--color-text-main)', fontSize: '15px', outline: 'none', width: '100%', cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="free" style={{ background: '#1a1a1a', color: '#fff' }}>Free</option>
                  <option value="starter" style={{ background: '#1a1a1a', color: '#fff' }}>Starter</option>
                  <option value="pro" style={{ background: '#1a1a1a', color: '#fff' }}>Pro</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={12} /> Websites Plan
                </label>
                <select 
                  value={(user.plan_agents || 'Free').toLowerCase()} 
                  onChange={e => setUser({ ...user, plan_agents: e.target.value })} 
                  style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '12px 16px', borderRadius: '12px', color: 'var(--color-text-main)', fontSize: '15px', outline: 'none', width: '100%', cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="free" style={{ background: '#1a1a1a', color: '#fff' }}>Free</option>
                  <option value="starter" style={{ background: '#1a1a1a', color: '#fff' }}>Starter</option>
                  <option value="pro" style={{ background: '#1a1a1a', color: '#fff' }}>Pro</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Meta & Danger Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meta Data</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>
                  <Activity size={16} /> Total Calls
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-primary)' }}>{(user.calls || 0).toLocaleString()}</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>
                  <Calendar size={16} /> Joined
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{user.joined}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Edit Calls</label>
                <input
                  type="number"
                  value={user.calls || 0}
                  onChange={e => setUser({ ...user, calls: parseInt(e.target.value) || 0 })}
                  style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '10px', color: 'var(--color-text-main)', fontSize: '14px', outline: 'none', width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ 
            padding: '24px', borderRadius: '24px', 
            background: 'var(--color-card-bg)', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#EF4444' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#EF4444' }}>
              <AlertTriangle size={20} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Danger Zone</h3>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              Suspending this user will instantly revoke their API access and lock them out of the platform.
            </p>
            
            <button
              onClick={handleToggleBan}
              style={{
                width: '100%',
                padding: '12px',
                background: user.status === 'Active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: user.status === 'Active' ? '#ef4444' : '#10B981',
                border: user.status === 'Active' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              className="hover-scale"
            >
              {user.status === 'Active' ? <><Ban size={16} /> Suspend Account</> : <><CheckCircle size={16} /> Reactivate Account</>}
            </button>
          </div>

        </div>
      </div>
      
      <style jsx>{`
        .hover-scale:hover { transform: scale(1.02); }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }
        select { background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right 1rem top 50%; background-size: 0.65rem auto; }
        select option {
          background-color: #1a1a1a !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
