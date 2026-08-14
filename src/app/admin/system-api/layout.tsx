'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ShieldAlert, ChevronRight, CircuitBoard, Lock } from 'lucide-react';
import s from './system-api.module.css';

const NAV_ITEMS = [
  { href: '/admin/system-api/keys', label: 'Keys Store', icon: <KeyRound size={16} />, desc: 'Store system API keys' },
];

export default function SystemApiLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={s.wrap}>
      {/* Inner sidebar */}
      <aside className={s.sidebar}>
        <div className={s.sidebarHead} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 10 }}>
          <span style={{ display: 'inline-flex', width: 28, height: 28, borderRadius: 8, background: 'var(--color-warning-soft, rgba(250,204,21,0.15))', color: 'var(--color-warning)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldAlert size={16} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.3px' }}>System API</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lock size={10} /> Admin only
            </div>
          </div>
        </div>

        <nav className={s.navList} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/admin/system-api' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
                  textDecoration: 'none', fontSize: '13px', fontWeight: 600,
                  background: active ? 'var(--color-primary-soft)' : 'transparent',
                  border: active ? '1px solid var(--color-primary)' : '1px solid transparent',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-main)',
                  transition: 'all .15s'
                }}
              >
                <span style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)', display: 'inline-flex', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={14} />}
              </Link>
            );
          })}

          {/* Future placeholders */}
          <div className={s.future} style={{ marginTop: 8, paddingTop: 12, borderTop: '1px dashed var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', color: 'var(--color-text-muted)', fontSize: '12px', opacity: 0.6 }}>
              <CircuitBoard size={15} />
              <span>More APIs coming…</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Content */}
      <div className={s.content}>{children}</div>
    </div>
  );
}
