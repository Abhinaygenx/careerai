import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format, differenceInMinutes } from 'date-fns';
import { MEETING_TYPE_LABELS, MEETING_TYPE_ICONS } from './MeetingChip';
import { checkFocusTimeOverlap } from './FocusTimeGuard';

export interface MeetingFormProps {
  isOpen: boolean;
  onClose: () => void;
  meeting?: any; // If provided, we are editing. If null, creating.
  userId: string;
  defaultDate?: Date;
  defaultStartHour?: number;
  onSave: (data: any) => Promise<void>;
  onDelete?: (meetingId: string) => Promise<void>;
}

const PRESET_COLORS = [
  '#8B7CF7', // purple (STANDUP)
  '#2DD4BF', // teal (ONE_ON_ONE)
  '#4DA3FF', // blue (TEAM)
  '#F59E0B', // amber (CLIENT)
  '#10B981', // green (INTERVIEW)
  '#FF6B9D', // coral (REVIEW)
  '#A855F7', // bright purple
  '#EC4899', // pink
];

const REMINDER_OPTIONS = [
  { label: '15 min before', value: 15 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
  { label: '1 week before', value: 10080 },
];

export default function MeetingForm({
  isOpen,
  onClose,
  meeting,
  userId,
  defaultDate,
  defaultStartHour,
  onSave,
  onDelete,
}: MeetingFormProps) {
  // 1. Core Fields state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('STANDUP');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(30); // minutes
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [location, setLocation] = useState('online');
  const [meetLink, setMeetLink] = useState('');
  const [meetPlatform, setMeetPlatform] = useState<'Zoom' | 'Meet' | 'Teams' | 'None'>('None');
  const [priority, setPriority] = useState('MEDIUM');
  const [color, setColor] = useState('#8B7CF7');
  const [notes, setNotes] = useState('');

  // 2. Recurrence state
  const [recurrence, setRecurrence] = useState('NONE');
  const [recurrenceEnd, setRecurrenceEnd] = useState('');

  // 3. Tags state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // 4. Reminders state
  const [selectedReminders, setSelectedReminders] = useState<number[]>([15]);

  // 5. Attendees state
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeeRole, setAttendeeRole] = useState('REQUIRED');
  const [attendees, setAttendees] = useState<Array<{ id?: string; name: string; email: string; role: string }>>([]);

  // 6. Action Items state
  const [actionText, setActionText] = useState('');
  const [actionAssignee, setActionAssignee] = useState('');
  const [actionDueDate, setActionDueDate] = useState('');
  const [actionItems, setActionItems] = useState<Array<{ id?: string; text: string; assignee: string; dueDate: string; done?: boolean }>>([]);

  // Overlap indicators
  const [focusOverlap, setFocusOverlap] = useState(false);
  const [saving, setSaving] = useState(false);

  // Voice speech assistant states
  const [isListening, setIsListening] = useState(false);
  const [voiceTip, setVoiceTip] = useState('');

  const handleVoiceSchedule = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech Recognition is not supported in your browser. Please try in Chrome or Safari.');
      return;
    }

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.lang = 'en-US';
    rec.interimResults = false;

    rec.onstart = () => {
      setIsListening(true);
      setVoiceTip('Try saying: "Project review meeting tomorrow at 3 PM"');
    };

    rec.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
      setIsListening(false);
      setVoiceTip('Could not hear you. Try again.');
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        // Parse date/time/title
        const parsed = parseVoiceCommand(transcript);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.date) setDate(parsed.date);
        if (parsed.time) setStartTime(parsed.time);
        setVoiceTip(`Auto-filled: "${transcript}"`);
      }
    };

    rec.start();
  };

  const parseVoiceCommand = (transcript: string) => {
    const res: { title?: string; date?: string; time?: string } = {};
    const text = transcript.toLowerCase();

    // Time parsing: at XX:XX, at XX AM/PM
    const timeMatch = text.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];
      if (ampm) {
        if (ampm.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (ampm.toLowerCase() === 'am' && hours === 12) hours = 0;
      }
      res.time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // Date parsing: today, tomorrow, this/on weekDays
    const dateObj = new Date();
    if (text.includes('tomorrow')) {
      dateObj.setDate(dateObj.getDate() + 1);
      res.date = format(dateObj, 'yyyy-MM-dd');
    } else if (text.includes('today')) {
      res.date = format(dateObj, 'yyyy-MM-dd');
    } else {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (let i = 0; i < 7; i++) {
        if (text.includes(`on ${days[i]}`) || text.includes(`this ${days[i]}`)) {
          const current = dateObj.getDay();
          let diff = i - current;
          if (diff <= 0) diff += 7;
          dateObj.setDate(dateObj.getDate() + diff);
          res.date = format(dateObj, 'yyyy-MM-dd');
          break;
        }
      }
    }

    // Title parsing: remove schedule/create/add
    let titleStr = transcript.replace(/^(schedule|add|create|new)\s+/i, '');
    const stops = [/\bat\b/i, /\bon\b/i, /\btomorrow\b/i, /\btoday\b/i];
    for (const rx of stops) {
      const matchIndex = titleStr.search(rx);
      if (matchIndex !== -1) {
        titleStr = titleStr.substring(0, matchIndex);
      }
    }
    res.title = titleStr.trim().charAt(0).toUpperCase() + titleStr.trim().slice(1);
    return res;
  };

  // Timezone Auto-Detect
  useEffect(() => {
    try {
      const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTZ) setTimezone(userTZ);
    } catch (e) {
      console.warn('Failed to auto-detect user timezone');
    }
  }, []);

  // Pre-fill fields for Create or Edit
  useEffect(() => {
    if (isOpen) {
      if (meeting) {
        // Edit Mode
        setTitle(meeting.title || '');
        setDescription(meeting.description || '');
        setType(meeting.type || 'STANDUP');
        
        const start = new Date(meeting.startTime);
        const end = new Date(meeting.endTime);
        
        setDate(format(start, 'yyyy-MM-dd'));
        setStartTime(format(start, 'HH:mm'));
        setDuration(differenceInMinutes(end, start) || 30);
        setTimezone(meeting.timezone || 'Asia/Kolkata');
        setLocation(meeting.location || 'online');
        setMeetLink(meeting.meetLink || '');
        setPriority(meeting.priority || 'MEDIUM');
        setColor(meeting.color || '#8B7CF7');
        
        // Strip out health score from notes if present
        let displayNotes = meeting.notes || '';
        if (displayNotes.startsWith('healthScore:')) {
          displayNotes = displayNotes.split('\n').slice(1).join('\n');
        }
        setNotes(displayNotes);

        setRecurrence(meeting.recurrence || 'NONE');
        setRecurrenceEnd(meeting.recurrenceEnd ? format(new Date(meeting.recurrenceEnd), 'yyyy-MM-dd') : '');
        setTags(meeting.tags || []);
        setSelectedReminders(meeting.reminderMinutes || [15]);
        setAttendees(meeting.attendees || []);
        setActionItems(meeting.actionItems || []);
      } else {
        // Create Mode
        const initialDate = defaultDate ? defaultDate : new Date();
        const initialHour = defaultStartHour !== undefined ? defaultStartHour : 9;
        
        setTitle('');
        setDescription('');
        setType('STANDUP');
        setDate(format(initialDate, 'yyyy-MM-dd'));
        setStartTime(`${String(initialHour).padStart(2, '0')}:00`);
        setDuration(30);
        setLocation('online');
        setMeetLink('');
        setPriority('MEDIUM');
        setColor(PRESET_COLORS[0]);
        setNotes('');
        setRecurrence('NONE');
        setRecurrenceEnd('');
        setTags([]);
        setSelectedReminders([15]);
        setAttendees([]);
        setActionItems([]);
      }
    }
  }, [isOpen, meeting, defaultDate, defaultStartHour]);

  // Platform Auto-Detect
  useEffect(() => {
    if (!meetLink) {
      setMeetPlatform('None');
      return;
    }
    const lower = meetLink.toLowerCase();
    if (lower.includes('zoom.us')) {
      setMeetPlatform('Zoom');
    } else if (lower.includes('meet.google.com')) {
      setMeetPlatform('Meet');
    } else if (lower.includes('teams.microsoft.com') || lower.includes('teams.live.com')) {
      setMeetPlatform('Teams');
    } else {
      setMeetPlatform('None');
    }
  }, [meetLink]);

  // Focus time overlap check
  useEffect(() => {
    if (date && startTime && duration) {
      const parts = startTime.split(':');
      const start = new Date(date);
      start.setHours(parseInt(parts[0], 10));
      start.setMinutes(parseInt(parts[1], 10));
      
      const end = new Date(start.getTime() + duration * 60 * 1000);
      setFocusOverlap(checkFocusTimeOverlap(start, end));
    }
  }, [date, startTime, duration]);

  // Form Handlers
  const handleAddAttendee = () => {
    if (!attendeeEmail.trim()) return;
    const name = attendeeName.trim() || attendeeEmail.split('@')[0];
    
    // Check duplication
    if (attendees.some(a => a.email === attendeeEmail)) return;

    setAttendees([...attendees, { name, email: attendeeEmail, role: attendeeRole }]);
    setAttendeeName('');
    setAttendeeEmail('');
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a.email !== email));
  };

  const handleAddAction = () => {
    if (!actionText.trim()) return;
    const assignee = actionAssignee.trim() || 'Unassigned';
    const dueDate = actionDueDate || date; // default to meeting date

    setActionItems([...actionItems, { text: actionText.trim(), assignee, dueDate }]);
    setActionText('');
    setActionAssignee('');
    setActionDueDate('');
  };

  const handleRemoveAction = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/,/g, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSaveClick = async () => {
    if (!title.trim() || !date || !startTime) {
      alert('Please fill out the Title and Date/Time slots.');
      return;
    }

    setSaving(true);
    try {
      const parts = startTime.split(':');
      const start = new Date(date);
      start.setHours(parseInt(parts[0], 10));
      start.setMinutes(parseInt(parts[1], 10));
      
      const end = new Date(start.getTime() + duration * 60 * 1000);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        startTime: start,
        endTime: end,
        timezone,
        location,
        meetLink: location === 'online' ? meetLink : '',
        recurrence,
        recurrenceEnd: recurrence !== 'NONE' && recurrenceEnd ? new Date(recurrenceEnd) : null,
        priority,
        color,
        userId,
        tags,
        reminderMinutes: selectedReminders,
        attendees,
        actionItems,
        notes: notes.trim(),
      };

      if (meeting) {
        await onSave({ ...payload, id: meeting.id });
      } else {
        await onSave(payload);
      }
      onClose();
    } catch (e: any) {
      alert(e.message || 'Failed to save meeting');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          />

          {/* Slide Over Content Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl z-50 overflow-y-auto p-6 flex flex-col justify-between select-none"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] leading-none">
                  {meeting ? 'Edit Scheduled Meeting' : 'Schedule New Meeting'}
                </h3>
                <span className="text-xs text-[var(--text-muted)] font-mono mt-1.5 block">
                  User Workspace ID: {userId.slice(0, 8)}...
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xl cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex-1 flex flex-col gap-4.5 py-5 overflow-y-auto pr-1">
              {/* Overlap Alarm */}
              {focusOverlap && (
                <div className="p-3 bg-red-950/10 border border-red-800/30 rounded-lg text-xs text-red-400">
                  ⚠️ This meeting block overlaps your protected Daily Focus hours (9:00 AM - 12:00 PM).
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Meeting Title</label>
                  <button
                    type="button"
                    onClick={handleVoiceSchedule}
                    className={`text-[10px] flex items-center gap-1 px-2.5 py-0.5 rounded font-bold border transition-all cursor-pointer ${
                      isListening
                        ? 'bg-red-950/40 border-red-800 text-red-400 animate-pulse'
                        : 'bg-[var(--purple)]/10 border-[var(--purple)]/30 text-[var(--purple)] hover:bg-[var(--purple)]/20'
                    }`}
                  >
                    <span>🎙</span>
                    <span>{isListening ? 'Listening...' : 'Voice Autocomplete'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Architecture Align Sync"
                  className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)] transition-all"
                />
                {voiceTip && (
                  <span className="text-[10px] text-[var(--purple)] italic mt-0.5 font-medium leading-normal">
                    {voiceTip}
                  </span>
                )}
              </div>

              {/* Type Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Meeting Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(MEETING_TYPE_LABELS).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 px-2.5 rounded-lg border text-left flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-all ${
                        type === t
                          ? 'bg-[var(--purple)]/10 border-[var(--purple)] text-[var(--purple)]'
                          : 'bg-[var(--background-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]'
                      }`}
                    >
                      <span>{MEETING_TYPE_ICONS[t]}</span>
                      <span className="truncate">{MEETING_TYPE_LABELS[t]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date, Time, Duration Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)]"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>

              {/* Recurrence and Recurrence End */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Recurrence</label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)]"
                  >
                    <option value="NONE">No Repeat</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Biweekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Repeat End Date</label>
                  <input
                    type="date"
                    value={recurrenceEnd}
                    disabled={recurrence === 'NONE'}
                    onChange={(e) => setRecurrenceEnd(e.target.value)}
                    className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Location and Meet Link */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Location:</span>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] cursor-pointer">
                    <input
                      type="radio"
                      checked={location === 'online'}
                      onChange={() => setLocation('online')}
                      className="accent-[var(--purple)]"
                    />
                    Online Video Call
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] cursor-pointer">
                    <input
                      type="radio"
                      checked={location !== 'online'}
                      onChange={() => setLocation('Office Room')}
                      className="accent-[var(--purple)]"
                    />
                    Physical Office
                  </label>
                </div>

                {location === 'online' ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                      Meet Link
                    </label>
                    <div className="flex flex-col gap-1">
                      <input
                        type="url"
                        value={meetLink}
                        onChange={(e) => setMeetLink(e.target.value)}
                        placeholder="Paste Zoom, Google Meet, or MS Teams link here"
                        className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)]"
                      />
                      {meetPlatform !== 'None' && (
                        <div className="text-[10px] font-mono text-[var(--purple)] mt-0.5 flex items-center gap-1">
                          <span>✓ Detected:</span>
                          <strong className="font-bold underline">{meetPlatform} room link</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Room Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Office Room 4B, HQ 2nd Floor"
                      className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)]"
                    />
                  </div>
                )}
              </div>

              {/* Priority & Color Picker presets */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Priority</label>
                  <div className="flex gap-1.5">
                    {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-1 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          priority === p
                            ? 'bg-[var(--purple)]/20 border-[var(--purple)] text-[var(--purple)]'
                            : 'bg-[var(--background-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Color Presets</label>
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        style={{ background: c }}
                        className={`w-5 h-5 rounded-full border cursor-pointer hover:scale-110 transition-transform ${
                          color === c ? 'border-[var(--text-primary)] scale-110' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tag Input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Tags / Labels</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-[var(--purple)]/10 border border-[var(--purple)]/30 text-[var(--purple)] text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-red-400 font-bold hover:text-red-300 text-[9px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type tag & press Enter..."
                    className="bg-transparent border-none text-xs text-[var(--text-primary)] outline-none flex-1 min-w-[120px]"
                  />
                </div>
              </div>

              {/* Attendees section */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                  Invite Attendees ({attendees.length})
                </label>
                
                {/* Attendees list */}
                {attendees.length > 0 && (
                  <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto">
                    {attendees.map(a => (
                      <div
                        key={a.email}
                        className="flex justify-between items-center bg-[var(--surface-secondary)] border border-[var(--border)] px-2.5 py-1.5 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-6 h-6 rounded-full bg-[var(--purple)]/20 text-[var(--purple)] font-bold flex items-center justify-center text-[10px]">
                            {a.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="flex flex-col truncate">
                            <span className="font-semibold text-[var(--text-primary)]">{a.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">{a.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[var(--background-secondary)] border border-[var(--border)] rounded text-[var(--text-secondary)] uppercase">
                            {a.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttendee(a.email)}
                            className="text-red-400 font-bold text-xs hover:text-red-300 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add attendee fields */}
                <div className="flex gap-2 bg-[var(--surface-secondary)] p-2.5 rounded-lg border border-[var(--border)]">
                  <input
                    type="text"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="Guest Name"
                    className="w-1/3 bg-[var(--background-secondary)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)]"
                  />
                  <input
                    type="email"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="guest@email.com"
                    className="flex-1 bg-[var(--background-secondary)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)]"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttendee}
                    className="px-3 py-1 bg-[var(--purple)]/10 border border-[var(--purple)]/30 text-[var(--purple)] rounded text-xs font-semibold hover:bg-[var(--purple)]/20 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Action items inline builder */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                  Define Action Items checklist ({actionItems.length})
                </label>

                {/* Checklist list */}
                {actionItems.length > 0 && (
                  <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto">
                    {actionItems.map((ai, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-[var(--surface-secondary)] border border-[var(--border)] px-2.5 py-1 rounded-lg text-xs"
                      >
                        <div className="flex flex-col truncate">
                          <span className="font-medium text-[var(--text-primary)] truncate">{ai.text}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            Assignee: {ai.assignee} · Due: {ai.dueDate}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAction(index)}
                          className="text-red-400 font-bold hover:text-red-300 text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add action fields */}
                <div className="flex flex-col gap-2 bg-[var(--surface-secondary)] p-2.5 rounded-lg border border-[var(--border)]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={actionText}
                      onChange={(e) => setActionText(e.target.value)}
                      placeholder="e.g. Design DB schema layout"
                      className="flex-1 bg-[var(--background-secondary)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={actionAssignee}
                      onChange={(e) => setActionAssignee(e.target.value)}
                      placeholder="Assignee Name"
                      className="w-1/2 bg-[var(--background-secondary)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)]"
                    />
                    <input
                      type="date"
                      value={actionDueDate}
                      onChange={(e) => setActionDueDate(e.target.value)}
                      className="flex-1 bg-[var(--background-secondary)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)]"
                    />
                    <button
                      type="button"
                      onClick={handleAddAction}
                      className="px-3 py-1 bg-[var(--purple)]/10 border border-[var(--purple)]/30 text-[var(--purple)] rounded text-xs font-semibold hover:bg-[var(--purple)]/20 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Rich description/notes textarea */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Agenda Description / Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline meeting agendas, goals, and key discussion items..."
                  className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)] focus:bg-[var(--surface)] h-20 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[var(--border)] flex justify-between gap-3">
              {meeting && onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(meeting.id)}
                  className="px-4 py-2 bg-red-950/15 hover:bg-red-950/30 border border-red-800/30 text-red-400 text-sm font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  Delete
                </button>
              ) : (
                <div />
              )}
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={saving}
                  className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--primary)] rounded-lg text-sm font-bold disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {saving ? 'Saving...' : meeting ? 'Update Meeting' : 'Schedule Meeting'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
