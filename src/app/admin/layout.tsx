'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, Settings, LogOut, Zap, Server, DollarSign,
  ChevronDown, ChevronRight, Sparkles, Image as ImageIcon,
  HelpCircle, AlignLeft, LayoutPanelLeft, Globe, Mail, Gift, Video, Bell, Terminal, Database, FileText, Receipt, ShieldAlert
} from 'lucide-react';
import styles from './admin.module.css';
import { ThemeToggle } from '@/components/theme-toggle';
import { DevLogsWidget } from '@/components/DevLogsWidget';

function SidebarNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') : null;

  const isTabActive = (tabName: string) => {
    return pathname === '/admin/settings' && currentTab === tabName;
  };

  return (
    <nav className={styles.sidebarNav}>
      {/* ─── SECTION 1: CORE MANAGEMENT ─── */}
      <div className={styles.navSection}>
        <div className={styles.sectionHeader} title="Core Admin Section">
          <div className={styles.sectionDottedLine} />
          <div className={styles.sectionTitle}>
            <span>Core Admin</span>
          </div>
        </div>
        <div className={styles.sectionItems}>
          <Link href="/admin" className={`${styles.navItem} ${pathname === '/admin' ? styles.navItemActive : ''}`}>
            <LayoutDashboard size={17} /> Dashboard
          </Link>
          <Link href="/admin/users" className={`${styles.navItem} ${pathname.startsWith('/admin/users') ? styles.navItemActive : ''}`}>
            <Users size={17} /> User Management
          </Link>
          <Link href="/admin/keys" className={`${styles.navItem} ${pathname.startsWith('/admin/keys') ? styles.navItemActive : ''}`}>
            <Zap size={17} /> Purchased Keys
          </Link>
          <Link href="/admin/providers" className={`${styles.navItem} ${pathname.startsWith('/admin/providers') ? styles.navItemActive : ''}`}>
            <Server size={17} /> Provider Routing
          </Link>
          <Link href="/admin/revenue" className={`${styles.navItem} ${pathname.startsWith('/admin/revenue') ? styles.navItemActive : ''}`}>
            <DollarSign size={17} /> Revenue
          </Link>
          <Link href="/admin/billing" className={`${styles.navItem} ${pathname.startsWith('/admin/billing') ? styles.navItemActive : ''}`}>
            <Receipt size={17} /> Billing
          </Link>
          <Link href="/admin/content-history" className={`${styles.navItem} ${pathname.startsWith('/admin/content-history') ? styles.navItemActive : ''}`}>
            <Video size={17} /> Content History
          </Link>
          <Link href="/admin/notifications" className={`${styles.navItem} ${pathname.startsWith('/admin/notifications') ? styles.navItemActive : ''}`}>
            <Bell size={17} /> Notify User
          </Link>
          <Link href="/admin/logs" className={`${styles.navItem} ${pathname.startsWith('/admin/logs') ? styles.navItemActive : ''}`}>
            <Terminal size={17} /> System Logs
          </Link>
        </div>
      </div>

      {/* ─── SECTION 2: SETTINGS ─── */}
      <div className={styles.navSection}>
        <div className={styles.sectionHeader} title="Settings Section">
          <div className={styles.sectionDottedLine} />
          <div className={styles.sectionTitle}>
            <span>Settings</span>
          </div>
        </div>
        <div className={styles.sectionItems}>
          <Link href="/admin/settings?tab=general" className={`${styles.navItem} ${pathname === '/admin/settings' ? styles.navItemActive : ''}`}>
            <Sparkles size={17} /> Page Settings
          </Link>
          <Link href="/admin/plan-settings" className={`${styles.navItem} ${pathname === '/admin/plan-settings' ? styles.navItemActive : ''}`}>
            <DollarSign size={17} /> Plan Settings
          </Link>
          <Link href="/admin/dash-settings" className={`${styles.navItem} ${pathname === '/admin/dash-settings' ? styles.navItemActive : ''}`}>
            <LayoutDashboard size={17} /> Dash Setting
          </Link>
          <Link href="/admin/refer-settings" className={`${styles.navItem} ${pathname === '/admin/refer-settings' ? styles.navItemActive : ''}`}>
            <Gift size={17} /> Refer Settings
          </Link>
        </div>
      </div>


      {/* ─── SECTION 3: DEVELOPER TOOLS ─── */}
      <div className={styles.navSection}>
        <div className={styles.sectionHeader} title="Developer Tools">
          <div className={styles.sectionDottedLine} />
          <div className={styles.sectionTitle}>
            <span>Developer</span>
          </div>
        </div>
        <div className={styles.sectionItems}>
          <Link href="/admin/raw-data" className={`${styles.navItem} ${pathname.startsWith('/admin/raw-data') ? styles.navItemActive : ''}`}>
            <FileText size={17} /> Raw Data
          </Link>
          <Link href="/admin/seeding" className={`${styles.navItem} ${pathname.startsWith('/admin/seeding') ? styles.navItemActive : ''}`}>
            <Database size={17} /> Database Seeding
          </Link>
          <Link href="/admin/test-models" className={`${styles.navItem} ${pathname.startsWith('/admin/test-models') ? styles.navItemActive : ''}`}>
            <Sparkles size={17} /> Test Models
          </Link>
          <Link href="/admin/system-api/keys" className={`${styles.navItem} ${pathname.startsWith('/admin/system-api') ? styles.navItemActive : ''}`}>
            <ShieldAlert size={17} /> System API
          </Link>
        </div>
      </div>
    </nav>
  );
}

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

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard Overview';
    if (pathname.startsWith('/admin/users')) return 'User Management';
    if (pathname.startsWith('/admin/keys')) return 'Purchased Keys';
    if (pathname.startsWith('/admin/providers')) return 'Provider Routing';
    if (pathname.startsWith('/admin/revenue')) return 'Revenue';
    if (pathname.startsWith('/admin/billing')) return 'Billing Management';
    if (pathname.startsWith('/admin/settings')) return 'CMS & Site Settings';
    if (pathname.startsWith('/admin/dash-settings')) return 'User Dashboard Settings';
    if (pathname.startsWith('/admin/logs')) return 'System Logs';
    if (pathname.startsWith('/admin/seeding')) return 'Database Seeding';
    if (pathname.startsWith('/admin/raw-data')) return 'Raw Data Storage';
    if (pathname.startsWith('/admin/test-models')) return 'Test Models';
    if (pathname.startsWith('/admin/system-api')) return 'System API - Store Keys';
    return 'Admin Panel';
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

        <Suspense fallback={<nav className={styles.sidebarNav} />}>
          <SidebarNavContent />
        </Suspense>

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
          <div className={styles.pageTitle}>{getPageTitle()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <DevLogsWidget />
            <ThemeToggle />
          </div>
        </header>
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
