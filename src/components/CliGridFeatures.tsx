import React from 'react';
import styles from './CliGridFeatures.module.css';

export default function CliGridFeatures() {
  return (
    <section className={`container ${styles.section}`}>
      <div className={styles.grid}>
        
        {/* Card 1 */}
        <div className={`${styles.card} ${styles.cardAccent}`}>
          <div className={`${styles.category} ${styles.categoryOrange}`}>/FERMENT WORKFLOW</div>
          <h2 className={styles.title}>Hand off the task.<br/>Come back to a finished PR.</h2>
          <p className={styles.desc}>
            A workflow that allows you to plan upfront, approve once and forget the terminal. The <strong>agent builds through each milestone autonomously</strong> — a PR appears when it's done, not a question.
          </p>
          
          <div className={styles.mockup}>
            <div className={styles.mockupHeaderRow}>
              <div><span className={styles.textOrange}>/ferment</span> implement a "to do" app</div>
              <div className={styles.textDim}>Don't ask permissions</div>
            </div>
            <div className={styles.mockupList}>
              <div className={styles.mockupListItem}>
                <span><span className={styles.textGreen}>✓</span> <span className={styles.textGreen}>plan approved</span></span>
              </div>
              <div className={styles.mockupListItem}>
                <span><span className={styles.textGreen}>✓</span> Phase 1: Scaffold project structure</span>
                <span className={styles.textDim}>0.8s</span>
              </div>
              <div className={styles.mockupListItem}>
                <span><span className={styles.textGreen}>✓</span> Phase 2: Build task model + local storage</span>
                <span className={styles.textDim}>1.1s</span>
              </div>
              <div className={styles.mockupListItem}>
                <span><span className={styles.textDim}>•</span> Phase 3: Create UI components</span>
                <span className={styles.textOrange}>running…</span>
              </div>
              <div className={styles.mockupListItem}>
                <span className={styles.textDim}>• Phase 4: Add due dates · tests · open PR</span>
              </div>
            </div>
            <div className={styles.mockupFooter}>
              Phase 3/4: <span className={styles.textOrange}>"Create UI components"</span> · step 1/2 · Stop: <span style={{color: '#ccc'}}>When done</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className={styles.card}>
          <div className={`${styles.category} ${styles.categoryGrey}`}>CODE SESSION</div>
          <h2 className={styles.title}>Stay in the loop. Have more control.<br/>Make it quick.</h2>
          <p className={styles.desc}>
            The standard coding agent <strong>conversation</strong> powered by our open source model orchestration. Interact more closely with the agent and stir it exactly in the direction you want.
          </p>
          
          <div className={styles.mockup}>
            <div className={styles.mockupHeaderRow}>
              <div style={{color: '#eee'}}>Rename userId to accountId</div>
              <div className={styles.textDim}>Auto permissions</div>
            </div>
            <div style={{color: '#888', marginBottom: '24px'}}>Found 6 more references in other files.</div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <div style={{color: '#ccc', marginBottom: '12px'}}>Want me to update those too?</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div><span className={styles.textGreen}>{'>'}</span> <span className={styles.textGreen}>Yes</span></div>
                <div style={{paddingLeft: '16px', color: '#888'}}>No</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className={styles.card}>
          <div className={`${styles.category} ${styles.categoryGrey}`}>ONE COMMAND SETUP</div>
          <h2 className={styles.title}>Migrate from Claude Code.<br/>Keep everything.</h2>
          <p className={styles.desc}>
            On first run, <strong>kimchi setup</strong> detects existing Claude Code and OpenCode installations <strong>MCP servers, skills, configuration</strong> and offers to migrate in one prompt.
          </p>
          
          <div className={styles.mockup}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px', color: '#888'}}>
              <div><span className={styles.textOrange}>┌ Claude Code configuration found</span></div>
              <div>| MCP servers: filesystem, github, ripgrep</div>
              <div>| Claude Code skills: 4 in ~/.claude/skills</div>
              <div>| OpenCode skills: 2 in ~/.config/opencode/skills</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <div style={{color: '#888'}}>◇ Migrate MCP servers to Kimchi?</div>
              <div><span className={styles.textGreen}>● Migrate now</span></div>
              <div style={{color: '#888'}}>○ Skip this time</div>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className={styles.card}>
          <div className={`${styles.category} ${styles.categoryGrey}`}>BUILT IN MODEL ORCHESTRATION</div>
          <h2 className={styles.title}>Right model per task.<br/>Automatic.</h2>
          <p className={styles.desc}>
            The orchestrator classifies each task and routes to the best model specialized sub-agents run security audits, tests, and analysis in <strong>isolated parallel contexts</strong>. Turn <strong>multi-model off</strong> to lock a single provider.
          </p>
          
          <div style={{ marginTop: 'auto' }}>
            <div style={{background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontFamily: "'Fira Code', monospace", fontSize: '12px'}}>
              <span style={{color: '#888'}}>multi-model</span>
              <div style={{width: '36px', height: '20px', background: '#27c93f', borderRadius: '10px', position: 'relative'}}>
                <div style={{width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px'}}></div>
              </div>
            </div>
            
            <div style={{display: 'flex', gap: '16px'}}>
              <div style={{flex: 1, background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '20px', fontFamily: "'Fira Code', monospace"}}>
                <div style={{fontSize: '10px', color: '#27c93f', letterSpacing: '1px', marginBottom: '16px', fontWeight: 600}}>REASONING / PLAN</div>
                <div style={{fontSize: '16px', color: '#fff', fontWeight: 'bold', marginBottom: '32px'}}>kimi-k2.5</div>
                <div style={{display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '11px'}}>
                  <span>orchestrator</span>
                  <span className={styles.textGreen}>12%</span>
                </div>
              </div>
              <div style={{flex: 1, background: '#111', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', padding: '20px', fontFamily: "'Fira Code', monospace"}}>
                <div style={{fontSize: '10px', color: '#ff4d4d', letterSpacing: '1px', marginBottom: '16px', fontWeight: 600}}>EXECUTION</div>
                <div style={{fontSize: '16px', color: '#fff', fontWeight: 'bold', marginBottom: '32px'}}>minimax-2.7</div>
                <div style={{display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '11px'}}>
                  <span>subagents · parallel</span>
                  <span style={{color: '#ff4d4d'}}>88%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
