'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Check,
  CreditCard,
  Zap,
  Crown,
  Terminal,
  Plug,
  MessageSquare,
  Globe,
  Sparkles,
  Wallet,
  Coins,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  X,
  Info,
  Layers,
  Cpu,
  Search
} from 'lucide-react';
import { Button, Badge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { PaginationBar } from '@/components/ui/pagination-bar';
import styles from '../dashboard.module.css';
import { useSiteSettings } from '@/components/settings-provider';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { parsePrice, money } from '@/lib/utils';
import {
  PricingPlan,
  BillingData,
  TopupRequest,
  WithdrawalRequest,
  WithdrawSettings,
  SummaryData
} from '@/lib/api-types';

const PRESET_FUNDS = [5, 10, 20, 50, 100];
const WITHDRAW_METHODS = ['Wallet', 'Bank Transfer', 'PayPal', 'JazzCash', 'UPI', 'Crypto (USDT)'] as const;

export default function BillingPage() {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const { user, refreshUser } = useAuth();

  // Billing / balance state
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [topups, setTopups] = useState<TopupRequest[]>([]);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState<string>('10');
  const [addingFunds, setAddingFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<string>('Wallet');
  const [withdrawing, setWithdrawing] = useState(false);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const fundsRef = useRef<HTMLDivElement | null>(null);

  // Transactions pagination & search
  const [txSearch, setTxSearch] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(50);

  // Withdrawals pagination & search
  const [withdrawHistorySearch, setWithdrawHistorySearch] = useState('');
  const [withdrawHistoryPage, setWithdrawHistoryPage] = useState(1);
  const [withdrawHistoryPageSize, setWithdrawHistoryPageSize] = useState(50);

  const withdrawSettings: WithdrawSettings = settings.withdrawSettings || {
    enabled: true,
    minAmount: 5,
    announcement: 'Withdrawals are processed within 1–3 business days once approved by an admin review.'
  };
  const minWithdraw = Number(withdrawSettings.minAmount) || 5;
  // Admin-controlled global switch — hides every withdrawal surface for all users.
  const withdrawalsEnabled = withdrawSettings.enabled !== false;

  const loadBilling = () => {
    api.getBilling().then(setBilling).catch(() => {});
  };

  const loadSummary = () => {
    api.summary().then(setSummary).catch(() => {});
  };

  const loadWithdrawals = () => {
    api.listWithdrawals().then((r) => setWithdrawals(r.withdrawals || [])).catch(() => {});
  };

  const loadTopups = () => {
    api.listTopups().then((r) => setTopups(r.topups || [])).catch(() => {});
  };

  useEffect(() => {
    loadBilling();
    loadSummary();
    loadWithdrawals();
    loadTopups();
  }, []);

  const balance = Number(billing?.balance ?? 0);

  const filteredTransactions = useMemo(() => {
    const list = billing?.transactions || [];
    if (!txSearch.trim()) return list;
    const q = txSearch.trim().toLowerCase();
    return list.filter((txn: any) =>
      (txn.type && String(txn.type).toLowerCase().includes(q)) ||
      (txn.description && String(txn.description).toLowerCase().includes(q)) ||
      (txn.amount !== undefined && String(txn.amount).includes(q))
    );
  }, [billing?.transactions, txSearch]);

  const totalTxPages = Math.ceil(filteredTransactions.length / txPageSize) || 1;
  const pagedTransactions = useMemo(() => {
    const start = (txPage - 1) * txPageSize;
    return filteredTransactions.slice(start, start + txPageSize);
  }, [filteredTransactions, txPage, txPageSize]);

  const filteredWithdrawalsHistory = useMemo(() => {
    if (!withdrawHistorySearch.trim()) return withdrawals;
    const q = withdrawHistorySearch.trim().toLowerCase();
    return withdrawals.filter((w) =>
      (w.id && String(w.id).toLowerCase().includes(q)) ||
      (w.method && String(w.method).toLowerCase().includes(q)) ||
      (w.status && String(w.status).toLowerCase().includes(q)) ||
      (w.amount !== undefined && String(w.amount).includes(q))
    );
  }, [withdrawals, withdrawHistorySearch]);

  const totalWithdrawHistoryPages = Math.ceil(filteredWithdrawalsHistory.length / withdrawHistoryPageSize) || 1;
  const pagedWithdrawalsHistory = useMemo(() => {
    const start = (withdrawHistoryPage - 1) * withdrawHistoryPageSize;
    return filteredWithdrawalsHistory.slice(start, start + withdrawHistoryPageSize);
  }, [filteredWithdrawalsHistory, withdrawHistoryPage, withdrawHistoryPageSize]);

  // Unified plans from settings or fallback
  const plans: PricingPlan[] = (settings?.pricingSection?.plans && settings.pricingSection.plans.length > 0)
    ? settings.pricingSection.plans
    : [
        {
          id: 'plan_free',
          name: 'Free',
          price: '$0',
          period: '/mo',
          tokens: '10,000,000 Tokens (10M)',
          tokensM: 10,
          tokenLimit: 10000000,
          desc: 'Ideal for personal hobbyists, light exploration, and everyday quick tasks.',
          canUseCli: true,
          canUseIde: true,
          canUseChat: true,
          canUseApi: true,
          includedModels: ['MiniMax 10M Context', 'Llama 3.3 70B', 'DeepSeek Chat', 'Gemma 2 27B'],
          features: [
            '10 Million Tokens / month',
            'Full access to Cheap CLI',
            'Full access to IDE extensions',
            'Access to Cheap Web Chats',
            'Direct REST API access',
            'Community support'
          ],
          cta: 'Get Started Free',
          ctaLink: '/signup',
          featured: false
        },
        {
          id: 'plan_pro',
          name: 'Pro',
          price: '$15',
          period: '/mo',
          tokens: '100,000,000 Tokens (100M)',
          tokensM: 100,
          tokenLimit: 100000000,
          desc: 'Built for builders, developers, and power users needing extensive daily tokens.',
          canUseCli: true,
          canUseIde: true,
          canUseChat: true,
          canUseApi: true,
          includedModels: [
            'ChatGPT (GPT-4o Mini & GPT-4o)',
            'Claude 3.5 Sonnet',
            'DeepSeek V3 & R1',
            'MiniMax 10M Context',
            'Qwen 2.5 Coder 32B'
          ],
          features: [
            '100 Million Tokens / month',
            'Full access to Cheap CLI',
            'Full access to IDE extensions',
            'Access to Cheap Web Chats',
            'Direct REST API access',
            'Priority routing & high rate limits',
            'Standard support'
          ],
          cta: 'Upgrade to Pro',
          ctaLink: '/signup',
          featured: true
        },
        {
          id: 'plan_premium',
          name: 'Premium',
          price: '$49',
          period: '/mo',
          tokens: '500,000,000 Tokens (500M)',
          tokensM: 500,
          tokenLimit: 500000000,
          desc: 'Heavy-duty computing for agents, coding swarms, production APIs, and teams.',
          canUseCli: true,
          canUseIde: true,
          canUseChat: true,
          canUseApi: true,
          includedModels: [
            'All Free & Pro Models',
            'Claude 3.5 Opus / Sonnet',
            'OpenAI o1 / o3-mini',
            'DeepSeek R1 full reasoning',
            'MiniMax High-Speed Cluster'
          ],
          features: [
            '500 Million Tokens / month',
            'Full access to Cheap CLI',
            'Full access to IDE extensions',
            'Access to Cheap Web Chats',
            'Direct REST API access',
            'Ultra-low latency priority edge',
            'Highest concurrent requests & dedicated support'
          ],
          cta: 'Get Premium',
          ctaLink: '/signup',
          featured: false
        }
      ];

  const currentPlanName = (user?.plan || summary?.planName || 'Free').toLowerCase();
  const currentPlanObj = plans.find(p => p.name?.toLowerCase() === currentPlanName || p.id === currentPlanName) || plans[0];

  // Token usage calculation
  const planTokenLimit = summary?.limit ?? (currentPlanObj.tokenLimit || ((currentPlanObj.tokensM || 10) * 1_000_000));
  const tokensUsed = summary?.used ?? 0;
  const tokensRemaining = Math.max(0, planTokenLimit - tokensUsed);
  const tokenPercent = Math.min(100, Math.round((tokensUsed / (planTokenLimit || 1)) * 100));

  // Compact token counts for the plan tiles: 10,000,000 -> "10M".
  const formatTokens = (n: number) => {
    const v = Number(n) || 0;
    if (v >= 1_000_000) {
      const m = v / 1_000_000;
      return `${Number.isInteger(m) ? m : m.toFixed(1)}M`;
    }
    if (v >= 1_000) return `${Number.isInteger(v / 1_000) ? v / 1_000 : (v / 1_000).toFixed(1)}K`;
    return v.toLocaleString();
  };

  const planStartFormatted = user?.plan_start
    ? new Date(user.plan_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Active';

  const planExpiryFormatted = user?.plan_expiry
    ? new Date(user.plan_expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : currentPlanObj.price === '$0' || !parsePrice(currentPlanObj.price)
    ? 'Never expires (Free tier)'
    : 'Renews monthly';

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) { toast('Enter a valid amount', 'error'); return; }
    if (amt < minWithdraw) { toast(`Minimum withdrawal amount is $${minWithdraw.toFixed(2)}`, 'error'); return; }
    if (amt > balance) { toast('Insufficient balance', 'error'); return; }
    setWithdrawing(true);
    try {
      await api.createWithdrawal(amt, withdrawMethod);
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawMethod('Wallet');
      await loadWithdrawals();
      await loadBilling();
      toast(`Withdrawal of ${money(amt)} submitted for admin review. You'll receive it in 1–3 business days.`, 'success');
    } catch (e: any) {
      toast(e?.message || 'Withdrawal request failed', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleAddFunds = async () => {
    const amt = parseFloat(fundAmount);
    if (!amt || amt <= 0) { toast('Enter a valid amount', 'error'); return; }
    setAddingFunds(true);
    try {
      await api.topUp(amt);
      setFundAmount('');
      await loadTopups();
      toast(`Top-up request for ${money(amt)} submitted. Funds are added once an admin approves the request.`, 'success');
    } catch (e: any) {
      toast(e?.message || 'Failed to submit top-up request', 'error');
    } finally {
      setAddingFunds(false);
    }
  };

  const handleUpgrade = async (plan: PricingPlan) => {
    if (!user) {
      toast('You need to login first to purchase a plan.', 'error');
      window.location.href = '/login';
      return;
    }
    const isAlreadyActive = plan.name?.toLowerCase() === currentPlanName;
    if (isAlreadyActive) return;

    const cost = parsePrice(plan.price);
    if (cost > balance) {
      toast(`Insufficient balance. You need ${money(cost)} to upgrade to ${plan.name}. Please top up your balance.`, 'error');
      setShowAddFunds(true);
      setTimeout(() => fundsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      return;
    }

    setUpgradingId(plan.id);
    try {
      const res = await api.upgradePlan({
        planField: 'plan',
        planId: plan.id,
        planName: plan.name,
        price: cost,
      });

      if (res.ok) {
        toast(
          cost > 0
            ? `${plan.name} plan activated! ${money(cost)} deducted from your account balance.`
            : `Switched to ${plan.name} plan successfully!`,
          'success'
        );
        await loadBilling();
        await loadSummary();
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        toast(res.error || 'Failed to update plan', 'error');
      }
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

  return (
    <div>
      {/* ── Account Balance Section ── */}
      <div ref={fundsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28, alignItems: 'stretch' }}>
        {/* Balance summary */}
        <div className="card" style={{
          padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, var(--color-card-bg) 0%, rgba(124, 58, 237, 0.05) 100%)',
          border: '1px solid var(--color-border)', borderRadius: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--color-primary-soft)', color: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(124,58,237,0.25)'
              }}>
                <Wallet size={22} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Account Balance</div>
                <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-main)' }}>
                  {money(balance)}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
              Prepaid balance used for plan upgrades and pay-as-you-go tokens. CLI, IDE, and Web Chats are free to use; you only pay for model tokens consumed.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Button variant="primary" size="sm" onClick={() => setShowAddFunds(v => !v)}>
              <Plus size={15} /> {showAddFunds ? 'Close' : 'Add Funds'}
            </Button>
            {withdrawalsEnabled && (
              <Button variant="ghost" size="sm" onClick={() => setShowWithdraw(true)}>
                <ArrowDownCircle size={15} /> Withdraw
              </Button>
            )}
          </div>
        </div>

        {/* Add funds card */}
        <div className="card" style={{
          padding: '24px',
          border: showAddFunds ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 2 }}>Top Up Balance</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>Add funds to activate Pro or Premium tiers.</p>
            </div>
            <Badge tone="primary">Prepaid</Badge>
          </div>

          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {PRESET_FUNDS.map(v => (
                <button
                  key={v}
                  onClick={() => setFundAmount(String(v))}
                  style={{
                    padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                    border: `1px solid ${fundAmount === String(v) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: fundAmount === String(v) ? 'var(--color-primary-soft)' : 'transparent',
                    color: fundAmount === String(v) ? 'var(--color-primary)' : 'var(--color-text-main)',
                    cursor: 'pointer', transition: 'all 0.2s'
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
                Add Funds
              </Button>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '10px 0 0' }}>
              Requests are reviewed promptly by administrators. Balance reflects immediately once approved.
            </p>
          </div>

          {topups.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                Recent Top-ups
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {topups.slice(0, 3).map((t: any) => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-soft)', fontSize: '12px'
                  }}>
                    <span style={{ fontWeight: 700 }}>{money(Number(t.amount))}</span>
                    <Badge tone={t.status === 'approved' ? 'success' : t.status === 'rejected' ? 'danger' : 'warning'}>
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Unified Current Active Plan Overview ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Current Active Plan
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Your unified plan covers Cheap CLI, IDE Extension, Cheap Web Chats, and REST API.
          </p>
        </div>

        <div className="card" style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          border: '1px solid var(--color-primary)',
          padding: '28px',
          background: 'linear-gradient(135deg, var(--color-card-bg) 0%, rgba(124, 58, 237, 0.04) 100%)',
          boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)'
        }}>
          {/* Header Row: Plan Name, Price, and Status Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--color-primary), #6366f1)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)'
              }}>
                <Crown size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
                    {currentPlanObj.name} Plan
                  </h2>
                  <Badge tone="primary">Active Subscription</Badge>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 3 }}>
                  {currentPlanObj.desc}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {currentPlanObj.price}
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                  {currentPlanObj.period || '/mo'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {currentPlanObj.price === '$0' ? 'Free Forever' : 'Billed from balance'}
              </div>
            </div>
          </div>

          {/* Token Usage Meter */}
          <div style={{
            background: 'var(--color-bg-soft)',
            border: '1px solid var(--color-border)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="var(--color-primary)" />
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Monthly Token Allowance</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                <strong style={{ color: 'var(--color-text-main)', fontSize: '15px' }}>{tokensUsed.toLocaleString()}</strong>
                {' / '}
                <span>{planTokenLimit.toLocaleString()} Tokens</span>
                <span style={{ marginLeft: 8, color: 'var(--color-primary)', fontWeight: 700 }}>({tokenPercent}%)</span>
              </div>
            </div>

            {/* Glowing Progress bar */}
            <div style={{
              height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden', position: 'relative'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.max(2, tokenPercent)}%`,
                background: 'linear-gradient(90deg, var(--color-primary), #ec4899, #f59e0b)',
                borderRadius: 5,
                transition: 'width 0.5s ease',
                boxShadow: '0 0 12px rgba(124, 58, 237, 0.4)'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: '12px', color: 'var(--color-text-muted)', flexWrap: 'wrap', gap: 10 }}>
              <span>
                ⚡ <strong>{tokensRemaining.toLocaleString()}</strong> tokens available this month
              </span>
              <div style={{ display: 'flex', gap: 18 }}>
                <span><strong>Active Since:</strong> {planStartFormatted}</span>
                <span><strong>Renews:</strong> {planExpiryFormatted}</span>
              </div>
            </div>
          </div>

          {/* Platform Access Badges Row */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
              Included Platform Access
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: '10px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)'
              }}>
                <Terminal size={16} color="var(--color-primary)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Cheap CLI</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-success)' }}>Free Tool ✓</div>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: '10px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)'
              }}>
                <Plug size={16} color="var(--color-primary)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>IDE Extensions</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-success)' }}>Free Tool ✓</div>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: '10px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)'
              }}>
                <MessageSquare size={16} color="var(--color-primary)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Cheap Chats</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-success)' }}>Free Tool ✓</div>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: '10px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)'
              }}>
                <Globe size={16} color="var(--color-primary)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>REST API</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
                    {planTokenLimit > 0 ? `${formatTokens(planTokenLimit)} tokens / mo` : 'Pay per token'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Included Models Badges */}
          {currentPlanObj.includedModels && currentPlanObj.includedModels.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                Included Models in this Tier
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {currentPlanObj.includedModels.map((m, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                      background: 'rgba(124, 58, 237, 0.08)', color: 'var(--color-text-main)',
                      border: '1px solid rgba(124, 58, 237, 0.2)'
                    }}
                  >
                    <Cpu size={12} color="var(--color-primary)" />
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Note callout */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.18)',
            fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5
          }}>
            <Info size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ color: 'var(--color-text-main)' }}>Zero tool access fees:</strong> Cheap CLI, IDE extension, and Cheap Web Chats are completely free clients. All queries consume tokens from your monthly token allowance or prepaid wallet balance.
            </div>
          </div>
        </div>
      </div>

      {/* ── Unified Plan Comparison Cards ── */}
      <div id="available-plans-section" style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Sparkles size={18} color="var(--color-primary)" />
              <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                Available Unified Plans
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
              Upgrade or change tier at any time. Upgrades are deducted automatically from your account balance.
            </p>
          </div>

          <div style={{
            fontSize: '13px', color: 'var(--color-text-muted)',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: '10px', background: 'var(--color-bg-soft)',
            border: '1px solid var(--color-border)'
          }}>
            <Wallet size={15} color="var(--color-primary)" />
            Balance: <strong style={{ color: 'var(--color-text-main)' }}>{money(balance)}</strong>
          </div>
        </div>

        {/* 3 Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
          {plans.map((plan) => {
            const isCurrentActive = plan.name?.toLowerCase() === currentPlanName;
            const cost = parsePrice(plan.price);
            const isUpgrading = upgradingId === plan.id;
            const buyable = cost > 0 && !isCurrentActive;

            return (
              <div
                key={plan.id}
                className="card"
                style={{
                  padding: '28px',
                  position: 'relative',
                  borderRadius: '18px',
                  border: isCurrentActive
                    ? '2px solid var(--color-primary)'
                    : plan.featured
                    ? '2px solid rgba(124, 58, 237, 0.45)'
                    : '1px solid var(--color-border)',
                  background: isCurrentActive
                    ? 'linear-gradient(180deg, rgba(124, 58, 237, 0.05) 0%, var(--color-card-bg) 100%)'
                    : plan.featured
                    ? 'linear-gradient(180deg, rgba(124, 58, 237, 0.03) 0%, var(--color-card-bg) 100%)'
                    : 'var(--color-card-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  boxShadow: isCurrentActive
                    ? '0 10px 30px rgba(124, 58, 237, 0.12)'
                    : plan.featured
                    ? '0 8px 24px rgba(124, 58, 237, 0.08)'
                    : 'none'
                }}
              >
                {/* Badges on Top */}
                {isCurrentActive && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                    <Badge tone="primary">Current Active Plan</Badge>
                  </div>
                )}
                {!isCurrentActive && plan.featured && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                    <Badge tone="primary">Most Popular</Badge>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{plan.name}</h3>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: 16, minHeight: 34, lineHeight: 1.5 }}>
                  {plan.desc}
                </p>

                {/* Price Display */}
                <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: 12, color: 'var(--color-text-main)', letterSpacing: '-0.03em' }}>
                  {plan.price}
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                    {plan.period || '/mo'}
                  </span>
                </div>

                {/* Token Allowance Highlight Banner */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', borderRadius: '10px',
                  background: 'var(--color-primary-soft)', color: 'var(--color-primary)',
                  fontSize: '12px', fontWeight: 700, marginBottom: 16,
                  border: '1px solid rgba(124, 58, 237, 0.2)'
                }}>
                  <Zap size={15} />
                  <span>{plan.tokens || `${plan.tokensM || (plan.tokenLimit ? plan.tokenLimit / 1_000_000 : 10)}M Tokens / month`}</span>
                </div>

                {/* Platform Capabilities Chips */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6,
                  padding: '10px', borderRadius: '10px',
                  background: 'var(--color-bg-soft)', marginBottom: 16,
                  border: '1px solid var(--color-border)', fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={12} color="var(--color-success)" />
                    <span>Can use CLI</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={12} color="var(--color-success)" />
                    <span>Can use IDE</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={12} color="var(--color-success)" />
                    <span>Can use Chats</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={12} color="var(--color-success)" />
                    <span>Can use API</span>
                  </div>
                </div>

                {/* Balance Status notice */}
                {buyable && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {balance >= cost ? (
                      <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                        <Check size={13} /> Deduct {money(cost)} from balance
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Wallet size={13} /> Need {money(cost)} · Balance: {money(balance)}
                      </span>
                    )}
                  </div>
                )}

                {/* Included Models */}
                {plan.includedModels && plan.includedModels.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                      Models Included
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {plan.includedModels.map((m, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                            background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)',
                            color: 'var(--color-text-muted)'
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features List */}
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 9, flex: 1, marginBottom: 24 }}>
                  {(plan.features || []).map((f: any, i: number) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      <Check size={14} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Upgrade Button */}
                <Button
                  variant={isCurrentActive ? "ghost" : plan.featured ? "primary" : "secondary"}
                  disabled={isCurrentActive || isUpgrading}
                  onClick={() => handleUpgrade(plan)}
                  style={{ width: '100%', padding: '12px', fontWeight: 700 }}
                >
                  {isUpgrading ? (
                    <Loader2 size={16} className="lucide-spin" />
                  ) : isCurrentActive ? (
                    'Current Active Plan'
                  ) : (
                    plan.cta || (cost > 0 ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`)
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Payment Method ── */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 16 }}>Payment Method</h2>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderRadius: '14px' }}>
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

      {/* ── Transaction History ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Transaction History</h2>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 2 }}>
              {billing?.transactions?.length ?? 0} total invoices & ledger events
            </div>
          </div>
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={txSearch}
              onChange={(e) => { setTxSearch(e.target.value); setTxPage(1); }}
              style={{
                width: '100%', padding: '7px 10px 7px 32px', borderRadius: '8px',
                border: '1px solid var(--color-border)', background: 'var(--color-card-bg)',
                color: 'var(--color-text-main)', fontSize: '12px', outline: 'none'
              }}
            />
            {txSearch && (
              <button
                onClick={() => { setTxSearch(''); setTxPage(1); }}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 2
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '14px' }}>
          {!billing || (billing.transactions || []).length === 0 ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              No transactions yet.
            </div>
          ) : (
            <>
              {/* Top Pagination */}
              <PaginationBar
                currentPage={txPage}
                totalPages={totalTxPages}
                totalItems={filteredTransactions.length}
                pageSize={txPageSize}
                onPageChange={setTxPage}
                onPageSizeChange={(s) => { setTxPageSize(s); setTxPage(1); }}
                pageSizeOptions={[10, 25, 50]}
                itemName="transactions"
                position="top"
              />

              <div className={styles.tableScroll}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '28px', color: 'var(--color-text-muted)' }}>No matching transactions found</td></tr>
                    ) : (
                      pagedTransactions.map((txn: any) => {
                        const isCredit = Number(txn.amount) >= 0;
                        return (
                          <tr key={txn.id}>
                            <td style={{ textTransform: 'capitalize' }}><strong style={{ fontSize: '13px' }}>{txn.type}</strong></td>
                            <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                              {txn.created ? new Date(txn.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </td>
                            <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{txn.description || '—'}</td>
                            <td style={{ fontWeight: 600, textAlign: 'right', color: isCredit ? 'var(--color-success)' : 'var(--color-danger)' }}>
                              {isCredit ? '+' : ''}{money(Math.abs(Number(txn.amount)))}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Pagination */}
              <PaginationBar
                currentPage={txPage}
                totalPages={totalTxPages}
                totalItems={filteredTransactions.length}
                pageSize={txPageSize}
                onPageChange={setTxPage}
                onPageSizeChange={(s) => { setTxPageSize(s); setTxPage(1); }}
                pageSizeOptions={[10, 25, 50]}
                itemName="transactions"
                position="bottom"
              />
            </>
          )}
        </div>
      </div>

      {/* ── Withdraw History ── */}
      {withdrawalsEnabled && (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Withdraw History</h2>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 2 }}>
              {withdrawals.length} withdrawal requests
            </div>
          </div>
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search withdrawals..."
              value={withdrawHistorySearch}
              onChange={(e) => { setWithdrawHistorySearch(e.target.value); setWithdrawHistoryPage(1); }}
              style={{
                width: '100%', padding: '7px 10px 7px 32px', borderRadius: '8px',
                border: '1px solid var(--color-border)', background: 'var(--color-card-bg)',
                color: 'var(--color-text-main)', fontSize: '12px', outline: 'none'
              }}
            />
            {withdrawHistorySearch && (
              <button
                onClick={() => { setWithdrawHistorySearch(''); setWithdrawHistoryPage(1); }}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 2
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '14px' }}>
          {withdrawals.length === 0 ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              No withdrawal requests yet.
            </div>
          ) : (
            <>
              {/* Top Pagination */}
              <PaginationBar
                currentPage={withdrawHistoryPage}
                totalPages={totalWithdrawHistoryPages}
                totalItems={filteredWithdrawalsHistory.length}
                pageSize={withdrawHistoryPageSize}
                onPageChange={setWithdrawHistoryPage}
                onPageSizeChange={(s) => { setWithdrawHistoryPageSize(s); setWithdrawHistoryPage(1); }}
                pageSizeOptions={[10, 25, 50]}
                itemName="withdrawals"
                position="top"
              />

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
                    {filteredWithdrawalsHistory.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '28px', color: 'var(--color-text-muted)' }}>No matching withdrawals found</td></tr>
                    ) : (
                      pagedWithdrawalsHistory.map((w) => (
                        <tr key={w.id}>
                          <td><strong style={{ fontSize: '13px' }}>{w.id}</strong></td>
                          <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                            {w.created ? new Date(w.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </td>
                          <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{w.method}</td>
                          <td style={{ fontWeight: 600 }}>{money(Number(w.amount))}</td>
                          <td>
                            {w.status === 'approved'
                              ? <Badge tone="success"><Check size={11} /> Approved</Badge>
                              : w.status === 'rejected'
                              ? <Badge tone="danger"><X size={11} /> Rejected</Badge>
                              : <Badge tone="warning"><Loader2 size={11} className="lucide-spin" /> Pending</Badge>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Pagination */}
              <PaginationBar
                currentPage={withdrawHistoryPage}
                totalPages={totalWithdrawHistoryPages}
                totalItems={filteredWithdrawalsHistory.length}
                pageSize={withdrawHistoryPageSize}
                onPageChange={setWithdrawHistoryPage}
                onPageSizeChange={(s) => { setWithdrawHistoryPageSize(s); setWithdrawHistoryPage(1); }}
                pageSizeOptions={[10, 25, 50]}
                itemName="withdrawals"
                position="bottom"
              />
            </>
          )}
        </div>
      </div>
      )}

      {/* ── Withdraw Funds modal sheet ── */}
      {showWithdraw && withdrawalsEnabled && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end'
          }}
          onClick={() => setShowWithdraw(false)}
        >
          <div
            style={{
              width: '100%', maxWidth: 440, background: 'var(--color-card-bg)', height: '100%',
              padding: '32px 28px', display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 30px rgba(0,0,0,0.2)', borderLeft: '1px solid var(--color-border)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Withdraw Funds</h2>
              <button
                onClick={() => setShowWithdraw(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Withdraw unused balance back to your payout method. Minimum withdrawal amount is {money(minWithdraw)}.
            </p>

            <div style={{
              padding: '14px', borderRadius: '10px', background: 'var(--color-bg-soft)',
              border: '1px solid var(--color-border)', marginBottom: 20
            }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Available Balance</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-main)' }}>{money(balance)}</div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 6 }}>
                Withdrawal Amount ($)
              </label>
              <input
                type="number"
                min={minWithdraw}
                max={balance}
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={`${minWithdraw}.00`}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '10px',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)',
                  color: 'var(--color-text-main)', fontSize: '15px', outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 6 }}>
                Payout Method
              </label>
              <select
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '10px',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)',
                  color: 'var(--color-text-main)', fontSize: '14px', outline: 'none'
                }}
              >
                {WITHDRAW_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
              <Button variant="ghost" onClick={() => setShowWithdraw(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance}
                style={{ flex: 1 }}
              >
                {withdrawing ? <Loader2 size={16} className="lucide-spin" /> : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
