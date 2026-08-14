'use client';
import React from 'react';
import Link from 'next/link';
import { KeyRound, ShieldAlert, CircuitBoard, ArrowRight, Lock, TerminalSquare } from 'lucide-react';

export default function SystemApiOverview() {
  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <style jsx>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 700, color: 'var(--color-warning)', background: 'var(--color-warning-soft, rgba(250,204,21,0.15))', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(250,204,21,0.3)' }}>
          <ShieldAlert size={12} /> Only for Admin System
        </span>
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, var(--color-text-main) 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        System API Overview
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: '8px 0 24px', maxWidth: '640px' }}>
        Internal, admin-only endpoints living under <code>/systemapi</code>. Use the sidebar to browse each API.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Link href="/admin/system-api/keys" style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderRadius: 16, textDecoration: 'none',
          background: 'var(--color-card-bg)', border: '1px solid var(--color-border)',
          transition: 'all .15s'
        }}>
          <span style={{ display: 'inline-flex', width: 44, height: 44, borderRadius: 12, background: 'var(--color-primary-soft)', color: 'var(--color-primary)', alignItems: 'center', justifyContent: 'center' }}>
            <KeyRound size={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Keys Store
              <span style={{ fontSize: '11px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '12px', color: 'var(--color-text-muted)' }}>POST /api/systemapi/keys</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 3 }}>Store and revoke system-level API keys.</div>
          </div>
          <span style={{ color: 'var(--color-primary)', display: 'inline-flex' }}><ArrowRight size={18} /></span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderRadius: 16, background: 'var(--color-card-bg)', border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)', opacity: 0.8 }}>
          <CircuitBoard size={18} />
          <span style={{ fontSize: '13px' }}>More system APIs will be listed here as they are added.</span>
        </div>
      </div>
    </div>
  );
}
