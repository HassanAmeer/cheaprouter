'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, CreditCard, Download, ArrowUpRight, Zap, Shield, Crown, Terminal, Plug, MessageSquare, Bot, Globe, Sparkles, Wallet, Coins, Plus, ArrowDownCircle, ArrowUpCircle, Loader2 } from 'lucide-react';
import { Button, Badge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import styles from '../dashboard.module.css';
import { useSiteSettings } from '@/components/settings-provider';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';

const INVOICES = [
  { id: 'INV-2026-07', date: 'Jul 1, 2026', amount: '$15.00', status: 'Paid' },
  { id: 'INV-2026-06', date: 'Jun 1, 2026', amount: '$15.00', status: 'Paid' },
  { id: 'INV-2026-05', date: 'May 1, 2026', amount: '$15.00', status: 'Paid' },
  { id: 'INV-2026-04', date: 'Apr 1, 2026', amount: '$15.00', status: 'Paid' },
];

const PRESET_FUNDS = [5, 10, 20, 50, 100];

// Default mock active plan map per category tab
const DEFAULT_ACTIVE_PLANS: Record<string, { planId: string; used: number; limit: number }> = {
  tab_cli: { planId: 'p_cli_3', used: 340, limit: 2000 },
  tab_api: { planId: 'p_api_2', used: 1240, limit: 10000 },
  tab_chat: { planId: 'p_chat_3', used: 85, limit: 500 },
  tab_agents: { planId: 'p_agents_1', used: 12, limit: 100 },
};

function planFieldFor(id: string): string {
  const v = String(id || '').toLowerCase();
  if (v.includes('cli')) return 'plan_cli';
  if (v.includes('api')) return 'plan_api';
  if (v.includes('chat')) return 'plan_chat';
  if (v.includes('agent')) return 'plan_agents';
  return 'plan';
}

function parsePrice(price: string | undefined): number {
  if (price === undefined || price === null) return 0;
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function parseLimit(planId: string): number {
  if (planId.includes('3')) return 10000;
  if (planId.includes('2')) return 2000;
  return 500;
}

function money(n: number): string {
  return `$${Number(n || 0).toFixed(2)}`;
}

function buildActiveFromUser(user: any, tabs: any[]): Record<string, { planId: string; used: number; limit: number }> {
  const map: Record<string, { planId: string; used: number; limit: number }> = {};
  for (const tab of tabs || []) {
    const plans = tab.plans || [];
    const field = planFieldFor(tab.id);
    const currentName = user?.[field] || (field === 'plan' ? user?.plan : null);
    const found = currentName ? plans.find((p: any) => p.name?.toLowerCase() === String(currentName).toLowerCase()) : undefined;
    const chosen = found || plans[0] || { id: '' };
    map[tab.id] = { planId: chosen.id || '', used: 0, limit: choicesLimit(chosen.id, plans) };
  }
  return Object.keys(map).length ? map : DEFAULT_ACTIVE_PLANS;
}

function choicesLimit(id: string, plans: any[]): number {
  if (!id) return 1000;
  return parseLimit(id);
}

export default function BillingPage() {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('');

  const [activePlans, setActivePlans] = useState<Record<string, { planId: string; used: number; limit: number }>>(DEFAULT_ACTIVE_PLANS);

  // Billing / balance state
  const [billing, setBilling] = useState<any>(null);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState<string>('10');
  const [addingFunds, setAddingFunds] = useState(false);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const fundsRef = useRef<HTMLDivElement | null>(null);

  const loadBilling = () => {
    api.getBilling().then(setBilling).catch(() => {});
  };

  useEffect(() => { loadBilling(); }, []);

  useEffect(() => {
    if (settings && user && settings?.pricingSection?.tabs?.length > 0) {
      setActivePlans(buildActiveFromUser(user, settings.pricingSection.tabs));
      setActiveTab((prev) => prev || settings.pricingSection.tabs[0].id);
    }
  }, [settings, user]);

  const tabs = settings?.pricingSection?.tabs || [];
  const currentTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  const getMetricInfo = (tabName: string = '') => {
    const name = tabName.toLowerCase();
    if (name.includes('cli')) return { label: 'CLI Requests', unit: 'CLI requests executed', icon: Terminal };
    if (name.includes('api')) return { label: 'API Hits', unit: 'API hits used', icon: Plug };
    if (name.includes('chat')) return { label: 'Chats', unit: 'chats completed', icon: MessageSquare };
    if (name.includes('website')) return { label: 'Websites Built', unit: 'websites deployed', icon: Globe };
    if (name.includes('agent')) return { label: 'Agent Runs', unit: 'agent runs executed', icon: Bot };
    return { label: 'Requests', unit: 'requests used', icon: Zap };
  };

  const metricInfo = getMetricInfo(currentTabObj?.name);
  const MetricIcon = metricInfo.icon;

  const activeState = activePlans[activeTab] || { planId: currentTabObj?.plans?.[0]?.id || '', used: 120, limit: 1000 };

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
  const balance = Number(billing?.balance ?? 0);

  const handleSelectPlan = (planId: string, planName: string) => {
    setActivePlans(prev => ({
      ...prev,
      [activeTab]: { planId, used: prev[activeTab]?.used || 0, limit: parseLimit(planId) }
    }));
    toast(`Successfully switched to ${planName} plan for ${currentTabObj?.name}!`, 'success');
  };

  const handleAddFunds = async () => {
    const amt = parseFloat(fundAmount);
    if (!amt || amt <= 0) { toast('Enter a valid amount', 'error'); return; }
    setAddingFunds(true);
    try {
      await api.topUp(amt);
      setFundAmount('');
      await loadBilling();
      toast(`${money(amt)} added to your account balance.`, 'success');
    } catch (e: any) {
      toast(e?.message || 'Failed to add funds', 'error');
    } finally {
      setAddingFunds(false);
    }
  };

  const handleUpgrade = async (plan: any) => {
    if (plan.id === activeState.planId && !activePlanObj.price) return;
    setUpgradingId(plan.id);
    const cost = parsePrice(plan.price);
    try {
      const res = await api.upgradePlan({
        planField: planFieldFor(plan.id),
        planId: plan.id,
        planName: plan.name,
        price: cost,
        durationDays: plan.durationDays ?? 30,
      });
      setActivePlans(prev => ({
        ...prev,
        [activeTab]: { planId: plan.id, used: prev[activeTab]?.used || 0, limit: parseLimit(plan.id) }
      }));
      await loadBilling();
      toast(
        cost > 0
          ? `${plan.name} plan activated — ${money(cost)} deducted from your balance.`
          : `${plan.name} plan selected for ${currentTabObj?.name}.`,
        'success'
      );
    } catch (e: any) {
      const msg = e?.message || 'Upgrade failed';
      if (msg.toLowerCase().includes('insufficient')) {
        toast('Insufficient balance. Please add funds to continue.', 'error');
        setShowAddFunds(true);
        setTimeout(() => fundsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      } else {
        toast(msg, 'error');
      }
    } finally {
      setUpgradingId(null);
    }
  };

  const txnArrow = (type: string) => type === 'upgrade' ? <ArrowDownCircle size={15} /> : <ArrowUpCircle size={15} />;

  return (
    <div>
      {/* ── Account Balance ── */}
      <div ref={fundsRef} style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20, marginBottom: 28, alignItems: 'stretch' }}>
        {/* Balance summary */}
        <div className="card" style={{
          padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, var(--color-card-bg) 0%, rgba(124, 58, 237, 0.05) 100%)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'var(--color-primary-soft)', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(124,58,237,0.25)'
            }}>
              <Wallet size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Account Balance</div>
              <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em' }}>{money(balance)}</div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
            Prepaid credit used to pay for plan upgrades. Add funds anytime — the amount is deducted from your balance when you upgrade.
          </p>
        </div>

        {/* Add funds */}
        <div className="card" style={{ padding: '24px', border: showAddFunds ? '1px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 2 }}>Add Funds</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>Top up your balance to upgrade your plans.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAddFunds(v => !v)}>
              <Plus size={15} /> {showAddFunds ? 'Hide' : 'Add Funds'}
            </Button>
          </div>

          {showAddFunds && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {PRESET_FUNDS.map(v => (
                  <button
                    key={v}
                    onClick={() => setFundAmount(String(v))}
                    style={{
                      padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                      border: `1px solid ${fundAmount === String(v) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: fundAmount === String(v) ? 'var(--color-primary-soft)' : 'transparent',
                      color: fundAmount === String(v) ? 'var(--color-primary)' : 'var(--color-text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    ${v}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontWeight: 700 }}>$</span>
                  <input
                    type="number"
                    min={1}
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="10"
                    style={{
                      width: '100%', padding: '11px 14px 11px 30px', borderRadius: '10px',
                      border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)',
                      color: 'var(--color-text-main)', fontSize: '14px', outline: 'none'
                    }}
                  />
                </div>
                <Button variant="primary" onClick={handleAddFunds} disabled={addingFunds}>
                  {addingFunds ? <Loader2 size={16} className="lucide-spin" /> : <Coins size={16} />}
                  Add
                </Button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '10px 0 0' }}>
                Funds are added instantly (simulated payment).
              </p>
            </div>
          )}
          {!showAddFunds && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Your funds pay for upgrades deduct from this balance.
            </div>
          )}
        </div>
      </div>

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
            display: 'flex', gap: '6px',
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
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
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
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'var(--color-primary)', color: '#fff', fontSize: '11px', fontWeight: 700,
          padding: '6px 18px', borderBottomLeftRadius: '8px', letterSpacing: '0.8px'
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
                  style={{ width: `${usagePercent}%`, background: 'linear-gradient(90deg, var(--color-primary), #ff6b6b)', borderRadius: 4 }}
                />
              </div>

              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 8 }}>
                <strong>{activeState.used.toLocaleString()}</strong> / {activeState.limit.toLocaleString()} {metricInfo.unit} this cycle
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, paddingTop: 12,
                borderTop: '1px stroke var(--color-border)', fontSize: '12px',
                color: 'var(--color-text-muted)', flexWrap: 'wrap'
              }}>
                <div>Starting Date: <strong style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>Jul 15, 2026</strong></div>
                <div style={{ width: '1px', height: '14px', background: 'var(--color-border)' }} />
                <div>Expiry Date: <strong style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>Aug 15, 2026</strong></div>
                <div style={{ width: '1px', height: '14px', background: 'var(--color-border)' }} />
                <div>Billing Cycle: <strong style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>Monthly</strong></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', alignSelf: 'center' }}>
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
              <Button variant="secondary" disabled style={{ opacity: 0.95, cursor: 'default', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
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
              Choose a plan to upgrade or switch your {currentTabObj?.name} tier. Paid upgrades are charged from your account balance.
            </p>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wallet size={14} color="var(--color-primary)" /> Balance: <strong style={{ color: 'var(--color-text-main)' }}>{money(balance)}</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {currentTabObj?.plans?.map((plan: any) => {
            const isCurrentActive = plan.id === activeState.planId;
            const cost = parsePrice(plan.price);
            const isUpgrading = upgradingId === plan.id;
            const buyable = cost > 0 && !isCurrentActive;
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
                  display: 'flex', flexDirection: 'column',
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

                {buyable && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {balance >= cost
                      ? <><Check size={13} color="var(--color-success)" /> Deduct {money(cost)} from balance</>
                      : <><Wallet size={13} color="var(--color-warning)" /> Need {money(cost)} — balance {money(balance)}</>}
                  </div>
                )}

                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }}>
                  {(plan.features || []).map((f: any, i: number) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      <Check size={14} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrentActive ? "ghost" : plan.featured ? "primary" : "secondary"}
                  disabled={isCurrentActive || isUpgrading}
                  onClick={() => handleUpgrade(plan)}
                  style={{ width: '100%' }}
                >
                  {isUpgrading ? <Loader2 size={15} className="lucide-spin" /> : isCurrentActive ? 'Active Plan' : (plan.cta || 'Select Plan')}
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

      {/* Account Statement (balance transactions) */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Account Statement</h2>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{billing?.transactions?.length || 0} transactions</span>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {(!billing?.transactions || billing.transactions.length === 0) ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              No transactions yet. Add funds to get started.
            </div>
          ) : (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {billing.transactions.map((t: any) => (
                  <tr key={t.id}>
                    <td><span style={{ color: t.amount < 0 ? 'var(--color-text-muted)' : 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>{txnArrow(t.type)} {t.type === 'welcome' ? 'Bonus' : t.type === 'topup' ? 'Deposit' : 'Upgrade'}</span></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{t.description}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{t.created ? new Date(t.created).toLocaleDateString() : '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: t.amount < 0 ? 700 : 600, color: t.amount < 0 ? '#F87171' : 'var(--color-success)' }}>
                      {t.amount < 0 ? `-${money(Math.abs(t.amount))}` : `+${money(t.amount)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
