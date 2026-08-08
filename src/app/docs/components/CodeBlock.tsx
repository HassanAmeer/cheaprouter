"use client";
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
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
      backgroundColor: '#111827', // Very dark slate (Tailwind gray-900)
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      marginTop: '16px',
      marginBottom: '32px',
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Header Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1F2937', // Slightly lighter slate (gray-800)
        borderBottom: '1px solid #374151',
        padding: '0 8px',
      }}>
        <div style={{ display: 'flex' }}>
          {snippets.map((snippet) => {
            const isActive = activeTab === snippet.language;
            return (
              <button
                key={snippet.language}
                onClick={() => setActiveTab(snippet.language)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: isActive ? '#F9FAFB' : '#9CA3AF',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px',
                  transition: 'color 0.2s ease',
                  position: 'relative'
                }}
              >
                {snippet.language}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            marginRight: '8px',
            backgroundColor: 'transparent',
            border: '1px solid #374151',
            borderRadius: 'var(--radius-sm)',
            color: '#9CA3AF',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#F9FAFB'; e.currentTarget.style.borderColor = '#6B7280'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = '#374151'; }}
        >
          {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
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
            style={{ margin: 0, fontSize: '13.5px', color: '#E5E7EB', lineHeight: '1.6', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
          >
            <code>
              {/* Very basic syntax coloring to make it look premium */}
              {activeSnippet.split('\n').map((line, idx) => {
                let htmlLine = line
                  .replace(/(".*?")/g, '<span style="color:#A5D6FF">$1</span>') // strings
                  .replace(/(fetch|requests\.get|requests\.post|curl)/g, '<span style="color:#FF7B72">$1</span>') // keywords
                  .replace(/(https?:\/\/[^\s"']+)/g, '<span style="color:#79C0FF">$1</span>') // urls
                  .replace(/(true|false|null)/g, '<span style="color:#79C0FF">$1</span>'); // booleans
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
