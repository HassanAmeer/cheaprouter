'use client';

import React, { useEffect, useState } from 'react';
import { Layers, DollarSign, Code, Terminal } from 'lucide-react';
import styles from './StickyScrollNav.module.css';

interface NavStep {
  id: string;
  stepNum: string;
  label: string;
  icon: React.ReactNode;
}

const STEPS: NavStep[] = [
  { id: 'ai-models', stepNum: '01', label: 'AI Models', icon: <Layers size={14} /> },
  { id: 'price-benchmark', stepNum: '02', label: 'Price Benchmark', icon: <DollarSign size={14} /> },
  { id: 'unified-api', stepNum: '03', label: 'Unified API', icon: <Code size={14} /> },
  { id: 'cli-and-tiers', stepNum: '04', label: 'cheap-cli & Tiers', icon: <Terminal size={14} /> },
];

export default function StickyScrollNav() {
  const [activeId, setActiveId] = useState<string>('ai-models');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 400);

      const sectionElements = STEPS.map((step) => document.getElementById(step.id)).filter(Boolean);

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const sec = sectionElements[i];
        if (sec) {
          const rect = sec.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            setActiveId(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isVisible) return null;

  return (
    <aside className={styles.stickyNavContainer} aria-label="Page scroll progress">
      <div className={styles.navTrack}>
        <div className={styles.progressLine} />
        {STEPS.map((step, idx) => {
          const isActive = activeId === step.id;
          return (
            <button
              key={step.id}
              type="button"
              className={`${styles.stepBtn} ${isActive ? styles.stepBtnActive : ''}`}
              onClick={() => scrollToSection(step.id)}
              title={step.label}
            >
              <div className={styles.dotWrap}>
                <div className={styles.dot} />
              </div>
              <div className={styles.labelCard}>
                <span className={styles.stepNum}>{step.stepNum}</span>
                <span className={styles.stepIcon}>{step.icon}</span>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
