"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import styles from '../page.module.css';

import DocsSidebar, { ViewType } from './components/DocsSidebar';
import IntroductionView from './views/IntroductionView';
import ModelsView from './views/ModelsView';
import ChatCompletionsView from './views/ChatCompletionsView';
import LimitsView from './views/LimitsView';

export default function DocsPage() {
  const [baseUrl, setBaseUrl] = useState('https://api.cheapagents.com');
  const [activeView, setActiveView] = useState<ViewType>('introduction');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'introduction':
        return <IntroductionView key="intro" />;
      case 'models':
        return <ModelsView key="models" baseUrl={baseUrl} />;
      case 'chat-completions':
        return <ChatCompletionsView key="chat" baseUrl={baseUrl} />;
      case 'limits':
        return <LimitsView key="limits" />;
      default:
        return <IntroductionView key="intro-default" />;
    }
  };

  return (
    <main style={{ backgroundColor: 'var(--color-bg-soft)', minHeight: '100vh', color: 'var(--color-text-main)' }}>
      {/* Navbar */}
      <div className="container">
        <nav className={styles.navbar} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', paddingTop: '16px', marginBottom: '40px' }}>
          <Link href="/" className={styles.logo} style={{ color: 'inherit', textDecoration: 'none' }}>
            <span className={styles.logoIcon}><Zap size={28} fill="currentColor" /></span>
            CheapAgents
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none' }}>Back to Home</Link>
            <Link href="/dashboard" style={{ fontSize: '14px', fontWeight: 500, backgroundColor: 'var(--color-primary)', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none' }}>Dashboard</Link>
          </div>
        </nav>
      </div>

      <div className="container" style={{ display: 'flex', gap: '48px', paddingBottom: '100px' }}>
        
        {/* Sidebar Navigation */}
        <DocsSidebar activeView={activeView} setActiveView={setActiveView} />

        {/* Main Content Area */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'var(--color-card-bg)', 
          padding: '48px', 
          borderRadius: 'var(--radius-xl)', 
          boxShadow: 'var(--shadow-md)', 
          border: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glassmorphism gradient blob for premium feel */}
          <div style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <AnimatePresence mode="wait">
              {renderView()}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </main>
  );
}
