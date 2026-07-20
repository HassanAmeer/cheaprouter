'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Code2, MessageSquare, ChevronUp, ChevronDown, Copy, Check, Paperclip, ArrowUp } from 'lucide-react';
import styles from './HeroTerminal.module.css';

export default function HeroTerminal() {
  const [viewIndex, setViewIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [activeTab, setActiveTab] = useState('Windows');
  const [copied, setCopied] = useState(false);

  const commands: Record<string, string> = {
    Windows: 'iwr -useb https://cheapagents.ai/install.ps1 | iex',
    Mac: 'curl -fsSL https://cheapagents.ai/install.sh | bash',
    Linux: 'curl -fsSL https://cheapagents.ai/install.sh | bash',
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
      translateZ = -40;
      translateY = 15;
      translateX = 20;
      opacity = 0.85;
    } else if (offset === 2) {
      // Third (Deepest)
      translateZ = -80;
      translateY = 30;
      translateX = 40;
      opacity = 0.5;
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
          <div className={styles.cardHeader} style={{ padding: '0', background: 'transparent' }}>
            <div className={styles.browserHeader} style={{ background: '#222', borderBottom: '1px solid #333', borderRadius: '12px 12px 0 0' }}>
              <div className={styles.browserDots}><span/><span/><span/></div>
              <div className={styles.browserUrl} style={{ background: 'transparent', color: '#888', border: 'none', fontSize: '12px' }}>bash - cheap-cli</div>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cliEditor}>
              <div className={styles.cliLine}>
                <span className={styles.prompt}>~/project$</span> <span style={{ color: '#fff' }}>cheap-cli init --framework=nextjs</span>
              </div>
              <div className={styles.cliOutput} style={{ animation: 'none', opacity: 1, marginBottom: '12px' }}>
                <div className={styles.cliSuccess}>✔ Initialized cheapagents.json</div>
              </div>
              <div className={styles.cliLine}>
                <span className={styles.prompt}>~/project$</span> <span className={styles.typingCmd}>cheap-cli route update --model=claude-3-5</span>
              </div>
              <div className={styles.cliOutput}>
                <div className={styles.cliSuccess}>✔ Found existing routing file: src/api/openai.ts</div>
                <div className={styles.cliSuccess}>✔ Updating configuration...</div>
                <div className={styles.cliDiffBlock}>
                  <div style={{ color: '#888', borderBottom: '1px solid #444', paddingBottom: '4px', marginBottom: '4px' }}>src/api/openai.ts</div>
                  <div className={styles.diffMinus}><span>-</span> <span>&nbsp;&nbsp;baseURL: 'https://api.openai.com/v1',</span></div>
                  <div className={styles.diffMinus}><span>-</span> <span>&nbsp;&nbsp;model: 'gpt-4o',</span></div>
                  <div className={styles.diffPlus}><span>+</span> <span>&nbsp;&nbsp;baseURL: 'https://api.cheapagents.ai/v1',</span></div>
                  <div className={styles.diffPlus}><span>+</span> <span>&nbsp;&nbsp;model: 'claude-3-5-sonnet',</span></div>
                </div>
                <div className={styles.cliSuccess}>✔ Routing updated seamlessly! 🚀</div>
                <div className={styles.cliLine} style={{ marginTop: '16px' }}>
                  <span className={styles.prompt}>~/project$</span> <span className={styles.cursorBlink}>|</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 1: API Integration */}
        <div className={styles.card3D} style={getCardStyle(1, viewIndex)}>
          <div className={styles.cardHeader} style={{ padding: '0', background: 'transparent' }}>
            <div className={styles.browserHeader} style={{ background: '#1e1e1e', borderBottom: '1px solid #333', borderRadius: '12px 12px 0 0', padding: '8px 16px' }}>
              <div className={styles.browserDots}><span/><span/><span/></div>
              <div className={styles.vscodeTabs}>
                <div className={styles.vscodeTabActive}>route.ts</div>
                <div className={styles.vscodeTab}>page.tsx</div>
              </div>
            </div>
          </div>
          <div className={styles.cardBody} style={{ background: '#1e1e1e', padding: '0', display: 'flex' }}>
            <div className={styles.vscodeSidebar}>
              <div className={styles.vscodeSidebarTitle}>EXPLORER</div>
              <div className={styles.vscodeFile}>package.json</div>
              <div className={styles.vscodeFileActive}>api-test.ts</div>
              <div className={styles.vscodeFile}>.env.local</div>
              <div className={styles.vscodeFile}>README.md</div>
            </div>
            <div className={styles.vscodeMain}>
              <div className={styles.vscodeCode}>
              <div><span className={styles.keyword}>import</span> {'{'} OpenAI {'}'} <span className={styles.keyword}>from</span> <span className={styles.string}>'openai'</span>;</div>
              <br />
              <div><span className={styles.keyword}>const</span> openai = <span className={styles.keyword}>new</span> <span className={styles.function}>OpenAI</span>({'{'}</div>
              <div style={{ paddingLeft: '20px' }}>baseURL: <span className={styles.string}>'https://api.cheapagents.ai/v1'</span>, <span className={styles.comment}>// Drop-in Replacement</span></div>
              <div style={{ paddingLeft: '20px' }}>apiKey: process.env.CHEAPAGENTS_API_KEY,</div>
              <div>{'}'});</div>
              <br />
              <div className={styles.typingApiCmd}>
                <div><span className={styles.keyword}>const</span> response = <span className={styles.keyword}>await</span> openai.chat.completions.<span className={styles.function}>create</span>({'{'}</div>
                <div style={{ paddingLeft: '20px' }}>model: <span className={styles.string}>'claude-3-5-sonnet'</span>,</div>
                <div style={{ paddingLeft: '20px' }}>messages: [&#123; role: <span className={styles.string}>'user'</span>, content: <span className={styles.string}>'Hello!'</span> &#125;]</div>
                <div>{'}'});</div>
                <div>console.<span className={styles.function}>log</span>(response.choices[0].message.content);<span className={styles.cursorBlink}>|</span></div>
              </div>
            </div>
            {/* VS Code Terminal Output */}
            <div className={styles.vscodeTerminalPanel}>
              <div className={styles.vscodeTerminalHeader}>TERMINAL</div>
              <div className={styles.vscodeTerminalOutput}>
                <div style={{color: '#a5d6ff', marginBottom: '4px'}}>$ bun run api-test.ts</div>
                <div className={styles.apiStreaming}>"I am an assistant for you. How can I help you today?"</div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Card 2: Chat Playground */}
        <div className={styles.card3D} style={getCardStyle(2, viewIndex)}>
          <div className={styles.cardHeader} style={{ padding: '0', background: 'transparent' }}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDots}><span/><span/><span/></div>
              <div className={styles.browserUrl}>chat.cheapagents.io</div>
            </div>
          </div>
          <div className={styles.cardBody} style={{ background: '#ffffff', color: '#333', padding: '0' }}>
            <div className={styles.webChatUi}>
              <div className={styles.webChatSidebar}>
                <div className={styles.webChatHistItem} />
                <div className={styles.webChatHistItem} />
                <div className={styles.webChatHistItem} />
              </div>
              <div className={styles.webChatMain}>
                <div className={styles.webChatMsgWrapper}>
                  <div className={styles.webChatMsgUser}>Compare Claude Sonnet and GPT-4o for coding tasks.</div>
                </div>
                <div className={styles.webChatMsgWrapper}>
                  <div className={styles.webChatMsgAi}>
                    <span className={styles.typingChat}>Claude 3.5 Sonnet generally excels at complex logic and large codebase refactoring, while GPT-4o is incredibly fast and highly capable for general zero-shot scripting...<span className={styles.cursorBlink}>|</span></span>
                  </div>
                </div>
                <div className={styles.webChatInputArea}>
                  <div className={styles.webChatInputBox}>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>Is claude better for React?</span>
                  </div>
                  <div className={styles.webChatAttachBtn}>
                    <Paperclip size={14} />
                  </div>
                  <div className={styles.webChatSendBtn}>
                    <ArrowUp size={14} color="#fff" />
                  </div>
                </div>
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

    </div>
  );
}
