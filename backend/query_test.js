import postgres from 'postgres';
const db = postgres('postgres://postgres:postgres@localhost:5432/cheapmodels');
const users = await db`SELECT id, email, last_ip, user_agent, hardware_info FROM users WHERE email = 'test_ip_1@example.com'`;
console.log(users);
process.exit(0);
