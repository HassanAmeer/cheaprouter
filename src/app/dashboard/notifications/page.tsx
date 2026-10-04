'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, BellDot, CalendarDays, Check, CheckCheck, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import type { Notification } from '@/lib/api-types';
import styles from './notifications.module.css';

const PAGE_SIZE = 20;
type NotificationFilter = 'all' | 'unread' | 'read';

function authFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cm_token') : null;
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(path, { ...options, headers });
}

export default function UserNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isCurrent = true;

    const fetchNotifications = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await authFetch('/api/notifications', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const data = await response.json();
        const items: Notification[] = data.notifications || [];
        if (isCurrent) {
          setNotifications(items);
          setSelectedId(items[0]?.id ?? null);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
        if (isCurrent) setLoadError('We couldn’t load your notifications. Please try again.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    void fetchNotifications();
    return () => {
      isCurrent = false;
    };
  }, [user?.id, reloadKey]);

  const handleMarkAsRead = async (id: string) => {
    setActionError(null);
    setNotifications((previous) => previous.map((item) => item.id === id ? { ...item, read: true } : item));
    try {
      const response = await authFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ action: 'markRead', id }),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
      setNotifications((previous) => previous.map((item) => item.id === id ? { ...item, read: false } : item));
      setActionError('Could not mark this notification as read. Please try again.');
    }
  };

  const handleSelect = (notification: Notification) => {
    setSelectedId(notification.id);
    setMobileDetailOpen(true);
    if (!notification.read) void handleMarkAsRead(notification.id);
  };

  const handleMarkAllAsRead = async () => {
    const previous = notifications;
    setActionError(null);
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    try {
      const response = await authFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ action: 'markAllRead', userId: user?.id }),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
      setNotifications(previous);
      setActionError('Could not mark all notifications as read. Please try again.');
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;
  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.read;
    if (filter === 'read') return item.read;
    return true;
  });
  const pageCount = Math.max(1, Math.ceil(filteredNotifications.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageNotifications = filteredNotifications.slice(pageStart, pageStart + PAGE_SIZE);
  const selectedNotification = notifications.find((item) => item.id === selectedId) || pageNotifications[0] || null;

  const handleFilterChange = (nextFilter: NotificationFilter) => {
    const nextItems = notifications.filter((item) => {
      if (nextFilter === 'unread') return !item.read;
      if (nextFilter === 'read') return item.read;
      return true;
    });
    setFilter(nextFilter);
    setPage(1);
    setSelectedId(nextItems[0]?.id ?? null);
    setMobileDetailOpen(false);
  };

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(nextPage, pageCount));
    const start = (safePage - 1) * PAGE_SIZE;
    setPage(safePage);
    setSelectedId(filteredNotifications[start]?.id ?? null);
    setMobileDetailOpen(false);
  };

  return (
    <main className={`${styles.page} ${mobileDetailOpen ? styles.mobileDetailOpen : ''}`}>
      <header className={styles.heading}>
        <div>
          <div className={styles.eyebrow}><Bell size={13} /> Your inbox</div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>Important updates and account activity, all in one place.</p>
        </div>
        {unreadCount > 0 && (
          <button className={styles.markAllButton} onClick={handleMarkAllAsRead}>
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </header>

      {actionError && <p className={styles.errorMessage} role="alert">{actionError}</p>}

      {loading ? (
        <section className={styles.inbox} aria-label="Loading notifications">
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />
            <span>Loading your inbox…</span>
          </div>
        </section>
      ) : loadError ? (
        <section className={styles.inbox} aria-label="Notifications unavailable">
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><Bell size={24} /></div>
            <h2>Inbox unavailable</h2>
            <p>{loadError}</p>
            <button className={styles.markAllButton} onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
          </div>
        </section>
      ) : notifications.length === 0 ? (
        <section className={styles.inbox} aria-label="Notifications">
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><Inbox size={25} /></div>
            <h2>All caught up</h2>
            <p>You don’t have any notifications right now. New updates will show up here.</p>
          </div>
        </section>
      ) : (
        <section className={styles.inbox} aria-label="Notifications inbox">
          <aside className={styles.listPanel}>
            <div className={styles.listHeader}>
              <h2 className={styles.listTitle}>Inbox</h2>
              <span className={`${styles.count} ${unreadCount ? styles.countUnread : ''}`}>
                {filteredNotifications.length}
              </span>
            </div>
            <div className={styles.filterBar} aria-label="Filter notifications">
              {([
                ['all', 'All', notifications.length],
                ['unread', 'Unread', unreadCount],
                ['read', 'Read', notifications.length - unreadCount],
              ] as const).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.filterButton} ${filter === value ? styles.filterButtonActive : ''}`}
                  onClick={() => handleFilterChange(value)}
                  aria-pressed={filter === value}
                >
                  {label}
                  <span>{count}</span>
                </button>
              ))}
            </div>
            <div className={styles.list}>
              {pageNotifications.length === 0 ? (
                <div className={styles.listEmpty}>
                  <span>{filter === 'unread' ? 'No unread notifications' : 'No read notifications'}</span>
                  <button type="button" onClick={() => handleFilterChange('all')}>Show all</button>
                </div>
              ) : pageNotifications.map((notification) => {
                const selected = notification.id === selectedNotification?.id;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={[
                      styles.notificationItem,
                      selected ? styles.notificationItemSelected : '',
                      !notification.read ? styles.itemUnread : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleSelect(notification)}
                    aria-current={selected ? 'true' : undefined}
                  >
                    <span className={`${styles.itemIcon} ${!notification.read ? styles.itemIconUnread : ''}`}>
                      {notification.read ? <Bell size={16} /> : <BellDot size={16} />}
                    </span>
                    <span className={styles.itemContent}>
                      <span className={styles.itemTopline}>
                        <span className={styles.itemTitle}>{notification.title}</span>
                        <time className={styles.itemDate} dateTime={notification.created_at}>
                          {new Date(notification.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </time>
                      </span>
                      <span className={styles.itemMessage}>{notification.message}</span>
                    </span>
                    {!notification.read && <span className={styles.unreadDot} aria-label="Unread" />}
                  </button>
                );
              })}
            </div>
            <div className={styles.pagination}>
              <span>
                {filteredNotifications.length === 0
                  ? '0 notifications'
                  : `${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, filteredNotifications.length)} of ${filteredNotifications.length}`}
              </span>
              <div className={styles.pageControls}>
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>{currentPage} / {pageCount}</span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === pageCount}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </aside>

          <article className={styles.detailPanel} aria-live="polite">
            {selectedNotification ? (
              <>
                <div className={styles.detailToolbar}>
                  <button className={styles.backButton} onClick={() => setMobileDetailOpen(false)}>
                    <ArrowLeft size={15} />
                    All notifications
                  </button>
                  <span className={styles.detailLabel}><Inbox size={14} /> Notification details</span>
                  <span className={`${styles.statusBadge} ${!selectedNotification.read ? styles.statusUnread : ''}`}>
                    {!selectedNotification.read ? <><span className={styles.statusDot} /> Unread</> : <><Check size={13} /> Read</>}
                  </span>
                </div>
                <div className={styles.detailBody}>
                  <div className={styles.detailIcon}><Bell size={23} /></div>
                  <h2 className={styles.detailTitle}>{selectedNotification.title}</h2>
                  <time className={styles.detailDate} dateTime={selectedNotification.created_at}>
                    <CalendarDays size={15} />
                    {new Date(selectedNotification.created_at).toLocaleString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </time>
                  <p className={styles.detailMessage}>{selectedNotification.message}</p>
                </div>
                <footer className={styles.detailFooter}>
                  <Check size={14} />
                  {selectedNotification.read ? 'You’re up to date with this notification.' : 'This notification is unread.'}
                </footer>
              </>
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}><Bell size={23} /></div>
                <h2>{filteredNotifications.length ? 'Select a notification' : 'No notifications in this filter'}</h2>
                <p>{filteredNotifications.length ? 'Choose an item from your inbox to read the full update.' : 'Try another filter to see more updates.'}</p>
              </div>
            )}
          </article>
        </section>
      )}
    </main>
  );
}
