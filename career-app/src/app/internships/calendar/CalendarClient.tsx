'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  const [workModeFilter, setWorkModeFilter] = useState<'All' | 'Remote' | 'Full-Time' | 'In-Office' | 'Hybrid'>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'remote-first' | 'fulltime-first' | 'company' | 'stipend'>('deadline');
  
  // Custom dropdown states
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Google OAuth states
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [addedToCalendarList, setAddedToCalendarList] = useState<string[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  
  // Detail Modal state
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalSearch, setModalSearch] = useState<string>('');
  
  // Status message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auto-dismiss status message toast after 3 seconds
  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  // Support window 'show-toast' event for notifications across the app
  useEffect(() => {
    const handleToastEvent = (e: any) => {
      if (e.detail) {
        setStatusMessage({
          text: e.detail.text || 'Live Feed updated: Synced latest opportunities.',
          type: e.detail.type || 'info'
        });
      }
    };
    window.addEventListener('show-toast', handleToastEvent);
    return () => window.removeEventListener('show-toast', handleToastEvent);
  }, []);

  // Grab token from URL on mount or load from localStorage
  useEffect(() => {
    const token = searchParams.get('accessToken');
    const oauthError = searchParams.get('error');

    if (token) {
      setAccessToken(token);
      localStorage.setItem('google_calendar_token', token);
      setStatusMessage({ text: 'Successfully connected Google Calendar!', type: 'success' });
      
      // Clean query params from URL without remounting the component
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('accessToken');
      
      const newUrl = newSearchParams.toString() 
        ? `${pathname}?${newSearchParams.toString()}` 
        : pathname;
        
      window.history.replaceState({}, '', newUrl);
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
        
      window.history.replaceState({}, '', newUrl);
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

  // Extract all unique locations from current internships
  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    internships.forEach(item => {
      if (item.location) {
        const trimmed = item.location.trim();
        if (trimmed) locs.add(trimmed);
      }
    });
    return Array.from(locs).sort();
  }, [internships]);

  // Popular location chips based on active region
  const popularLocations = useMemo(() => {
    if (isIndiaMode) {
      return [
        { label: 'All Locations', value: 'All' },
        { label: '🌐 Remote', value: 'Remote' },
        { label: 'Bengaluru', value: 'Bengaluru' },
        { label: 'Hyderabad', value: 'Hyderabad' },
        { label: 'Mumbai', value: 'Mumbai' },
        { label: 'Pune', value: 'Pune' },
        { label: 'Gurugram / Noida', value: 'Gurugram' },
        { label: 'Delhi NCR', value: 'Delhi' }
      ];
    } else {
      return [
        { label: 'All Locations', value: 'All' },
        { label: '🌐 Remote', value: 'Remote' },
        { label: 'San Francisco', value: 'San Francisco' },
        { label: 'New York', value: 'New York' },
        { label: 'Seattle', value: 'Seattle' },
        { label: 'Austin', value: 'Austin' },
        { label: 'London', value: 'London' },
        { label: 'Boston', value: 'Boston' }
      ];
    }
  }, [isIndiaMode]);

  // Filter & Sort internships
  const filteredInternships = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let active = internships.filter(item => {
      const deadlineDate = new Date(item.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate >= today;
    });

    // Category filter
    if (activeFilter !== 'All') {
      active = active.filter(item => item.type === activeFilter);
    }

    // Work Mode filter
    if (workModeFilter !== 'All') {
      active = active.filter(item => item.workMode === workModeFilter);
    }

    // Location filter
    if (locationFilter !== 'All') {
      const locLower = locationFilter.toLowerCase();
      active = active.filter(item => (item.location || '').toLowerCase().includes(locLower));
    }

    // Sort
    return active.sort((a, b) => {
      if (sortBy === 'remote-first') {
        const aRemote = a.workMode === 'Remote' ? 1 : 0;
        const bRemote = b.workMode === 'Remote' ? 1 : 0;
        if (aRemote !== bRemote) return bRemote - aRemote;
      } else if (sortBy === 'fulltime-first') {
        const aFt = a.workMode === 'Full-Time' ? 1 : 0;
        const bFt = b.workMode === 'Full-Time' ? 1 : 0;
        if (aFt !== bFt) return bFt - aFt;
      } else if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      } else if (sortBy === 'stipend') {
        const numA = parseInt((a.stipend || '').replace(/[^0-9]/g, '')) || 0;
        const numB = parseInt((b.stipend || '').replace(/[^0-9]/g, '')) || 0;
        return numB - numA;
      }
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [internships, activeFilter, workModeFilter, locationFilter, sortBy]);

  const hasActiveFilters = activeFilter !== 'All' || workModeFilter !== 'All' || locationFilter !== 'All' || sortBy !== 'deadline';

  const handleResetFilters = () => {
    setActiveFilter('All');
    setWorkModeFilter('All');
    setLocationFilter('All');
    setSortBy('deadline');
  };

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

  const getWorkModeBadgeClass = (mode?: string) => {
    switch (mode) {
      case 'Remote':
        return styles.modeRemoteBadge;
      case 'Full-Time':
        return styles.modeFullTimeBadge;
      case 'Hybrid':
        return styles.modeHybridBadge;
      case 'In-Office':
        return styles.modeInOfficeBadge;
      default:
        return styles.modeRemoteBadge;
    }
  };

  // Reset modal search when active day changes
  useEffect(() => {
    setModalSearch('');
  }, [selectedDay]);

  // Selected Day Modal Data with in-scroller live search
  const selectedDayInternships = useMemo(() => {
    const dayItems = getInternshipsForDay(selectedDay);
    if (!modalSearch.trim()) return dayItems;
    const q = modalSearch.toLowerCase().trim();
    return dayItems.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q) ||
      (item.workMode || '').toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  }, [selectedDay, filteredInternships, modalSearch]);

  // Handle batch 1-click sync for all jobs on selected date
  const handleSyncAllDay = async () => {
    if (!accessToken) {
      setLoading(true);
      window.location.href = '/api/auth/google';
      return;
    }
    const unSynced = selectedDayInternships.filter(item => !addedToCalendarList.includes(item.id));
    if (unSynced.length === 0) {
      setStatusMessage({ text: 'All internships on this day are already synced to Google Calendar!', type: 'info' });
      return;
    }
    setIsSyncingAll(true);
    let count = 0;
    for (const item of unSynced) {
      try {
        const res = await fetch('/api/calendar/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ internshipId: item.id, accessToken, internship: item })
        });
        if (res.ok) {
          markAsAdded(item.id);
          count++;
        }
      } catch (e) {
        console.error('Batch sync error for item', item.id, e);
      }
    }
    setIsSyncingAll(false);
    setStatusMessage({ text: `Successfully synced ${count} position${count > 1 ? 's' : ''} to Google Calendar!`, type: 'success' });
  };

  return (
    <div className={styles.pageWrapper}>
      <div className="container py-12">
        
        {/* Page Header */}
        <div className={styles.headerContainer}>
          <div className={styles.headerTextGroup}>
            <div className={styles.headerBadge}>
              <span className={styles.headerBadgeDot}></span>
              <span>Real-Time Internship Sync</span>
            </div>
            <h1 className={styles.title}>
              Internship <span className={styles.titleSpan}>Calendar</span>
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
            <span className={styles.statSubtext}>Via careerstart.in</span>
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
                
                {/* Top Row: Month Navigation and Global Live Controls */}
                <div className={styles.controlsTopRow}>
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

                  {/* Actions: India Feed & Live Sync Pill */}
                  <div className={styles.controlsActions}>
                    {/* India Mode Toggle Pill */}
                    <button
                      onClick={toggleIndiaMode}
                      className={`${styles.indiaTogglePill} ${isIndiaMode ? styles.indiaTogglePillActive : ''}`}
                      title={isIndiaMode ? "Switch to Global Feed" : "Switch to India Feed"}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0 shadow-sm shadow-amber-400/50" />
                        <span className="font-semibold text-xs tracking-wider">India Feed</span>
                      </span>
                      <span className={styles.indiaToggleIndicator}>
                        <span className={`${styles.indiaToggleDot} ${isIndiaMode ? styles.indiaToggleDotActive : ''}`} />
                      </span>
                    </button>

                    {/* Live Feed Scanner status pill */}
                    <div className={styles.scannerPill}>
                      <span className={`${styles.scannerDot} ${isScanning ? styles.scannerDotActive : ''}`} />
                      <span className={styles.scannerText}>
                        Live Feed • {isScanning ? 'Scanning...' : 'Connected'}
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
                  </div>
                </div>

                {/* Category Navigation Row */}
                <div className={styles.categoryNavRow}>
                  <div className={styles.filterBar}>
                    {(['All', 'Tech', 'Finance', 'Design', 'Marketing'] as const).map(filter => {
                      const isActive = activeFilter === filter;
                      return (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
                        >
                          {filter === 'All' ? 'All Roles' : filter}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Refined Secondary Filter Sub-Card */}
                <div className={styles.filterSubCard}>
                  {/* Row 1: Work Mode Pills */}
                  <div className={styles.filterSubRow}>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={styles.filterSectionLabel}>
                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Work Mode:
                      </span>
                      <div className={styles.modePillGroup}>
                        {[
                          {
                            label: 'All Modes',
                            val: 'All',
                            icon: (
                              <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                              </svg>
                            )
                          },
                          {
                            label: 'Remote',
                            val: 'Remote',
                            icon: (
                              <svg className="w-3.5 h-3.5 shrink-0 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                              </svg>
                            )
                          },
                          {
                            label: 'Full-Time',
                            val: 'Full-Time',
                            icon: (
                              <svg className="w-3.5 h-3.5 shrink-0 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                              </svg>
                            )
                          },
                          {
                            label: 'In-Office',
                            val: 'In-Office',
                            icon: (
                              <svg className="w-3.5 h-3.5 shrink-0 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            )
                          },
                          {
                            label: 'Hybrid',
                            val: 'Hybrid',
                            icon: (
                              <svg className="w-3.5 h-3.5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            )
                          }
                        ].map(item => (
                          <button
                            key={item.val}
                            onClick={() => setWorkModeFilter(item.val as any)}
                            className={`${styles.modePill} ${workModeFilter === item.val ? styles.modePillActive : ''}`}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.filterDivider} />

                  {/* Row 2: Location, Sort, and Roles Meta */}
                  <div className={styles.filterSubRow}>
                    <div className={styles.dropdownsContainer}>
                      
                      {/* Location Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className={styles.filterSectionLabel}>
                          <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <circle cx="12" cy="11" r="2.5" strokeWidth="2" />
                          </svg>
                          Location:
                        </span>
                        <div className={styles.selectWrapper} ref={locationDropdownRef}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsLocationOpen(!isLocationOpen);
                              setIsSortOpen(false);
                            }}
                            className={`${styles.dropdownTrigger} ${isLocationOpen ? styles.dropdownTriggerActive : ''}`}
                            aria-expanded={isLocationOpen}
                          >
                            <span className="flex items-center gap-2">
                              {locationFilter === 'All' ? (
                                <>
                                  <svg className="w-3.5 h-3.5 shrink-0 text-[var(--pink)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <circle cx="12" cy="11" r="2.5" />
                                  </svg>
                                  <span>All Locations</span>
                                </>
                              ) : locationFilter === 'Remote' ? (
                                <>
                                  <svg className="w-3.5 h-3.5 shrink-0 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                  </svg>
                                  <span>Remote Only</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5 shrink-0 text-[var(--pink)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <circle cx="12" cy="11" r="2.5" />
                                  </svg>
                                  <span>{locationFilter}</span>
                                </>
                              )}
                            </span>
                            <svg 
                              className={`${styles.dropdownChevron} ${isLocationOpen ? styles.dropdownChevronOpen : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isLocationOpen && (
                            <div className={styles.dropdownMenu}>
                              {/* Search Box inside Location Dropdown */}
                              <div className={styles.dropdownSearchWrapper}>
                                <svg className={styles.dropdownSearchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                  type="text"
                                  placeholder="Search city or hub..."
                                  value={locationSearch}
                                  onChange={(e) => setLocationSearch(e.target.value)}
                                  className={styles.dropdownSearchInput}
                                  autoFocus
                                />
                              </div>

                              <div className={styles.dropdownList}>
                                {!locationSearch.trim() ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLocationFilter('All');
                                        setIsLocationOpen(false);
                                        setLocationSearch('');
                                      }}
                                      className={`${styles.dropdownItem} ${locationFilter === 'All' ? styles.dropdownItemActive : ''}`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <circle cx="12" cy="11" r="2.5" />
                                        </svg>
                                        <span>All Locations</span>
                                      </span>
                                      {locationFilter === 'All' && <span className={styles.dropdownItemCheck}>✓</span>}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLocationFilter('Remote');
                                        setIsLocationOpen(false);
                                        setLocationSearch('');
                                      }}
                                      className={`${styles.dropdownItem} ${locationFilter === 'Remote' ? styles.dropdownItemActive : ''}`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 shrink-0 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                          <circle cx="12" cy="12" r="10" />
                                          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        </svg>
                                        <span>Remote Only</span>
                                      </span>
                                      {locationFilter === 'Remote' && <span className={styles.dropdownItemCheck}>✓</span>}
                                    </button>

                                    <div className={styles.dropdownHeader}>
                                      {isIndiaMode ? "Major Indian Tech Hubs" : "Global Tech Hubs"}
                                    </div>
                                    {popularLocations.filter(p => p.value !== 'All' && p.value !== 'Remote').map(pop => (
                                      <button
                                        type="button"
                                        key={pop.value}
                                        onClick={() => {
                                          setLocationFilter(pop.value);
                                          setIsLocationOpen(false);
                                          setLocationSearch('');
                                        }}
                                        className={`${styles.dropdownItem} ${locationFilter === pop.value ? styles.dropdownItemActive : ''}`}
                                      >
                                        <span className="flex items-center gap-2">
                                          <svg className="w-3.5 h-3.5 shrink-0 text-[var(--pink)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <circle cx="12" cy="11" r="2.5" />
                                          </svg>
                                          <span>{pop.label}</span>
                                        </span>
                                        {locationFilter === pop.value && <span className={styles.dropdownItemCheck}>✓</span>}
                                      </button>
                                    ))}

                                    {availableLocations.length > 0 && (
                                      <>
                                        <div className={styles.dropdownHeader}>Other Locations</div>
                                        {availableLocations
                                          .filter(loc => !popularLocations.some(p => loc.toLowerCase().includes(p.value.toLowerCase())))
                                          .slice(0, 15)
                                          .map(loc => (
                                            <button
                                              type="button"
                                              key={loc}
                                              onClick={() => {
                                                setLocationFilter(loc);
                                                setIsLocationOpen(false);
                                                setLocationSearch('');
                                              }}
                                              className={`${styles.dropdownItem} ${locationFilter === loc ? styles.dropdownItemActive : ''}`}
                                            >
                                              <span className="flex items-center gap-2">
                                                <svg className="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                  <circle cx="12" cy="11" r="2.5" />
                                                </svg>
                                                <span>{loc}</span>
                                              </span>
                                              {locationFilter === loc && <span className={styles.dropdownItemCheck}>✓</span>}
                                            </button>
                                          ))}
                                      </>
                                    )}
                                  </>
                                ) : (
                                  (() => {
                                    const q = locationSearch.toLowerCase().trim();
                                    const allLocs = [
                                      'All Locations',
                                      'Remote',
                                      ...popularLocations.map(p => p.value),
                                      ...availableLocations
                                    ].filter((v, i, a) => a.indexOf(v) === i);

                                    const matches = allLocs.filter(loc => loc.toLowerCase().includes(q));

                                    if (matches.length === 0) {
                                      return (
                                        <div className="text-[11px] text-[var(--text-muted)] text-center py-4">
                                          No matching locations
                                        </div>
                                      );
                                    }

                                    return matches.map(loc => {
                                      const val = loc === 'All Locations' ? 'All' : loc;
                                      return (
                                        <button
                                          type="button"
                                          key={loc}
                                          onClick={() => {
                                            setLocationFilter(val);
                                            setIsLocationOpen(false);
                                            setLocationSearch('');
                                          }}
                                          className={`${styles.dropdownItem} ${locationFilter === val ? styles.dropdownItemActive : ''}`}
                                        >
                                          <span className="flex items-center gap-2">
                                            <svg className="w-3.5 h-3.5 shrink-0 text-[var(--pink)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                              <circle cx="12" cy="11" r="2.5" />
                                            </svg>
                                            <span>{loc}</span>
                                          </span>
                                          {locationFilter === val && <span className={styles.dropdownItemCheck}>✓</span>}
                                        </button>
                                      );
                                    });
                                  })()
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sort Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className={styles.filterSectionLabel}>
                          <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                          </svg>
                          Sort:
                        </span>
                        <div className={styles.selectWrapper} ref={sortDropdownRef}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSortOpen(!isSortOpen);
                              setIsLocationOpen(false);
                            }}
                            className={`${styles.dropdownTrigger} ${isSortOpen ? styles.dropdownTriggerActive : ''}`}
                            aria-expanded={isSortOpen}
                          >
                            <span className="flex items-center gap-2">
                              {sortBy === 'deadline' ? (
                                <>
                                  <svg className="w-3.5 h-3.5 shrink-0 text-[var(--pink)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <span>Earliest Deadline</span>
                                </>
                              ) : sortBy === 'remote-first' ? (
                                <>
                                  <svg className="w-3.5 h-3.5 shrink-0 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                  </svg>
                                  <span>Remote First</span>
                                </>
                              ) : sortBy === 'fulltime-first' ? (
                                <>
                                  <svg className="w-3.5 h-3.5 shrink-0 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                  </svg>
                                  <span>Full-Time First</span>
                                </>
                              ) : sortBy === 'company' ? (
                                <>
                                  <svg className="w-3.5 h-3.5 shrink-0 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span>Company (A-Z)</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="2" y="6" width="20" height="12" rx="2" />
                                    <circle cx="12" cy="12" r="2" />
                                    <path d="M6 12h.01M18 12h.01" />
                                  </svg>
                                  <span>Highest Stipend</span>
                                </>
                              )}
                            </span>
                            <svg 
                              className={`${styles.dropdownChevron} ${isSortOpen ? styles.dropdownChevronOpen : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isSortOpen && (
                            <div className={`${styles.dropdownMenu} ${styles.dropdownMenuRight}`}>
                              <div className={styles.dropdownList}>
                                {[
                                  { 
                                    val: 'deadline', 
                                    label: 'Earliest Deadline',
                                    icon: (
                                      <svg className="w-3.5 h-3.5 shrink-0 text-[var(--pink)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                      </svg>
                                    )
                                  },
                                  { 
                                    val: 'remote-first', 
                                    label: 'Remote First',
                                    icon: (
                                      <svg className="w-3.5 h-3.5 shrink-0 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                      </svg>
                                    )
                                  },
                                  { 
                                    val: 'fulltime-first', 
                                    label: 'Full-Time First',
                                    icon: (
                                      <svg className="w-3.5 h-3.5 shrink-0 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                      </svg>
                                    )
                                  },
                                  { 
                                    val: 'company', 
                                    label: 'Company (A-Z)',
                                    icon: (
                                      <svg className="w-3.5 h-3.5 shrink-0 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                      </svg>
                                    )
                                  },
                                  { 
                                    val: 'stipend', 
                                    label: 'Highest Stipend',
                                    icon: (
                                      <svg className="w-3.5 h-3.5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect x="2" y="6" width="20" height="12" rx="2" />
                                        <circle cx="12" cy="12" r="2" />
                                        <path d="M6 12h.01M18 12h.01" />
                                      </svg>
                                    )
                                  }
                                ].map(option => (
                                  <button
                                    type="button"
                                    key={option.val}
                                    onClick={() => {
                                      setSortBy(option.val as any);
                                      setIsSortOpen(false);
                                    }}
                                    className={`${styles.dropdownItem} ${sortBy === option.val ? styles.dropdownItemActive : ''}`}
                                  >
                                    <span className="flex items-center gap-2">
                                      {option.icon}
                                      <span>{option.label}</span>
                                    </span>
                                    {sortBy === option.val && <span className={styles.dropdownItemCheck}>✓</span>}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Meta Container: Reset button & Roles Count */}
                    <div className={styles.filterMetaContainer}>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className={styles.clearFilterBtn}
                          title="Reset all filters"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Reset</span>
                        </button>
                      )}

                      <span className={styles.rolesCountBadge}>
                        {filteredInternships.length} {filteredInternships.length === 1 ? 'role' : 'roles'}
                      </span>
                    </div>
                  </div>
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
                                    title={`${item.title} - ${item.company} | ${item.workMode || ''} | ${item.location || ''}${closingSoon ? ' (Closing Soon!)' : ''}`}
                                  >
                                    {closingSoon && <span className="mr-1">⏳</span>}
                                    {item.workMode === 'Remote' && <span className="mr-1 text-[10px]">🌐</span>}
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
              <div className={styles.panelHeader}>
                <div className={styles.panelIconBadge}>
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 21h-1l1-7H5.5L13 3h1l-1 7h5.5L11 21z" />
                  </svg>
                </div>
                <div>
                  <h3 className={styles.panelTitle}>Sync Assistant</h3>
                  <p className={styles.panelSubtitle}>Instant calendar sync & alert triggers</p>
                </div>
              </div>
              
              <ul className={styles.checklist}>
                <li className={styles.checkItem}>
                  <span className={styles.checkCircle}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Auto-reminds you 7 days before deadlines</span>
                </li>
                <li className={styles.checkItem}>
                  <span className={styles.checkCircle}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Color-coded items by category</span>
                </li>
                <li className={styles.checkItem}>
                  <span className={styles.checkCircle}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Job portals link directly from your calendar</span>
                </li>
                <li className={styles.checkItem}>
                  <span className={styles.checkCircle}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Syncs immediately in one tap</span>
                </li>
              </ul>

              {accessToken ? (
                <button
                  onClick={handleDisconnectCalendar}
                  className={styles.disconnectSyncBtn}
                >
                  Disconnect Sync
                </button>
              ) : (
                <button
                  onClick={handleConnectCalendar}
                  className={styles.connectSyncBtn}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
                        {/* Header: Date Badge & Urgency / Category Pill */}
                        <div className={styles.upcomingCardHeader}>
                          <div className={styles.upcomingDateBadge}>
                            <span className={styles.upcomingDateMonth}>
                              {deadlineDate.toLocaleString('default', { month: 'short' })}
                            </span>
                            <span className={styles.upcomingDateDay}>
                              {deadlineDate.getDate()}
                            </span>
                          </div>

                          {closingSoon ? (
                            <span className={styles.badgeClosingSoon}>
                              ⏳ Closing Soon
                            </span>
                          ) : (
                            <span 
                              className={styles.upcomingCategoryPill}
                              style={{ 
                                color: 
                                  item.type === 'Tech' ? 'var(--purple)' :
                                  item.type === 'Finance' ? '#059669' :
                                  item.type === 'Design' ? '#d97706' :
                                  '#e11d48'
                              }}
                            >
                              {item.type}
                            </span>
                          )}
                        </div>

                        {/* Body: Title with 2-line clamp & Company */}
                        <div className={styles.upcomingCardBody}>
                          <h4 className={styles.upcomingCardTitle} title={item.title}>
                            {item.title}
                          </h4>
                          <p className={styles.upcomingCardCompany}>
                            {item.company}
                          </p>
                        </div>

                        {/* Footer: Metadata & Quick Actions */}
                        <div className={styles.upcomingCardFooter}>
                          <div className={styles.upcomingCardMeta}>
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
                            <span>{item.duration}</span>
                            {item.workMode && (
                              <>
                                <span className="opacity-40">•</span>
                                <span>{item.workMode}</span>
                              </>
                            )}
                          </div>

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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Redesigned Premium Day Detail Modal / Scroller */}
      {selectedDay !== null && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDay(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTop}>
                <div className={styles.modalDateBadgeGroup}>
                  <div className={styles.modalCalendarIconBlock}>
                    <span className={styles.modalCalendarIconMonth}>
                      {monthNames[month].slice(0, 3)}
                    </span>
                    <span className={styles.modalCalendarIconDay}>
                      {selectedDay}
                    </span>
                  </div>
                  <div>
                    <h3 className={styles.modalTitle}>
                      {new Date(year, month, selectedDay).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <div className={styles.modalSubHeaderRow}>
                      <span className={styles.modalCountPill}>
                        ● {selectedDayInternships.length} Position{selectedDayInternships.length === 1 ? '' : 's'} Closing
                      </span>
                      {workModeFilter !== 'All' && (
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">
                          • Mode: {workModeFilter}
                        </span>
                      )}
                      {locationFilter !== 'All' && (
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">
                          • 📍 {locationFilter}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedDay(null)}
                  className={styles.modalClose}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* In-Modal Search Box for quickly finding internships on this date */}
              <div className={styles.modalSearchBox}>
                <svg className={styles.modalSearchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter jobs on this date by company, role, location..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className={styles.modalSearchInput}
                />
                {modalSearch && (
                  <button
                    onClick={() => setModalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body (The Enhanced Scroller) */}
            <div className={styles.modalBody}>
              {selectedDayInternships.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-muted)] flex flex-col items-center gap-2">
                  <span className="text-3xl">🔍</span>
                  <p className="text-sm font-medium">No matching internships found on this date.</p>
                  {modalSearch && (
                    <button
                      onClick={() => setModalSearch('')}
                      className="text-xs text-[var(--accent)] underline hover:opacity-80"
                    >
                      Clear search filter
                    </button>
                  )}
                </div>
              ) : (
                selectedDayInternships.map(item => {
                  const isSynced = addedToCalendarList.includes(item.id);
                  const closingSoon = isClosingSoon(item.deadline);
                  const firstLetter = (item.company || 'C').charAt(0).toUpperCase();

                  return (
                    <div key={item.id} className={styles.modalJobCard}>
                      
                      {/* Top Row: Avatar + Title + Company */}
                      <div className={styles.modalJobCardHeader}>
                        <div className={styles.companyAvatar} title={item.company}>
                          {firstLetter}
                        </div>
                        
                        <div className={styles.jobMainInfo}>
                          <h4 className={styles.modalItemTitle}>
                            {item.title}
                          </h4>
                          <div className={styles.companyRow}>
                            <span>{item.company}</span>
                            <span className={styles.verifiedCheck} title="Verified Listing">✓</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Badges Cluster (Category, Work Mode, Location, Stipend, Duration, Closing Soon) */}
                      <div className={styles.modalBadgeCluster}>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getCategoryChipClass(item.type)}`}>
                          {item.type}
                        </span>

                        {item.workMode && (
                          <span className={`${styles.badgeWorkMode} ${getWorkModeBadgeClass(item.workMode)}`}>
                            {item.workMode === 'Remote' ? '🌐 Remote' : 
                             item.workMode === 'Full-Time' ? '💼 Full-Time' : 
                             item.workMode === 'Hybrid' ? '⚡ Hybrid' : '🏢 In-Office'}
                          </span>
                        )}

                        {item.location && (
                          <span className={styles.badgeLocation} title={item.location}>
                            <span>📍</span>
                            <span>{item.location}</span>
                          </span>
                        )}

                        <span className={styles.badgeStipend} title="Stipend">
                          <span>💰</span>
                          <span>{item.stipend}</span>
                        </span>

                        <span className={styles.badgeDuration} title="Duration">
                          <span>⏱️ {item.duration}</span>
                        </span>

                        {closingSoon && (
                          <span className={styles.badgeClosingSoon}>
                            ⏳ Closing Soon
                          </span>
                        )}
                      </div>

                      {/* Bottom Row: Actions */}
                      <div className={styles.modalJobCardBottom}>
                        <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
                          Deadline: {monthNames[month]} {selectedDay}
                        </span>

                        <div className={styles.modalActionButtons}>
                          <a 
                            href={item.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.applyLinkBtn}
                          >
                            <span>Apply</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>

                          <button
                            onClick={() => handleAddToCalendar(item)}
                            disabled={syncingId === item.id || isSynced}
                            className={`${styles.syncEventBtn} ${isSynced ? styles.syncEventBtnActive : ''}`}
                            title={isSynced ? "Synced to Google Calendar" : "Add to Google Calendar"}
                          >
                            {isSynced ? (
                              <>
                                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Synced</span>
                              </>
                            ) : syncingId === item.id ? (
                              <>
                                <svg className="animate-spin w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Syncing...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>+ Sync</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  Showing {selectedDayInternships.length} of {getInternshipsForDay(selectedDay).length} positions
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedDayInternships.length > 1 && (
                  <button
                    onClick={handleSyncAllDay}
                    disabled={isSyncingAll}
                    className={styles.modalButton}
                    title="Sync all listed internships for this day"
                  >
                    {isSyncingAll ? (
                      <span>Syncing All...</span>
                    ) : (
                      <span>📅 Sync All for This Day</span>
                    )}
                  </button>
                )}

                <button 
                  onClick={() => setSelectedDay(null)}
                  className={styles.modalButton}
                >
                  Close
                </button>
              </div>
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

      {/* Floating Notification Toast */}
      {statusMessage && (
        <aside 
          className={`${styles.floatingToast} ${
            statusMessage.type === 'success' 
              ? styles.toastSuccess 
              : statusMessage.type === 'error' 
                ? styles.toastError 
                : styles.toastInfo
          }`}
          role="status"
          aria-live="polite"
        >
          <div className={styles.toastIconWrapper}>
            {statusMessage.type === 'success' ? (
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : statusMessage.type === 'error' ? (
              <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <div className={styles.toastBody}>
            <div className={styles.toastTitle}>
              {statusMessage.type === 'success' ? 'Success' : statusMessage.type === 'error' ? 'Notice' : 'Live Update'}
            </div>
            <p className={styles.toastText}>{statusMessage.text}</p>
          </div>

          <button
            onClick={() => setStatusMessage(null)}
            className={styles.toastCloseBtn}
            aria-label="Close notification"
            title="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 3-Second Auto-Dismiss Progress Bar */}
          <div className={styles.toastProgressBar} />
        </aside>
      )}
    </div>
  );
}
