'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Check, ArrowRight, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import styles from './PlanComparison.module.css';

interface PlanRow {
  feature: string;
  freePlan: string;
  paidPlan: string;
  highlightPaid?: boolean;
}

const COMPARISON_ROWS: PlanRow[] = [
  {
    feature: 'Execution Speed & Latency',
    freePlan: 'Standard (~220ms TTFT)',
    paidPlan: 'Ultra-Fast Edge (<75ms TTFT)',
    highlightPaid: true,
  },
  {
    feature: 'Queue Priority & Routing',
    freePlan: 'Standard Queue',
    paidPlan: 'Priority Gateway (0 Waiting)',
    highlightPaid: true,
  },
  {
    feature: 'Model Catalog Included',
    freePlan: 'Essential Models (GPT-4o mini, Llama 3.3)',
    paidPlan: 'All 15+ Top Models (DeepSeek R1, Claude 3.5, GPT-4o)',
  },
  {
    feature: 'Token Limits & Concurrency',
    freePlan: 'Standard Rate Limits',
    paidPlan: 'Max Throughput & High Concurrency',
  },
  {
    feature: 'Terminal CLI Coding (`cheap-cli`)',
    freePlan: 'Free Unlimited',
    paidPlan: 'Free Unlimited + Priority Execution',
  },
  {
    feature: 'Bring Your Own Key (BYOK)',
    freePlan: 'Supported',
    paidPlan: 'Supported (0% Platform Margin)',
  },
  {
    feature: 'Uptime & Support SLA',
    freePlan: 'Community Support',
    paidPlan: '99.99% Uptime SLA & Priority Support',
    highlightPaid: true,
  },
];

export default function PlanComparison() {
  return (
    <section className={styles.planSection} id="plan-comparison">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>
            <Zap size={14} /> Performance Tier Matrix
          </div>
          <h2 className={styles.title}>
            Side-by-Side Comparison: <span className={styles.gradientText}>Free Plan vs. Paid Plan</span>
          </h2>
          <p className={styles.subtitle}>
            Compare features, latency, and limits directly to see which tier fits your project best.
          </p>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.featureHeader}>Feature / Capability</th>
                  <th className={styles.freeHeader}>
                    <div className={styles.planColTitle}>Free Plan</div>
                    <span className={styles.planColSub}>$0 / Forever</span>
                  </th>
                  <th className={styles.paidHeader}>
                    <div className={styles.featuredBadge}>
                      <Sparkles size={12} /> Recommended for Production
                    </div>
                    <div className={styles.planColTitlePaid}>Paid Plan</div>
                    <span className={styles.planColSubPaid}>From $5 / mo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td className={styles.featureName}>{row.feature}</td>
                    <td className={styles.freeCell}>
                      <span className={styles.cellText}>{row.freePlan}</span>
                    </td>
                    <td className={`${styles.paidCell} ${row.highlightPaid ? styles.cellHighlight : ''}`}>
                      <span className={styles.cellTextPaid}>{row.paidPlan}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.tableFooter}>
            <div className={styles.footerColFree}>
              <Link href="/signup" className={styles.btnFree}>
                Start with Free Plan <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.footerColPaid}>
              <Link href="/pricing" className={styles.btnPaid}>
                Upgrade to Paid Plan <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
