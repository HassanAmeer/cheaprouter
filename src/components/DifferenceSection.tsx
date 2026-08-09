import React from 'react';
import Link from 'next/link';
import { Terminal, Zap, Key, ArrowRight } from 'lucide-react';
import styles from './DifferenceSection.module.css';

export default function DifferenceSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>The difference</h2>
        </div>

        <div className={styles.differenceGrid}>
          <div className={styles.diffCard}>
            <div className={styles.diffIcon}><Key size={28} /></div>
            <h3 className={styles.diffTitle}>One Key to Rule Them All</h3>
            <p className={styles.diffDesc}>Stop juggling API keys and credit card charges across 5 different providers. Get one CheapAgents key and access every major model instantly.</p>
          </div>
          <div className={styles.diffCard}>
            <div className={styles.diffIcon}><Terminal size={28} /></div>
            <h3 className={styles.diffTitle}>Terminal Native</h3>
            <p className={styles.diffDesc}>Not just an API. CheapAgents comes with a blazing-fast CLI tool so you can chat, code, and route models directly from your terminal.</p>
          </div>
          <div className={styles.diffCard}>
            <div className={styles.diffIcon}><Zap size={28} /></div>
            <h3 className={styles.diffTitle}>Unbeatable Pricing</h3>
            <p className={styles.diffDesc}>Start for just $2/month and get access to premium models. No crazy markups, no hidden fees. Transparent usage analytics included.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
