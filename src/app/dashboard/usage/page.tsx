'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import styles from './usage.module.css';
import { 
  Activity, Zap, Wallet, Cpu, Terminal, MessageSquare, 
  Hammer, Braces, Layers, RefreshCw, Search, ArrowUpDown, Filter, Sparkles
} from 'lucide-react';
import { UsageBreakdown, UsageModel, UsageSourceType } from '@/lib/api-types';

interface TabConfig {
  key: UsageSourceType;
  label: string;
  badgeLabel: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const TABS: TabConfig[] = [
  { 
    key: 'all', 
    label: 'All Sources', 
    badgeLabel: 'All',
    icon: <Layers size={15} />, 
    color: '#8B5CF6',
    description: 'Combined model calls, token usage, and costs across all tools and integrations.' 
  },
  { 
    key: 'cli', 
    label: 'CLI / Terminal', 
    badgeLabel: 'CLI',
    icon: <Terminal size={15} />, 
    color: '#0891b2',
    description: 'Model calls made from CheapRouter CLI, Aider, Claude Code, and terminal editors via /v1/chat/completions.' 
  },
  { 
    key: 'ide', 
    label: 'IDE Builder', 
    badgeLabel: 'IDE',
    icon: <Hammer size={15} />, 
    color: '#6366f1',
    description: 'AI usage from Devonz Code Editor, Cursor, and IDE coding extensions.' 
  },
  { 
    key: 'chat', 
    label: 'Cheap Chats', 
    badgeLabel: 'Chats',
    icon: <MessageSquare size={15} />, 
    color: '#10b981',
    description: 'Messages and model completions generated inside the Cheap Chats web conversation app.' 
  },
  { 
    key: 'api', 
    label: 'Direct API', 
    badgeLabel: 'API',
    icon: <Braces size={15} />, 
    color: '#d97706',
    description: 'Direct programmatic REST requests sent to the /v1/chat/completions endpoints.' 
  },
];

export default function UsagePage() {
  const [breakdown, setBreakdown] = useState<UsageBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<UsageSourceType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'hits' | 'tokens' | 'cost' | 'last_used'>('hits');
  const [sortAsc, setSortAsc] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await api.usageBreakdown(activeTab);
      setBreakdown(data);
    } catch (err) {
      console.error('Failed to load usage data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.usageBreakdown(activeTab)
      .then((d) => { if (active) setBreakdown(d); })
      .catch(() => { if (active) setBreakdown(null); })
      .finally(() => { if (active) setLoading(false); });

    const interval = setInterval(() => {
      api.usageBreakdown(activeTab)
        .then((d) => { if (active) setBreakdown(d); })
        .catch(() => {});
    }, 12000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeTab]);

  const b: UsageBreakdown = breakdown ?? {
    models: [],
    totalModels: 0,
    totalCalls: 0,
    totalTokens: 0,
    totalCost: 0,
    byType: {
      all: { hits: 0, tokens: 0, cost: 0, models: 0 },
      cli: { hits: 0, tokens: 0, cost: 0, models: 0 },
      ide: { hits: 0, tokens: 0, cost: 0, models: 0 },
      chat: { hits: 0, tokens: 0, cost: 0, models: 0 },
      api: { hits: 0, tokens: 0, cost: 0, models: 0 },
    }
  };

  // Filter and sort models
  const filteredModels = useMemo(() => {
    let list = b.models || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => 
        m.model.toLowerCase().includes(q) || 
        (m.source && m.source.toLowerCase().includes(q))
      );
    }

    return [...list].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (sortField === 'last_used') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [b.models, searchQuery, sortField, sortAsc]);

  const currentTabMeta = TABS.find(t => t.key === activeTab) || TABS[0];

  const handleSort = (field: 'hits' | 'tokens' | 'cost' | 'last_used') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const renderTypeBadge = (source?: string) => {
    const s = (source || 'api').toLowerCase();
    switch (s) {
      case 'cli':
        return <span className={`${styles.typeBadge} ${styles.typeBadgeCli}`}><Terminal size={11} /> CLI</span>;
      case 'ide':
        return <span className={`${styles.typeBadge} ${styles.typeBadgeIde}`}><Hammer size={11} /> IDE</span>;
      case 'chat':
      case 'chats':
      case 'web':
        return <span className={`${styles.typeBadge} ${styles.typeBadgeChat}`}><MessageSquare size={11} /> Chats</span>;
      case 'api':
      default:
        return <span className={`${styles.typeBadge} ${styles.typeBadgeApi}`}><Braces size={11} /> API</span>;
    }
  };

  return (
    <div className={styles.container}>
      {/* ─── PAGE HEADER ─── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>
            <Activity size={24} color="var(--color-primary)" /> Usage Analytics
          </h1>
          <p className={styles.headerSubtitle}>
            Comprehensive consumption breakdown by source type — CLI, IDE Builder, Cheap Chats, and REST APIs.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.refreshBtn}
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Refresh analytics data"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── FILTER CONTROLS BY TYPE ─── */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          {TABS.map((tab) => {
            const count = b.byType?.[tab.key]?.hits ?? 0;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
                title={`Filter by ${tab.label}`}
              >
                <span style={{ color: isActive ? tab.color : 'inherit', display: 'flex', alignItems: 'center' }}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                <span className={styles.filterCountBadge}>
                  {count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── METRIC STAT CARDS ─── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>Total Requests</span>
            <div className={styles.statIconWrap} style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
              <Activity size={18} />
            </div>
          </div>
          <div className={styles.statValue}>
            {loading ? '…' : b.totalCalls.toLocaleString()}
          </div>
          <div className={styles.statFootnote}>
            <span>{currentTabMeta.badgeLabel} execution calls recorded</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>Tokens Consumed</span>
            <div className={styles.statIconWrap} style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
              <Zap size={18} />
            </div>
          </div>
          <div className={styles.statValue}>
            {loading ? '…' : b.totalTokens.toLocaleString()}
          </div>
          <div className={styles.statFootnote}>
            <span>Prompt & completion tokens</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>Total Cost</span>
            <div className={styles.statIconWrap} style={{ background: 'rgba(217, 119, 6, 0.12)', color: 'var(--color-warning)' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div className={styles.statValue} style={{ color: 'var(--color-warning)' }}>
            {loading ? '…' : `$${b.totalCost.toFixed(4)}`}
          </div>
          <div className={styles.statFootnote}>
            <span>Billed against account balance</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>AI Models Active</span>
            <div className={styles.statIconWrap} style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6' }}>
              <Cpu size={18} />
            </div>
          </div>
          <div className={styles.statValue}>
            {loading ? '…' : b.totalModels.toLocaleString()}
          </div>
          <div className={styles.statFootnote}>
            <span>Unique models in {currentTabMeta.badgeLabel}</span>
          </div>
        </div>
      </div>

      {/* ─── USAGE BREAKDOWN TABLE CARD ─── */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeaderBar}>
          <div>
            <h3 className={styles.tableHeaderTitle}>
              <Filter size={16} color="var(--color-primary)" />
              {currentTabMeta.label} Usage Breakdown
            </h3>
            <p className={styles.tableHeaderDesc}>
              {currentTabMeta.description}
            </p>
          </div>

          <div className={styles.searchBox}>
            <Search size={15} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Filter by model or type…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
            <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Loading usage records…</div>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Activity size={24} />
            </div>
            <div className={styles.emptyTitle}>No usage recorded</div>
            <div className={styles.emptyDesc}>
              {searchQuery ? `No results matching "${searchQuery}". Try a different keyword.` : `No requests found for ${currentTabMeta.label}. Start generating completions to see live analytics.`}
            </div>
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.usageTable}>
              <thead>
                <tr>
                  <th>AI Model</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('hits')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Hits / Calls <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('tokens')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Tokens Used <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('cost')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Cost ($) <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('last_used')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Last Used <ArrowUpDown size={12} />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((m: UsageModel, idx: number) => (
                  <tr key={`${m.model}-${m.source || 'api'}-${idx}`}>
                    <td>
                      <div className={styles.modelBadge}>
                        <Sparkles size={13} color="var(--color-primary)" />
                        <span>{m.model}</span>
                      </div>
                    </td>
                    <td>
                      {renderTypeBadge(m.source)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                      {m.hits.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {m.tokens.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-warning)', fontWeight: 600 }}>
                      ${m.cost.toFixed(4)}
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {m.last_used ? (
                        <>
                          {new Date(m.last_used).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' '}
                          <span style={{ opacity: 0.7 }}>
                            {new Date(m.last_used).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}