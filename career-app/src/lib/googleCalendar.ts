import { google } from 'googleapis';

export function isMockOAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return !clientId || clientId === 'your_id' || !clientSecret || clientSecret === 'your_secret';
}

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export async function addInternshipToCalendar(internship: any, accessToken: string) {
  if (isMockOAuth() || accessToken.startsWith('mock_')) {
    // Simulate API delay for a natural premium feel
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: `mock-event-${Math.random().toString(36).substring(7)}`,
      status: 'confirmed',
      summary: `Deadline: ${internship.title} - ${internship.company}`,
      htmlLink: 'https://calendar.google.com/calendar'
    };
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Map category to colorId:
  // Tech = 9 (Blueberry), Finance = 2 (Sage), Design = 5 (Banana), Marketing = 11 (Tomato)
  let colorId = '9';
  const type = internship.type;
  if (type === 'Finance') {
    colorId = '2';
  } else if (type === 'Design') {
    colorId = '5';
  } else if (type === 'Marketing') {
    colorId = '11';
  }

  // Parse deadline Date
  const deadlineDate = new Date(internship.deadline);
  
  // Format starting date to YYYY-MM-DD for Google Calendar all-day event
  const startStr = deadlineDate.toISOString().split('T')[0];
  
  // End date is exclusive for all-day events, so it must be the next day
  const endDate = new Date(deadlineDate);
  endDate.setDate(endDate.getDate() + 1);
  const endStr = endDate.toISOString().split('T')[0];

  const event = {
    summary: `⚠️ Deadline: ${internship.title} - ${internship.company}`,
    description: `Apply here: ${internship.applyUrl}\n\nStipend: ${internship.stipend}\nDuration: ${internship.duration}\n\nAdded via Career.AI Internship Calendar`,
    start: {
      date: startStr,
    },
    end: {
      date: endStr,
    },
    colorId,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10080 } // 7 days before
      ]
    }
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return response.data;
}
