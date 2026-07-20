'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import styles from './InstallBox.module.css';

export default function InstallBox() {
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

  return (
    <div className={styles.installBoxWrapper}>
      <br />
      <div className={styles.arrowWrapper}>
        <div className={styles.shimmerArrow}></div>
        <p className={styles.shimmerText}>
          Best free coding editor, install cheap CLI. <i style={{ color: '#10b981' }}>Unlimited Free Coding</i>
        </p>
      </div>
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
  );
}
