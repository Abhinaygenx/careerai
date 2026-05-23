import React from 'react';
import { format } from 'date-fns';

export interface MeetingChipProps {
  meeting: {
    id: string;
    title: string;
    type: string;
    startTime: Date;
    endTime: Date;
    color: string;
    status: string;
  };
  onClick?: (e: React.MouseEvent) => void;
}

export const MEETING_TYPE_ICONS: { [key: string]: string } = {
  STANDUP: '🔄',
  ONE_ON_ONE: '🤝',
  TEAM: '👥',
  CLIENT: '💼',
  INTERVIEW: '🎤',
  REVIEW: '📊',
};

export const MEETING_TYPE_LABELS: { [key: string]: string } = {
  STANDUP: 'Standup',
  ONE_ON_ONE: '1-on-1',
  TEAM: 'Team Sync',
  CLIENT: 'Client Call',
  INTERVIEW: 'Interview',
  REVIEW: 'Review',
};

export default function MeetingChip({ meeting, onClick }: MeetingChipProps) {
  const isCancelled = meeting.status === 'CANCELLED';
  const isCompleted = meeting.status === 'COMPLETED';
  
  // Format meeting time (e.g. 10:30 AM)
  const startTimeStr = format(new Date(meeting.startTime), 'h:mm a');
  const icon = MEETING_TYPE_ICONS[meeting.type] || '📅';

  return (
    <div
      onClick={onClick}
      style={{
        background: isCancelled ? 'rgba(255, 255, 255, 0.03)' : `${meeting.color}18`,
        borderLeft: `3px solid ${isCancelled ? '#4B5563' : meeting.color}`,
        borderTop: '1px solid rgba(255, 255, 255, 0.02)',
        borderRight: '1px solid rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
        color: isCancelled ? '#6B7280' : 'var(--text-primary)',
        textDecoration: isCancelled ? 'line-through' : 'none',
        opacity: isCancelled ? 0.6 : isCompleted ? 0.85 : 1,
      }}
      className="p-1.5 rounded text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col gap-0.5 min-w-0"
    >
      <div className="flex items-center gap-1 text-[9px] font-mono tracking-wide uppercase text-secondary font-medium truncate">
        <span>{icon}</span>
        <span>{startTimeStr}</span>
        {isCompleted && <span className="text-green-500 font-bold ml-auto">✓</span>}
        {isCancelled && <span className="text-red-400 font-bold ml-auto">❌</span>}
      </div>
      <div className="text-[11px] font-semibold leading-snug truncate" title={meeting.title}>
        {meeting.title}
      </div>
    </div>
  );
}
