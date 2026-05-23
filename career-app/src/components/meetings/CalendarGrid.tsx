import React, { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from 'date-fns';
import MeetingChip from './MeetingChip';

export interface CalendarGridProps {
  currentDate: Date;
  meetings: any[];
  onSelectDay: (day: Date) => void;
  onEditMeeting: (meeting: any) => void;
}

export default function CalendarGrid({
  currentDate,
  meetings,
  onSelectDay,
  onEditMeeting,
}: CalendarGridProps) {
  const [activePopoverDay, setActivePopoverDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group meetings by day to speed up rendering
  const getDayMeetings = (day: Date) => {
    return meetings.filter(m => isSameDay(new Date(m.startTime), day));
  };

  return (
    <div className="w-full flex flex-col select-none">
      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-[#2D2D2D] bg-[#161616]">
        {weekDays.map(wd => (
          <div
            key={wd}
            className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 grid-rows-5 bg-[#2D2D2D] gap-[1px] overflow-hidden border border-[#2D2D2D] rounded-b-xl">
        {days.map((day, idx) => {
          const dayMeetings = getDayMeetings(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const hasMeetings = dayMeetings.length > 0;
          const displayMeetings = dayMeetings.slice(0, 2);
          const extraCount = dayMeetings.length - 2;

          return (
            <div
              key={day.toString()}
              className={`min-h-[120px] bg-[#161616] p-2 flex flex-col gap-1.5 transition-colors relative hover:bg-[#1a1a1a] ${
                !isCurrentMonth ? 'opacity-40' : ''
              }`}
            >
              {/* Day Number Row */}
              <div className="flex justify-between items-center">
                <span
                  onClick={() => onSelectDay(day)}
                  className={`text-xs font-semibold cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:bg-purple-900/40 hover:text-purple-300 ${
                    isCurrentDay
                      ? 'bg-[#8B7CF7] text-[#0F0F0F] font-bold shadow-md shadow-[#8B7CF7]/25'
                      : 'text-gray-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Dot Indicator */}
                {hasMeetings && !isCurrentDay && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CF7] animate-pulse" />
                )}
              </div>

              {/* Meeting Chips */}
              <div className="flex flex-col gap-1 overflow-y-auto flex-1 max-h-[85px] no-scrollbar">
                {displayMeetings.map(m => (
                  <MeetingChip
                    key={m.occurrenceId || m.id}
                    meeting={m}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditMeeting(m);
                    }}
                  />
                ))}

                {/* Overflow Trigger */}
                {extraCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopoverDay(activePopoverDay && isSameDay(activePopoverDay, day) ? null : day);
                    }}
                    className="text-[10px] font-bold text-left px-1.5 py-0.5 text-[#8B7CF7] hover:underline cursor-pointer"
                  >
                    + {extraCount} more
                  </button>
                )}
              </div>

              {/* Day Cell Click Handler (adds quick meeting) */}
              <div
                className="absolute inset-0 z-0 cursor-default"
                onClick={() => onSelectDay(day)}
              />

              {/* Popover for "+N more" */}
              {activePopoverDay && isSameDay(activePopoverDay, day) && (
                <div className="absolute top-10 left-1 right-1 z-30 bg-[#1e1e1e] border border-[#2D2D2D] rounded-lg shadow-xl p-2 max-h-[200px] overflow-y-auto flex flex-col gap-1">
                  <div className="flex justify-between items-center mb-1 pb-1 border-b border-[#2D2D2D]">
                    <span className="text-[10px] font-bold uppercase text-gray-400">
                      {format(day, 'MMM d, yyyy')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePopoverDay(null);
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  {dayMeetings.map(m => (
                    <MeetingChip
                      key={`popover-${m.occurrenceId || m.id}`}
                      meeting={m}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePopoverDay(null);
                        onEditMeeting(m);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
