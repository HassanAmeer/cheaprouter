'use client';

import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, Users } from 'lucide-react';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('ALL');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, targetUserId })
      });
      
      if (res.ok) {
        setSuccess(true);
        setTitle('');
        setMessage('');
        // Keep targetUserId as is
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to send notification', error);
      alert('Failed to send notification.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', width: '100%', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bell size={24} color="var(--color-primary)" />
          Notify User
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Send a direct notification to a specific user or all users on their dashboard.</p>
      </div>

      <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
        <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} /> Target Audience
            </label>
            <select 
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '12px 16px', borderRadius: '8px', color: 'var(--color-text-main)', fontSize: '15px', outline: 'none' }}
            >
              <option value="ALL">All Users</option>
              <option value="usr_1a9b">usr_1a9b (John Doe)</option>
              <option value="usr_2x8c">usr_2x8c (Alice Smith)</option>
              <option value="usr_3y7d">usr_3y7d (Bob Johnson)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>Notification Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Maintenance"
              style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '12px 16px', borderRadius: '8px', color: 'var(--color-text-main)', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>Message Content</label>
            <textarea 
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type the message you want the selected users to see..."
              style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '8px', color: 'var(--color-text-main)', fontSize: '15px', minHeight: '120px', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <button 
              type="submit" 
              disabled={isSending || (!title.trim() || !message.trim())}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', cursor: (isSending || (!title.trim() || !message.trim())) ? 'not-allowed' : 'pointer', opacity: (isSending || (!title.trim() || !message.trim())) ? 0.6 : 1 }}
            >
              {isSending ? (
                <>Sending...</>
              ) : (
                <><Send size={18} /> Send Notification</>
              )}
            </button>
            {success && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '14px', fontWeight: 500 }}>
                <CheckCircle2 size={16} />
                Notification sent successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
