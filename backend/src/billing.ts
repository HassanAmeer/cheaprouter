import { db, genId } from './db.ts';

export const WELCOME_CREDIT = 10;

// Flat usage rate: $3 per 1M tokens (matches prior inline `tokens * 0.000003`).
export const COST_PER_TOKEN = 0.000003;
// Minimum balance required to place a request (soft floor to block free-riding).
export const MIN_BALANCE_REQUIRED = 0.01;
// Minimum billable tokens per request so providers that report 0 usage can't be used for free.
export const MIN_BILLABLE_TOKENS = 150;
// Default free-tier monthly token quota used by /api/summary.
export const DEFAULT_MONTHLY_QUOTA = 1_000_000;
// Server-side cap on a single top-up request.
export const DEFAULT_MAX_TOPUP = 5000;

interface BillingSettings {
  welcomeCredit: number;
  costPerToken: number;
  minBalanceRequired: number;
  minBillableTokens: number;
  monthlyTokenQuota: number;
  maxTopup: number;
}

let cachedBilling: BillingSettings | null = null;
let cachedBillingAt = 0;
const BILLING_CACHE_TTL = 30_000;

// Read billing/usage config from global_settings (admin-editable), with a short
// in-memory cache so per-request cost math doesn't hit the DB every time.
// Drop the cached billing config so admin settings edits apply immediately.
export function clearBillingCache() {
  cachedBilling = null;
  cachedBillingAt = 0;
}

export async function getBillingSettings(): Promise<BillingSettings> {
  const now = Date.now();
  if (cachedBilling && now - cachedBillingAt < BILLING_CACHE_TTL) return cachedBilling;
  try {
    const res = await db`SELECT data FROM global_settings WHERE id = 'global'`;
    const bs = res[0]?.data?.billingSettings ?? {};
    cachedBilling = {
      welcomeCredit: Number(bs.welcomeCredit) || WELCOME_CREDIT,
      costPerToken: Number(bs.costPerToken) > 0 ? Number(bs.costPerToken) : COST_PER_TOKEN,
      minBalanceRequired: Number(bs.minBalanceRequired) > 0 ? Number(bs.minBalanceRequired) : MIN_BALANCE_REQUIRED,
      minBillableTokens: Number(bs.minBillableTokens) > 0 ? Number(bs.minBillableTokens) : MIN_BILLABLE_TOKENS,
      monthlyTokenQuota: Number(bs.monthlyTokenQuota) > 0 ? Number(bs.monthlyTokenQuota) : DEFAULT_MONTHLY_QUOTA,
      maxTopup: Number(bs.maxTopup) > 0 ? Number(bs.maxTopup) : DEFAULT_MAX_TOPUP,
    };
  } catch (e) {
    cachedBilling = {
      welcomeCredit: WELCOME_CREDIT,
      costPerToken: COST_PER_TOKEN,
      minBalanceRequired: MIN_BALANCE_REQUIRED,
      minBillableTokens: MIN_BILLABLE_TOKENS,
      monthlyTokenQuota: DEFAULT_MONTHLY_QUOTA,
      maxTopup: DEFAULT_MAX_TOPUP,
    };
  }
  cachedBillingAt = now;
  return cachedBilling;
}

export async function computeCost(tokens: number): Promise<number> {
  const { costPerToken, minBillableTokens } = await getBillingSettings();
  const t = Number(tokens) || 0;
  const cost = Math.max(t, minBillableTokens) * costPerToken;
  return Math.round(cost * 1000000) / 1000000;
}

export async function getBalance(userId: string): Promise<number> {
  const userRes = await db`SELECT balance FROM users WHERE id = ${userId}`;
  return Number(userRes[0]?.balance ?? 0);
}

export async function checkBalanceEnough(userId: string): Promise<{ ok: boolean; balance: number }> {
  const balance = await getBalance(userId);
  const { minBalanceRequired } = await getBillingSettings();
  return { ok: balance >= minBalanceRequired, balance };
}

// Atomically deduct `cost` from the user's balance, refusing to drive the
// balance below zero. This closes the check-then-deduct race: a concurrent
// request that already spent the balance gets `ok: false` instead of a
// negative balance.
export async function deductBalance(userId: string, cost: number): Promise<{ ok: boolean; balance: number }> {
  const res = await db`
    UPDATE users
    SET balance = COALESCE(balance, 0) - ${cost}
    WHERE id = ${userId} AND COALESCE(balance, 0) >= ${cost}
    RETURNING balance
  `;
  if (res.length > 0) return { ok: true, balance: Number(res[0].balance) };
  const balance = await getBalance(userId);
  return { ok: false, balance };
}

const PLAN_FIELDS = ['plan', 'plan_cli', 'plan_api', 'plan_chat', 'plan_agents'];

export async function getBilling(userId: string) {
  const userRes = await db`SELECT balance FROM users WHERE id = ${userId}`;
  const balance = Number(userRes[0]?.balance ?? 0);
  const transactions = await db`SELECT id, type, amount, description, created_at FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return {
    balance,
    transactions: transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      description: t.description,
      created: t.created_at ? new Date(t.created_at).toISOString() : null,
    })),
  };
}

export async function seedWelcomeBalance(userId: string) {
  const existing = await db`SELECT id FROM transactions WHERE user_id = ${userId} AND type = 'welcome'`;
  if (existing.length > 0) return;
  const { welcomeCredit } = await getBillingSettings();
  await db`UPDATE users SET balance = COALESCE(balance, 0) + ${welcomeCredit} WHERE id = ${userId}`;
  await db`INSERT INTO transactions (id, user_id, type, amount, description) VALUES (${genId('txn')}, ${userId}, 'welcome', ${welcomeCredit}, 'Welcome credit')`;
}

// ── Top-ups ─────────────────────────────────────────────────────────────
// There is no payment gateway, so a top-up is never self-service: the user
// submits a request and an admin must approve it before any balance is
// credited. This prevents users from minting free money.
export async function requestTopUp(userId: string, amount: number): Promise<{ ok: boolean; error?: string; id?: string; amount?: number; status?: string }> {
  const amt = Math.round((Number(amount) || 0) * 100) / 100;
  if (!(amt > 0)) return { ok: false, error: 'Enter a valid amount' };
  const { maxTopup } = await getBillingSettings();
  if (amt > maxTopup) {
    return { ok: false, error: `Maximum top-up per request is $${maxTopup.toFixed(2)}` };
  }
  const id = genId('tpu');
  await db`INSERT INTO topup_requests (id, user_id, amount, status) VALUES (${id}, ${userId}, ${amt}, 'pending')`;
  return { ok: true, id, amount: amt, status: 'pending' };
}

export async function listUserTopups(userId: string) {
  const rows = await db`SELECT id, amount, status, created_at, processed_at FROM topup_requests WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return rows.map(r => ({
    id: r.id,
    amount: Number(r.amount),
    status: r.status,
    created: r.created_at ? new Date(r.created_at).toISOString() : null,
    processed: r.processed_at ? new Date(r.processed_at).toISOString() : null,
  }));
}

export async function listAdminTopups() {
  const rows = await db`
    SELECT t.id, t.user_id AS "userId", t.amount, t.status, t.created_at AS created, t.processed_at AS processed,
           u.name AS "userName", u.email AS "userEmail"
    FROM topup_requests t
    JOIN users u ON u.id = t.user_id
    ORDER BY t.created_at DESC
  `;
  return rows.map(r => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    userEmail: r.userEmail,
    amount: Number(r.amount),
    status: r.status,
    created: r.created ? new Date(r.created).toISOString() : null,
    processed: r.processed ? new Date(r.processed).toISOString() : null,
  }));
}

export async function setTopupStatus(id: string, status: 'approved' | 'rejected'): Promise<{ ok: boolean; error?: string }> {
  // Atomically claim the request: only one update can flip a pending request,
  // so concurrent approve/reject calls can't both credit the balance.
  const claimed = await db`
    UPDATE topup_requests
    SET status = ${status}, processed_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND status = 'pending'
    RETURNING id, user_id, amount, status
  `;
  if (claimed.length === 0) {
    const rows = await db`SELECT id, status FROM topup_requests WHERE id = ${id}`;
    if (rows.length === 0) return { ok: false, error: 'Top-up request not found' };
    return { ok: false, error: 'This top-up request has already been processed' };
  }

  const req = claimed[0];
  if (status === 'approved') {
    const amt = Number(req.amount);
    await db`UPDATE users SET balance = COALESCE(balance, 0) + ${amt} WHERE id = ${req.user_id}`;
    await db`INSERT INTO transactions (id, user_id, type, amount, description) VALUES (${genId('txn')}, ${req.user_id}, 'topup', ${amt}, 'Approved top-up')`;
  }
  return { ok: true };
}

export interface UpgradeInput {
  planField: string;
  planId: string;
  planName: string;
  price: number;
  durationDays?: number;
}

function parsePrice(raw: unknown): number {
  const n = parseFloat(String(raw ?? '').replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

// Look up the real configured price for a plan id from global settings. If the
// plan is not found, this returns null and the upgrade is REJECTED (fail
// closed) so clients can never set their own price.
async function lookupPlanPrice(planId: string): Promise<number | null> {
  try {
    const res = await db`SELECT data FROM global_settings WHERE id = 'global'`;
    const settings = res[0]?.data;
    const tabs: any[] = settings?.pricingSection?.tabs ?? [];
    for (const tab of tabs) {
      const plan = (tab.plans ?? []).find((p: any) => p.id === planId);
      if (plan) return parsePrice(plan.price);
    }
  } catch (e) {
    return null;
  }
  return null;
}

export async function upgradePlan(userId: string, input: UpgradeInput) {
  const { planField, planId, planName, durationDays } = input;
  if (!PLAN_FIELDS.includes(planField)) {
    return { ok: false as const, error: 'Invalid plan field' };
  }

  // Always use the server-side configured price; a plan that isn't configured
  // is rejected outright rather than trusting a client-supplied price.
  const serverPrice = await lookupPlanPrice(planId);
  if (serverPrice === null) {
    return { ok: false as const, error: 'Plan not found or not configured' };
  }
  const cost = Math.round(serverPrice * 100) / 100;

  // Atomic: only deduct if the balance still covers the cost. This avoids the
  // lost-update race between the balance read and write.
  const days = durationDays && durationDays > 0 ? Math.round(durationDays) : 30;

  if (cost > 0) {
    const ded = await deductBalance(userId, cost);
    if (!ded.ok) {
      return { ok: false as const, error: 'Insufficient balance', balance: ded.balance };
    }
  }

  if (planField === 'plan') {
    await db`UPDATE users SET plan = ${planName} WHERE id = ${userId}`;
  } else {
    await db`UPDATE users SET
      ${db(planField)} = ${planName},
      ${db(planField + '_start')} = CURRENT_TIMESTAMP,
      ${db(planField + '_expiry')} = CURRENT_TIMESTAMP + INTERVAL '1 day' * ${days}
      WHERE id = ${userId}`;
  }

  if (cost > 0) {
    await db`INSERT INTO transactions (id, user_id, type, amount, description) VALUES (${genId('txn')}, ${userId}, 'upgrade', ${-cost}, ${`Upgraded to ${planName}${planField !== 'plan' ? ' (' + planField.replace('plan_', '') + ')' : ''}`})`;
  } else {
    await db`INSERT INTO transactions (id, user_id, type, amount, description) VALUES (${genId('txn')}, ${userId}, 'upgrade', 0, ${`Switched to ${planName}`})`;
  }

  const newUser = await db`SELECT balance FROM users WHERE id = ${userId}`;
  return {
    ok: true as const,
    balance: Number(newUser[0].balance),
    planField,
    planId,
    planName,
    cost,
  };
}