'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';
import pageStyles from '@/app/page.module.css';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-provider';
import { useSiteSettings } from '@/components/settings-provider';
import { BarChart3, Key, Plug, Settings, CreditCard, Search, Bell, LogOut, Zap, LineChart, FileText, Rocket, Megaphone, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const [hideAnnouncement2, setHideAnnouncement2] = useState(false);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <BarChart3 size={18} />, badge: null },
    { name: 'API Keys', path: '/dashboard/keys', icon: <Key size={18} />, badge: null },
    { name: 'Providers', path: '/dashboard/providers', icon: <Plug size={18} />, badge: 'BYOK' },
    { name: 'Billing', path: '/dashboard/billing', icon: <CreditCard size={18} />, badge: null },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={18} />, badge: null },
    { divider: true },
    { name: 'API Docs', path: '/docs', icon: <FileText size={18} />, badge: null },
  ];

  const userName = user?.name ?? 'Developer';
  const userEmail = user?.email ?? 'dev@cheapagents.com';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={`${styles.dashboardContainer} bg-grid-light`}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <Zap size={20} fill="var(--color-primary)" color="var(--color-primary)" /> CheapAgents
          </Link>
        </div>


        <div className={styles.sidebarSection}>Workspace</div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item, idx) => {
            if (item.divider) {
              return <div key={`div-${idx}`} style={{ height: 1, background: 'var(--color-border)', margin: '12px 0' }} />;
            }
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path as string}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                <span>{item.name}</span>
                {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0 16px 16px' }}>
          <Link href="/dashboard/quickstart" style={{ 
            display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
            background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', 
            padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', textDecoration: 'none',
            transition: 'all 0.2s'
          }}>
            <Rocket size={14} /> Quick Start
          </Link>
        </div>

        {/* Sidebar footer with user info */}
        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarAvatar}>{initials}</div>
          <div className={styles.sidebarUserInfo}>
            <div className={styles.sidebarUserName}>{userName}</div>
            <div className={styles.sidebarUserEmail}>{userEmail}</div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {!hideAnnouncement2 && settings.dashboardSettings.announcementBanner && (
          <div className={`${styles.welcomeBanner} ${styles.announcementBar}`} style={{ position: 'relative', overflow: 'hidden', padding: '0' }}>
            <div className={pageStyles.cardStarsBg} style={{ opacity: 0.6, zIndex: 0, pointerEvents: 'none' }}>
              <div className={`${pageStyles.cardStar} ${pageStyles.cardStar1}`} />
              <div className={`${pageStyles.cardStar} ${pageStyles.cardStar2}`} />
              <div className={`${pageStyles.cardStar} ${pageStyles.cardStar3}`} />
              <div className={`${pageStyles.cardStar} ${pageStyles.cardStar4}`} />
              <div className={`${pageStyles.cardStar} ${pageStyles.cardStar5}`} />
              <div className={`${pageStyles.cardStar} ${pageStyles.cardStar6}`} />
              <div className={`${pageStyles.cardShootingStar} ${pageStyles.cardShootingStar1}`} />
              <div className={`${pageStyles.cardShootingStar} ${pageStyles.cardShootingStar2}`} />
              <div className={`${pageStyles.cardShootingStar} ${pageStyles.cardShootingStar3}`} />
            </div>

            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, zIndex: 0, pointerEvents: 'none' }}>
              <Megaphone size={24} />
            </div>

            <button 
              onClick={() => setHideAnnouncement2(true)}
              style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '16px', background: 'rgba(128,128,128,0.15)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, color: 'inherit', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(128,128,128,0.25)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(128,128,128,0.15)'}
              title="Dismiss Announcement"
            >
              <X size={14} />
            </button>

            <div style={{ position: 'relative', zIndex: 1, paddingLeft: '50px', paddingRight: '50px', display: 'flex', alignItems: 'center', minHeight: '44px', justifyContent: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>
                {settings.dashboardSettings.announcementBanner}
              </div>
            </div>
          </div>
        )}

        {/* Topbar */}
        <header className={styles.topbar}>
          <div>
            <div className={styles.pageTitle}>
              {navItems.find(i => i.path === pathname)?.name ?? 'Dashboard'}
            </div>
            <div className={styles.pageBreadcrumb}>
              Dashboard {pathname !== '/dashboard' && `/ ${navItems.find(i => i.path === pathname)?.name ?? ''}`}
            </div>
          </div>
          <div className={styles.topbarActions}>
            <div className={styles.topbarSearch}>
              <Search size={14} />
              <span>Search…</span>
              <kbd>⌘K</kbd>
            </div>
            <button className={styles.notificationBtn} title="Notifications">
              <Bell size={18} />
              <span className={styles.notificationDot} />
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Content */}
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
