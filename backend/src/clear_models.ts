import { db } from './db.ts';

async function clearModels() {
  await db`UPDATE admin_providers SET models = '[]'::jsonb`;
  console.log('Cleared all models from admin_providers in the database.');
  process.exit(0);
}

clearModels();
