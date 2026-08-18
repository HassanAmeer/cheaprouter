'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Terminal, Code, Zap, Clock, Workflow, Globe, ArrowUpRight } from 'lucide-react';
import styles from '@/app/page.module.css';
import InstallBox from '@/components/InstallBox';
import InstallGrid from '@/components/InstallGrid';
import { useSiteSettings } from '@/components/settings-provider';

export default function QuickStartPage() {
  const { settings } = useSiteSettings();
  const cliTab = (settings.pricingSection?.tabs || []).find((t) => t.id === 'tab_cli');
  const starter = (cliTab?.plans || []).find((p) => p.id === 'p_cli_2');
  const promoPrice = starter ? `${starter.price}${starter.period}` : '$2 USD / month';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40, paddingTop: 0 }}>
      
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: '100%', maxWidth: 650, display: 'flex', justifyContent: 'center' }}>
          <InstallBox />
        </div>

        <h3 style={{ fontSize: '36px', fontWeight: 900, textAlign: 'center', letterSpacing: '-1.5px', color: 'var(--color-text-main)', marginTop: 0, marginBottom: 24, opacity: 0.4 }}>
          Buy Just for <span style={{ color: '#ef4444' }}>{promoPrice}</span>
        </h3>
      </div>


      <InstallGrid />
    </div>
  );
}
