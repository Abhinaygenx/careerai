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
import { detectRecurringSuggestions } from '@/lib/meetingsClientUtils';

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

  // Auth Protection Check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
      <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col items-center justify-center font-sans gap-3">
        <div className="w-8 h-8 border-3 border-purple-950 border-t-purple-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex font-sans">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-[#2D2D2D] bg-[#161616] p-6 hidden md:flex flex-col justify-between select-none">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span>🎯</span>
            <span>Career<span className="text-[#C4F82A]">.ai</span></span>
          </Link>

          <nav className="flex flex-col gap-1">
            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>📊</span> Dashboard Overview
            </Link>
            
            <div className="h-[1px] bg-[#2D2D2D] my-2" />

            <Link href="/ats-checker" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>🎯</span> ATS Checker
            </Link>
            <Link href="/resume-builder" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>📝</span> Resume Builder
            </Link>
            <Link href="/cover-letter" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>✉️</span> Cover Letters
            </Link>
            <Link href="/mock-interview" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>🎤</span> Mock Interviews
            </Link>
            <Link href="/auto-apply" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>🚀</span> Auto Apply
            </Link>
            <Link href="/dashboard/meetings" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-purple-950/20 border border-purple-800/40 text-purple-300 font-medium">
              <span>📅</span> Meeting Tracker
            </Link>
          </nav>
        </div>

        <Link href="/pricing" className="py-2.5 text-center bg-[#C4F82A] text-black font-bold rounded-lg text-xs hover:bg-[#aee61f] transition-all">
          ⚡ Upgrade to Pro
        </Link>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-[#2D2D2D] px-6 py-4 flex justify-between items-center bg-[#161616]">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white leading-none">Smart Meeting Calendar</h1>
            <Link 
              href="/dashboard/meetings/analytics" 
              className="text-xs font-semibold px-2.5 py-1 rounded bg-[#2D2D2D] text-gray-300 hover:text-white hover:bg-[#3D3D3D] transition-colors"
            >
              📈 View Analytics
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 bg-[#262626] rounded-lg p-1 border border-white/5 text-xs text-gray-400">
              <button onClick={() => setView('month')} className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${view === 'month' ? 'bg-[#8B7CF7] text-black font-bold' : 'hover:text-white'}`}>Month</button>
              <button onClick={() => setView('week')} className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${view === 'week' ? 'bg-[#8B7CF7] text-black font-bold' : 'hover:text-white'}`}>Week</button>
              <button onClick={() => setView('day')} className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${view === 'day' ? 'bg-[#8B7CF7] text-black font-bold' : 'hover:text-white'}`}>Day</button>
              <button onClick={() => setView('agenda')} className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${view === 'agenda' ? 'bg-[#8B7CF7] text-black font-bold' : 'hover:text-white'}`}>Agenda</button>
            </div>
            
            <div className="text-xs text-gray-400 font-mono hidden md:block">
              Shortcuts: <kbd className="bg-[#262626] px-1 py-0.5 rounded text-white font-bold">M</kbd> <kbd className="bg-[#262626] px-1 py-0.5 rounded text-white font-bold">W</kbd> <kbd className="bg-[#262626] px-1 py-0.5 rounded text-white font-bold">D</kbd> <kbd className="bg-[#262626] px-1 py-0.5 rounded text-white font-bold">A</kbd>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center text-sm border border-purple-800">
                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
              <button onClick={handleLogout} className="text-xs px-2.5 py-1.5 border border-[#2D2D2D] rounded hover:bg-white/5 transition-colors cursor-pointer text-gray-300 hover:text-white">
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 flex flex-col xl:flex-row gap-6 items-start flex-grow">
          {/* Left Block: The Main Calendar View */}
          <div className="flex-1 w-full flex flex-col gap-4">
            
            {/* suggestions banner */}
            {suggestions.length > 0 && (
              <div className="p-3 bg-purple-950/20 border border-purple-800/40 text-purple-300 rounded-lg text-xs flex justify-between items-center select-none animate-pulse">
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
                  className="px-2.5 py-1 bg-[#8B7CF7] text-black font-bold rounded text-[10px] hover:bg-[#a094f9] transition-colors cursor-pointer"
                >
                  Create Series
                </button>
              </div>
            )}

            {/* Navigation and Date Display */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-200">
                  {view === 'month' && format(currentDate, 'MMMM yyyy')}
                  {view === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
                  {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
                  {view === 'agenda' && 'Upcoming Agenda'}
                </h2>
                
                <div className="flex items-center gap-1 bg-[#161616] border border-[#2D2D2D] rounded p-0.5">
                  <button
                    onClick={() => {
                      if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
                      else setCurrentDate(addDays(currentDate, -7));
                    }}
                    className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded cursor-pointer text-xs"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-2.5 py-0.5 text-[10px] text-gray-300 hover:text-white rounded hover:bg-white/5 cursor-pointer font-semibold uppercase"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
                      else setCurrentDate(addDays(currentDate, 7));
                    }}
                    className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded cursor-pointer text-xs"
                  >
                    ▶
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedMeeting(null);
                  setFormDefaultDate(undefined);
                  setFormDefaultHour(undefined);
                  setIsFormOpen(true);
                }}
                className="px-4 py-2 bg-[#8B7CF7] hover:bg-[#9c8ff8] text-[#0F0F0F] rounded-lg text-xs font-bold transition-all flex items-center gap-1 select-none cursor-pointer"
              >
                <span>➕</span>
                <span>Add Meeting</span>
              </button>
            </div>

            {/* Render selected view */}
            {dataLoading ? (
              <div className="h-[400px] bg-[#161616] border border-[#2D2D2D] rounded-xl flex items-center justify-center text-gray-400 text-sm">
                <div className="w-6 h-6 border-2 border-purple-950 border-t-purple-400 rounded-full animate-spin mr-2" />
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
          <div className="w-full xl:w-80 flex flex-col gap-6 flex-shrink-0">
            {/* Focus time guard protection widget */}
            <FocusTimeGuard
              weeklyFocusScore={analytics?.focusScore ?? 100}
            />

            {/* Completed meeting Health scorecard */}
            <div className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl p-4 flex flex-col gap-2 select-none">
              <div className="flex justify-between items-center border-b border-[#2D2D2D] pb-2 mb-1">
                <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                  💚 Meeting Health Score
                </h4>
                <span className="text-[10px] text-green-500 font-mono font-semibold">
                  Weekly summary
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-14 h-14 rounded-full border-4 border-green-800 bg-green-950/20 text-green-400 font-bold flex items-center justify-center text-lg font-mono">
                  {analytics?.avgHealthScore ?? 80}
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="text-xs text-gray-300">Your average this week</span>
                  <span className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
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
    </div>
  );
}
