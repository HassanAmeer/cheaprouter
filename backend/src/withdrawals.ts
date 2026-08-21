import { db, genId } from './db.ts';
import { deductBalance } from './billing.ts';

export const WITHDRAW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type WithdrawStatus = (typeof WITHDRAW_STATUSES)[number];

const DEFAULT_MIN_AMOUNT = 5;

export async function getWithdrawSettings(): Promise<{ minAmount: number; announcement: string; enabled: boolean }> {
  try {
    const res = await db`SELECT data FROM global_settings WHERE id = 'global'`;
    const data = res[0]?.data;
    const ws = data?.withdrawSettings;
    return {
      minAmount: Number(ws?.minAmount) || DEFAULT_MIN_AMOUNT,
      announcement: ws?.announcement || 'Withdrawals are processed within 1–3 business days once approved by an admin review.',
      enabled: ws?.enabled ?? true,
    };
  } catch {
    return { minAmount: DEFAULT_MIN_AMOUNT, announcement: 'Withdrawals are processed within 1–3 business days once approved by an admin review.', enabled: true };
  }
}

export async function listUserWithdrawals(userId: string) {
  const rows = await db`SELECT id, amount, method, status, created_at, processed_at FROM withdraw_requests WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return rows.map(r => ({
    id: r.id,
    amount: Number(r.amount),
    method: r.method,
    status: r.status,
    created: r.created_at ? new Date(r.created_at).toISOString() : null,
    processed: r.processed_at ? new Date(r.processed_at).toISOString() : null,
  }));
}

export async function createWithdrawalRequest(userId: string, amount: number, method: string) {
  const amt = Math.round((Number(amount) || 0) * 100) / 100;
  if (!(amt > 0)) {
    return { ok: false as const, error: 'Enter a valid amount' };
  }
  const { minAmount, enabled } = await getWithdrawSettings();
  if (!enabled) {
    return { ok: false as const, error: 'Withdrawals are currently disabled' };
  }
  if (amt < minAmount) {
    return { ok: false as const, error: `Minimum withdrawal amount is $${minAmount.toFixed(2)}` };
  }

  const id = genId('wdr');
  // Atomically check balance minus already-pending withdrawals (row lock) so a
  // user can't fire several concurrent requests that together exceed their
  // balance. The real deduction still happens on admin approval.
  try {
    await db.begin(async (tx) => {
      const bal = await tx`SELECT COALESCE(balance, 0) AS b FROM users WHERE id = ${userId} FOR UPDATE`;
      const pending = await tx`SELECT COALESCE(SUM(amount), 0) AS r FROM withdraw_requests WHERE user_id = ${userId} AND status = 'pending'`;
      const available = Number(bal[0].b) - Number(pending[0].r);
      if (amt > available) throw new Error('Insufficient balance');
      await tx`INSERT INTO withdraw_requests (id, user_id, amount, method, status) VALUES (${id}, ${userId}, ${amt}, ${method || 'Wallet'}, 'pending')`;
    });
  } catch (e: any) {
    return { ok: false as const, error: e?.message || 'Insufficient balance' };
  }
  return { ok: true as const, id, amount: amt, status: 'pending' };
}

export async function listAdminWithdrawals() {
  const rows = await db`
    SELECT w.id, w.user_id AS "userId", w.amount, w.method, w.status, w.created_at AS created, w.processed_at AS processed,
           u.name AS "userName", u.email AS "userEmail"
    FROM withdraw_requests w
    JOIN users u ON u.id = w.user_id
    ORDER BY w.created_at DESC
  `;
  return rows.map(r => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    userEmail: r.userEmail,
    amount: Number(r.amount),
    method: r.method,
    status: r.status,
    created: r.created ? new Date(r.created).toISOString() : null,
    processed: r.processed ? new Date(r.processed).toISOString() : null,
  }));
}

// Atomically claim the pending request (status -> approved/rejected) so two
// concurrent approvals can't both pass the pending check and double-pay. The
// claim comes FIRST; only the winner may touch the balance, so a losing
// concurrent approve can never deduct.
export async function setWithdrawalStatus(id: string, status: WithdrawStatus): Promise<{ ok: boolean; error?: string }> {
  const claimed = await db`
    UPDATE withdraw_requests SET status = ${status}, processed_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND status = 'pending'
    RETURNING id, user_id, amount
  `;
  if (claimed.length === 0) {
    const rows = await db`SELECT id, status FROM withdraw_requests WHERE id = ${id}`;
    if (rows.length === 0) return { ok: false, error: 'Withdrawal request not found' };
    return { ok: false, error: 'This withdrawal request has already been processed' };
  }

  const req = claimed[0];

  // Approving pays out the balance. Deduct only after the claim is secured.
  // If the balance no longer covers the payout (spent meanwhile), release the
  // claim back to pending so the admin can retry or reject.
  if (status === 'approved') {
    const amt = Number(req.amount);
    const ded = await deductBalance(req.user_id, amt);
    if (!ded.ok) {
      await db`UPDATE withdraw_requests SET status = 'pending', processed_at = NULL WHERE id = ${id} AND status = 'approved'`;
      return { ok: false, error: 'User does not have enough balance to pay out this withdrawal' };
    }
    await db`INSERT INTO transactions (id, user_id, type, amount, description) VALUES (${genId('txn')}, ${req.user_id}, 'withdraw', ${-amt}, 'Withdrawal payout')`;
  }
  return { ok: true };
}