'use client';

import React, { useState } from 'react';
import { Button, Input, Badge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/auth-provider';
import styles from '../dashboard.module.css';
import { User, Mail, Shield, Bell, Globe, Lock, Trash2, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? 'John Doe');
  const [email] = useState(user?.email ?? 'john@company.com');
  const [saving, setSaving] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    usageAlerts: true,
    weeklyDigest: true,
    productUpdates: false,
    securityAlerts: true,
  });

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast('Profile changes saved');
    }, 800);
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast(`${key.replace(/([A-Z])/g, ' $1')} ${!notifications[key] ? 'enabled' : 'disabled'}`);
  };

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ maxWidth: 840 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 6 }}>Account Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Manage your account preferences, security, and notification settings.
        </p>
      </div>

      {/* Profile Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
          <User size={18} color="var(--color-primary)" />
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Profile Information</h2>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), #ff6b6b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24
            }}>
              {initials}
            </div>
            <button style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>Change avatar</button>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <Input id="name" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Input id="email" label="Email Address" value={email} disabled />
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 4 }}>Email cannot be changed</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <Badge tone="primary">{(user?.plan ?? 'pro').toUpperCase()} Plan</Badge>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Member since Jan 2026</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
          <Button variant="ghost" onClick={() => { setName(user?.name ?? 'John Doe'); toast('Changes discarded', 'warning'); }}>Discard</Button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
          <Bell size={18} color="var(--color-primary)" />
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Notifications</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {([
            { key: 'usageAlerts' as const, title: 'Usage Alerts', desc: 'Get notified when approaching token limits' },
            { key: 'weeklyDigest' as const, title: 'Weekly Usage Digest', desc: 'Receive a weekly summary of your API usage' },
            { key: 'productUpdates' as const, title: 'Product Updates', desc: 'New features, model additions, and improvements' },
            { key: 'securityAlerts' as const, title: 'Security Alerts', desc: 'Login attempts, API key changes, and suspicious activity' },
          ]).map((item) => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{item.desc}</div>
              </div>
              <button
                onClick={() => toggleNotif(item.key)}
                style={{
                  width: 44, height: 24, borderRadius: 12, position: 'relative',
                  background: notifications[item.key] ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                  transition: 'all 0.2s ease', border: 'none', cursor: 'pointer', flexShrink: 0
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: notifications[item.key] ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
          <Shield size={18} color="var(--color-primary)" />
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Security</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: 2 }}>Password</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Last changed 30 days ago</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => toast('Password reset email sent', 'success')}>Change Password</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: 2 }}>Two-Factor Authentication</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Add an extra layer of security</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => toast('2FA setup coming soon', 'info')}>Enable 2FA</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: 2 }}>Active Sessions</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>2 active sessions on this account</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => toast('All other sessions revoked', 'success')}>Revoke All</Button>
          </div>
        </div>
      </div>

      {/* Billing Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
          <Globe size={18} color="var(--color-primary)" />
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Billing & Plan</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: 4 }}>Current Plan: Pro Developer</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>$15.00 / month · Renews on Aug 15, 2026 · 1M tokens/month</div>
          </div>
          <Button variant="secondary" onClick={() => toast('Redirecting to billing…', 'info')}>Manage Billing</Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ border: '1px solid rgba(220, 38, 38, 0.25)', background: 'rgba(220,38,38,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <AlertTriangle size={18} color="var(--color-danger)" />
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-danger)' }}>Danger Zone</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: 20 }}>
          Once you delete your account, all data including API keys, conversations, and usage history will be permanently removed. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={() => {
          if (confirm('Are you absolutely sure you want to delete your account? This cannot be undone.')) {
            toast('Account deletion requires email confirmation', 'warning');
          }
        }}>
          <Trash2 size={16} /> Delete Account
        </Button>
      </div>
    </div>
  );
}
