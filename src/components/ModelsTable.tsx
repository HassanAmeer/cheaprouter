'use client';

import React, { useState, useEffect } from 'react';
import { Search, Type, Image as ImageIcon, Code, Mic, Eye, Layers, ArrowRight, Bot, AudioLines, Video, Sparkles, Gift, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import styles from './ModelsTable.module.css';
import Link from 'next/link';
import { api } from '@/lib/api';

function ModelAvatar({ icon, isWhiteTheme, themeColor, shimmerEffect }: { icon?: string; isWhiteTheme?: boolean; themeColor?: string; shimmerEffect?: boolean }) {
  const [imgError, setImgError] = useState(false);

  const showBot = !icon || imgError || icon.includes('undefined') || icon.includes('null');

  return (
    <div 
      style={{ 
        width: '34px',
        height: '34px',
        padding: '6px', 
        backgroundColor: isWhiteTheme ? '#FFFFFF' : 'var(--color-bg-soft)', 
        borderRadius: '8px', 
        border: themeColor && !themeColor.includes('gradient') ? `1px solid ${themeColor}` : '1px solid var(--color-border)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        boxShadow: shimmerEffect ? '0 0 10px rgba(139, 92, 246, 0.3)' : 'var(--shadow-sm)',
        flexShrink: 0
      }}
    >
      {showBot ? (
        <Bot size={18} color="var(--color-text-muted, #94a3b8)" />
      ) : (
        <img 
          src={icon} 
          width="20" 
          height="20" 
          alt="" 
          onError={() => setImgError(true)}
          style={{ borderRadius: '2px', objectFit: 'contain' }} 
        />
      )}
    </div>
  );
}

interface ModelsTableProps {
  limit?: number;
  showToggle?: boolean;
  libraryMode?: boolean;
}

const parsePrice = (value?: string) => {
  if (value === undefined || value === null || value === '') return null;
  const price = Number.parseFloat(value.toString().replace(/[^0-9.]/g, ''));
  return Number.isFinite(price) ? price : null;
};

const parseContextLength = (value?: string | number) => {
  if (value === undefined || value === null) return null;
  const normalized = value.toString().trim().toLowerCase();
  if (!normalized || normalized === '-' || normalized === 'dynamic' || normalized === 'unlimited') return null;
  const match = normalized.match(/^([\d,.]+)\s*([km])?$/);
  if (!match) return null;
  const amount = Number.parseFloat(match[1].replace(/,/g, ''));
  if (!Number.isFinite(amount)) return null;
  return amount * (match[2] === 'm' ? 1_000_000 : match[2] === 'k' ? 1_000 : 1);
};

export default function ModelsTable({ limit, showToggle, libraryMode = false }: ModelsTableProps = {}) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [hideFreeModels, setHideFreeModels] = useState(false);
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [minimumContext, setMinimumContext] = useState(0);
  const [inputPriceCeiling, setInputPriceCeiling] = useState<number | null>(null);
  const [allModels, setAllModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const maximumContext = Math.max(0, ...allModels.map(model => parseContextLength(model.context) ?? 0));
  const maximumInputPrice = Math.max(0, ...allModels.map(model => parsePrice(model.inputPrice) ?? 0));
  const activeInputPriceCeiling = inputPriceCeiling ?? maximumInputPrice;

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

    const rawCurrent = currentPrice !== undefined && currentPrice !== null ? currentPrice.toString().replace(/[^0-9.]/g, '') : '';
    const rawOff = offPrice !== undefined && offPrice !== null ? offPrice.toString().replace(/[^0-9.]/g, '') : '';

    const numCurrent = rawCurrent !== '' ? parseFloat(rawCurrent) : NaN;
    const numOff = rawOff !== '' ? parseFloat(rawOff) : NaN;

    const hasCurrent = !isNaN(numCurrent);
    const hasOff = !isNaN(numOff) && numOff > 0;

    // If only Our Price is provided or Others Price is not set / identical
    if (!hasOff || (hasCurrent && numOff === numCurrent)) {
      if (!hasCurrent || numCurrent === 0) {
        return <span style={{ fontWeight: 700, color: '#10B981', fontSize: '15px' }}>Free</span>;
      }
      return <span style={{ fontWeight: 600, fontSize: '15px' }}>${numCurrent}</span>;
    }

    // Both prices available: numCurrent is Our Price (green), numOff is Others Price (struck-through)
    const ourPriceFormatted = !hasCurrent || numCurrent === 0 ? 'Free' : `$${numCurrent}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontWeight: 700, color: '#10B981', fontSize: '15px', lineHeight: '1.2' }}>
          {ourPriceFormatted}
        </span>
        <span 
          style={{ 
            textDecoration: 'line-through', 
            textDecorationColor: '#94A3B8',
            color: '#94A3B8', 
            fontSize: '13.5px', 
            fontWeight: 500,
            lineHeight: '1.2'
          }}
          title={`Others Price: $${numOff}`}
        >
          ${numOff}
        </span>
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
    const capMap: Record<string, string[]> = {
      'Text': ['text'],
      'Image': ['vision', 'image'],
      'Audio': ['audio'],
      'Video': ['video'],
      'Embeddings': ['embedding'],
    };
    const activeTabCaps = capMap[activeTab];
    if (activeTabCaps && !activeTabCaps.some(c => m.caps.includes(c))) return false;
    const capabilityFilters: Record<string, string[]> = {
      image: ['image', 'vision'],
    };
    if (selectedCapabilities.length && !selectedCapabilities.some(capability => (
      capabilityFilters[capability] ?? [capability]
    ).some(required => m.caps.includes(required)))) return false;
    const inputPrice = parsePrice(m.inputPrice);
    const outputPrice = parsePrice(m.outputPrice);
    const prices = [inputPrice, outputPrice].filter((price): price is number => price !== null);
    if (hideFreeModels && prices.length > 0 && prices.every(price => price === 0)) return false;
    if (discountedOnly) {
      const discounted = [
        [inputPrice, parsePrice(m.offInputPrice)],
        [outputPrice, parsePrice(m.offOutputPrice)],
      ].some(([current, original]) => current !== null && original !== null && original > current);
      if (!discounted) return false;
    }
    if (minimumContext > 0) {
      const context = parseContextLength(m.context);
      if (context === null || context < minimumContext) return false;
    }
    if (inputPriceCeiling !== null && inputPrice !== null && inputPrice > activeInputPriceCeiling) return false;
    return true;
  });

  const sortedModels = [...filteredModels].sort((a, b) => {
      if (showToggle) {
        const aOn = isEnabled(a.id) ? 0 : 1;
        const bOn = isEnabled(b.id) ? 0 : 1;
        if (aOn !== bOn) return aOn - bOn;
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-low' || sortBy === 'price-high') {
        const aPrice = parsePrice(a.inputPrice) ?? Number.POSITIVE_INFINITY;
        const bPrice = parsePrice(b.inputPrice) ?? Number.POSITIVE_INFINITY;
        if (aPrice === bPrice) return 0;
        if (!Number.isFinite(aPrice)) return 1;
        if (!Number.isFinite(bPrice)) return -1;
        return sortBy === 'price-low' ? aPrice - bPrice : bPrice - aPrice;
      }
      return (a.landingPagePriority ?? 9999) - (b.landingPagePriority ?? 9999);
    });

  const displayedModels = limit ? sortedModels.slice(0, limit) : sortedModels;
  const hasMore = limit ? sortedModels.length > limit : false;

  const colSpan = showToggle ? 6 : 5;

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities(current => current.includes(capability)
      ? current.filter(item => item !== capability)
      : [...current, capability]);
  };

  const clearLibraryFilters = () => {
    setSelectedCapabilities([]);
    setHideFreeModels(false);
    setDiscountedOnly(false);
    setMinimumContext(0);
    setInputPriceCeiling(null);
  };

  const libraryTabs = [
    { label: 'All', icon: <Layers size={16} /> },
    { label: 'Text', icon: <Type size={16} /> },
    { label: 'Image', icon: <ImageIcon size={16} /> },
    { label: 'Audio', icon: <AudioLines size={16} /> },
    { label: 'Video', icon: <Video size={16} /> },
    { label: 'Embeddings', icon: <Sparkles size={16} /> },
  ];

  return (
    <div className={libraryMode ? styles.libraryShell : styles.container}>
      {libraryMode && (
        <aside className={styles.librarySidebar}>
          <div className={styles.sidebarTitle}>
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </div>
          <fieldset className={styles.filterGroup}>
            <legend>Input modalities</legend>
            {[
              { label: 'Text', value: 'text' },
              { label: 'Image', value: 'image' },
              { label: 'Audio', value: 'audio' },
              { label: 'Video', value: 'video' },
              { label: 'Embeddings', value: 'embedding' },
            ].map(({ label, value }) => (
              <label className={styles.filterCheck} key={value}>
                <input
                  type="checkbox"
                  checked={selectedCapabilities.includes(value)}
                  onChange={() => toggleCapability(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          <fieldset className={styles.filterGroup}>
            <legend>Pricing</legend>
            <label className={styles.filterCheck}>
              <input type="checkbox" checked={hideFreeModels} onChange={event => setHideFreeModels(event.target.checked)} />
              <span><Gift size={14} />Hide free models</span>
            </label>
            <label className={styles.filterCheck}>
              <input type="checkbox" checked={discountedOnly} onChange={event => setDiscountedOnly(event.target.checked)} />
              <span><Sparkles size={14} />Discounted only</span>
            </label>
          </fieldset>
          <fieldset className={styles.filterGroup}>
            <legend>Context length</legend>
            <label className={styles.rangeControl}>
              <input
                type="range"
                min={0}
                max={maximumContext || 1}
                step={Math.max(1, Math.floor((maximumContext || 1) / 100))}
                value={Math.min(minimumContext, maximumContext || 1)}
                onChange={event => setMinimumContext(Number(event.target.value))}
                aria-label="Minimum context length"
              />
              <span>{minimumContext ? `${(minimumContext / 1000).toLocaleString()}K min` : 'Any context'}</span>
              <span>{maximumContext ? `${(maximumContext / 1000).toLocaleString()}K max` : '—'}</span>
            </label>
          </fieldset>
          <fieldset className={styles.filterGroup}>
            <legend>Input price / 1M</legend>
            <label className={styles.rangeControl}>
              <input
                type="range"
                min={0}
                max={maximumInputPrice || 1}
                step={Math.max(0.01, (maximumInputPrice || 1) / 100)}
                value={Math.min(activeInputPriceCeiling, maximumInputPrice || 1)}
                onChange={event => setInputPriceCeiling(Number(event.target.value))}
                aria-label="Maximum input price per million tokens"
              />
              <span>$0</span>
              <span>{inputPriceCeiling === null ? 'Any' : `$${inputPriceCeiling.toFixed(2)}`}</span>
            </label>
          </fieldset>
          {(selectedCapabilities.length > 0 || hideFreeModels || discountedOnly || minimumContext > 0 || inputPriceCeiling !== null) && (
            <button
              className={styles.clearFilters}
              onClick={clearLibraryFilters}
            >
              Clear filters
            </button>
          )}
        </aside>
      )}
      <div className={libraryMode ? styles.libraryContent : undefined}>
      {libraryMode && (
        <div className={styles.libraryHeading}>
          <div>
            <p className={styles.libraryEyebrow}>CHEAPROUTER MODEL INDEX</p>
            <h1>Model library</h1>
            <p className={styles.librarySubheading}>Compare capabilities and per-token pricing across available models.</p>
          </div>
          <a className={styles.compareButton} href="/compare">
            <Layers size={16} /> Compare models
          </a>
        </div>
      )}
      {/* Top Filters Bar */}
      <div className={`${styles.filtersBar} ${libraryMode ? styles.libraryToolbar : ''}`}>
        <div className={styles.filterTabs}>
          {(libraryMode ? libraryTabs : ['All', 'Text', 'Vision', 'Image', 'Audio', 'Video', 'Reasoning', 'Embedding'].map(label => ({ label, icon: null }))).map(({ label: tab, icon }) => (
            <button 
              key={tab} 
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
            >
              {icon}
              {tab}
              {libraryMode && <span className={styles.tabCount}>{tab === 'All' ? allModels.length : allModels.filter(model => {
                const tabCaps: Record<string, string[]> = {
                  Text: ['text'],
                  Image: ['image', 'vision'],
                  Audio: ['audio'],
                  Video: ['video'],
                  Embeddings: ['embedding'],
                };
                return tabCaps[tab]?.some(capability => model.caps.includes(capability));
              }).length}</span>}
            </button>
          ))}
        </div>
        <div className={`${styles.dropdowns} ${libraryMode ? styles.libraryControls : ''}`}>
          <label className={styles.sortControl}>
            <ArrowUpDown size={15} />
            <select className={styles.dropdown} value={sortBy} onChange={event => setSortBy(event.target.value)} aria-label="Sort models">
            <option value="recommended">Recommended</option>
            <option value="name">Name A–Z</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`${styles.searchBar} ${libraryMode ? styles.librarySearchBar : ''}`}>
        <Search size={18} color="#666" />
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder={libraryMode ? 'Search models or providers…' : 'Search models by name or provider...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className={`${styles.tableWrapper} ${libraryMode ? styles.libraryTableWrapper : ''}`}>
        <table className={`${styles.table} ${libraryMode ? styles.libraryTable : ''}`}>
          <thead>
            <tr>
              <th style={{ width: libraryMode ? '30%' : '35%' }}>Model</th>
              {libraryMode && <th>Provider</th>}
              <th className={libraryMode ? styles.numericHeader : undefined}>Context</th>
              <th className={libraryMode ? styles.numericHeader : undefined}>Input / 1M</th>
              <th className={libraryMode ? styles.numericHeader : undefined}>Output / 1M</th>
              <th>Capabilities</th>
              {showToggle && <th style={{ textAlign: 'right' }}>Status</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                  <td colSpan={colSpan + (libraryMode ? 1 : 0)} style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                  Loading models...
                </td>
              </tr>
            ) : displayedModels.map((m, i) => {
              const on = isEnabled(m.id);
              return (
                <tr key={i} style={{ opacity: showToggle && !on ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                  <td style={{ verticalAlign: libraryMode ? 'middle' : 'top', padding: libraryMode ? '12px 14px' : '14px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                      <div className={styles.modelNameCol}>
                        <ModelAvatar 
                          icon={m.icon} 
                          isWhiteTheme={m.isWhiteTheme} 
                          themeColor={m.themeColor} 
                          shimmerEffect={m.shimmerEffect} 
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{m.name}</span>
                            {m.badgeText && (
                              <span 
                                style={{ 
                                  fontSize: '9.5px', 
                                  fontWeight: 500, 
                                  letterSpacing: '0.2px',
                                  padding: '1px 6px', 
                                  borderRadius: '4px', 
                                  background: 'rgba(239, 68, 68, 0.12)', 
                                  color: 'var(--color-primary, #EF4444)', 
                                  border: '1px solid rgba(239, 68, 68, 0.25)',
                                  flexShrink: 0,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  lineHeight: '1.4'
                                }}
                              >
                                {m.badgeText}
                              </span>
                            )}
                            {m.type === 'Premium' && !m.badgeText && (
                              <span style={{ fontSize: '9.5px', fontWeight: 500, letterSpacing: '0.2px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255, 77, 77, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(255, 77, 77, 0.2)' }}>PRO</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                            {m.description && m.description.trim() ? (
                              <span className={styles.shimmerText} title={m.id}>
                                {m.description}
                              </span>
                            ) : (
                              <span className={styles.modelId} title={m.id}>
                                {m.id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  {libraryMode && <td className={styles.providerCell}>{m.provider}</td>}
                  <td style={{ fontWeight: 600, verticalAlign: libraryMode ? 'middle' : 'top', paddingTop: libraryMode ? '12px' : '18px' }}>{m.context}</td>
                  <td className={styles.costCol} style={{ verticalAlign: libraryMode ? 'middle' : 'top', paddingTop: libraryMode ? '12px' : '18px' }}>{renderPricingCell(m.inputPrice, m.offInputPrice)}</td>
                  <td className={styles.costCol} style={{ verticalAlign: libraryMode ? 'middle' : 'top', paddingTop: libraryMode ? '12px' : '18px' }}>{renderPricingCell(m.outputPrice, m.offOutputPrice)}</td>
                  <td style={{ verticalAlign: libraryMode ? 'middle' : 'top', paddingTop: libraryMode ? '12px' : '18px' }}>
                    <div className={styles.capabilities}>
                      {m.caps.includes('text') && <span data-tooltip="Text"><Type size={16} /></span>}
                      {m.caps.includes('code') && <span data-tooltip="Code"><Code size={16} /></span>}
                      {m.caps.includes('vision') && <span data-tooltip="Vision"><Eye size={16} /></span>}
                      {m.caps.includes('image') && !m.caps.includes('vision') && <span data-tooltip="Image"><ImageIcon size={16} /></span>}
                      {m.caps.includes('audio') && <span data-tooltip="Audio"><Mic size={16} /></span>}
                      {m.caps.includes('video') && <span data-tooltip="Video"><Video size={16} /></span>}
                      {m.caps.includes('reasoning') && <span data-tooltip="Reasoning"><Sparkles size={16} /></span>}
                      {m.caps.includes('embedding') && <span data-tooltip="Embeddings"><Layers size={16} /></span>}
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
                <td colSpan={colSpan + (libraryMode ? 1 : 0)} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
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
    </div>
  );
}
