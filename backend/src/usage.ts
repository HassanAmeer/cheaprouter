import { db, genId } from './db.ts';
import { getBillingSettings } from './billing.ts';
import { maybeRewardReferral } from './billing.ts';
import { checkPlanLimit, getPlanLimitFromSettings, SOURCE_TO_PLAN_FIELD, getUserPlanForSource, getMonthlyUsageBySource } from './billing.ts';

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
  const conditions: any[] = [db`user_id = ${userId}`];
  if (source && source !== 'all') conditions.push(db`source = ${source}`);
  if (days && days > 0) conditions.push(db`created_at >= NOW() - INTERVAL '1 day' * ${days}`);
  const whereClause = conditions.length > 1 ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}` : db`WHERE ${conditions[0]}`;

  // Usage per day as an actual time series (by date), not weekday buckets.
  const byDate = await db`
    SELECT to_char(created_at, 'YYYY-MM-DD') AS date, SUM(tokens) AS tokens
    FROM usage ${whereClause}
    GROUP BY date ORDER BY date ASC
  ` as { date: string; tokens: number }[];

  const byDay = await db`
    SELECT day, SUM(tokens) AS tokens FROM usage ${whereClause}
    GROUP BY day
  ` as { day: string; tokens: number }[];
  const totals = DAYS.map((d) => ({ label: d, value: Number(byDay.find((b) => b.day === d)?.tokens ?? 0) }));

  const topModels = await db`
    SELECT model, SUM(tokens) AS tokens FROM usage ${whereClause}
    GROUP BY model ORDER BY tokens DESC LIMIT 4
  ` as { model: string; tokens: number }[];

  const costRows = await db`
    SELECT model, SUM(cost) AS cost FROM usage ${whereClause}
    GROUP BY model
  ` as { model: string; cost: number }[];

  const callsRes = await db`
    SELECT COUNT(*) AS c FROM usage ${whereClause}
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
  const conditions: any[] = [db`user_id = ${userId}`];
  if (source && source !== 'all') {
    if (source === 'chat') {
      conditions.push(db`(source = 'chat' OR source = 'web')`);
    } else {
      conditions.push(db`source = ${source}`);
    }
  }
  const whereClause = conditions.length > 1 ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}` : db`WHERE ${conditions[0]}`;

  const rows = await db`
    SELECT model,
           COALESCE(source, 'api') AS source,
           COUNT(*) AS hits,
           COALESCE(SUM(tokens), 0) AS tokens,
           COALESCE(SUM(cost), 0) AS cost,
           MAX(created_at) AS last_used
    FROM usage ${whereClause}
    GROUP BY model, source
    ORDER BY last_used DESC NULLS LAST, hits DESC
  ` as { model: string; source: string; hits: string; tokens: string; cost: string; last_used: string | null }[];

  const models = rows.map(r => ({
    model: r.model,
    source: r.source === 'web' ? 'chat' : r.source,
    hits: Number(r.hits),
    tokens: Number(r.tokens),
    cost: Math.round(Number(r.cost) * 10000) / 10000,
    last_used: r.last_used ? new Date(r.last_used).toISOString() : null,
  }));

  // Type summary stats for this user across all types
  const typeCounts = await db`
    SELECT COALESCE(source, 'api') AS source,
           COUNT(*) AS hits,
           COALESCE(SUM(tokens), 0) AS tokens,
           COALESCE(SUM(cost), 0) AS cost
    FROM usage
    WHERE user_id = ${userId}
    GROUP BY source
  ` as { source: string; hits: string; tokens: string; cost: string }[];

  const byType: Record<string, { hits: number; tokens: number; cost: number; models: number }> = {
    all: { hits: 0, tokens: 0, cost: 0, models: 0 },
    cli: { hits: 0, tokens: 0, cost: 0, models: 0 },
    ide: { hits: 0, tokens: 0, cost: 0, models: 0 },
    chat: { hits: 0, tokens: 0, cost: 0, models: 0 },
    api: { hits: 0, tokens: 0, cost: 0, models: 0 },
  };

  const modelsByType: Record<string, Set<string>> = {
    all: new Set(),
    cli: new Set(),
    ide: new Set(),
    chat: new Set(),
    api: new Set(),
  };

  // Populate per-type model counts from query
  const allUserRows = await db`
    SELECT model, COALESCE(source, 'api') AS source
    FROM usage
    WHERE user_id = ${userId}
    GROUP BY model, source
  ` as { model: string; source: string }[];

  for (const ur of allUserRows) {
    const s = ur.source === 'web' ? 'chat' : ur.source;
    if (modelsByType[s]) modelsByType[s].add(ur.model);
    modelsByType.all.add(ur.model);
  }

  for (const tc of typeCounts) {
    const s = tc.source === 'web' ? 'chat' : tc.source;
    const h = Number(tc.hits);
    const tok = Number(tc.tokens);
    const c = Math.round(Number(tc.cost) * 10000) / 10000;
    if (byType[s]) {
      byType[s].hits += h;
      byType[s].tokens += tok;
      byType[s].cost = Math.round((byType[s].cost + c) * 10000) / 10000;
    }
    byType.all.hits += h;
    byType.all.tokens += tok;
    byType.all.cost = Math.round((byType.all.cost + c) * 10000) / 10000;
  }

  for (const k of Object.keys(byType)) {
    byType[k].models = modelsByType[k]?.size ?? 0;
  }

  let conversations = 0;
  let messages = 0;
  if (!source || source === 'all' || source === 'chat') {
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
    byType,
    totalModels: new Set(models.map(m => m.model)).size,
    totalCalls: models.reduce((s, m) => s + m.hits, 0),
    totalTokens: models.reduce((s, m) => s + m.tokens, 0),
    totalCost: Math.round(models.reduce((s, m) => s + m.cost, 0) * 10000) / 10000,
    conversations,
    messages,
  };
}

// ── Admin-wide usage breakdown by model and source ──
export async function getAdminUsage(source?: string, days?: number) {
  const conditions: any[] = [];
  if (source && source !== 'all') {
    if (source === 'chat') {
      conditions.push(db`(u.source = 'chat' OR u.source = 'web')`);
    } else {
      conditions.push(db`u.source = ${source}`);
    }
  }
  if (days && days > 0) {
    conditions.push(db`u.created_at >= NOW() - INTERVAL '1 day' * ${days}`);
  }
  const whereClause = conditions.length > 0 ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}` : db``;

  const rows = await db`
    SELECT u.model,
           COALESCE(u.source, 'api') AS source,
           COUNT(*) AS hits,
           COALESCE(SUM(u.tokens), 0) AS tokens,
           COALESCE(SUM(u.cost), 0) AS cost,
           MAX(u.created_at) AS last_used,
           COUNT(DISTINCT u.user_id) AS total_users
    FROM usage u ${whereClause}
    GROUP BY u.model, u.source
    ORDER BY last_used DESC NULLS LAST, hits DESC
  ` as { model: string; source: string; hits: string; tokens: string; cost: string; last_used: string | null; total_users: string }[];

  const models = rows.map(r => ({
    model: r.model,
    source: r.source === 'web' ? 'chat' : r.source,
    hits: Number(r.hits),
    tokens: Number(r.tokens),
    cost: Math.round(Number(r.cost) * 10000) / 10000,
    total_users: Number(r.total_users || 0),
    last_used: r.last_used ? new Date(r.last_used).toISOString() : null,
  }));

  // Platform-wide type stats
  const typeCounts = await db`
    SELECT COALESCE(source, 'api') AS source,
           COUNT(*) AS hits,
           COALESCE(SUM(tokens), 0) AS tokens,
           COALESCE(SUM(cost), 0) AS cost
    FROM usage
    GROUP BY source
  ` as { source: string; hits: string; tokens: string; cost: string }[];

  const byType: Record<string, { hits: number; tokens: number; cost: number; models: number }> = {
    all: { hits: 0, tokens: 0, cost: 0, models: 0 },
    cli: { hits: 0, tokens: 0, cost: 0, models: 0 },
    ide: { hits: 0, tokens: 0, cost: 0, models: 0 },
    chat: { hits: 0, tokens: 0, cost: 0, models: 0 },
    api: { hits: 0, tokens: 0, cost: 0, models: 0 },
  };

  const modelsByType: Record<string, Set<string>> = {
    all: new Set(),
    cli: new Set(),
    ide: new Set(),
    chat: new Set(),
    api: new Set(),
  };

  const allModelRows = await db`
    SELECT model, COALESCE(source, 'api') AS source
    FROM usage
    GROUP BY model, source
  ` as { model: string; source: string }[];

  for (const mr of allModelRows) {
    const s = mr.source === 'web' ? 'chat' : mr.source;
    if (modelsByType[s]) modelsByType[s].add(mr.model);
    modelsByType.all.add(mr.model);
  }

  for (const tc of typeCounts) {
    const s = tc.source === 'web' ? 'chat' : tc.source;
    const h = Number(tc.hits);
    const tok = Number(tc.tokens);
    const c = Math.round(Number(tc.cost) * 10000) / 10000;
    if (byType[s]) {
      byType[s].hits += h;
      byType[s].tokens += tok;
      byType[s].cost = Math.round((byType[s].cost + c) * 10000) / 10000;
    }
    byType.all.hits += h;
    byType.all.tokens += tok;
    byType.all.cost = Math.round((byType.all.cost + c) * 10000) / 10000;
  }

  for (const k of Object.keys(byType)) {
    byType[k].models = modelsByType[k]?.size ?? 0;
  }

  // Active users count
  const userCountRes = await db`SELECT COUNT(DISTINCT u.user_id) AS c FROM usage u ${whereClause}` as { c: string }[];
  const activeUsers = Number(userCountRes[0]?.c ?? 0);

  // Recent usage activity logs (latest 30)
  const recentLogs = await db`
    SELECT u.id,
           u.model,
           COALESCE(u.source, 'api') AS source,
           u.tokens,
           u.cost,
           u.created_at,
           u.user_id,
           usr.email AS user_email,
           usr.name AS user_name
    FROM usage u
    LEFT JOIN users usr ON usr.id = u.user_id
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT 30
  ` as any[];

  const logs = recentLogs.map(l => ({
    id: l.id,
    model: l.model,
    source: l.source === 'web' ? 'chat' : l.source,
    tokens: Number(l.tokens),
    cost: Math.round(Number(l.cost) * 10000) / 10000,
    created_at: l.created_at ? new Date(l.created_at).toISOString() : null,
    user_id: l.user_id,
    user_email: l.user_email || 'anonymous',
    user_name: l.user_name || 'User',
  }));

  return {
    models,
    logs,
    byType,
    totalModels: new Set(models.map(m => m.model)).size,
    totalCalls: models.reduce((s, m) => s + m.hits, 0),
    totalTokens: models.reduce((s, m) => s + m.tokens, 0),
    totalCost: Math.round(models.reduce((s, m) => s + m.cost, 0) * 10000) / 10000,
    activeUsers,
  };
}

export async function getSummary(userId: string) {
  const userRes = await db`SELECT plan FROM users WHERE id = ${userId}`;
  const userPlan = userRes[0]?.plan || 'Free';
  const limit = await getPlanLimitFromSettings(userPlan);
  // Quota is a per-month allowance: compare against the CURRENT month only.
  const used = await getMonthlyUsage(userId);
  const byokRes = await db`SELECT COUNT(*) AS c FROM providers WHERE user_id = ${userId}`;
  const byok = Number(byokRes[0]?.c ?? 0);
  
  // Get per-source plan limits
  const planLimits: Record<string, { planName: string; limit: number; used: number; remaining: number; percent: number }> = {};
  for (const source of Object.keys(SOURCE_TO_PLAN_FIELD)) {
    const check = await checkPlanLimit(userId, source);
    planLimits[source] = {
      planName: check.planName,
      limit: check.limit,
      used: check.used,
      remaining: Math.max(0, check.limit - check.used),
      percent: Math.min(100, Math.round((check.used / check.limit) * 100)),
    };
  }
  
  return {
    planName: userPlan,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    percent: Math.min(100, Math.round((used / limit) * 100)),
    providers: byok,
    planLimits,
  };
}

// ── Admin-wide revenue & usage analytics ──
export async function getAdminAnalytics(daysParam?: string) {
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

  // Period stats for filtering (7d, 15d, 30d, last_month, all)
  const periodStatsRes = await db`
    SELECT 
      COALESCE(SUM(CASE WHEN type IN ('topup', 'withdraw') AND created_at >= NOW() - INTERVAL '7 days' THEN amount ELSE 0 END), 0) AS rev_7d,
      COALESCE(SUM(CASE WHEN type IN ('topup', 'withdraw') AND created_at >= NOW() - INTERVAL '15 days' THEN amount ELSE 0 END), 0) AS rev_15d,
      COALESCE(SUM(CASE WHEN type IN ('topup', 'withdraw') AND created_at >= NOW() - INTERVAL '30 days' THEN amount ELSE 0 END), 0) AS rev_30d,
      COALESCE(SUM(CASE WHEN type IN ('topup', 'withdraw') AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days' THEN amount ELSE 0 END), 0) AS rev_last_month,
      COALESCE(SUM(CASE WHEN type IN ('topup', 'withdraw') THEN amount ELSE 0 END), 0) AS rev_all
    FROM transactions
  ` as { rev_7d: string; rev_15d: string; rev_30d: string; rev_last_month: string; rev_all: string }[];

  const periodStats = {
    '7d': Math.round(Number(periodStatsRes[0]?.rev_7d ?? 0) * 100) / 100,
    '15d': Math.round(Number(periodStatsRes[0]?.rev_15d ?? 0) * 100) / 100,
    '30d': Math.round(Number(periodStatsRes[0]?.rev_30d ?? 0) * 100) / 100,
    'last_month': Math.round(Number(periodStatsRes[0]?.rev_last_month ?? 0) * 100) / 100,
    'all': Math.round(Number(periodStatsRes[0]?.rev_all ?? 0) * 100) / 100,
  };

  const d = String(daysParam || 'all').toLowerCase();
  let trendWhere = db``;
  let costTrendWhere = db``;

  if (d === '7' || d === '7d') {
    trendWhere = db`WHERE created_at >= NOW() - INTERVAL '7 days'`;
    costTrendWhere = db`WHERE created_at >= NOW() - INTERVAL '7 days'`;
  } else if (d === '15' || d === '15d') {
    trendWhere = db`WHERE created_at >= NOW() - INTERVAL '15 days'`;
    costTrendWhere = db`WHERE created_at >= NOW() - INTERVAL '15 days'`;
  } else if (d === '30' || d === '30d') {
    trendWhere = db`WHERE created_at >= NOW() - INTERVAL '30 days'`;
    costTrendWhere = db`WHERE created_at >= NOW() - INTERVAL '30 days'`;
  } else if (d === 'last_month') {
    trendWhere = db`WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'`;
    costTrendWhere = db`WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'`;
  }

  // Selected period revenue trend
  const trend = await db`
    SELECT to_char(created_at, 'YYYY-MM-DD') AS date,
           SUM(CASE WHEN type IN ('topup', 'withdraw') THEN amount ELSE 0 END) AS revenue
    FROM transactions
    ${trendWhere}
    GROUP BY date ORDER BY date ASC
  ` as { date: string; revenue: string }[];

  const costTrend = await db`
    SELECT to_char(created_at, 'YYYY-MM-DD') AS date, COALESCE(SUM(cost),0) AS cost
    FROM usage
    ${costTrendWhere}
    GROUP BY date ORDER BY date ASC
  ` as { date: string; cost: string }[];

  const revenueTrend = trend.map((t) => ({
    date: t.date,
    revenue: Math.round(Number(t.revenue) * 100) / 100,
    cost: Number(costTrend.find((c) => c.date === t.date)?.cost ?? 0),
  }));

  // MRR: net money in over the last 30 days (topups minus payouts).
  const mrr = periodStats['30d'];

  // Platform margin based on real collected revenue vs usage cost charged.
  const overallMargin = totalRevenue > 0
    ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 1000) / 10
    : 0;

  // Total tokens and requests platform-wide
  const totalTokensRes = await db`SELECT COALESCE(SUM(tokens),0) AS tokens, COUNT(*) AS requests FROM usage` as { tokens: string; requests: string }[];
  const totalTokens = Number(totalTokensRes[0]?.tokens ?? 0);
  const totalRequests = Number(totalTokensRes[0]?.requests ?? 0);

  // Tokens consumed per plan tier:
  const planTokensRes = await db`
    SELECT 
      COALESCE(u.plan, 'Free') AS plan,
      u.plan_api,
      u.plan_cli,
      COALESCE(SUM(us.tokens), 0) AS tokens
    FROM usage us
    JOIN users u ON u.id = us.user_id
    GROUP BY u.plan, u.plan_api, u.plan_cli
  ` as { plan: string; plan_api: string; plan_cli: string; tokens: string }[];

  let freeTokens = 0;
  let proTokens = 0;
  let premiumTokens = 0;

  for (const r of planTokensRes) {
    const raw = String(r.plan || r.plan_api || r.plan_cli || 'Free').toLowerCase();
    const tokens = Number(r.tokens || 0);
    if (raw.includes('prem') || raw.includes('enterprise')) {
      premiumTokens += tokens;
    } else if (raw.includes('pro') || raw.includes('starter')) {
      proTokens += tokens;
    } else {
      freeTokens += tokens;
    }
  }

  // Top models by tokens & requests
  const topModelsRes = await db`
    SELECT model, COUNT(*) AS hits, COALESCE(SUM(tokens),0) AS tokens, COALESCE(SUM(cost),0) AS cost
    FROM usage GROUP BY model ORDER BY tokens DESC LIMIT 10
  ` as { model: string; hits: string; tokens: string; cost: string }[];
  const topModels = topModelsRes.map((m) => {
    const tokens = Number(m.tokens);
    return {
      model: m.model,
      name: m.model,
      requests: Number(m.hits),
      tokens,
      revenue: Math.round(Number(m.cost) * 100) / 100,
      tokenPercent: totalTokens > 0 ? Math.round((tokens / totalTokens) * 1000) / 10 : 0,
      margin: overallMargin,
    };
  });
  const mostUsedModel = topModels[0] || null;

  // Top 10 users by token consumption
  const topTokenUsersRes = await db`
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      COALESCE(u.plan, 'Free') AS plan,
      u.plan_api,
      u.plan_cli,
      COUNT(us.id) AS calls, 
      COALESCE(SUM(us.tokens), 0) AS tokens, 
      COALESCE(SUM(us.cost), 0) AS spend
    FROM usage us 
    JOIN users u ON u.id = us.user_id
    GROUP BY u.id, u.name, u.email, u.plan, u.plan_api, u.plan_cli 
    ORDER BY tokens DESC 
    LIMIT 10
  ` as { id: string; name: string; email: string; plan: string; plan_api: string; plan_cli: string; calls: string; tokens: string; spend: string }[];

  const topTokenUsers = topTokenUsersRes.map((u) => {
    const raw = String(u.plan || u.plan_api || u.plan_cli || 'Free').toLowerCase();
    const planType = (raw.includes('prem') || raw.includes('enterprise')) ? 'Premium' : (raw.includes('pro') || raw.includes('starter')) ? 'Pro' : 'Free';
    return {
      id: u.id,
      name: u.name || u.email.split('@')[0],
      email: u.email,
      plan: planType,
      calls: Number(u.calls),
      tokens: Number(u.tokens),
      spend: Math.round(Number(u.spend) * 100) / 100,
    };
  });

  // Top users by spend (legacy preserved)
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

  // Plan distribution & tier counts
  const usersPlanRes = await db`
    SELECT id, COALESCE(plan, 'Free') AS plan, plan_api, plan_cli FROM users
  ` as { id: string; plan: string; plan_api: string; plan_cli: string }[];

  let freeUsersCount = 0;
  let proUsersCount = 0;
  let premiumUsersCount = 0;

  for (const u of usersPlanRes) {
    const raw = String(u.plan || u.plan_api || u.plan_cli || 'Free').toLowerCase();
    if (raw.includes('prem') || raw.includes('enterprise')) {
      premiumUsersCount++;
    } else if (raw.includes('pro') || raw.includes('starter')) {
      proUsersCount++;
    } else {
      freeUsersCount++;
    }
  }

  const planStats = {
    freeUsersCount,
    proUsersCount,
    premiumUsersCount,
    totalUsersCount: usersPlanRes.length,
    freeTokens,
    proTokens,
    premiumTokens,
  };

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
    periodStats,
    revenueTrend,
    totalTokens,
    totalRequests,
    topModels,
    mostUsedModel,
    topUsers,
    topTokenUsers,
    planStats,
    costBreakdown,
  };
}
