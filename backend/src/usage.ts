import { db, genId } from './db.ts';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export async function recordUsage(userId: string, model: string, tokens: number, cost: number, source: string = 'api') {
  const day = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  await db`INSERT INTO usage (id, user_id, model, tokens, cost, day, source) VALUES (${genId('usg')}, ${userId}, ${model}, ${tokens}, ${cost}, ${day}, ${source})`;
}

export async function getAnalytics(userId: string, source?: string) {
  const sourceFilter = source && source !== 'all' ? db`source = ${source}` : null;
  const byDay = await db`
    SELECT day, SUM(tokens) AS tokens FROM usage WHERE user_id = ${userId}
    ${sourceFilter ? db`AND source = ${source}` : db``} GROUP BY day
  ` as { day: string; tokens: number }[];
  const totals = DAYS.map((d) => ({ label: d, value: Number(byDay.find((b) => b.day === d)?.tokens ?? 0) }));

  const topModels = await db`
    SELECT model, SUM(tokens) AS tokens FROM usage WHERE user_id = ${userId}
    ${sourceFilter ? db`AND source = ${source}` : db``} GROUP BY model ORDER BY tokens DESC LIMIT 4
  ` as { model: string; tokens: number }[];

  const costRows = await db`
    SELECT model, SUM(cost) AS cost FROM usage WHERE user_id = ${userId}
    ${sourceFilter ? db`AND source = ${source}` : db``} GROUP BY model
  ` as { model: string; cost: number }[];

  const callsRes = await db`
    SELECT COUNT(*) AS c FROM usage WHERE user_id = ${userId}
    ${sourceFilter ? db`AND source = ${source}` : db``}
  ` as { c: number }[];

  const totalTokens = byDay.reduce((s, b) => s + Number(b.tokens), 0);
  const totalCost = costRows.reduce((s, c) => s + Number(c.cost), 0);

  return {
    usageOverTime: totals,
    topModels: topModels.length ? topModels.map(m => ({ ...m, tokens: Number(m.tokens) })) : [{ model: 'No data yet', tokens: 0 }],
    costBreakdown: costRows.length
      ? costRows.map((c, i) => ({ label: c.model, value: Math.round(Number(c.cost) * 100), color: ['#CC0000', '#D97757', '#4285F4', '#0668E1'][i % 4] }))
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
  const limit = 1_000_000;
  const usedRes = await db`SELECT COALESCE(SUM(tokens),0) AS t FROM usage WHERE user_id = ${userId}`;
  const used = Number(usedRes[0].t);
  const byokRes = await db`SELECT COUNT(*) AS c FROM providers WHERE user_id = ${userId}`;
  const byok = Number(byokRes[0].c);
  
  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    percent: Math.round((used / limit) * 100),
    providers: byok,
  };
}
