import { db, genId } from './db.ts';

export const WELCOME_CREDIT = 10;

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
  await db`UPDATE users SET balance = COALESCE(balance, 0) + ${WELCOME_CREDIT} WHERE id = ${userId}`;
  await db`INSERT INTO transactions (id, user_id, type, amount, description) VALUES (${genId('txn')}, ${userId}, 'welcome', ${WELCOME_CREDIT}, 'Welcome credit')`;
}

export async function topUp(userId: string, amount: number) {
  const amt = Math.max(0.01, Math.round((Number(amount) || 0) * 100) / 100);
  await db`UPDATE users SET balance = COALESCE(balance, 0) + ${amt} WHERE id = ${userId}`;
  await db`INSERT INTO transactions (id, user_id, type, amount, description) VALUES (${genId('txn')}, ${userId}, 'topup', ${amt}, 'Added funds')`;
  const res = await db`SELECT balance FROM users WHERE id = ${userId}`;
  return { balance: Number(res[0].balance), amount: amt };
}

export interface UpgradeInput {
  planField: string;
  planId: string;
  planName: string;
  price: number;
  durationDays?: number;
}

export async function upgradePlan(userId: string, input: UpgradeInput) {
  const { planField, planId, planName, price, durationDays } = input;
  if (!PLAN_FIELDS.includes(planField)) {
    return { ok: false as const, error: 'Invalid plan field' };
  }

  const userRes = await db`SELECT balance FROM users WHERE id = ${userId}`;
  const balance = Number(userRes[0]?.balance ?? 0);
  const cost = Math.max(0, Math.round((Number(price) || 0) * 100) / 100);

  if (cost > 0 && balance < cost) {
    return { ok: false as const, error: 'Insufficient balance', balance };
  }

  const days = durationDays && durationDays > 0 ? Math.round(durationDays) : 30;

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
    await db`UPDATE users SET balance = ${balance - cost} WHERE id = ${userId}`;
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
