'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Terminal, Code, Zap, Clock, Workflow, Globe, ArrowUpRight } from 'lucide-react';
import styles from '@/app/page.module.css';
import InstallBox from '@/components/InstallBox';
import InstallGrid from '@/components/InstallGrid';

export default function QuickStartPage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40, paddingTop: 0 }}>
      
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: '100%', maxWidth: 650, display: 'flex', justifyContent: 'center' }}>
          <InstallBox />
        </div>

        <h3 style={{ fontSize: '36px', fontWeight: 900, textAlign: 'center', letterSpacing: '-1.5px', color: 'var(--color-text-main)', marginTop: 0, marginBottom: 24, opacity: 0.4 }}>
          Buy Just for <span style={{ color: '#ef4444' }}>$2 USD / month</span>
        </h3>
      </div>


      <InstallGrid />
    </div>
  );
}
