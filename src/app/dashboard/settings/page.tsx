'use client';

import React, { useState } from 'react';
import { Button, Input, Badge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/auth-provider';
import styles from '../dashboard.module.css';
import { User, Mail, Shield, Bell, Globe, Lock, Trash2, AlertTriangle, KeyRound, Sparkles, LogOut, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? 'John Doe');
  const [email] = useState(user?.email ?? 'john@company.com');
  const [profilePic, setProfilePic] = useState<string | null>(user?.profile_picture ?? null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfilePic(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile(name, profileFile ?? profilePic ?? undefined);
      setProfileFile(null);
      toast('Profile changes saved', 'success');
    } catch (err: any) {
      toast(err.message ?? 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px', background: 'linear-gradient(to right, var(--color-text-main), var(--color-text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Account Settings</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
            Manage your account preferences, security, and billing details.
          </p>
        </div>
        <Button variant="secondary" onClick={() => toast('Logged out successfully', 'success')} style={{ borderRadius: 12, padding: '10px 16px', background: 'var(--color-bg-soft)' }}>
          <LogOut size={16} style={{ marginRight: 8 }} /> Sign Out
        </Button>
      </div>

      {/* Profile Section */}
      <div className="card glass-card" style={{ marginBottom: 32, padding: '40px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ position: 'absolute', top: -150, right: -150, width: 400, height: 400, background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -50, width: 300, height: 300, background: 'radial-gradient(circle, #ff6b6b 0%, transparent 70%)', opacity: 0.08, borderRadius: '50%', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ background: 'var(--color-primary-soft)', padding: 12, borderRadius: 14, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)' }}>
            <User size={24} color="var(--color-primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--color-text-main)' }}>Profile Information</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 4 }}>Update your personal details and public profile.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', marginBottom: 40 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -4, background: 'linear-gradient(135deg, var(--color-primary), #ff6b6b)', borderRadius: '32px', opacity: 0.5, filter: 'blur(12px)', animation: 'pulse-dot 3s infinite' }} />
              <div style={{
                width: 120, height: 120, borderRadius: '28px', background: 'linear-gradient(135deg, var(--color-primary), #ff6b6b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 40,
                boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.3), 0 10px 30px rgba(0,0,0,0.2)', position: 'relative', zIndex: 1,
                overflow: 'hidden'
              }}>
                {profilePic ? (
                  <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
              <div style={{ position: 'absolute', bottom: -6, right: -6, background: 'var(--color-bg)', borderRadius: '50%', padding: 5, zIndex: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <div style={{ background: 'var(--color-success)', width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--color-bg)' }} />
              </div>
            </div>
            <label className="btn-secondary" style={{ fontSize: '13px', padding: '10px 20px', borderRadius: 24, fontWeight: 600, background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-muted)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-soft)'; e.currentTarget.style.transform = 'none'; }}
            >
              Change Photo
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            </label>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, background: 'var(--color-bg-soft)', padding: 24, borderRadius: 20, border: '1px solid var(--color-border)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 10, letterSpacing: '0.3px', textTransform: 'uppercase', opacity: 0.8 }}>Full Name</label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} style={{ background: 'var(--color-bg)', borderColor: 'transparent', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 10, letterSpacing: '0.3px', textTransform: 'uppercase', opacity: 0.8 }}>Email Address</label>
                <Input id="email" placeholder="john@example.com" value={email} disabled style={{ background: 'var(--color-bg)', opacity: 0.7 }} />
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={12} opacity={0.6} /> Email cannot be changed</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24, padding: '20px 24px', background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), transparent)', borderRadius: 20, border: '1px dashed rgba(139, 92, 246, 0.3)' }}>
              <div style={{ background: 'var(--color-primary)', padding: 10, borderRadius: '50%', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}>
                <Sparkles size={18} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Active Plan: {(user?.plan ?? 'pro').toUpperCase()}
                  <Badge tone="success" style={{ padding: '4px 10px', borderRadius: 12, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</Badge>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 4, display: 'flex', gap: '16px' }}>
                  <span>Member since Jan 2026</span>
                  <span>•</span>
                  <span>Last Login: {user?.last_login || 'Just now'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', paddingTop: 28, borderTop: '1px solid var(--color-border)' }}>
          <Button variant="ghost" onClick={() => { setName(user?.name ?? 'John Doe'); toast('Changes discarded', 'warning'); }} style={{ borderRadius: 12, padding: '10px 20px', fontWeight: 600 }}>Discard</Button>
          <Button onClick={save} disabled={saving} style={{ padding: '10px 28px', borderRadius: 12, fontWeight: 700, boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)' }}>
            {saving ? 'Saving…' : <><CheckCircle2 size={18} style={{ marginRight: 8 }} /> Save Changes</>}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Security Section */}
        <div className="card glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'var(--color-primary-soft)', padding: 10, borderRadius: 12 }}>
              <Shield size={20} color="var(--color-primary)" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Security</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '20px', background: 'var(--color-bg)', borderRadius: 16, border: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--color-primary)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <KeyRound size={20} color="var(--color-text-muted)" />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>Account Password</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 4 }}>Last changed 30 days ago</div>
                </div>
              </div>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: 12 }} onClick={() => toast('Password reset email sent', 'success')}>Update Password</Button>
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <div className="card glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'var(--color-primary-soft)', padding: 10, borderRadius: 12 }}>
              <Globe size={20} color="var(--color-primary)" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Billing & Plan</h2>
          </div>
          
          <div style={{ padding: '20px', background: 'var(--color-bg)', borderRadius: 16, border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Pro Developer
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary)' }}>$15<span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>/mo</span></span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 8 }}>Renews on Aug 15, 2026</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 4 }}>1M tokens per month included</div>
            </div>
            <Button variant="secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: 12 }} onClick={() => toast('Redirecting to billing portal…', 'info')}>Manage Subscription</Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', background: 'linear-gradient(to right, rgba(239,68,68,0.08), transparent)', padding: '32px', borderRadius: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={20} color="var(--color-danger)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-danger)' }}>Danger Zone</h2>
            </div>
            <p style={{ color: 'var(--color-text-main)', opacity: 0.8, fontSize: '14px', maxWidth: 500, lineHeight: 1.5 }}>
              Once you delete your account, all data including API keys, conversations, and usage history will be permanently removed. This action cannot be undone.
            </p>
          </div>
          <Button variant="danger" style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.4)', flexShrink: 0, transition: 'all 0.2s' }} onClick={() => {
            if (confirm('Are you absolutely sure you want to delete your account? This cannot be undone.')) {
              toast('Account deletion requires email confirmation', 'warning');
            }
          }}>
            <Trash2 size={18} style={{ marginRight: 8 }} /> Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
