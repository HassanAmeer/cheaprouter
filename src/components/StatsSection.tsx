import React from 'react';
import { Check, Unlock, Key, Zap } from 'lucide-react';
import styles from './StatsSection.module.css';

export default function StatsSection() {
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
          <div className={styles.statValue}>$2</div>
          <div className={styles.statLabel}>to get started</div>
        </div>
      </div>
    </section>
  );
}
