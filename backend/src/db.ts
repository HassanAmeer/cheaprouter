import postgres from 'postgres';

export const DB_URL = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/cheapmodels';

export const db = postgres(DB_URL, { max: 10 });

export async function initDb() {
  await db`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip TEXT;`;
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_agent TEXT;`;
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS hardware_info TEXT;`;
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;`;
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';`;
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;`;
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_cli TEXT DEFAULT 'Free';`;
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_api TEXT DEFAULT 'Free';`;
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_chat TEXT DEFAULT 'Free';`;
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_agents TEXT DEFAULT 'Free';`;
  } catch (e) {
    console.error('Migration error:', e);
  }
  
  await db`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_used TIMESTAMP
    );
  `;

  await db`
    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      masked_key TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await db`
    CREATE TABLE IF NOT EXISTS usage (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      model TEXT NOT NULL,
      tokens INTEGER NOT NULL DEFAULT 0,
      cost REAL NOT NULL DEFAULT 0,
      day TEXT NOT NULL
    );
  `;

  await db`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'New conversation',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await db`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await db`
    CREATE TABLE IF NOT EXISTS global_settings (
      id TEXT PRIMARY KEY,
      data JSON NOT NULL
    );
  `;

  await db`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await db`
    CREATE TABLE IF NOT EXISTS admin_providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status BOOLEAN NOT NULL DEFAULT true,
      key TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      base_url TEXT,
      use_models_api BOOLEAN DEFAULT false,
      models_api_link TEXT,
      api_format TEXT,
      is_custom BOOLEAN DEFAULT false,
      models JSON,
      headers JSON
    );
  `;
}

export function genId(prefix: string) {
  return prefix + '_' + crypto.randomUUID().slice(0, 8) + Math.random().toString(36).slice(2, 6);
}
