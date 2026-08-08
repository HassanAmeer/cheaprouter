"use client";
import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type Language = 'cURL' | 'JavaScript' | 'Python';

interface CodeSnippet {
  language: Language;
  code: string;
}

interface CodeBlockProps {
  snippets: CodeSnippet[];
}

export default function CodeBlock({ snippets }: CodeBlockProps) {
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
      backgroundColor: '#0d1117',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid #30363d',
      overflow: 'hidden',
      marginTop: '24px',
      marginBottom: '40px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    }}>
      {/* Header Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#161b22',
        borderBottom: '1px solid #30363d',
        padding: '0 16px',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {snippets.map((snippet) => (
            <button
              key={snippet.language}
              onClick={() => setActiveTab(snippet.language)}
              style={{
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === snippet.language ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === snippet.language ? '#c9d1d9' : '#8b949e',
                cursor: 'pointer',
                fontWeight: activeTab === snippet.language ? 600 : 500,
                fontSize: '13px',
                transition: 'all 0.2s ease',
              }}
            >
              {snippet.language}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: '1px solid #30363d',
            borderRadius: '4px',
            color: '#8b949e',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#c9d1d9'; e.currentTarget.style.borderColor = '#8b949e'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#8b949e'; e.currentTarget.style.borderColor = '#30363d'; }}
        >
          {copied ? <Check size={14} color="#3fb950" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code Area */}
      <div style={{ padding: '24px', position: 'relative', overflowX: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.pre
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            style={{ margin: 0, fontSize: '13.5px', color: '#c9d1d9', lineHeight: '1.5', fontFamily: 'monospace' }}
          >
            <code>
              {/* Splitting code by newlines to add some minimal manual syntax coloring where applicable */}
              {activeSnippet.split('\n').map((line, idx) => {
                // Extremely basic syntax highlighting for common patterns
                let coloredLine = line;
                if (coloredLine.includes('curl ')) coloredLine = coloredLine.replace('curl ', '<span style="color:#FF7B72">curl </span>');
                if (coloredLine.includes('fetch(')) coloredLine = coloredLine.replace('fetch(', '<span style="color:#D2A8FF">fetch</span>(');
                if (coloredLine.includes('requests.')) coloredLine = coloredLine.replace('requests.', '<span style="color:#D2A8FF">requests.</span>');
                
                return (
                  <div key={idx} dangerouslySetInnerHTML={{ __html: coloredLine || ' ' }} />
                );
              })}
            </code>
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
}
