'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Code2, MessageSquare, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';
import styles from './HeroTerminal.module.css';

export default function HeroTerminal() {
  const [viewIndex, setViewIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [activeTab, setActiveTab] = useState('Windows');
  const [copied, setCopied] = useState(false);

  const commands: Record<string, string> = {
    Windows: 'iwr -useb https://cheapmodels.ai/install.ps1 | iex',
    Mac: 'curl -fsSL https://cheapmodels.ai/install.sh | bash',
    Linux: 'curl -fsSL https://cheapmodels.ai/install.sh | bash',
    npm: 'npm install -g cheap-cli'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(commands[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-scroll simulation
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setViewIndex((prev) => (prev + 1) % 3);
    }, 4000); // Switch view every 4 seconds
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleManualScroll = (direction: 'up' | 'down') => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);

    setViewIndex((prev) => {
      if (direction === 'up') return prev === 0 ? 2 : prev - 1;
      return (prev + 1) % 3;
    });

    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000); // Pause for 4 seconds before resuming auto-scroll
  };

  const getCardStyle = (cardIndex: number, currentIndex: number) => {
    const offset = (cardIndex - currentIndex + 3) % 3;

    let translateZ = 0;
    let translateY = 0;
    let translateX = 0;
    let opacity = 1;
    let rotateY = -15; // Tilted angle
    let rotateX = 5;

    if (offset === 0) {
      // Active (Front)
      translateZ = 0;
      translateY = 0;
      translateX = 0;
      opacity = 1;
    } else if (offset === 1) {
      // Second (Behind)
      translateZ = -80;
      translateY = 25;
      translateX = 35;
      opacity = 0.7;
    } else if (offset === 2) {
      // Third (Deepest)
      translateZ = -160;
      translateY = 50;
      translateX = 70;
      opacity = 0.4;
    }

    return {
      transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px)`,
      opacity,
      zIndex: 10 - offset
    };
  };

  return (
    <div className={styles.terminalWrapper}>
      <div className={styles.cardsContainer}>

        {/* Card 0: Cheap CLI */}
        <div className={styles.card3D} style={getCardStyle(0, viewIndex)}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIcon}><Terminal size={18} /></div>
            <div className={styles.headerText}>
              <div className={styles.headerTitle}>cheap-cli</div>
              <div className={styles.headerSubtitle}>Configure and manage API routing</div>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cliText}>
              <span>~</span> $ cheap-cli init
              <br /><br />
              <span style={{ color: '#27c93f' }}>✔</span> Project initialized successfully.<br />
              <span style={{ color: '#27c93f' }}>✔</span> API key configured.<br />
              <br />
              <span>~</span> $ cheap-cli route --model=gpt-4o
              <br /><br />
              Routing requests through CheapModels...<br />
              Cost saved: <strong style={{ color: '#fff' }}>40%</strong>
            </div>
          </div>
        </div>

        {/* Card 1: Code Editor */}
        <div className={styles.card3D} style={getCardStyle(1, viewIndex)}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIcon}><Code2 size={18} /></div>
            <div className={styles.headerText}>
              <div className={styles.headerTitle}>API Integration</div>
              <div className={styles.headerSubtitle}>Drop-in replacement for OpenAI</div>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div><span className={styles.comment}>// src/app/api/chat/route.ts</span></div>
            <div><span className={styles.keyword}>import</span> {'{'} OpenAI {'}'} <span className={styles.keyword}>from</span> <span className={styles.string}>'openai'</span>;</div>
            <br />
            <div><span className={styles.keyword}>const</span> openai = <span className={styles.keyword}>new</span> <span className={styles.function}>OpenAI</span>({'{'}</div>
            <div style={{ paddingLeft: '20px' }}>baseURL: <span className={styles.string}>'https://api.cheapmodels.ai/v1'</span>,</div>
            <div style={{ paddingLeft: '20px' }}>apiKey: process.env.CHEAPMODELS_API_KEY,</div>
            <div>{'}'});</div>
            <br />
            <div><span className={styles.comment}>// Done! Same code, cheaper models.</span></div>
          </div>
        </div>

        {/* Card 2: Chat UI */}
        <div className={styles.card3D} style={getCardStyle(2, viewIndex)}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIcon}><MessageSquare size={18} /></div>
            <div className={styles.headerText}>
              <div className={styles.headerTitle}>Chat Playground</div>
              <div className={styles.headerSubtitle}>Test models in real-time</div>
            </div>
          </div>
          <div className={styles.cardBody} style={{ background: '#111' }}>
            <div className={styles.chatMessage}>
              <div className={styles.chatAvatar}>U</div>
              <div className={styles.chatBubble}>How do I integrate CheapModels?</div>
            </div>
            <div className={styles.chatMessage}>
              <div className={`${styles.chatAvatar} ${styles.bot}`}><Terminal size={14} /></div>
              <div className={styles.chatBubble}>
                It's very easy! Just change your OpenAI base URL to <code style={{ color: 'var(--color-primary)' }}>https://api.cheapmodels.ai</code> and use your new API key.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Manual Scroll Controls */}
      <div className={styles.scrollControls}>
        <button
          className={styles.scrollBtn}
          onClick={() => handleManualScroll('up')}
        >
          <ChevronUp size={24} />
        </button>
        <button
          className={styles.scrollBtn}
          onClick={() => handleManualScroll('down')}
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Installation Box */}
      <div className={styles.installBoxWrapper}>
        <div className={styles.installBox}>
          <div className={styles.installTabs}>
            {['Windows', 'Mac', 'Linux', 'npm'].map(tab => (
              <button
                key={tab}
                className={`${styles.installTab} ${activeTab === tab ? styles.installTabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className={styles.commandBox}>
            <span>$ {commands[activeTab]}</span>
            <button className={styles.copyBtn} onClick={handleCopy} title="Copy to clipboard">
              {copied ? <Check size={16} color="#27c93f" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
