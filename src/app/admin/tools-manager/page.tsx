'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Terminal,
  Code,
  Zap,
  MessageSquare,
  Save,
  Loader2,
  Check,
  Clock,
  Radio,
  EyeOff,
} from 'lucide-react';
import { useSiteSettings } from '@/components/settings-provider';
import { ManagedTool, normalizeTools, ToolIconKey, ToolStatus } from '@/lib/tools';
import styles from './tools-manager.module.css';

const ICONS: Record<ToolIconKey, typeof Terminal> = {
  Terminal,
  Code,
  Zap,
  MessageSquare,
};

function CheckCircleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function ToolsManagerPage() {
  const { settings, refreshSettings } = useSiteSettings();
  const [tools, setTools] = useState<ManagedTool[]>(() => normalizeTools(undefined));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTools(normalizeTools(settings.toolsSettings?.tools));
  }, [settings]);

  const patch = (id: string, next: Partial<ManagedTool>) => {
    setTools((prev) => prev.map((tool) => (tool.id === id ? { ...tool, ...next } : tool)));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        // Only this editor's section — avoids clobbering concurrent saves elsewhere.
        body: JSON.stringify({ toolsSettings: { tools } }),
      });
      if (!res.ok) {
        setError('Could not save. Check your admin session and try again.');
        return;
      }
      await refreshSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Could not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const tally = useMemo(
    () => ({
      live: tools.filter((tool) => tool.enabled && tool.status === 'ready').length,
      soon: tools.filter((tool) => tool.enabled && tool.status === 'soon').length,
      hidden: tools.filter((tool) => !tool.enabled).length,
    }),
    [tools]
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tools Manager</h1>
          <p className={styles.subtitle}>
            Control the tool cards on the landing page. Switch a tool off to hide it, or mark it Coming
            Soon to show it as an announcement instead of a working link.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? (
            <Loader2 size={18} className="spin" />
          ) : saved ? (
            <CheckCircleIcon />
          ) : (
            <Save size={18} />
          )}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          style={{
            color: 'var(--color-primary)',
            fontSize: 14,
            fontWeight: 600,
            margin: '0 0 20px',
          }}
        >
          {error}
        </p>
      )}

      <div className={styles.tally}>
        <div className={styles.tallyCard}>
          <Radio size={22} color="#22c55e" aria-hidden="true" />
          <div>
            <div className={styles.tallyValue}>{tally.live}</div>
            <div className={styles.tallyLabel}>Live on the site</div>
          </div>
        </div>
        <div className={styles.tallyCard}>
          <Clock size={22} color="var(--color-text-muted)" aria-hidden="true" />
          <div>
            <div className={styles.tallyValue}>{tally.soon}</div>
            <div className={styles.tallyLabel}>Coming soon</div>
          </div>
        </div>
        <div className={styles.tallyCard}>
          <EyeOff size={22} color="var(--color-primary)" aria-hidden="true" />
          <div>
            <div className={styles.tallyValue}>{tally.hidden}</div>
            <div className={styles.tallyLabel}>Hidden</div>
          </div>
        </div>
      </div>

      <div className={styles.list}>
        {tools.map((tool) => {
          const Icon = ICONS[tool.icon] ?? Code;
          const rowState = !tool.enabled
            ? styles.rowOff
            : tool.status === 'soon'
              ? styles.rowSoon
              : '';

          return (
            <div key={tool.id} className={`${styles.row} ${rowState}`}>
              <div className={styles.iconTile}>
                <Icon size={22} aria-hidden="true" />
              </div>

              <div className={styles.meta}>
                <h2 className={styles.toolName}>{tool.name}</h2>
                <p className={styles.toolDesc}>{tool.description}</p>
                <span className={styles.toolId}>{tool.id}</span>
              </div>

              <div className={styles.controls}>
                <div className={styles.controlGroup}>
                  <span className={styles.controlLabel}>Availability</span>
                  <div
                    className={styles.seg}
                    role="group"
                    aria-label={`${tool.name} availability`}
                  >
                    <button
                      type="button"
                      aria-pressed={tool.status === 'ready'}
                      onClick={() => patch(tool.id, { status: 'ready' as ToolStatus })}
                      className={`${styles.segBtn} ${styles.segBtnReady} ${
                        tool.status === 'ready' ? styles.segBtnOn : ''
                      }`}
                    >
                      <Check size={14} aria-hidden="true" /> Ready
                    </button>
                    <button
                      type="button"
                      aria-pressed={tool.status === 'soon'}
                      onClick={() => patch(tool.id, { status: 'soon' as ToolStatus })}
                      className={`${styles.segBtn} ${styles.segBtnSoon} ${
                        tool.status === 'soon' ? styles.segBtnOn : ''
                      }`}
                    >
                      <Clock size={14} aria-hidden="true" /> Coming Soon
                    </button>
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <span className={styles.controlLabel}>On the landing page</span>
                  <div className={styles.switchRow}>
                    {/* Exactly the chip the landing page renders, so the admin sees the real state. */}
                    <span
                      className={`${styles.chip} ${
                        !tool.enabled
                          ? styles.chipSoon
                          : tool.status === 'ready'
                            ? styles.chipLive
                            : styles.chipSoon
                      }`}
                    >
                      {tool.enabled && tool.status === 'ready' ? (
                        <>
                          <span className={styles.liveDot} /> LIVE
                        </>
                      ) : (
                        <>
                          <Clock size={12} aria-hidden="true" />
                          {tool.enabled ? 'COMING SOON' : 'HIDDEN'}
                        </>
                      )}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={tool.enabled}
                      aria-label={`Show ${tool.name} on the landing page`}
                      onClick={() => patch(tool.id, { enabled: !tool.enabled })}
                      className={`${styles.switch} ${tool.enabled ? styles.switchOn : ''}`}
                    >
                      <span className={styles.switchKnob} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}