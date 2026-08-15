'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, CreditCard, Download, ArrowUpRight, Zap, Shield, Crown, Terminal, Plug, MessageSquare, Bot, Globe, Sparkles, Wallet, Coins, Plus, ArrowDownCircle, ArrowUpCircle, Loader2, X } from 'lucide-react';
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

const WITHDRAWALS = [
  { id: 'WD-2026-08', date: 'Aug 10, 2026', method: 'Bank Transfer', amount: '$25.00', status: 'Pending' },
  { id: 'WD-2026-07', date: 'Jul 22, 2026', method: 'PayPal', amount: '$10.00', status: 'Completed' },
  { id: 'WD-2026-06', date: 'Jun 15, 2026', method: 'Bank Transfer', amount: '$40.00', status: 'Completed' },
];

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
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
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

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) { toast('Enter a valid amount', 'error'); return; }
    if (amt < 5) { toast('Minimum withdrawal amount is $5', 'error'); return; }
    if (amt > balance) { toast('Insufficient balance', 'error'); return; }
    setShowWithdraw(false);
    setWithdrawAmount('');
    toast(`Withdrawal of ${money(amt)} submitted for admin review. You'll receive it in 1–3 business days.`, 'success');
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
    if (!user) {
      toast('You need to login first to purchase a plan.', 'error');
      window.location.href = '/login';
      return;
    }
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
          <div style={{ height: 1, background: 'var(--color-border)', margin: '20px 0', opacity: 0.6 }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 2 }}>Withdraw Funds</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                Withdraw your unused balance back to your payment method.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowWithdraw(true)}>
              <ArrowDownCircle size={15} /> Withdraw Funds
            </Button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 6 }}>Current Plan</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Manage active plans, view usage hits, and select subscriptions for each service.
        </p>
      </div>

      {/* Active Plans Overview — all categories at once */}
      <div className="card" style={{
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--color-primary)',
        padding: '24px',
        background: 'linear-gradient(135deg, var(--color-card-bg) 0%, rgba(124, 58, 237, 0.03) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <Crown size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Your Active Plans</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {tabs.map((tab, tabIdx) => {
            const mInfo = getMetricInfo(tab.name);
            const TabIcon = mInfo.icon;
            const aState = activePlans[tab.id] || { planId: tab.plans?.[0]?.id || '', used: 120, limit: 1000 };
            const planObj = tab.plans?.find(p => p.id === aState.planId) || tab.plans?.[0] || {
              id: 'default', name: 'Free', price: '$0', period: '', desc: 'Basic Plan', features: [], cta: 'Select Plan', ctaLink: '', featured: false
            };
            const pct = Math.min(100, Math.round((aState.used / aState.limit) * 100));
            const isLastRow = tabIdx === tabs.length - 1;
            const curIdx = tab.plans?.findIndex((p: any) => p.id === aState.planId) ?? -1;
            return (
              <div key={tab.id}>
                {/* Row 1: tab name left, horizontal tier dots right */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <TabIcon size={16} color="var(--color-primary)" />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>{tab.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {planObj.name} Plan · {planObj.price}{planObj.period || '/mo'}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal tier dots: Free → Starter → Pro */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1, maxWidth: 360, minWidth: 220 }}>
                    {tab.plans?.map((plan: any, idx: number) => {
                      const isCurrent = idx === curIdx;
                      const isReached = idx <= curIdx;
                      const isLast = idx === (tab.plans?.length || 0) - 1;
                      return (
                        <div key={plan.id} style={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                              width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                              background: isReached ? 'var(--color-primary)' : 'var(--color-bg-soft)',
                              border: isReached ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                              boxShadow: isCurrent ? '0 0 0 3px rgba(124, 58, 237, 0.18)' : 'none',
                              opacity: isCurrent ? 1 : isReached ? 0.55 : 1
                            }} />
                            <div style={{
                              fontSize: '10px', marginTop: 5, textAlign: 'center',
                              fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? 'var(--color-text-main)' : isReached ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
                            }}>
                              {plan.name}
                            </div>
                          </div>
                          {!isLast && (
                            <div style={{
                              flex: 1, height: 2, marginTop: 5, alignSelf: 'flex-start',
                              background: idx + 1 <= curIdx ? 'var(--color-primary)' : 'var(--color-border)'
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Usage progress bar (horizontal line) */}
                <div style={{ marginTop: 14 }}>
                  <div className={styles.progressBar} style={{ height: 6, borderRadius: 3, background: 'var(--color-bg-soft)' }}>
                    <div className={styles.progressFill} style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--color-primary), #ff6b6b)', borderRadius: 3 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 6 }}>
                    <span>
                      <strong style={{ color: 'var(--color-text-main)' }}>{aState.used.toLocaleString()}</strong> / {aState.limit.toLocaleString()} {mInfo.unit}
                    </span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{pct}%</span>
                  </div>
                </div>

                {/* Starting / expiry dates on bottom */}
                <div style={{ display: 'flex', gap: 18, fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 10, flexWrap: 'wrap' }}>
                  <span><strong style={{ color: 'var(--color-text-main)' }}>Start:</strong> Jul 15, 2026</span>
                  <span><strong style={{ color: 'var(--color-text-main)' }}>Expires:</strong> Aug 15, 2026</span>
                </div>

                {/* Half centered divider line before next plan details */}
                {!isLastRow && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '22px 0' }}>
                    <div style={{ width: '50%', height: 1, background: 'var(--color-border)', opacity: 0.7 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Category Tabs Bar */}
      {tabs.length > 0 && (
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{
            display: 'flex', gap: '6px',
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            padding: '6px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            width: 'fit-content'
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
        </div>
      )}

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

      {/* Invoice History */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Invoice History</h2>
          <button style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
            Download All <Download size={13} />
          </button>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {INVOICES.length === 0 ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              No invoices yet.
            </div>
          ) : (
            <div className={styles.tableScroll}>
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
          )}
        </div>
      </div>

      {/* Withdraw History */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Withdraw History</h2>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{WITHDRAWALS.length} withdrawals</span>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className={styles.tableScroll}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Withdrawal</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {WITHDRAWALS.map((w) => (
                  <tr key={w.id}>
                    <td><strong style={{ fontSize: '13px' }}>{w.id}</strong></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{w.date}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{w.method}</td>
                    <td style={{ fontWeight: 600 }}>{w.amount}</td>
                    <td>
                      {w.status === 'Completed'
                        ? <Badge tone="success"><Check size={11} /> Completed</Badge>
                        : <Badge tone="warning"><Loader2 size={11} className="lucide-spin" /> Pending</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Withdraw Funds right-side sheet */}
      {showWithdraw && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end'
          }}
          onClick={() => setShowWithdraw(false)}
        >
          <div
            style={{
              width: 420, maxWidth: '92vw', height: '100%',
              background: 'var(--color-card-bg)',
              borderLeft: '1px solid var(--color-border)',
              padding: '28px', overflowY: 'auto',
              boxShadow: '-8px 0 30px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Withdraw Funds</h3>
              <button
                onClick={() => setShowWithdraw(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Withdraw your unused balance back to your payment method. The minimum withdrawal amount is $5.
            </p>

            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
              Amount (USD)
            </label>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontWeight: 700 }}>$</span>
              <input
                type="number"
                min={5}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="5"
                style={{
                  width: '100%', padding: '11px 14px 11px 30px', borderRadius: '10px',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)',
                  color: 'var(--color-text-main)', fontSize: '14px', outline: 'none'
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: 16 }}>
              Available balance: <strong style={{ color: 'var(--color-text-main)' }}>{money(balance)}</strong>
            </div>

            <div style={{
              background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)',
              borderRadius: '10px', padding: '12px 14px', fontSize: '12px',
              color: 'var(--color-text-muted)', marginBottom: 22, lineHeight: 1.7
            }}>
              Withdrawals are processed within <strong style={{ color: 'var(--color-text-main)' }}>1–3 business days</strong> once approved by an admin review.
            </div>

            <Button variant="primary" fullWidth onClick={handleWithdraw}>
              <ArrowDownCircle size={16} /> Submit Withdrawal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
