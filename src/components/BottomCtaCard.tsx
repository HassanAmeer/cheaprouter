import React from 'react';
import { Copy, Star, Check } from 'lucide-react';
import styles from './BottomCtaCard.module.css';

export default function BottomCtaCard() {
  const handleCopy = () => {
    navigator.clipboard.writeText('npm install -g cheap-cli');
    // Optional: add a toast here if you want
  };

  return (
    <div className={`container ${styles.section}`}>
      <div className={styles.card}>
        <div className={styles.glow} />
        
        <div className={styles.contentLeft}>
          <h2 className={styles.title}>
            Build with freedom.<br />
            <span className={styles.highlight}>Start in 60 seconds.</span>
          </h2>
          <p className={styles.desc}>
            Install the CLI, run /ferment, and hand off to the agent. No lock-in, no waiting list, no credit card.
          </p>
          <div className={styles.buttons}>
            <button className={styles.primaryBtn} onClick={handleCopy}>
              <Copy size={16} /> Copy curl
            </button>
            <a href="https://github.com/cheaprouter" target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>
              <Star size={16} color="var(--color-primary)" fill="var(--color-primary)" /> Star on GitHub
            </a>
          </div>
        </div>

        <div className={styles.contentRight}>
          <ul className={styles.features}>
            <li>
              <span className={styles.checkIcon}><Check size={14} strokeWidth={3} /></span>
              Optimized for open-source models
            </li>
            <li>
              <span className={styles.checkIcon}><Check size={14} strokeWidth={3} /></span>
              No rate limits or token caps
            </li>
            <li>
              <span className={styles.checkIcon}><Check size={14} strokeWidth={3} /></span>
              Built in model orchestration
            </li>
            <li>
              <span className={styles.checkIcon}><Check size={14} strokeWidth={3} /></span>
              Open source CLI
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
