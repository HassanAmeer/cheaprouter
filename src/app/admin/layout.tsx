'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, Settings, LogOut, Zap, Server, Activity,
  ChevronDown, ChevronRight, Sparkles, Image as ImageIcon,
  HelpCircle, AlignLeft, LayoutPanelLeft, Globe, Mail
} from 'lucide-react';
import styles from './admin.module.css';
import { ThemeToggle } from '@/components/theme-toggle';

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
          <div className={styles.sectionTitleBadge}>
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
            <Zap size={17} /> Global API Keys
          </Link>
          <Link href="/admin/providers" className={`${styles.navItem} ${pathname.startsWith('/admin/providers') ? styles.navItemActive : ''}`}>
            <Server size={17} /> Provider Routing
          </Link>
          <Link href="/admin/analytics" className={`${styles.navItem} ${pathname.startsWith('/admin/analytics') ? styles.navItemActive : ''}`}>
            <Activity size={17} /> Analytics & Revenue
          </Link>
        </div>
      </div>

      {/* ─── SECTION 2: PAGE & CMS SETTINGS ─── */}
      <div className={styles.navSection}>
        <div className={styles.sectionHeader} title="Page & CMS Settings Section">
          <div className={styles.sectionDottedLine} />
          <div className={styles.sectionTitleBadge}>
            <span>Page & CMS Settings</span>
          </div>
        </div>
        <div className={styles.sectionItems}>
          <Link href="/admin/settings?tab=general" className={`${styles.navItem} ${isTabActive('general') ? styles.navItemActive : ''}`}>
            <Sparkles size={17} /> General & Brand
          </Link>
          <Link href="/admin/settings?tab=landing" className={`${styles.navItem} ${isTabActive('landing') || (pathname === '/admin/settings' && !currentTab) ? styles.navItemActive : ''}`}>
            <Globe size={17} /> Landing Page CMS
          </Link>
          <Link href="/admin/settings?tab=contact" className={`${styles.navItem} ${isTabActive('contact') ? styles.navItemActive : ''}`}>
            <Mail size={17} /> Contact & Support
          </Link>
          <Link href="/admin/settings?tab=dashboard" className={`${styles.navItem} ${isTabActive('dashboard') ? styles.navItemActive : ''}`}>
            <LayoutPanelLeft size={17} /> User Dashboard CMS
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
    if (pathname.startsWith('/admin/keys')) return 'Global API Keys';
    if (pathname.startsWith('/admin/providers')) return 'Provider Routing';
    if (pathname.startsWith('/admin/analytics')) return 'Analytics & Revenue';
    if (pathname.startsWith('/admin/settings')) return 'CMS & Site Settings';
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
