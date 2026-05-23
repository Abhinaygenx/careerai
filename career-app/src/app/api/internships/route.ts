import { NextResponse } from 'next/server';
import { getInternshipsForMonth } from '@/lib/internships';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get('month'); // e.g. "2025-06"
  const isIndia = searchParams.get('india') === 'true';
  
  try {
    const internships = await getInternshipsForMonth(monthParam, isIndia);
    return NextResponse.json(internships);
  } catch (error) {
    console.error('Error fetching internships in API:', error);
    return NextResponse.json({ error: 'Failed to fetch internships' }, { status: 500 });
  }
}
