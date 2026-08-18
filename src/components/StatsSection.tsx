import React from 'react';
import { Check, Unlock, Key, Zap } from 'lucide-react';
import { useSiteSettings } from '@/components/settings-provider';
import styles from './StatsSection.module.css';

export default function StatsSection() {
  const { settings } = useSiteSettings();
  const cliTab = (settings.pricingSection?.tabs || []).find((t) => t.id === 'tab_cli');
  const starter = (cliTab?.plans || []).find((p) => p.id === 'p_cli_2');
  const entryPrice = starter ? starter.price.replace('$', '') : '$2';

  return (
    <section className={`container ${styles.statsSection}`}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Check size={24} /></div>
          <div className={styles.statValue}>11/13</div>
          <div className={styles.statLabel}>features covered</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Unlock size={24} /></div>
          <div className={styles.statValue}>100+</div>
          <div className={styles.statLabel}>models supported</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Key size={24} /></div>
          <div className={styles.statValue}>1</div>
          <div className={styles.statLabel}>API key needed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Zap size={24} /></div>
          <div className={styles.statValue}>{entryPrice}</div>
          <div className={styles.statLabel}>to get started</div>
        </div>
      </div>
    </section>
  );
}