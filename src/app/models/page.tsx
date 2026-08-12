'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ModelsTable from '../../components/ModelsTable';

export default function AllModelsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)', paddingBottom: '80px' }}>
      <div style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', height: '60px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
            <ArrowLeft size={15} /> Back
          </Link>
          <span style={{ color: 'var(--color-border)', fontSize: '18px' }}>|</span>
          <span style={{ color: 'var(--color-text-main)', fontSize: '14px', fontWeight: 600 }}>All Models</span>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px', letterSpacing: '-0.5px' }}>All Available Models</h1>
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>Browse all models available on this platform, sorted by priority.</p>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <ModelsTable />
      </div>
    </div>
  );
}
