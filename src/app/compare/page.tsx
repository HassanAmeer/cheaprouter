'use client';

import React from 'react';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { Check, X, Minus, Terminal, Shield, Unlock, Globe, Zap, Code, ChevronRight, Key, Layers, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function ComparePage() {
  return (
    <main className={styles.page}>
      <SiteNav links={[
        { href: '/', label: 'Home' },
        { href: '/#models', label: 'Models' },
        { href: '/#pricing', label: 'Pricing' },
        { href: '/docs', label: 'API Docs' },
        { href: '/cli', label: 'Coding' },
        { href: '/compare', label: 'Compare' },
      ]} />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>CheapRouter v2.4</div>
          <h1 className={styles.title}>CheapRouter vs the rest</h1>
          <p className={styles.subtitle}>
            An honest comparison. CheapRouter is the only unified API and CLI that gives you access to 100+ premium AI models with a single key, unbeatable prices, and zero lock-in.
          </p>
        </div>

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

        <h2 className={styles.sectionTitle}>Pricing comparison</h2>
        <p className={styles.sectionSubtitle}>What it actually costs to use each platform.</p>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                <th className={styles.highlightCol}>CheapRouter<br/><span style={{fontSize:'0.75rem', fontWeight:'normal', opacity:0.7}}>PRO</span></th>
                <th>OpenRouter<br/><span style={{fontSize:'0.75rem', fontWeight:'normal', opacity:0.7}}>PAYG</span></th>
                <th>LiteLLM<br/><span style={{fontSize:'0.75rem', fontWeight:'normal', opacity:0.7}}>OSS</span></th>
                <th>Helicone<br/><span style={{fontSize:'0.75rem', fontWeight:'normal', opacity:0.7}}>PRO</span></th>
                <th>Direct APIs<br/><span style={{fontSize:'0.75rem', fontWeight:'normal', opacity:0.7}}>VARIOUS</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Entry price</td>
                <td className={styles.highlightCol}>$2/mo</td>
                <td>Pay as you go</td>
                <td>$0 (Self-host)</td>
                <td>$50/mo</td>
                <td>Multiple prepays</td>
              </tr>
              <tr>
                <td>API Keys Required</td>
                <td className={styles.highlightCol}>1 (Ours)</td>
                <td>1 (Theirs)</td>
                <td>Multiple</td>
                <td>Multiple</td>
                <td>Multiple</td>
              </tr>
              <tr>
                <td>Premium models</td>
                <td className={styles.highlightCol}>Included (GPT-4, Claude)</td>
                <td>Included</td>
                <td>BYOK</td>
                <td>BYOK</td>
                <td>BYOK</td>
              </tr>
              <tr>
                <td>Cost Markup</td>
                <td className={styles.highlightCol}>0%</td>
                <td>Varies</td>
                <td>None (Host costs)</td>
                <td>None</td>
                <td>0%</td>
              </tr>
              <tr>
                <td>CLI Tool Included?</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
              </tr>
            </tbody>
          </table>
        </div>


        <h2 className={styles.sectionTitle}>Feature comparison</h2>
        <p className={styles.sectionSubtitle}>Every feature that matters for an AI model router & terminal agent.</p>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Feature</th>
                <th className={styles.highlightCol}>CheapRouter</th>
                <th>OpenRouter</th>
                <th>LiteLLM</th>
                <th>Helicone</th>
                <th>Direct APIs</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.categoryRow}>
                <td colSpan={6}>Core Access</td>
              </tr>
              <tr>
                <td>Unified API</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
              </tr>
              <tr>
                <td>Dashboard & Analytics</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
              </tr>
              
              <tr className={styles.categoryRow}>
                <td colSpan={6}>Tooling</td>
              </tr>
              <tr>
                <td>Native CLI</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
              </tr>
              <tr>
                <td>Web UI Chat</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
              </tr>
              <tr>
                <td>Model Fallbacks</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
              </tr>

              <tr className={styles.categoryRow}>
                <td colSpan={6}>Models & Data</td>
              </tr>
              <tr>
                <td>OpenAI, Anthropic, Google</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
              </tr>
              <tr>
                <td>Local Model Support</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
              </tr>
              <tr>
                <td>Zero Data Retention (Opt-in)</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className={styles.sectionTitle}>At a glance</h2>
        <p className={styles.sectionSubtitle}>How each platform stacks up for modern AI engineering.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '5rem', maxWidth: '800px', margin: '0 auto 5rem' }}>
          {[
            { name: 'CheapRouter', score: 11, total: 13 },
            { name: 'OpenRouter', score: 9, total: 13 },
            { name: 'LiteLLM', score: 8, total: 13 },
            { name: 'KPO Enhanced', score: 7, total: 13 },
            { name: 'Helicone', score: 6, total: 13 },
            { name: 'Direct APIs', score: 4, total: 13 },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-card-bg)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '120px', fontWeight: '600', color: idx === 0 ? 'var(--color-primary)' : 'var(--color-text-main)' }}>{item.name}</div>
              <div style={{ flex: 1, height: '12px', background: 'var(--color-bg-muted)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(item.score / item.total) * 100}%`, background: idx === 0 ? 'var(--color-primary)' : 'var(--color-text-muted)', borderRadius: '99px' }} />
              </div>
              <div style={{ width: '50px', textAlign: 'right', fontWeight: '700', color: idx === 0 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>{item.score}/{item.total}</div>
            </div>
          ))}
        </div>

        <div className={styles.header}>
          <h2 className={styles.title} style={{ fontSize: '2.5rem' }}>The difference</h2>
        </div>

        <div className={styles.differenceGrid}>
          <div className={styles.diffCard}>
            <div className={styles.diffIcon}><Key size={28} /></div>
            <h3 className={styles.diffTitle}>One Key to Rule Them All</h3>
            <p className={styles.diffDesc}>Stop juggling API keys and credit card charges across 5 different providers. Get one CheapRouter key and access every major model instantly.</p>
          </div>
          <div className={styles.diffCard}>
            <div className={styles.diffIcon}><Terminal size={28} /></div>
            <h3 className={styles.diffTitle}>Terminal Native</h3>
            <p className={styles.diffDesc}>Not just an API. CheapRouter comes with a blazing-fast CLI tool so you can chat, code, and route models directly from your terminal.</p>
          </div>
          <div className={styles.diffCard}>
            <div className={styles.diffIcon}><Zap size={28} /></div>
            <h3 className={styles.diffTitle}>Unbeatable Pricing</h3>
            <p className={styles.diffDesc}>Start for just $2/month and get access to premium models. No crazy markups, no hidden fees. Transparent usage analytics included.</p>
          </div>
        </div>

        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Try CheapRouter Today</h2>
          <p className={styles.ctaDesc}>Get your single API key and start coding with 100+ models in seconds.</p>
          <div className={styles.ctaButtons}>
            <Link href="/signup" className={styles.btnPrimary}>
              Get API Key <ArrowRight size={18} />
            </Link>
            <Link href="/docs" className={styles.btnSecondary}>
              Read the Docs
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
