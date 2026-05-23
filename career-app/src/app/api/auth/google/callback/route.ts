import { NextResponse } from 'next/server';
import { getOAuth2Client, isMockOAuth } from '@/lib/googleCalendar';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(new URL('/internships/calendar?error=missing_code', request.url));
  }
  
  try {
    let accessToken = '';
    
    if (isMockOAuth() && code.startsWith('mock_')) {
      accessToken = 'mock_access_token_abc123';
    } else {
      const oauth2Client = getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);
      accessToken = tokens.access_token || '';
    }
    
    const redirectUrl = new URL('/internships/calendar', request.url);
    if (accessToken) {
      redirectUrl.searchParams.set('accessToken', accessToken);
    }
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error exchanging Google OAuth code:', error);
    return NextResponse.redirect(new URL('/internships/calendar?error=exchange_failed', request.url));
  }
}
