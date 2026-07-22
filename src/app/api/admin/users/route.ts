import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const statsResult = db.getUserStats(filter, startDate, endDate);

    return NextResponse.json({
      users: statsResult.filteredUsers,
      allUsers: db.listUsers(),
      stats: {
        total: statsResult.total,
        today: statsResult.today,
        last7Days: statsResult.last7Days,
        last30Days: statsResult.last30Days,
        filteredCount: statsResult.filteredCount
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

