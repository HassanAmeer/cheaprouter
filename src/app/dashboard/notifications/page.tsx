'use client';

import React, { useEffect, useState } from 'react';
import { Bell, BellDot, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type Notification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
};

export default function UserNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // Use fallback ID if user object is missing in the mock environment
      const uId = user?.id || 'usr_1a9b';
      const res = await fetch(`/api/notifications?userId=${uId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', id })
      });
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      const uId = user?.id || 'usr_1a9b';
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead', userId: uId })
      });
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: '800px', width: '100%', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={24} color="var(--color-primary)" />
            Notifications
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Stay updated with the latest alerts and announcements.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <CheckCircle2 size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              <Bell size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>All caught up!</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>You don't have any notifications right now.</p>
            </div>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id}
              onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              style={{ 
                background: notif.read ? 'var(--color-card-bg)' : 'var(--color-bg-alt)',
                border: `1px solid ${notif.read ? 'var(--color-border)' : 'var(--color-primary)'}`,
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                gap: '20px',
                cursor: notif.read ? 'default' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: notif.read ? 'none' : '0 4px 20px rgba(var(--color-primary-rgb), 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {!notif.read && (
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--color-primary)' }} />
              )}
              
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: notif.read ? 'var(--color-bg-alt)' : 'rgba(var(--color-primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: notif.read ? 'var(--color-text-muted)' : 'var(--color-primary)', flexShrink: 0 }}>
                {notif.read ? <Bell size={24} /> : <BellDot size={24} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>{notif.title}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
