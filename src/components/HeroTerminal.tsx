'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, ArrowUp } from 'lucide-react';
import styles from './HeroTerminal.module.css';

export default function HeroTerminal() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mechanical step rotation every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setDirection('next');
      setStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleManualStep = (dir: 'next' | 'prev') => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);

    setDirection(dir);
    setStep((prev) => {
      if (dir === 'prev') return (prev - 1 + 3) % 3;
      return (prev + 1) % 3;
    });

    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 6000);
  };

  // Card Position Choreography (3-Stage 3D Queue Loop):
  // Position Slot 0: LEFT
  // Position Slot 1: MID
  // Position Slot 2: RIGHT
  //
  // Forward Movement ('next'):
  //   Left (0) -> Mid (1)
  //   Mid (1)  -> Right (2)
  //   Right (2) -> Hides to right wall -> Enters from left wall -> Left (0)
  const getCardPosClass = (cardIdx: number) => {
    const currentSlot = (cardIdx + step) % 3;

    if (currentSlot === 0) {
      return direction === 'next' 
        ? `${styles.posLeft} ${styles.animRightToLeft}`
        : styles.posLeft;
    }
    if (currentSlot === 1) {
      return styles.posMid;
    }
    // currentSlot === 2
    return direction === 'prev'
      ? `${styles.posRight} ${styles.animLeftToRight}`
      : styles.posRight;
  };

  return (
    <div className={styles.stepperContainer}>

      {/* ═══════════════ CARD 0: CHEAP CLI ═══════════════ */}
      <div className={`${styles.slideCard} ${getCardPosClass(0)}`}>
        <div className={styles.card3D}>
          <div className={styles.cardHeader}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDots}><span/><span/><span/></div>
              <div className={styles.browserUrl}>bash - cheap-cli</div>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cliEditor}>
              <div className={styles.cliLine}>
                <span className={styles.prompt}>~/project$</span> <span className={styles.cliCmd}>cheap-cli init --framework=nextjs</span>
              </div>
              <div className={styles.cliOutput} style={{ animation: 'none', opacity: 1, marginBottom: '12px' }}>
                <div className={styles.cliSuccess}>✔ Initialized cheaprouter.json</div>
              </div>
              <div className={styles.cliLine}>
                <span className={styles.prompt}>~/project$</span> <span className={styles.typingCmd}>cheap-cli route update --model=claude-3-5</span>
              </div>
              <div className={styles.cliOutput}>
                <div className={styles.cliSuccess}>✔ Found routing: src/api/openai.ts</div>
                <div className={styles.cliSuccess}>✔ Updating configuration...</div>
                <div className={styles.cliDiffBlock}>
                  <div className={styles.diffFilename}>src/api/openai.ts</div>
                  <div className={styles.diffMinus}><span>-</span> <span>&nbsp;&nbsp;baseURL: &apos;https://api.openai.com/v1&apos;,</span></div>
                  <div className={styles.diffPlus}><span>+</span> <span>&nbsp;&nbsp;baseURL: &apos;https://api.cheaprouter.ai/v1&apos;,</span></div>
                </div>
                <div className={styles.cliSuccess}>✔ Routing updated seamlessly! 🚀</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ CARD 1: API INTEGRATION ═══════════════ */}
      <div className={`${styles.slideCard} ${getCardPosClass(1)}`}>
        <div className={styles.card3D}>
          <div className={styles.cardHeader}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDots}><span/><span/><span/></div>
              <div className={styles.vscodeTabs}>
                <div className={styles.vscodeTabActive}>route.ts</div>
                <div className={styles.vscodeTab}>page.tsx</div>
              </div>
            </div>
          </div>
          <div className={styles.cardBody} style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div className={styles.vscodeSidebar}>
                <div className={styles.vscodeSidebarTitle}>EXPLORER</div>
                <div className={styles.vscodeFile}>package.json</div>
                <div className={styles.vscodeFileActive}>api-test.ts</div>
                <div className={styles.vscodeFile}>.env.local</div>
              </div>
              <div className={styles.vscodeMain}>
                <div className={styles.vscodeCode}>
                  <div><span className={styles.keyword}>import</span> {'{'} OpenAI {'}'} <span className={styles.keyword}>from</span> <span className={styles.string}>&apos;openai&apos;</span>;</div>
                  <br />
                  <div><span className={styles.keyword}>const</span> openai = <span className={styles.keyword}>new</span> <span className={styles.function}>OpenAI</span>({'{'}</div>
                  <div style={{ paddingLeft: '16px' }}>baseURL: <span className={styles.string}>&apos;https://api.cheaprouter.ai/v1&apos;</span>,</div>
                  <div style={{ paddingLeft: '16px' }}>apiKey: process.env.CHEAPAGENTS_API_KEY,</div>
                  <div>{'}'});</div>
                  <br />
                  <div className={styles.typingApiCmd}>
                    <div><span className={styles.keyword}>const</span> res = <span className={styles.keyword}>await</span> openai.chat.completions.<span className={styles.function}>create</span>({'{'}</div>
                    <div style={{ paddingLeft: '16px' }}>model: <span className={styles.string}>&apos;claude-3-5-sonnet&apos;</span>,</div>
                    <div style={{ paddingLeft: '16px' }}>messages: [&#123; role: <span className={styles.string}>&apos;user&apos;</span>, content: <span className={styles.string}>&apos;Hello!&apos;</span> &#125;]</div>
                    <div>{'}'});<span className={styles.cursorBlink}>|</span></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Terminal Output */}
            <div className={styles.vscodeTerminalPanel}>
              <div className={styles.vscodeTerminalHeader}>TERMINAL</div>
              <div className={styles.vscodeTerminalOutput}>
                <div className={styles.terminalCmd}>$ cheap-cli route update --model=claude-3-5</div>
                <div className={styles.cliSuccess}>✔ Updated endpoint seamlessly! 🚀</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ CARD 2: CHAT PLAYGROUND ═══════════════ */}
      <div className={`${styles.slideCard} ${getCardPosClass(2)}`}>
        <div className={styles.card3D}>
          <div className={styles.cardHeader}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDots}><span/><span/><span/></div>
              <div className={styles.browserUrl}>chat.cheaprouter.io</div>
            </div>
          </div>
          <div className={styles.cardBody} style={{ padding: 0 }}>
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
                    <span className={styles.typingChat}>Claude 3.5 Sonnet generally excels at complex logic and large codebase refactoring, while GPT-4o is fast and versatile...<span className={styles.cursorBlink}>|</span></span>
                  </div>
                </div>
                <div className={styles.webChatInputArea}>
                  <div className={styles.webChatInputBox}>
                    <span className={styles.inputPlaceholder}>Is claude better for React?</span>
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



    </div>
  );
}
