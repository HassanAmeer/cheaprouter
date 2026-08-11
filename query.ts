import { db } from './backend/src/db';

async function main() {
  const p = await db`SELECT id, name, status, key, models FROM admin_providers WHERE id = 'ap_opencode'`;
  console.log(JSON.stringify(p, null, 2));
  process.exit(0);
}
main();
