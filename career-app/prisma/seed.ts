import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { addDays, subDays, setHours, setMinutes } from 'date-fns';

const prisma = new PrismaClient();
const DB_FILE = path.join(__dirname, '../src/lib/meetings_db.json');

const MEETING_TYPES = ['STANDUP', 'ONE_ON_ONE', 'TEAM', 'CLIENT', 'INTERVIEW', 'REVIEW'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const COLORS = [
  '#8B7CF7', // purple (STANDUP)
  '#2DD4BF', // teal (ONE_ON_ONE)
  '#4DA3FF', // blue (TEAM)
  '#F59E0B', // amber (CLIENT)
  '#10B981', // green (INTERVIEW)
  '#FF6B9D'  // coral (REVIEW)
];

const ATTENDEE_TEMPLATES = [
  { name: 'John Doe', email: 'john@career.ai', role: 'REQUIRED' },
  { name: 'Sarah Connor', email: 'sarah@skynet.com', role: 'REQUIRED' },
  { name: 'Alice Vance', email: 'alice@blackmesa.org', role: 'OPTIONAL' },
  { name: 'Bob Vance', email: 'bob@vancerefrigeration.com', role: 'OPTIONAL' },
  { name: 'Bruce Wayne', email: 'bruce@waynecorp.com', role: 'REQUIRED' },
  { name: 'Peter Parker', email: 'peter@dailybugle.com', role: 'OPTIONAL' },
  { name: 'Tony Stark', email: 'tony@starkindustries.com', role: 'REQUIRED' },
];

const ACTION_ITEM_TEMPLATES = [
  'Prepare agenda slides',
  'Review product spec document',
  'Follow up with client regarding proposal',
  'Code refactoring for dashboard API',
  'Update Jira backlog with sprint points',
  'Schedule debrief meeting with team',
  'Send design specs to frontend devs',
  'Draft meeting summary email',
  'Approve budget spreadsheet',
  'Finalize hiring scorecard',
];

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function seed() {
  console.log('Starting seed process...');
  const today = new Date();
  const userId = 'default-user-id'; // standard userId fallback in app

  // 20 realistic meetings relative to today
  const meetingsData = [];

  // Generate 20 meetings spread across past 10 days and future 15 days
  for (let i = 0; i < 20; i++) {
    const isPast = i < 8;
    const isToday = i === 8 || i === 9;
    
    let targetDate = today;
    if (isPast) {
      targetDate = subDays(today, 10 - i);
    } else if (!isToday) {
      targetDate = addDays(today, i - 9);
    }

    // Set starting hour between 9:00 AM and 5:00 PM
    const startHour = 9 + (i % 8);
    const startMinute = (i % 2) * 30; // either :00 or :30
    
    const startTime = setMinutes(setHours(targetDate, startHour), startMinute);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);

    const durationMinutes = 30 + (i % 4) * 30; // 30, 60, 90, or 120 mins
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const type = MEETING_TYPES[i % MEETING_TYPES.length];
    const color = COLORS[i % COLORS.length];
    const priority = PRIORITIES[i % PRIORITIES.length];

    // Status: completed for past, scheduled/cancelled for future
    let status = 'SCHEDULED';
    if (isPast) {
      status = 'COMPLETED';
    } else if (i === 17) {
      status = 'CANCELLED';
    }

    // Notes
    let notes = `Discuss items relating to project milestone ${Math.floor(i / 3) + 1}.`;
    if (status === 'COMPLETED') {
      const mockHealth = 70 + (i % 4) * 8; // Health scores between 70 and 100
      notes = `healthScore:${mockHealth}\n${notes}`;
    }

    // Recurrence
    let recurrence = 'NONE';
    let recurrenceEnd = null;
    if (i === 3) {
      recurrence = 'DAILY';
      recurrenceEnd = addDays(startTime, 5);
    } else if (i === 6) {
      recurrence = 'WEEKLY';
      recurrenceEnd = addDays(startTime, 30);
    }

    // Title
    let title = '';
    if (type === 'STANDUP') title = 'Daily Engineering Standup';
    else if (type === 'ONE_ON_ONE') title = `Sync w/ ${ATTENDEE_TEMPLATES[i % ATTENDEE_TEMPLATES.length].name}`;
    else if (type === 'TEAM') title = 'Sprint Planning & Retro';
    else if (type === 'CLIENT') title = 'Client Onboarding & Demo';
    else if (type === 'INTERVIEW') title = 'Software Engineer Technical Interview';
    else if (type === 'REVIEW') title = 'Monthly Product Architecture Review';

    // Location
    const location = i % 3 === 0 ? 'Office Room 4B' : 'online';
    const meetLink = location === 'online' ? `https://meet.google.com/abc-${generateId().slice(0, 4)}-xyz` : '';

    // Tags
    const tags = ['project-x', 'sync', type.toLowerCase()];
    if (priority === 'HIGH') tags.push('urgent');

    // Attendees
    const attendees = [
      { name: 'Admin User', email: 'admin@career.ai', role: 'HOST', rsvp: 'ACCEPTED' },
    ];
    // Add 1 to 3 extra guests
    const guestCount = 1 + (i % 3);
    for (let g = 0; g < guestCount; g++) {
      const template = ATTENDEE_TEMPLATES[(i + g) % ATTENDEE_TEMPLATES.length];
      attendees.push({
        name: template.name,
        email: template.email,
        role: template.role,
        rsvp: isPast ? (g % 2 === 0 ? 'ACCEPTED' : 'DECLINED') : 'PENDING',
      });
    }

    // Action Items
    const actionItems = [];
    if (i % 2 === 0) {
      const actionCount = 1 + (i % 2);
      for (let a = 0; a < actionCount; a++) {
        actionItems.push({
          text: ACTION_ITEM_TEMPLATES[(i + a) % ACTION_ITEM_TEMPLATES.length],
          assignee: ATTENDEE_TEMPLATES[(i + a) % ATTENDEE_TEMPLATES.length].name,
          dueDate: addDays(startTime, 2 + a),
          done: isPast ? (a % 2 === 0) : false,
        });
      }
    }

    meetingsData.push({
      id: generateId(),
      title,
      description: `Detailed discussion for ${title}. Agenda items cover project scopes and deliverables.`,
      type,
      startTime,
      endTime,
      timezone: 'Asia/Kolkata',
      location,
      meetLink,
      status,
      recurrence,
      recurrenceEnd,
      notes,
      priority,
      color,
      userId,
      tags,
      reminderMinutes: [15, 60],
      attendees,
      actionItems,
    });
  }

  // --- Seed PostgreSQL (Prisma) if DATABASE_URL is configured ---
  let isDb = false;
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('postgresql://...')) {
    try {
      await prisma.$connect();
      isDb = true;
      console.log('Connected to PostgreSQL database. Seeding SQL...');
      
      // Clean delete existing data
      await prisma.actionItem.deleteMany({});
      await prisma.attendee.deleteMany({});
      await prisma.meetingNote.deleteMany({});
      await prisma.meeting.deleteMany({});

      // Insert meetings
      for (const m of meetingsData) {
        await prisma.meeting.create({
          data: {
            id: m.id,
            title: m.title,
            description: m.description,
            type: m.type,
            startTime: m.startTime,
            endTime: m.endTime,
            timezone: m.timezone,
            location: m.location,
            meetLink: m.meetLink,
            status: m.status,
            recurrence: m.recurrence,
            recurrenceEnd: m.recurrenceEnd,
            notes: m.notes,
            priority: m.priority,
            color: m.color,
            userId: m.userId,
            tags: m.tags,
            reminderMinutes: m.reminderMinutes,
            attendees: {
              create: m.attendees.map(a => ({
                name: a.name,
                email: a.email,
                role: a.role,
                rsvp: a.rsvp,
              })),
            },
            actionItems: {
              create: m.actionItems.map(ai => ({
                text: ai.text,
                assignee: ai.assignee,
                dueDate: ai.dueDate,
                done: ai.done,
              })),
            },
          },
        });
      }
      console.log('PostgreSQL database seeded successfully!');
    } catch (e) {
      console.warn('Prisma PostgreSQL connection failed or skipped. Seeding local JSON DB instead...');
    } finally {
      await prisma.$disconnect();
    }
  }

  // --- Seed Local JSON Fallback DB ---
  console.log(`Writing seed data to local JSON DB: ${DB_FILE}`);
  
  const meetingsJson = meetingsData.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    type: m.type,
    startTime: m.startTime.toISOString(),
    endTime: m.endTime.toISOString(),
    timezone: m.timezone,
    location: m.location,
    meetLink: m.meetLink,
    status: m.status,
    recurrence: m.recurrence,
    recurrenceEnd: m.recurrenceEnd ? m.recurrenceEnd.toISOString() : null,
    notes: m.notes,
    priority: m.priority,
    color: m.color,
    userId: m.userId,
    tags: m.tags,
    reminderMinutes: m.reminderMinutes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const attendeesJson: any[] = [];
  const actionItemsJson: any[] = [];

  meetingsData.forEach(m => {
    m.attendees.forEach(a => {
      attendeesJson.push({
        id: generateId(),
        meetingId: m.id,
        name: a.name,
        email: a.email,
        role: a.role,
        rsvp: a.rsvp,
      });
    });

    m.actionItems.forEach(ai => {
      actionItemsJson.push({
        id: generateId(),
        meetingId: m.id,
        text: ai.text,
        assignee: ai.assignee,
        dueDate: ai.dueDate.toISOString(),
        done: ai.done,
      });
    });
  });

  const localDB = {
    meetings: meetingsJson,
    attendees: attendeesJson,
    meetingNotes: [],
    actionItems: actionItemsJson,
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(localDB, null, 2));
  console.log('Local JSON DB seeded successfully!');
}

seed()
  .catch(err => {
    console.error('Seed process failed with error:', err);
    process.exit(1);
  });
