'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { addMonths, subMonths, format, startOfMonth, endOfMonth, isToday, addDays, startOfWeek } from 'date-fns';

import CalendarGrid from '@/components/meetings/CalendarGrid';
import WeekView from '@/components/meetings/WeekView';
import DayView from '@/components/meetings/DayView';
import AgendaView from '@/components/meetings/AgendaView';
import MeetingForm from '@/components/meetings/MeetingForm';
import ActionItemList from '@/components/meetings/ActionItemList';
import FocusTimeGuard from '@/components/meetings/FocusTimeGuard';
import MeetingHealthScore from '@/components/meetings/MeetingHealthScore';
import { detectRecurringSuggestions } from '@/lib/meetingsClientUtils';
import styles from '../page.module.css';
import localStyles from './meetings.module.css';

export default function MeetingsDashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [meetings, setMeetings] = useState<any[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  // Active states for dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<Date | undefined>(undefined);
  const [formDefaultHour, setFormDefaultHour] = useState<number | undefined>(undefined);
  
  const [dataLoading, setDataLoading] = useState(true);
  
  // Notification states
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; message: string; type: 'info' | 'warning' }>>([]);

  const addInAppToast = useCallback((toast: { id: string; title: string; message: string; type: 'info' | 'warning' }) => {
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 6000);
  }, []);

  // Auth Protection Check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Push Notifications and In-App Notifications check
  useEffect(() => {
    if (!meetings || meetings.length === 0) return;
    
    // Request permission if not granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const checkMeetingsForNotifications = () => {
      const now = new Date();
      
      meetings.forEach(meeting => {
        const meetingStart = new Date(meeting.startTime);
        const diffMinutes = Math.round((meetingStart.getTime() - now.getTime()) / (60 * 1000));
        
        // Read reminder preference or default to 15 min and 5 min
        const reminderTimes = meeting.reminderMinutes || [15];
        
        reminderTimes.forEach((reminderOffset: number) => {
          const notificationId = `${meeting.id}_${reminderOffset}`;
          
          if (diffMinutes === reminderOffset && diffMinutes > 0) {
            const notifiedKey = `notified_${notificationId}`;
            const alreadyNotified = sessionStorage.getItem(notifiedKey);
            
            if (!alreadyNotified) {
              sessionStorage.setItem(notifiedKey, 'true');
              
              // Trigger Native Browser notification
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(`Upcoming Meeting: ${meeting.title}`, {
                  body: `Starting in ${reminderOffset} minutes (${format(meetingStart, 'hh:mm a')})`,
                });
              }
              
              // Trigger In-App Notification
              addInAppToast({
                id: notificationId,
                title: meeting.title,
                message: `Starts in ${reminderOffset} minutes (${format(meetingStart, 'hh:mm a')})`,
                type: 'warning'
              });
            }
          }
        });
        
        // Trigger exactly at start time
        const startNotificationId = `${meeting.id}_start`;
        if (diffMinutes === 0) {
          const notifiedKey = `notified_${startNotificationId}`;
          const alreadyNotified = sessionStorage.getItem(notifiedKey);
          
          if (!alreadyNotified) {
            sessionStorage.setItem(notifiedKey, 'true');
            
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(`Meeting Starting Now: ${meeting.title}`, {
                body: `Click to join or view notes.`,
              });
            }
            
            addInAppToast({
              id: startNotificationId,
              title: meeting.title,
              message: `Starting now!`,
              type: 'info'
            });
          }
        }
      });
    };

    checkMeetingsForNotifications();
    const interval = setInterval(checkMeetingsForNotifications, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [meetings, addInAppToast]);

  // Fetch all meeting details
  const fetchMeetingData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      const headers = { 'x-user-id': user.uid };
      
      // Calculate date boundaries for this month (plus padding of 7 days before/after)
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const startStr = start.toISOString();
      const endStr = end.toISOString();

      const [meetingsRes, actionItemsRes, analyticsRes] = await Promise.all([
        fetch(`/api/meetings?userId=${user.uid}`, { headers }),
        fetch(`/api/meetings/action-items?userId=${user.uid}`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`/api/meetings/analytics?userId=${user.uid}`, { headers }).then(r => r.ok ? r.json() : null)
      ]);

      const meetingsData = await meetingsRes.json();
      setMeetings(meetingsData);
      
      // Filter action items locally from meetings list for robustness
      const allActionItems: any[] = [];
      meetingsData.forEach((m: any) => {
        if (m.actionItems) {
          m.actionItems.forEach((ai: any) => {
            allActionItems.push({
              ...ai,
              meeting: {
                id: m.id,
                title: m.title,
                color: m.color
              }
            });
          });
        }
      });
      setActionItems(allActionItems);
      setAnalytics(analyticsRes);

      // Detect recurring suggestions
      const detected = detectRecurringSuggestions(meetingsData, user.uid);
      setSuggestions(detected);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [user, currentDate]);

  useEffect(() => {
    if (user) {
      fetchMeetingData();
    }
  }, [user, currentDate, fetchMeetingData]);

  // Keyboard Shortcuts (M, W, D, A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts inside text inputs or textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      if (key === 'm') setView('month');
      else if (key === 'w') setView('week');
      else if (key === 'd') setView('day');
      else if (key === 'a') setView('agenda');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set default view on mobile
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setView('agenda');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Form handlers
  const handleSaveMeeting = async (data: any) => {
    if (!user) return;
    const isEdit = !!data.id;
    const url = isEdit ? `/api/meetings/${data.id}` : '/api/meetings';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.uid,
      },
      body: JSON.stringify({ ...data, userId: user.uid }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save meeting');
    }

    await fetchMeetingData();
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to cancel this meeting?')) return;

    const res = await fetch(`/api/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': user.uid,
      },
    });

    if (!res.ok) {
      alert('Failed to cancel meeting.');
      return;
    }

    setIsFormOpen(false);
    await fetchMeetingData();
  };

  const handleCompleteMeeting = async (meetingId: string, duration?: number) => {
    if (!user) return;
    const res = await fetch(`/api/meetings/${meetingId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.uid,
      },
      body: JSON.stringify({ actualDurationMinutes: duration }),
    });

    if (!res.ok) {
      alert('Failed to mark meeting completed.');
      return;
    }

    await fetchMeetingData();
  };

  const handleAddNote = async (meetingId: string, content: string) => {
    if (!user) return;
    const res = await fetch(`/api/meetings/${meetingId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.uid,
      },
      body: JSON.stringify({ content, userId: user.uid }),
    });

    if (!res.ok) {
      alert('Failed to add note.');
      return;
    }

    await fetchMeetingData();
  };

  const handleToggleActionItem = async (meetingId: string, actionItemId: string, done: boolean) => {
    if (!user) return;
    const res = await fetch(`/api/meetings/${meetingId}/action-items`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.uid,
      },
      body: JSON.stringify({ actionItemId, done }),
    });

    if (!res.ok) {
      alert('Failed to update action item status.');
      return;
    }

    await fetchMeetingData();
  };

  const handleRescheduleMeeting = async (meetingId: string, newStart: Date, newEnd: Date) => {
    await handleSaveMeeting({
      id: meetingId,
      startTime: newStart,
      endTime: newEnd,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your career workspace...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar navigation */}
      <aside className={styles.sidebar}>
        <div className="flex flex-col gap-6">
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🎯</span>
            <span>Career<span className={styles.logoAi}>.ai</span></span>
          </Link>

          <nav className={styles.nav}>
            <Link href="/dashboard" className={styles.navItem}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
              <span>Overview</span>
            </Link>
            
            <Link href="/dashboard" className={styles.navItem}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              <span>My Resumes</span>
            </Link>

            <Link href="/dashboard" className={styles.navItem}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
              <span>Applications</span>
            </Link>

            <div className={styles.navDivider} />

            <Link href="/ats-checker" className={styles.navItem}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
              <span>ATS Checker</span>
            </Link>
            <Link href="/resume-builder" className={styles.navItem}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              <span>Resume Builder</span>
            </Link>
            <Link href="/cover-letter" className={styles.navItem}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              <span>Cover Letters</span>
            </Link>
            <Link href="/mock-interview" className={styles.navItem}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
              <span>Mock Interviews</span>
            </Link>
            <Link href="/auto-apply" className={styles.navItem}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              <span>Auto Apply</span>
            </Link>
            <Link href="/dashboard/meetings" className={`${styles.navItem} ${styles.active}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--purple)]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <span>Meeting Tracker</span>
            </Link>
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.upgradeCard}>
            <h4 className={styles.upgradeTitle}>Upgrade to Pro</h4>
            <p className={styles.upgradeText}>Get unlimited ATS scans, mock interviews & advanced resume reviews.</p>
            <Link href="/pricing" className={styles.upgradeBtn}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              Upgrade Now
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className="flex items-center gap-4">
            <h1 className={styles.pageTitle}>Smart Meeting Calendar</h1>
            <Link 
              href="/dashboard/meetings/analytics" 
              className="text-xs font-semibold px-2.5 py-1.5 rounded bg-[var(--background-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors"
            >
              📈 View Analytics
            </Link>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userMenu}>
              <Link href="/profile" className={styles.userProfileLink}>
                <span className={styles.avatar}>
                  {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className={styles.userName}>{user.displayName || user.email?.split('@')[0] || 'User'}</span>
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={localStyles.meetingsContainer}>
          <div className={localStyles.meetingsLayout}>
            {/* Left Block: The Main Calendar View */}
            <div className={localStyles.mainCalendarBlock}>
              
              {/* suggestions banner */}
              {suggestions.length > 0 && (
                <div className="p-3 bg-[var(--purple)]/10 border border-[var(--purple)]/20 text-[var(--purple)] rounded-lg text-xs flex justify-between items-center select-none animate-pulse">
                  <div className="flex items-center gap-2">
                    <span>💡</span>
                    <span>{suggestions[0].message}</span>
                  </div>
                  <button
                    onClick={() => {
                      setFormDefaultDate(new Date());
                      setFormDefaultHour(10);
                      setSelectedMeeting({
                        title: `Recurring Sync w/ ${suggestions[0].attendeeName}`,
                        attendees: [
                          { name: suggestions[0].attendeeName, email: suggestions[0].attendeeEmail, role: 'REQUIRED' }
                        ],
                        recurrence: 'WEEKLY',
                      });
                      setIsFormOpen(true);
                    }}
                    className="px-2.5 py-1 bg-[var(--purple)] text-[var(--text-inverse)] font-bold rounded text-[10px] hover:opacity-90 transition-colors cursor-pointer"
                  >
                    Create Series
                  </button>
                </div>
              )}

              {/* Navigation and Date Display Controls Bar */}
              <div className={localStyles.controlsBar}>
                <div className={localStyles.controlsLeft}>
                  <h2 className={localStyles.dateTitle}>
                    {view === 'month' && format(currentDate, 'MMMM yyyy')}
                    {view === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
                    {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
                    {view === 'agenda' && 'Upcoming Agenda'}
                  </h2>
                  
                  <div className={localStyles.navButtonGroup}>
                    <button
                      onClick={() => {
                        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
                        else setCurrentDate(addDays(currentDate, -7));
                      }}
                      className={localStyles.navButton}
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className={`${localStyles.navButton} ${localStyles.navButtonToday}`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
                        else setCurrentDate(addDays(currentDate, 7));
                      }}
                      className={localStyles.navButton}
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <div className={localStyles.controlsRight}>
                  <div className={localStyles.viewSelector}>
                    <button onClick={() => setView('month')} className={`${localStyles.viewButton} ${view === 'month' ? localStyles.viewButtonActive : ''}`}>Month</button>
                    <button onClick={() => setView('week')} className={`${localStyles.viewButton} ${view === 'week' ? localStyles.viewButtonActive : ''}`}>Week</button>
                    <button onClick={() => setView('day')} className={`${localStyles.viewButton} ${view === 'day' ? localStyles.viewButtonActive : ''}`}>Day</button>
                    <button onClick={() => setView('agenda')} className={`${localStyles.viewButton} ${view === 'agenda' ? localStyles.viewButtonActive : ''}`}>Agenda</button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedMeeting(null);
                      setFormDefaultDate(undefined);
                      setFormDefaultHour(undefined);
                      setIsFormOpen(true);
                    }}
                    className={localStyles.addMeetingButton}
                  >
                    <span>➕</span>
                    <span>Add Meeting</span>
                  </button>
                </div>
              </div>

              {/* Render selected view */}
              {dataLoading ? (
                <div className="h-[400px] bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] text-sm shadow-sm">
                  <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--purple)] rounded-full animate-spin mr-2" />
                  Loading calendar sync...
                </div>
              ) : (
                <>
                  {view === 'month' && (
                    <CalendarGrid
                      currentDate={currentDate}
                      meetings={meetings}
                      onSelectDay={(day) => {
                        setFormDefaultDate(day);
                        setFormDefaultHour(9);
                        setSelectedMeeting(null);
                        setIsFormOpen(true);
                      }}
                      onEditMeeting={(meeting) => {
                        setSelectedMeeting(meeting);
                        setIsFormOpen(true);
                      }}
                    />
                  )}
                  {view === 'week' && (
                    <WeekView
                      currentDate={currentDate}
                      meetings={meetings}
                      onSelectTimeSlot={(day, hour) => {
                        setFormDefaultDate(day);
                        setFormDefaultHour(hour);
                        setSelectedMeeting(null);
                        setIsFormOpen(true);
                      }}
                      onEditMeeting={(meeting) => {
                        setSelectedMeeting(meeting);
                        setIsFormOpen(true);
                      }}
                      onRescheduleMeeting={handleRescheduleMeeting}
                    />
                  )}
                  {view === 'day' && (
                    <DayView
                      currentDate={currentDate}
                      meetings={meetings}
                      onEditMeeting={(meeting) => {
                        setSelectedMeeting(meeting);
                        setIsFormOpen(true);
                      }}
                      onAddNote={handleAddNote}
                      onToggleActionItem={handleToggleActionItem}
                      onCompleteMeeting={handleCompleteMeeting}
                    />
                  )}
                  {view === 'agenda' && (
                    <AgendaView
                      meetings={meetings}
                      onEditMeeting={(meeting) => {
                        setSelectedMeeting(meeting);
                        setIsFormOpen(true);
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Right Block: Sidebar Widgets */}
            <div className={localStyles.widgetsSidebar}>
              {/* Focus time guard protection widget */}
              <FocusTimeGuard
                weeklyFocusScore={analytics?.focusScore ?? 100}
              />

              {/* Completed meeting Health scorecard */}
              <div className={localStyles.widgetCard}>
                <div className={localStyles.widgetHeader}>
                  <h4 className={localStyles.widgetTitle}>
                    💚 Meeting Health Score
                  </h4>
                  <span className={localStyles.widgetSubtitle}>
                    Weekly summary
                  </span>
                </div>
                <div className={localStyles.widgetContent}>
                  <MeetingHealthScore
                    score={analytics?.avgHealthScore ?? 80}
                    size="md"
                  />
                  <div className={localStyles.widgetInfoText}>
                    <span className={localStyles.widgetLabel}>Your average this week</span>
                    <span className={localStyles.widgetDesc}>
                      Efficiency is high! You finished several meetings early and avoided overlap penalties.
                    </span>
                  </div>
                </div>
              </div>

              {/* Overdue/Pending actions list widget */}
              <ActionItemList
                actionItems={actionItems}
                onToggleActionItem={handleToggleActionItem}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Slide-over Meeting Form panel */}
      <MeetingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        meeting={selectedMeeting}
        userId={user.uid}
        defaultDate={formDefaultDate}
        defaultStartHour={formDefaultHour}
        onSave={handleSaveMeeting}
        onDelete={handleDeleteMeeting}
      />

      {/* Growl Toast Notifications */}
      <div className={localStyles.toastContainer}>
        {toasts.map(toast => (
          <div key={toast.id} className={localStyles.toast}>
            <div className={localStyles.toastHeader}>
              <span className={localStyles.toastTitle}>{toast.title}</span>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
                className={localStyles.toastClose}
              >
                ✕
              </button>
            </div>
            <p className={localStyles.toastMessage}>{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
