'use client';

import React, { useState } from 'react';
import { Search, Type, Image as ImageIcon, Code, Mic, Eye, Layers } from 'lucide-react';
import styles from './ModelsTable.module.css';

const allModels = [
  { 
    id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: 'https://cdn.simpleicons.org/openai/10A37F',
    context: '128K', latency: '1.2s', throughput: '45tps', input: '$5/M', output: '$15/M', cache: 'Read: $2.5/M', 
    caps: ['text', 'vision'], type: 'Premium'
  },
  { 
    id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', icon: 'https://cdn.simpleicons.org/openai/10A37F',
    context: '128K', latency: '0.6s', throughput: '120tps', input: '$0.15/M', output: '$0.60/M', cache: 'Read: $0.075/M', 
    caps: ['text', 'vision'], type: 'Cheap Rate'
  },
  { 
    id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: 'https://cdn.simpleicons.org/anthropic/D97757',
    context: '200K', latency: '1.5s', throughput: '40tps', input: '$3/M', output: '$15/M', cache: 'Read: $0.3/M', 
    caps: ['text', 'vision', 'code'], type: 'Premium'
  },
  { 
    id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', icon: 'https://cdn.simpleicons.org/anthropic/D97757',
    context: '200K', latency: '0.8s', throughput: '100tps', input: '$0.25/M', output: '$1.25/M', cache: 'Read: $0.025/M', 
    caps: ['text', 'vision'], type: 'Cheap Rate'
  },
  { 
    id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', icon: 'https://cdn.simpleicons.org/google/4285F4',
    context: '2M', latency: '2.4s', throughput: '30tps', input: '$3.50/M', output: '$10.50/M', cache: 'Read: $0.875/M', 
    caps: ['text', 'vision', 'audio', 'video'], type: 'Premium'
  },
  { 
    id: 'google/gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', icon: 'https://cdn.simpleicons.org/google/4285F4',
    context: '1M', latency: '0.9s', throughput: '150tps', input: '$0.075/M', output: '$0.30/M', cache: 'Read: $0.018/M', 
    caps: ['text', 'vision', 'audio', 'video'], type: 'Free (Limited)'
  },
  { 
    id: 'meta-llama/llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta', icon: 'https://cdn.simpleicons.org/meta/0668E1',
    context: '128K', latency: '2.8s', throughput: '20tps', input: '$2/M', output: '$2/M', cache: '-', 
    caps: ['text', 'code'], type: 'Premium'
  },
  { 
    id: 'meta-llama/llama-3-70b', name: 'Llama 3 70B', provider: 'Meta', icon: 'https://cdn.simpleicons.org/meta/0668E1',
    context: '8K', latency: '0.8s', throughput: '80tps', input: '$0.50/M', output: '$0.50/M', cache: '-', 
    caps: ['text'], type: 'Free'
  },
  { 
    id: 'deepseek/deepseek-coder-v2', name: 'DeepSeek Coder V2', provider: 'DeepSeek', icon: 'https://logo.clearbit.com/deepseek.com',
    context: '128K', latency: '1.4s', throughput: '65tps', input: '$0.14/M', output: '$0.28/M', cache: 'Read: $0.014/M', 
    caps: ['text', 'code'], type: 'Cheap Rate'
  },
  { 
    id: 'x-ai/grok-1.5', name: 'Grok 1.5', provider: 'X.AI', icon: 'https://cdn.simpleicons.org/x/000000',
    context: '128K', latency: '1.8s', throughput: '45tps', input: '$5/M', output: '$15/M', cache: '-', 
    caps: ['text', 'vision'], type: 'Premium'
  },
  { 
    id: 'x-ai/grok-super', name: 'Super Grok', provider: 'X.AI', icon: 'https://cdn.simpleicons.org/x/000000',
    context: '200K', latency: '1.2s', throughput: '60tps', input: '$8/M', output: '$20/M', cache: '-', 
    caps: ['text', 'vision', 'code'], type: 'Premium'
  },
  { 
    id: 'openai/chatgpt-5.6', name: 'ChatGPT 5.6', provider: 'OpenAI', icon: 'https://cdn.simpleicons.org/openai/10A37F',
    context: '1M', latency: '1.0s', throughput: '50tps', input: '$10/M', output: '$30/M', cache: 'Read: $5/M', 
    caps: ['text', 'vision', 'code', 'audio'], type: 'Premium'
  },
  { 
    id: 'fable/fable-5.6', name: 'Fable 5.6', provider: 'Fable', icon: 'https://cdn.simpleicons.org/openai/10A37F',
    context: '1M', latency: '0.8s', throughput: '80tps', input: '$8/M', output: '$24/M', cache: 'Read: $4/M', 
    caps: ['text', 'vision'], type: 'Premium'
  },
  { 
    id: 'zhipu/glm-4', name: 'GLM 4', provider: 'Zhipu AI', icon: 'https://cdn.simpleicons.org/google/4285F4',
    context: '128K', latency: '1.5s', throughput: '55tps', input: '$2/M', output: '$6/M', cache: '-', 
    caps: ['text', 'code'], type: 'Cheap Rate'
  },
];

export default function ModelsTable() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredModels = allModels.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'Text') return m.caps.includes('text');
    if (activeTab === 'Code') return m.caps.includes('code');
    if (activeTab === 'Vision') return m.caps.includes('vision');
    if (activeTab === 'Audio/Video') return m.caps.includes('audio') || m.caps.includes('video');
    
    return true;
  });

  return (
    <div className={styles.container}>
      {/* Top Filters Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.filterTabs}>
          {['All', 'Text', 'Code', 'Vision', 'Audio/Video'].map(tab => (
            <button 
              key={tab} 
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={styles.dropdowns}>
          <select className={styles.dropdown}>
            <option>All Providers</option>
            <option>OpenAI</option>
            <option>Anthropic</option>
            <option>Google</option>
          </select>
          <select className={styles.dropdown}>
            <option>Sort by Recommended</option>
            <option>Sort by Price (Low)</option>
            <option>Sort by Price (High)</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <Search size={18} color="#666" />
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="Search models by name or provider..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Model</th>
              <th>Context</th>
              <th>Latency</th>
              <th>Throughput</th>
              <th>Input</th>
              <th>Output</th>
              <th>Cache</th>
              <th>Capabilities</th>
              <th>Providers</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map((m, i) => (
              <tr key={i}>
                <td>
                  <div className={styles.modelNameCol}>
                    <div style={{ padding: '6px', backgroundColor: 'var(--color-bg-soft)', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                      <img src={m.icon} width="22" height="22" alt={m.provider} style={{ borderRadius: '2px' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {m.name} 
                        {m.type === 'Premium' && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 77, 77, 0.1)', color: 'var(--color-primary)' }}>PRO</span>}
                      </div>
                      <div className={styles.modelId}>{m.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>{m.context}</td>
                <td>{m.latency}</td>
                <td>{m.throughput}</td>
                <td className={styles.costCol}>{m.input}</td>
                <td className={styles.costCol}>{m.output}</td>
                <td className={styles.costCol} style={{ color: '#888', fontSize: '12px' }}>{m.cache}</td>
                <td>
                  <div className={styles.capabilities}>
                    {m.caps.includes('text') && <span data-tooltip="Text"><Type size={16} /></span>}
                    {m.caps.includes('code') && <span data-tooltip="Code"><Code size={16} /></span>}
                    {m.caps.includes('vision') && <span data-tooltip="Vision"><Eye size={16} /></span>}
                    {m.caps.includes('audio') && <span data-tooltip="Audio"><Mic size={16} /></span>}
                    {m.caps.includes('video') && <span data-tooltip="Video"><Layers size={16} /></span>}
                  </div>
                </td>
                <td>
                  <img src={m.icon} width="16" height="16" alt={m.provider} style={{ opacity: 0.8, borderRadius: m.provider === 'DeepSeek' ? '2px' : '0' }} />
                </td>
              </tr>
            ))}
            {filteredModels.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No models found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
