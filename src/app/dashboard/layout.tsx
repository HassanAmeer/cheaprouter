'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-provider';
import { BarChart3, Key, Plug, Settings, CreditCard, Search, Bell, LogOut, Zap, LineChart } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <BarChart3 size={18} />, badge: null },
    { name: 'API Keys', path: '/dashboard/keys', icon: <Key size={18} />, badge: null },
    { name: 'Providers', path: '/dashboard/providers', icon: <Plug size={18} />, badge: 'BYOK' },
    { name: 'Analytics', path: '/dashboard/analytics', icon: <LineChart size={18} />, badge: null },
    { name: 'Billing', path: '/dashboard/billing', icon: <CreditCard size={18} />, badge: null },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={18} />, badge: null },
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
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                <span>{item.name}</span>
                {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

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
