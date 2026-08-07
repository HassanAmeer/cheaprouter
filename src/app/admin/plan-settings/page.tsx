'use client';
import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Save, Plus, X } from 'lucide-react';
import { useSiteSettings, SiteSettings } from '@/components/settings-provider';

export default function PlanSettingsPage() {
  const { settings, refreshSettings } = useSiteSettings();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activePricingTab, setActivePricingTab] = useState('tab_cli');

  useEffect(() => {
    setFormData(settings);
    if (settings?.pricingSection?.tabs?.length > 0) {
       if (!settings.pricingSection.tabs.find(t => t.id === activePricingTab)) {
         setActivePricingTab(settings.pricingSection.tabs[0].id);
       }
    }
  }, [settings, activePricingTab]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSaved(true);
        refreshSettings();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Plan Settings</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage pricing tabs and configuration for all your product plans.</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
          background: 'transparent', border: '2px solid var(--color-primary)',
          color: 'var(--color-primary)', borderRadius: '8px', fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          opacity: saving ? 0.7 : 1
        }}>
          <Save size={18} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Pricing Section Header</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <input type="text" value={formData.pricingSection?.title || ''} onChange={(e) => setFormData({...formData, pricingSection: {...(formData.pricingSection || { subtitle: '', tabs: [] }), title: e.target.value}})} placeholder="Section Title" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
          <input type="text" value={formData.pricingSection?.subtitle || ''} onChange={(e) => setFormData({...formData, pricingSection: {...(formData.pricingSection || { title: '', tabs: [] }), subtitle: e.target.value}})} placeholder="Section Subtitle" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Product Tabs</h3>
          <button onClick={() => {
            const newTabs = [...(formData.pricingSection?.tabs || []), { id: `tab_${Date.now()}`, name: 'New Tab', plans: [] }];
            setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
          }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> Add Tab
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          {(formData.pricingSection?.tabs || []).map((tab, tIdx) => (
            <div key={tab.id} style={{ display: 'flex', alignItems: 'center', background: activePricingTab === tab.id ? 'var(--color-primary-soft)' : 'var(--color-input-bg)', border: activePricingTab === tab.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: '8px', padding: '4px 8px 4px 12px' }}>
              <input 
                type="text" 
                value={tab.name} 
                onChange={(e) => {
                  const newTabs = [...(formData.pricingSection?.tabs || [])];
                  newTabs[tIdx].name = e.target.value;
                  setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                }}
                onClick={() => setActivePricingTab(tab.id)}
                style={{ background: 'transparent', border: 'none', color: activePricingTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-main)', outline: 'none', fontWeight: 600, width: '100px' }}
              />
              <button onClick={() => {
                const newTabs = (formData.pricingSection?.tabs || []).filter(t => t.id !== tab.id);
                setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                if (activePricingTab === tab.id && newTabs.length > 0) setActivePricingTab(newTabs[0].id);
              }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}><X size={14}/></button>
            </div>
          ))}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '32px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Pricing Plans for Selected Tab</h3>
          <button onClick={() => {
            const newTabs = [...(formData.pricingSection?.tabs || [])];
            const tabIdx = newTabs.findIndex(t => t.id === activePricingTab);
            if (tabIdx >= 0) {
              newTabs[tabIdx].plans = [...(newTabs[tabIdx].plans || []), { id: `p_${Date.now()}`, name: 'New Plan', price: '$0', period: '/mo', desc: 'Desc', features: ['Feature 1'], cta: 'Buy Now', ctaLink: '#', featured: false, durationDays: 30 }];
              setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
            }
          }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> Add Plan
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {(() => {
            const activeTabObj = (formData.pricingSection?.tabs || []).find(t => t.id === activePricingTab);
            if (!activeTabObj) return <div style={{ color: 'var(--color-text-muted)' }}>No tab selected or tab has been deleted.</div>;
            return (activeTabObj.plans || []).map((plan, idx) => (
              <div key={plan.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-bg-soft)', padding: '24px', borderRadius: '12px', position: 'relative' }}>
                <button onClick={() => {
                  const newTabs = [...(formData.pricingSection?.tabs || [])];
                  const tabIdx = newTabs.findIndex(t => t.id === activePricingTab);
                  newTabs[tabIdx].plans = newTabs[tabIdx].plans.filter(p => p.id !== plan.id);
                  setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                }} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16}/></button>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Plan Title</label>
                    <input type="text" value={plan.name} onChange={(e) => {
                      const newTabs = [...(formData.pricingSection?.tabs || [])];
                      const tabIdx = newTabs.findIndex(t => t.id === activePricingTab);
                      newTabs[tabIdx].plans[idx].name = e.target.value; setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                    }} placeholder="Plan Name" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Price Display (e.g. $15)</label>
                    <input type="text" value={plan.price} onChange={(e) => {
                      const newTabs = [...(formData.pricingSection?.tabs || [])];
                      const tabIdx = newTabs.findIndex(t => t.id === activePricingTab);
                      newTabs[tabIdx].plans[idx].price = e.target.value; setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                    }} placeholder="Price (e.g. $15)" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Period Display (e.g. /mo, /year)</label>
                    <input type="text" value={plan.period} onChange={(e) => {
                      const newTabs = [...(formData.pricingSection?.tabs || [])];
                      const tabIdx = newTabs.findIndex(t => t.id === activePricingTab);
                      newTabs[tabIdx].plans[idx].period = e.target.value; setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                    }} placeholder="Period (e.g. /mo)" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Short Description</label>
                  <input type="text" value={plan.desc} onChange={(e) => {
                    const newTabs = [...(formData.pricingSection?.tabs || [])];
                    const tabIdx = newTabs.findIndex(t => t.id === activePricingTab);
                    newTabs[tabIdx].plans[idx].desc = e.target.value; setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                  }} placeholder="Description" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Features (One bullet point per line)</label>
                  <textarea value={plan.features.join('\n')} onChange={(e) => {
                    const newTabs = [...(formData.pricingSection?.tabs || [])];
                    const tabIdx = newTabs.findIndex(t => t.id === activePricingTab);
                    newTabs[tabIdx].plans[idx].features = e.target.value.split('\n').filter(Boolean); setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                  }} placeholder="Features (one per line)" rows={4} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', resize: 'vertical' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Duration (Days, 0 = Lifetime)</label>
                    <input type="number" value={plan.durationDays || ''} onChange={(e) => {
                      const newTabs = [...(formData.pricingSection?.tabs || [])];
                      const tabIdx = newTabs.findIndex(t => t.id === activePricingTab);
                      newTabs[tabIdx].plans[idx].durationDays = parseInt(e.target.value) || 0; setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                    }} placeholder="Days" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>CTA Button Text</label>
                    <input type="text" value={plan.cta} onChange={(e) => {
                      const newTabs = [...(formData.pricingSection?.tabs || [])];
                      const tabIdx = newTabs.findIndex(t => t.id === activePricingTab);
                      newTabs[tabIdx].plans[idx].cta = e.target.value; setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                    }} placeholder="CTA Button Text" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>CTA Link</label>
                    <input type="text" value={plan.ctaLink} onChange={(e) => {
                      const newTabs = [...(formData.pricingSection?.tabs || [])];
                      const tabIdx = newTabs.findIndex(t => t.id === activePricingTab);
                      newTabs[tabIdx].plans[idx].ctaLink = e.target.value; setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                    }} placeholder="CTA Link" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', cursor: 'pointer', paddingBottom: '10px' }}>
                    <input type="checkbox" checked={plan.featured} onChange={(e) => {
                      const newTabs = [...(formData.pricingSection?.tabs || [])];
                      const tabIdx = newTabs.findIndex(t => t.id === activePricingTab);
                      newTabs[tabIdx].plans[idx].featured = e.target.checked; setFormData({...formData, pricingSection: {...formData.pricingSection, tabs: newTabs}});
                    }} style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }} />
                    Featured
                  </label>
                </div>
              </div>
            ));
          })()}
        </div>
      </section>
    </div>
  );
}
