'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, Zap, DollarSign, ChevronRight } from 'lucide-react';
import styles from './StickyScrollNav.module.css';

interface NavSection {
  id: string;
  num: string;
  title: string;
  badge: string;
  desc: string;
  icon: React.ReactNode;
}

const SECTIONS: NavSection[] = [
  {
    id: 'models',
    num: '01',
    title: 'AI Models & Benchmarks',
    badge: 'SECTION 1',
    desc: 'Compare 100+ LLMs with real-time speed, latency, and token pricing.',
    icon: <Cpu size={14} />,
  },
  {
    id: 'integrations',
    num: '02',
    title: 'API Integration & Stack',
    badge: 'SECTION 2',
    desc: 'Connect Python, Node, Go, Rust, or any framework with drop-in OpenAI API routing.',
    icon: <Zap size={14} />,
  },
  {
    id: 'pricing',
    num: '03',
    title: 'cheap-cli & Pricing',
    badge: 'SECTION 3',
    desc: 'Terminal coding tool, BYOK secure proxying, and simple honest pricing plans.',
    icon: <DollarSign size={14} />,
  },
];

export default function StickyScrollNav() {
  const [activeId, setActiveId] = useState<string>('models');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Show once user scrolls past hero section (> 350px)
      setIsVisible(scrollPosition > 350);

      const sectionElements = SECTIONS.map((sec) => document.getElementById(sec.id)).filter(Boolean);

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
      const yOffset = -80; // Header height offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <aside className={styles.stickyNavContainer} aria-label="Page section navigator">
      <div className={styles.navTrack}>
        <div className={styles.progressLine} />

        {SECTIONS.map((sec) => {
          const isActive = activeId === sec.id;
          const isHovered = hoveredId === sec.id;

          return (
            <div
              key={sec.id}
              className={styles.dotItem}
              onMouseEnter={() => setHoveredId(sec.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Dot Button */}
              <button
                type="button"
                className={`${styles.dotBtn} ${isActive ? styles.dotBtnActive : ''}`}
                onClick={() => scrollToSection(sec.id)}
                aria-label={`Scroll to ${sec.title}`}
              >
                <span className={styles.dotPulse} />
                <span className={styles.dotCore} />
              </button>

              {/* Tooltip Card (Item-Hints Style) */}
              <div
                className={`${styles.hintCard} ${isActive || isHovered ? styles.hintCardVisible : ''}`}
                onClick={() => scrollToSection(sec.id)}
              >
                <div className={styles.hintHeader}>
                  <span className={styles.hintBadge}>{sec.badge}</span>
                  <span className={styles.hintNum}>{sec.num}</span>
                </div>
                <div className={styles.hintTitle}>
                  <span className={styles.hintIcon}>{sec.icon}</span>
                  {sec.title}
                  <ChevronRight size={14} className={styles.hintArrow} />
                </div>
                <p className={styles.hintDesc}>{sec.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
