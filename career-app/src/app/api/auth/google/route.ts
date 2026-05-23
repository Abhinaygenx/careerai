import { NextResponse } from 'next/server';
import { getOAuth2Client, isMockOAuth } from '@/lib/googleCalendar';

export async function GET(request: Request) {
  if (isMockOAuth()) {
    const callbackUrl = new URL('/api/auth/google/callback?code=mock_authorization_code_123', request.url);
    return NextResponse.redirect(callbackUrl);
  }

  const oauth2Client = getOAuth2Client();
  
  // Generate authorization URL for Google Calendar events scope
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    prompt: 'consent'
  });
  
  return NextResponse.redirect(authUrl);
}
