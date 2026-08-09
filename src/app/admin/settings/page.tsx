'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../admin.module.css';
import { 
  Save, Image as ImageIcon, Type, Settings2, HelpCircle, AlignLeft, LayoutPanelLeft, 
  Plus, X, Upload, Trash2, Globe, Mail, LayoutDashboard, Code, DollarSign, Grid, SplitSquareHorizontal
} from 'lucide-react';
import { useSiteSettings, SiteSettings } from '@/components/settings-provider';

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as any;

  const { settings, refreshSettings } = useSiteSettings();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'general' | 'landing' | 'contact' | 'dashboard'>('general');
  const [landingSubTab, setLandingSubTab] = useState<'hero' | 'marquee' | 'featuresplit' | 'pricing' | 'compare' | 'features' | 'demand' | 'faq' | 'footer' | 'sections'>('hero');
  const [activePricingTab, setActivePricingTab] = useState('tab_cli');

  useEffect(() => {
    if (tabParam) {
      if (['hero', 'marquee', 'featuresplit', 'pricing', 'compare', 'features', 'demand', 'faq', 'footer', 'sections'].includes(tabParam)) {
        setActiveTab('landing');
        setLandingSubTab(tabParam as any);
      } else if (['general', 'landing', 'contact', 'dashboard'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, [tabParam]);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleFileUpload = (field: 'logoUrl' | 'faviconUrl', file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        handleChange(field, reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await refreshSettings();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const TabBtn = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', 
        background: activeTab === id ? 'var(--color-primary-soft)' : 'transparent',
        color: activeTab === id ? 'var(--color-primary)' : 'var(--color-text-muted)', 
        border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' 
      }}
    >
      <Icon size={16} /> {label}
    </button>
  );

  const SubTabBtn = ({ id, label, icon: Icon }: { id: typeof landingSubTab, label: string, icon: any }) => (
    <button 
      onClick={() => setLandingSubTab(id)}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', 
        background: landingSubTab === id ? 'var(--color-card-bg)' : 'transparent',
        color: landingSubTab === id ? 'var(--color-primary)' : 'var(--color-text-muted)', 
        border: landingSubTab === id ? '1px solid var(--color-border)' : '1px solid transparent', 
        borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' 
      }}
    >
      <Icon size={14} /> {label}
    </button>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Content Management System</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Dynamically manage every section of your platform, landing page, and dashboard settings.</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <Save size={16} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <TabBtn id="general" label="General & Brand" icon={Settings2} />
        <TabBtn id="landing" label="Landing Page" icon={Globe} />
        <TabBtn id="contact" label="Contact & Support" icon={Mail} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* ================= 1. GENERAL & BRAND ================= */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={18} color="var(--color-primary)" /> Brand Identity & Logos
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Brand Name</label>
                  <input 
                    type="text" 
                    value={formData.brandName || ''} 
                    onChange={(e) => handleChange('brandName', e.target.value)} 
                    placeholder="e.g. CheapAgents"
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Website Logo Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--color-bg-soft)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Website Main Logo</span>
                      {formData.logoUrl && <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>Custom Logo Active</span>}
                    </label>

                    <div style={{ 
                      height: '80px', 
                      background: 'var(--color-card-bg)', 
                      borderRadius: '8px', 
                      border: '1px dashed var(--color-border)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      overflow: 'hidden', 
                      padding: '8px',
                      position: 'relative'
                    }}>
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Website Logo Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ImageIcon size={16} /> No Custom Logo Uploaded
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <label className="btn-secondary" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 12px', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}>
                        <Upload size={14} /> Upload Logo File
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload('logoUrl', e.target.files?.[0])} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                      {formData.logoUrl && (
                        <button 
                          type="button" 
                          onClick={() => handleChange('logoUrl', '')} 
                          title="Remove Logo" 
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <input 
                      type="text" 
                      value={formData.logoUrl || ''} 
                      onChange={(e) => handleChange('logoUrl', e.target.value)} 
                      placeholder="Or paste Logo URL / Path" 
                      style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', fontSize: '12px', outline: 'none' }} 
                    />
                  </div>

                  {/* Favicon Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--color-bg-soft)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Favicon Icon</span>
                      {formData.faviconUrl && <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>Active</span>}
                    </label>

                    <div style={{ 
                      height: '80px', 
                      background: 'var(--color-card-bg)', 
                      borderRadius: '8px', 
                      border: '1px dashed var(--color-border)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      overflow: 'hidden', 
                      padding: '8px',
                      gap: '12px'
                    }}>
                      {formData.faviconUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--color-bg-soft)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                          <img src={formData.faviconUrl} alt="Favicon Preview" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Favicon Preview</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ImageIcon size={16} /> Default (/favicon.ico)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <label className="btn-secondary" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 12px', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}>
                        <Upload size={14} /> Upload Favicon File
                        <input 
                          type="file" 
                          accept="image/*,image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml" 
                          onChange={(e) => handleFileUpload('faviconUrl', e.target.files?.[0])} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                      {formData.faviconUrl && formData.faviconUrl !== '/favicon.ico' && (
                        <button 
                          type="button" 
                          onClick={() => handleChange('faviconUrl', '/favicon.ico')} 
                          title="Reset to default favicon" 
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <input 
                      type="text" 
                      value={formData.faviconUrl || ''} 
                      onChange={(e) => handleChange('faviconUrl', e.target.value)} 
                      placeholder="Or paste Favicon URL / Path" 
                      style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', fontSize: '12px', outline: 'none' }} 
                    />
                  </div>
                </div>
              </div>
            </section>

            <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="var(--color-primary)" /> Global SEO Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Meta Title (Browser Tab)</label>
                  <input 
                    type="text" 
                    value={formData.seo?.metaTitle || ''} 
                    onChange={(e) => setFormData({...formData, seo: {...(formData.seo || { metaDescription: '', ogImage: '' }), metaTitle: e.target.value}})} 
                    placeholder="e.g. CheapAgents - Unified AI Gateway"
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Meta Description (Search Engines)</label>
                  <textarea 
                    value={formData.seo?.metaDescription || ''} 
                    onChange={(e) => setFormData({...formData, seo: {...(formData.seo || { metaTitle: '', ogImage: '' }), metaDescription: e.target.value}})} 
                    placeholder="A brief summary of your platform for SEO..."
                    rows={3}
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', resize: 'vertical' }} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>OpenGraph (Social Share) Image URL</label>
                  <input 
                    type="text" 
                    value={formData.seo?.ogImage || ''} 
                    onChange={(e) => setFormData({...formData, seo: {...(formData.seo || { metaTitle: '', metaDescription: '' }), ogImage: e.target.value}})} 
                    placeholder="https://yourdomain.com/og-image.jpg"
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} 
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= 2. LANDING PAGE CMS ================= */}
        {activeTab === 'landing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--color-bg-soft)', padding: '6px', borderRadius: '10px', width: 'fit-content', flexWrap: 'wrap' }}>
              <SubTabBtn id="hero" label="Hero Section" icon={Type} />
              <SubTabBtn id="marquee" label="Marquee" icon={ImageIcon} />
              <SubTabBtn id="featuresplit" label="API Feature" icon={Code} />
              <SubTabBtn id="pricing" label="Pricing" icon={DollarSign} />
              <SubTabBtn id="compare" label="Before / After" icon={SplitSquareHorizontal} />
              <SubTabBtn id="features" label="Features Grid" icon={Grid} />
              <SubTabBtn id="demand" label="Demand" icon={AlignLeft} />
              <SubTabBtn id="faq" label="FAQs" icon={HelpCircle} />
              <SubTabBtn id="footer" label="Footer" icon={LayoutPanelLeft} />
            </div>

            {/* HERO SUB-TAB */}
            {landingSubTab === 'hero' && (
              <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Type size={18} color="var(--color-primary)" /> Hero Section Content
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Animated Looping Texts (Comma separated)</label>
                    <input type="text" value={formData.heroAnimatedTexts.join(', ')} onChange={(e) => handleChange('heroAnimatedTexts', e.target.value.split(',').map(s => s.trim()))} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Subtitle (Supports HTML like &lt;strong&gt;)</label>
                    <textarea value={formData.heroSubtitle} onChange={(e) => handleChange('heroSubtitle', e.target.value)} rows={3} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Promo Text (e.g. "Buy Just for")</label>
                      <input type="text" value={formData.heroPromoText || ''} onChange={(e) => handleChange('heroPromoText', e.target.value)} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Promo Highlight (e.g. "$2 USD / month")</label>
                      <input type="text" value={formData.heroPromoHighlight || ''} onChange={(e) => handleChange('heroPromoHighlight', e.target.value)} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* MARQUEE SUB-TAB */}
            {landingSubTab === 'marquee' && (
              <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Provider Marquee List</h3>
                  <button onClick={() => setFormData({...formData, marqueeProviders: [...formData.marqueeProviders, { id: `mq_${Date.now()}`, name: 'New Provider', iconUrl: '' }]})} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={16} /> Add Item
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formData.marqueeProviders.map((mq, idx) => (
                    <div key={mq.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '16px', alignItems: 'center', background: 'var(--color-bg-soft)', padding: '16px', borderRadius: '12px' }}>
                      <input type="text" value={mq.name} onChange={(e) => {
                        const newMq = [...formData.marqueeProviders]; newMq[idx].name = e.target.value; setFormData({...formData, marqueeProviders: newMq});
                      }} placeholder="Provider Name" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                      
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {mq.iconUrl && <img src={mq.iconUrl} alt="preview" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'contain' }} />}
                        <input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const newMq = [...formData.marqueeProviders];
                              newMq[idx].iconUrl = reader.result as string;
                              setFormData({...formData, marqueeProviders: newMq});
                            };
                            reader.readAsDataURL(file);
                          }
                        }} style={{ fontSize: '12px' }} />
                      </div>
                      
                      <button onClick={() => {
                        setFormData({...formData, marqueeProviders: formData.marqueeProviders.filter(m => m.id !== mq.id)});
                      }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><X size={16}/></button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FEATURE SPLIT SUB-TAB */}
            {landingSubTab === 'featuresplit' && (
              <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>API Feature Split Section</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Title (Supports HTML)</label>
                    <input type="text" value={formData.featureSplit?.title || ''} onChange={(e) => setFormData({...formData, featureSplit: {...(formData.featureSplit || { description: '', checkList: [], buttonText: '', buttonLink: '', codeSnippet: '' }), title: e.target.value}})} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Description</label>
                    <textarea value={formData.featureSplit?.description || ''} onChange={(e) => setFormData({...formData, featureSplit: {...(formData.featureSplit || { title: '', checkList: [], buttonText: '', buttonLink: '', codeSnippet: '' }), description: e.target.value}})} rows={3} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Checklist Items (Comma separated)</label>
                    <textarea value={(formData.featureSplit?.checkList || []).join('\n')} onChange={(e) => setFormData({...formData, featureSplit: {...(formData.featureSplit || { title: '', description: '', buttonText: '', buttonLink: '', codeSnippet: '' }), checkList: e.target.value.split('\n').filter(Boolean)}})} rows={5} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Button Text & Link</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <input type="text" value={formData.featureSplit?.buttonText || ''} onChange={(e) => setFormData({...formData, featureSplit: {...(formData.featureSplit || { title: '', description: '', checkList: [], buttonLink: '', codeSnippet: '' }), buttonText: e.target.value}})} placeholder="Button Text" style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                      <input type="text" value={formData.featureSplit?.buttonLink || ''} onChange={(e) => setFormData({...formData, featureSplit: {...(formData.featureSplit || { title: '', description: '', checkList: [], buttonText: '', codeSnippet: '' }), buttonLink: e.target.value}})} placeholder="Button Link" style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Code Snippet</label>
                    <textarea value={formData.featureSplit?.codeSnippet || ''} onChange={(e) => setFormData({...formData, featureSplit: {...(formData.featureSplit || { title: '', description: '', checkList: [], buttonText: '', buttonLink: '' }), codeSnippet: e.target.value}})} rows={10} style={{ fontFamily: 'monospace', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', resize: 'vertical' }} />
                  </div>
                </div>
              </section>
            )}

            {/* PRICING SUB-TAB */}
            {landingSubTab === 'pricing' && (
              <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Pricing Settings Have Moved</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                  You can now manage all your pricing tabs and plans on the dedicated Plan Settings page.
                </p>
                <Link href="/admin/plan-settings" className={styles.btnPrimary} style={{ display: 'inline-flex', padding: '10px 24px', textDecoration: 'none' }}>
                  Go to Plan Settings
                </Link>
              </section>
            )}

            {/* COMPARE SUB-TAB */}
            {landingSubTab === 'compare' && (
              <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Before & After Comparison Section</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  <input type="text" value={formData.comparisonSection?.title || ''} onChange={(e) => setFormData({...formData, comparisonSection: {...(formData.comparisonSection || { subtitle: '', beforeLabel: '', beforeSubLabel: '', beforePoints: [], afterLabel: '', afterSubLabel: '', afterPoints: [] }), title: e.target.value}})} placeholder="Section Title (Supports HTML)" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  <input type="text" value={formData.comparisonSection?.subtitle || ''} onChange={(e) => setFormData({...formData, comparisonSection: {...(formData.comparisonSection || { title: '', beforeLabel: '', beforeSubLabel: '', beforePoints: [], afterLabel: '', afterSubLabel: '', afterPoints: [] }), subtitle: e.target.value}})} placeholder="Section Subtitle" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  {/* BEFORE SECTION */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444' }}>"Before" State (The Painful Way)</h4>
                    <input type="text" value={formData.comparisonSection?.beforeLabel || ''} onChange={(e) => setFormData({...formData, comparisonSection: {...formData.comparisonSection, beforeLabel: e.target.value}})} placeholder="Label (e.g. Without CheapAgents)" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    <input type="text" value={formData.comparisonSection?.beforeSubLabel || ''} onChange={(e) => setFormData({...formData, comparisonSection: {...formData.comparisonSection, beforeSubLabel: e.target.value}})} placeholder="SubLabel (e.g. The painful way)" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    
                    <button onClick={() => setFormData({...formData, comparisonSection: {...formData.comparisonSection, beforePoints: [...(formData.comparisonSection?.beforePoints || []), { id: `bp_${Date.now()}`, text: 'New Point', detail: 'Detail' }]}})} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
                      <Plus size={14} /> Add Bad Point
                    </button>
                    
                    {(formData.comparisonSection?.beforePoints || []).map((point, idx) => (
                      <div key={point.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--color-bg-soft)', padding: '12px', borderRadius: '8px', position: 'relative' }}>
                        <button onClick={() => {
                          const newPoints = formData.comparisonSection.beforePoints.filter(p => p.id !== point.id);
                          setFormData({...formData, comparisonSection: {...formData.comparisonSection, beforePoints: newPoints}});
                        }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14}/></button>
                        <input type="text" value={point.text} onChange={(e) => {
                          const newPoints = [...formData.comparisonSection.beforePoints]; newPoints[idx].text = e.target.value; setFormData({...formData, comparisonSection: {...formData.comparisonSection, beforePoints: newPoints}});
                        }} placeholder="Main text" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', width: 'calc(100% - 24px)' }} />
                        <input type="text" value={point.detail} onChange={(e) => {
                          const newPoints = [...formData.comparisonSection.beforePoints]; newPoints[idx].detail = e.target.value; setFormData({...formData, comparisonSection: {...formData.comparisonSection, beforePoints: newPoints}});
                        }} placeholder="Sub detail" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none' }} />
                      </div>
                    ))}
                  </div>

                  {/* AFTER SECTION */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>"After" State (The Smart Way)</h4>
                    <input type="text" value={formData.comparisonSection?.afterLabel || ''} onChange={(e) => setFormData({...formData, comparisonSection: {...formData.comparisonSection, afterLabel: e.target.value}})} placeholder="Label (e.g. With CheapAgents)" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    <input type="text" value={formData.comparisonSection?.afterSubLabel || ''} onChange={(e) => setFormData({...formData, comparisonSection: {...formData.comparisonSection, afterSubLabel: e.target.value}})} placeholder="SubLabel (e.g. The smart way)" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    
                    <button onClick={() => setFormData({...formData, comparisonSection: {...formData.comparisonSection, afterPoints: [...(formData.comparisonSection?.afterPoints || []), { id: `ap_${Date.now()}`, text: 'New Point', detail: 'Detail' }]}})} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
                      <Plus size={14} /> Add Good Point
                    </button>
                    
                    {(formData.comparisonSection?.afterPoints || []).map((point, idx) => (
                      <div key={point.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--color-bg-soft)', padding: '12px', borderRadius: '8px', position: 'relative' }}>
                        <button onClick={() => {
                          const newPoints = formData.comparisonSection.afterPoints.filter(p => p.id !== point.id);
                          setFormData({...formData, comparisonSection: {...formData.comparisonSection, afterPoints: newPoints}});
                        }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14}/></button>
                        <input type="text" value={point.text} onChange={(e) => {
                          const newPoints = [...formData.comparisonSection.afterPoints]; newPoints[idx].text = e.target.value; setFormData({...formData, comparisonSection: {...formData.comparisonSection, afterPoints: newPoints}});
                        }} placeholder="Main text" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', width: 'calc(100% - 24px)' }} />
                        <input type="text" value={point.detail} onChange={(e) => {
                          const newPoints = [...formData.comparisonSection.afterPoints]; newPoints[idx].detail = e.target.value; setFormData({...formData, comparisonSection: {...formData.comparisonSection, afterPoints: newPoints}});
                        }} placeholder="Sub detail" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* FEATURES GRID SUB-TAB */}
            {landingSubTab === 'features' && (
              <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Features Grid Section</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  <input type="text" value={formData.featuresGrid?.title || ''} onChange={(e) => setFormData({...formData, featuresGrid: {...(formData.featuresGrid || { subtitle: '', features: [] }), title: e.target.value}})} placeholder="Section Title" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  <input type="text" value={formData.featuresGrid?.subtitle || ''} onChange={(e) => setFormData({...formData, featuresGrid: {...(formData.featuresGrid || { title: '', features: [] }), subtitle: e.target.value}})} placeholder="Section Subtitle" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Feature Items</h3>
                  <button onClick={() => setFormData({...formData, featuresGrid: {...(formData.featuresGrid || { title: '', subtitle: '' }), features: [...(formData.featuresGrid?.features || []), { id: `fg_${Date.now()}`, icon: 'Zap', title: 'New Feature', desc: 'Description' }]}})} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={16} /> Add Feature
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {(formData.featuresGrid?.features || []).map((feat, idx) => (
                    <div key={feat.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--color-bg-soft)', padding: '16px', borderRadius: '12px', position: 'relative' }}>
                      <button onClick={() => {
                        const newFeats = formData.featuresGrid.features.filter(f => f.id !== feat.id);
                        setFormData({...formData, featuresGrid: {...formData.featuresGrid, features: newFeats}});
                      }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14}/></button>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Icon Name (Lucide)</label>
                        <input type="text" value={feat.icon} onChange={(e) => {
                          const newFeats = [...formData.featuresGrid.features]; newFeats[idx].icon = e.target.value; setFormData({...formData, featuresGrid: {...formData.featuresGrid, features: newFeats}});
                        }} placeholder="e.g. Zap, Globe, Key" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', width: 'calc(100% - 24px)' }} />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Title</label>
                        <input type="text" value={feat.title} onChange={(e) => {
                          const newFeats = [...formData.featuresGrid.features]; newFeats[idx].title = e.target.value; setFormData({...formData, featuresGrid: {...formData.featuresGrid, features: newFeats}});
                        }} placeholder="Feature Title" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none' }} />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Description</label>
                        <textarea value={feat.desc} onChange={(e) => {
                          const newFeats = [...formData.featuresGrid.features]; newFeats[idx].desc = e.target.value; setFormData({...formData, featuresGrid: {...formData.featuresGrid, features: newFeats}});
                        }} placeholder="Description..." rows={3} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', resize: 'vertical' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* DEMAND SUB-TAB */}
            {landingSubTab === 'demand' && (
              <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Demand Section Headings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '32px' }}>
                  <input type="text" value={formData.demandSection.title} onChange={(e) => setFormData({...formData, demandSection: {...formData.demandSection, title: e.target.value}})} placeholder="Title" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  <input type="text" value={formData.demandSection.subtitle} onChange={(e) => setFormData({...formData, demandSection: {...formData.demandSection, subtitle: e.target.value}})} placeholder="Subtitle" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Demand List Items</h3>
                  <button onClick={() => setFormData({...formData, demandSection: {...formData.demandSection, items: [...formData.demandSection.items, { id: `di_${Date.now()}`, text: 'New Item', badgeText: 'Badge', badgeColor: 'green' }]}})} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formData.demandSection.items.map((item, idx) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '16px', alignItems: 'center', background: 'var(--color-bg-soft)', padding: '16px', borderRadius: '12px' }}>
                      <input type="text" value={item.text} onChange={(e) => {
                        const newItems = [...formData.demandSection.items]; newItems[idx].text = e.target.value; setFormData({...formData, demandSection: {...formData.demandSection, items: newItems}});
                      }} placeholder="Item Text" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                      
                      <input type="text" value={item.badgeText} onChange={(e) => {
                        const newItems = [...formData.demandSection.items]; newItems[idx].badgeText = e.target.value; setFormData({...formData, demandSection: {...formData.demandSection, items: newItems}});
                      }} placeholder="Badge Text" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                      
                      <select value={item.badgeColor} onChange={(e) => {
                        const newItems = [...formData.demandSection.items]; newItems[idx].badgeColor = e.target.value as any; setFormData({...formData, demandSection: {...formData.demandSection, items: newItems}});
                      }} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }}>
                        <option value="green">Green</option>
                        <option value="red">Red</option>
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="gray">Gray</option>
                      </select>

                      <button onClick={() => {
                        setFormData({...formData, demandSection: {...formData.demandSection, items: formData.demandSection.items.filter(i => i.id !== item.id)}});
                      }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><X size={16}/></button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ SUB-TAB */}
            {landingSubTab === 'faq' && (
              <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Frequently Asked Questions</h3>
                  <button onClick={() => setFormData({...formData, faqs: [...formData.faqs, { id: `faq_${Date.now()}`, q: 'New Question?', a: 'Answer here.' }]})} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={16} /> Add FAQ
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formData.faqs.map((faq, idx) => (
                    <div key={faq.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--color-bg-soft)', padding: '16px', borderRadius: '12px', position: 'relative' }}>
                      <button onClick={() => {
                        setFormData({...formData, faqs: formData.faqs.filter(f => f.id !== faq.id)});
                      }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16}/></button>
                      
                      <input type="text" value={faq.q} onChange={(e) => {
                        const newFaqs = [...formData.faqs]; newFaqs[idx].q = e.target.value; setFormData({...formData, faqs: newFaqs});
                      }} placeholder="Question" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', width: 'calc(100% - 40px)' }} />
                      
                      <textarea value={faq.a} onChange={(e) => {
                        const newFaqs = [...formData.faqs]; newFaqs[idx].a = e.target.value; setFormData({...formData, faqs: newFaqs});
                      }} placeholder="Answer" rows={2} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', width: '100%', resize: 'vertical' }} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FOOTER SUB-TAB */}
            {landingSubTab === 'footer' && (
              <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Footer & Socials</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Copyright Text</label>
                  <input type="text" value={formData.footer.copyrightText} onChange={(e) => setFormData({...formData, footer: {...formData.footer, copyrightText: e.target.value}})} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Social Links</h3>
                  <button onClick={() => setFormData({...formData, footer: {...formData.footer, socialLinks: [...formData.footer.socialLinks, { id: `sl_${Date.now()}`, platform: 'Platform', url: 'https://', isEnabled: true }]}})} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={16} /> Add Link
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formData.footer.socialLinks.map((link, idx) => (
                    <div key={link.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 2fr auto', gap: '16px', alignItems: 'center', background: 'var(--color-bg-soft)', padding: '16px', borderRadius: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--color-text-main)', fontWeight: 600 }}>
                        <input type="checkbox" checked={link.isEnabled !== false} onChange={(e) => {
                          const newLinks = [...formData.footer.socialLinks]; newLinks[idx].isEnabled = e.target.checked; setFormData({...formData, footer: {...formData.footer, socialLinks: newLinks}});
                        }} style={{ cursor: 'pointer' }} />
                        Show
                      </label>

                      <input type="text" value={link.platform} onChange={(e) => {
                        const newLinks = [...formData.footer.socialLinks]; newLinks[idx].platform = e.target.value; setFormData({...formData, footer: {...formData.footer, socialLinks: newLinks}});
                      }} placeholder="Platform Name" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                      
                      <input type="text" value={link.url} onChange={(e) => {
                        const newLinks = [...formData.footer.socialLinks]; newLinks[idx].url = e.target.value; setFormData({...formData, footer: {...formData.footer, socialLinks: newLinks}});
                      }} placeholder="URL or WhatsApp Number" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                      
                      <button onClick={() => {
                        setFormData({...formData, footer: {...formData.footer, socialLinks: formData.footer.socialLinks.filter(l => l.id !== link.id)}});
                      }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><X size={16}/></button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION TITLES SUB-TAB */}
            {landingSubTab === 'sections' && (
              <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Section Headings & Subtitles</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-bg-soft)', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>Models Table Section</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Title</label>
                      <input type="text" value={formData.modelsSection?.title || ''} onChange={(e) => setFormData({...formData, modelsSection: {...(formData.modelsSection || { subtitle: '' }), title: e.target.value}})} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Subtitle</label>
                      <input type="text" value={formData.modelsSection?.subtitle || ''} onChange={(e) => setFormData({...formData, modelsSection: {...(formData.modelsSection || { title: '' }), subtitle: e.target.value}})} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-bg-soft)', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>Integrations / Stack Section</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Title</label>
                      <input type="text" value={formData.integrationsSection?.title || ''} onChange={(e) => setFormData({...formData, integrationsSection: { title: e.target.value }})} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-bg-soft)', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>FAQ Section</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Title</label>
                      <input type="text" value={formData.faqSection?.title || ''} onChange={(e) => setFormData({...formData, faqSection: {...(formData.faqSection || { subtitle: '' }), title: e.target.value}})} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Subtitle</label>
                      <input type="text" value={formData.faqSection?.subtitle || ''} onChange={(e) => setFormData({...formData, faqSection: {...(formData.faqSection || { title: '' }), subtitle: e.target.value}})} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                    </div>
                  </div>

                </div>
              </section>
            )}
          </div>
        )}

        {/* ================= 3. CONTACT & SUPPORT ================= */}
        {activeTab === 'contact' && (
          <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} color="var(--color-primary)" /> Contact & Support Configuration
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Support Email Address</label>
                <input 
                  type="email" 
                  value={formData.contactInfo?.supportEmail || ''} 
                  onChange={(e) => setFormData({...formData, contactInfo: {...(formData.contactInfo || { supportPhone: '', officeAddress: '', discordUrl: '', enableContactForm: true }), supportEmail: e.target.value}})} 
                  placeholder="support@cheapagents.ai"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Support Phone Number</label>
                <input 
                  type="text" 
                  value={formData.contactInfo?.supportPhone || ''} 
                  onChange={(e) => setFormData({...formData, contactInfo: {...(formData.contactInfo || { supportEmail: '', officeAddress: '', discordUrl: '', enableContactForm: true }), supportPhone: e.target.value}})} 
                  placeholder="+1 (800) 555-0199"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Office / Business Address</label>
                <input 
                  type="text" 
                  value={formData.contactInfo?.officeAddress || ''} 
                  onChange={(e) => setFormData({...formData, contactInfo: {...(formData.contactInfo || { supportEmail: '', supportPhone: '', discordUrl: '', enableContactForm: true }), officeAddress: e.target.value}})} 
                  placeholder="100 Tech Boulevard, Suite 400, San Francisco, CA"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Discord / Community Server URL</label>
                <input 
                  type="text" 
                  value={formData.contactInfo?.discordUrl || ''} 
                  onChange={(e) => setFormData({...formData, contactInfo: {...(formData.contactInfo || { supportEmail: '', supportPhone: '', officeAddress: '', enableContactForm: true }), discordUrl: e.target.value}})} 
                  placeholder="https://discord.gg/cheapagents"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '8px' }}>
                <input 
                  type="checkbox" 
                  id="enableContactForm" 
                  checked={formData.contactInfo?.enableContactForm ?? true} 
                  onChange={(e) => setFormData({...formData, contactInfo: {...(formData.contactInfo || { supportEmail: '', supportPhone: '', officeAddress: '', discordUrl: '' }), enableContactForm: e.target.checked}})} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="enableContactForm" style={{ fontSize: '14px', color: 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer' }}>
                  Enable Interactive Contact Form on Website
                </label>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', color: 'var(--color-text-muted)' }}>Loading Settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
