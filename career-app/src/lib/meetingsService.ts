import { prisma, checkDbConnection, getLocalDB, saveLocalDB } from './db';
import { addDays, addWeeks, addMonths, differenceInMinutes, isBefore, isAfter, startOfDay, endOfDay, parseISO, format } from 'date-fns';
import { detectRecurringSuggestions } from './meetingsClientUtils';

// Helper to generate a UUID in JS for the JSON DB fallback
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Expand recurring meetings for a given date range
export function expandRecurringMeetings(meetings: any[], startDate?: Date, endDate?: Date): any[] {
  const expanded: any[] = [];
  const start = startDate ? startOfDay(startDate) : null;
  const end = endDate ? endOfDay(endDate) : null;

  for (const meeting of meetings) {
    const meetStart = new Date(meeting.startTime);
    const meetEnd = new Date(meeting.endTime);
    
    // Add the original meeting if it fits filters
    if (meeting.recurrence === 'NONE') {
      if ((!start || meetStart >= start) && (!end || meetStart <= end)) {
        expanded.push(meeting);
      }
      continue;
    }

    // Expand recurring events
    const duration = differenceInMinutes(meetEnd, meetStart);
    const recEnd = meeting.recurrenceEnd ? new Date(meeting.recurrenceEnd) : addMonths(meetStart, 6);
    
    let currentStart = meetStart;
    let limit = 0; // Guard against infinite loops

    while (currentStart <= recEnd && limit < 200) {
      if (end && currentStart > end) break;

      const currentEnd = addDays(currentStart, 0); // copy date
      currentEnd.setMinutes(currentEnd.getMinutes() + duration);

      // Create a virtual occurrence object
      // Give it a unique deterministic ID like meetingId-timestamp
      const occurrenceId = `${meeting.id}-${currentStart.getTime()}`;
      
      if ((!start || currentStart >= start) && (!end || currentStart <= end)) {
        expanded.push({
          ...meeting,
          id: meeting.id, // Keep base meeting ID for updates
          occurrenceId,   // Virtual occurrence instance ID
          startTime: currentStart,
          endTime: currentEnd,
          isOccurrence: true,
        });
      }

      // Increment based on frequency
      if (meeting.recurrence === 'DAILY') {
        currentStart = addDays(currentStart, 1);
      } else if (meeting.recurrence === 'WEEKLY') {
        currentStart = addWeeks(currentStart, 1);
      } else if (meeting.recurrence === 'BIWEEKLY') {
        currentStart = addWeeks(currentStart, 2);
      } else if (meeting.recurrence === 'MONTHLY') {
        currentStart = addMonths(currentStart, 1);
      } else {
        break;
      }
      limit++;
    }
  }

  return expanded;
}

// Calculate meeting health score (0-100)
export function calculateHealthScore(meeting: {
  startTime: Date;
  endTime: Date;
  actualDurationMinutes?: number; // if present, was it completed?
  actionItemsCount: number;
  hasBackToBack: boolean;
}) {
  let score = 100;
  
  const start = new Date(meeting.startTime);
  const end = new Date(meeting.endTime);
  const scheduledDuration = differenceInMinutes(end, start);
  
  // 1. Duration Efficiency (Completed earlier than scheduled = bonus)
  if (meeting.actualDurationMinutes !== undefined && meeting.actualDurationMinutes > 0) {
    const diff = scheduledDuration - meeting.actualDurationMinutes;
    if (diff > 5) {
      score += 10; // +10 points for finishing early!
    } else if (meeting.actualDurationMinutes > scheduledDuration + 10) {
      score -= 15; // penalize if it ran way over time
    }
  }

  // 2. Action Items Presence (Meeting output validation)
  if (meeting.actionItemsCount > 0) {
    score += 10; // reward actionable meetings
  } else {
    score -= 10; // penalize status updates with no takeaways
  }

  // 3. Back-to-Back Schedule Penalty
  if (meeting.hasBackToBack) {
    score -= 15;
  }

  // 4. End of Day Fatigue Penalty (meetings starting after 5:00 PM)
  const startHour = start.getHours();
  if (startHour >= 17) {
    score -= 10;
  }

  // Bound the final score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

// detectRecurringSuggestions imported from meetingsClientUtils

export const meetingsService = {
  // GET: List meetings
  async getMeetings(filters: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    status?: string;
    userId: string;
  }): Promise<any[]> {
    const isDb = await checkDbConnection();
    
    if (isDb) {
      const meetings = await prisma.meeting.findMany({
        where: {
          userId: filters.userId,
          ...(filters.type ? { type: filters.type } : {}),
          ...(filters.status ? { status: filters.status } : {}),
        },
        include: {
          attendees: true,
          actionItems: true,
          meetingNotes: true,
        },
      });

      // Map Dates properly and expand recurrence
      const mapped = meetings.map(m => ({
        ...m,
        startTime: new Date(m.startTime),
        endTime: new Date(m.endTime),
        recurrenceEnd: m.recurrenceEnd ? new Date(m.recurrenceEnd) : null,
      }));

      return expandRecurringMeetings(mapped, filters.startDate, filters.endDate);
    } else {
      // Fallback Local JSON DB
      const db = getLocalDB();
      const userMeetings = db.meetings.filter(m => m.userId === filters.userId);
      
      const hydrated = userMeetings.map(m => {
        const attendees = db.attendees.filter(a => a.meetingId === m.id);
        const actionItems = db.actionItems.filter(ai => ai.meetingId === m.id);
        const meetingNotes = db.meetingNotes.filter(n => n.meetingId === m.id);
        
        return {
          ...m,
          startTime: new Date(m.startTime),
          endTime: new Date(m.endTime),
          recurrenceEnd: m.recurrenceEnd ? new Date(m.recurrenceEnd) : null,
          attendees,
          actionItems,
          meetingNotes,
        };
      });

      const filtered = hydrated.filter(m => {
        if (filters.type && m.type !== filters.type) return false;
        if (filters.status && m.status !== filters.status) return false;
        return true;
      });

      return expandRecurringMeetings(filtered, filters.startDate, filters.endDate);
    }
  },

  // POST: Create meeting
  async createMeeting(data: {
    title: string;
    description?: string;
    type: string;
    startTime: Date;
    endTime: Date;
    timezone: string;
    location: string;
    meetLink?: string;
    recurrence: string;
    recurrenceEnd?: Date | null;
    priority: string;
    color: string;
    userId: string;
    tags?: string[];
    reminderMinutes?: number[];
    attendees: Array<{ name: string; email: string; role: string }>;
    actionItems?: Array<{ text: string; assignee: string; dueDate: Date }>;
  }): Promise<any> {
    const isDb = await checkDbConnection();
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const recurrenceEnd = data.recurrenceEnd ? new Date(data.recurrenceEnd) : null;

    if (isDb) {
      return prisma.meeting.create({
        data: {
          title: data.title,
          description: data.description || '',
          type: data.type,
          startTime,
          endTime,
          timezone: data.timezone,
          location: data.location,
          meetLink: data.meetLink || '',
          status: 'SCHEDULED',
          recurrence: data.recurrence,
          recurrenceEnd,
          priority: data.priority,
          color: data.color,
          userId: data.userId,
          tags: data.tags || [],
          reminderMinutes: data.reminderMinutes || [],
          attendees: {
            create: data.attendees.map(a => ({
              name: a.name,
              email: a.email,
              role: a.role,
              rsvp: 'PENDING',
            })),
          },
          actionItems: {
            create: (data.actionItems || []).map(ai => ({
              text: ai.text,
              assignee: ai.assignee,
              dueDate: new Date(ai.dueDate),
              done: false,
            })),
          },
        },
        include: {
          attendees: true,
          actionItems: true,
        },
      });
    } else {
      const db = getLocalDB();
      const meetingId = generateId();
      
      const newMeeting = {
        id: meetingId,
        title: data.title,
        description: data.description || '',
        type: data.type,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timezone: data.timezone,
        location: data.location,
        meetLink: data.meetLink || '',
        status: 'SCHEDULED',
        recurrence: data.recurrence,
        recurrenceEnd: recurrenceEnd ? recurrenceEnd.toISOString() : null,
        priority: data.priority,
        color: data.color,
        userId: data.userId,
        tags: data.tags || [],
        reminderMinutes: data.reminderMinutes || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newAttendees = data.attendees.map(a => ({
        id: generateId(),
        meetingId,
        name: a.name,
        email: a.email,
        role: a.role,
        rsvp: 'PENDING',
      }));

      const newActionItems = (data.actionItems || []).map(ai => ({
        id: generateId(),
        meetingId,
        text: ai.text,
        assignee: ai.assignee,
        dueDate: new Date(ai.dueDate).toISOString(),
        done: false,
      }));

      db.meetings.push(newMeeting);
      db.attendees.push(...newAttendees);
      db.actionItems.push(...newActionItems);
      saveLocalDB(db);

      return {
        ...newMeeting,
        startTime,
        endTime,
        recurrenceEnd,
        attendees: newAttendees,
        actionItems: newActionItems,
      };
    }
  },

  // PATCH: Update meeting
  async updateMeeting(id: string, data: any): Promise<any> {
    const isDb = await checkDbConnection();
    
    // Format dates if supplied
    const updateData: any = { ...data };
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    if (data.recurrenceEnd) updateData.recurrenceEnd = new Date(data.recurrenceEnd);

    // Delete relation updates to avoid prisma issues (we'll update attendees separately if needed)
    delete updateData.attendees;
    delete updateData.actionItems;
    delete updateData.meetingNotes;

    if (isDb) {
      return prisma.meeting.update({
        where: { id },
        data: updateData,
        include: {
          attendees: true,
          actionItems: true,
          meetingNotes: true,
        },
      });
    } else {
      const db = getLocalDB();
      const idx = db.meetings.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('Meeting not found');

      const existing = db.meetings[idx];
      const updated = {
        ...existing,
        ...updateData,
        startTime: updateData.startTime ? updateData.startTime.toISOString() : existing.startTime,
        endTime: updateData.endTime ? updateData.endTime.toISOString() : existing.endTime,
        recurrenceEnd: updateData.recurrenceEnd ? updateData.recurrenceEnd.toISOString() : existing.recurrenceEnd,
        updatedAt: new Date().toISOString(),
      };

      db.meetings[idx] = updated;
      saveLocalDB(db);

      return {
        ...updated,
        startTime: new Date(updated.startTime),
        endTime: new Date(updated.endTime),
        recurrenceEnd: updated.recurrenceEnd ? new Date(updated.recurrenceEnd) : null,
        attendees: db.attendees.filter(a => a.meetingId === id),
        actionItems: db.actionItems.filter(ai => ai.meetingId === id),
      };
    }
  },

  // DELETE: Soft delete (set status = CANCELLED)
  async deleteMeeting(id: string): Promise<any> {
    return this.updateMeeting(id, { status: 'CANCELLED' });
  },

  // POST: Add Note
  async addNote(meetingId: string, content: string, userId: string): Promise<any> {
    const isDb = await checkDbConnection();
    if (isDb) {
      return prisma.meetingNote.create({
        data: {
          meetingId,
          content,
          userId,
        },
      });
    } else {
      const db = getLocalDB();
      const newNote = {
        id: generateId(),
        meetingId,
        content,
        userId,
        createdAt: new Date().toISOString(),
      };
      db.meetingNotes.push(newNote);
      saveLocalDB(db);
      return newNote;
    }
  },

  // PATCH: Update Action Items (Mark Done/Not Done)
  async updateActionItem(actionItemId: string, done: boolean): Promise<any> {
    const isDb = await checkDbConnection();
    if (isDb) {
      return prisma.actionItem.update({
        where: { id: actionItemId },
        data: { done },
      });
    } else {
      const db = getLocalDB();
      const idx = db.actionItems.findIndex(ai => ai.id === actionItemId);
      if (idx === -1) throw new Error('Action item not found');

      db.actionItems[idx].done = done;
      saveLocalDB(db);
      return db.actionItems[idx];
    }
  },

  // PATCH: Update Action Items checklist on creation/modification
  async syncActionItems(meetingId: string, items: Array<{ id?: string; text: string; assignee: string; dueDate: Date; done?: boolean }>): Promise<any[]> {
    const isDb = await checkDbConnection();
    if (isDb) {
      // Clean delete existing items not in input
      const idsToKeep = items.filter(i => i.id).map(i => i.id as string);
      await prisma.actionItem.deleteMany({
        where: {
          meetingId,
          id: { notIn: idsToKeep }
        }
      });

      // Upsert remaining
      const results = [];
      for (const item of items) {
        if (item.id) {
          results.push(await prisma.actionItem.update({
            where: { id: item.id },
            data: { text: item.text, assignee: item.assignee, dueDate: new Date(item.dueDate), done: item.done ?? false }
          }));
        } else {
          results.push(await prisma.actionItem.create({
            data: { meetingId, text: item.text, assignee: item.assignee, dueDate: new Date(item.dueDate), done: false }
          }));
        }
      }
      return results;
    } else {
      const db = getLocalDB();
      
      // Delete old items
      db.actionItems = db.actionItems.filter(ai => ai.meetingId !== meetingId || items.some(i => i.id === ai.id));

      const results = items.map(item => {
        if (item.id) {
          const idx = db.actionItems.findIndex(ai => ai.id === item.id);
          if (idx !== -1) {
            db.actionItems[idx] = {
              ...db.actionItems[idx],
              text: item.text,
              assignee: item.assignee,
              dueDate: new Date(item.dueDate).toISOString(),
              done: item.done ?? db.actionItems[idx].done,
            };
            return db.actionItems[idx];
          }
        }
        
        const newItem = {
          id: generateId(),
          meetingId,
          text: item.text,
          assignee: item.assignee,
          dueDate: new Date(item.dueDate).toISOString(),
          done: false,
        };
        db.actionItems.push(newItem);
        return newItem;
      });

      saveLocalDB(db);
      return results;
    }
  },

  // POST: Complete meeting & calculate health score
  async completeMeeting(id: string, actualDurationMinutes?: number): Promise<any> {
    const isDb = await checkDbConnection();
    
    // Load meeting first
    let meeting: any;
    let actionItemsCount = 0;
    
    if (isDb) {
      meeting = await prisma.meeting.findUnique({
        where: { id },
        include: { actionItems: true }
      });
      actionItemsCount = meeting?.actionItems?.length || 0;
    } else {
      const db = getLocalDB();
      meeting = db.meetings.find(m => m.id === id);
      actionItemsCount = db.actionItems.filter(ai => ai.meetingId === id).length;
    }

    if (!meeting) throw new Error('Meeting not found');

    // Check back-to-back status (if there are other meetings starting right after this one ends)
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    
    const dayStart = startOfDay(startTime);
    const dayEnd = endOfDay(startTime);
    
    const todaysMeetings = await this.getMeetings({
      userId: meeting.userId,
      startDate: dayStart,
      endDate: dayEnd,
    });
    
    const hasBackToBack = todaysMeetings.some(other => {
      if (other.id === id) return false;
      const otherStart = new Date(other.startTime);
      // Within 10 minutes of this meeting's end
      const diff = Math.abs(differenceInMinutes(otherStart, endTime));
      return diff <= 10;
    });

    const notes = null; // compatibility
    const healthScore = calculateHealthScore({
      startTime,
      endTime,
      actualDurationMinutes,
      actionItemsCount,
      hasBackToBack,
    });

    return this.updateMeeting(id, {
      status: 'COMPLETED',
      notes: `healthScore:${healthScore}${meeting.notes ? '\n' + meeting.notes : ''}`
    });
  },

  // GET: Analytics summary
  async getAnalytics(userId: string): Promise<any> {
    const now = new Date();
    const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const monthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

    const meetings = await this.getMeetings({
      userId,
      startDate: monthStart,
      endDate: monthEnd,
    });

    // 1. STATS: Avg duration, busiest day, total hours
    let totalMinutes = 0;
    let completedCount = 0;
    let totalHealthScore = 0;
    const dayCounts: { [day: string]: number } = {};

    meetings.forEach(m => {
      const start = new Date(m.startTime);
      const end = new Date(m.endTime);
      const duration = differenceInMinutes(end, start);
      totalMinutes += duration;
      
      const dayName = format(start, 'EEEE');
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;

      // Extract health score from notes if present
      if (m.notes && m.notes.startsWith('healthScore:')) {
        const score = parseInt(m.notes.split('\n')[0].replace('healthScore:', ''), 10);
        if (!isNaN(score)) {
          totalHealthScore += score;
          completedCount++;
        }
      }
    });

    let busiestDay = 'None';
    let maxMeetings = 0;
    Object.keys(dayCounts).forEach(day => {
      if (dayCounts[day] > maxMeetings) {
        maxMeetings = dayCounts[day];
        busiestDay = day;
      }
    });

    const avgDuration = meetings.length > 0 ? Math.round(totalMinutes / meetings.length) : 0;
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const avgHealthScore = completedCount > 0 ? Math.round(totalHealthScore / completedCount) : 80;

    // 2. Types breakdown
    const typesMap: { [key: string]: number } = {
      STANDUP: 0, ONE_ON_ONE: 0, TEAM: 0, CLIENT: 0, INTERVIEW: 0, REVIEW: 0
    };
    meetings.forEach(m => {
      if (typesMap[m.type] !== undefined) {
        typesMap[m.type]++;
      }
    });
    const typeBreakdown = Object.keys(typesMap).map(type => ({
      name: type,
      value: typesMap[type]
    }));

    // 3. Weekly breakdown (meetings per day this week)
    const startOfCurrentWeek = addDays(now, -now.getDay()); // Sunday
    const weekMeetings = meetings.filter(m => {
      const mDate = new Date(m.startTime);
      return mDate >= startOfCurrentWeek && mDate <= addDays(startOfCurrentWeek, 7);
    });

    const weeklyDaysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, index) => {
      const dayMeetings = weekMeetings.filter(m => new Date(m.startTime).getDay() === index);
      return {
        name: label,
        meetings: dayMeetings.length
      };
    });

    // 4. Focus Time Saved calculation
    // Assume 3 hours/day focus hours = 15 hours/week.
    // Calculate overlap with 9am-12pm Mon-Fri.
    let focusMinutesOverlapCurrentWeek = 0;
    weekMeetings.forEach(m => {
      const mStart = new Date(m.startTime);
      const mEnd = new Date(m.endTime);
      
      // Mon (1) to Fri (5)
      const day = mStart.getDay();
      if (day >= 1 && day <= 5) {
        const focusStart = new Date(mStart);
        focusStart.setHours(9, 0, 0, 0);
        const focusEnd = new Date(mStart);
        focusEnd.setHours(12, 0, 0, 0);

        const overlapStart = mStart > focusStart ? mStart : focusStart;
        const overlapEnd = mEnd < focusEnd ? mEnd : focusEnd;

        if (overlapStart < overlapEnd) {
          focusMinutesOverlapCurrentWeek += differenceInMinutes(overlapEnd, overlapStart);
        }
      }
    });

    const totalFocusHoursAvailable = 15; // 3 hrs * 5 days
    const focusHoursBlocked = Math.round((focusMinutesOverlapCurrentWeek / 60) * 10) / 10;
    const focusScore = Math.max(0, Math.round(((totalFocusHoursAvailable - focusHoursBlocked) / totalFocusHoursAvailable) * 100));

    return {
      avgDuration,
      busiestDay,
      totalHours,
      avgHealthScore,
      typeBreakdown,
      weeklyChart: weeklyDaysMap,
      focusScore,
      focusHoursSaved: Math.max(0, totalFocusHoursAvailable - focusHoursBlocked)
    };
  },

  // GET: Overdue and pending action items
  async getOverdueActionItems(userId: string): Promise<any[]> {
    const isDb = await checkDbConnection();
    const now = new Date();

    if (isDb) {
      const actionItems = await prisma.actionItem.findMany({
        where: {
          done: false,
          meeting: {
            userId,
          },
        },
        include: {
          meeting: true,
        },
      });
      
      return actionItems.map(ai => ({
        ...ai,
        dueDate: new Date(ai.dueDate),
        isOverdue: isBefore(new Date(ai.dueDate), now),
      }));
    } else {
      const db = getLocalDB();
      const userMeetings = db.meetings.filter(m => m.userId === userId);
      const meetingIds = userMeetings.map(m => m.id);
      
      const pendingItems = db.actionItems.filter(ai => meetingIds.includes(ai.meetingId) && !ai.done);
      
      return pendingItems.map(ai => {
        const meeting = userMeetings.find(m => m.id === ai.meetingId);
        const dueDate = new Date(ai.dueDate);
        return {
          ...ai,
          dueDate,
          meeting,
          isOverdue: isBefore(dueDate, now),
        };
      });
    }
  }
};
