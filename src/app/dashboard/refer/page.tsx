'use client';

import React, { useState } from 'react';
import { Gift, Copy, Video, Send, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useSiteSettings } from '@/components/settings-provider';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/primitives';
import styles from '../dashboard.module.css';

export default function ReferAndEarnPage() {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const { toast } = useToast();
  
  const [videoLink, setVideoLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([
    { id: '1', url: 'https://youtube.com/watch?v=demo', status: 'pending', date: '2026-08-05' }
  ]);

  const referralSettings = settings.referralSettings || {
    isEnabled: true,
    standardBonus: '$5.00',
    creatorBonus: '$20.00',
    alertMessage: 'Attention Content Creators! Make a video about CheapRouter on YouTube or TikTok, get 100+ views, and earn a $20.00 platform credit instantly!'
  };

  if (!referralSettings.isEnabled) {
    return (
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Refer & Earn</h1>
        <div style={{ marginTop: '24px', padding: '40px', textAlign: 'center', background: 'var(--color-card-bg)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <Gift size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Program Currently Unavailable</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>The Refer & Earn program is currently disabled by the administrator.</p>
        </div>
      </div>
    );
  }

  const referralLink = `https://cheaprouter.com/?ref=${user?.id || 'demo_123'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast('Referral link copied to clipboard!', 'success');
  };

  const handleSubmitVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoLink.trim()) return;
    
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmissions([{
        id: Date.now().toString(),
        url: videoLink,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      }, ...submissions]);
      setVideoLink('');
      setSubmitting(false);
      toast('Video link submitted for review. You will receive your bonus once approved!', 'success');
    }, 1000);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Refer & Earn</h1>
        <p className={styles.pageSubtitle}>Invite friends or create content to earn free platform credits.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Standard Referral */}
        <section className="card glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <Gift size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Invite Friends</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Get {referralSettings.standardBonus} for every active user</p>
            </div>
          </div>
          
          <p style={{ fontSize: '14px', color: 'var(--color-text-main)', marginBottom: '16px' }}>
            Share your unique referral link. When a friend signs up and makes their first API call, you both receive {referralSettings.standardBonus} in credits!
          </p>

          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Your Referral Link</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              readOnly 
              value={referralLink} 
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', color: 'var(--color-text-main)', fontSize: '14px' }} 
            />
            <Button onClick={handleCopyLink} variant="secondary">
              <Copy size={16} style={{ marginRight: '6px' }} /> Copy
            </Button>
          </div>
        </section>

        {/* Content Creator Bonus */}
        <section className="card glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)' }}>
              <Video size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Content Creator Program</h3>
            </div>
          </div>

          {/* Shimmer Alert Box */}
          <div className="shimmer-btn" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}><Gift size={20} /></div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-main)' }}>Creator Bonus!</h4>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                {referralSettings.alertMessage}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitVideo} style={{ marginTop: 'auto' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Submit Video / Post URL</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="url" 
                required
                placeholder="https://youtube.com/watch?v=..."
                value={videoLink} 
                onChange={(e) => setVideoLink(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-main)', fontSize: '14px' }} 
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : <><Send size={16} style={{ marginRight: '6px' }} /> Submit</>}
              </Button>
            </div>
          </form>
        </section>
      </div>

      {/* Submitted Links Table */}
      <div className="card glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Submitted Content</h3>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Link</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub.id}>
                <td style={{ color: 'var(--color-text-muted)' }}>{sub.date}</td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <a href={sub.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                    {sub.url}
                  </a>
                </td>
                <td>
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                    background: sub.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: sub.status === 'approved' ? 'var(--color-success)' : 'var(--color-warning)',
                  }}>
                    {sub.status === 'approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No content submitted yet.</td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
