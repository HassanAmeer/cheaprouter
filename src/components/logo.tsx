'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Logo({ href = '/', onClick }: { href?: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-main)' }}>
      <span style={{ color: 'var(--color-primary)' }}><Zap size={22} fill="currentColor" /></span> CheapModels
    </Link>
  );
}
