'use client';

import React from 'react';
import Link from 'next/link';
import { DollarSign, Check, X, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import styles from './PriceComparison.module.css';

interface ProviderComparison {
  name: string;
  type: string;
  directPrice: string;
  cheapPrice: string;
  savings: string;
  includesApi: boolean;
  includesCoding: boolean;
}

const COMPARISONS: ProviderComparison[] = [
  {
    name: 'ChatGPT Plus (OpenAI)',
    type: 'Subscription',
    directPrice: '$20 / mo',
    cheapPrice: '$3.50 / mo equivalent',
    savings: '82% Savings',
    includesApi: false,
    includesCoding: true,
  },
  {
    name: 'Claude Pro (Anthropic)',
    type: 'Subscription',
    directPrice: '$20 / mo',
    cheapPrice: '$4.20 / mo equivalent',
    savings: '79% Savings',
    includesApi: false,
    includesCoding: true,
  },
  {
    name: 'Cursor Pro IDE',
    type: 'Developer IDE',
    directPrice: '$20 / mo',
    cheapPrice: '$5.00 / mo equivalent',
    savings: '75% Savings',
    includesApi: false,
    includesCoding: true,
  },
  {
    name: 'Kimi K2 & Qwen Max',
    type: 'Direct API',
    directPrice: '$2.40 / 1M',
    cheapPrice: '$0.55 / 1M',
    savings: '77% Savings',
    includesApi: true,
    includesCoding: true,
  },
  {
    name: 'Gemini Advanced',
    type: 'Subscription',
    directPrice: '$20 / mo',
    cheapPrice: '$3.00 / mo equivalent',
    savings: '85% Savings',
    includesApi: false,
    includesCoding: true,
  },
];

export default function PriceComparison() {
  return (
    <section className={styles.priceSection} id="price-comparison">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>
            <DollarSign size={14} /> Price Benchmark
          </div>
          <h2 className={styles.title}>
            Stop Overpaying for <span className={styles.gradientText}>Individual Subscriptions</span>
          </h2>
          <p className={styles.subtitle}>
            Why pay $20/mo to 5 different providers? Get unified access to every top-tier model with CheapRouter at a fraction of official prices.
          </p>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Provider / Product</th>
                <th>Official Direct Cost</th>
                <th className={styles.highlightCol}>CheapRouter Unified Rate</th>
                <th>Savings</th>
                <th>API Access</th>
                <th>CLI Coding</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISONS.map((c, i) => (
                <tr key={i}>
                  <td className={styles.providerNameCell}>
                    <div className={styles.providerName}>{c.name}</div>
                    <span className={styles.providerType}>{c.type}</span>
                  </td>
                  <td className={styles.directPriceCell}>{c.directPrice}</td>
                  <td className={styles.cheapPriceCell}>
                    {c.cheapPrice}
                  </td>
                  <td>
                    <span className={styles.savingsBadge}>{c.savings}</span>
                  </td>
                  <td>
                    {c.includesApi ? (
                      <span className={styles.iconCheck}><Check size={16} /> Included</span>
                    ) : (
                      <span className={styles.iconX}><X size={16} /> Separate Charge</span>
                    )}
                  </td>
                  <td>
                    <span className={styles.iconCheck}><Check size={16} /> Unlimited</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.footerRow}>
          <div className={styles.footerNote}>
            <ShieldCheck size={18} color="#10b981" />
            <span>All models routed through official enterprise endpoints with 99.99% uptime SLA.</span>
          </div>
          <Link href="/pricing" className={styles.ctaBtn}>
            View All Model Rates <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
