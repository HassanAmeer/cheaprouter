'use client';

import React, { useState, useEffect } from 'react';
import { Search, Type, Image as ImageIcon, Code, Mic, Eye, Layers, ArrowRight } from 'lucide-react';
import styles from './ModelsTable.module.css';
import Link from 'next/link';
import { api } from '@/lib/api';

interface ModelsTableProps {
  limit?: number;
  showToggle?: boolean;
}

export default function ModelsTable({ limit, showToggle }: ModelsTableProps = {}) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [allModels, setAllModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (showToggle) {
      api.getModelPrefs().then(res => setEnabledMap(res.prefs)).catch(console.error);
    }
    
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
                  inputPrice: m.inputPrice,
                  outputPrice: m.outputPrice,
                  offInputPrice: m.showOthersPrice === false ? undefined : m.offInputPrice,
                  offOutputPrice: m.showOthersPrice === false ? undefined : m.offOutputPrice,
                  showOthersPrice: m.showOthersPrice,
                  description: m.description,
                  badgeText: m.badgeText,
                  themeColor: m.themeColor,
                  isWhiteTheme: m.isWhiteTheme,
                  shimmerEffect: m.shimmerEffect,
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
  }, [showToggle]);

  const renderPricingCell = (currentPrice?: string, offPrice?: string) => {
    if (!currentPrice && !offPrice) return <span style={{ color: 'var(--color-text-muted)' }}>-</span>;

    const rawCurrent = currentPrice ? currentPrice.toString().replace(/[^0-9.]/g, '') : '';
    const rawOff = offPrice ? offPrice.toString().replace(/[^0-9.]/g, '') : '';

    const numCurrent = rawCurrent ? parseFloat(rawCurrent) : NaN;
    const numOff = rawOff ? parseFloat(rawOff) : NaN;

    // If only one price is available or both are identical
    if (!offPrice || isNaN(numOff) || numOff === numCurrent || !currentPrice) {
      const val = currentPrice || offPrice;
      if (!val || val === '0' || val === '0.00' || val.toLowerCase() === 'free') {
        return <span style={{ fontWeight: 700, color: '#10B981' }}>Free</span>;
      }
      return <span style={{ fontWeight: 600 }}>{val.startsWith('$') ? val : `$${val}/1M`}</span>;
    }

    // Both prices exist -> determine discounted price (lower) and original crossed-out price (higher)
    const activeNum = Math.min(numCurrent, numOff);
    const originalNum = Math.max(numCurrent, numOff);
    const discountPercent = Math.round(((originalNum - activeNum) / originalNum) * 100);

    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#10B981', fontSize: '13px' }}>
          {activeNum === 0 ? 'Free' : `$${activeNum}/1M`}
        </span>
        <span 
          style={{ 
            textDecoration: 'line-through', 
            textDecorationColor: '#94A3B8',
            color: '#94A3B8', 
            fontSize: '11.5px', 
            fontWeight: 500
          }}
          title={`Others Price: $${originalNum}/1M`}
        >
          ${originalNum}
        </span>
        {discountPercent > 0 && (
          <span 
            style={{
              fontSize: '9px',
              fontWeight: 800,
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '1px 5px',
              borderRadius: '4px',
              letterSpacing: '0.2px'
            }}
            title={`${discountPercent}% Discount`}
          >
            {discountPercent}% OFF
          </span>
        )}
      </div>
    );
  };

  const toggleModel = async (id: string) => {
    const current = enabledMap[id] !== false;
    const next = !current;
    // optimistic update
    setEnabledMap(prev => ({ ...prev, [id]: next }));
    try {
      await api.updateModelPref(id, next);
    } catch (err) {
      console.error('Failed to update pref', err);
      // revert on fail
      setEnabledMap(prev => ({ ...prev, [id]: current }));
    }
  };

  const isEnabled = (id: string) => enabledMap[id] !== false;

  const filteredModels = allModels.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'All') return true;
    const capMap: Record<string, string[]> = {
      'Text': ['text'],
      'Vision': ['vision'],
      'Image': ['image'],
      'Audio': ['audio'],
      'Video': ['video'],
      'Reasoning': ['reasoning'],
      'Embedding': ['embedding'],
    };
    const required = capMap[activeTab];
    return required ? required.some(c => m.caps.includes(c)) : true;
  });

  const sortedModels = showToggle
    ? [...filteredModels].sort((a, b) => {
        const aOn = isEnabled(a.id) ? 0 : 1;
        const bOn = isEnabled(b.id) ? 0 : 1;
        return aOn - bOn;
      })
    : filteredModels;

  const displayedModels = limit ? sortedModels.slice(0, limit) : sortedModels;
  const hasMore = limit ? sortedModels.length > limit : false;

  const colSpan = showToggle ? 6 : 5;

  return (
    <div className={styles.container}>
      {/* Top Filters Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.filterTabs}>
          {['All', 'Text', 'Vision', 'Image', 'Audio', 'Video', 'Reasoning', 'Embedding'].map(tab => (
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
              <th style={{ width: '35%' }}>Model</th>
              <th style={{ width: '12%' }}>Context</th>
              <th style={{ width: '18%' }}>Input</th>
              <th style={{ width: '18%' }}>Output</th>
              <th style={{ width: '17%' }}>Capabilities</th>
              {showToggle && <th style={{ textAlign: 'right' }}>Status</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                  Loading models...
                </td>
              </tr>
            ) : displayedModels.map((m, i) => {
              const on = isEnabled(m.id);
              return (
                <tr key={i} style={{ opacity: showToggle && !on ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                  <td style={{ verticalAlign: 'top', padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                      <div className={styles.modelNameCol}>
                        <div 
                          style={{ 
                            padding: '6px', 
                            backgroundColor: m.isWhiteTheme ? '#FFFFFF' : 'var(--color-bg-soft)', 
                            borderRadius: '8px', 
                            border: m.themeColor && !m.themeColor.includes('gradient') ? `1px solid ${m.themeColor}` : '1px solid var(--color-border)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            boxShadow: m.shimmerEffect ? '0 0 10px rgba(139, 92, 246, 0.3)' : 'var(--shadow-sm)',
                            flexShrink: 0
                          }}
                        >
                          <img src={m.icon} width="22" height="22" alt={m.provider} style={{ borderRadius: '2px' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{m.name}</span>
                            {m.badgeText && (
                              <span style={{ fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                {m.badgeText}
                              </span>
                            )}
                            {m.type === 'Premium' && !m.badgeText && (
                              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 77, 77, 0.1)', color: 'var(--color-primary)' }}>PRO</span>
                            )}
                          </div>
                          <div className={styles.modelId}>{m.id}</div>
                        </div>
                      </div>

                      {/* Tree Node Description Branch */}
                      {m.description && m.description.trim() ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginLeft: '17px', marginTop: '6px' }}>
                          <div 
                            style={{
                              width: '16px',
                              height: '14px',
                              borderLeft: '1.5px solid var(--color-border, #475569)',
                              borderBottom: '1.5px solid var(--color-border, #475569)',
                              borderBottomLeftRadius: '6px',
                              flexShrink: 0,
                              marginTop: '-2px',
                              opacity: 0.65
                            }} 
                          />
                          <span style={{ 
                            fontSize: '11.5px', 
                            color: 'var(--color-text-muted)', 
                            lineHeight: '1.45', 
                            maxWidth: '420px',
                            whiteSpace: 'normal'
                          }}>
                            {m.description}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, verticalAlign: 'top', paddingTop: '18px' }}>{m.context}</td>
                  <td className={styles.costCol} style={{ verticalAlign: 'top', paddingTop: '18px' }}>{renderPricingCell(m.inputPrice, m.offInputPrice)}</td>
                  <td className={styles.costCol} style={{ verticalAlign: 'top', paddingTop: '18px' }}>{renderPricingCell(m.outputPrice, m.offOutputPrice)}</td>
                  <td style={{ verticalAlign: 'top', paddingTop: '18px' }}>
                    <div className={styles.capabilities}>
                      {m.caps.includes('text') && <span data-tooltip="Text"><Type size={16} /></span>}
                      {m.caps.includes('code') && <span data-tooltip="Code"><Code size={16} /></span>}
                      {m.caps.includes('vision') && <span data-tooltip="Vision"><Eye size={16} /></span>}
                      {m.caps.includes('audio') && <span data-tooltip="Audio"><Mic size={16} /></span>}
                      {m.caps.includes('video') && <span data-tooltip="Video"><Layers size={16} /></span>}
                    </div>
                  </td>
                  {showToggle && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => toggleModel(m.id)}
                        title={on ? 'Disable model' : 'Enable model'}
                        style={{
                          position: 'relative',
                          display: 'inline-flex',
                          alignItems: 'center',
                          width: '40px',
                          height: '22px',
                          borderRadius: '11px',
                          background: on ? 'var(--color-primary, #ef4444)' : 'var(--color-border)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          padding: 0,
                          flexShrink: 0,
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          left: on ? '20px' : '2px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#fff',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                          transition: 'left 0.2s',
                        }} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          {!loading && sortedModels.length === 0 && (
              <tr>
                <td colSpan={colSpan} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
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
