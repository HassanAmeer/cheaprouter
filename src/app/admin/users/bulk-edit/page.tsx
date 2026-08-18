'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, HardDrive, Zap, Mail, Shield, Calendar } from 'lucide-react';
import AdminLayout from '../../layout';

export default function BulkEditUsersPage() {
  const router = useRouter();
  const [ids, setIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  
  const [updates, setUpdates] = useState<any>({});

  useEffect(() => {
    const stored = localStorage.getItem('bulkEditUserIds');
    if (stored) {
      try {
        setIds(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      router.push('/admin/users');
    }
  }, [router]);

  const handleUpdate = (field: string, value: any) => {
    setUpdates((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Filter out empty string values to avoid overwriting existing data with blanks
    const filteredUpdates: any = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== '') {
        filteredUpdates[key] = val;
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      alert('No changes to apply.');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/users/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids, data: filteredUpdates })
      });
      if (res.ok) {
        alert(`Successfully updated ${ids.length} users!`);
        router.push('/admin/users');
      } else {
        alert('Failed to apply bulk updates.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating users.');
    } finally {
      setSaving(false);
    }
  };

  if (ids.length === 0) return <div style={{ padding: '40px' }}>Loading...</div>;

  const planTypes = [
    { key: 'plan_cli', label: 'CLI Plan', icon: HardDrive },
    { key: 'plan_api', label: 'API Plan', icon: Zap },
    { key: 'plan_chat', label: 'Chat Plan', icon: Mail },
    { key: 'plan_agents', label: 'Websites Plan', icon: Shield },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', color: 'var(--color-text-main)' }}>
      <button 
        onClick={() => router.push('/admin/users')} 
        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}
      >
        <ArrowLeft size={16} /> Back to Users
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Bulk Edit Plans</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
            Applying changes to <strong style={{ color: 'var(--color-primary)' }}>{ids.length} selected users</strong>. Leave a field blank to keep its current value for each user.
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={18} /> {saving ? 'Applying...' : 'Apply to All Selected'}
        </button>
      </div>

      <div className="card glass-card" style={{ padding: '32px', borderRadius: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 24px 0' }}>Subscription Overrides</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {planTypes.map(pt => {
            const Icon = pt.icon;
            return (
              <div key={pt.key} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', alignItems: 'end', paddingBottom: '20px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={14} /> {pt.label}
                  </label>
                  <select 
                    value={updates[pt.key] || ''} 
                    onChange={e => handleUpdate(pt.key, e.target.value)} 
                    style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '12px', borderRadius: '10px', color: 'var(--color-text-main)', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="" style={{ background: '#1a1a1a', color: '#fff' }}>-- No Change --</option>
                    <option value="Free" style={{ background: '#1a1a1a', color: '#fff' }}>Free</option>
                    <option value="Starter" style={{ background: '#1a1a1a', color: '#fff' }}>Starter</option>
                    <option value="Pro" style={{ background: '#1a1a1a', color: '#fff' }}>Pro</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Start Date</label>
                  <input 
                    type="datetime-local" 
                    value={updates[`${pt.key}_start`] ? updates[`${pt.key}_start`].slice(0, 16) : ''} 
                    onChange={e => handleUpdate(`${pt.key}_start`, e.target.value ? new Date(e.target.value).toISOString() : null)} 
                    style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '11px', borderRadius: '10px', color: 'var(--color-text-main)', fontSize: '13px', outline: 'none' }} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Expiry Date</label>
                  <input 
                    type="datetime-local" 
                    value={updates[`${pt.key}_expiry`] ? updates[`${pt.key}_expiry`].slice(0, 16) : ''} 
                    onChange={e => handleUpdate(`${pt.key}_expiry`, e.target.value ? new Date(e.target.value).toISOString() : null)} 
                    style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '11px', borderRadius: '10px', color: 'var(--color-text-main)', fontSize: '13px', outline: 'none' }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
