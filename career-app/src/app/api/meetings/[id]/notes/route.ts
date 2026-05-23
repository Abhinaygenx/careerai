import { NextResponse } from 'next/server';
import { meetingsService } from '@/lib/meetingsService';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = body.userId || request.headers.get('x-user-id') || 'default-user-id';

    if (!body.content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const note = await meetingsService.addNote(id, body.content, userId);
    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    console.error(`Error in POST /api/meetings/[id]/notes:`, error);
    return NextResponse.json({ error: error.message || 'Failed to add note' }, { status: 500 });
  }
}
