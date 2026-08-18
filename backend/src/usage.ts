import { db, genId } from './db.ts';
import { getBillingSettings } from './billing.ts';
import { maybeRewardReferral } from './billing.ts';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export async function recordUsage(userId: string, model: string, tokens: number, cost: number, source: string = 'api') {
  const day = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  await db`INSERT INTO usage (id, user_id, model, tokens, cost, day, source) VALUES (${genId('usg')}, ${userId}, ${model}, ${tokens}, ${cost}, ${day}, ${source})`;
  // A referee's first API call unlocks the referral bonus for both parties.
  await maybeRewardReferral(userId);
}

// Tokens used in the CURRENT calendar month (the quota window).
export async function getMonthlyUsage(userId: string): Promise<number> {
  const res = await db`
    SELECT COALESCE(SUM(tokens), 0) AS t FROM usage
    WHERE user_id = ${userId} AND created_at >= date_trunc('month', CURRENT_TIMESTAMP)
  `;
  return Number(res[0]?.t ?? 0);
}

export async function checkMonthlyQuota(userId: string): Promise<{ ok: boolean; limit: number; used: number; remaining: number }> {
  const { monthlyTokenQuota } = await getBillingSettings();
  const used = await getMonthlyUsage(userId);
  const remaining = Math.max(0, monthlyTokenQuota - used);
  return { ok: used < monthlyTokenQuota, limit: monthlyTokenQuota, used, remaining };
}

export async function getAnalytics(userId: string, source?: string, days?: number) {
  const sourceFilter = source && source !== 'all' ? db`source = ${source}` : null;
  const daysFilter = days && days > 0 ? db`created_at >= NOW() - INTERVAL '1 day' * ${days}` : null;

  // Usage per day as an actual time series (by date), not weekday buckets.
  const byDate = await db`
    SELECT to_char(created_at, 'YYYY-MM-DD') AS date, SUM(tokens) AS tokens
    FROM usage WHERE user_id = ${userId}
    ${sourceFilter ? db`AND source = ${source}` : db``}
    ${daysFilter ? db`AND ${daysFilter}` : db``}
    GROUP BY date ORDER BY date ASC
  ` as { date: string; tokens: number }[];

  const byDay = await db`
    SELECT day, SUM(tokens) AS tokens FROM usage WHERE user_id = ${userId}
    ${sourceFilter ? db`AND source = ${source}` : db``}
    ${daysFilter ? db`AND ${daysFilter}` : db``}
    GROUP BY day
  ` as { day: string; tokens: number }[];
  const totals = DAYS.map((d) => ({ label: d, value: Number(byDay.find((b) => b.day === d)?.tokens ?? 0) }));

  const topModels = await db`
    SELECT model, SUM(tokens) AS tokens FROM usage WHERE user_id = ${userId}
    ${sourceFilter ? db`AND source = ${source}` : db``}
    ${daysFilter ? db`AND ${daysFilter}` : db``}
    GROUP BY model ORDER BY tokens DESC LIMIT 4
  ` as { model: string; tokens: number }[];

  const costRows = await db`
    SELECT model, SUM(cost) AS cost FROM usage WHERE user_id = ${userId}
    ${sourceFilter ? db`AND source = ${source}` : db``}
    ${daysFilter ? db`AND ${daysFilter}` : db``}
    GROUP BY model
  ` as { model: string; cost: number }[];

  const callsRes = await db`
    SELECT COUNT(*) AS c FROM usage WHERE user_id = ${userId}
    ${sourceFilter ? db`AND source = ${source}` : db``}
    ${daysFilter ? db`AND ${daysFilter}` : db``}
  ` as { c: number }[];

  const totalTokens = byDay.reduce((s, b) => s + Number(b.tokens), 0);
  const totalCost = costRows.reduce((s, c) => s + Number(c.cost), 0);

  return {
    usageOverTime: byDate.length
      ? byDate.map((d) => ({ label: d.date, value: Number(d.tokens) }))
      : totals,
    topModels: topModels.length ? topModels.map(m => ({ ...m, tokens: Number(m.tokens) })) : [{ model: 'No data yet', tokens: 0 }],
    costBreakdown: costRows.length
      ? costRows.map((c, i) => ({ label: c.model, value: Math.round(Number(c.cost) * 100) / 100, color: ['#CC0000', '#D97757', '#4285F4', '#0668E1'][i % 4] }))
      : [{ label: 'No data yet', value: 0, color: '#CCC' }],
    totalCalls: Number(callsRes[0]?.c ?? 0),
    totalTokens,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

export async function getUsageBreakdown(userId: string, source?: string) {
  const rows = await db`
    SELECT model,
           COUNT(*) AS hits,
           COALESCE(SUM(tokens), 0) AS tokens,
           COALESCE(SUM(cost), 0) AS cost,
           MAX(created_at) AS last_used
    FROM usage
    WHERE user_id = ${userId}
    ${source && source !== 'all' ? db`AND source = ${source}` : db``}
    GROUP BY model
    ORDER BY hits DESC
  ` as { model: string; hits: string; tokens: string; cost: string; last_used: string | null }[];

  const models = rows.map(r => ({
    model: r.model,
    hits: Number(r.hits),
    tokens: Number(r.tokens),
    cost: Math.round(Number(r.cost) * 10000) / 10000,
    last_used: r.last_used ? new Date(r.last_used).toISOString() : null,
  }));

  let conversations = 0;
  let messages = 0;
  if (source === 'chat') {
    const convRes = await db`SELECT COUNT(*) AS c FROM conversations WHERE user_id = ${userId}` as { c: number }[];
    const msgRes = await db`
      SELECT COUNT(*) AS c FROM messages m
      JOIN conversations cv ON cv.id = m.conversation_id
      WHERE cv.user_id = ${userId}
    ` as { c: number }[];
    conversations = Number(convRes[0]?.c ?? 0);
    messages = Number(msgRes[0]?.c ?? 0);
  }

  return {
    models,
    totalModels: models.length,
    totalCalls: models.reduce((s, m) => s + m.hits, 0),
    totalTokens: models.reduce((s, m) => s + m.tokens, 0),
    totalCost: Math.round(models.reduce((s, m) => s + m.cost, 0) * 10000) / 10000,
    conversations,
    messages,
  };
}

export async function getSummary(userId: string) {
  const { monthlyTokenQuota } = await getBillingSettings();
  const limit = monthlyTokenQuota;
  // Quota is a per-month allowance: compare against the CURRENT month only.
  const used = await getMonthlyUsage(userId);
  const byokRes = await db`SELECT COUNT(*) AS c FROM providers WHERE user_id = ${userId}`;
  const byok = Number(byokRes[0].c);
  
  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    percent: Math.min(100, Math.round((used / limit) * 100)),
    providers: byok,
  };
}

// ── Admin-wide revenue & usage analytics ──
export async function getAdminAnalytics() {
  const costRes = await db`SELECT COALESCE(SUM(cost),0) AS cost FROM usage` as { cost: string }[];
  const totalCost = Math.round(Number(costRes[0]?.cost ?? 0) * 100) / 100;

  // Revenue: money actually collected from users. Upgrades are paid out of the
  // user's prepaid (topup) balance, so counting them as revenue would
  // double-count the topup. Revenue = topups (money in) + withdrawals (money
  // out, stored as negative amounts).
  const revRes = await db`
    SELECT COALESCE(SUM(CASE WHEN type IN ('topup', 'withdraw') THEN amount ELSE 0 END), 0) AS rev
    FROM transactions
  ` as { rev: string }[];
  const totalRevenue = Math.round(Number(revRes[0]?.rev ?? 0) * 100) / 100;

  // MRR: net money in over the last 30 days (topups minus payouts).
  const mrrRes = await db`
    SELECT COALESCE(SUM(CASE WHEN type IN ('topup', 'withdraw') THEN amount ELSE 0 END), 0) AS rev
    FROM transactions
    WHERE created_at >= NOW() - INTERVAL '30 days'
  ` as { rev: string }[];
  const mrr = Math.round(Number(mrrRes[0]?.rev ?? 0) * 100) / 100;

  // Last 14 days revenue & cost trend.
  const trend = await db`
    SELECT to_char(created_at, 'YYYY-MM-DD') AS date,
           SUM(CASE WHEN type IN ('topup', 'withdraw') THEN amount ELSE 0 END) AS revenue
    FROM transactions
    WHERE created_at >= NOW() - INTERVAL '14 days'
    GROUP BY date ORDER BY date ASC
  ` as { date: string; revenue: string }[];

  const costTrend = await db`
    SELECT to_char(created_at, 'YYYY-MM-DD') AS date, COALESCE(SUM(cost),0) AS cost
    FROM usage WHERE created_at >= NOW() - INTERVAL '14 days'
    GROUP BY date ORDER BY date ASC
  ` as { date: string; cost: string }[];

  const revenueTrend = trend.map((d) => ({
    date: d.date,
    revenue: Math.round(Number(d.revenue) * 100) / 100,
    cost: Number(costTrend.find((c) => c.date === d.date)?.cost ?? 0),
  }));

  // Platform margin based on real collected revenue vs usage cost charged.
  const overallMargin = totalRevenue > 0
    ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 1000) / 10
    : 0;

  // Top models by cost.
  const topModelsRes = await db`
    SELECT model, COUNT(*) AS hits, COALESCE(SUM(tokens),0) AS tokens, COALESCE(SUM(cost),0) AS cost
    FROM usage GROUP BY model ORDER BY cost DESC LIMIT 6
  ` as { model: string; hits: string; tokens: string; cost: string }[];
  const topModels = topModelsRes.map((m) => ({
    model: m.model,
    requests: Number(m.hits),
    tokens: Number(m.tokens),
    revenue: Math.round(Number(m.cost) * 100) / 100,
    margin: overallMargin,
  }));

  // Top users by spend.
  const topUsersRes = await db`
    SELECT u.name, u.email, u.id, COUNT(us.id) AS calls, COALESCE(SUM(us.cost),0) AS spend
    FROM usage us JOIN users u ON u.id = us.user_id
    GROUP BY u.id ORDER BY spend DESC LIMIT 6
  ` as { name: string; email: string; id: string; calls: string; spend: string }[];
  const topUsers = topUsersRes.map((u) => ({
    name: u.name ?? u.email,
    email: u.email,
    calls: Number(u.calls),
    spend: Math.round(Number(u.spend) * 100) / 100,
  }));

  // Cost breakdown by model (for donut).
  const costBreakdownRes = await db`
    SELECT model, COALESCE(SUM(cost),0) AS cost FROM usage GROUP BY model ORDER BY cost DESC LIMIT 6
  ` as { model: string; cost: string }[];
  const costBreakdown = costBreakdownRes.length
    ? costBreakdownRes.map((c) => ({ label: c.model, value: Math.round(Number(c.cost) * 100) / 100, color: ['#CC0000', '#D97757', '#4285F4', '#0668E1', '#10B981', '#8B5CF6'][costBreakdownRes.indexOf(c) % 6] }))
    : [{ label: 'No data yet', value: 0, color: '#CCC' }];

  return {
    totalCost,
    totalRevenue,
    mrr,
    revenueTrend,
    topModels,
    topUsers,
    costBreakdown,
  };
}
