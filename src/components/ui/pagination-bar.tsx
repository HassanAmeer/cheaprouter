'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  position?: 'top' | 'bottom';
  className?: string;
  style?: React.CSSProperties;
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemName = 'items',
  position = 'top',
  style
}: PaginationBarProps) {
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 20px',
        borderTop: position === 'bottom' ? '1px solid var(--color-border)' : 'none',
        borderBottom: position === 'top' ? '1px solid var(--color-border)' : 'none',
        background: 'var(--color-card-bg-2, rgba(255,255,255,0.02))',
        ...style
      }}
    >
      {/* Left side: Item count info & per-page selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Showing <strong style={{ color: 'var(--color-text-main)' }}>{startItem.toLocaleString()}</strong>–<strong style={{ color: 'var(--color-text-main)' }}>{endItem.toLocaleString()}</strong> of <strong style={{ color: 'var(--color-text-main)' }}>{totalItems.toLocaleString()}</strong> {itemName}
        </div>

        {onPageSizeChange && pageSizeOptions.length > 0 && (
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
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}{opt === 50 ? ' (Max)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
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
          disabled={currentPage >= totalPages || totalPages === 0}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '8px',
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-main)',
            opacity: currentPage >= totalPages || totalPages === 0 ? 0.35 : 1,
            cursor: currentPage >= totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s'
          }}
          title="Next Page"
        >
          <ChevronRight size={15} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || totalPages === 0}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '8px',
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-main)',
            opacity: currentPage >= totalPages || totalPages === 0 ? 0.35 : 1,
            cursor: currentPage >= totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
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
