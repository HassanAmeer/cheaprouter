'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowUpRight, Cpu } from 'lucide-react';
import styles from './ModelCarousel3D.module.css';

interface ModelItem {
  id: string;
  name: string;
  provider: string;
  badge: string;
  badgeColor: string;
  mmlu: string;
  speed: string;
  price: string;
  context: string;
  description: string;
  iconBg: string;
  tags: string[];
}

const MODELS: ModelItem[] = [
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek Inc.',
    badge: 'Reasoning Leader',
    badgeColor: '#3b82f6',
    mmlu: '90.8%',
    speed: '85 t/s',
    price: '$0.55 / 1M',
    context: '128K',
    description: 'Open-weights reasoning powerhouse outperforming traditional LLMs on complex math & code.',
    iconBg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    tags: ['Reasoning', 'Open Source', 'Ultra Cheap']
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    badge: 'Flagship Multimodal',
    badgeColor: '#10b981',
    mmlu: '88.7%',
    speed: '120 t/s',
    price: '$2.50 / 1M',
    context: '128K',
    description: 'Versatile vision and intelligence engine for complex enterprise workflows and agentic tasks.',
    iconBg: 'linear-gradient(135deg, #064e3b, #10b981)',
    tags: ['Multimodal', 'High Accuracy', 'Fast']
  },
  {
    id: 'claude-35-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    badge: 'Coding Champion',
    badgeColor: '#f97316',
    mmlu: '88.7%',
    speed: '95 t/s',
    price: '$3.00 / 1M',
    context: '200K',
    description: 'State-of-the-art coding and nuanced writing performance with superior artifact creation.',
    iconBg: 'linear-gradient(135deg, #7c2d12, #f97316)',
    tags: ['Coding SOTA', 'Artifacts', '200K Context']
  },
  {
    id: 'gemini-15-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google AI',
    badge: '2M Long Context',
    badgeColor: '#8b5cf6',
    mmlu: '85.9%',
    speed: '110 t/s',
    price: '$1.25 / 1M',
    context: '2,000K',
    description: 'Breakthrough 2M token context window capable of processing entire codebases and video hours.',
    iconBg: 'linear-gradient(135deg, #4c1d95, #8b5cf6)',
    tags: ['2M Tokens', 'Video & Audio', 'Google AI']
  },
  {
    id: 'llama-33-70b',
    name: 'Llama 3.3 70B',
    provider: 'Meta AI',
    badge: 'Open Weight Standard',
    badgeColor: '#ec4899',
    mmlu: '86.0%',
    speed: '130 t/s',
    price: '$0.40 / 1M',
    context: '128K',
    description: 'Meta\'s latest 70B open model matching top closed models at a fraction of the operating cost.',
    iconBg: 'linear-gradient(135deg, #831843, #ec4899)',
    tags: ['Open Weights', 'Meta', 'Low Latency']
  },
  {
    id: 'qwen-25-coder',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'Alibaba Cloud',
    badge: 'Open Coding SOTA',
    badgeColor: '#06b6d4',
    mmlu: '84.2%',
    speed: '140 t/s',
    price: '$0.30 / 1M',
    context: '128K',
    description: 'Top-ranking open-source coding model optimized for code generation and debugging.',
    iconBg: 'linear-gradient(135deg, #164e63, #06b6d4)',
    tags: ['Open Source', 'Fast Coding', 'Low Cost']
  },
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'Mistral AI',
    badge: '128B Multi-lingual',
    badgeColor: '#eab308',
    mmlu: '84.0%',
    speed: '100 t/s',
    price: '$2.00 / 1M',
    context: '128K',
    description: 'Flagship European AI model with unmatched multilingual reasoning and function calling.',
    iconBg: 'linear-gradient(135deg, #713f12, #eab308)',
    tags: ['Multilingual', 'Function Calling', 'EU AI']
  }
];

export default function ModelCarousel3D() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % MODELS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + MODELS.length) % MODELS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % MODELS.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rotateX: y * -12, rotateY: x * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsPaused(false);
  };

  const getPositionClass = (index: number) => {
    const total = MODELS.length;
    let diff = (index - activeIndex) % total;
    if (diff < 0) diff += total;
    if (diff > total / 2) diff -= total;

    if (diff === 0) return styles.active;
    if (diff === 1) return styles.next;
    if (diff === 2) return styles.farNext;
    if (diff === -1) return styles.prev;
    if (diff === -2) return styles.farPrev;
    return styles.hidden;
  };

  return (
    <section className={styles.carouselSection} id="models-3d">
      <div className={styles.sectionHeader}>
        <div className={styles.eyebrow}>
          <Sparkles size={14} /> Next-Gen AI Fleet
        </div>
        <h2 className={styles.title}>
          Explore Top-Tier <span className={styles.gradientText}>AI Models</span>
        </h2>
        <p className={styles.subtitle}>
          Access 15+ state-of-the-art models through one unified API key with zero rate-limit throttles.
        </p>
      </div>

      <div 
        className={styles.carouselContainer}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <button 
          className={`${styles.navBtn} ${styles.navBtnPrev}`} 
          onClick={handlePrev}
          aria-label="Previous model"
        >
          <ChevronLeft size={24} />
        </button>

        <div className={styles.stage3D}>
          {MODELS.map((model, index) => {
            const posClass = getPositionClass(index);
            const isActive = posClass === styles.active;

            return (
              <div 
                key={model.id}
                className={`${styles.card3D} ${posClass}`}
                onClick={() => setActiveIndex(index)}
                style={
                  isActive
                    ? {
                        transform: `translate3d(0, 0, 40px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(1.06)`,
                      }
                    : undefined
                }
              >
                <div className={styles.cardHeader}>
                  <div className={styles.providerBadge} style={{ background: model.iconBg }}>
                    <Cpu size={20} color="#fff" />
                  </div>
                  <div>
                    <h3 className={styles.modelName}>{model.name}</h3>
                    <span className={styles.providerName}>{model.provider}</span>
                  </div>
                  <span className={styles.badgeTag} style={{ borderColor: model.badgeColor, color: model.badgeColor }}>
                    {model.badge}
                  </span>
                </div>

                <p className={styles.description}>{model.description}</p>

                {/* Benchmark Stats Grid */}
                <div className={styles.statsGrid}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>MMLU Score</span>
                    <span className={styles.statValue}>{model.mmlu}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Speed</span>
                    <span className={styles.statValue}>{model.speed}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Context</span>
                    <span className={styles.statValue}>{model.context}</span>
                  </div>
                </div>

                {/* Pricing Banner */}
                <div className={styles.priceRow}>
                  <div>
                    <span className={styles.priceLabel}>CheapRouter Rate</span>
                    <div className={styles.priceVal}>{model.price}</div>
                  </div>
                  <button className={styles.cardCta} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Try Model <ArrowUpRight size={16} />
                  </button>
                </div>

                {/* Tag Pills */}
                <div className={styles.tagList}>
                  {model.tags.map((t, idx) => (
                    <span key={idx} className={styles.tagPill}>#{t}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button 
          className={`${styles.navBtn} ${styles.navBtnNext}`} 
          onClick={handleNext}
          aria-label="Next model"
        >
          <ChevronRight size={24} />
        </button>
      </div>


    </section>
  );
}
