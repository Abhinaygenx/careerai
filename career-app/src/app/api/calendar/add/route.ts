import { NextResponse } from 'next/server';
import { addInternshipToCalendar } from '@/lib/googleCalendar';
import { mockInternships } from '@/lib/internships';

// Reconstruct deterministic values for lookup fallback
function getDeterministicValues(id: string): { day: number; stipend: string; duration: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const day = (absHash % 28) + 1;
  
  const stipends = [
    '₹25,000/mo', '₹35,000/mo', '₹45,000/mo', '₹50,000/mo', 
    '₹60,000/mo', '₹75,000/mo', '₹80,000/mo', '₹90,000/mo', 
    '₹1,00,000/mo', 'Unpaid'
  ];
  const stipend = stipends[absHash % stipends.length];

  const durations = ['2 Months', '3 Months', '4 Months', '6 Months'];
  const duration = durations[absHash % durations.length];

  return { day, stipend, duration };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { internshipId, accessToken, internship: clientInternship } = body;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }
    
    let internship = clientInternship;
    
    // Fallback: Reconstruct internship details if client only sent the ID
    if (!internship) {
      const mock = mockInternships.find(m => m.id === internshipId);
      if (mock) {
        const now = new Date();
        const det = getDeterministicValues(mock.id);
        const deadline = new Date(now.getFullYear(), now.getMonth(), det.day);
        internship = {
          ...mock,
          deadline
        };
      }
    }
    
    if (!internship) {
      return NextResponse.json({ error: 'Internship not found and cannot be reconstructed' }, { status: 404 });
    }
    
    const result = await addInternshipToCalendar(internship, accessToken);
    
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error in /api/calendar/add:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to add internship to calendar' 
    }, { status: 500 });
  }
}
