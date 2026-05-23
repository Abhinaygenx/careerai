import { NextResponse } from 'next/server';
import { meetingsService } from '@/lib/meetingsService';

export const dynamic = 'force-dynamic';

function getUserIdFromRequest(request: Request) {
  const url = new URL(request.url);
  const queryUserId = url.searchParams.get('userId');
  const headerUserId = request.headers.get('x-user-id');
  return queryUserId || headerUserId || 'default-user-id';
}

// GET: List meetings
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    const type = url.searchParams.get('type') || undefined;
    const status = url.searchParams.get('status') || undefined;

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const meetings = await meetingsService.getMeetings({
      userId,
      startDate,
      endDate,
      type,
      status,
    });

    return NextResponse.json(meetings);
  } catch (error: any) {
    console.error('Error in GET /api/meetings:', error);
    return NextResponse.json({ error: error.message || 'Failed to list meetings' }, { status: 500 });
  }
}

// POST: Create meeting
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body.userId || request.headers.get('x-user-id') || 'default-user-id';

    if (!body.title || !body.startTime || !body.endTime || !body.type) {
      return NextResponse.json({ error: 'Missing required fields: title, startTime, endTime, type' }, { status: 400 });
    }

    const meeting = await meetingsService.createMeeting({
      title: body.title,
      description: body.description,
      type: body.type,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      timezone: body.timezone || 'Asia/Kolkata',
      location: body.location || 'online',
      meetLink: body.meetLink,
      recurrence: body.recurrence || 'NONE',
      recurrenceEnd: body.recurrenceEnd ? new Date(body.recurrenceEnd) : null,
      priority: body.priority || 'MEDIUM',
      color: body.color || '#4DA3FF',
      userId,
      tags: body.tags || [],
      reminderMinutes: body.reminderMinutes || [],
      attendees: body.attendees || [],
      actionItems: body.actionItems || [],
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/meetings:', error);
    return NextResponse.json({ error: error.message || 'Failed to create meeting' }, { status: 500 });
  }
}
