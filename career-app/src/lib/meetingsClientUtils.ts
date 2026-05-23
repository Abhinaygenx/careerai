// Smart recurring series detector (Client-Safe, no fs or db dependencies)
export function detectRecurringSuggestions(meetings: any[], userId: string): any[] {
  const ONE_ON_ONE_THRESHOLD = 3;
  const matchCounts: { [email: string]: { name: string; dates: Date[]; count: number } } = {};

  meetings.forEach(m => {
    if (m.userId !== userId || m.status === 'CANCELLED') return;
    // Find guests in the attendee list
    const guest = m.attendees?.find((a: any) => a.role !== 'HOST');
    if (guest && guest.email) {
      if (!matchCounts[guest.email]) {
        matchCounts[guest.email] = { name: guest.name || guest.email, dates: [], count: 0 };
      }
      matchCounts[guest.email].dates.push(new Date(m.startTime));
      matchCounts[guest.email].count += 1;
    }
  });

  const suggestions: any[] = [];
  Object.keys(matchCounts).forEach(email => {
    const details = matchCounts[email];
    if (details.count >= ONE_ON_ONE_THRESHOLD) {
      suggestions.push({
        attendeeName: details.name,
        attendeeEmail: email,
        meetingsCount: details.count,
        message: `You met with ${details.name} ${details.count} times recently. Create a recurring series?`
      });
    }
  });

  return suggestions;
}
