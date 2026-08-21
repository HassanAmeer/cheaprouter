'use client';

import { useState, useEffect } from 'react';
import { useSiteSettings, SiteSettings } from '@/components/settings-provider';
import { Save, Gift, Loader2, DollarSign, MessageSquareText, ShieldCheck } from 'lucide-react';

export default function ReferSettingsPage() {
  const { settings, refreshSettings } = useSiteSettings();
  const [formData, setFormData] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` },
        // Only this editor's section — avoids clobbering concurrent saves elsewhere.
        body: JSON.stringify({ referralSettings: formData.referralSettings })
      });
      if (res.ok) {
        await refreshSettings();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const isEnabled = formData.referralSettings?.isEnabled ?? true;

  return (
    <div style={{ width: '100%', maxWidth: '100%', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>Referral Settings</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Configure your platform's referral engine and content creator rewards.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '12px 24px', borderRadius: '8px',
            fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(var(--color-primary-rgb), 0.2)'
          }}
        >
          {saving ? <Loader2 size={18} className="spin" /> : (saved ? <CheckCircleIcon /> : <Save size={18} />)}
          {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save Changes')}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Premium Settings Card */}
        <section style={{ 
          background: 'var(--color-card-bg)', 
          border: '1px solid var(--color-border)', 
          borderRadius: '16px', 
          padding: '40px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease'
        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', 
              background: 'rgba(var(--color-primary-rgb), 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <Gift size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                Reward Configuration
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Customize the bonus amounts and promotional messaging.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px', marginBottom: '32px' }}>
            
            {/* Standard Bonus Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} color="var(--color-primary)" /> Standard Referral Bonus
              </label>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Bonus given to both the referrer and the new user upon signup.</p>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={formData.referralSettings?.standardBonus || ''} 
                  onFocus={() => setFocusedField('standard')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setFormData({...formData, referralSettings: {...(formData.referralSettings || { isEnabled: true, creatorBonus: '$20.00', alertMessage: '' }), standardBonus: e.target.value}})} 
                  placeholder="$5.00"
                  style={{ 
                    width: '100%', background: 'var(--color-input-bg)', 
                    border: `1px solid ${focusedField === 'standard' ? 'var(--color-primary)' : 'var(--color-border)'}`, 
                    padding: '16px 20px', borderRadius: '12px', color: 'var(--color-text-main)', outline: 'none', fontSize: '16px',
                    transition: 'all 0.2s ease',
                    boxShadow: focusedField === 'standard' ? '0 0 0 4px rgba(var(--color-primary-rgb), 0.1)' : 'none'
                  }} 
                />
              </div>
            </div>

            {/* Creator Alert Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquareText size={16} color="var(--color-primary)" /> Creator Alert Text (Shimmer Box)
              </label>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>The alert text shown to users to encourage video creation.</p>
              <div style={{ position: 'relative' }}>
                <textarea 
                  value={formData.referralSettings?.alertMessage || ''} 
                  onFocus={() => setFocusedField('alert')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setFormData({...formData, referralSettings: {...(formData.referralSettings || { isEnabled: true, standardBonus: '$5.00', creatorBonus: '$20.00' }), alertMessage: e.target.value}})} 
                  placeholder="Attention Content Creators! Make a video about CheapRouter on YouTube or TikTok, get 100+ views, and earn a $20.00 platform credit instantly!"
                  style={{ 
                    width: '100%', background: 'var(--color-input-bg)', 
                    border: `1px solid ${focusedField === 'alert' ? 'var(--color-primary)' : 'var(--color-border)'}`, 
                    padding: '16px 20px', borderRadius: '12px', color: 'var(--color-text-main)', outline: 'none', 
                    minHeight: '130px', fontFamily: 'inherit', resize: 'vertical', fontSize: '15px', lineHeight: '1.6',
                    transition: 'all 0.2s ease',
                    boxShadow: focusedField === 'alert' ? '0 0 0 4px rgba(var(--color-primary-rgb), 0.1)' : 'none'
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Master Toggle Switch */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '20px', padding: '28px', 
            background: isEnabled ? 'rgba(var(--color-primary-rgb), 0.05)' : 'var(--color-bg-alt)', 
            borderRadius: '16px', border: `1px solid ${isEnabled ? 'rgba(var(--color-primary-rgb), 0.2)' : 'var(--color-border)'}`,
            transition: 'all 0.2s ease'
          }}>
            <button 
              type="button"
              role="switch"
              aria-checked={isEnabled}
              onClick={() => {
                setFormData({...formData, referralSettings: {...(formData.referralSettings || { standardBonus: '$5.00', creatorBonus: '$20.00', alertMessage: '' }), isEnabled: !isEnabled}});
              }}
              style={{
                position: 'relative', display: 'inline-flex', alignItems: 'center', width: '56px', height: '32px', borderRadius: '9999px',
                background: isEnabled ? 'var(--color-primary)' : 'var(--color-border)',
                transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer', border: 'none', padding: '4px',
                boxShadow: isEnabled ? '0 0 10px rgba(var(--color-primary-rgb), 0.2)' : 'none'
              }}
            >
              <span style={{ 
                display: 'inline-block', width: '24px', height: '24px', background: '#fff', borderRadius: '50%', 
                transform: isEnabled ? 'translateX(24px)' : 'translateX(0)', 
                transition: 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
              }} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '16px', color: 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => {
                  setFormData({...formData, referralSettings: {...(formData.referralSettings || { standardBonus: '$5.00', creatorBonus: '$20.00', alertMessage: '' }), isEnabled: !isEnabled}});
                }}>
                Enable Global Program {isEnabled && <ShieldCheck size={16} color="var(--color-primary)" />}
              </label>
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                If disabled, the Refer & Earn dashboard tab will show a disabled state to all users.
              </span>
            </div>
          </div>
          
        </section>
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
