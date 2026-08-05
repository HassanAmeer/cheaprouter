'use client';
import React from 'react';
import Link from 'next/link';
import { MessageSquare, Terminal, Code, Zap, Clock, Workflow, Globe, ArrowUpRight } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function InstallGrid() {
  return (
        <div className={styles.installGrid}>
          {/* Card 1: Try Chat */}
          <div className={styles.installCard}>
            <div className={styles.cardStarsBg}>
              <div className={`${styles.cardStar} ${styles.cardStar1}`} />
              <div className={`${styles.cardStar} ${styles.cardStar2}`} />
              <div className={`${styles.cardStar} ${styles.cardStar3}`} />
              <div className={`${styles.cardStar} ${styles.cardStar4}`} />
              <div className={`${styles.cardStar} ${styles.cardStar5}`} />
              <div className={`${styles.cardStar} ${styles.cardStar6}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar1}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar2}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar3}`} />
            </div>
            <div className={styles.cardTopRow}>
              <div className={styles.liveTextOnly}>
                <span className={styles.liveDot} /> LIVE
              </div>
              <Link href="/chat" className={styles.openOutlineBtn}>
                Open <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className={styles.installCardHeader}>
              <div className={styles.installTitleRow}>
                <div className={styles.installIcon}><MessageSquare size={20} /></div>
                <h3 className={styles.installTitle}>Try Chat</h3>
              </div>
              <p className={styles.installDesc}>Compare GPT-4o, Claude 3.5 & more in a real-time playground.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniChat}>
                <div className={styles.miniChatHeader}>
                  <div className={styles.miniDots}><span/><span/><span/></div>
                  <div className={styles.miniUrl}>cheapagents.io/chat</div>
                </div>
                <div className={styles.miniChatBody}>
                  <div className={styles.chatBubbleUser}>Which model is fastest?</div>
                  <div className={styles.chatBubbleAi}>Comparing 15+ models...</div>
                </div>
                <div className={styles.miniChatInput}>
                  <div className={styles.miniInputField} />
                  <div className={styles.miniSendBtn} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Free Unlimited Coding */}
          <div className={styles.installCard}>
            <div className={styles.cardStarsBg}>
              <div className={`${styles.cardStar} ${styles.cardStar1}`} />
              <div className={`${styles.cardStar} ${styles.cardStar2}`} />
              <div className={`${styles.cardStar} ${styles.cardStar3}`} />
              <div className={`${styles.cardStar} ${styles.cardStar4}`} />
              <div className={`${styles.cardStar} ${styles.cardStar5}`} />
              <div className={`${styles.cardStar} ${styles.cardStar6}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar1}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar2}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar3}`} />
            </div>
            <div className={styles.cardTopRow}>
              <div className={styles.liveTextOnly}>
                <span className={styles.liveDot} /> LIVE
              </div>
              <Link href="/cli" className={styles.openOutlineBtn}>
                Open <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className={styles.installCardHeader}>
              <div className={styles.installTitleRow}>
                <div className={styles.installIcon}><Terminal size={20} /></div>
                <h3 className={styles.installTitle}>Free Unlimited Coding</h3>
              </div>
              <p className={styles.installDesc}>Code with AI in your terminal. No usage limits, no credit card.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniTerminal}>
                <div className={styles.miniTermHeader}>
                  <div className={styles.miniDots}><span className={styles.tRed}/><span className={styles.tYellow}/><span className={styles.tGreen}/></div>
                  <span className={styles.miniTermTitle}>~ terminal</span>
                </div>
                <div className={styles.miniTermBody}>
                  <div className={styles.termRow}><span className={styles.termPrompt}>$</span> cheap-cli install</div>
                  <div className={styles.termRowOk}>✔ Installed successfully</div>
                  <div className={styles.termRow}><span className={styles.termPrompt}>$</span> cheap ask &quot;fix this bug&quot;</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Connect by API */}
          <div className={styles.installCard}>
            <div className={styles.cardStarsBg}>
              <div className={`${styles.cardStar} ${styles.cardStar1}`} />
              <div className={`${styles.cardStar} ${styles.cardStar2}`} />
              <div className={`${styles.cardStar} ${styles.cardStar3}`} />
              <div className={`${styles.cardStar} ${styles.cardStar4}`} />
              <div className={`${styles.cardStar} ${styles.cardStar5}`} />
              <div className={`${styles.cardStar} ${styles.cardStar6}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar1}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar2}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar3}`} />
            </div>
            <div className={styles.cardTopRow}>
              <div className={styles.liveTextOnly}>
                <span className={styles.liveDot} /> LIVE
              </div>
              <Link href="/docs" className={styles.openOutlineBtn}>
                Open <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className={styles.installCardHeader}>
              <div className={styles.installTitleRow}>
                <div className={styles.installIcon}><Code size={20} /></div>
                <h3 className={styles.installTitle}>Connect by API</h3>
              </div>
              <p className={styles.installDesc}>Drop-in OpenAI replacement. Change one line of code.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniCode}>
                <div className={styles.miniCodeHeader}>
                  <span className={styles.miniTab}>app.ts</span>
                  <span className={styles.miniTabDim}>config.json</span>
                </div>
                <div className={styles.miniCodeBody}>
                  <div><span className={styles.kw}>const</span> ai = <span className={styles.kw}>new</span> OpenAI({'{'}</div>
                  <div>&nbsp;&nbsp;baseURL: <span className={styles.str}>&quot;api.cheapagents.io&quot;</span>,</div>
                  <div>&nbsp;&nbsp;apiKey: <span className={styles.str}>&quot;cm_***&quot;</span></div>
                  <div>{'}'});</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Earn All AI */}
          <div className={styles.installCard}>
            <div className={styles.cardStarsBg}>
              <div className={`${styles.cardStar} ${styles.cardStar1}`} />
              <div className={`${styles.cardStar} ${styles.cardStar2}`} />
              <div className={`${styles.cardStar} ${styles.cardStar3}`} />
              <div className={`${styles.cardStar} ${styles.cardStar4}`} />
              <div className={`${styles.cardStar} ${styles.cardStar5}`} />
              <div className={`${styles.cardStar} ${styles.cardStar6}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar1}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar2}`} />
              <div className={`${styles.cardShootingStar} ${styles.cardShootingStar3}`} />
            </div>
            <div className={styles.cardTopRow}>
              <div className={styles.liveTextOnly}>
                <span className={styles.liveDot} /> LIVE
              </div>
              <Link href="/dashboard" className={styles.openOutlineBtn}>
                Open <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className={styles.installCardHeader}>
              <div className={styles.installTitleRow}>
                <div className={styles.installIcon}><Zap size={20} /></div>
                <h3 className={styles.installTitle}>Earn All AI</h3>
              </div>
              <p className={styles.installDesc}>BYOK — bring your own keys, earn tokens on every request.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniDash}>
                <div className={styles.miniDashNav}>
                  <div className={styles.miniDashLogo} />
                  <div className={styles.miniDashAvatar} />
                </div>
                <div className={styles.miniDashBody}>
                  <div className={styles.miniDashSide}>
                    <div className={styles.dashMenuItem} />
                    <div className={styles.dashMenuItem} />
                    <div className={styles.dashMenuItem} />
                  </div>
                  <div className={styles.miniDashContent}>
                    <div className={styles.miniDashStats}>
                      <div className={styles.miniStatCard}><div className={styles.miniStatBar} /></div>
                      <div className={styles.miniStatCard}><div className={styles.miniStatBar} /></div>
                    </div>
                    <div className={styles.miniDashChart}>
                      <div className={styles.miniChartLine} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: CheapCode IDE - Coming Soon */}
          <div className={`${styles.installCard} ${styles.installCardSoon}`}>
            <div className={styles.soonClockIcon}><Clock size={16} /></div>
            <div className={styles.installCardHeader}>
              <div className={styles.installTitleRow}>
                <div className={styles.installIcon}><Code size={20} /></div>
                <h3 className={styles.installTitle}>CheapCode IDE</h3>
              </div>
              <p className={styles.installDesc}>AI-powered code editor with inline completions and refactoring.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniCode}>
                <div className={styles.miniCodeHeader}>
                  <span className={styles.miniTab}>main.py</span>
                  <span className={styles.miniTabDim}>utils.py</span>
                </div>
                <div className={styles.miniCodeBody}>
                  <div><span className={styles.kw}>def</span> <span className={styles.fn}>optimize</span>(data):</div>
                  <div>&nbsp;&nbsp;<span className={styles.cm}># AI suggestion...</span></div>
                  <div>&nbsp;&nbsp;<span className={styles.kw}>return</span> result</div>
                </div>
              </div>
            </div>
            <div className={styles.soonTextShimmer}>Coming Soon</div>
          </div>

          {/* Card 6: CheapAgent - Coming Soon */}
          <div className={`${styles.installCard} ${styles.installCardSoon}`}>
            <div className={styles.soonClockIcon}><Clock size={16} /></div>
            <div className={styles.installCardHeader}>
              <div className={styles.installTitleRow}>
                <div className={styles.installIcon}><Workflow size={20} /></div>
                <h3 className={styles.installTitle}>CheapAgent</h3>
              </div>
              <p className={styles.installDesc}>Autonomous AI agent that plans, executes, and iterates on tasks.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniTerminal}>
                <div className={styles.miniTermHeader}>
                  <div className={styles.miniDots}><span className={styles.tRed}/><span className={styles.tYellow}/><span className={styles.tGreen}/></div>
                  <span className={styles.miniTermTitle}>agent</span>
                </div>
                <div className={styles.miniTermBody}>
                  <div className={styles.termRow}><span className={styles.termPrompt}>→</span> Analyzing task...</div>
                  <div className={styles.termRowOk}>✔ Plan generated</div>
                  <div className={styles.termRow}><span className={styles.termPrompt}>→</span> Executing step 1/3</div>
                </div>
              </div>
            </div>
            <div className={styles.soonTextShimmer}>Coming Soon</div>
          </div>

          {/* Card 7: Cheap Browser Extension - Coming Soon */}
          <div className={`${styles.installCard} ${styles.installCardSoon}`}>
            <div className={styles.soonClockIcon}><Clock size={16} /></div>
            <div className={styles.installCardHeader}>
              <div className={styles.installTitleRow}>
                <div className={styles.installIcon}><Globe size={20} /></div>
                <h3 className={styles.installTitle}>Cheap Extension</h3>
              </div>
              <p className={styles.installDesc}>Browser extension for AI summaries, translations & quick answers.</p>
            </div>
            <div className={styles.installPreview}>
              <div className={styles.miniChat}>
                <div className={styles.miniChatHeader}>
                  <div className={styles.miniDots}><span/><span/><span/></div>
                  <div className={styles.miniUrl}>chrome.cheapagents.io</div>
                </div>
                <div className={styles.miniChatBody}>
                  <div className={styles.chatBubbleUser}>Summarize this page</div>
                  <div className={styles.chatBubbleAi}>Key points: 3 articles...</div>
                </div>
                <div className={styles.miniChatInput}>
                  <div className={styles.miniInputField} />
                  <div className={styles.miniSendBtn} />
                </div>
              </div>
            </div>
            <div className={styles.soonTextShimmer}>Coming Soon</div>
          </div>
        </div>
  );
}
