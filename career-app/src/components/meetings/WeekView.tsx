import React from 'react';
import {
  startOfWeek,
  addDays,
  format,
  isToday,
  isSameDay,
  differenceInMinutes,
} from 'date-fns';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';

export interface WeekViewProps {
  currentDate: Date;
  meetings: any[];
  onSelectTimeSlot: (day: Date, hour: number) => void;
  onEditMeeting: (meeting: any) => void;
  onRescheduleMeeting: (meetingId: string, newStart: Date, newEnd: Date) => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => 6 + i); // 6 AM to 10 PM
const ROW_HEIGHT = 60; // 60px per hour

// Draggable wrapper for meeting card
function DraggableMeeting({ meeting, top, height, width, left, onClick }: {
  meeting: any;
  top: number;
  height: number;
  width: string;
  left: string;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: meeting.id,
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${top}px`,
    height: `${height}px`,
    width,
    left,
    zIndex: isDragging ? 50 : 10,
    opacity: isDragging ? 0.6 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s',
    borderLeft: `4px solid ${meeting.color}`,
    background: `${meeting.color}15`,
    color: 'var(--text-primary)',
    boxShadow: isDragging ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-2 rounded text-xs select-none cursor-grab active:cursor-grabbing border border-white/5 overflow-hidden flex flex-col justify-between"
      onClick={(e) => {
        // Prevent trigger edit when dragging
        if (transform && (Math.abs(transform.x) > 5 || Math.abs(transform.y) > 5)) return;
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Draggable Handle Trigger */}
      <div 
        {...listeners} 
        {...attributes} 
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/10" 
      />

      <div className="flex flex-col gap-0.5 h-full overflow-hidden">
        <div className="flex items-center gap-1 text-[9px] font-mono text-gray-400">
          <span>{format(new Date(meeting.startTime), 'h:mm a')}</span>
          <span>-</span>
          <span>{format(new Date(meeting.endTime), 'h:mm a')}</span>
        </div>
        <div className="font-semibold text-[11px] truncate leading-tight mt-0.5">
          {meeting.title}
        </div>
        {meeting.location === 'online' && meeting.meetLink && (
          <span className="text-[9px] font-mono text-purple-400 mt-auto truncate">💻 Video Call</span>
        )}
      </div>
    </div>
  );
}

// Droppable Day Column wrapper
function DroppableDayColumn({ day, dateStr, children }: { day: Date; dateStr: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: dateStr,
  });

  return (
    <div
      ref={setNodeRef}
      className="relative border-r border-[var(--border)] h-full"
      style={{ minWidth: '120px' }}
    >
      {children}
    </div>
  );
}

export default function WeekView({
  currentDate,
  meetings,
  onSelectTimeSlot,
  onEditMeeting,
  onRescheduleMeeting,
}: WeekViewProps) {
  const startOfCurrentWeek = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

  // Compute column overlays
  const getDayOverlayLayouts = (day: Date, dayMeetings: any[]) => {
    const sorted = [...dayMeetings]
      .filter(m => m.status !== 'CANCELLED')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const columns: any[][] = [];

    // Place meetings in columns where they don't overlap
    sorted.forEach(meeting => {
      let placed = false;
      const start = new Date(meeting.startTime);

      for (let i = 0; i < columns.length; i++) {
        const lastInCol = columns[i][columns[i].length - 1];
        const colEnd = new Date(lastInCol.endTime);

        if (start >= colEnd) {
          columns[i].push(meeting);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([meeting]);
      }
    });

    const layouts: any[] = [];
    columns.forEach((col, colIdx) => {
      col.forEach(meeting => {
        const start = new Date(meeting.startTime);
        const end = new Date(meeting.endTime);

        // Calc positions (6 AM is start)
        const minutesFromStartOfDay = start.getHours() * 60 + start.getMinutes();
        const startOffsetMinutes = Math.max(0, minutesFromStartOfDay - 6 * 60);
        const top = (startOffsetMinutes / 60) * ROW_HEIGHT;

        const duration = differenceInMinutes(end, start);
        const height = (duration / 60) * ROW_HEIGHT;

        layouts.push({
          meeting,
          top,
          height,
          width: `${100 / columns.length}%`,
          left: `${(colIdx * 100) / columns.length}%`,
        });
      });
    });

    return layouts;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const meetingId = active.id as string;
    const targetDateStr = over.id as string; // Target day string 'YYYY-MM-DD'
    
    const targetDay = new Date(targetDateStr);
    const meeting = meetings.find(m => m.id === meetingId);

    if (meeting) {
      const origStart = new Date(meeting.startTime);
      const origEnd = new Date(meeting.endTime);
      const duration = differenceInMinutes(origEnd, origStart);

      // Create new start time keeping the original hour and minutes but shifting the day
      const newStart = new Date(targetDay);
      newStart.setHours(origStart.getHours());
      newStart.setMinutes(origStart.getMinutes());
      newStart.setSeconds(0);
      newStart.setMilliseconds(0);

      const newEnd = new Date(newStart.getTime() + duration * 60 * 1000);

      onRescheduleMeeting(meetingId, newStart, newEnd);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="w-full flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-x-auto select-none">
        {/* Header Row */}
        <div className="flex border-b border-[var(--border)] bg-[var(--surface-secondary)]">
          {/* Time axis header block */}
          <div className="w-16 flex-shrink-0 border-r border-[var(--border)]" />
          
          {/* Days headers */}
          <div className="grid grid-cols-7 flex-1 min-w-[840px]">
            {weekDays.map(day => {
              const activeDay = isToday(day);
              return (
                <div
                  key={day.toString()}
                  className={`py-3 text-center border-r border-[var(--border)] last:border-0 flex flex-col items-center justify-center gap-1 ${
                    activeDay ? 'bg-[var(--purple)]/10' : ''
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    {format(day, 'EEE')}
                  </span>
                  <span
                    className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                      activeDay
                        ? 'bg-[var(--purple)] text-[var(--text-inverse)] font-bold shadow-md shadow-[var(--purple)]/25'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable hourly grid */}
        <div className="flex flex-1 relative min-w-[900px]" style={{ height: `${HOURS.length * ROW_HEIGHT}px` }}>
          {/* Hourly scale column */}
          <div className="w-16 flex-shrink-0 bg-[var(--surface-secondary)] border-r border-[var(--border)] relative z-20">
            {HOURS.map((hour, idx) => (
              <div
                key={hour}
                className="absolute text-[10px] font-mono text-[var(--text-muted)] font-medium w-full text-right pr-2 select-none"
                style={{ top: `${idx * ROW_HEIGHT - 6}px` }}
              >
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
            ))}
          </div>

          {/* Hour grid lines */}
          <div className="absolute left-16 right-0 top-0 bottom-0 pointer-events-none z-0">
            {HOURS.map((_, idx) => (
              <div
                key={idx}
                className="border-b border-[var(--border)] w-full absolute"
                style={{ top: `${idx * ROW_HEIGHT}px` }}
              />
            ))}
          </div>

          {/* Draggable days columns */}
          <div className="grid grid-cols-7 flex-1 left-16 right-0 h-full relative z-10">
            {weekDays.map(day => {
              const dayMeetings = meetings.filter(m => isSameDay(new Date(m.startTime), day));
              const layouts = getDayOverlayLayouts(day, dayMeetings);
              const dateStr = format(day, 'yyyy-MM-dd');

              return (
                <DroppableDayColumn key={day.toString()} day={day} dateStr={dateStr}>
                  {/* Empty cells clickable to add new meeting */}
                  {HOURS.slice(0, -1).map((hour, idx) => (
                    <div
                      key={hour}
                      onClick={() => onSelectTimeSlot(day, hour)}
                      className="absolute left-0 right-0 hover:bg-[var(--purple)]/10 cursor-pointer"
                      style={{
                        top: `${idx * ROW_HEIGHT}px`,
                        height: `${ROW_HEIGHT}px`,
                      }}
                    />
                  ))}

                  {/* Absolute rendered meetings */}
                  {layouts.map(({ meeting, top, height, width, left }) => (
                    <DraggableMeeting
                      key={meeting.occurrenceId || meeting.id}
                      meeting={meeting}
                      top={top}
                      height={height}
                      width={width}
                      left={left}
                      onClick={() => onEditMeeting(meeting)}
                    />
                  ))}
                </DroppableDayColumn>
              );
            })}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
