'use client';

import React, { useState } from 'react';
import { Search, Type, Image as ImageIcon, Code, Mic, Eye, Layers, ArrowRight } from 'lucide-react';
import styles from './ModelsTable.module.css';
import Link from 'next/link';

interface ModelsTableProps {
  limit?: number;
}

export default function ModelsTable({ limit }: ModelsTableProps = {}) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [allModels, setAllModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch('/api/public/providers')
      .then(res => res.json())
      .then(data => {
        let models: any[] = [];
        if (Array.isArray(data)) {
          const rawArray = data[0]?.id && !(data[0] as any)?.providers ? data : ((data as any).providers || []);
          models = rawArray.flatMap((p: any) => 
            (p.models || [])
              .filter((m: any) => m.showOnLandingPage)
              .map((m: any) => {
                const iconMap: Record<string, string> = {
                  'OpenAI': 'https://cdn.simpleicons.org/openai/10A37F',
                  'Anthropic': 'https://cdn.simpleicons.org/anthropic/D97757',
                  'Google': 'https://cdn.simpleicons.org/google/4285F4',
                  'Meta': 'https://cdn.simpleicons.org/meta/0668E1',
                  'DeepSeek': 'https://logo.clearbit.com/deepseek.com',
                  'X.AI': 'https://cdn.simpleicons.org/x/000000',
                  'Mistral': 'https://logo.clearbit.com/mistral.ai'
                };
                return {
                  id: m.originalId || m.id,
                  name: m.name,
                  provider: p.name,
                  icon: m.icon || p.icon || iconMap[p.name] || 'https://cdn.simpleicons.org/openai/10A37F',
                  context: m.contextWindow || '-',
                  latency: '-',
                  throughput: '-',
                  input: m.inputPrice ? `$${m.inputPrice}/1M` : '-',
                  output: m.outputPrice ? `$${m.outputPrice}/1M` : '-',
                  cache: '-',
                  caps: [
                    m.text && 'text',
                    m.vision && 'vision',
                    m.image && 'image',
                    m.video && 'video',
                    m.audio && 'audio',
                    m.reasoning && 'reasoning',
                    m.embedding && 'embedding'
                  ].filter(Boolean),
                  type: m.access || 'Standard',
                  landingPagePriority: m.landingPagePriority ?? 9999
                };
              })
          );
        }
        models.sort((a, b) => (a.landingPagePriority ?? 9999) - (b.landingPagePriority ?? 9999));
        setAllModels(models);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch landing page models:', err);
        setLoading(false);
      });
  }, []);

  const filteredModels = allModels.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'Text') return m.caps.includes('text');
    if (activeTab === 'Code') return m.caps.includes('text');
    if (activeTab === 'Vision') return m.caps.includes('vision');
    if (activeTab === 'Audio/Video') return m.caps.includes('audio') || m.caps.includes('video');
    
    return true;
  });

  const displayedModels = limit ? filteredModels.slice(0, limit) : filteredModels;
  const hasMore = limit ? filteredModels.length > limit : false;

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
              <th>Input</th>
              <th>Output</th>
              <th>Capabilities</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                  Loading models...
                </td>
              </tr>
            ) : displayedModels.map((m, i) => (
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
                <td className={styles.costCol}>{m.input}</td>
                <td className={styles.costCol}>{m.output}</td>
                <td>
                  <div className={styles.capabilities}>
                    {m.caps.includes('text') && <span data-tooltip="Text"><Type size={16} /></span>}
                    {m.caps.includes('code') && <span data-tooltip="Code"><Code size={16} /></span>}
                    {m.caps.includes('vision') && <span data-tooltip="Vision"><Eye size={16} /></span>}
                    {m.caps.includes('audio') && <span data-tooltip="Audio"><Mic size={16} /></span>}
                    {m.caps.includes('video') && <span data-tooltip="Video"><Layers size={16} /></span>}
                  </div>
                </td>
              </tr>
            ))}
          {!loading && filteredModels.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No models found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View All Models button */}
      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
          <Link
            href="/models"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--color-primary, #ef4444), #c00)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(239,68,68,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 28px rgba(239,68,68,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(239,68,68,0.35)'; }}
          >
            View All Models <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
