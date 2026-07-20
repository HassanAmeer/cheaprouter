'use client';
import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Save, Image as ImageIcon, Type, MousePointer2, Settings2, HelpCircle, AlignLeft, LayoutPanelLeft, Plus, X } from 'lucide-react';
import { useSiteSettings, SiteSettings } from '@/components/settings-provider';

export default function SettingsPage() {
  const { settings, refreshSettings } = useSiteSettings();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'marquee' | 'demand' | 'faq' | 'footer'>('general');

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
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
        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: activeTab === id ? 'var(--color-primary-soft)' : 'transparent',
        color: activeTab === id ? 'var(--color-primary)' : 'var(--color-text-muted)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' 
      }}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Content Management System</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Dynamically manage every section of your landing page from here.</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <Save size={16} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', overflowX: 'auto' }}>
        <TabBtn id="general" label="General & Hero" icon={Settings2} />
        <TabBtn id="marquee" label="Marquee Providers" icon={ImageIcon} />
        <TabBtn id="demand" label="Demand Section" icon={AlignLeft} />
        <TabBtn id="faq" label="FAQs" icon={HelpCircle} />
        <TabBtn id="footer" label="Footer & Socials" icon={LayoutPanelLeft} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* ================= GENERAL TAB ================= */}
        {activeTab === 'general' && (
          <>
            <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={18} color="var(--color-primary)" /> Brand Identity
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Brand Name</label>
                  <input type="text" value={formData.brandName} onChange={(e) => handleChange('brandName', e.target.value)} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Favicon URL</label>
                  <input type="text" value={formData.faviconUrl} onChange={(e) => handleChange('faviconUrl', e.target.value)} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                </div>
              </div>
            </section>

            <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Type size={18} color="var(--color-primary)" /> Hero Section Content
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Main Heading (Static part)</label>
                  <input type="text" value={formData.heroHeading} onChange={(e) => handleChange('heroHeading', e.target.value)} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Animated Looping Texts (Comma separated)</label>
                  <input type="text" value={formData.heroAnimatedTexts.join(', ')} onChange={(e) => handleChange('heroAnimatedTexts', e.target.value.split(',').map(s => s.trim()))} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Subtitle (Supports HTML like &lt;strong&gt;)</label>
                  <textarea value={formData.heroSubtitle} onChange={(e) => handleChange('heroSubtitle', e.target.value)} rows={3} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', resize: 'vertical' }} />
                </div>
              </div>
            </section>
          </>
        )}

        {/* ================= MARQUEE TAB ================= */}
        {activeTab === 'marquee' && (
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

        {/* ================= DEMAND SECTION TAB ================= */}
        {activeTab === 'demand' && (
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

        {/* ================= FAQ TAB ================= */}
        {activeTab === 'faq' && (
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

        {/* ================= FOOTER TAB ================= */}
        {activeTab === 'footer' && (
          <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Footer & Socials</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Copyright Text</label>
              <input type="text" value={formData.footer.copyrightText} onChange={(e) => setFormData({...formData, footer: {...formData.footer, copyrightText: e.target.value}})} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Social Links</h3>
              <button onClick={() => setFormData({...formData, footer: {...formData.footer, socialLinks: [...formData.footer.socialLinks, { id: `sl_${Date.now()}`, platform: 'Platform', url: 'https://' }]}})} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={16} /> Add Link
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formData.footer.socialLinks.map((link, idx) => (
                <div key={link.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '16px', alignItems: 'center', background: 'var(--color-bg-soft)', padding: '16px', borderRadius: '12px' }}>
                  <input type="text" value={link.platform} onChange={(e) => {
                    const newLinks = [...formData.footer.socialLinks]; newLinks[idx].platform = e.target.value; setFormData({...formData, footer: {...formData.footer, socialLinks: newLinks}});
                  }} placeholder="Platform Name" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  
                  <input type="text" value={link.url} onChange={(e) => {
                    const newLinks = [...formData.footer.socialLinks]; newLinks[idx].url = e.target.value; setFormData({...formData, footer: {...formData.footer, socialLinks: newLinks}});
                  }} placeholder="URL" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} />
                  
                  <button onClick={() => {
                    setFormData({...formData, footer: {...formData.footer, socialLinks: formData.footer.socialLinks.filter(l => l.id !== link.id)}});
                  }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><X size={16}/></button>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
