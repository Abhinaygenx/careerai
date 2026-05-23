import { NextResponse } from 'next/server';
import { meetingsService } from '@/lib/meetingsService';

export const dynamic = 'force-dynamic';

// PATCH: Update meeting
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedMeeting = await meetingsService.updateMeeting(id, body);
    
    // Also sync action items if actionItems list is passed in body
    if (body.actionItems) {
      await meetingsService.syncActionItems(id, body.actionItems);
    }

    return NextResponse.json(updatedMeeting);
  } catch (error: any) {
    console.error(`Error in PATCH /api/meetings/[id]:`, error);
    return NextResponse.json({ error: error.message || 'Failed to update meeting' }, { status: 500 });
  }
}

// DELETE: Soft delete (set status = CANCELLED)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cancelledMeeting = await meetingsService.deleteMeeting(id);
    return NextResponse.json(cancelledMeeting);
  } catch (error: any) {
    console.error(`Error in DELETE /api/meetings/[id]:`, error);
    return NextResponse.json({ error: error.message || 'Failed to delete meeting' }, { status: 500 });
  }
}
