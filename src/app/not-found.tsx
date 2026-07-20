'use client';

import Link from 'next/link';
import { Home, Zap } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { ThemeToggle } from '@/components/theme-toggle';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', color: 'var(--color-text-main)', padding: 24, textAlign: 'center', gap: 16 }}>
      <div style={{ position: 'absolute', top: 24, right: 24 }}><ThemeToggle /></div>
      <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 800 }}><Zap size={24} fill="currentColor" /> CheapAgents</span>
      <h1 style={{ fontSize: 'var(--text-5xl)', fontWeight: 800 }}>404</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: 420 }}>
        This page took a wrong route. Let&apos;s get you back to the models.
      </p>
      <Link href="/"><Button size="lg">Back to Home <Home size={18} /></Button></Link>
    </main>
  );
}
