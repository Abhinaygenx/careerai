import { NextResponse } from 'next/server';
import { meetingsService } from '@/lib/meetingsService';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actualDurationMinutes = body.actualDurationMinutes; // Optional input

    const completedMeeting = await meetingsService.completeMeeting(id, actualDurationMinutes);
    return NextResponse.json(completedMeeting);
  } catch (error: any) {
    console.error(`Error in POST /api/meetings/[id]/complete:`, error);
    return NextResponse.json({ error: error.message || 'Failed to complete meeting' }, { status: 500 });
  }
}
