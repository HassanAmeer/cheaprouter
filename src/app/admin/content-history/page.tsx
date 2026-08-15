'use client';

import React, { useState, useEffect } from 'react';
import { Video, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import styles from '../admin.module.css';

type Submission = {
  id: string;
  userId: string;
  userName: string;
  url: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
};

export default function ContentHistoryPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/submissions', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.submissions) {
          setSubmissions(data.submissions.map((s: any) => ({
            id: s.id,
            userId: s.userId,
            userName: s.userName,
            url: s.url,
            date: new Date(s.date).toISOString().split('T')[0],
            status: s.status
          })));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    fetch(`/api/admin/submissions/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
      },
      body: JSON.stringify({ status: newStatus })
    }).then(() => {
      setSubmissions(subs => subs.map(sub => 
        sub.id === id ? { ...sub, status: newStatus } : sub
      ));
    }).catch(err => console.error(err));
  };

  return (
    <div style={{ maxWidth: '1200px', width: '100%', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Video size={24} color="var(--color-primary)" />
            Content History
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Review and approve video submissions for the Creator Bonus program.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading submissions...</div>
      ) : (
      <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className={styles.tableScroll}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Date</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>User</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Content URL</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--color-text-muted)' }}>{sub.date}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>{sub.userName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{sub.userId}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <a 
                    href={sub.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ fontSize: '14px', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {sub.url.substring(0, 40)}{sub.url.length > 40 ? '...' : ''}
                    <ExternalLink size={14} />
                  </a>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                    background: sub.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : sub.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: sub.status === 'approved' ? 'var(--color-success)' : sub.status === 'rejected' ? 'var(--color-danger)' : 'var(--color-warning)',
                  }}>
                    {sub.status === 'approved' && <CheckCircle2 size={14} />}
                    {sub.status === 'rejected' && <XCircle size={14} />}
                    {sub.status === 'pending' && <Clock size={14} />}
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  {sub.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleUpdateStatus(sub.id, 'approved')}
                        style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: 'var(--color-success)', color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(sub.id, 'rejected')}
                        style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: 'var(--color-danger)', color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Resolved</span>
                  )}
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No content submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      )}
    </div>
  );
}
