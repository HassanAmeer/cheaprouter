'use client';
import React from 'react';
import Link from 'next/link';
import { Terminal, Code, Zap, Clock, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useSiteSettings } from '@/components/settings-provider';
import { normalizeTools, ToolIconKey } from '@/lib/tools';
import styles from '@/app/page.module.css';

const ICONS: Record<ToolIconKey, typeof Terminal> = {
  Terminal,
  Code,
  Zap,
  MessageSquare,
};

function StarsBg() {
  return (
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
  );
}

export default function InstallGrid() {
  const { settings } = useSiteSettings();
  const install = settings.install || ({} as NonNullable<typeof settings.install>);
  const apiBase = install.apiBaseUrl || 'https://api.cheaprouter.com/v1';
  const cliName = install.cliName || 'cheap-cli';

  // Admin-managed from /admin/tools-manager. Switched-off tools are not shown at all;
  // "soon" tools keep their announcement card instead of a working Open link.
  const tools = normalizeTools(settings.toolsSettings?.tools).filter((tool) => tool.enabled);

  const previews: Record<string, React.ReactNode> = {
    'free-unlimited-coding': (
      <div className={styles.miniTerminal}>
        <div className={styles.miniTermHeader}>
          <div className={styles.miniDots}><span className={styles.tRed}/><span className={styles.tYellow}/><span className={styles.tGreen}/></div>
          <span className={styles.miniTermTitle}>~ terminal</span>
        </div>
        <div className={styles.miniTermBody}>
          <div className={styles.termRow}><span className={styles.termPrompt}>$</span> {cliName} install</div>
          <div className={styles.termRowOk}>✔ Installed successfully</div>
          <div className={styles.termRow}><span className={styles.termPrompt}>$</span> cheap ask &quot;fix this bug&quot;</div>
        </div>
      </div>
    ),
    'connect-by-api': (
      <div className={styles.miniCode}>
        <div className={styles.miniCodeHeader}>
          <span className={styles.miniTab}>app.ts</span>
          <span className={styles.miniTabDim}>config.json</span>
        </div>
        <div className={styles.miniCodeBody}>
          <div><span className={styles.kw}>const</span> ai = <span className={styles.kw}>new</span> OpenAI({'{'}</div>
          <div>&nbsp;&nbsp;baseURL: <span className={styles.str}>&quot;{apiBase}&quot;</span>,</div>
          <div>&nbsp;&nbsp;apiKey: <span className={styles.str}>&quot;cm_***&quot;</span></div>
          <div>{'}'});</div>
        </div>
      </div>
    ),
    'earn-all-ai': (
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
    ),
    'cheapcode-ide': (
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
    ),
    'cheap-chats': (
      <div className={styles.miniTerminal}>
        <div className={styles.miniTermHeader}>
          <div className={styles.miniDots}><span className={styles.tRed}/><span className={styles.tYellow}/><span className={styles.tGreen}/></div>
          <span className={styles.miniTermTitle}>cheap chats</span>
        </div>
        <div className={styles.miniTermBody}>
          <div className={styles.termRow}><span className={styles.termPrompt}>You:</span> Explain this idea</div>
          <div className={styles.termRowOk}>Assistant: Here’s a clear breakdown…</div>
          <div className={styles.termRow}><span className={styles.termPrompt}>Model:</span> Claude Sonnet</div>
        </div>
      </div>
    ),
  };

  if (tools.length === 0) return null;

  return (
        <div className={styles.installGrid}>
          {tools.map((tool) => {
            const Icon = ICONS[tool.icon] ?? Code;
            const isSoon = tool.status === 'soon';
            const preview = previews[tool.id];

            return (
              <div
                key={tool.id}
                className={`${styles.installCard} ${isSoon ? styles.installCardSoon : ''}`}
              >
                {isSoon ? (
                  <div className={styles.soonClockIcon}><Clock size={16} /></div>
                ) : (
                  <>
                    <StarsBg />
                    <div className={styles.cardTopRow}>
                      <div className={styles.liveTextOnly}>
                        <span className={styles.liveDot} /> LIVE
                      </div>
                      {tool.href && (
                        <Link href={tool.href} className={styles.openOutlineBtn}>
                          Open <ArrowUpRight size={13} />
                        </Link>
                      )}
                    </div>
                  </>
                )}

                <div className={styles.installCardHeader}>
                  <div className={styles.installTitleRow}>
                    <div className={styles.installIcon}><Icon size={20} /></div>
                    <h3 className={styles.installTitle}>{tool.name}</h3>
                  </div>
                  <p className={styles.installDesc}>{tool.description}</p>
                </div>

                {preview && (
                  <div className={styles.installPreview}>
                    {preview}
                  </div>
                )}

                {isSoon && <div className={styles.soonTextShimmer}>Coming Soon</div>}
              </div>
            );
          })}
        </div>
  );
}