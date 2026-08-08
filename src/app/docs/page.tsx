"use client";
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import DocsSidebar, { ViewType } from './components/DocsSidebar';
import IntroductionView from './views/IntroductionView';
import ModelsView from './views/ModelsView';
import ChatCompletionsView from './views/ChatCompletionsView';
import LimitsView from './views/LimitsView';

import AnnouncementBar from '@/components/AnnouncementBar';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Top Navigation - Default site theme */}
      <AnnouncementBar />
      <SiteNav links={[
        { href: '/', label: 'Home' },
        { href: '/#models', label: 'Models' },
        { href: '/#pricing', label: 'Pricing' },
        { href: '/docs', label: 'API Docs' },
        { href: '/cli', label: 'Coding' },
        { href: '/compare', label: 'Compare' },
      ]} />

      {/* Docs Layout Container - Full Dark Background as requested */}
      <div style={{ backgroundColor: '#0A0A0A', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <main style={{ 
          display: 'flex', 
          gap: '32px', 
          paddingTop: '32px', 
          paddingBottom: '100px', 
          flex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          paddingLeft: '24px',
          paddingRight: '24px'
        }}>
          
          {/* Sidebar Navigation */}
          <DocsSidebar activeView={activeView} setActiveView={setActiveView} />

          {/* Main Content Area */}
          <div style={{ 
            flex: 1, 
            position: 'relative',
            overflowY: 'auto',
            minWidth: 0 // Prevent flex children from overflowing
          }}>
            <AnimatePresence mode="wait">
              {renderView()}
            </AnimatePresence>
          </div>

        </main>
      </div>

      <div style={{ backgroundColor: '#0A0A0A' }}>
        <SiteFooter />
      </div>
    </div>
  );
}
