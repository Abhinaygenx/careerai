import React from 'react';
import { format, isSameDay } from 'date-fns';
import { MEETING_TYPE_LABELS, MEETING_TYPE_ICONS } from './MeetingChip';
import IcsDownloadButton from './IcsDownloadButton';

export interface AgendaViewProps {
  meetings: any[];
  onEditMeeting: (meeting: any) => void;
}

export default function AgendaView({ meetings, onEditMeeting }: AgendaViewProps) {
  // Filter out cancelled meetings and sort them chronologically
  const activeMeetings = [...meetings]
    .filter(m => m.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Group meetings by day key (e.g. 'YYYY-MM-DD')
  const groupedMeetings: { [key: string]: { date: Date; items: any[] } } = {};
  
  activeMeetings.forEach(m => {
    const dateObj = new Date(m.startTime);
    const dayKey = format(dateObj, 'yyyy-MM-dd');
    if (!groupedMeetings[dayKey]) {
      groupedMeetings[dayKey] = {
        date: dateObj,
        items: [],
      };
    }
    groupedMeetings[dayKey].items.push(m);
  });

  const dayKeys = Object.keys(groupedMeetings).sort();

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {dayKeys.length === 0 ? (
        <div className="bg-[#161616] border border-[#2D2D2D] rounded-xl p-12 text-center text-gray-500 flex flex-col items-center gap-2">
          <span className="text-3xl">📅</span>
          <span className="text-sm">No upcoming meetings in your agenda. Add a meeting to get started!</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {dayKeys.map(key => {
            const group = groupedMeetings[key];
            const dateLabel = format(group.date, 'EEEE, MMMM d, yyyy');

            return (
              <div key={key} className="flex flex-col gap-2">
                {/* Date header label */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 pl-1">
                  {dateLabel}
                </h4>

                {/* Day meetings container */}
                <div className="flex flex-col bg-[#161616] border border-[#2D2D2D] rounded-xl divide-y divide-[#2D2D2D] overflow-hidden">
                  {group.items.map(m => {
                    const start = new Date(m.startTime);
                    const end = new Date(m.endTime);

                    return (
                      <div
                        key={m.occurrenceId || m.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1a1a1a] transition-colors"
                      >
                        {/* Time block */}
                        <div className="flex flex-col gap-1 sm:w-36 flex-shrink-0">
                          <span className="text-sm font-bold text-gray-200 font-mono">
                            {format(start, 'h:mm a')}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {format(end, 'h:mm a')}
                          </span>
                        </div>

                        {/* Title / Badge */}
                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-sm font-semibold text-white truncate" title={m.title}>
                              {m.title}
                            </h5>
                            <span
                              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                              style={{ background: `${m.color}20`, color: m.color }}
                            >
                              {MEETING_TYPE_ICONS[m.type]} {MEETING_TYPE_LABELS[m.type]}
                            </span>
                          </div>
                          {m.description && (
                            <p className="text-xs text-gray-400 truncate max-w-xl">
                              {m.description}
                            </p>
                          )}
                        </div>

                        {/* Attendee Avatar Overlapping Stack */}
                        {m.attendees?.length > 0 && (
                          <div className="flex items-center -space-x-2 overflow-hidden flex-shrink-0">
                            {m.attendees.slice(0, 4).map((a: any) => {
                              const initials = a.name
                                .split(' ')
                                .map((n: string) => n.charAt(0))
                                .join('')
                                .toUpperCase()
                                .slice(0, 2);

                              return (
                                <div
                                  key={a.id}
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#262626] border-2 border-[#161616] text-[10px] font-bold text-gray-300"
                                  title={`${a.name} (${a.email})`}
                                >
                                  {initials}
                                </div>
                              );
                            })}
                            {m.attendees.length > 4 && (
                              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-950 border-2 border-[#161616] text-[9px] font-bold text-purple-300">
                                +{m.attendees.length - 4}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {m.location === 'online' && m.meetLink && (
                            <a
                              href={m.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 bg-[#8B7CF7] hover:bg-[#9c8ff8] text-[#0F0F0F] rounded text-xs font-bold transition-colors"
                              title="Join Video Room"
                            >
                              Join
                            </a>
                          )}
                          <IcsDownloadButton meetingId={m.id} />
                          <button
                            onClick={() => onEditMeeting(m)}
                            className="px-2.5 py-1.5 bg-[#262626] hover:bg-[#363636] border border-white/5 text-gray-300 hover:text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
