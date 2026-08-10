import { db, initDb } from './src/db.ts';
async function test() {
  await initDb();
  console.log("DB Init Done");
  const data = await db`SELECT * FROM admin_raw_data LIMIT 1`;
  console.log(data);
  process.exit(0);
}
test();
