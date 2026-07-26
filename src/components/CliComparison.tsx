'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, Check, X, ArrowRight, Shield, Cpu, Zap, Code } from 'lucide-react';
import styles from './CliComparison.module.css';

interface FeatureRow {
  feature: string;
  cheapCli: boolean | string;
  claudeCode: boolean | string;
  codexCli: boolean | string;
  cursorTerminal: boolean | string;
}

const MATRIX: FeatureRow[] = [
  {
    feature: 'Multi-Model Switch (DeepSeek + Claude + GPT)',
    cheapCli: true,
    claudeCode: 'Claude Only',
    codexCli: 'OpenAI Only',
    cursorTerminal: 'Limited',
  },
  {
    feature: 'Free Unlimited Terminal Coding',
    cheapCli: true,
    claudeCode: false,
    codexCli: false,
    cursorTerminal: false,
  },
  {
    feature: 'BYOK (Bring Your Own Keys)',
    cheapCli: true,
    claudeCode: false,
    codexCli: false,
    cursorTerminal: false,
  },
  {
    feature: 'Multi-File Agentic Refactoring',
    cheapCli: true,
    claudeCode: true,
    codexCli: 'Single File',
    cursorTerminal: true,
  },
  {
    feature: 'Local Shell Execution & Diagnostics',
    cheapCli: true,
    claudeCode: true,
    codexCli: false,
    cursorTerminal: false,
  },
];

export default function CliComparison() {
  return (
    <section className={styles.cliSection} id="cli-benchmark">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>
            <Terminal size={14} /> CLI Power Benchmark
          </div>
          <h2 className={styles.title}>
            Why Developers Choose <span className={styles.gradientText}>cheap-cli</span>
          </h2>
          <p className={styles.subtitle}>
            Compare `cheap-cli` against Claude Code, OpenAI Codex, and Cursor Terminal. One CLI to route every AI model without single-provider lock-in.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Capability</th>
                  <th className={styles.cheapHeader}>
                    <div className={styles.cheapTitle}>
                      <Terminal size={16} /> cheap-cli
                    </div>
                  </th>
                  <th>Claude Code</th>
                  <th>Codex CLI</th>
                  <th>Cursor Terminal</th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row, i) => (
                  <tr key={i}>
                    <td className={styles.featureCell}>{row.feature}</td>
                    <td className={styles.cheapCell}>
                      {typeof row.cheapCli === 'boolean' ? (
                        <span className={styles.checkIcon}><Check size={18} /> Yes</span>
                      ) : (
                        <span className={styles.textVal}>{row.cheapCli}</span>
                      )}
                    </td>
                    <td>
                      {typeof row.claudeCode === 'boolean' ? (
                        row.claudeCode ? <Check size={16} color="#10b981" /> : <X size={16} color="#ef4444" />
                      ) : (
                        <span className={styles.textValDim}>{row.claudeCode}</span>
                      )}
                    </td>
                    <td>
                      {typeof row.codexCli === 'boolean' ? (
                        row.codexCli ? <Check size={16} color="#10b981" /> : <X size={16} color="#ef4444" />
                      ) : (
                        <span className={styles.textValDim}>{row.codexCli}</span>
                      )}
                    </td>
                    <td>
                      {typeof row.cursorTerminal === 'boolean' ? (
                        row.cursorTerminal ? <Check size={16} color="#10b981" /> : <X size={16} color="#ef4444" />
                      ) : (
                        <span className={styles.textValDim}>{row.cursorTerminal}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.installFooter}>
            <div className={styles.commandBox}>
              <span className={styles.prompt}>$</span>
              <code>npm install -g cheap-cli</code>
            </div>
            <Link href="/cli" className={styles.cliBtn}>
              Explore cheap-cli Docs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
