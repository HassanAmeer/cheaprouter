'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from '../admin.module.css';
import {
  Search,
  Key,
  Copy,
  Check,
  Trash2,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  Loader2,
  User,
  Mail,
  Calendar,
  Activity,
  Layers,
  Server,
  Cpu,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckSquare
} from 'lucide-react';

interface AdminKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  planApi: string;
  balance: number;
}

interface AdminBYOKKey {
  id: string;
  provider: string;
  masked: string;
  status: string;
  added: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  balance: number;
  name?: string;
  color?: string;
}

const formatDate = (d: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const maskKey = (prefix: string) => {
  if (!prefix) return 'sk-…';
  return prefix.length >= 16 ? `${prefix.slice(0, 6)}…${prefix.slice(-4)}` : prefix;
};

const formatProviderName = (raw: string) => {
  const p = (raw || '').toLowerCase().trim();
  if (p === 'cloudcode' || p === 'cloud_code' || p === 'cloud-code') return 'Cloud Code';
  if (p === 'openai') return 'OpenAI';
  if (p === 'anthropic') return 'Anthropic';
  if (p === 'google' || p === 'gemini') return 'Google';
  if (p === 'deepseek') return 'DeepSeek';
  if (p === 'openrouter') return 'OpenRouter';
  if (p === 'groq') return 'Groq';
  if (p === 'meta' || p === 'llama') return 'Meta';
  if (p === 'minimax') return 'MiniMax';
  if (p === 'mistral') return 'Mistral';
  if (p === 'cohere') return 'Cohere';
  return raw.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('admin_token') || localStorage.getItem('adminToken'))
    : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

function PaginationControl({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  position = 'top'
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  position?: 'top' | 'bottom';
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      padding: position === 'top' ? '12px 2px 14px 2px' : '16px 2px 4px 2px',
      borderTop: position === 'bottom' ? '1px solid var(--color-border)' : 'none',
      borderBottom: position === 'top' ? '1px solid var(--color-border)' : 'none',
      marginBottom: position === 'top' ? 14 : 0,
      marginTop: position === 'bottom' ? 14 : 0
    }}>
      {/* Left side: Item count info & per-page selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Showing <strong style={{ color: 'var(--color-text-main)' }}>{startItem.toLocaleString()}</strong>–<strong style={{ color: 'var(--color-text-main)' }}>{endItem.toLocaleString()}</strong> of <strong style={{ color: 'var(--color-text-main)' }}>{totalItems.toLocaleString()}</strong> items
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              background: 'var(--color-card-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '4px 8px',
              color: 'var(--color-text-main)',
              fontSize: '12px',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100 (Max)</option>
          </select>
        </div>
      </div>

      {/* Right side: Page navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '8px',
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-main)',
            opacity: currentPage <= 1 ? 0.35 : 1,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s'
          }}
          title="First Page"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '8px',
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-main)',
            opacity: currentPage <= 1 ? 0.35 : 1,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s'
          }}
          title="Previous Page"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Number buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} style={{ padding: '0 4px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                …
              </span>
            );
          }
          const isCurrent = p === currentPage;
          return (
            <button
              key={`page-${p}`}
              onClick={() => onPageChange(Number(p))}
              style={{
                minWidth: 32, height: 32, padding: '0 8px', borderRadius: '8px',
                background: isCurrent ? 'var(--color-primary)' : 'var(--color-card-bg)',
                color: isCurrent ? '#fff' : 'var(--color-text-main)',
                border: isCurrent ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                fontWeight: isCurrent ? 800 : 600,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isCurrent ? '0 2px 8px rgba(124, 58, 237, 0.3)' : 'none'
              }}
            >
              {p}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '8px',
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-main)',
            opacity: currentPage >= totalPages ? 0.35 : 1,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s'
          }}
          title="Next Page"
        >
          <ChevronRight size={15} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '8px',
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-main)',
            opacity: currentPage >= totalPages ? 0.35 : 1,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s'
          }}
          title="Last Page"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default function AdminKeysPage() {
  const [activeTab, setActiveTab] = useState<'api' | 'byok'>('api');
  const [keys, setKeys] = useState<AdminKey[]>([]);
  const [byokKeys, setByokKeys] = useState<AdminBYOKKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination state (default maximum 100 per page as requested)
  const [pageSize, setPageSize] = useState<number>(100);
  const [apiPage, setApiPage] = useState<number>(1);
  const [byokPage, setByokPage] = useState<number>(1);

  const [selectedApiKeys, setSelectedApiKeys] = useState<Set<string>>(new Set());
  const [selectedByokKeys, setSelectedByokKeys] = useState<Set<string>>(new Set());
  const [deletingBulkKeys, setDeletingBulkKeys] = useState(false);

  // Revoke / Delete modal state
  const [isConfirmRevokeOpen, setIsConfirmRevokeOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<{ id: string; name: string; owner: string; isByok: boolean } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/keys', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`Failed to load keys (${res.status})`);
      const data = await res.json();
      setKeys(data.keys || []);
      setByokKeys(data.byokKeys || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load keys data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = (id: string, val: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopiedId(id);
    triggerToast('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openRevokeConfirm = (item: { id: string; name: string; owner: string; isByok: boolean }) => {
    setKeyToRevoke(item);
    setIsConfirmRevokeOpen(true);
  };

  const handleRevoke = async () => {
    if (!keyToRevoke) return;
    setDeletingId(keyToRevoke.id);
    try {
      const endpoint = keyToRevoke.isByok
        ? `/api/admin/byok-keys/${keyToRevoke.id}`
        : `/api/admin/keys/${keyToRevoke.id}`;

      const res = await fetch(endpoint, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        if (keyToRevoke.isByok) {
          setByokKeys((prev) => prev.filter((k) => k.id !== keyToRevoke.id));
          triggerToast(`BYOK key "${keyToRevoke.name}" deleted`, 'info');
        } else {
          setKeys((prev) => prev.filter((k) => k.id !== keyToRevoke.id));
          triggerToast(`API key "${keyToRevoke.name}" revoked`, 'info');
        }
      } else {
        triggerToast('Failed to delete key', 'error');
      }
    } catch (e) {
      triggerToast('Failed to delete key', 'error');
    } finally {
      setDeletingId(null);
      setIsConfirmRevokeOpen(false);
      setKeyToRevoke(null);
    }
  };

  const handleBulkDeleteApiKeys = async () => {
    if (selectedApiKeys.size === 0) return;
    if (!confirm(`Are you sure you want to revoke ${selectedApiKeys.size} API key${selectedApiKeys.size > 1 ? 's' : ''}?`)) return;
    setDeletingBulkKeys(true);
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ ids: Array.from(selectedApiKeys) })
      });
      if (res.ok) {
        setKeys(prev => prev.filter(k => !selectedApiKeys.has(k.id)));
        triggerToast(`${selectedApiKeys.size} API keys revoked`, 'info');
        setSelectedApiKeys(new Set());
      } else {
        triggerToast('Failed to revoke keys', 'error');
      }
    } catch {
      triggerToast('Error revoking keys', 'error');
    } finally {
      setDeletingBulkKeys(false);
    }
  };

  const handleBulkDeleteByokKeys = async () => {
    if (selectedByokKeys.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedByokKeys.size} BYOK key${selectedByokKeys.size > 1 ? 's' : ''}?`)) return;
    setDeletingBulkKeys(true);
    try {
      const res = await fetch('/api/admin/byok-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ ids: Array.from(selectedByokKeys) })
      });
      if (res.ok) {
        setByokKeys(prev => prev.filter(k => !selectedByokKeys.has(k.id)));
        triggerToast(`${selectedByokKeys.size} BYOK keys deleted`, 'info');
        setSelectedByokKeys(new Set());
      } else {
        triggerToast('Failed to delete BYOK keys', 'error');
      }
    } catch {
      triggerToast('Error deleting BYOK keys', 'error');
    } finally {
      setDeletingBulkKeys(false);
    }
  };

  // Handlers for search and filters that reset current page to 1
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setApiPage(1);
    setByokPage(1);
  };

  const handleProviderFilterChange = (val: string) => {
    setProviderFilter(val);
    setByokPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setApiPage(1);
    setByokPage(1);
  };

  const handleTabSwitch = (tab: 'api' | 'byok') => {
    setActiveTab(tab);
    setSearchTerm('');
    setApiPage(1);
    setByokPage(1);
  };

  // Filtered lists based on search
  const filteredApiKeys = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return keys;
    return keys.filter(
      (k) =>
        k.name?.toLowerCase().includes(q) ||
        k.id?.toLowerCase().includes(q) ||
        k.userId?.toLowerCase().includes(q) ||
        k.userName?.toLowerCase().includes(q) ||
        k.userEmail?.toLowerCase().includes(q) ||
        k.prefix?.toLowerCase().includes(q)
    );
  }, [keys, searchTerm]);

  const filteredByokKeys = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return byokKeys.filter((b) => {
      const matchSearch =
        !q ||
        b.provider?.toLowerCase().includes(q) ||
        formatProviderName(b.provider).toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q) ||
        b.userId?.toLowerCase().includes(q) ||
        b.userName?.toLowerCase().includes(q) ||
        b.userEmail?.toLowerCase().includes(q) ||
        b.masked?.toLowerCase().includes(q);

      const matchProvider =
        providerFilter === 'all' ||
        b.provider?.toLowerCase() === providerFilter.toLowerCase();

      return matchSearch && matchProvider;
    });
  }, [byokKeys, searchTerm, providerFilter]);

  // Pagination calculations for API Keys
  const totalApiCount = filteredApiKeys.length;
  const totalApiPages = Math.max(1, Math.ceil(totalApiCount / pageSize));
  const safeApiPage = Math.min(Math.max(1, apiPage), totalApiPages);
  const paginatedApiKeys = useMemo(() => {
    const start = (safeApiPage - 1) * pageSize;
    return filteredApiKeys.slice(start, start + pageSize);
  }, [filteredApiKeys, safeApiPage, pageSize]);

  // Pagination calculations for BYOK Keys
  const totalByokCount = filteredByokKeys.length;
  const totalByokPages = Math.max(1, Math.ceil(totalByokCount / pageSize));
  const safeByokPage = Math.min(Math.max(1, byokPage), totalByokPages);
  const paginatedByokKeys = useMemo(() => {
    const start = (safeByokPage - 1) * pageSize;
    return filteredByokKeys.slice(start, start + pageSize);
  }, [filteredByokKeys, safeByokPage, pageSize]);

  // Unique providers list for filter dropdown
  const uniqueProviders = useMemo(() => {
    const set = new Set<string>();
    byokKeys.forEach((b) => {
      if (b.provider) set.add(b.provider.toLowerCase());
    });
    return Array.from(set).sort();
  }, [byokKeys]);

  // Summary counts
  const totalApiKeys = keys.length;
  const totalByokKeys = byokKeys.length;
  const uniqueUsersCount = useMemo(() => {
    const set = new Set<string>();
    keys.forEach((k) => set.add(k.userId));
    byokKeys.forEach((b) => set.add(b.userId));
    return set.size;
  }, [keys, byokKeys]);

  const totalBalance = useMemo(() => {
    const userBalanceMap = new Map<string, number>();
    keys.forEach((k) => userBalanceMap.set(k.userId, Number(k.balance) || 0));
    byokKeys.forEach((b) => userBalanceMap.set(b.userId, Number(b.balance) || 0));
    let sum = 0;
    userBalanceMap.forEach((v) => { sum += v; });
    return sum;
  }, [keys, byokKeys]);

  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: toastMessage.type === 'success' ? '#10B981' : toastMessage.type === 'error' ? '#EF4444' : '#3B82F6',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: 600,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastMessage.type === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
          {toastMessage.text}
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '12px', fontWeight: 700,
              color: 'var(--color-primary)', background: 'var(--color-primary-soft)',
              padding: '4px 10px', borderRadius: '20px'
            }}>
              <Key size={12} /> Key Management
            </span>
          </div>
          <h1 style={{
            fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, var(--color-text-main) 0%, #a1a1aa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            API / BYOK Keys
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: '8px 0 0', maxWidth: '720px' }}>
            Comprehensive overview of user-generated API keys and user-supplied BYOK (Bring Your Own Key) credentials across all providers.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 16px', borderRadius: '10px',
            background: 'var(--color-card-bg)', border: '1px solid var(--color-border)',
            color: 'var(--color-text-main)', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={14} className={loading ? 'lucide-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ─── STATS STRIP ─── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { icon: <Key size={15} />, label: 'Generated API Keys', value: totalApiKeys, tint: 'var(--color-primary)' },
          { icon: <Server size={15} />, label: 'BYOK Provider Keys', value: totalByokKeys, tint: '#10B981' },
          { icon: <User size={15} />, label: 'Active Users with Keys', value: uniqueUsersCount, tint: '#6366F1' },
          { icon: <Layers size={15} />, label: 'Total User Balances', value: `$${totalBalance.toFixed(2)}`, tint: 'var(--color-warning)' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--color-card-bg)', border: '1px solid var(--color-border)',
              borderRadius: '12px', padding: '12px 18px', flex: '1 1 200px'
            }}
          >
            <span style={{ color: s.tint, display: 'inline-flex' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '19px', fontWeight: 800, lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── TABS HEADER (API KEYS vs BYOK KEYS) & SEARCH ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16, marginBottom: 20
      }}>
        {/* Toggle pill buttons */}
        <div style={{
          display: 'flex', gap: 6,
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          padding: '5px', borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <button
            onClick={() => handleTabSwitch('api')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
              border: 'none',
              background: activeTab === 'api' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'api' ? '#fff' : 'var(--color-text-muted)',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeTab === 'api' ? '0 2px 10px rgba(124, 58, 237, 0.35)' : 'none'
            }}
          >
            <Key size={15} />
            <span>Generated API Keys</span>
            <span style={{
              fontSize: '11px', padding: '2px 7px', borderRadius: '10px',
              background: activeTab === 'api' ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-soft)',
              color: activeTab === 'api' ? '#fff' : 'var(--color-text-muted)'
            }}>
              {totalApiKeys}
            </span>
          </button>

          <button
            onClick={() => handleTabSwitch('byok')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
              border: 'none',
              background: activeTab === 'byok' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'byok' ? '#fff' : 'var(--color-text-muted)',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeTab === 'byok' ? '0 2px 10px rgba(124, 58, 237, 0.35)' : 'none'
            }}
          >
            <Server size={15} />
            <span>BYOK Keys</span>
            <span style={{
              fontSize: '11px', padding: '2px 7px', borderRadius: '10px',
              background: activeTab === 'byok' ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-soft)',
              color: activeTab === 'byok' ? '#fff' : 'var(--color-text-muted)'
            }}>
              {totalByokKeys}
            </span>
          </button>
        </div>

        {/* Search bar & Provider Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280, maxWidth: 560 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder={activeTab === 'api' ? "Search key name, ID, user, email, or prefix..." : "Search provider, masked key, user, or email..."}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                padding: '10px 14px 10px 36px',
                borderRadius: '10px',
                color: 'var(--color-text-main)',
                outline: 'none',
                width: '100%',
                fontSize: '13px'
              }}
            />
          </div>

          {activeTab === 'byok' && uniqueProviders.length > 0 && (
            <div style={{ position: 'relative', width: 170 }}>
              <select
                value={providerFilter}
                onChange={(e) => handleProviderFilterChange(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--color-card-bg)',
                  border: '1px solid var(--color-border)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  color: 'var(--color-text-main)',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Providers ({totalByokKeys})</option>
                {uniqueProviders.map((p) => (
                  <option key={p} value={p}>
                    {formatProviderName(p)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ─── TAB 1: GENERATED USER API KEYS ─── */}
      {activeTab === 'api' && (
        <div className={styles.tableContainer}>
          {/* Bulk Selection Action Bar */}
          {selectedApiKeys.size > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', background: 'rgba(124, 58, 237, 0.08)',
              borderBottom: '1px solid rgba(124, 58, 237, 0.25)', animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckSquare size={16} color="var(--color-primary)" />
                <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px' }}>
                  {selectedApiKeys.size} API key{selectedApiKeys.size > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedApiKeys(new Set())}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Clear selection
                </button>
              </div>
              <button
                onClick={handleBulkDeleteApiKeys}
                disabled={deletingBulkKeys}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)', padding: '7px 16px',
                  borderRadius: '8px', cursor: deletingBulkKeys ? 'default' : 'pointer',
                  fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px'
                }}
              >
                {deletingBulkKeys ? <Loader2 size={14} className="lucide-spin" /> : <Trash2 size={14} />} Revoke Selected
              </button>
            </div>
          )}

          {/* Top Pagination Bar */}
          <PaginationControl
            currentPage={safeApiPage}
            totalPages={totalApiPages}
            totalItems={totalApiCount}
            pageSize={pageSize}
            onPageChange={setApiPage}
            onPageSizeChange={handlePageSizeChange}
            position="top"
          />

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '60px', color: 'var(--color-text-muted)' }}>
              <Loader2 size={18} className="lucide-spin" /> Loading API keys…
            </div>
          ) : error && keys.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: 6 }}>Could not load keys</div>
              <div style={{ fontSize: '13px' }}>{error}</div>
            </div>
          ) : (
            <div className={styles.tableScroll}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={paginatedApiKeys.length > 0 && paginatedApiKeys.every(k => selectedApiKeys.has(k.id))}
                        onChange={(e) => {
                          const newSet = new Set(selectedApiKeys);
                          if (e.target.checked) {
                            paginatedApiKeys.forEach(k => newSet.add(k.id));
                          } else {
                            paginatedApiKeys.forEach(k => newSet.delete(k.id));
                          }
                          setSelectedApiKeys(newSet);
                        }}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                      />
                    </th>
                    <th>Key Name</th>
                    <th>API Key Prefix</th>
                    <th>Owner (User ID)</th>
                    <th>Plan</th>
                    <th>Created</th>
                    <th>Last Used</th>
                    <th>Balance</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApiKeys.map((k) => (
                    <tr key={k.id} style={{ background: selectedApiKeys.has(k.id) ? 'rgba(124, 58, 237, 0.06)' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedApiKeys.has(k.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedApiKeys);
                            if (e.target.checked) newSet.add(k.id);
                            else newSet.delete(k.id);
                            setSelectedApiKeys(newSet);
                          }}
                          style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Key size={14} color="var(--color-primary)" />
                          {k.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                          {k.id}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ background: 'var(--color-bg-soft)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>
                            {maskKey(k.prefix)}
                          </code>
                          <button
                            onClick={() => handleCopy(k.id, k.prefix)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                            title="Copy Key Prefix"
                          >
                            {copiedId === k.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                            <User size={12} color="var(--color-primary)" /> {k.userName || '—'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Mail size={10} /> {k.userEmail || '—'}
                            </span>
                            <code style={{ color: 'var(--color-text-muted)' }}>{k.userId}</code>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeActive}`}>
                          {k.plan || k.planApi || 'Free'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Calendar size={11} /> {formatDate(k.created)}
                        </div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Activity size={11} /> {formatDate(k.lastUsed)}
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                        ${Number(k.balance || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => openRevokeConfirm({ id: k.id, name: k.name, owner: k.userEmail || k.userId, isByok: false })}
                            disabled={deletingId === k.id}
                            style={{ border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                            title="Revoke / Delete Key"
                          >
                            {deletingId === k.id ? <Loader2 size={14} className="lucide-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedApiKeys.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                        {searchTerm ? `No API keys found matching "${searchTerm}"` : 'No API keys generated yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Pagination Bar */}
          <PaginationControl
            currentPage={safeApiPage}
            totalPages={totalApiPages}
            totalItems={totalApiCount}
            pageSize={pageSize}
            onPageChange={setApiPage}
            onPageSizeChange={handlePageSizeChange}
            position="bottom"
          />
        </div>
      )}

      {/* ─── TAB 2: BYOK (BRING YOUR OWN KEY) KEYS ─── */}
      {activeTab === 'byok' && (
        <div className={styles.tableContainer}>
          {/* Bulk Selection Action Bar */}
          {selectedByokKeys.size > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', background: 'rgba(124, 58, 237, 0.08)',
              borderBottom: '1px solid rgba(124, 58, 237, 0.25)', animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckSquare size={16} color="var(--color-primary)" />
                <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px' }}>
                  {selectedByokKeys.size} BYOK key{selectedByokKeys.size > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedByokKeys(new Set())}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Clear selection
                </button>
              </div>
              <button
                onClick={handleBulkDeleteByokKeys}
                disabled={deletingBulkKeys}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)', padding: '7px 16px',
                  borderRadius: '8px', cursor: deletingBulkKeys ? 'default' : 'pointer',
                  fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px'
                }}
              >
                {deletingBulkKeys ? <Loader2 size={14} className="lucide-spin" /> : <Trash2 size={14} />} Delete Selected
              </button>
            </div>
          )}

          {/* Top Pagination Bar */}
          <PaginationControl
            currentPage={safeByokPage}
            totalPages={totalByokPages}
            totalItems={totalByokCount}
            pageSize={pageSize}
            onPageChange={setByokPage}
            onPageSizeChange={handlePageSizeChange}
            position="top"
          />

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '60px', color: 'var(--color-text-muted)' }}>
              <Loader2 size={18} className="lucide-spin" /> Loading BYOK keys…
            </div>
          ) : error && byokKeys.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: 6 }}>Could not load BYOK keys</div>
              <div style={{ fontSize: '13px' }}>{error}</div>
            </div>
          ) : (
            <div className={styles.tableScroll}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={paginatedByokKeys.length > 0 && paginatedByokKeys.every(b => selectedByokKeys.has(b.id))}
                        onChange={(e) => {
                          const newSet = new Set(selectedByokKeys);
                          if (e.target.checked) {
                            paginatedByokKeys.forEach(b => newSet.add(b.id));
                          } else {
                            paginatedByokKeys.forEach(b => newSet.delete(b.id));
                          }
                          setSelectedByokKeys(newSet);
                        }}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                      />
                    </th>
                    <th>Provider</th>
                    <th>Masked API Key</th>
                    <th>User (Owner ID)</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Date Added</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedByokKeys.map((b) => (
                    <tr key={b.id} style={{ background: selectedByokKeys.has(b.id) ? 'rgba(124, 58, 237, 0.06)' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedByokKeys.has(b.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedByokKeys);
                            if (e.target.checked) newSet.add(b.id);
                            else newSet.delete(b.id);
                            setSelectedByokKeys(newSet);
                          }}
                          style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                        />
                      </td>
                      {/* Provider name in neat gray box styling as requested */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-main)',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em'
                          }}>
                            <Server size={13} color="var(--color-primary)" />
                            {formatProviderName(b.provider)}
                          </span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: '3px' }}>
                          {b.id}
                        </div>
                      </td>

                      {/* Masked Key */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{
                            background: 'var(--color-bg-soft)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            letterSpacing: '0.04em'
                          }}>
                            {b.masked || '••••••••••••'}
                          </code>
                          <button
                            onClick={() => handleCopy(b.id, b.masked)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                            title="Copy Masked Key"
                          >
                            {copiedId === b.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>

                      {/* User Owner Info */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                            <User size={12} color="var(--color-primary)" /> {b.userName || '—'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Mail size={10} /> {b.userEmail || '—'}
                            </span>
                            <code style={{ color: 'var(--color-text-muted)' }}>{b.userId}</code>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td>
                        <span className={`${styles.badge} ${styles.badgeActive}`}>
                          {b.plan || 'Free'}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                          background: b.status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                          color: b.status === 'active' ? '#10B981' : '#EAB308',
                          border: `1px solid ${b.status === 'active' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(234, 179, 8, 0.25)'}`
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: b.status === 'active' ? '#10B981' : '#EAB308'
                          }} />
                          {b.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </td>

                      {/* Date Added */}
                      <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Calendar size={11} /> {formatDate(b.added)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => openRevokeConfirm({
                              id: b.id,
                              name: `${formatProviderName(b.provider)} (${b.masked})`,
                              owner: b.userEmail || b.userId,
                              isByok: true
                            })}
                            disabled={deletingId === b.id}
                            style={{ border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                            title="Delete BYOK Key"
                          >
                            {deletingId === b.id ? <Loader2 size={14} className="lucide-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedByokKeys.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                        {searchTerm || providerFilter !== 'all'
                          ? 'No BYOK keys found matching the current filter'
                          : 'No BYOK keys added by users yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Pagination Bar */}
          <PaginationControl
            currentPage={safeByokPage}
            totalPages={totalByokPages}
            totalItems={totalByokCount}
            pageSize={pageSize}
            onPageChange={setByokPage}
            onPageSizeChange={handlePageSizeChange}
            position="bottom"
          />
        </div>
      )}

      {/* Footer Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, color: 'var(--color-text-muted)', fontSize: '12px' }}>
        <ShieldAlert size={14} color="var(--color-warning)" />
        {activeTab === 'api'
          ? 'Generated keys are stored securely hashed; only prefixes are recoverable. Revoking invalidates client credentials instantly.'
          : 'BYOK keys are stored encrypted/masked per user. Removing a provider key will halt that user’s BYOK routing for that specific provider.'}
      </div>

      {/* ================= MODAL: REVOKE / DELETE CONFIRMATION ================= */}
      {isConfirmRevokeOpen && keyToRevoke && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{
            background: 'var(--color-card-bg)', border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldAlert size={20} /> {keyToRevoke.isByok ? 'Delete BYOK Key?' : 'Revoke API Key?'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
              Are you sure you want to {keyToRevoke.isByok ? 'delete' : 'revoke'} the key <strong>"{keyToRevoke.name}"</strong> belonging to{' '}
              <strong>{keyToRevoke.owner}</strong>? The user will immediately lose access to this credential.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                className={styles.actionBtn}
                onClick={() => setIsConfirmRevokeOpen(false)}
                style={{ flex: 1, padding: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                style={{
                  flex: 1, padding: '10px', background: '#ef4444', color: '#fff',
                  border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Yes, {keyToRevoke.isByok ? 'Delete' : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}