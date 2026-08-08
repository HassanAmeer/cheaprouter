'use client';

import React, { useState, useEffect } from 'react';
import { Check, CreditCard, Download, ArrowUpRight, Zap, Shield, Crown, Terminal, Plug, MessageSquare, Bot, Globe, Sparkles } from 'lucide-react';
import { Button, Badge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import styles from '../dashboard.module.css';
import { useSiteSettings } from '@/components/settings-provider';

const INVOICES = [
  { id: 'INV-2026-07', date: 'Jul 1, 2026', amount: '$15.00', status: 'Paid' },
  { id: 'INV-2026-06', date: 'Jun 1, 2026', amount: '$15.00', status: 'Paid' },
  { id: 'INV-2026-05', date: 'May 1, 2026', amount: '$15.00', status: 'Paid' },
  { id: 'INV-2026-04', date: 'Apr 1, 2026', amount: '$15.00', status: 'Paid' },
];

// Default mock active plan map per category tab
const DEFAULT_ACTIVE_PLANS: Record<string, { planId: string; used: number; limit: number }> = {
  tab_cli: { planId: 'p_cli_3', used: 340, limit: 2000 },
  tab_api: { planId: 'p_api_2', used: 1240, limit: 10000 },
  tab_chat: { planId: 'p_chat_3', used: 85, limit: 500 },
  tab_agents: { planId: 'p_agents_1', used: 12, limit: 100 },
};

export default function BillingPage() {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<string>('');
  
  // State for user's active plan selection per tab
  const [activePlans, setActivePlans] = useState<Record<string, { planId: string; used: number; limit: number }>>(DEFAULT_ACTIVE_PLANS);

  useEffect(() => {
    if (settings?.pricingSection?.tabs?.length > 0 && !activeTab) {
      setActiveTab(settings.pricingSection.tabs[0].id);
    }
  }, [settings, activeTab]);

  const tabs = settings?.pricingSection?.tabs || [];
  const currentTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  // Helper to determine metric details for current tab
  const getMetricInfo = (tabName: string = '') => {
    const name = tabName.toLowerCase();
    if (name.includes('cli')) {
      return { label: 'CLI Requests', unit: 'CLI requests executed', icon: Terminal };
    }
    if (name.includes('api')) {
      return { label: 'API Hits', unit: 'API hits used', icon: Plug };
    }
    if (name.includes('chat')) {
      return { label: 'Chats', unit: 'chats completed', icon: MessageSquare };
    }
    if (name.includes('website')) {
      return { label: 'Websites Built', unit: 'websites deployed', icon: Globe };
    }
    if (name.includes('agent')) {
      return { label: 'Agent Runs', unit: 'agent runs executed', icon: Bot };
    }
    return { label: 'Requests', unit: 'requests used', icon: Zap };
  };

  const metricInfo = getMetricInfo(currentTabObj?.name);
  const MetricIcon = metricInfo.icon;

  // Active plan for current tab
  const activeState = activePlans[activeTab] || { 
    planId: currentTabObj?.plans?.[0]?.id || '', 
    used: 120, 
    limit: 1000 
  };

  const activePlanObj = currentTabObj?.plans?.find(p => p.id === activeState.planId) || currentTabObj?.plans?.[0] || {
    id: 'default',
    name: 'Free',
    price: '$0',
    period: '',
    desc: 'Basic Plan',
    features: [],
    cta: 'Select Plan',
    ctaLink: '',
    featured: false
  };

  const usagePercent = Math.min(100, Math.round((activeState.used / activeState.limit) * 100));

  const handleSelectPlan = (planId: string, planName: string) => {
    setActivePlans(prev => ({
      ...prev,
      [activeTab]: {
        planId,
        used: prev[activeTab]?.used || 0,
        limit: planId.includes('3') ? 10000 : planId.includes('2') ? 2000 : 500
      }
    }));
    toast(`Successfully switched to ${planName} plan for ${currentTabObj?.name}!`, 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 6 }}>Billing & Subscriptions</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Manage active plans, view usage hits, and select subscriptions for each service.
          </p>
        </div>

        {/* Top Category Tabs Bar */}
        {tabs.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '6px',
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            padding: '6px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const TabIcon = getMetricInfo(tab.name).icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    background: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 2px 10px rgba(124, 58, 237, 0.3)' : 'none'
                  }}
                >
                  <TabIcon size={15} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Plan Card for Selected Category */}
      <div className="card" style={{ 
        marginBottom: 28, 
        position: 'relative', 
        overflow: 'hidden', 
        border: '1px solid var(--color-primary)', 
        padding: '28px',
        background: 'linear-gradient(135deg, var(--color-card-bg) 0%, rgba(124, 58, 237, 0.03) 100%)'
      }}>
        {/* Top Right Ribbon Badge showing Tab Name */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          background: 'var(--color-primary)', 
          color: '#fff', 
          fontSize: '11px', 
          fontWeight: 700, 
          padding: '6px 18px', 
          borderBottomLeftRadius: '8px',
          letterSpacing: '0.8px'
        }}>
          {currentTabObj?.name?.toUpperCase()}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Crown size={22} color="var(--color-primary)" />
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{activePlanObj.name} Plan</h2>
              <Badge tone={!activePlanObj.price || activePlanObj.price === '$0' ? "neutral" : "primary"}>
                {!activePlanObj.price || activePlanObj.price === '$0' ? "Free Tier" : "Active"}
              </Badge>
            </div>
            
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '15px' }}>
                {activePlanObj.price}{activePlanObj.period || '/mo'}
              </span>
              {' · '}
              Duration: <strong style={{ color: 'var(--color-text-main)' }}>{activePlanObj.durationDays ? `${activePlanObj.durationDays} Days` : 'Monthly (30 Days)'}</strong>
            </p>

            {/* Usage Progress */}
            <div style={{ maxWidth: 500 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-main)' }}>
                  <MetricIcon size={14} color="var(--color-primary)" /> {metricInfo.label} Usage
                </span>
                <span style={{ color: 'var(--color-primary)' }}>{usagePercent}%</span>
              </div>

              <div className={styles.progressBar} style={{ height: 8, borderRadius: 4, background: 'var(--color-bg-soft)' }}>
                <div 
                  className={styles.progressFill} 
                  style={{ 
                    width: `${usagePercent}%`, 
                    background: 'linear-gradient(90deg, var(--color-primary), #ff6b6b)',
                    borderRadius: 4 
                  }} 
                />
              </div>

              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 8 }}>
                <strong>{activeState.used.toLocaleString()}</strong> / {activeState.limit.toLocaleString()} {metricInfo.unit} this cycle
              </p>

              {/* Inline Metadata Row below Usage Bar with Vertical Dividers */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 14, 
                marginTop: 14, 
                paddingTop: 12,
                borderTop: '1px stroke var(--color-border)',
                fontSize: '12px', 
                color: 'var(--color-text-muted)',
                flexWrap: 'wrap'
              }}>
                <div>
                  Starting Date: <strong style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>Jul 15, 2026</strong>
                </div>
                <div style={{ width: '1px', height: '14px', background: 'var(--color-border)' }} />
                <div>
                  Expiry Date: <strong style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>Aug 15, 2026</strong>
                </div>
                <div style={{ width: '1px', height: '14px', background: 'var(--color-border)' }} />
                <div>
                  Billing Cycle: <strong style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>Monthly</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', alignSelf: 'center' }}>
            {/* Upgrade vs Upgraded Button */}
            {!activePlanObj.price || activePlanObj.price === '$0' ? (
              <Button 
                variant="primary" 
                onClick={() => {
                  document.getElementById('available-plans-section')?.scrollIntoView({ behavior: 'smooth' });
                  toast(`Choose a plan below to upgrade your ${currentTabObj?.name} tier!`, 'info');
                }}
              >
                Upgrade Plan
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                disabled 
                style={{ opacity: 0.95, cursor: 'default', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              >
                <Check size={16} color="var(--color-success)" /> Upgraded
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={() => toast(`Opening subscription portal for ${currentTabObj?.name}…`, 'info')}>
              Manage Subscription
            </Button>
          </div>
        </div>
      </div>

      {/* Plan Comparison Section */}
      <div id="available-plans-section" style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Available Plans for {currentTabObj?.name}</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Choose a plan to upgrade or switch your {currentTabObj?.name} tier.
            </p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {currentTabObj?.plans?.map((plan) => {
            const isCurrentActive = plan.id === activeState.planId;
            return (
              <div 
                key={plan.id} 
                className="card" 
                style={{
                  padding: '24px', 
                  position: 'relative',
                  border: isCurrentActive 
                    ? '2px solid var(--color-primary)' 
                    : plan.featured 
                    ? '2px solid rgba(124, 58, 237, 0.4)' 
                    : '1px solid var(--color-border)',
                  background: isCurrentActive ? 'rgba(124, 58, 237, 0.02)' : 'var(--color-card-bg)',
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
              >
                {isCurrentActive && (
                  <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)' }}>
                    <Badge tone="primary">Current Active Plan</Badge>
                  </div>
                )}
                {!isCurrentActive && plan.featured && (
                  <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)' }}>
                    <Badge tone="primary">Popular</Badge>
                  </div>
                )}

                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: 14 }}>{plan.desc}</p>
                
                <div style={{ fontSize: '26px', fontWeight: 800, marginBottom: 16, color: 'var(--color-text-main)' }}>
                  {plan.price}<span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)' }}>{plan.period}</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      <Check size={14} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 2 }} /> 
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={isCurrentActive ? "ghost" : plan.featured ? "primary" : "secondary"} 
                  disabled={isCurrentActive}
                  onClick={() => handleSelectPlan(plan.id, plan.name)}
                  style={{ width: '100%' }}
                >
                  {isCurrentActive ? 'Active Plan' : plan.cta || 'Select Plan'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 16 }}>Payment Method</h2>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
          <div style={{
            width: 48, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #1a1f71, #2a2f91)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11
          }}>
            VISA
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Visa ending in 4242</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Expires 09/2028 · Default payment method</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => toast('Card update portal', 'info')}>Update Card</Button>
        </div>
      </div>

      {/* Invoices */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Invoice History</h2>
          <button style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
            Download All <Download size={13} />
          </button>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.id}>
                  <td><strong style={{ fontSize: '13px' }}>{inv.id}</strong></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{inv.date}</td>
                  <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                  <td><Badge tone="success"><Check size={11} /> {inv.status}</Badge></td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => toast('Downloading invoice…')}
                      style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Download size={13} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

