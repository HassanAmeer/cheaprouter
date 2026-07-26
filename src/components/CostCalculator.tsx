'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingDown, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import styles from './CostCalculator.module.css';

interface PricingModel {
  id: string;
  name: string;
  directPricePerM: number; // in USD per 1M tokens
  cheapPricePerM: number;  // in USD per 1M tokens
}

const MODELS_DATA: PricingModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', directPricePerM: 5.00, cheapPricePerM: 1.50 },
  { id: 'claude-sonnet', name: 'Claude 3.5 Sonnet', directPricePerM: 6.00, cheapPricePerM: 2.10 },
  { id: 'deepseek-r1', name: 'DeepSeek R1', directPricePerM: 2.19, cheapPricePerM: 0.55 },
  { id: 'llama-70b', name: 'Llama 3.3 70B', directPricePerM: 1.20, cheapPricePerM: 0.35 },
];

export default function CostCalculator() {
  const [tokensM, setTokensM] = useState<number>(25); // in Millions
  const [selectedModel, setSelectedModel] = useState<PricingModel>(MODELS_DATA[0]);

  const directMonthlyCost = (tokensM * selectedModel.directPricePerM);
  const cheapMonthlyCost = (tokensM * selectedModel.cheapPricePerM);
  const monthlySavings = directMonthlyCost - cheapMonthlyCost;
  const annualSavings = monthlySavings * 12;
  const savingsPercent = Math.round((monthlySavings / directMonthlyCost) * 100) || 0;

  return (
    <section className={styles.calculatorSection} id="calculator">
      <div className={styles.container}>
        <div className={styles.calculatorCard}>
          <div className={styles.cardGlow} />

          <div className={styles.header}>
            <div className={styles.badge}>
              <TrendingDown size={14} /> Real-Time ROI Estimator
            </div>
            <h2 className={styles.title}>
              Calculate Your <span className={styles.highlight}>API Savings</span>
            </h2>
            <p className={styles.subtitle}>
              See how much your team saves instantly by switching to CheapRouter smart fallback routing.
            </p>
          </div>

          <div className={styles.grid}>
            {/* LEFT: Controls */}
            <div className={styles.controlsCol}>
              {/* Model Select */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Select Target Model</label>
                <div className={styles.modelSelector}>
                  {MODELS_DATA.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`${styles.modelChip} ${selectedModel.id === m.id ? styles.modelChipActive : ''}`}
                      onClick={() => setSelectedModel(m)}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Token Slider */}
              <div className={styles.formGroup}>
                <div className={styles.sliderLabelRow}>
                  <label className={styles.label}>Monthly Token Usage</label>
                  <span className={styles.sliderVal}>{tokensM} Million Tokens / mo</span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={200} 
                  step={1}
                  value={tokensM} 
                  onChange={(e) => setTokensM(Number(e.target.value))}
                  className={styles.rangeInput}
                />
                <div className={styles.rangeTicks}>
                  <span>1M</span>
                  <span>50M</span>
                  <span>100M</span>
                  <span>200M</span>
                </div>
              </div>

              {/* Bullet Features */}
              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>No commit fees or subscription minimums</span>
                </div>
                <div className={styles.featureItem}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Zero code changes with drop-in SDK replacement</span>
                </div>
                <div className={styles.featureItem}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Automated fallback routing for 99.99% uptime</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Results Display */}
            <div className={styles.resultsCol}>
              <div className={styles.savingsBox}>
                <span className={styles.savingsLabel}>ESTIMATED ANNUAL SAVINGS</span>
                <div className={styles.savingsAmount}>
                  ${annualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  <span className={styles.perYear}>/yr</span>
                </div>
                
                {/* Savings Progress Bar */}
                <div className={styles.progressContainer}>
                  <div className={styles.progressHeader}>
                    <span>Cost Reduction</span>
                    <span className={styles.progressPercent}>{savingsPercent}% Saved</span>
                  </div>
                  <div className={styles.track}>
                    <div className={styles.fill} style={{ width: `${savingsPercent}%` }} />
                  </div>
                </div>

                {/* Direct vs Cheap comparison */}
                <div className={styles.compareGrid}>
                  <div className={styles.compareItem}>
                    <span className={styles.compareLabel}>Direct Provider</span>
                    <span className={styles.comparePriceDirect}>
                      ${directMonthlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })} /mo
                    </span>
                  </div>
                  <div className={styles.compareItem}>
                    <span className={styles.compareLabel}>CheapRouter</span>
                    <span className={styles.comparePriceCheap}>
                      ${cheapMonthlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })} /mo
                    </span>
                  </div>
                </div>

                <Link href="/signup" className={styles.ctaButton}>
                  Claim Savings & Get API Key <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
