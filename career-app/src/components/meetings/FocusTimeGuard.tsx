import React from 'react';
import { differenceInMinutes } from 'date-fns';

export interface FocusTimeGuardProps {
  meetingStartTime?: Date | string;
  meetingEndTime?: Date | string;
  focusStartHour?: number; // e.g. 9 for 9 AM
  focusEndHour?: number;   // e.g. 12 for 12 PM
  weeklyFocusScore?: number; // % of focus hours kept meeting free
}

// Function to check if a single time slot overlaps focus hours (e.g. 9am - 12pm)
export function checkFocusTimeOverlap(
  startTime: Date | string,
  endTime: Date | string,
  focusStartHour = 9,
  focusEndHour = 12
): boolean {
  if (!startTime || !endTime) return false;
  
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Focus time is configured for weekdays Mon-Fri
  const day = start.getDay();
  if (day === 0 || day === 6) return false; // weekends are skipped

  // Create boundary dates for comparison on the same day
  const focusStart = new Date(start);
  focusStart.setHours(focusStartHour, 0, 0, 0);

  const focusEnd = new Date(start);
  focusEnd.setHours(focusEndHour, 0, 0, 0);

  // Check overlap: start is before focusEnd and end is after focusStart
  return start < focusEnd && end > focusStart;
}

export default function FocusTimeGuard({
  meetingStartTime,
  meetingEndTime,
  focusStartHour = 9,
  focusEndHour = 12,
  weeklyFocusScore = 100,
}: FocusTimeGuardProps) {
  const hasOverlap = meetingStartTime && meetingEndTime 
    ? checkFocusTimeOverlap(meetingStartTime, meetingEndTime, focusStartHour, focusEndHour)
    : false;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Dynamic Overlap Warning Banner */}
      {hasOverlap && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs select-none">
          <span className="text-base">⚠️</span>
          <div>
            <strong className="font-bold">Focus Time Overlap Warning:</strong> This meeting scheduling overlaps with your configured deep work blocks ({focusStartHour} AM - {focusEndHour} PM). Consider rescheduling to protect your productivity.
          </div>
        </div>
      )}

      {/* Weekly Focus Score Dashboard Card */}
      <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-2 select-none shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-2 mb-1">
          <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            🛡️ Focus Time Guard
          </h4>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            Target: 9:00 AM - 12:00 PM Mon-Fri
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 mt-1">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-xs text-[var(--text-secondary)]">Weekly Focus Protection Score</span>
            <div className="h-2 w-full bg-[var(--border)] rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-[var(--purple)] rounded-full transition-all duration-500" 
                style={{ width: `${weeklyFocusScore}%` }}
              />
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-2xl font-bold text-[var(--purple)] font-mono">{weeklyFocusScore}%</span>
            <span className="text-[9px] text-[var(--text-muted)] block">meeting-free</span>
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-1">
          Aim to keep your focus blocks meeting-free to maximize flow state and technical output.
        </p>
      </div>
    </div>
  );
}
