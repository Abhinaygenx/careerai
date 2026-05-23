'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Internship } from '@/lib/internships';
import styles from './CalendarClient.module.css';

interface CalendarClientProps {
  initialInternships: Internship[];
  initialMonth: string; // YYYY-MM
  isIndia: boolean;
}

export default function CalendarClient({ initialInternships, initialMonth, isIndia }: CalendarClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // India Mode states
  const [isIndiaMode, setIsIndiaMode] = useState(isIndia);
  
  // Newsletter subscription states
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    setIsIndiaMode(isIndia);
  }, [isIndia]);

  useEffect(() => {
    setInternships(initialInternships);
  }, [initialInternships]);

  // Newsletter popup trigger with localStorage persistence
  useEffect(() => {
    const subscribed = localStorage.getItem('newsletter_subscribed');
    const dismissed = localStorage.getItem('newsletter_dismissed');
    if (!subscribed && !dismissed) {
      const timer = setTimeout(() => {
        setShowNewsletter(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Parse initial year and month
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const [y, m] = initialMonth.split('-');
    return new Date(parseInt(y), parseInt(m) - 1, 1);
  });

  const [internships, setInternships] = useState<Internship[]>(initialInternships);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Tech' | 'Finance' | 'Design' | 'Marketing'>('All');
  
  // Google OAuth states
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [addedToCalendarList, setAddedToCalendarList] = useState<string[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  
  // Detail Modal state
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Status message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Grab token from URL on mount or load from localStorage
  useEffect(() => {
    const token = searchParams.get('accessToken');
    const oauthError = searchParams.get('error');

    if (token) {
      setAccessToken(token);
      localStorage.setItem('google_calendar_token', token);
      setStatusMessage({ text: 'Successfully connected Google Calendar!', type: 'success' });
      
      // Clean query params from URL properly using Next.js router
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('accessToken');
      
      const newUrl = newSearchParams.toString() 
        ? `${pathname}?${newSearchParams.toString()}` 
        : pathname;
        
      router.replace(newUrl, { scroll: false });
    } else {
      const savedToken = localStorage.getItem('google_calendar_token');
      if (savedToken) {
        setAccessToken(savedToken);
      }
    }

    if (oauthError) {
      setStatusMessage({ text: `Google connection failed: ${oauthError}`, type: 'error' });
      
      // Clean query params
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('error');
      
      const newUrl = newSearchParams.toString() 
        ? `${pathname}?${newSearchParams.toString()}` 
        : pathname;
        
      router.replace(newUrl, { scroll: false });
    }

    // Load previously added calendar event IDs to prevent duplicate sync UI
    const savedAdded = localStorage.getItem('added_internships_list');
    if (savedAdded) {
      try {
        setAddedToCalendarList(JSON.parse(savedAdded));
      } catch (e) {
        console.error(e);
      }
    }
  }, [searchParams]);

  // Persist added internships list
  const markAsAdded = (id: string) => {
    const newList = [...addedToCalendarList, id];
    setAddedToCalendarList(newList);
    localStorage.setItem('added_internships_list', JSON.stringify(newList));
  };

  // Fetch data for a target month
  const fetchMonthData = async (date: Date, indiaMode: boolean = isIndiaMode, isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    setIsScanning(true);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const monthQuery = `${yStr}-${mStr}`;
    
    try {
      const res = await fetch(`/api/internships?month=${monthQuery}${indiaMode ? '&india=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        
        // Show real-time change detection notification
        setInternships(prev => {
          const prevIds = new Set(prev.map(p => p.id));
          const newIds = new Set(data.map((d: any) => d.id));
          
          let addedCount = 0;
          let droppedCount = 0;
          
          for (const item of data) {
            if (!prevIds.has(item.id)) addedCount++;
          }
          for (const id of prevIds) {
            if (!newIds.has(id)) droppedCount++;
          }
          
          if (addedCount > 0 || droppedCount > 0) {
            let msg = 'Live Feed updated: ';
            if (addedCount > 0 && droppedCount > 0) {
              msg += `Found ${addedCount} new internship${addedCount > 1 ? 's' : ''} & removed ${droppedCount} closed listing${droppedCount > 1 ? 's' : ''}.`;
            } else if (addedCount > 0) {
              msg += `Found ${addedCount} new internship${addedCount > 1 ? 's' : ''}.`;
            } else {
              msg += `Removed ${droppedCount} closed internship${droppedCount > 1 ? 's' : ''}.`;
            }
            setStatusMessage({ text: msg, type: 'info' });
          }
          return data;
        });
      } else {
        console.error('Failed to fetch internships for month', monthQuery);
      }
    } catch (error) {
      console.error('Network error fetching internships', error);
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
      setIsScanning(false);
    }
  };

  // Client-side background polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMonthData(currentDate, isIndiaMode, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentDate, isIndiaMode]);

  // Navigate months
  const handlePrevMonth = () => {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prev);
    fetchMonthData(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(next);
    fetchMonthData(next);
  };

  // Toggle India Mode client-side and push state
  const toggleIndiaMode = () => {
    const nextMode = !isIndiaMode;
    setIsIndiaMode(nextMode);
    
    const params = new URLSearchParams(window.location.search);
    if (nextMode) {
      params.set('india', 'true');
    } else {
      params.delete('india');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    fetchMonthData(currentDate, nextMode);
  };

  // Dismiss Newsletter subscription panel
  const handleDismissNewsletter = () => {
    setShowNewsletter(false);
    localStorage.setItem('newsletter_dismissed', 'true');
  };

  // Subscribe Newsletter handler
  const handleSubscribeNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
      setNewsletterStatus('error');
      return;
    }

    setNewsletterStatus('submitting');
    try {
      // Mock newsletter subscription endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNewsletterStatus('success');
      localStorage.setItem('newsletter_subscribed', 'true');
      
      // Auto-close card after success display
      setTimeout(() => {
        setShowNewsletter(false);
      }, 2500);
    } catch (err) {
      setNewsletterStatus('error');
    }
  };

  // Handle Add to Google Calendar Sync
  const handleAddToCalendar = async (internship: Internship) => {
    if (!accessToken) {
      // Not logged in: Trigger Google OAuth consent redirect
      setLoading(true);
      window.location.href = '/api/auth/google';
      return;
    }

    setSyncingId(internship.id);
    setStatusMessage({ text: `Syncing "${internship.title}" to Google Calendar...`, type: 'info' });

    try {
      const response = await fetch('/api/calendar/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId: internship.id,
          accessToken,
          internship // Pass the full internship details to be robust
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        markAsAdded(internship.id);
        setStatusMessage({ text: `Successfully synced "${internship.title}" to Google Calendar!`, type: 'success' });
      } else {
        // Token might be expired, clear it and ask for reauth
        if (data.error && (data.error.includes('invalid') || data.error.includes('expired') || response.status === 401)) {
          localStorage.removeItem('google_calendar_token');
          setAccessToken(null);
          setStatusMessage({ text: 'Google Calendar session expired. Redirecting to connect...', type: 'error' });
          setTimeout(() => {
            window.location.href = '/api/auth/google';
          }, 1500);
        } else {
          setStatusMessage({ text: data.error || 'Failed to add event to Google Calendar', type: 'error' });
        }
      }
    } catch (error: any) {
      console.error(error);
      setStatusMessage({ text: 'Network error adding to Google Calendar', type: 'error' });
    } finally {
      setSyncingId(null);
    }
  };

  const handleConnectCalendar = () => {
    window.location.href = '/api/auth/google';
  };

  const handleDisconnectCalendar = () => {
    localStorage.removeItem('google_calendar_token');
    setAccessToken(null);
    setStatusMessage({ text: 'Disconnected Google Calendar.', type: 'info' });
  };

  // Helper to check if a deadline is today (Closing Soon)
  const isClosingSoon = (deadline: Date | string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate.getTime() === today.getTime();
  };

  // Filter internships (only display current & future opportunities, filtering out past ones in real-time)
  const filteredInternships = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const active = internships.filter(item => {
      const deadlineDate = new Date(item.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate >= today;
    });

    if (activeFilter === 'All') return active;
    return active.filter(item => item.type === activeFilter);
  }, [internships, activeFilter]);

  // Compute Calendar Metrics
  const metrics = useMemo(() => {
    const totalThisMonth = filteredInternships.length;
    
    // Deadlines soon: next 7 days
    const now = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(now.getDate() + 7);
    
    const soonCount = filteredInternships.filter(item => {
      const deadlineDate = new Date(item.deadline);
      return deadlineDate >= now && deadlineDate <= oneWeekLater;
    }).length;

    // Company count
    const uniqueCompanies = new Set(filteredInternships.map(item => item.company));
    
    // Total synced count
    const syncedCount = filteredInternships.filter(item => addedToCalendarList.includes(item.id)).length;

    return {
      totalThisMonth,
      soonCount,
      companyCount: uniqueCompanies.size,
      syncedCount
    };
  }, [filteredInternships, addedToCalendarList]);

  // Sidebar: Next 5 upcoming deadlines (filtered and sorted chronologically)
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    // Reset hours to start of day for inclusive comparison
    now.setHours(0, 0, 0, 0);

    return [...filteredInternships]
      .filter(item => new Date(item.deadline) >= now)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [filteredInternships]);

  // Calendar Day Rendering Data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysCurrent = new Date(year, month + 1, 0).getDate();
    const totalDaysPrev = new Date(year, month, 0).getDate();

    const cells: {
      day: number;
      monthType: 'prev' | 'current' | 'next';
      date: Date;
    }[] = [];

    // Previous month cells
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = totalDaysPrev - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      cells.push({
        day: d,
        monthType: 'prev',
        date: new Date(prevYear, prevMonth, d),
      });
    }

    // Current month cells
    for (let i = 1; i <= totalDaysCurrent; i++) {
      cells.push({
        day: i,
        monthType: 'current',
        date: new Date(year, month, i),
      });
    }

    // Next month cells to fill grid up to 42 cells (6 rows * 7 columns)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      cells.push({
        day: i,
        monthType: 'next',
        date: new Date(nextYear, nextMonth, i),
      });
    }

    return cells;
  }, [year, month]);

  // Map day index to internships
  const getInternshipsForDay = (day: number | null, cellMonth: number = month, cellYear: number = year) => {
    if (!day) return [];
    return filteredInternships.filter(item => {
      const d = new Date(item.deadline);
      return d.getDate() === day && d.getMonth() === cellMonth && d.getFullYear() === cellYear;
    });
  };

  const getCategoryChipClass = (category: string) => {
    switch (category) {
      case 'Tech':
        return styles.chipTech;
      case 'Finance':
        return styles.chipFinance;
      case 'Design':
        return styles.chipDesign;
      case 'Marketing':
        return styles.chipMarketing;
      default:
        return styles.chipDefault;
    }
  };

  const getCategoryDotClass = (category: string) => {
    switch (category) {
      case 'Tech':
        return 'bg-purple-500';
      case 'Finance':
        return 'bg-emerald-500';
      case 'Design':
        return 'bg-amber-500';
      case 'Marketing':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Selected Day Modal Data
  const selectedDayInternships = useMemo(() => {
    return getInternshipsForDay(selectedDay);
  }, [selectedDay, filteredInternships]);

  return (
    <div className={styles.pageWrapper}>
      <div className="container py-12">
        
        {/* Page Header */}
        <div className={styles.headerContainer}>
          <div className={styles.headerTextGroup}>
            <h1 className={styles.title}>
              Internship <span className="text-gradient">Calendar</span>
            </h1>
            <p className={styles.subtitle}>
              Track deadlines, organize upcoming applications, and sync directly to your Google Calendar.
            </p>
          </div>
          <div className={styles.headerActions}>
            {accessToken ? (
              <div className={styles.connectedBadge}>
                <span className={styles.connectedBadgeDot} />
                <span>Google Calendar Connected</span>
                <button
                  onClick={handleDisconnectCalendar}
                  className={styles.disconnectBtn}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectCalendar}
                className={styles.connectBtn}
              >
                <svg className={styles.connectBtnIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className={styles.connectBtnText}>Connect Google Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Toast Alert */}
        {statusMessage && (
          <div 
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between transition-all animate-scale ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{statusMessage.type === 'success' ? '✅' : statusMessage.type === 'error' ? '⚠️' : 'ℹ️'}</span>
              <p className="text-sm font-medium">{statusMessage.text}</p>
            </div>
            <button 
              onClick={() => setStatusMessage(null)} 
              className="text-xs opacity-60 hover:opacity-100 transition-opacity"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Stats Row */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total This Month</span>
            <p className={styles.statValue}>{metrics.totalThisMonth}</p>
            <span className={styles.statIndicator} style={{ backgroundColor: 'var(--accent)' }}></span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Deadlines Soon</span>
            <p className={styles.statValue} style={{ color: 'var(--pink)' }}>{metrics.soonCount}</p>
            <span className={styles.statSubtext}>Next 7 days</span>
            <span className={styles.statIndicator} style={{ backgroundColor: 'var(--pink)' }}></span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Companies</span>
            <p className={styles.statValue}>{metrics.companyCount}</p>
            <span className={styles.statIndicator} style={{ backgroundColor: 'var(--blue)' }}></span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Added to Calendar</span>
            <p className={styles.statValue} style={{ color: 'var(--purple)' }}>{metrics.syncedCount}</p>
            <span className={styles.statSubtext}>Via Career.AI</span>
            <span className={styles.statIndicator} style={{ backgroundColor: 'var(--purple)' }}></span>
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Calendar Body */}
          <div className="lg:col-span-3">
            <div className={styles.calendarCard}>
              
              {/* Calendar Controls */}
              <div className={styles.controls}>
                
                {/* Month Navigator */}
                <div className={styles.monthNav}>
                  <button
                    onClick={handlePrevMonth}
                    disabled={loading}
                    className={styles.navBtn}
                    aria-label="Previous month"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <h2 className={styles.monthTitle}>
                    {monthNames[month]} {year}
                  </h2>
                  
                  <button
                    onClick={handleNextMonth}
                    disabled={loading}
                    className={styles.navBtn}
                    aria-label="Next month"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* India Mode Toggle Pill */}
                <button
                  onClick={toggleIndiaMode}
                  className={`${styles.indiaTogglePill} ${isIndiaMode ? styles.indiaTogglePillActive : ''}`}
                  title={isIndiaMode ? "Switch to Global Mode" : "Switch to India Mode"}
                >
                  <span className="text-sm">🇮🇳</span>
                  <span className="font-semibold text-xs uppercase tracking-wider">India Mode</span>
                  <span className={styles.indiaToggleIndicator}>
                    <span className={`${styles.indiaToggleDot} ${isIndiaMode ? styles.indiaToggleDotActive : ''}`} />
                  </span>
                </button>

                {/* Live Feed Scanner status pill */}
                <div className={styles.scannerPill}>
                  <span className={`${styles.scannerDot} ${isScanning ? styles.scannerDotActive : ''}`}></span>
                  <span className={styles.scannerText}>
                    LIVE FEED ACTIVE • {isScanning ? 'Scanning...' : 'Connected'}
                  </span>
                  <button
                    onClick={() => fetchMonthData(currentDate, isIndiaMode, true)}
                    disabled={isScanning}
                    className={styles.syncBtn}
                    title="Sync Now"
                  >
                    <svg 
                      className={`${styles.syncIcon} ${isScanning ? styles.syncIconSpinning : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                    </svg>
                  </button>
                </div>

                {/* Filter Bar */}
                <div className={styles.filterBar}>
                  {(['All', 'Tech', 'Finance', 'Design', 'Marketing'] as const).map(filter => {
                    const isActive = activeFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Grid */}
              {loading ? (
                /* Loading Skeleton Grid */
                <div className="animate-pulse">
                  <div className="grid grid-cols-7 gap-[1px] bg-[var(--border)]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div 
                        key={day} 
                        className={styles.weekdayHeader}
                      >
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`${styles.cell} bg-[var(--surface-secondary)]/50`}
                        style={{ minHeight: '115px' }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Calendar Grid Render */
                <div className={styles.gridContainer}>
                  {/* Grid Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div 
                      key={day} 
                      className={styles.weekdayHeader}
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.charAt(0)}</span>
                    </div>
                  ))}

                  {/* 42 cells grid */}
                  {calendarCells.map((cell, idx) => {
                    const dayInternships = getInternshipsForDay(cell.day, cell.date.getMonth(), cell.date.getFullYear());
                    const isToday = cell.monthType === 'current' && 
                                    new Date().getDate() === cell.day && 
                                    new Date().getMonth() === month && 
                                    new Date().getFullYear() === year;

                    const isCurrentMonth = cell.monthType === 'current';
                    const hasInternships = dayInternships.length > 0;

                    // Class calculation
                    let cellClasses = styles.cell;
                    if (isCurrentMonth) {
                      cellClasses += ` ${styles.cellCurrent}`;
                      if (hasInternships) {
                        cellClasses += ` ${styles.cellInteractive}`;
                      }
                    } else {
                      cellClasses += ` ${styles.cellAdjacent}`;
                    }

                    if (isToday) {
                      cellClasses += ` ${styles.cellToday}`;
                    }

                    return (
                      <div
                        key={`cell-${idx}`}
                        onClick={() => isCurrentMonth && hasInternships && setSelectedDay(cell.day)}
                        className={cellClasses}
                      >
                        {/* Day Number */}
                        <div className={styles.cellTop}>
                          {hasInternships && isCurrentMonth ? (
                            <span className={styles.cellBadgeText}>
                              {dayInternships.length} pos
                            </span>
                          ) : <span></span>}
                          <span className={`${styles.dayNumber} ${isToday ? styles.dayNumberToday : ''}`}>
                            {cell.day}
                          </span>
                        </div>

                        {/* Chips Container */}
                        {isCurrentMonth && (
                          <>
                            {/* Desktop/Tablet Chips */}
                            <div className={`${styles.chipsContainer} hidden sm:flex`}>
                              {dayInternships.slice(0, 2).map((item) => {
                                const closingSoon = isClosingSoon(item.deadline);
                                return (
                                  <div
                                    key={item.id}
                                    className={`${styles.chip} ${getCategoryChipClass(item.type)} ${
                                      closingSoon ? styles.chipClosingSoon : ''
                                    }`}
                                    title={`${item.title} - ${item.company}${closingSoon ? ' (Closing Soon!)' : ''}`}
                                  >
                                    {closingSoon && <span className="mr-1">⏳</span>}
                                    <span className="font-semibold">{item.company}</span>
                                    <span className="opacity-80"> • {item.title}</span>
                                  </div>
                                );
                              })}

                              {dayInternships.length > 2 && (
                                <div className={styles.overflowBadge}>
                                  +{dayInternships.length - 2} more
                                </div>
                              )}
                            </div>

                            {/* Mobile Indicator Dots */}
                            <div className={`${styles.mobileDots} sm:hidden`}>
                              {dayInternships.map((item) => {
                                const closingSoon = isClosingSoon(item.deadline);
                                return (
                                  <span 
                                    key={item.id} 
                                    className={`${styles.dot} ${
                                      closingSoon ? styles.dotClosingSoon : getCategoryDotClass(item.type)
                                    }`}
                                    title={`${item.company}: ${item.title}${closingSoon ? ' (Closing Soon!)' : ''}`}
                                  />
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Google Calendar Integration Info Card */}
            <div className={styles.sidebarPanel}>
              <h3 className={styles.panelTitle}>
                <svg className="w-5 h-5 text-[var(--accent)] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 21h-1l1-7H5.5L13 3h1l-1 7h5.5L11 21z" />
                </svg>
                Sync Assistant
              </h3>
              
              <ul className={styles.checklist}>
                <li className={styles.checkItem}>
                  <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Auto-reminds you 7 days before deadlines</span>
                </li>
                <li className={styles.checkItem}>
                  <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Color-coded items by category</span>
                </li>
                <li className={styles.checkItem}>
                  <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Job portals link directly from your calendar</span>
                </li>
                <li className={styles.checkItem}>
                  <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Syncs immediately in one tap</span>
                </li>
              </ul>

              {accessToken ? (
                <button
                  onClick={handleDisconnectCalendar}
                  className="w-full text-center border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 text-xs font-semibold py-2.5 rounded-full uppercase tracking-wider transition-all"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Disconnect Sync
                </button>
              ) : (
                <button
                  onClick={handleConnectCalendar}
                  className="w-full text-center bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--primary)] text-xs font-semibold py-3 rounded-full uppercase tracking-wider transition-all shadow-sm shadow-[var(--accent-glow)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Connect Calendar
                </button>
              )}
            </div>

            {/* Upcoming Deadlines SidePanel */}
            <div className={styles.sidebarPanel} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 className={styles.panelTitle}>
                <svg className="w-5 h-5 text-[var(--pink)] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Near Deadlines
              </h3>

              {upcomingDeadlines.length === 0 ? (
                <div className="text-center text-[var(--text-muted)] text-sm my-auto py-8">
                  No upcoming deadlines this month.
                </div>
              ) : (
                <div className={styles.upcomingList}>
                  {upcomingDeadlines.map((item) => {
                    const deadlineDate = new Date(item.deadline);
                    const isSynced = addedToCalendarList.includes(item.id);
                    const closingSoon = isClosingSoon(item.deadline);
                    
                    return (
                      <div key={item.id} className={styles.upcomingItem}>
                        {/* Day Badge */}
                        <div className={styles.dateBlock}>
                          <span className={styles.dateMonth}>
                            {deadlineDate.toLocaleString('default', { month: 'short' })}
                          </span>
                          <span className={styles.dateDay}>
                            {deadlineDate.getDate()}
                          </span>
                        </div>

                        {/* Info */}
                        <div className={styles.itemInfo}>
                          <h4 className={styles.itemTitle} title={item.title}>
                            {item.title}
                          </h4>
                          <p className={styles.itemCompany}>
                            {item.company}
                          </p>
                          <div className={styles.itemMeta}>
                            <span 
                              className={styles.metaDot} 
                              style={{ 
                                backgroundColor: 
                                  item.type === 'Tech' ? 'var(--purple)' :
                                  item.type === 'Finance' ? '#059669' :
                                  item.type === 'Design' ? '#d97706' :
                                  '#e11d48'
                              }}
                            />
                            <span>{item.type} · {item.duration}</span>
                            {closingSoon && (
                              <span className={`${styles.badgeClosingSoon} ml-auto`}>
                                ⏳ Closing Soon
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.itemActions}>
                          <a
                            href={item.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.iconBtn}
                            title="Apply Portal"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          
                          <button
                            onClick={() => handleAddToCalendar(item)}
                            disabled={syncingId === item.id || isSynced}
                            className={`${styles.iconBtn} ${isSynced ? styles.iconBtnActive : ''}`}
                            title={isSynced ? "Synced to Calendar" : "Add to Calendar"}
                          >
                            {isSynced ? (
                              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : syncingId === item.id ? (
                              <svg className="animate-spin w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Overflow Day Detail Modal */}
      {selectedDay !== null && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDay(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  Deadlines on {monthNames[month]} {selectedDay}, {year}
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-0.5">
                  {selectedDayInternships.length} position{selectedDayInternships.length > 1 ? 's' : ''} closing
                </p>
              </div>
              <button 
                onClick={() => setSelectedDay(null)}
                className={styles.modalClose}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              {selectedDayInternships.map(item => {
                const isSynced = addedToCalendarList.includes(item.id);
                const closingSoon = isClosingSoon(item.deadline);
                return (
                  <div key={item.id} className={styles.modalItem}>
                    <div className={styles.modalItemInfo}>
                      <div className={styles.modalItemMeta}>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${getCategoryChipClass(item.type)}`}>
                          {item.type}
                        </span>
                        {closingSoon && (
                          <span className={styles.badgeClosingSoon}>
                            ⏳ Closing Soon
                          </span>
                        )}
                        <span>
                          {item.duration} · {item.stipend}
                        </span>
                      </div>
                      <h4 className={styles.modalItemTitle}>
                        {item.title}
                      </h4>
                      <p className={styles.modalItemCompany}>
                        {item.company}
                      </p>
                    </div>

                    <div className={styles.modalItemActions}>
                      <a 
                        href={item.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.modalButton}
                      >
                        Apply
                      </a>
                      <button
                        onClick={() => handleAddToCalendar(item)}
                        disabled={syncingId === item.id || isSynced}
                        className={`${styles.modalButton} ${isSynced ? styles.modalButtonActive : styles.modalButtonPrimary}`}
                      >
                        {isSynced ? (
                          <><span>✓</span> Synced</>
                        ) : syncingId === item.id ? (
                          <span>Syncing...</span>
                        ) : (
                          <><span>+</span> Sync</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <button 
                onClick={() => setSelectedDay(null)}
                className={styles.modalButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Slide-in Notification */}
      {showNewsletter && (
        <div className={`${styles.newsletterCard} ${showNewsletter ? styles.newsletterCardActive : ''}`}>
          <button 
            onClick={handleDismissNewsletter}
            className={styles.newsletterClose}
            aria-label="Close newsletter subscription"
          >
            ✕
          </button>
          
          {newsletterStatus === 'success' ? (
            <div className="text-center py-4">
              <span className="text-3xl block mb-2">🎉</span>
              <h4 className="font-semibold text-sm mb-1 text-[var(--accent)]">Successfully Subscribed!</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                You will receive monthly updates and deadline alerts.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribeNewsletter} className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 mb-1">
                <span className="text-2xl mt-0.5">📬</span>
                <div>
                  <h4 className="font-semibold text-sm text-[var(--text-primary)]">Subscribe to Newsletter</h4>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-1">
                    Stay ahead of the competition. Subscribe to receive:
                  </p>
                  <ul className="flex flex-col gap-1.5 mt-2.5 mb-1 text-[11px] text-[var(--text-secondary)] pl-0.5">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] font-bold text-xs mt-0.5">✓</span>
                      <span><strong>Whole Month Opportunities:</strong> Complete lists of all active and upcoming internships.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] font-bold text-xs mt-0.5">✓</span>
                      <span><strong>Deadline Reminders:</strong> Time-to-time alerts so you never miss a submission.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] font-bold text-xs mt-0.5">✓</span>
                      <span><strong>India & Global Feeds:</strong> Targeted roles mapped to your preferred region.</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus === 'error') setNewsletterStatus('idle');
                  }}
                  className={`${styles.newsletterInput} ${newsletterStatus === 'error' ? styles.newsletterInputError : ''}`}
                  disabled={newsletterStatus === 'submitting'}
                  required
                />
              </div>
              
              {newsletterStatus === 'error' && (
                <p className="text-[10px] text-rose-400 font-medium">Please enter a valid email address.</p>
              )}
              
              <button
                type="submit"
                disabled={newsletterStatus === 'submitting'}
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--primary)] text-xs font-semibold py-2.5 rounded-full uppercase tracking-wider transition-all shadow-sm shadow-[var(--accent-glow)] flex items-center justify-center gap-1.5"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {newsletterStatus === 'submitting' ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subscribing...
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
