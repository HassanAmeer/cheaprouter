import { NextResponse } from 'next/server';
import { notificationsDb } from '@/lib/notificationsDb';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const userNotifs = notificationsDb.getByUser(userId);
  return NextResponse.json({ notifications: userNotifs });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, targetUserId } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const newNotif = notificationsDb.create(title, message, targetUserId || 'ALL');
    return NextResponse.json({ success: true, notification: newNotif });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { action, id, userId } = body;
    
    if (action === 'markRead' && id) {
      notificationsDb.markAsRead(id);
      return NextResponse.json({ success: true });
    } else if (action === 'markAllRead' && userId) {
      notificationsDb.markAllAsRead(userId);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
