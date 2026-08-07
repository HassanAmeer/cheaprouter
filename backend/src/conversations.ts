import { db, genId } from './db.ts';

export async function listConversations(userId: string) {
  return await db`SELECT id, title, created_at FROM conversations WHERE user_id = ${userId} ORDER BY created_at DESC` as { id: string; title: string; created_at: string }[];
}

export async function getMessages(conversationId: string, userId: string) {
  const conv = await db`SELECT id FROM conversations WHERE id = ${conversationId} AND user_id = ${userId}`;
  if (conv.length === 0) return null;
  return await db`SELECT role, content FROM messages WHERE conversation_id = ${conversationId} ORDER BY created_at ASC` as { role: 'user' | 'assistant'; content: string }[];
}

export async function createConversation(userId: string, title: string) {
  const id = genId('cnv');
  await db`INSERT INTO conversations (id, user_id, title) VALUES (${id}, ${userId}, ${title})`;
  return id;
}

export async function addMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
  await db`INSERT INTO messages (id, conversation_id, role, content) VALUES (${genId('msg')}, ${conversationId}, ${role}, ${content})`;
}

export async function renameConversation(id: string, userId: string, title: string) {
  await db`UPDATE conversations SET title = ${title} WHERE id = ${id} AND user_id = ${userId}`;
}
