'use client';
import React, { useState, useEffect, useMemo } from 'react';
import s from './plan-settings.module.css';
import { 
  Save, Plus, X, Star, Zap, Check, Terminal, Hammer, 
  MessageSquare, Braces, Sparkles, Loader2, ArrowRight
} from 'lucide-react';
import { useSiteSettings, SiteSettings } from '@/components/settings-provider';
import { PricingPlan } from '@/lib/api-types';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)',
  padding: '10px 14px', borderRadius: '10px', color: 'var(--color-text-main)',
  fontSize: '14px', outline: 'none', transition: 'border-color .2s, box-shadow .2s'
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'block'
};

const DEFAULT_UNIFIED_PLANS: PricingPlan[] = [
  {
    id: 'plan_free',
    name: 'Free',
    price: '$0',
    period: '',
    desc: 'Essential access for personal development & learning',
    tokens: '10M Tokens/mo',
    tokensM: 10,
    tokenLimit: 10000000,
    includedModels: ['MiniMax-01 (10M context)', 'Llama 3.3 70B', 'Gemini 2.0 Flash', 'DeepSeek V3'],
    canUseCli: true,
    canUseIde: true,
    canUseChat: true,
    canUseApi: true,
    features: [
      '10M Tokens / month included',
      'Can use Cheap CLI & terminal coding tools',
      'Can use Cheap Chats (web interface)',
      'Can use IDE Builder (Devonz code editor)',
      'Can use Direct REST API (/v1/chat/completions)',
      'Free Models: MiniMax-01 (10M context), Llama 3.3 70B, Gemini 2.0 Flash',
      'Community Support',
    ],
    cta: 'Get Started Free',
    ctaLink: '/signup',
    featured: false,
    durationDays: 30,
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    price: '$19',
    period: '/mo',
    desc: 'High-throughput access for builders, developers & power users',
    tokens: '100M Tokens/mo',
    tokensM: 100,
    tokenLimit: 100000000,
    includedModels: ['GPT-4o Mini', 'Claude 3.5 Haiku', 'DeepSeek R1', 'Llama 3.3 70B', 'MiniMax-01'],
    canUseCli: true,
    canUseIde: true,
    canUseChat: true,
    canUseApi: true,
    features: [
      '100M Tokens / month included',
      'Can use Cheap CLI (Claude Code, Aider, Cursor)',
      'Can use Cheap Chats with full history & branching',
      'Can use IDE Builder with real-time code fixes',
      'Can use Direct REST API with elevated rate limits',
      'Pro Models: GPT-4o Mini, Claude 3.5 Haiku, DeepSeek R1, MiniMax',
      'Faster priority routing & lower latency',
      'Priority Email Support',
    ],
    cta: 'Upgrade to Pro',
    ctaLink: '/dashboard/billing',
    featured: true,
    durationDays: 30,
  },
  {
    id: 'plan_premium',
    name: 'Premium',
    price: '$49',
    period: '/mo',
    desc: 'Maximum tokens, frontier reasoning models & production-grade scale',
    tokens: '500M Tokens/mo',
    tokensM: 500,
    tokenLimit: 500000000,
    includedModels: ['GPT-4o', 'Claude 3.5 Sonnet', 'DeepSeek R1', 'o1-preview', 'Gemini 2.0 Flash'],
    canUseCli: true,
    canUseIde: true,
    canUseChat: true,
    canUseApi: true,
    features: [
      '500M Tokens / month included',
      'Can use Cheap CLI with unlimited concurrent sessions',
      'Can use Cheap Chats with multi-agent debate mode',
      'Can use IDE Builder with full project codebase context',
      'Can use Direct REST API with dedicated rate limits',
      'Flagship Models: Claude 3.5 Sonnet, GPT-4o, DeepSeek R1, o1-preview',
      'Dedicated routing queues with zero rate-limit drops',
      '24/7 Priority engineering support',
    ],
    cta: 'Upgrade to Premium',
    ctaLink: '/dashboard/billing',
    featured: false,
    durationDays: 30,
  },
];

export default function PlanSettingsPage() {
  const { settings, refreshSettings } = useSiteSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string>('plan_free');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [customModelInput, setCustomModelInput] = useState('');
  const [selectedDropdownModel, setSelectedDropdownModel] = useState('');

  // Fetch available AI models from backend registry
  useEffect(() => {
    api.models()
      .then((res: any) => {
        if (res?.models) {
          const list: string[] = [];
          Object.entries(res.models).forEach(([_, mList]: [string, any]) => {
            if (Array.isArray(mList)) {
              mList.forEach((m: any) => {
                if (m.name && !list.includes(m.name)) list.push(m.name);
                else if (m.id && !list.includes(m.id)) list.push(m.id);
              });
            }
          });
          setAvailableModels(list.sort());
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  // Extract or initialize the 3 unified plans
  const plans: PricingPlan[] = useMemo(() => {
    const rawPlans = formData.pricingSection?.plans;
    if (rawPlans && rawPlans.length > 0) return rawPlans;
    const legacyPlans = formData.pricingSection?.tabs?.[0]?.plans;
    if (legacyPlans && legacyPlans.length > 0) return legacyPlans;
    return DEFAULT_UNIFIED_PLANS;
  }, [formData.pricingSection]);

  const activePlan = plans.find(p => p.id === activePlanId) || plans[0] || DEFAULT_UNIFIED_PLANS[0];

  const updatePlans = (newPlans: PricingPlan[]) => {
    setFormData({
      ...formData,
      pricingSection: {
        ...(formData.pricingSection || { title: '', subtitle: '' }),
        plans: newPlans,
        tabs: [
          {
            id: 'tab_unified',
            name: 'All Access',
            plans: newPlans,
          }
        ]
      }
    });
  };

  const updateActivePlan = (patch: Partial<PricingPlan>) => {
    const newPlans = plans.map(p => {
      if (p.id === activePlan.id) {
        const updated = { ...p, ...patch };
        // Sync tokens string if tokensM changed
        if (patch.tokensM !== undefined) {
          updated.tokens = `${patch.tokensM}M Tokens/mo`;
          updated.tokenLimit = patch.tokensM * 1000000;
        }
        return updated;
      }
      return p;
    });
    updatePlans(newPlans);
  };

  const addModelToActivePlan = (modelName: string) => {
    const trimmed = modelName.trim();
    if (!trimmed) return;
    const current = activePlan.includedModels || [];
    if (!current.includes(trimmed)) {
      updateActivePlan({ includedModels: [...current, trimmed] });
    }
    setCustomModelInput('');
    setSelectedDropdownModel('');
  };

  const removeModelFromActivePlan = (modelName: string) => {
    const current = activePlan.includedModels || [];
    updateActivePlan({ includedModels: current.filter(m => m !== modelName) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        pricingSection: {
          title: formData.pricingSection?.title || 'Simple, honest pricing',
          subtitle: formData.pricingSection?.subtitle || 'Transparent per-token plans. Access CLI, IDE Builder, Cheap Chats, and REST APIs with a single unified subscription.',
          plans: plans,
          tabs: [
            {
              id: 'tab_unified',
              name: 'All Access',
              plans: plans,
            }
          ]
        }
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaved(true);
        refreshSettings();
        toast('Unified plans saved successfully');
        setTimeout(() => setSaved(false), 2500);
      } else {
        toast('Failed to save settings', 'error');
      }
    } catch (e: any) {
      toast(e?.message || 'Failed to save settings', 'error');
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* ─── HEADER ROW ─── */}
      <div className={s.headerRow}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: 'var(--color-text-main)' }}>
              Plan & Pricing Management
            </h1>
            <span style={{ 
              fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px',
              background: 'var(--color-primary-soft)', color: 'var(--color-primary)'
            }}>
              Unified Token Plans
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
            Configure the 3 core plans (Free, Pro, Premium) by token allowances. All subscriptions give access across CLI, IDE, Cheap Chats, and REST APIs.
          </p>
        </div>

        <div className={s.headerRight}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px', 
              padding: '10px 22px', fontSize: '14px', fontWeight: 700, borderRadius: '10px',
              background: saved ? 'var(--color-success)' : undefined
            }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            <span>{saving ? 'Saving…' : saved ? 'Saved!' : 'Save Plans'}</span>
          </button>
        </div>
      </div>

      {/* ─── SECTION TITLE & SUBTITLE ─── */}
      <div className="card glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div className={s.fieldGrid2}>
          <div>
            <label style={labelStyle}>Section Title</label>
            <input
              style={inputStyle}
              value={formData.pricingSection?.title || ''}
              onChange={e => setFormData({
                ...formData,
                pricingSection: { ...(formData.pricingSection || {}), title: e.target.value }
              })}
              placeholder="Simple, honest pricing"
            />
          </div>
          <div>
            <label style={labelStyle}>Section Subtitle</label>
            <input
              style={inputStyle}
              value={formData.pricingSection?.subtitle || ''}
              onChange={e => setFormData({
                ...formData,
                pricingSection: { ...(formData.pricingSection || {}), subtitle: e.target.value }
              })}
              placeholder="Transparent per-token plans. Access CLI, IDE Builder, Cheap Chats, and REST APIs with a single subscription."
            />
          </div>
        </div>
      </div>

      {/* ─── PLAN SELECTOR BUTTONS (FREE, PRO, PREMIUM) ─── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {plans.map((p) => {
          const isSelected = p.id === activePlan.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePlanId(p.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
                border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: isSelected ? 'var(--color-primary-soft)' : 'var(--color-card-bg)',
                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <span>{p.name} Plan</span>
              <span style={{ 
                fontSize: '11px', padding: '2px 7px', borderRadius: '10px',
                background: isSelected ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                color: isSelected ? '#fff' : 'var(--color-text-muted)'
              }}>
                {p.price}{p.period || ''}
              </span>
              {p.featured && <Star size={13} fill="var(--color-primary)" color="var(--color-primary)" />}
            </button>
          );
        })}
      </div>

      {/* ─── MAIN EDITOR & PREVIEW SPLIT ─── */}
      <div className={s.layout}>
        {/* LEFT COLUMN: ACTIVE PLAN FORM */}
        <div className={s.editorCol}>
          <div className="card glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                  Editing {activePlan.name} Plan
                </h3>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={!!activePlan.featured}
                  onChange={e => updateActivePlan({ featured: e.target.checked })}
                />
                <span>Highlight as Most Popular</span>
              </label>
            </div>

            {/* Basic Info: Name, Price, Period, Tokens (Millions) */}
            <div className={s.fieldGrid3} style={{ marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Plan Name</label>
                <input
                  style={inputStyle}
                  value={activePlan.name || ''}
                  onChange={e => updateActivePlan({ name: e.target.value })}
                  placeholder="e.g. Free, Pro, Premium"
                />
              </div>
              <div>
                <label style={labelStyle}>Price</label>
                <input
                  style={inputStyle}
                  value={activePlan.price || ''}
                  onChange={e => updateActivePlan({ price: e.target.value })}
                  placeholder="e.g. $0, $19, $49"
                />
              </div>
              <div>
                <label style={labelStyle}>Billing Period</label>
                <input
                  style={inputStyle}
                  value={activePlan.period || ''}
                  onChange={e => updateActivePlan({ period: e.target.value })}
                  placeholder="e.g. /mo, /year, (leave empty for Free)"
                />
              </div>
            </div>

            {/* Token Allowance in Millions */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>
                Token Allowance (in Millions) — Used across all tools
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  style={{ ...inputStyle, width: '180px', fontFamily: 'monospace', fontWeight: 700 }}
                  value={activePlan.tokensM !== undefined ? activePlan.tokensM : (activePlan.tokenLimit ? activePlan.tokenLimit / 1000000 : 10)}
                  onChange={e => {
                    const m = parseFloat(e.target.value) || 0;
                    updateActivePlan({ tokensM: m });
                  }}
                  placeholder="10"
                />
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Million Tokens ({activePlan.tokens || `${activePlan.tokensM || 10}M Tokens/mo`})
                </span>
              </div>
            </div>

            {/* Short Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Description</label>
              <input
                style={inputStyle}
                value={activePlan.desc || ''}
                onChange={e => updateActivePlan({ desc: e.target.value })}
                placeholder="Short benefit summary of this tier"
              />
            </div>

            {/* Platform Access Checkboxes */}
            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>
                Platform Access Capabilities (Mentioned on Plan Card)
              </label>
              <div className={s.capabilityToggleGroup}>
                <label className={`${s.capabilityToggle} ${activePlan.canUseCli !== false ? s.capabilityToggleActive : ''}`}>
                  <input
                    type="checkbox"
                    checked={activePlan.canUseCli !== false}
                    onChange={e => updateActivePlan({ canUseCli: e.target.checked })}
                  />
                  <Terminal size={14} /> Can use CLI
                </label>
                <label className={`${s.capabilityToggle} ${activePlan.canUseIde !== false ? s.capabilityToggleActive : ''}`}>
                  <input
                    type="checkbox"
                    checked={activePlan.canUseIde !== false}
                    onChange={e => updateActivePlan({ canUseIde: e.target.checked })}
                  />
                  <Hammer size={14} /> Can use IDE
                </label>
                <label className={`${s.capabilityToggle} ${activePlan.canUseChat !== false ? s.capabilityToggleActive : ''}`}>
                  <input
                    type="checkbox"
                    checked={activePlan.canUseChat !== false}
                    onChange={e => updateActivePlan({ canUseChat: e.target.checked })}
                  />
                  <MessageSquare size={14} /> Can use Chats
                </label>
                <label className={`${s.capabilityToggle} ${activePlan.canUseApi !== false ? s.capabilityToggleActive : ''}`}>
                  <input
                    type="checkbox"
                    checked={activePlan.canUseApi !== false}
                    onChange={e => updateActivePlan({ canUseApi: e.target.checked })}
                  />
                  <Braces size={14} /> Can use API
                </label>
              </div>
            </div>

            {/* Included / Free AI Models Multi-Select & Custom Input */}
            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>
                Included / Highlighted AI Models for this Plan
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <select
                  style={{ ...inputStyle, width: '260px' }}
                  value={selectedDropdownModel}
                  onChange={e => {
                    if (e.target.value) {
                      addModelToActivePlan(e.target.value);
                    }
                  }}
                >
                  <option value="">-- Select from Platform Models --</option>
                  {availableModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                  <input
                    style={inputStyle}
                    value={customModelInput}
                    onChange={e => setCustomModelInput(e.target.value)}
                    placeholder="Or type custom (e.g. MiniMax 10M context)"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addModelToActivePlan(customModelInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => addModelToActivePlan(customModelInput)}
                    style={{ padding: '0 16px', borderRadius: '10px' }}
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>
              </div>

              {/* Chips of added models */}
              <div className={s.chipGroup}>
                {(activePlan.includedModels || []).map(m => (
                  <span key={m} className={s.modelChip}>
                    <Sparkles size={11} color="var(--color-primary)" />
                    <span>{m}</span>
                    <button
                      type="button"
                      className={s.modelChipRemove}
                      onClick={() => removeModelFromActivePlan(m)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {(!activePlan.includedModels || activePlan.includedModels.length === 0) && (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    No specific models listed yet. Select from the dropdown or type custom ones above.
                  </span>
                )}
              </div>
            </div>

            {/* Features List Textarea */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>
                Features List (One feature per line)
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: '120px', fontFamily: 'inherit', resize: 'vertical' }}
                value={(activePlan.features || []).join('\n')}
                onChange={e => {
                  const lines = e.target.value.split('\n');
                  updateActivePlan({ features: lines });
                }}
                placeholder="Can use Cheap CLI&#10;Can use Cheap Chats&#10;100M Tokens / month&#10;Priority Support"
              />
            </div>

            {/* CTA text & Link */}
            <div className={s.fieldGrid2}>
              <div>
                <label style={labelStyle}>Button (CTA) Label</label>
                <input
                  style={inputStyle}
                  value={activePlan.cta || ''}
                  onChange={e => updateActivePlan({ cta: e.target.value })}
                  placeholder="Get Started / Upgrade"
                />
              </div>
              <div>
                <label style={labelStyle}>Button Link</label>
                <input
                  style={inputStyle}
                  value={activePlan.ctaLink || ''}
                  onChange={e => updateActivePlan({ ctaLink: e.target.value })}
                  placeholder="/signup or /dashboard/billing"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PLAN CARD PREVIEW */}
        <div className={s.previewCol}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Live Plan Preview
          </div>

          <div 
            className="card glass-card"
            style={{ 
              padding: '24px', position: 'relative',
              borderColor: activePlan.featured ? 'var(--color-primary)' : 'var(--color-border)',
              boxShadow: activePlan.featured ? '0 0 20px rgba(204, 0, 0, 0.15)' : undefined
            }}
          >
            {activePlan.featured && (
              <div style={{
                position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--color-primary)', color: '#fff', fontSize: '10px', fontWeight: 800,
                padding: '3px 12px', borderRadius: '20px', letterSpacing: '0.5px'
              }}>
                MOST POPULAR
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px' }}>
                  {activePlan.name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                  {activePlan.desc}
                </p>
              </div>
            </div>

            {/* Token Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '5px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
              background: 'var(--color-primary-soft)', color: 'var(--color-primary)',
              margin: '12px 0 16px', border: '1px solid rgba(204, 0, 0, 0.2)'
            }}>
              <Zap size={13} />
              <span>{activePlan.tokens || `${activePlan.tokensM || 10}M Tokens/mo`}</span>
            </div>

            {/* Price */}
            <div style={{ fontSize: '38px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>
              {activePlan.price}
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                {activePlan.period || ''}
              </span>
            </div>

            {/* Capabilities */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px',
              padding: '8px 10px', background: 'var(--color-bg-soft)', borderRadius: '8px',
              border: '1px solid var(--color-border)'
            }}>
              {activePlan.canUseCli !== false && (
                <span style={{ fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Check size={11} color="var(--color-success)" /> CLI
                </span>
              )}
              {activePlan.canUseIde !== false && (
                <span style={{ fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Check size={11} color="var(--color-success)" /> IDE
                </span>
              )}
              {activePlan.canUseChat !== false && (
                <span style={{ fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Check size={11} color="var(--color-success)" /> Chats
                </span>
              )}
              {activePlan.canUseApi !== false && (
                <span style={{ fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Check size={11} color="var(--color-success)" /> API
                </span>
              )}
            </div>

            {/* Included Models */}
            {activePlan.includedModels && activePlan.includedModels.length > 0 && (
              <div style={{
                marginBottom: '16px', padding: '8px 10px',
                background: 'var(--color-bg-soft)', borderRadius: '8px', border: '1px solid var(--color-border)'
              }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Included AI Models:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {activePlan.includedModels.map(m => (
                    <span key={m} style={{
                      fontFamily: 'monospace', fontSize: '10px', fontWeight: 600,
                      background: 'var(--color-card-bg)', padding: '2px 5px', borderRadius: '4px',
                      border: '1px solid var(--color-border)'
                    }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(activePlan.features || []).filter(Boolean).map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <Check size={14} strokeWidth={2.5} color="var(--color-success)" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className={activePlan.featured ? 'btn-primary' : 'btn-secondary'}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
            >
              {activePlan.cta || 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
