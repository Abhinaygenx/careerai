import { NextResponse } from 'next/server';
import { meetingsService } from '@/lib/meetingsService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'default-user-id';

    const analytics = await meetingsService.getAnalytics(userId);
    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Error in GET /api/meetings/analytics:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve analytics' }, { status: 500 });
  }
}
