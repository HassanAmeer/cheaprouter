import { db, genId } from './db.ts';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export async function recordUsage(userId: string, model: string, tokens: number, cost: number) {
  const day = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  await db`INSERT INTO usage (id, user_id, model, tokens, cost, day) VALUES (${genId('usg')}, ${userId}, ${model}, ${tokens}, ${cost}, ${day})`;
}

export async function getAnalytics(userId: string) {
  const byDay = await db`SELECT day, SUM(tokens) AS tokens FROM usage WHERE user_id = ${userId} GROUP BY day` as { day: string; tokens: number }[];
  const totals = DAYS.map((d) => ({ label: d, value: Number(byDay.find((b) => b.day === d)?.tokens ?? 0) }));

  const topModels = await db`SELECT model, SUM(tokens) AS tokens FROM usage WHERE user_id = ${userId} GROUP BY model ORDER BY tokens DESC LIMIT 4` as { model: string; tokens: number }[];

  const costRows = await db`SELECT model, SUM(cost) AS cost FROM usage WHERE user_id = ${userId} GROUP BY model` as { model: string; cost: number }[];

  const totalTokens = byDay.reduce((s, b) => s + Number(b.tokens), 0);
  const totalCost = costRows.reduce((s, c) => s + Number(c.cost), 0);

  return {
    usageOverTime: totals,
    topModels: topModels.length ? topModels.map(m => ({ ...m, tokens: Number(m.tokens) })) : [{ model: 'No data yet', tokens: 0 }],
    costBreakdown: costRows.length
      ? costRows.map((c, i) => ({ label: c.model, value: Math.round(Number(c.cost) * 100), color: ['#CC0000', '#D97757', '#4285F4', '#0668E1'][i % 4] }))
      : [{ label: 'No data yet', value: 0, color: '#CCC' }],
    totalTokens,
    totalCost: Math.round(totalCost * 100) / 100,
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
