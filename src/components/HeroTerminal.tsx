'use client';

import React from 'react';
import { Paperclip, ArrowUp } from 'lucide-react';
import styles from './HeroTerminal.module.css';

export default function HeroTerminal() {
  return (
    <div className={styles.dualSlidesContainer}>

      {/* ═══════════════ LEFT SLIDE: CODING & CLI ═══════════════ */}
      <div className={`${styles.slideWrapper} ${styles.slideLeft}`}>
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
                  <div><span className={styles.keyword}>import</span> {'{'} OpenAI {'}'} <span className={styles.keyword}>from</span> <span className={styles.string}>'openai'</span>;</div>
                  <br />
                  <div><span className={styles.keyword}>const</span> openai = <span className={styles.keyword}>new</span> <span className={styles.function}>OpenAI</span>({'{'}</div>
                  <div style={{ paddingLeft: '16px' }}>baseURL: <span className={styles.string}>'https://api.cheapagents.ai/v1'</span>,</div>
                  <div style={{ paddingLeft: '16px' }}>apiKey: process.env.CHEAPAGENTS_API_KEY,</div>
                  <div>{'}'});</div>
                  <br />
                  <div className={styles.typingApiCmd}>
                    <div><span className={styles.keyword}>const</span> res = <span className={styles.keyword}>await</span> openai.chat.completions.<span className={styles.function}>create</span>({'{'}</div>
                    <div style={{ paddingLeft: '16px' }}>model: <span className={styles.string}>'claude-3-5-sonnet'</span>,</div>
                    <div style={{ paddingLeft: '16px' }}>messages: [&#123; role: <span className={styles.string}>'user'</span>, content: <span className={styles.string}>'Hello!'</span> &#125;]</div>
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

      {/* ═══════════════ RIGHT SLIDE: CHAT PLAYGROUND ═══════════════ */}
      <div className={`${styles.slideWrapper} ${styles.slideRight}`}>
        <div className={styles.card3D}>
          <div className={styles.cardHeader}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDots}><span/><span/><span/></div>
              <div className={styles.browserUrl}>chat.cheapagents.io</div>
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
