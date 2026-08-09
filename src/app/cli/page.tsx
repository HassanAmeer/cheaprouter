'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Terminal, Zap, Boxes, Shield, Rocket, ArrowRight, MessageSquare, Code, Image as ImageIcon, LayoutGrid, Moon, Settings, ChevronDown, Plus, Wand2, Settings2, FileCode2, Code2, Network, Command, Package, X, Minus } from 'lucide-react';
import { SiteNav } from '@/components/site-nav';
import { Button, Badge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import AnnouncementBar from '@/components/AnnouncementBar';
import StackSection from '@/components/StackSection';
import PricingSection from '@/components/PricingSection';
import CompareSection from '@/components/CompareSection';
import DifferenceSection from '@/components/DifferenceSection';
import BottomCtaCard from '@/components/BottomCtaCard';
import CliGridFeatures from '@/components/CliGridFeatures';
import StatsSection from '@/components/StatsSection';
import { SiteFooter } from '@/components/site-footer';
import { useSiteSettings } from '@/components/settings-provider';
import styles from './cli.module.css';

const COMMANDS: Record<string, { label: string, cmd: string, icon: React.ReactNode }> = {
  Mac: { label: 'macOS', cmd: 'curl -fsSL https://cheapagents.ai/install.sh | bash', icon: <Command size={16} /> },
  Windows: { label: 'Windows', cmd: 'iwr -useb https://cheapagents.ai/install.ps1 | iex', icon: <LayoutGrid size={16} /> },
  Linux: { label: 'Linux', cmd: 'curl -fsSL https://cheapagents.ai/install.sh | bash', icon: <Terminal size={16} /> },
  npm: { label: 'npm', cmd: 'npm install -g cheap-cli', icon: <Package size={16} /> },
};

export default function CliPage() {
  const { settings } = useSiteSettings();
  const { toast } = useToast();
  const [tab, setTab] = useState('npm');
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
    toast('Copied to clipboard');
  };

  return (
    <main className={styles.page}>
      <AnnouncementBar />
      <SiteNav
        links={[
          { href: '/', label: 'Home' },
          { href: '/#models', label: 'Models' },
          { href: '/#pricing', label: 'Pricing' },
          { href: '/docs', label: 'API Docs' },
          { href: '/cli', label: 'Coding' },
        ]}
      />

      {/* Hero */}
      <section className="container">
        <div className={styles.hero}>
          <h1 className={styles.title}>Your AI Coding Assistant, <span className={styles.highlight}>right in the terminal.</span></h1>

          {/* Enhanced Install box */}
          <div className={styles.install}>
            <div className={styles.installHeader}>
              <div className={styles.macButtons}>
                <div className={`${styles.macBtn} ${styles.macRed}`}></div>
                <div className={`${styles.macBtn} ${styles.macYellow}`}></div>
                <div className={`${styles.macBtn} ${styles.macGreen}`}></div>
              </div>
              <div className={styles.installTabs}>
                {Object.keys(COMMANDS).map((t) => (
                <button key={t} className={`${styles.installTab} ${tab === t ? styles.installTabActive : ''}`} onClick={() => setTab(t)}>
                  <div className={styles.starsBg}>
                    <div className={`${styles.star} ${styles.star1}`}></div>
                    <div className={`${styles.star} ${styles.star2}`}></div>
                    <div className={`${styles.star} ${styles.star3}`}></div>
                    <div className={`${styles.star} ${styles.star4}`}></div>
                    <div className={`${styles.star} ${styles.star5}`}></div>
                    <div className={`${styles.shootingStar} ${styles.shootingStar1}`}></div>
                    <div className={`${styles.shootingStar} ${styles.shootingStar2}`}></div>
                  </div>
                  <span className={styles.tabContent}>
                    <span className={styles.tabIcon}>{COMMANDS[t].icon}</span>
                    {COMMANDS[t].label}
                  </span>
                </button>
              ))}
              </div>
            </div>
            <div className={styles.installCmd}>
              <Terminal size={18} color="var(--color-primary)" />
              <code>{COMMANDS[tab].cmd}</code>
              <button className={styles.copyBtn} onClick={() => copy(COMMANDS[tab].cmd, 'install')}>
                {copied === 'install' ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* CLI Terminal Mockup */}
          <div className={styles.mockupContainer}>
            <div className={styles.mockupWindow}>
              {/* Window Header */}
              <div className={styles.mockupHeader}>
                <div className={styles.macButtons}>
                  <div className={`${styles.macBtn} ${styles.macRed}`}></div>
                  <div className={`${styles.macBtn} ${styles.macYellow}`}></div>
                  <div className={`${styles.macBtn} ${styles.macGreen}`}></div>
                </div>
                <div className={styles.mockupTitle}>cheap-cli — 80x24</div>
              </div>

              {/* Window Body */}
              <div className={styles.mockupBody}>
                <div className={styles.mockupLine}>
                  <span className={styles.mockupPrompt}>~/project $</span>
                  <span className={styles.mockupCommand}>cheap-cli init --framework=nextjs</span>
                </div>
                
                <div className={styles.mockupOutput}>
                  <span className={styles.mockupQuestion}>?</span> Project Name: <span className={styles.mockupAnswer}>cheap-editor-demo</span><br />
                  <span className={styles.mockupQuestion}>?</span> AI Model: <span className={styles.mockupAnswer}>claude-3-5-sonnet</span><br />
                  <span className={styles.mockupQuestion}>?</span> Default style: <span className={styles.mockupAnswer}>Tailwind CSS</span><br />
                  <span className={styles.mockupQuestion}>?</span> Add authentication? <span className={styles.mockupAnswer}>Yes</span> <span className={styles.mockupOption}>(NextAuth)</span>
                </div>

                <div className={styles.mockupLine}>
                  <span className={styles.mockupPrompt}>&gt;</span>
                  <span className={styles.mockupInfo}>Scaffolding Next.js project with AI capabilities...</span>
                </div>
                
                <div className={styles.mockupSuccess}>
                  ✔ Project setup complete! Run `cd cheap-editor-demo`
                </div>
                
                <div className={styles.mockupLine} style={{ marginTop: 20 }}>
                  <span className={styles.mockupPrompt}>~/project/cheap-editor-demo $</span>
                  <span className={styles.mockupCommand}>cheap-cli generate component</span>
                </div>

                <div className={styles.mockupOutput}>
                  <span className={styles.mockupQuestion}>?</span> Component prompt: <span className={styles.mockupAnswer}>"A modern dark mode pricing table with glassmorphism"</span><br />
                </div>
                
                <div className={styles.mockupLine}>
                  <span className={styles.mockupPrompt}>&gt;</span>
                  <span className={styles.mockupInfo}>Generating component via Claude 3.5 Sonnet...</span>
                </div>

                <div className={styles.mockupSuccess}>
                  ✔ Generated successfully: src/components/PricingTable.tsx
                </div>

                <div className={styles.mockupLine} style={{ marginTop: 20 }}>
                  <span className={styles.mockupPrompt}>~/project/cheap-editor-demo $</span>
                  <span className={styles.mockupCommand}></span><span className={styles.blinkingCursor}></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Features */}
      <section className={`container ${styles.featuresSection}`}>
        <div className={styles.featuresHeader}>
          <p className={styles.featuresDesc}>Explore all 8 powerful features built natively into the Cheap CLI Editor.</p>
        </div>
        <div className={styles.grid}>
          {[
            { icon: <Wand2 size={28} />, title: 'AI Scaffolding', desc: 'Initialize Next.js, Node, or Python environments fully configured with AI capabilities.' },
            { icon: <Boxes size={28} />, title: 'Component Generator', desc: 'Generate complete React, Vue, or Svelte components directly from the command line.' },
            { icon: <Network size={28} />, title: 'Drop-in Routing', desc: 'Rewrite any OpenAI base URL to CheapAgents with a single command. Zero code changes.' },
            { icon: <Settings2 size={28} />, title: 'Model Comparison', desc: 'Benchmark GPT-4o vs Claude 3.5 Sonnet side-by-side directly from your terminal.' },
            { icon: <Shield size={28} />, title: 'BYOK Secure Proxy', desc: 'Run a local proxy that injects your keys safely — never expose them in client code.' },
            { icon: <FileCode2 size={28} />, title: 'Code Refactoring', desc: 'Analyze and refactor large codebases seamlessly without leaving your terminal window.' },
            { icon: <Code2 size={28} />, title: 'Syntax Highlighting', desc: 'Vibrant, built-in syntax highlighting for clear readability right in your prompt.' },
            { icon: <Zap size={28} />, title: 'Zero-latency Streams', desc: 'True SSE piping for a native, blazing fast typing experience in your own apps.' },
          ].map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection forceTabId="tab_cli" title="" subtitle="Simple Pricing" />

      {/* Grid Features */}
      <CliGridFeatures />



      {/* CLI Tool Comparison Section */}
      <section className={`container ${styles.featuresSection}`}>

        <h2 className={styles.sectionTitleAlt}>Performance</h2>
        <p className={styles.sectionSubtitleAlt}>
          How each CLI tool stacks up for modern AI engineering.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '5rem', width: '100%', maxWidth: '85%', margin: '0 auto 5rem' }}>
          {[
            { name: 'CheapAgents CLI', score: 12, total: 13 },
            { name: 'OpenCode', score: 8, total: 13 },
            { name: 'Aider', score: 8, total: 13 },
            { name: 'Kilo Code', score: 7, total: 13 },
            { name: 'Pi', score: 7, total: 13 },
            { name: 'Cursor CLI', score: 6, total: 13 },
            { name: 'Claude Code', score: 3, total: 13 },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-card-bg)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '160px', fontWeight: '600', color: idx === 0 ? 'var(--color-primary)' : 'var(--color-text-main)' }}>{item.name}</div>
              <div style={{ flex: 1, height: '12px', background: 'var(--color-bg-muted)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(item.score / item.total) * 100}%`, background: idx === 0 ? 'var(--color-primary)' : 'var(--color-text-muted)', borderRadius: '99px' }} />
              </div>
              <div style={{ width: '50px', textAlign: 'right', fontWeight: '700', color: idx === 0 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>{item.score}/{item.total}</div>
            </div>
          ))}
        </div>

        <h2 className={styles.sectionTitleAlt}>Feature comparison</h2>
        <p className={styles.sectionSubtitleAlt}>
          Every feature that matters for a terminal AI coding agent.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Feature</th>
                <th className={styles.highlightCol}>CheapAgents CLI</th>
                <th>Claude Code</th>
                <th>OpenCode</th>
                <th>Aider</th>
                <th>Cursor CLI</th>
                <th>Kilo Code</th>
                <th>Pi</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.categoryRow}>
                <td colSpan={7}>Access & Pricing</td>
              </tr>
              <tr>
                <td>Entry price</td>
                <td className={styles.highlightCol}>$2/mo</td>
                <td>$20–200/mo</td>
                <td>$0 (BYO)</td>
                <td>$0 (BYO)</td>
                <td>$20–200/mo</td>
                <td>$0 (BYO)</td>
                <td>$0 (BYO)</td>
              </tr>
              <tr>
                <td>Single API key</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
              </tr>
              <tr>
                <td>100+ models</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
              </tr>
              <tr>
                <td>Zero vendor lock-in</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
              </tr>

              <tr className={styles.categoryRow}>
                <td colSpan={7}>Tooling</td>
              </tr>
              <tr>
                <td>Terminal CLI</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
              </tr>
              <tr>
                <td>Web UI Chat</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
              </tr>
              <tr>
                <td>Model fallbacks</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
              </tr>
              <tr>
                <td>Local model (Ollama)</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
              </tr>
              <tr>
                <td>Model comparison</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
              </tr>
              <tr>
                <td>BYOK secure proxy</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
              </tr>
              <tr>
                <td>Zero data retention</td>
                <td className={styles.highlightCol}><Check size={18} className={styles.iconCheck}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
                <td><Minus size={18} className={styles.iconDash}/></td>
              </tr>
              <tr>
                <td>Open source</td>
                <td className={styles.highlightCol}><X size={18} className={styles.iconCross}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><X size={18} className={styles.iconCross}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
                <td><Check size={18} className={styles.iconCheck}/></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>


      {/* Stack Section */}
      <StackSection title="Works with your favorite stack." subtitle="Framework Support" />

      <DifferenceSection />
      
      <BottomCtaCard />

      <SiteFooter />
    </main>
  );
}
