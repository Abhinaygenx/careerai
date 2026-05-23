import { NextResponse } from 'next/server';
import { meetingsService } from '@/lib/meetingsService';
import { createEvent, EventAttributes } from 'ics';

export const dynamic = 'force-dynamic';

function getIcsString(event: EventAttributes): Promise<string> {
  return new Promise((resolve, reject) => {
    createEvent(event, (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'default-user-id';

    // Fetch all meetings to find this specific one
    const meetings = await meetingsService.getMeetings({ userId });
    const meeting = meetings.find(m => m.id === id);

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);

    const eventAttributes: EventAttributes = {
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
      ],
      end: [
        end.getFullYear(),
        end.getMonth() + 1,
        end.getDate(),
        end.getHours(),
        end.getMinutes(),
      ],
      title: meeting.title,
      description: meeting.description || '',
      location: meeting.location === 'online' ? (meeting.meetLink || 'Zoom/Meet Link') : meeting.location,
      url: meeting.meetLink || undefined,
      status: meeting.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED',
      categories: meeting.tags || [],
    };

    const icsString = await getIcsString(eventAttributes);

    // Return the .ics file with proper calendar content type and headers
    return new Response(icsString, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="meeting-${meeting.title.replace(/\s+/g, '_')}.ics"`,
      },
    });
  } catch (error: any) {
    console.error(`Error in GET /api/meetings/[id]/ics:`, error);
    return NextResponse.json({ error: error.message || 'Failed to generate ICS file' }, { status: 500 });
  }
}
