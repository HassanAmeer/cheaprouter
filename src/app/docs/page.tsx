"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import DocsSidebar, { ViewType } from './components/DocsSidebar';
import IntroductionView from './views/IntroductionView';
import ModelsView from './views/ModelsView';
import ChatCompletionsView from './views/ChatCompletionsView';
import LimitsView from './views/LimitsView';

export default function DocsPage() {
  const [baseUrl, setBaseUrl] = useState('https://api.cheapagents.com');
  const [activeView, setActiveView] = useState<ViewType>('models');

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
        return <ModelsView key="models-default" baseUrl={baseUrl} />;
    }
  };

  return (
    <main style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#f5f5f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Navbar */}
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '16px 32px', 
        borderBottom: '1px solid #1f1f1f',
        backgroundColor: '#0a0a0a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '18px' }}>
            <Zap size={24} color="#ccff00" /> {/* Neon yellow icon */}
            CheapAgents VPS
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '32px' }}>
            <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Home</Link>
            <Link href="/docs" style={{ color: '#ccff00', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Developer APIs</Link>
            <Link href="/dashboard" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Consoles</Link>
            <Link href="/status" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>System Status</Link>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Login</Link>
          <Link href="/signup" style={{ backgroundColor: '#ccff00', color: '#000', padding: '8px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </nav>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>
        
        {/* Sidebar Navigation */}
        <DocsSidebar activeView={activeView} setActiveView={setActiveView} />

        {/* Main Content Area */}
        <div style={{ 
          flex: 1, 
          padding: '48px', 
          position: 'relative',
          overflowY: 'auto'
        }}>
          <AnimatePresence mode="wait">
            {renderView()}
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}
