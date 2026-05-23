import { NextResponse } from 'next/server';
import { meetingsService } from '@/lib/meetingsService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Meeting ID (not used directly, but part of route context)
    const body = await request.json();
    const { actionItemId, done } = body;

    if (!actionItemId) {
      return NextResponse.json({ error: 'actionItemId is required' }, { status: 400 });
    }

    const updatedItem = await meetingsService.updateActionItem(actionItemId, done);
    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error(`Error in PATCH /api/meetings/[id]/action-items:`, error);
    return NextResponse.json({ error: error.message || 'Failed to update action item' }, { status: 500 });
  }
}
