"use client";
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type Language = 'cURL' | 'JavaScript' | 'Python' | 'PHP';

interface CodeSnippet {
  language: Language;
  code: string;
}

interface CodeBlockProps {
  snippets: CodeSnippet[];
  title?: string;
}

export default function CodeBlock({ snippets, title }: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState<Language>(snippets[0].language);
  const [copied, setCopied] = useState(false);

  const activeSnippet = snippets.find((s) => s.language === activeTab)?.code || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div style={{
      backgroundColor: '#0a0a0a', // Dark neutral code block
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden',
      marginBottom: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      {/* Header Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Mac OS Window Dots */}
          <div style={{ display: 'flex', gap: '6px', marginRight: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
          </div>
          
          {title ? (
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>{title}</span>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              {snippets.map((snippet) => {
                const isActive = activeTab === snippet.language;
                return (
                  <button
                    key={snippet.language}
                    onClick={() => setActiveTab(snippet.language)}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      color: isActive ? '#f8fafc' : '#64748b',
                      cursor: 'pointer',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '11px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {snippet.language}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-sm)',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '11px',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
        >
          {copied ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Code Area */}
      <div style={{ padding: '24px', position: 'relative', overflowX: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.pre
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
          >
            <code>
              {/* Basic syntax coloring for dark theme */}
              {activeSnippet.split('\n').map((line, idx) => {
                let htmlLine = line
                  .replace(/(".*?")/g, '<span style="color:#fca5a5">$1</span>') // strings (red tint)
                  .replace(/(fetch|requests\.get|requests\.post|curl|-X GET|-X POST)/g, '<span style="color:#7dd3fc">$1</span>') // keywords (blue)
                  .replace(/(https?:\/\/[^\s"']+)/g, '<span style="color:#bae6fd">$1</span>') // urls
                  .replace(/(true|false|null)/g, '<span style="color:#7dd3fc">$1</span>'); // booleans
                return (
                  <div key={idx} dangerouslySetInnerHTML={{ __html: htmlLine || ' ' }} />
                );
              })}
            </code>
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
}
