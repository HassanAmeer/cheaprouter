import { db, genId } from './db.ts';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function recordUsage(userId: string, model: string, tokens: number, cost: number) {
  const day = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  db.query('INSERT INTO usage (id, user_id, model, tokens, cost, day) VALUES (?, ?, ?, ?, ?, ?)').run(genId('usg'), userId, model, tokens, cost, day);
}

export function getAnalytics(userId: string) {
  const byDay = db
    .query('SELECT day, SUM(tokens) AS tokens FROM usage WHERE user_id = ? GROUP BY day')
    .all(userId) as { day: string; tokens: number }[];
  const totals = DAYS.map((d) => ({ label: d, value: byDay.find((b) => b.day === d)?.tokens ?? 0 }));

  const topModels = db
    .query('SELECT model, SUM(tokens) AS tokens FROM usage WHERE user_id = ? GROUP BY model ORDER BY tokens DESC LIMIT 4')
    .all(userId) as { model: string; tokens: number }[];

  const costRows = db
    .query('SELECT model, SUM(cost) AS cost FROM usage WHERE user_id = ? GROUP BY model')
    .all(userId) as { model: string; cost: number }[];

  const totalTokens = byDay.reduce((s, b) => s + b.tokens, 0);
  const totalCost = costRows.reduce((s, c) => s + c.cost, 0);

  return {
    usageOverTime: totals,
    topModels: topModels.length ? topModels : [{ model: 'No data yet', tokens: 0 }],
    costBreakdown: costRows.length
      ? costRows.map((c, i) => ({ label: c.model, value: Math.round(c.cost * 100), color: ['#CC0000', '#D97757', '#4285F4', '#0668E1'][i % 4] }))
      : [{ label: 'No data yet', value: 0, color: '#CCC' }],
    totalTokens,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

export function getSummary(userId: string) {
  const limit = 1_000_000;
  const used = (db.query('SELECT COALESCE(SUM(tokens),0) AS t FROM usage WHERE user_id = ?').get(userId) as { t: number }).t;
  const byok = (db.query('SELECT COUNT(*) AS c FROM providers WHERE user_id = ?').get(userId) as { c: number }).c;
  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    percent: Math.round((used / limit) * 100),
    providers: byok,
  };
}
