'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';
import { BarChart3, Key, Plug, Settings } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <BarChart3 size={20} /> },
    { name: 'API Keys', path: '/dashboard/keys', icon: <Key size={20} /> },
    { name: 'Providers (BYOK)', path: '/dashboard/providers', icon: <Plug size={20} /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className={`${styles.dashboardContainer} bg-grid-light`}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <span style={{ color: 'var(--color-primary)' }}>⚡</span> CheapModels
          </Link>
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path} 
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.pageTitle}>Dashboard</div>
          <div className={styles.topbarActions}>
            <Link href="/" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>Documentation</Link>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>JD</div>
              John Doe
            </div>
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
