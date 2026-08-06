'use client';

import { useState, useEffect } from 'react';
import { useSiteSettings, SiteSettings } from '@/components/settings-provider';
import { Save, LayoutDashboard, Zap, Loader2 } from 'lucide-react';

export default function DashSettingsPage() {
  const { settings, refreshSettings } = useSiteSettings();
  const [formData, setFormData] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

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
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save dashboard settings', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>User Dashboard Settings</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage the announcement banner, limits, and behavior of the user dashboard.</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Card 1: Welcome Announcement Bar */}
        <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutDashboard size={18} color="var(--color-primary)" /> Welcome Announcement Bar
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Welcome Title</label>
              <input 
                type="text" 
                value={formData.dashboardSettings?.welcomeTitle || ''} 
                onChange={(e) => setFormData({...formData, dashboardSettings: {...(formData.dashboardSettings || { welcomeSubtitle: '', defaultMonthlyQuota: '$50.00', allowByok: true, announcementBanner: '' }), welcomeTitle: e.target.value}})} 
                placeholder="Welcome back, {userName}!"
                style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Welcome Subtitle</label>
              <input 
                type="text" 
                value={formData.dashboardSettings?.welcomeSubtitle || ''} 
                onChange={(e) => setFormData({...formData, dashboardSettings: {...(formData.dashboardSettings || { welcomeTitle: '', defaultMonthlyQuota: '$50.00', allowByok: true, announcementBanner: '' }), welcomeSubtitle: e.target.value}})} 
                placeholder="You've used {percent}% of your monthly token limit. {remaining} tokens remaining."
                style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} 
              />
            </div>
          </div>
        </section>

        {/* Card 2: Announcement Bar 2 */}
        <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--color-primary)" /> Announcement Bar 2
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Global Announcement Banner Text</label>
            <input 
              type="text" 
              value={formData.dashboardSettings?.announcementBanner || ''} 
              onChange={(e) => setFormData({...formData, dashboardSettings: {...(formData.dashboardSettings || { welcomeTitle: '', welcomeSubtitle: '', defaultMonthlyQuota: '$50.00', allowByok: true }), announcementBanner: e.target.value}})} 
              placeholder="⚡ New models live!"
              style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} 
            />
          </div>
        </section>

        {/* Card 3: User Quota */}
        <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--color-primary)" /> Monthly User Quota
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Default User Monthly Quota Limit</label>
            <input 
              type="text" 
              value={formData.dashboardSettings?.defaultMonthlyQuota || ''} 
              onChange={(e) => setFormData({...formData, dashboardSettings: {...(formData.dashboardSettings || { welcomeTitle: '', welcomeSubtitle: '', allowByok: true, announcementBanner: '' }), defaultMonthlyQuota: e.target.value}})} 
              placeholder="$50.00"
              style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none' }} 
            />
          </div>
        </section>

        {/* Card 4: BYOK Settings */}
        <section style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--color-primary)" /> BYOK (Bring Your Own Keys)
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input 
              type="checkbox" 
              id="allowByok" 
              checked={formData.dashboardSettings?.allowByok ?? true} 
              onChange={(e) => setFormData({...formData, dashboardSettings: {...(formData.dashboardSettings || { welcomeTitle: '', welcomeSubtitle: '', defaultMonthlyQuota: '$50.00', announcementBanner: '' }), allowByok: e.target.checked}})} 
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
            <label htmlFor="allowByok" style={{ fontSize: '14px', color: 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer' }}>
              Allow Bring Your Own Keys (BYOK) Feature for users
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
