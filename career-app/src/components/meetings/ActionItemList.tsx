import React from 'react';
import { format, isBefore } from 'date-fns';

export interface ActionItem {
  id: string;
  meetingId: string;
  text: string;
  assignee: string;
  dueDate: Date | string;
  done: boolean;
  meeting?: {
    id: string;
    title: string;
    color: string;
  };
}

export interface ActionItemListProps {
  actionItems: ActionItem[];
  onToggleActionItem: (meetingId: string, actionItemId: string, done: boolean) => Promise<void>;
}

export default function ActionItemList({ actionItems, onToggleActionItem }: ActionItemListProps) {
  const pendingItems = actionItems.filter(ai => !ai.done);

  return (
    <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3 select-none shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
        <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          📋 Action Items Tracker
        </h4>
        <span className="text-[10px] font-semibold font-mono bg-[var(--purple)]/10 text-[var(--purple)] border border-[var(--purple)]/20 px-2 py-0.5 rounded">
          {pendingItems.length} Pending
        </span>
      </div>

      {pendingItems.length === 0 ? (
        <div className="text-center py-6 text-xs text-[var(--text-muted)]">
          🎉 All caught up! No pending action items.
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
          {pendingItems.map(item => {
            const dueDate = new Date(item.dueDate);
            const isOverdue = isBefore(dueDate, new Date());

            return (
              <div
                key={item.id}
                className="flex items-start gap-2.5 p-2 rounded bg-[var(--background-secondary)] border border-[var(--border-light)] hover:border-[var(--border)] transition-all"
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={(e) => onToggleActionItem(item.meetingId, item.id, e.target.checked)}
                  className="mt-0.5 accent-[var(--purple)] cursor-pointer"
                />
                
                <div className="flex-1 flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                    {item.text}
                  </span>
                  
                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9px] text-[var(--text-muted)] font-mono">
                    <span>Owner: <strong className="text-[var(--text-secondary)]">{item.assignee}</strong></span>
                    <span>•</span>
                    <span className={isOverdue ? 'text-red-500 font-bold' : ''}>
                      Due: {format(dueDate, 'MMM d')} {isOverdue ? '(Overdue)' : ''}
                    </span>
                    {item.meeting && (
                      <>
                        <span>•</span>
                        <span 
                          className="truncate max-w-[120px]" 
                          style={{ color: item.meeting.color }}
                        >
                          {item.meeting.title}
                        </span>
                      </>
                    )}
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
