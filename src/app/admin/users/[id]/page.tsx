'use client';
import React, { useState, useEffect } from 'react';
import {
  Save, Ban, CheckCircle, Mail, Key, User, Calendar, Activity,
  Zap, HardDrive, Shield, AlertTriangle, Camera, Target, Globe, Clock, Cpu,
  Fingerprint, Monitor, Wifi, Award, GraduationCap, Copy, Check, Layout, Compass,
  Languages, Maximize, Palette, Scan, Mouse, Signal, ArrowDown, Dot,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

const USECASE_LABELS: Record<string, string> = {
  'vibe-coding': 'Vibe Coding',
  'website-builder': 'Website Builder',
  agents: 'Chat agents',
  chat: 'Chat',
  api: 'API',
  cli: 'CLI',
  ide: 'IDE',
  extension: 'Extension',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  'not-programmer': 'Non-Developer',
};

const GOAL_LABELS: Record<string, string> = {
  coding: 'Coding',
  chats: 'Chats',
  agents: 'Agents',
  apis: 'APIs',
  resellers: 'Reseller',
  affiliate: 'Affiliate',
  earn: 'Earning',
  free: 'Free use',
};

const DEVICE_LABELS: Record<string, string> = {
  os: 'Operating System',
  platform: 'Platform',
  browser: 'Browser',
  userAgent: 'User Agent',
  language: 'Language',
  timeZone: 'Time Zone',
  cpuCores: 'CPU Cores',
  deviceMemoryGB: 'Memory (GB)',
  screenResolution: 'Screen Resolution',
  screenColorDepth: 'Color Depth',
  devicePixelRatio: 'Pixel Ratio',
  touchPoints: 'Touch Points',
  online: 'Online',
  connectionType: 'Connection Type',
  connectionEffectiveType: 'Network (Effective)',
  downlinkMbps: 'Downlink (Mbps)',
  rttMs: 'Latency (RTT ms)',
  saveData: 'Save Data',
};

const DEVICE_GROUPS: { label: string; icon: React.ReactNode; accent: string; keys: string[] }[] = [
  { label: 'System', icon: <Monitor size={13} />, accent: '#8B5CF6', keys: ['os', 'platform', 'browser', 'language', 'timeZone'] },
  { label: 'Hardware', icon: <Cpu size={13} />, accent: '#0EA5E9', keys: ['cpuCores', 'deviceMemoryGB', 'screenResolution', 'screenColorDepth', 'devicePixelRatio', 'touchPoints'] },
  { label: 'Network', icon: <Wifi size={13} />, accent: '#10B981', keys: ['online', 'connectionType', 'connectionEffectiveType', 'downlinkMbps', 'rttMs', 'saveData'] },
];

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  os: <Monitor size={14} />, platform: <Layout size={14} />, browser: <Compass size={14} />,
  language: <Languages size={14} />, timeZone: <Clock size={14} />,
  cpuCores: <Cpu size={14} />, deviceMemoryGB: <HardDrive size={14} />, screenResolution: <Maximize size={14} />,
  screenColorDepth: <Palette size={14} />, devicePixelRatio: <Scan size={14} />, touchPoints: <Mouse size={14} />,
  online: <Zap size={14} />, connectionType: <Wifi size={14} />, connectionEffectiveType: <Signal size={14} />,
  downlinkMbps: <ArrowDown size={14} />, rttMs: <Activity size={14} />, saveData: <Save size={14} />,
  userAgent: <Globe size={14} />,
};

const TIER_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2 };

function parseHardwareInfo(raw: any): Record<string, any> | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
}

function formatDeviceValue(value: any): string {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function tierMeta(plan?: string): { label: string; bg: string; fg: string } {
  const p = (plan || 'Free').toLowerCase();
  if (p === 'pro') return { label: 'Pro', bg: 'var(--color-primary)', fg: '#fff' };
  if (p === 'starter') return { label: 'Starter', bg: 'rgba(217, 119, 6, 0.12)', fg: '#D97706' };
  return { label: 'Free', bg: 'var(--color-bg-soft)', fg: 'var(--color-text-muted)' };
}

function tierRank(plan?: string): number {
  return TIER_RANK[(plan || 'Free').toLowerCase()] ?? 0;
}

function SectionHead({ icon, title, subtitle, badge, badgeIcon, badgeBg, badgeBorder, badgeFg }: { icon: React.ReactNode; title: string; subtitle?: string; badge?: string; badgeIcon?: React.ReactNode; badgeBg?: string; badgeBorder?: string; badgeFg?: string }) {
  return (
    <div className="secHead" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px dashed var(--color-border)' }}>
      <div className="secIcon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 44, height: 44, borderRadius: 14 }}>{icon}</div>
      <div className="secHeadTxt" style={{ flex: 1 }}>
        <h3 className="secTitle" style={{ margin: 0 }}>{title}</h3>
        {subtitle && <div className="secSub" style={{ marginTop: '4px' }}>{subtitle}</div>}
      </div>
      {badge && (
        <span className="secBadge" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginLeft: 'auto', padding: '5px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: badgeBg || 'var(--color-primary-soft)', color: badgeFg || 'var(--color-primary)', border: badgeBorder || '1px solid transparent' }}>
          {badgeIcon}
          {badge}
        </span>
      )}
    </div>
  );
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUser({ ...user, profile_picture: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const copyId = () => {
    if (!user) return;
    navigator.clipboard?.writeText(user.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }).catch(() => {});
  };

  useEffect(() => {
    Promise.resolve(params).then(p => {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      fetch(`/api/admin/users/${p.id}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
        .then(res => {
          if (!res.ok) return null;
          const ct = res.headers.get('content-type');
          if (ct && ct.includes('application/json')) {
            return res.json().catch(() => null);
          }
          return null;
        })
        .then(data => {
          if (data && data.user) setUser(data.user);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    });
  }, [params]);

  const handleToggleBan = async () => {
    if (!user) return;
    const updatedStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const action = updatedStatus === 'Suspended' ? 'suspended' : 'activated';
    try {
      const res = await Promise.resolve(params).then(p =>
        fetch(`/api/admin/users/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
          body: JSON.stringify({ ...user, status: updatedStatus })
        })
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      if (data.user) setUser(data.user);
      toast(`User ${action} successfully`, 'success');
    } catch (err: any) {
      console.error(err);
      toast(err.message ?? `Failed to ${action.replace('d', '')} user`, 'error');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let finalUser = { ...user };
      if (profileFile) {
        try {
          const formData = new FormData();
          formData.append('file', profileFile);
          const uploadRes = await fetch('/api/upload/profile', {
            method: 'POST',
            body: formData,
            headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` },
          });
          if (!uploadRes.ok) throw new Error('Failed to upload profile picture');
          const uploadData = await uploadRes.json();
          finalUser.profile_picture = uploadData.url;
        } catch (uploadErr: any) {
          setSaving(false);
          toast(uploadErr.message ?? 'Failed to upload profile picture', 'error');
          return;
        }
      }
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const res = await Promise.resolve(params).then(p =>
        fetch(`/api/admin/users/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
          body: JSON.stringify(finalUser)
        })
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Save failed (${res.status})`);
      }
      if (data.user) setUser(data.user);
      toast('User details saved successfully', 'success');
    } catch (err: any) {
      console.error(err);
      toast(err.message ?? 'Failed to save user details', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500 }}>Loading User Details...</span>
                          <style jsx>{`.page { position: relative; padding-bottom: 80px; background: radial-gradient(1100px 520px at 78% -6%, var(--color-primary-soft), transparent 65%), radial-gradient(900px 480px at 2% -12%, rgba(139, 92, 246, 0.12), transparent 55%), var(--color-bg); min-height: 100vh; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .pageInner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 28px 24px 0; }

        /* ─── PAGE HEAD ─── */
        .pageHead { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 28px; }
        .crumb { font-size: 13px; font-weight: 500; color: var(--color-text-muted); display: flex; align-items: center; gap: 8px; }
        .crumbLink { color: var(--color-primary); text-decoration: none; font-weight: 600; }
        .crumbLink:hover { text-decoration: underline; }
        .crumb b { color: var(--color-text-main); font-weight: 600; }
        .crumbSep { width: 4px; height: 4px; border-radius: 50%; background: var(--color-border); }
        .pageTitle { font-size: 30px; font-weight: 800; color: var(--color-text-main); margin: 6px 0 4px; letter-spacing: -0.03em; }
        .pageSub { font-size: 14px; color: var(--color-text-muted); }

        .saveBtn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 12px;
          background: var(--color-primary); color: #ffffff;
          border: 1px solid var(--color-primary);
          font-weight: 700; font-size: 14px; cursor: pointer;
          box-shadow: 0 4px 14px var(--color-primary-soft);
          transition: all 0.2s ease;
        }
        .saveBtn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px var(--color-primary-soft); filter: brightness(1.05); }
        .saveBtn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ─── PROFILE GRID ─── */
        .profileGrid { display: grid; grid-template-columns: 320px 1fr; gap: 28px; align-items: start; }

        /* ─── RAIL ─── */
        .profileRail { display: flex; flex-direction: column; gap: 24px; position: sticky; top: 20px; }

        .railCard {
          background: var(--color-card-bg); border: 1px solid var(--color-border);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 12px 32px rgba(0,0,0,0.06);
        }
        .railCover {
          position: relative; height: 96px;
          background: #EA580C;
          opacity: 0.5;
          overflow: hidden;
        }
        .railCover::after {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1.5px);
          background-size: 22px 22px;
          -webkit-mask-image: radial-gradient(circle at 60% 40%, black 0%, transparent 80%);
          mask-image: radial-gradient(circle at 60% 40%, black 0%, transparent 80%);
        }
        .coverWatermark { position: absolute; right: 12px; bottom: -18px; font-size: 90px; font-weight: 900; line-height: 1; color: rgba(255,255,255,0.12); pointer-events: none; user-select: none; }
        .coverPlan {
          position: absolute; top: 14px; left: 16px; z-index: 3;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 999px;
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2); backdrop-filter: blur(8px);
        }

        .railBody { padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .avatarWrap { position: relative; margin-top: -52px; }
        .avatarBox {
          width: 104px; height: 104px; border-radius: 28px;
          background: linear-gradient(135deg, var(--color-card-bg) 0%, var(--color-bg-soft) 100%); color: var(--color-primary);
          border: 3px solid var(--color-card-bg);
          box-shadow: 0 12px 28px rgba(0,0,0,0.16);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 38px; overflow: hidden; position: relative;
          transition: all 0.3s ease;
        }
        .avatarBox::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(135deg, var(--color-primary-soft) 0%, transparent 55%); opacity: 0.4; }
        .avatarBox:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(0,0,0,0.2); }
        .statusDot { position: absolute; right: 2px; bottom: 2px; width: 20px; height: 20px; border-radius: 9px; border: 3px solid var(--color-card-bg); }
        .cameraBtn { position: absolute; right: -4px; top: -4px; width: 32px; height: 32px; border-radius: 50%; background: var(--color-card-bg); color: var(--color-text-main); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 1px solid var(--color-border); transition: all 0.2s ease; }
        .cameraBtn:hover { background: var(--color-bg-soft); transform: scale(1.05); }

        .railName { margin: 14px 0 8px; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: var(--color-text-main); line-height: 1.15; }
        .statusPill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }
        .statusPillDot { width: 6px; height: 6px; border-radius: 50%; box-shadow: 0 0 6px currentColor; }
        .obBadge { display: inline-flex; align-items: center; gap: 6px; align-self: flex-end; margin-top: 10px; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }

        .railMeta { width: 100%; margin-top: 18px; border-top: 1px dashed var(--color-border); }
        .railMetaRow { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 0; border-bottom: 1px dashed var(--color-border); background: none; border-left: none; border-right: none; border-top: none; cursor: default; font: inherit; text-align: left; color: inherit; }
        .railMetaRow:last-child { border-bottom: none; }
        .rMetaLabel { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; color: var(--color-text-muted); white-space: nowrap; }
        .rMetaValue { font-size: 13px; font-weight: 600; color: var(--color-text-main); text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rMetaId { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }
        .railIdRow { cursor: pointer; transition: all 0.2s ease; }
        .railIdRow:hover .rMetaLabel { color: var(--color-primary); }

        .railStats { width: 100%; margin-top: 6px; display: flex; flex-direction: column; gap: 10px; }
        .railStat { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 12px; }
        .railStatIcon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); }
        .railStatTxt { display: flex; flex-direction: column; gap: 2px; min-width: 0; text-align: left; }
        .railStatVal { font-size: 19px; font-weight: 800; color: var(--color-text-main); line-height: 1.1; letter-spacing: -0.01em; }
        .railStatLbl { font-size: 10px; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }

        .dangerCard {
          background: linear-gradient(180deg, rgba(239,68,68,0.05), var(--color-card-bg) 40%);
          border: 1px solid rgba(239, 68, 68, 0.25); border-top: 3px solid #ef4444;
          border-radius: 20px; padding: 22px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.05);
        }
        .dangerHead { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed rgba(239, 68, 68, 0.2); }
        .dangerHead .secIcon { color: #ef4444; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); }
        .dangerDesc { font-size: 13px; color: var(--color-text-muted); line-height: 1.55; margin-bottom: 18px; }
        .dangerBtn { width: 100%; padding: 12px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s ease; }
        .dangerBtn:hover { transform: translateY(-1px); filter: brightness(1.05); }

        /* ─── MAIN ─── */
        .profileMain { display: flex; flex-direction: column; gap: 24px; min-width: 0; }

        /* ─── SECTIONS ─── */
        .section {
          background: var(--color-card-bg); border: 1px solid var(--color-border);
          border-radius: 20px; padding: 26px 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .section:hover { border-color: var(--color-primary-soft); box-shadow: 0 2px 6px rgba(0,0,0,0.05), 0 18px 44px var(--color-primary-soft); }
        .secHead { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px dashed var(--color-border); }
        .secIcon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--color-primary-soft), var(--color-card-bg)); color: var(--color-primary); border: 1px solid var(--color-primary-soft); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6); }
        .secHeadTxt { flex: 1; }
        .secTitle { font-size: 18px; font-weight: 700; color: var(--color-text-main); margin: 0; letter-spacing: -0.01em; }
        .secSub { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
        .secBadge { display: inline-flex; align-items: center; gap: 5px; margin-left: auto; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); }

        /* ─── FIELDS ─── */
        .formGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        .fieldSpan { grid-column: 1 / -1; }
        .fieldLabel { font-size: 12px; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }
        .input, .readBox {
          width: 100%; background: var(--color-bg);
          border: 1px solid var(--color-border); padding: 12px 16px;
          border-radius: 12px; color: var(--color-text-main); font-size: 14px;
          outline: none; transition: all 0.2s ease; box-shadow: 0 1px 0 rgba(0,0,0,0.02);
        }
        .input:hover { border-color: var(--color-text-muted); }
        .input:focus, select:focus { border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-soft); background: var(--color-card-bg); }

        .readBoxRow { display: flex; align-items: center; gap: 10px; }
        .readBoxChips { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 14px; }
        .readBoxMono { font-family: ui-monospace, monospace; font-size: 13px; }
        .dotGood { width: 8px; height: 8px; border-radius: 50%; }
        .emptyText { color: var(--color-text-muted); font-style: italic; }
        .chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; background: var(--color-primary-soft); border: 1px solid var(--color-border); font-size: 13px; font-weight: 600; color: var(--color-text-main); }

        /* ─── PREFERENCES ─── */
        .prefGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .prefCard { display: flex; align-items: flex-start; gap: 14px; padding: 18px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 14px; transition: all 0.2s ease; }
        .prefCard:hover { border-color: var(--color-primary-soft); box-shadow: 0 4px 14px rgba(0,0,0,0.05); }
        .prefSpan { grid-column: 1 / -1; }
        .prefIcon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); }
        .prefTxt { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
        .prefLabel { font-size: 11px; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }
        .prefValue { font-size: 14px; color: var(--color-text-main); font-weight: 600; display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .prefChips { display: flex; flex-wrap: wrap; gap: 8px; }

        /* ─── DEVICE ─── */
        .groupLabel { font-size: 12px; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 22px 0 12px; display: flex; align-items: center; gap: 8px; }
        .groupLabel:first-child { margin-top: 0; }
        .groupChip { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 8px; border: 1px solid; color: inherit; flex-shrink: 0; }
        .groupCount { margin-left: auto; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 999px; background: var(--color-bg); border: 1px solid var(--color-border); color: var(--color-text-muted); }
        .deviceGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .deviceTile { display: flex; flex-direction: column; gap: 7px; padding: 14px 16px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 12px; transition: all 0.2s ease; position: relative; }
        .deviceTile:hover { border-color: color-mix(in srgb, var(--tile-accent) 55%, transparent); box-shadow: 0 4px 14px -6px color-mix(in srgb, var(--tile-accent) 35%, transparent); transform: translateY(-1px); }
        .deviceTile .deviceIcon { width: 22px; height: 22px; border-radius: 7px; background: color-mix(in srgb, var(--tile-accent) 14%, transparent); color: var(--tile-accent); display: inline-flex; align-items: center; justify-content: center; font-style: normal; flex-shrink: 0; }
        .deviceLabel { font-size: 11px; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px; }
        .deviceValue { font-size: 14px; color: var(--color-text-main); font-weight: 600; word-break: break-word; }
        .deviceValueMono { font-family: ui-monospace, monospace; font-size: 12px; color: var(--color-text-muted); font-weight: 500; word-break: break-word; }
        .emptyState { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; padding: 34px 20px; border: 1px dashed var(--color-border); border-radius: 16px; }
        .deviceEmpty { font-size: 13px; color: var(--color-text-muted); padding: 16px 18px; border: 1px dashed var(--color-border); border-radius: 12px; font-style: italic; }
        .emptyStateIcon { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
        .emptyStateTitle { font-size: 14px; font-weight: 700; color: var(--color-text-main); }
        .emptyStateHint { font-size: 13px; color: var(--color-text-muted); max-width: 320px; line-height: 1.5; }

        /* ─── PLANS ─── */
        .planStack { display: flex; flex-direction: column; gap: 16px; }
        .planRow { border: 1px solid var(--color-border); border-radius: 16px; padding: 20px 22px; background: linear-gradient(180deg, var(--color-card-bg), var(--color-bg)); position: relative; }
        .planRow::before { content: ''; position: absolute; left: -1px; top: 18px; bottom: 18px; width: 4px; border-radius: 4px; background: var(--plan-accent, var(--color-primary)); }
        .planRowHead { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .planIcon { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); }
        .planName { font-size: 16px; font-weight: 700; color: var(--color-text-main); }
        .planBadge { margin-left: auto; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); }
        .planGrid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

        /* ─── OVERVIEW ─── */
        .overviewCard {
          background: var(--color-card-bg); border: 1px solid var(--color-border);
          border-top: 3px solid var(--color-primary);
          border-radius: 20px; padding: 26px 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .overviewCard:hover { border-color: var(--color-primary-soft); box-shadow: 0 2px 6px rgba(0,0,0,0.05), 0 18px 44px var(--color-primary-soft); }
        .overviewHead { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px dashed var(--color-border); }
        .ovIcon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--color-primary-soft), var(--color-card-bg)); color: var(--color-primary); border: 1px solid var(--color-primary-soft); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6); }
        .ovRow { display: flex; align-items: center; justify-content: space-between; padding: 13px 2px; }
        .ovRow + .ovRow { border-top: 1px dashed var(--color-border); }
        .ovLabel { font-size: 13px; color: var(--color-text-muted); display: flex; align-items: center; gap: 8px; }
        .ovValue { font-size: 14px; font-weight: 700; color: var(--color-text-main); }
        .ovBadge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }

        .metaRow { display: flex; align-items: center; justify-content: space-between; padding: 13px 2px; }
        .metaRow + .metaRow { border-top: 1px dashed var(--color-border); }
        .metaLabel { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-muted); }
        .metaValue { font-size: 14px; font-weight: 700; color: var(--color-text-main); }
        .metaField { display: flex; flex-direction: column; gap: 8px; margin-top: 18px; }
        .copyRow { cursor: pointer; transition: all 0.2s ease; }
        .copyRow:hover { border-color: var(--color-primary); }

        select { background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right 1rem top 50%; background-size: 0.65rem auto; appearance: none; }
        select option { background-color: var(--color-card-bg) !important; color: var(--color-text-main) !important; }

        @media (max-width: 1024px) {
          .profileGrid { grid-template-columns: 1fr; }
          .profileRail { position: static; }
          .railCard { max-width: 420px; }
        }
        @media (max-width: 768px) {
          .formGrid, .deviceGrid, .planGrid, .prefGrid { grid-template-columns: 1fr; }
          .pageHead { flex-direction: column; }
        }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--color-card-bg)', borderRadius: '20px', border: '1px solid var(--color-border)', margin: '40px 0' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <User size={32} color="var(--color-text-muted)" />
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>User Not Found</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>The user profile you are trying to view does not exist or has been removed.</p>
        <Link href="/admin/users" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 24px', borderRadius: '12px', fontWeight: 600 }}>
          Return to User Directory
        </Link>
      </div>
    );
  }

  const isActive = user.status === 'Active';
  const paidCount = ['plan_cli', 'plan_api', 'plan_chat', 'plan_agents'].filter(k => (user[k] || 'Free').toLowerCase() !== 'free').length;
  const joinedStr = user.joined
    || (user.created_at
      ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—');
  const lastLoginStr = user.last_login
    ? new Date(user.last_login).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never';
  const device = parseHardwareInfo(user.hardware_info);
  const DEVICE_ALIASES: Record<string, string> = {
    'deviceMemoryGB': 'deviceMemory',
    'cpuCores': 'hardwareConcurrency',
    'screenColorDepth': 'colorDepth',
  };
  const deviceGet = (k: string) => {
    const v = device?.[k];
    if (v !== undefined && v !== null && v !== '') return v;
    const alias = DEVICE_ALIASES[k];
    if (alias) {
      const av = device?.[alias];
      if (av !== undefined && av !== null && av !== '') return av;
    }
    return undefined;
  };

  const planDefs = [
    { key: 'cli', label: 'CLI', icon: <HardDrive size={15} />, plan: user.plan_cli || 'Free', start: user.plan_cli_start, expiry: user.plan_cli_expiry },
    { key: 'api', label: 'API', icon: <Zap size={15} />, plan: user.plan_api || 'Free', start: user.plan_api_start, expiry: user.plan_api_expiry },
    { key: 'chat', label: 'Chat', icon: <Mail size={15} />, plan: user.plan_chat || 'Free', start: user.plan_chat_start, expiry: user.plan_chat_expiry },
    { key: 'agents', label: 'Websites', icon: <Shield size={15} />, plan: user.plan_agents || 'Free', start: user.plan_agents_start, expiry: user.plan_agents_expiry },
  ];
  const overallPlan = planDefs.reduce((best, p) => (tierRank(p.plan) > tierRank(best.plan) ? p : best), { plan: 'Free' }).plan;
  const overallTier = tierMeta(overallPlan);
  const initial = (user.name || '?')[0]?.toUpperCase() || '?';
  const osLabel = deviceGet('os');
  const useCases = (user.use_cases || '').split(',').map((u: string) => u.trim()).filter(Boolean);

  const STAT_TONES = {
    calls: { color: 'var(--color-primary)', bg: 'var(--color-primary-soft)' },
    plans: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
    onboarding: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
    lastLogin: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  };

  return (
    <div className="page">
      <div className="pageInner">

        {/* ─── PAGE HEADER ─── */}
        <header className="pageHead">
          <div>
            <div className="crumb"><Link href="/admin/users" className="crumbLink">Users</Link><span className="crumbSep">/</span><b>Profile</b></div>
            <h1 className="pageTitle">{user.name}</h1>
            <div className="pageSub">Review and manage this account's details</div>
          </div>
          <button className="saveBtn" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </header>

        <div className="profileGrid">

          {/* ─── PROFILE RAIL ─── */}
          <aside className="profileRail">

            <div className="railCard">
              <div className="railCover">
                <span className="coverPlan" style={{ background: overallTier.bg, color: overallTier.fg }}>
                  <Award size={14} /> {overallTier.label} Plan
                </span>
                <span className="coverWatermark">{initial}</span>
              </div>
              <div className="railBody">
                <div className="avatarWrap">
                  <div className="avatarBox">
                    {user.profile_picture ? (
                      <img src={user.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : initial}
                  </div>
                  <span className="statusDot" style={{ background: isActive ? '#10B981' : '#EF4444' }} />
                  <label className="cameraBtn">
                    <Camera size={14} />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                <h2 className="railName">{user.name}</h2>
                <span className="statusPill" style={{
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isActive ? '#10B981' : '#EF4444',
                  border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`
                }}>
                  <span className="statusPillDot" style={{ background: isActive ? '#10B981' : '#EF4444' }} />
                  {user.status}
                </span>

                <div className="railMeta">
                  <div className="railMetaRow">
                    <span className="rMetaLabel"><Mail size={14} /> Email</span>
                    <span className="rMetaValue">{user.email}</span>
                  </div>
                  <div className="railMetaRow">
                    <span className="rMetaLabel"><Calendar size={14} /> Joined</span>
                    <span className="rMetaValue">{joinedStr}</span>
                  </div>
                  {osLabel && osLabel !== 'Unknown' && (
                    <div className="railMetaRow">
                      <span className="rMetaLabel"><Monitor size={14} /> Device</span>
                      <span className="rMetaValue">{osLabel}</span>
                    </div>
                  )}
                  <button className="railMetaRow railIdRow" onClick={copyId} title="Copy user ID">
                    <span className="rMetaLabel"><Key size={14} /> User ID</span>
                    <span className="rMetaValue rMetaId">{user.id} {copied ? <Check size={13} style={{ color: '#10B981' }} /> : <Copy size={13} />}</span>
                  </button>
                </div>

                <div className="railStats">
                  <div className="railStat">
                    <span className="railStatIcon" style={{ background: STAT_TONES.calls.bg, color: STAT_TONES.calls.color }}><Activity size={15} /></span>
                    <div className="railStatTxt">
                      <span className="railStatVal">{(user.calls || 0).toLocaleString()}</span>
                      <span className="railStatLbl">API Calls</span>
                    </div>
                  </div>
                  <div className="railStat">
                    <span className="railStatIcon" style={{ background: STAT_TONES.plans.bg, color: STAT_TONES.plans.color }}><Zap size={15} /></span>
                    <div className="railStatTxt">
                      <span className="railStatVal">{paidCount}</span>
                      <span className="railStatLbl">Active Plans</span>
                    </div>
                  </div>
                  <div className="railStat">
                    <span className="railStatIcon" style={{ background: STAT_TONES.onboarding.bg, color: STAT_TONES.onboarding.color }}><Target size={15} /></span>
                    <div className="railStatTxt">
                      <span className="railStatVal">{user.onboarding_completed ? 'Done' : 'Pending'}</span>
                      <span className="railStatLbl">Onboarding</span>
                    </div>
                  </div>
                  <div className="railStat">
                    <span className="railStatIcon" style={{ background: STAT_TONES.lastLogin.bg, color: STAT_TONES.lastLogin.color }}><Clock size={15} /></span>
                    <div className="railStatTxt">
                      <span className="railStatVal">{lastLoginStr}</span>
                      <span className="railStatLbl">Last Login</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dangerCard">
              <div className="dangerHead">
                <div className="secIcon dangerIcon"><AlertTriangle size={18} /></div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.2px' }}>Danger Zone</h3>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Irreversible account actions</div>
                </div>
              </div>

              <p className="dangerDesc">
                Suspending this user will instantly revoke their API access and lock them out of the platform.
              </p>

              <button
                onClick={handleToggleBan}
                className="dangerBtn"
                style={{
                  background: isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: isActive ? '#ef4444' : '#10B981',
                  border: isActive ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                {isActive ? <><Ban size={16} /> Suspend Account</> : <><CheckCircle size={16} /> Reactivate Account</>}
              </button>
            </div>

          </aside>

          {/* ─── PROFILE MAIN ─── */}
          <main className="profileMain">
            <section className="section">
              <SectionHead icon={<User size={17} />} title="Identity Details" subtitle="Core account identity fields" />
              <div className="formGrid">
                <div className="field">
                  <label className="fieldLabel">Full Name</label>
                  <input type="text" className="input" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} />
                </div>
                <div className="field">
                  <label className="fieldLabel">Email Address</label>
                  <input type="email" className="input" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} />
                </div>
              </div>
            </section>

            {/* Onboarding / Preferences */}
            <section className="section">
              <SectionHead
                icon={<Target size={17} />}
                title="Onboarding Preferences"
                subtitle="Answered during onboarding after signup"
                badge={user.onboarding_completed ? 'Completed' : 'Pending'}
                badgeIcon={user.onboarding_completed ? <Check size={11} strokeWidth={3} /> : <Clock size={11} strokeWidth={3} />}
                badgeBg={user.onboarding_completed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'}
                badgeBorder={user.onboarding_completed ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)'}
                badgeFg={user.onboarding_completed ? '#10B981' : '#B45309'}
              />
              <div className="prefGrid">
                <div className="prefCard">
                  <span className="prefIcon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}><GraduationCap size={16} /></span>
                  <div className="prefTxt">
                    <span className="prefLabel">Student</span>
                    <span className="prefValue">
                      <span className="dotGood" style={{ background: user.is_student ? '#10B981' : 'var(--color-text-muted)' }} />
                      {user.is_student ? 'Yes, student discount applies' : 'No, standard account'}
                    </span>
                  </div>
                </div>
                <div className="prefCard">
                  <span className="prefIcon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6' }}><Cpu size={16} /></span>
                  <div className="prefTxt">
                    <span className="prefLabel">Programmer Level</span>
                    <span className="prefValue">{EXPERIENCE_LABELS[user.experience_level] ?? user.experience_level ?? 'Not specified'}</span>
                  </div>
                </div>
                <div className="prefCard prefSpan">
                  <span className="prefIcon" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}><Zap size={16} /></span>
                  <div className="prefTxt">
                    <span className="prefLabel">Wants to use</span>
                    <span className="prefChips">
                      {useCases.length > 0 ? (
                        useCases.map((u: string) => (
                          <span key={u} className="chip">{USECASE_LABELS[u] ?? u}</span>
                        ))
                      ) : (
                        <span className="emptyText">Not specified</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="prefCard">
                  <span className="prefIcon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' }}><Target size={16} /></span>
                  <div className="prefTxt">
                    <span className="prefLabel">Goal</span>
                    <span className="prefValue">{GOAL_LABELS[user.earning_goal] ?? user.earning_goal ?? 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* System & Hardware Info */}
            <section className="section">
              <SectionHead
                icon={<Cpu size={17} />}
                title="System & Hardware"
                subtitle="Captured at signup · device, system & network details"
                badge={device ? 'Detected' : 'Not captured'}
                badgeIcon={device ? <Check size={11} strokeWidth={3} /> : <AlertTriangle size={11} />}
                badgeBg={device ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'}
                badgeBorder={device ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)'}
                badgeFg={device ? '#10B981' : '#B45309'}
              />
              {!device ? (
                <div className="emptyState" style={{ color: 'var(--color-text-muted)' }}>
                  <div className="emptyStateIcon" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}><Cpu size={20} /></div>
                  <div className="emptyStateTitle">No device information captured</div>
                  <div className="emptyStateHint">This user signed up without fingerprint data, or the signal was too weak to record.</div>
                </div>
              ) : (
                <div>
                  {DEVICE_GROUPS.map(g => {
                    const rows = g.keys.filter(k => deviceGet(k) !== undefined && deviceGet(k) !== null && deviceGet(k) !== '');
                    return (
                      <div key={g.label}>
                        <div className="groupLabel" style={{ color: g.accent }}>
                          <span className="groupChip" style={{ background: `${g.accent}1a`, borderColor: `${g.accent}33` }}>{g.icon}</span>
                          {g.label}
                          <span className="groupCount">{rows.length > 0 ? `${rows.length} fields` : 'no data'}</span>
                        </div>
                        {rows.length > 0 ? (
                          <div className="deviceGrid">
                            {rows.map(k => (
                              <div className="deviceTile" key={k} style={{ ['--tile-accent' as any]: g.accent }}>
                                <span className="deviceLabel">
                                  <i className="deviceIcon">{DEVICE_ICONS[k] ?? <Dot size={8} />}</i>
                                  {DEVICE_LABELS[k] ?? k}
                                </span>
                                <span className={`deviceValue ${k === 'userAgent' ? 'deviceValueMono' : ''}`}>{formatDeviceValue(deviceGet(k))}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="deviceEmpty">No {g.label.toLowerCase()} details were recorded for this user.</div>
                        )}
                      </div>
                    );
                  })}
                  {deviceGet('userAgent') && (
                    <div>
                      <div className="groupLabel" style={{ color: '#8B5CF6' }}>
                        <span className="groupChip" style={{ background: '#8B5CF61a', borderColor: '#8B5CF633' }}><Globe size={12} /></span>
                        Browser
                        <span className="groupCount">detail</span>
                      </div>
                      <div className="deviceTile" style={{ ['--tile-accent' as any]: '#8B5CF6' }}>
                        <span className="deviceLabel"><i className="deviceIcon"><Globe size={14} /></i>User Agent</span>
                        <span className="deviceValue deviceValueMono">{deviceGet('userAgent')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Active Subscriptions */}
            <section className="section">
              <SectionHead icon={<Zap size={17} />} title="Active Subscriptions" subtitle="Plan tiers and access windows per product" />
              <div className="planStack">
                {planDefs.map(p => {
                  const tier = tierMeta(p.plan);
                  return (
                    <div className="planRow" key={p.key} style={{ ['--plan-accent' as any]: tier.fg }}>
                      <div className="planRowHead">
                        <span className="planIcon" style={{ background: tier.bg, color: tier.fg }}>{p.icon}</span>
                        <span className="planName">{p.label} Plan</span>
                        <span className="planBadge" style={{ background: tier.bg, color: tier.fg }}>{tier.label}</span>
                      </div>
                      <div className="planGrid">
                        <div className="field">
                          <label className="fieldLabel">Plan</label>
                          <select className="input" value={(p.plan || 'Free').toLowerCase()} onChange={e => setUser((prev: any) => ({ ...prev, [`plan_${p.key}`]: e.target.value }))}>
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="pro">Pro</option>
                          </select>
                        </div>
                        <div className="field">
                          <label className="fieldLabel">Start Date</label>
                          <input type="datetime-local" className="input" value={p.start ? p.start.slice(0, 16) : ''} onChange={e => setUser((prev: any) => ({ ...prev, [`plan_${p.key}_start`]: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
                        </div>
                        <div className="field">
                          <label className="fieldLabel">Expiry Date</label>
                          <input type="datetime-local" className="input" value={p.expiry ? p.expiry.slice(0, 16) : ''} onChange={e => setUser((prev: any) => ({ ...prev, [`plan_${p.key}_expiry`]: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          {/* Access Overview */}
            <div className="overviewCard">
              <div className="overviewHead">
                <div className="ovIcon"><Award size={17} /></div>
                <div>
                  <h3 className="secTitle">Account Overview</h3>
                  <div className="secSub">Standing at a glance</div>
                </div>
              </div>
              <div className="ovRow">
                <span className="ovLabel">Status</span>
                <span className="statusPill" style={{
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isActive ? '#10B981' : '#EF4444',
                  border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`
                }}>
                  <span className="statusPillDot" style={{ background: isActive ? '#10B981' : '#EF4444' }} />
                  {user.status}
                </span>
              </div>
              <div className="ovRow">
                <span className="ovLabel">Highest plan</span>
                <span className="planBadge" style={{ background: overallTier.bg, color: overallTier.fg }}>{overallTier.label}</span>
              </div>
              <div className="ovRow">
                <span className="ovLabel"><GraduationCap size={13} /> Student</span>
                <span className="ovValue" style={{ color: user.is_student ? '#10B981' : 'var(--color-text-muted)' }}>{user.is_student ? 'Discount' : 'No'}</span>
              </div>
              <div className="ovRow">
                <span className="ovLabel">Onboarding</span>
                <span className="ovBadge" style={{
                  background: user.onboarding_completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: user.onboarding_completed ? '#10B981' : 'var(--color-warning)',
                  border: `1px solid ${user.onboarding_completed ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`
                }}>
                  <Check size={12} strokeWidth={3} />
                  {user.onboarding_completed ? 'Completed' : 'Pending'}
                </span>
              </div>
              <div className="ovRow">
                <span className="ovLabel">Active products</span>
                <span className="ovValue">{paidCount} of {planDefs.length}</span>
              </div>
            </div>

            {/* Account Meta */}
            <section className="section">
              <SectionHead icon={<Fingerprint size={17} />} title="Account Meta" subtitle="Timestamps and access details" />

              <div className="metaRow">
                <span className="metaLabel"><Activity size={15} /> API Calls</span>
                <span className="metaValue" style={{ color: 'var(--color-primary)' }}>{(user.calls || 0).toLocaleString()}</span>
              </div>
              <div className="metaRow">
                <span className="metaLabel"><Key size={15} /> Member Since</span>
                <span className="metaValue">{joinedStr}</span>
              </div>

              <div className="metaField">
                <label className="fieldLabel"><Calendar size={12} /> Signup Date</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={user.created_at ? user.created_at.slice(0, 16) : ''}
                  onChange={e => setUser({ ...user, created_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </div>

              <div className="metaField">
                <label className="fieldLabel"><Clock size={12} /> Last Login</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={user.last_login ? user.last_login.slice(0, 16) : ''}
                  onChange={e => setUser({ ...user, last_login: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </div>

              <div className="metaField">
                <label className="fieldLabel"><Globe size={12} /> Signup IP Address</label>
                <div className="readBox readBoxMono">{user.last_ip || '—'}</div>
              </div>

              <div className="metaField">
                <label className="fieldLabel"><Fingerprint size={12} /> User ID</label>
                <button className="readBox readBoxMono copyRow" onClick={copyId} title="Click to copy">
                  {user.id} {copied ? <Check size={13} style={{ color: '#10B981', flexShrink: 0 }} /> : <Copy size={13} style={{ opacity: 0.5, flexShrink: 0 }} />}
                </button>
              </div>
            </section>

          </main>
        </div>
      </div>

                        <style jsx>{`.page { position: relative; padding-bottom: 80px; background: radial-gradient(1100px 520px at 78% -6%, var(--color-primary-soft), transparent 65%), radial-gradient(900px 480px at 2% -12%, rgba(139, 92, 246, 0.12), transparent 55%), var(--color-bg); min-height: 100vh; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .pageInner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 28px 24px 0; }

        /* ─── PAGE HEAD ─── */
        .pageHead { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 28px; }
        .crumb { font-size: 13px; font-weight: 500; color: var(--color-text-muted); display: flex; align-items: center; gap: 8px; }
        .crumbLink { color: var(--color-primary); text-decoration: none; font-weight: 600; }
        .crumbLink:hover { text-decoration: underline; }
        .crumb b { color: var(--color-text-main); font-weight: 600; }
        .crumbSep { width: 4px; height: 4px; border-radius: 50%; background: var(--color-border); }
        .pageTitle { font-size: 30px; font-weight: 800; color: var(--color-text-main); margin: 6px 0 4px; letter-spacing: -0.03em; }
        .pageSub { font-size: 14px; color: var(--color-text-muted); }

        .saveBtn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 12px;
          background: var(--color-primary); color: #ffffff;
          border: 1px solid var(--color-primary);
          font-weight: 700; font-size: 14px; cursor: pointer;
          box-shadow: 0 4px 14px var(--color-primary-soft);
          transition: all 0.2s ease;
        }
        .saveBtn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px var(--color-primary-soft); filter: brightness(1.05); }
        .saveBtn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ─── PROFILE GRID ─── */
        .profileGrid { display: grid; grid-template-columns: 320px 1fr; gap: 28px; align-items: start; }

        /* ─── RAIL ─── */
        .profileRail { display: flex; flex-direction: column; gap: 24px; position: sticky; top: 20px; }

        .railCard {
          background: var(--color-card-bg); border: 1px solid var(--color-border);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 12px 32px rgba(0,0,0,0.06);
        }
        .railCover {
          position: relative; height: 96px;
          background: #EA580C;
          opacity: 0.5;
          overflow: hidden;
        }
        .railCover::after {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1.5px);
          background-size: 22px 22px;
          -webkit-mask-image: radial-gradient(circle at 60% 40%, black 0%, transparent 80%);
          mask-image: radial-gradient(circle at 60% 40%, black 0%, transparent 80%);
        }
        .coverWatermark { position: absolute; right: 12px; bottom: -18px; font-size: 90px; font-weight: 900; line-height: 1; color: rgba(255,255,255,0.12); pointer-events: none; user-select: none; }
        .coverPlan {
          position: absolute; top: 14px; left: 16px; z-index: 3;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 999px;
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2); backdrop-filter: blur(8px);
        }

        .railBody { padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .avatarWrap { position: relative; margin-top: -52px; }
        .avatarBox {
          width: 104px; height: 104px; border-radius: 28px;
          background: linear-gradient(135deg, var(--color-card-bg) 0%, var(--color-bg-soft) 100%); color: var(--color-primary);
          border: 3px solid var(--color-card-bg);
          box-shadow: 0 12px 28px rgba(0,0,0,0.16);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 38px; overflow: hidden; position: relative;
          transition: all 0.3s ease;
        }
        .avatarBox::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(135deg, var(--color-primary-soft) 0%, transparent 55%); opacity: 0.4; }
        .avatarBox:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(0,0,0,0.2); }
        .statusDot { position: absolute; right: 2px; bottom: 2px; width: 20px; height: 20px; border-radius: 9px; border: 3px solid var(--color-card-bg); }
        .cameraBtn { position: absolute; right: -4px; top: -4px; width: 32px; height: 32px; border-radius: 50%; background: var(--color-card-bg); color: var(--color-text-main); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 1px solid var(--color-border); transition: all 0.2s ease; }
        .cameraBtn:hover { background: var(--color-bg-soft); transform: scale(1.05); }

        .railName { margin: 14px 0 8px; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: var(--color-text-main); line-height: 1.15; }
        .statusPill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }
        .statusPillDot { width: 6px; height: 6px; border-radius: 50%; box-shadow: 0 0 6px currentColor; }
        .obBadge { display: inline-flex; align-items: center; gap: 6px; align-self: flex-end; margin-top: 10px; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }

        .railMeta { width: 100%; margin-top: 18px; border-top: 1px dashed var(--color-border); }
        .railMetaRow { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 0; border-bottom: 1px dashed var(--color-border); background: none; border-left: none; border-right: none; border-top: none; cursor: default; font: inherit; text-align: left; color: inherit; }
        .railMetaRow:last-child { border-bottom: none; }
        .rMetaLabel { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; color: var(--color-text-muted); white-space: nowrap; }
        .rMetaValue { font-size: 13px; font-weight: 600; color: var(--color-text-main); text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rMetaId { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }
        .railIdRow { cursor: pointer; transition: all 0.2s ease; }
        .railIdRow:hover .rMetaLabel { color: var(--color-primary); }

        .railStats { width: 100%; margin-top: 6px; display: flex; flex-direction: column; gap: 10px; }
        .railStat { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 12px; }
        .railStatIcon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); }
        .railStatTxt { display: flex; flex-direction: column; gap: 2px; min-width: 0; text-align: left; }
        .railStatVal { font-size: 19px; font-weight: 800; color: var(--color-text-main); line-height: 1.1; letter-spacing: -0.01em; }
        .railStatLbl { font-size: 10px; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }

        .dangerCard {
          background: linear-gradient(180deg, rgba(239,68,68,0.05), var(--color-card-bg) 40%);
          border: 1px solid rgba(239, 68, 68, 0.25); border-top: 3px solid #ef4444;
          border-radius: 20px; padding: 22px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.05);
        }
        .dangerHead { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed rgba(239, 68, 68, 0.2); }
        .dangerHead .secIcon { color: #ef4444; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); }
        .dangerDesc { font-size: 13px; color: var(--color-text-muted); line-height: 1.55; margin-bottom: 18px; }
        .dangerBtn { width: 100%; padding: 12px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s ease; }
        .dangerBtn:hover { transform: translateY(-1px); filter: brightness(1.05); }

        /* ─── MAIN ─── */
        .profileMain { display: flex; flex-direction: column; gap: 24px; min-width: 0; }

        /* ─── SECTIONS ─── */
        .section {
          background: var(--color-card-bg); border: 1px solid var(--color-border);
          border-radius: 20px; padding: 26px 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .section:hover { border-color: var(--color-primary-soft); box-shadow: 0 2px 6px rgba(0,0,0,0.05), 0 18px 44px var(--color-primary-soft); }
        .secHead { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px dashed var(--color-border); }
        .secIcon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--color-primary-soft), var(--color-card-bg)); color: var(--color-primary); border: 1px solid var(--color-primary-soft); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6); }
        .secHeadTxt { flex: 1; }
        .secTitle { font-size: 18px; font-weight: 700; color: var(--color-text-main); margin: 0; letter-spacing: -0.01em; }
        .secSub { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
        .secBadge { display: inline-flex; align-items: center; gap: 5px; margin-left: auto; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); }

        /* ─── FIELDS ─── */
        .formGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        .fieldSpan { grid-column: 1 / -1; }
        .fieldLabel { font-size: 12px; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }
        .input, .readBox {
          width: 100%; background: var(--color-bg);
          border: 1px solid var(--color-border); padding: 12px 16px;
          border-radius: 12px; color: var(--color-text-main); font-size: 14px;
          outline: none; transition: all 0.2s ease; box-shadow: 0 1px 0 rgba(0,0,0,0.02);
        }
        .input:hover { border-color: var(--color-text-muted); }
        .input:focus, select:focus { border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-soft); background: var(--color-card-bg); }

        .readBoxRow { display: flex; align-items: center; gap: 10px; }
        .readBoxChips { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 14px; }
        .readBoxMono { font-family: ui-monospace, monospace; font-size: 13px; }
        .dotGood { width: 8px; height: 8px; border-radius: 50%; }
        .emptyText { color: var(--color-text-muted); font-style: italic; }
        .chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; background: var(--color-primary-soft); border: 1px solid var(--color-border); font-size: 13px; font-weight: 600; color: var(--color-text-main); }

        /* ─── PREFERENCES ─── */
        .prefGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .prefCard { display: flex; align-items: flex-start; gap: 14px; padding: 18px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 14px; transition: all 0.2s ease; }
        .prefCard:hover { border-color: var(--color-primary-soft); box-shadow: 0 4px 14px rgba(0,0,0,0.05); }
        .prefSpan { grid-column: 1 / -1; }
        .prefIcon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); }
        .prefTxt { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
        .prefLabel { font-size: 11px; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }
        .prefValue { font-size: 14px; color: var(--color-text-main); font-weight: 600; display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .prefChips { display: flex; flex-wrap: wrap; gap: 8px; }

        /* ─── DEVICE ─── */
        .groupLabel { font-size: 12px; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 22px 0 12px; display: flex; align-items: center; gap: 8px; }
        .groupLabel:first-child { margin-top: 0; }
        .groupChip { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 8px; border: 1px solid; color: inherit; flex-shrink: 0; }
        .groupCount { margin-left: auto; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 999px; background: var(--color-bg); border: 1px solid var(--color-border); color: var(--color-text-muted); }
        .deviceGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .deviceTile { display: flex; flex-direction: column; gap: 7px; padding: 14px 16px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 12px; transition: all 0.2s ease; position: relative; }
        .deviceTile:hover { border-color: color-mix(in srgb, var(--tile-accent) 55%, transparent); box-shadow: 0 4px 14px -6px color-mix(in srgb, var(--tile-accent) 35%, transparent); transform: translateY(-1px); }
        .deviceTile .deviceIcon { width: 22px; height: 22px; border-radius: 7px; background: color-mix(in srgb, var(--tile-accent) 14%, transparent); color: var(--tile-accent); display: inline-flex; align-items: center; justify-content: center; font-style: normal; flex-shrink: 0; }
        .deviceLabel { font-size: 11px; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px; }
        .deviceValue { font-size: 14px; color: var(--color-text-main); font-weight: 600; word-break: break-word; }
        .deviceValueMono { font-family: ui-monospace, monospace; font-size: 12px; color: var(--color-text-muted); font-weight: 500; word-break: break-word; }
        .emptyState { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; padding: 34px 20px; border: 1px dashed var(--color-border); border-radius: 16px; }
        .deviceEmpty { font-size: 13px; color: var(--color-text-muted); padding: 16px 18px; border: 1px dashed var(--color-border); border-radius: 12px; font-style: italic; }
        .emptyStateIcon { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
        .emptyStateTitle { font-size: 14px; font-weight: 700; color: var(--color-text-main); }
        .emptyStateHint { font-size: 13px; color: var(--color-text-muted); max-width: 320px; line-height: 1.5; }

        /* ─── PLANS ─── */
        .planStack { display: flex; flex-direction: column; gap: 16px; }
        .planRow { border: 1px solid var(--color-border); border-radius: 16px; padding: 20px 22px; background: linear-gradient(180deg, var(--color-card-bg), var(--color-bg)); position: relative; }
        .planRow::before { content: ''; position: absolute; left: -1px; top: 18px; bottom: 18px; width: 4px; border-radius: 4px; background: var(--plan-accent, var(--color-primary)); }
        .planRowHead { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .planIcon { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); }
        .planName { font-size: 16px; font-weight: 700; color: var(--color-text-main); }
        .planBadge { margin-left: auto; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); }
        .planGrid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

        /* ─── OVERVIEW ─── */
        .overviewCard {
          background: var(--color-card-bg); border: 1px solid var(--color-border);
          border-top: 3px solid var(--color-primary);
          border-radius: 20px; padding: 26px 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .overviewCard:hover { border-color: var(--color-primary-soft); box-shadow: 0 2px 6px rgba(0,0,0,0.05), 0 18px 44px var(--color-primary-soft); }
        .overviewHead { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px dashed var(--color-border); }
        .ovIcon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--color-primary-soft), var(--color-card-bg)); color: var(--color-primary); border: 1px solid var(--color-primary-soft); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6); }
        .ovRow { display: flex; align-items: center; justify-content: space-between; padding: 13px 2px; }
        .ovRow + .ovRow { border-top: 1px dashed var(--color-border); }
        .ovLabel { font-size: 13px; color: var(--color-text-muted); display: flex; align-items: center; gap: 8px; }
        .ovValue { font-size: 14px; font-weight: 700; color: var(--color-text-main); }
        .ovBadge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }

        .metaRow { display: flex; align-items: center; justify-content: space-between; padding: 13px 2px; }
        .metaRow + .metaRow { border-top: 1px dashed var(--color-border); }
        .metaLabel { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-muted); }
        .metaValue { font-size: 14px; font-weight: 700; color: var(--color-text-main); }
        .metaField { display: flex; flex-direction: column; gap: 8px; margin-top: 18px; }
        .copyRow { cursor: pointer; transition: all 0.2s ease; }
        .copyRow:hover { border-color: var(--color-primary); }

        select { background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right 1rem top 50%; background-size: 0.65rem auto; appearance: none; }
        select option { background-color: var(--color-card-bg) !important; color: var(--color-text-main) !important; }

        @media (max-width: 1024px) {
          .profileGrid { grid-template-columns: 1fr; }
          .profileRail { position: static; }
          .railCard { max-width: 420px; }
        }
        @media (max-width: 768px) {
          .formGrid, .deviceGrid, .planGrid, .prefGrid { grid-template-columns: 1fr; }
          .pageHead { flex-direction: column; }
        }`}</style>
    </div>
  );
}
