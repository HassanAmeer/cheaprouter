'use client';

import React, { useEffect, useState } from 'react';
import { Bell, BellDot, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

function authFetch(path: string, options: RequestInit = {}) {
  const t = typeof window !== 'undefined' ? localStorage.getItem('cm_token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  if (t) headers['Authorization'] = `Bearer ${t}`;
  return fetch(path, { ...options, headers });
}

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
      const res = await authFetch('/api/notifications', { cache: 'no-store' } as RequestInit);
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
      await authFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ action: 'markRead', id })
      });
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await authFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ action: 'markAllRead', userId: user?.id })
      });
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ width: '100%', paddingBottom: '60px', animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header Section */}
      <div style={{ 
        marginBottom: '32px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'var(--color-card-bg)',
        padding: '32px 40px',
        borderRadius: '24px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background element */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, var(--color-primary-soft) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            color: 'var(--color-text-main)', 
            marginBottom: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            letterSpacing: '-0.5px'
          }}>
            <div style={{ 
              background: 'var(--color-primary-soft)', 
              padding: '10px', 
              borderRadius: '14px',
              display: 'flex',
              color: 'var(--color-primary)'
            }}>
              <Bell size={24} />
            </div>
            Notifications
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginLeft: '56px' }}>Stay updated with the latest alerts and announcements.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            style={{ 
              position: 'relative',
              zIndex: 1,
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 20px', 
              background: 'var(--color-primary)', 
              border: 'none', 
              borderRadius: '14px', 
              fontSize: '14px', 
              fontWeight: 700, 
              color: '#fff', 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              boxShadow: 'var(--shadow-md)' 
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--shadow-glow)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <CheckCircle2 size={18} /> Mark all as read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontWeight: 500 }}>Loading notifications...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ 
            padding: '80px 40px', 
            textAlign: 'center', 
            background: 'var(--color-card-bg)', 
            border: '1px dashed var(--color-border)', 
            borderRadius: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>All caught up!</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>You don't have any notifications right now. Check back later.</p>
            </div>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id}
              onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              style={{ 
                background: notif.read ? 'var(--color-card-bg)' : 'var(--color-bg)',
                border: `1px solid ${notif.read ? 'var(--color-border)' : 'var(--color-primary)'}`,
                borderRadius: '20px',
                padding: '24px 32px',
                display: 'flex',
                gap: '24px',
                cursor: notif.read ? 'default' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: notif.read ? 'var(--shadow-sm)' : 'var(--shadow-md), 0 0 0 1px var(--color-primary-soft)',
                position: 'relative',
                overflow: 'hidden',
                transform: 'translateY(0)'
              }}
              onMouseOver={(e) => {
                if(!notif.read) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg), 0 0 0 1px var(--color-primary-soft)';
                } else {
                  e.currentTarget.style.background = 'var(--color-bg-soft)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                if(!notif.read) {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md), 0 0 0 1px var(--color-primary-soft)';
                } else {
                  e.currentTarget.style.background = 'var(--color-card-bg)';
                }
              }}
            >
              {!notif.read && (
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px', background: 'var(--color-primary)' }} />
              )}
              
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '16px', 
                background: notif.read ? 'var(--color-bg-soft)' : 'var(--color-primary-soft)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: notif.read ? 'var(--color-text-muted)' : 'var(--color-primary)', 
                flexShrink: 0 
              }}>
                {notif.read ? <Bell size={26} /> : <BellDot size={26} />}
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: notif.read ? 'var(--color-text-main)' : 'var(--color-primary)' }}>{notif.title}</h3>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg-soft)', padding: '4px 10px', borderRadius: '12px' }}>
                    <Calendar size={14} />
                    {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
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
