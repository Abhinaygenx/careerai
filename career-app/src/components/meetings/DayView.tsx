import React, { useState } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { MEETING_TYPE_LABELS, MEETING_TYPE_ICONS } from './MeetingChip';
import IcsDownloadButton from './IcsDownloadButton';

export interface DayViewProps {
  currentDate: Date;
  meetings: any[];
  onEditMeeting: (meeting: any) => void;
  onAddNote: (meetingId: string, content: string) => Promise<void>;
  onToggleActionItem: (meetingId: string, actionItemId: string, done: boolean) => Promise<void>;
  onCompleteMeeting: (meetingId: string, duration?: number) => Promise<void>;
}

export default function DayView({
  currentDate,
  meetings,
  onEditMeeting,
  onAddNote,
  onToggleActionItem,
  onCompleteMeeting,
}: DayViewProps) {
  const [newNoteTexts, setNewNoteTexts] = useState<{ [meetId: string]: string }>({});

  const dayMeetings = meetings
    .filter(m => m.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleAddNoteClick = async (meetingId: string) => {
    const text = newNoteTexts[meetingId];
    if (!text?.trim()) return;

    await onAddNote(meetingId, text);
    setNewNoteTexts(prev => ({ ...prev, [meetingId]: '' }));
  };

  const getPriorityColor = (p: string) => {
    if (p === 'HIGH') return 'bg-red-950 text-red-400 border border-red-800/40';
    if (p === 'MEDIUM') return 'bg-amber-950 text-amber-400 border border-amber-800/40';
    return 'bg-blue-950 text-blue-400 border border-blue-800/40';
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-[var(--surface)] p-4 border border-[var(--border)] rounded-xl select-none shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
          Timeline for {format(currentDate, 'MMMM d, yyyy')}
        </h3>
        <span className="text-xs text-[var(--text-secondary)] font-mono bg-[var(--background-secondary)] border border-[var(--border)] px-2 py-0.5 rounded">
          {dayMeetings.length} Meeting(s)
        </span>
      </div>

      {dayMeetings.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)] flex flex-col items-center gap-2">
          <span className="text-3xl">☕</span>
          <span className="text-sm">No meetings scheduled for today. Enjoy your focus time!</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {dayMeetings.map(m => {
            const start = new Date(m.startTime);
            const end = new Date(m.endTime);
            const duration = differenceInMinutes(end, start);
            const isCompleted = m.status === 'COMPLETED';

            // Extract health score if present in notes
            let healthScore: number | null = null;
            let displayNotes = m.notes || '';
            if (displayNotes.startsWith('healthScore:')) {
              const parts = displayNotes.split('\n');
              const score = parseInt(parts[0].replace('healthScore:', ''), 10);
              if (!isNaN(score)) {
                healthScore = score;
              }
              displayNotes = parts.slice(1).join('\n');
            }

            return (
              <div
                key={m.occurrenceId || m.id}
                className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-4 flex flex-col md:flex-row gap-4 transition-all hover:border-[var(--border-hover)] relative overflow-hidden"
              >
                {/* Visual Accent Line */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: m.color }}
                />

                {/* Left col: Time & metadata */}
                <div className="flex flex-col gap-2 md:w-48 flex-shrink-0">
                  <div className="text-lg font-bold text-[var(--text-primary)] font-mono leading-none">
                    {format(start, 'h:mm a')}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono">
                    {format(end, 'h:mm a')} · {duration} min
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {MEETING_TYPE_ICONS[m.type]} {MEETING_TYPE_LABELS[m.type]}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${getPriorityColor(m.priority)}`}>
                      {m.priority}
                    </span>
                  </div>

                  {/* Completing / Health score Ring */}
                  {isCompleted ? (
                    healthScore !== null && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-green-500/10 border border-green-500/25 text-green-500 font-bold text-xs">
                          {healthScore}
                        </div>
                        <span className="text-[10px] font-semibold text-green-500">Health Score</span>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => onCompleteMeeting(m.id)}
                      className="mt-3 text-left w-fit px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 rounded text-xs font-semibold cursor-pointer transition-colors"
                    >
                      ✓ Mark Completed
                    </button>
                  )}
                </div>

                {/* Right col: Details, Notes & checklist */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-base font-semibold text-[var(--text-primary)] leading-tight">
                        {m.title}
                      </h4>
                      {m.description && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                          {m.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <IcsDownloadButton meetingId={m.id} />
                      <button
                        onClick={() => onEditMeeting(m)}
                        className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface)] rounded border border-[var(--border)] cursor-pointer text-xs transition-colors"
                        title="Edit Meeting"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>

                  {/* online link */}
                  {m.location === 'online' && m.meetLink && (
                    <a
                      href={m.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-fit px-3 py-1.5 bg-[var(--purple)] text-[var(--text-inverse)] rounded text-xs font-bold hover:bg-[var(--purple)]/90 transition-colors"
                    >
                      💻 Join Meeting Room
                    </a>
                  )}

                  {/* Attendees */}
                  {m.attendees?.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border)]">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
                        Attendees ({m.attendees.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {m.attendees.map((a: any) => (
                          <div
                            key={a.id}
                            className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded-full text-xs"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                a.rsvp === 'ACCEPTED'
                                  ? 'bg-green-500'
                                  : a.rsvp === 'DECLINED'
                                  ? 'bg-red-500'
                                  : 'bg-amber-500'
                              }`}
                              title={`RSVP: ${a.rsvp}`}
                            />
                            <span className="text-[var(--text-secondary)] font-medium">{a.name}</span>
                            <span className="text-[9px] text-[var(--text-muted)] font-mono">({a.role.toLowerCase()})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items Checklist */}
                  {m.actionItems?.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border)]">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
                        Action Items Checklist
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {m.actionItems.map((ai: any) => (
                          <label
                            key={ai.id}
                            className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--text-secondary)] select-none hover:text-[var(--text-primary)]"
                          >
                            <input
                              type="checkbox"
                              checked={ai.done}
                              onChange={(e) => onToggleActionItem(m.id, ai.id, e.target.checked)}
                              className="mt-0.5 accent-[var(--purple)]"
                            />
                            <div className="flex flex-col">
                              <span className={ai.done ? 'line-through text-[var(--text-muted)]' : ''}>
                                {ai.text}
                              </span>
                              <span className="text-[9px] text-[var(--text-muted)] font-mono">
                                Owner: {ai.assignee} · Due: {format(new Date(ai.dueDate), 'MMM d')}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
                      Meeting Notes & Takeaways
                    </span>
                    
                    {/* Notes List */}
                    {m.meetingNotes?.length > 0 && (
                      <div className="flex flex-col gap-1.5 bg-[var(--background-secondary)] p-2 rounded border border-[var(--border-light)] max-h-[150px] overflow-y-auto">
                        {m.meetingNotes.map((n: any) => (
                          <div key={n.id} className="text-xs border-b border-[var(--border-light)] last:border-0 pb-1 mb-1 last:pb-0 last:mb-0">
                            <div className="text-[9px] font-mono text-[var(--text-muted)] flex justify-between">
                              <span>User ID: {n.userId.slice(0, 8)}...</span>
                              <span>{format(new Date(n.createdAt), 'MMM d, h:mm a')}</span>
                            </div>
                            <p className="text-[var(--text-secondary)] leading-relaxed mt-0.5">{n.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add note text field */}
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={newNoteTexts[m.id] || ''}
                        onChange={(e) => setNewNoteTexts(prev => ({ ...prev, [m.id]: e.target.value }))}
                        placeholder="Add bullet note during meeting..."
                        className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--purple)]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddNoteClick(m.id);
                        }}
                      />
                      <button
                        onClick={() => handleAddNoteClick(m.id)}
                        className="px-3 py-1 bg-[var(--purple)]/10 border border-[var(--purple)]/20 text-[var(--purple)] rounded text-xs font-semibold cursor-pointer hover:bg-[var(--purple)]/20"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
