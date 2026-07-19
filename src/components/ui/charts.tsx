'use client';

import React from 'react';

/* ---------- Bar Chart ---------- */
export function BarChart({
  data,
  height = 220,
  color = 'var(--color-primary)',
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height, padding: '16px 8px', borderBottom: '2px solid var(--color-border)', borderLeft: '2px solid var(--color-border)' }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
          <span style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{d.value}</span>
          <div
            title={`${d.label}: ${d.value}`}
            style={{ width: '100%', height: `${(d.value / max) * 100}%`, background: color, borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height 0.4s ease' }}
          />
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Area / Line Chart ---------- */
export function AreaChart({
  data,
  height = 240,
  color = 'var(--color-primary)',
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 600;
  const h = height;
  const pad = 20;
  const stepX = (w - pad * 2) / (data.length - 1);
  const points = data.map((d, i) => [pad + i * stepX, h - pad - (d.value / max) * (h - pad * 2)]);
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L ${points[points.length - 1][0].toFixed(1)} ${h - pad} L ${points[0][0].toFixed(1)} ${h - pad} Z`;
  const id = React.useId();

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" role="img">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={color} />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginTop: 8 }}>
        {data.map((d) => (
          <span key={d.label} style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Donut Chart ---------- */
export function DonutChart({
  data,
  size = 180,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 16;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--color-border)" strokeWidth="18" />
        {data.map((d, i) => {
          const len = (d.value / total) * circ;
          const seg = (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="18"
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${c} ${c})`}
            />
          );
          offset += len;
          return seg;
        })}
        <text x={c} y={c - 4} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--color-text-main)">{total}</text>
        <text x={c} y={c + 16} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)">total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color, display: 'inline-block' }} />
            {d.label} <strong style={{ marginLeft: 'auto' }}>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
