import { db, genId } from './db.ts';

export function listConversations(userId: string) {
  return db
    .query('SELECT id, title, created_at FROM conversations WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as { id: string; title: string; created_at: string }[];
}

export function getMessages(conversationId: string, userId: string) {
  const conv = db.query('SELECT id FROM conversations WHERE id = ? AND user_id = ?').get(conversationId, userId);
  if (!conv) return null;
  return db
    .query('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
    .all(conversationId) as { role: 'user' | 'assistant'; content: string }[];
}

export function createConversation(userId: string, title: string) {
  const id = genId('cnv');
  db.query('INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)').run(id, userId, title);
  return id;
}

export function addMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
  db.query('INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').run(genId('msg'), conversationId, role, content);
}

export function renameConversation(id: string, userId: string, title: string) {
  db.query('UPDATE conversations SET title = ? WHERE id = ? AND user_id = ?').run(title, id, userId);
}
