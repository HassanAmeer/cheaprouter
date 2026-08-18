'use client';
import React, { useState, useEffect, useMemo } from 'react';
import s from './plan-settings.module.css';
import { Save, Plus, X, ChevronUp, ChevronDown, Copy, Check, Layers, Tag, Star, LayoutGrid, Loader2 } from 'lucide-react';
import { useSiteSettings, SiteSettings } from '@/components/settings-provider';
import { useToast } from '@/components/ui/toast';

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)',
  padding: '10px 14px', borderRadius: '10px', color: 'var(--color-text-main)',
  fontSize: '14px', outline: 'none', transition: 'border-color .2s, box-shadow .2s'
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.6px'
};

export default function PlanSettingsPage() {
  const { settings, refreshSettings } = useSiteSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('tab_cli');
  const [previewTab, setPreviewTab] = useState<string>('');

  useEffect(() => {
    setFormData(settings);
    const tabs = settings.pricingSection?.tabs || [];
    if (tabs.length > 0) {
      if (!tabs.find(t => t.id === activeTab)) setActiveTab(tabs[0].id);
      setPreviewTab(prev => (tabs.find(t => t.id === prev) ? prev : tabs[0].id));
    }
  }, [settings, activeTab]);

  const tabs = formData.pricingSection?.tabs || [];
  const activeTabObj = tabs.find(t => t.id === activeTab);
  const dirty = useMemo(() => JSON.stringify(formData) !== JSON.stringify(settings), [formData, settings]);

  const updateSection = (patch: any) =>
    setFormData({ ...formData, pricingSection: { ...(formData.pricingSection || { title: '', subtitle: '', tabs: [] }), ...patch } });

  const updateTab = (tabId: string, patch: any) =>
    updateSection({ tabs: tabs.map(t => (t.id === tabId ? { ...t, ...patch } : t)) });

  const updatePlan = (tabId: string, planId: string, patch: any) =>
    updateSection({ tabs: tabs.map(t => (t.id === tabId ? { ...t, plans: (t.plans || []).map(p => (p.id === planId ? { ...p, ...patch } : p)) } : t)) });

  const moveTab = (idx: number, dir: -1 | 1) => {
    const next = [...tabs];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    updateSection({ tabs: next });
  };

  const movePlan = (tabId: string, idx: number, dir: -1 | 1) => {
    const t = tabs.find(t => t.id === tabId);
    if (!t) return;
    const plans = [...(t.plans || [])];
    const j = idx + dir;
    if (j < 0 || j >= plans.length) return;
    [plans[idx], plans[j]] = [plans[j], plans[idx]];
    updateTab(tabId, { plans });
  };

  const duplicatePlan = (tabId: string, planId: string) => {
    const t = tabs.find(t => t.id === tabId);
    if (!t) return;
    const src = (t.plans || []).find(p => p.id === planId);
    if (!src) return;
    updateTab(tabId, { plans: [...(t.plans || []), { ...src, id: `p_${Date.now()}` }] });
    toast('Plan duplicated');
  };

  const addTab = () => {
    const id = `tab_${Date.now()}`;
    updateSection({ tabs: [...tabs, { id, name: 'New Tab', plans: [] }] });
    setActiveTab(id);
  };

  const removeTab = (tabId: string) => {
    const next = tabs.filter(t => t.id !== tabId);
    updateSection({ tabs: next });
    if (activeTab === tabId && next.length > 0) setActiveTab(next[0].id);
    if (previewTab === tabId) setPreviewTab(next[0]?.id || '');
  };

  const addPlan = () => {
    if (!activeTabObj) return;
    updateTab(activeTabObj.id, {
      plans: [...(activeTabObj.plans || []), { id: `p_${Date.now()}`, name: 'New Plan', price: '$0', period: '/mo', desc: 'Describe this plan', features: ['Feature 1'], cta: 'Buy Now', ctaLink: '#', featured: false, durationDays: 30 }],
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSaved(true);
        refreshSettings();
        toast('Plan settings saved');
        setTimeout(() => setSaved(false), 2500);
      } else {
        toast('Failed to save settings', 'error');
      }
    } catch (e: any) {
      toast(e?.message || 'Failed to save settings', 'error');
    }
    setSaving(false);
  };

  const planCount = tabs.reduce((n, t) => n + (t.plans?.length || 0), 0);
  const featuredCount = tabs.reduce((n, t) => n + (t.plans || []).filter(p => p.featured).length, 0);

  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <style jsx>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {/* ── Header ── */}
      <div className={s.headerRow}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-soft)', padding: '4px 10px', borderRadius: '20px' }}>
              <LayoutGrid size={12} /> Pricing Configuration
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, var(--color-text-main) 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Plan Settings</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: '8px 0 0' }}>
            Manage pricing tabs and configuration for all your product plans. Changes apply instantly to the public pricing section.
          </p>
        </div>

        <div className={s.headerRight}>
          {dirty && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-warning)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-warning)', display: 'inline-block' }} /> Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
              color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
              cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
              boxShadow: '0 4px 16px var(--color-primary-soft)', transition: 'all .2s'
            }}
          >
            {saving ? <Loader2 size={16} className="lucide-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className={s.statsStrip}>
        {[
          { icon: <Layers size={15} />, label: 'Product tabs', value: tabs.length, tint: 'var(--color-primary)' },
          { icon: <Tag size={15} />, label: 'Total plans', value: planCount, tint: 'var(--color-success)' },
          { icon: <Star size={15} />, label: 'Featured plans', value: featuredCount, tint: 'var(--color-warning)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '10px 16px' }}>
            <span style={{ color: s.tint, display: 'inline-flex' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={s.layout}>
        {/* ── Left: Editor ── */}
        <div className={s.editorCol}>
          {/* Section header */}
          <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Pricing Section Header</h3>
            </div>
            <div className={s.fieldGrid2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Section Title</label>
                <input style={inputStyle} value={formData.pricingSection?.title || ''} onChange={e => updateSection({ title: e.target.value })} placeholder="Pricing that scales with you" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Section Subtitle</label>
                <input style={inputStyle} value={formData.pricingSection?.subtitle || ''} onChange={e => updateSection({ subtitle: e.target.value })} placeholder="Simple, transparent pricing" />
              </div>
            </div>
          </section>

          {/* Product tabs */}
          <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <div className={s.sectionHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Product Tabs</h3>
              </div>
              <button onClick={addTab} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '7px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={14} /> Add Tab
              </button>
            </div>

            {tabs.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                No tabs yet. Add a tab to start organizing plans by product (CLI, API, Chat, Agents…).
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tabs.map((tab, idx) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: '12px', cursor: 'pointer',
                      background: isActive ? 'var(--color-primary-soft)' : 'var(--color-input-bg)',
                      border: isActive ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                      transition: 'all .15s'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', width: 18, textAlign: 'center' }}>{idx + 1}</span>
                      <input
                        type="text"
                        value={tab.name}
                        onClick={e => e.stopPropagation()}
                        onChange={e => updateTab(tab.id, { name: e.target.value })}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-text-main)', outline: 'none', fontWeight: 700, fontSize: '14px', flex: 1 }}
                      />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', background: 'var(--color-bg-soft)', padding: '2px 8px', borderRadius: '20px' }}>
                        {tab.plans?.length || 0} plan{(tab.plans?.length || 0) === 1 ? '' : 's'}
                      </span>
                      <button onClick={e => { e.stopPropagation(); moveTab(idx, -1); }} disabled={idx === 0} title="Move up" style={moveBtnStyle}><ChevronUp size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); moveTab(idx, 1); }} disabled={idx === tabs.length - 1} title="Move down" style={moveBtnStyle}><ChevronDown size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); removeTab(tab.id); }} title="Delete tab" style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', padding: 4 }}><X size={15} /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Plans for active tab */}
          <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <div className={s.sectionHeaderRow}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-primary)' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Plans · {activeTabObj?.name || '—'}</h3>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '6px 0 0' }}>Configure pricing tiers for this product tab.</p>
              </div>
              <button onClick={addPlan} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                <Plus size={15} /> Add Plan
              </button>
            </div>

            {!activeTabObj ? (
              <div style={{ padding: '28px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                Select a tab above to manage its plans.
              </div>
            ) : (activeTabObj.plans || []).length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                No plans for “{activeTabObj.name}” yet. Click <strong>Add Plan</strong> to create one.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(activeTabObj.plans || []).map((plan, idx) => (
                  <div key={plan.id} style={{ background: 'var(--color-bg-soft)', border: plan.featured ? '1.5px solid var(--color-warning)' : '1px solid var(--color-border)', borderRadius: '14px', padding: '20px' }}>
                    {/* Plan header */}
                    <div className={s.planHeaderRow}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '3px 8px', borderRadius: '6px' }}>{String(idx + 1).padStart(2, '0')}</span>
                      <input
                        type="text" value={plan.name}
                        onChange={e => updatePlan(activeTabObj.id, plan.id, { name: e.target.value })}
                        style={{ ...inputStyle, flex: 1, fontWeight: 700, minWidth: 120 }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!plan.featured} onChange={e => updatePlan(activeTabObj.id, plan.id, { featured: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--color-warning)' }} />
                        <Star size={12} color="var(--color-warning)" /> Featured
                      </label>
                      <button onClick={e => { e.stopPropagation(); movePlan(activeTabObj.id, idx, -1); }} disabled={idx === 0} title="Move up" style={moveBtnStyle}><ChevronUp size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); movePlan(activeTabObj.id, idx, 1); }} disabled={idx === (activeTabObj.plans || []).length - 1} title="Move down" style={moveBtnStyle}><ChevronDown size={14} /></button>
                      <button onClick={() => duplicatePlan(activeTabObj.id, plan.id)} title="Duplicate plan" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: 4 }}><Copy size={15} /></button>
                      <button onClick={() => updateTab(activeTabObj.id, { plans: (activeTabObj.plans || []).filter(p => p.id !== plan.id) })} title="Delete plan" style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', padding: 4 }}><X size={16} /></button>
                    </div>

                    <div className={s.fieldGrid3}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={labelStyle}>Price</label>
                        <input style={inputStyle} value={plan.price} onChange={e => updatePlan(activeTabObj.id, plan.id, { price: e.target.value })} placeholder="$15" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={labelStyle}>Period</label>
                        <input style={inputStyle} value={plan.period} onChange={e => updatePlan(activeTabObj.id, plan.id, { period: e.target.value })} placeholder="/mo" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={labelStyle}>Duration (days)</label>
                        <input style={inputStyle} type="number" value={plan.durationDays ?? 30} onChange={e => updatePlan(activeTabObj.id, plan.id, { durationDays: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ ...labelStyle, display: 'block', marginBottom: 5 }}>Short Description</label>
                      <input style={inputStyle} value={plan.desc} onChange={e => updatePlan(activeTabObj.id, plan.id, { desc: e.target.value })} placeholder="What's included at this tier" />
                    </div>

                    <div className={s.fieldGrid2}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={labelStyle}>CTA Button Text</label>
                        <input style={inputStyle} value={plan.cta} onChange={e => updatePlan(activeTabObj.id, plan.id, { cta: e.target.value })} placeholder="Buy Now" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={labelStyle}>CTA Link</label>
                        <input style={inputStyle} value={plan.ctaLink} onChange={e => updatePlan(activeTabObj.id, plan.id, { ctaLink: e.target.value })} placeholder="#" />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <label style={labelStyle}>Features (one per line)</label>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{plan.features.length} added</span>
                      </div>
                      <textarea
                        value={plan.features.join('\n')}
                        onChange={e => updatePlan(activeTabObj.id, plan.id, { features: e.target.value.split('\n').filter(f => f.trim() !== '') })}
                        rows={4} placeholder={'1,000 requests/month\nAll models\nPriority routing'}
                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className={s.previewCol}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 0 3px var(--color-success-soft)' }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Preview</span>
          </div>
          <div className={s.previewCard}>
            {/* Preview header */}
            <div style={{ textAlign: 'center', padding: '22px 20px 6px' }}>
              {formData.pricingSection?.subtitle && (
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>{formData.pricingSection.subtitle}</div>
              )}
              {formData.pricingSection?.title && (
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{formData.pricingSection.title}</div>
              )}
            </div>

            {/* Preview tabs */}
            {tabs.length > 1 && (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '16px 0 4px', flexWrap: 'wrap' }}>
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setPreviewTab(t.id)} style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    border: previewTab === t.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: previewTab === t.id ? 'var(--color-primary-soft)' : 'transparent',
                    color: previewTab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  }}>{t.name}</button>
                ))}
              </div>
            )}

            {/* Preview plans */}
            <div className={s.previewGrid}>
              {(tabs.find(t => t.id === (previewTab || tabs[0]?.id))?.plans || []).map(plan => (
                <div key={plan.id} style={{
                  border: plan.featured ? '1.5px solid var(--color-warning)' : '1px solid var(--color-border)',
                  borderRadius: '14px', padding: '16px', position: 'relative',
                  background: 'var(--color-card-bg)'
                }}>
                  {plan.featured && (
                    <div style={{ position: 'absolute', top: -9, left: 16, fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px', color: '#fff', background: 'var(--color-warning)', padding: '2px 8px', borderRadius: '10px' }}>
                      MOST POPULAR
                    </div>
                  )}
                  <div style={{ fontSize: '13px', fontWeight: 800 }}>{plan.name || 'Untitled'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 8px' }}>{plan.desc}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
                    {plan.price}<span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>{plan.period}</span>
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                    {plan.features.slice(0, 5).map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        <Check size={11} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <div style={{ textAlign: 'center', padding: '7px 0', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: plan.featured ? 'var(--color-primary)' : 'var(--color-primary-soft)', color: plan.featured ? '#fff' : 'var(--color-primary)' }}>
                    {plan.cta}
                  </div>
                </div>
              ))}
              {(tabs.find(t => t.id === (previewTab || tabs[0]?.id))?.plans?.length || 0) === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                  No plans to preview.
                </div>
              )}
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0, padding: '0 4px', lineHeight: 1.5 }}>
            This mirrors the public pricing section. Click tabs above to preview other products.
          </p>
        </div>
      </div>
    </div>
  );
}

const moveBtnStyle: React.CSSProperties = {
  background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)',
  color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 6,
  opacity: 0.9
};
