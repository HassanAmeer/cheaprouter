import postgres from 'postgres';
const db = postgres('postgres://postgres:postgres@localhost:5432/cheapmodels');
const users = await db`SELECT * FROM users ORDER BY created_at DESC LIMIT 5`;
console.log(users);
process.exit(0);
