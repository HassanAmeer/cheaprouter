"use client";
import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Terminal, MessageSquare, Code, LayoutDashboard, Cpu } from 'lucide-react';
import './BranchFeatures.css';

export default function BranchFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className={`tooltip-container ${isInView ? 'is-visible' : ''}`}>
      <div className="branch-section-inner">
        <div className="trigger-wrapper">
          <button className="merge-btn">
            <Cpu className="core-icon" size={28} style={{ marginRight: '12px' }} />
            <span style={{ fontSize: '22px', fontWeight: 'bold' }}>CheapModels Core Engine</span>
          </button>
          <svg className="branch-path-svg" viewBox="0 0 1260 200" preserveAspectRatio="none">
            {/* Base Lines */}
            <path className="branch-line line-1" d="M 630 0 C 630 40, 150 40, 150 60" />
            <path className="branch-line line-2" d="M 630 0 C 630 80, 470 80, 470 120" />
            <path className="branch-line line-3" d="M 630 0 C 630 80, 790 80, 790 120" />
            <path className="branch-line line-4" d="M 630 0 C 630 40, 1110 40, 1110 60" />
            
            {/* Flowing Animation Lines */}
            <path className="flow-line flow-1" d="M 630 0 C 630 40, 150 40, 150 60" />
            <path className="flow-line flow-2" d="M 630 0 C 630 80, 470 80, 470 120" />
            <path className="flow-line flow-3" d="M 630 0 C 630 80, 790 80, 790 120" />
            <path className="flow-line flow-4" d="M 630 0 C 630 40, 1110 40, 1110 60" />

            {/* Dots */}
            <circle className="branch-dot dot-1" cx="150" cy="60" r="6" />
            <circle className="branch-dot dot-2" cx="470" cy="120" r="6" />
            <circle className="branch-dot dot-3" cx="790" cy="120" r="6" />
            <circle className="branch-dot dot-4" cx="1110" cy="60" r="6" />
          </svg>
        </div>

        <div className="tooltips-wrapper">
          {/* CLI Card */}
          <div className="tooltip-content">
            <div className="tooltip-header">
              <Terminal size={24} /> Cheap CLI
            </div>
          <div className="tooltip-info">Native terminal tools & proxy. Secure, fast, and drop-in routing from local code.</div>
          <div className="mini-ui real-terminal">
            <div className="term-header">
              <div className="term-dots">
                <span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span>
              </div>
              <div className="term-title">user@cheapmodels:~</div>
            </div>
            <div className="term-body">
              <div className="term-line"><span className="prompt">❯</span> <span className="typewriter-cli">cheap-cli "add auth"<span className="cli-cursor">|</span></span></div>
              <div className="diff-block">
                <div className="term-line diff-minus"><span>-</span> <span className="code-text">&lt;button&gt;Enter&lt;/button&gt;</span></div>
                <div className="term-line diff-plus"><span>+</span> <span className="code-text">&lt;LoginAuth provider="github" /&gt;</span></div>
              </div>
              <div className="term-line success">✔ app.tsx updated</div>
            </div>
          </div>
        </div>
        
        {/* Chat Card */}
        <div className="tooltip-content staggered-down">
          <div className="tooltip-header">
            <MessageSquare size={24} /> Cheap Chat
          </div>
          <div className="tooltip-info">Interactive Web UI playground to test and compare models side-by-side.</div>
          <div className="mini-ui real-chat">
            <div className="chat-browser-header">
              <div className="browser-dots"><span/><span/><span/></div>
              <div className="browser-url">chat.cheapmodels.io</div>
            </div>
            <div className="chat-window">
              <div className="chat-sidebar">
                <div className="chat-hist-item"/><div className="chat-hist-item"/>
              </div>
              <div className="chat-main">
                <div className="chat-msg user">Compare GPT-4o & Claude</div>
                <div className="chat-msg ai">
                  <span className="typewriter">Generating comparison...<span className="chat-cursor">|</span></span>
                </div>
                <div className="chat-input-area">
                  <div className="chat-input"></div><div className="chat-send-btn"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Card */}
        <div className="tooltip-content staggered-down">
          <div className="tooltip-header">
            <Code size={24} /> Cheap API
          </div>
          <div className="tooltip-info">100% OpenAI compatible API endpoints. Just swap the baseURL.</div>
          <div className="mini-ui real-vscode">
            <div className="vs-header">
              <div className="vs-tabs">
                <div className="vs-tab active">app.ts</div>
                <div className="vs-tab">package.json</div>
              </div>
            </div>
            <div className="vs-body">
              <div className="vs-sidebar">
                <div className="vs-file">app.ts</div><div className="vs-file">utils.ts</div>
              </div>
              <div className="vs-code-area">
                <div className="code-line"><span className="keyword">import</span> OpenAI <span className="keyword">from</span> <span className="string">'openai'</span>;</div>
                <div className="code-line"><br/></div>
                <div className="code-line"><span className="keyword">const</span> ai = <span className="keyword">new</span> OpenAI({'{'}</div>
                <div className="code-line">&nbsp;&nbsp;baseURL: <span className="string">'https://api...'</span></div>
                <div className="code-line">{'}'});</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Card */}
        <div className="tooltip-content">
          <div className="tooltip-header">
            <LayoutDashboard size={24} /> Dashboard
          </div>
          <div className="tooltip-info">Manage BYOK keys, track usage, and monitor your cheap token rates globally.</div>
          <div className="mini-ui real-dash">
            <div className="dash-nav">
              <div className="dash-logo"></div><div className="dash-avatar"></div>
            </div>
            <div className="dash-body">
              <div className="dash-side">
                <div className="dash-menu active"></div><div className="dash-menu"></div><div className="dash-menu"></div>
              </div>
              <div className="dash-content">
                <div className="dash-stats">
                  <div className="stat-card"><div className="stat-value"></div></div>
                  <div className="stat-card"><div className="stat-value"></div></div>
                </div>
                <div className="dash-graph">
                  <div className="graph-line"></div>
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
