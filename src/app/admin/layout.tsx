'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Settings, LogOut, Zap, Server, Activity } from 'lucide-react';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token && !isLoginPage) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, isLoginPage, router]);

  if (isAuthenticated === null) return null; // Avoid hydration mismatch / flash

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <div className={styles.adminContainer}>{children}</div>;
  }

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.sidebarLogo}>
          <Zap size={24} color="var(--color-primary)" fill="var(--color-primary)" /> Admin Panel
        </Link>
        <nav className={styles.sidebarNav}>
          <Link href="/admin" className={`${styles.navItem} ${pathname === '/admin' ? styles.navItemActive : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/users" className={`${styles.navItem} ${pathname === '/admin/users' ? styles.navItemActive : ''}`}>
            <Users size={18} /> Users
          </Link>
          <Link href="/admin/keys" className={`${styles.navItem} ${pathname === '/admin/keys' ? styles.navItemActive : ''}`}>
            <Zap size={18} /> Global Keys
          </Link>
          <Link href="/admin/providers" className={`${styles.navItem} ${pathname === '/admin/providers' ? styles.navItemActive : ''}`}>
            <Server size={18} /> Provider Routing
          </Link>
          <Link href="/admin/analytics" className={`${styles.navItem} ${pathname === '/admin/analytics' ? styles.navItemActive : ''}`}>
            <Activity size={18} /> Analytics & Revenue
          </Link>
          <Link href="/admin/settings" className={`${styles.navItem} ${pathname === '/admin/settings' ? styles.navItemActive : ''}`}>
            <Settings size={18} /> Settings
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.avatar}>A</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Admin</span>
            <span className={styles.userRole}>Super User</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} title="Log Out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.pageTitle}>Overview</div>
          <div></div>
        </header>
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
