'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './InternshipCalendarPopup.module.css';

const DISPLAY_DURATION_MS = 3000;
const EXIT_ANIMATION_MS = 350;

export default function InternshipCalendarPopup() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isDiminishing, setIsDiminishing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [remainingMs, setRemainingMs] = useState(DISPLAY_DURATION_MS);
    
    const isPausedRef = useRef(false);
    isPausedRef.current = isPaused;

    useEffect(() => {
        // Do not display if already on the calendar page
        if (pathname?.startsWith('/internships/calendar')) {
            return;
        }

        // Check if previously dismissed in this browser session
        if (typeof window !== 'undefined' && sessionStorage.getItem('internship_calendar_popup_dismissed')) {
            return;
        }

        // Slight entrance delay after landing on the website
        const entranceTimer = setTimeout(() => {
            setIsOpen(true);
        }, 400);

        return () => clearTimeout(entranceTimer);
    }, [pathname]);

    useEffect(() => {
        if (!isOpen || isDiminishing) return;

        const interval = setInterval(() => {
            if (!isPausedRef.current) {
                setRemainingMs((prev) => {
                    const next = prev - 100;
                    if (next <= 0) {
                        clearInterval(interval);
                        handleDiminish();
                        return 0;
                    }
                    return next;
                });
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isOpen, isDiminishing]);

    const handleDiminish = () => {
        setIsDiminishing(true);
        setTimeout(() => {
            setIsOpen(false);
        }, EXIT_ANIMATION_MS);
    };

    const handleManualDismiss = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('internship_calendar_popup_dismissed', 'true');
        }
        setIsDiminishing(true);
        setTimeout(() => {
            setIsOpen(false);
        }, EXIT_ANIMATION_MS);
    };

    const handleNavigate = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('internship_calendar_popup_dismissed', 'true');
        }
        setIsOpen(false);
    };

    if (!isOpen || pathname?.startsWith('/internships/calendar')) {
        return null;
    }

    const progressScale = remainingMs / DISPLAY_DURATION_MS;

    return (
        <aside 
            className={styles.popupContainer}
            aria-label="Internship Calendar Announcement"
            role="dialog"
        >
            <div 
                className={`${styles.popupCard} ${isDiminishing ? styles.popupDiminishing : styles.popupEntering}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Header Row: Badge & Dismiss button */}
                <div className={styles.headerRow}>
                    <div className={styles.badgeGroup}>
                        <span className={styles.featureBadge}>
                            <span className={styles.pulseDot} />
                            <span>Live Feature</span>
                        </span>
                    </div>

                    <button 
                        onClick={handleManualDismiss}
                        className={styles.closeBtn}
                        aria-label="Close notification"
                        title="Dismiss"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body Content */}
                <div className={styles.bodyContent}>
                    <div className={styles.iconWrapper}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="3" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
                        </svg>
                    </div>

                    <div className={styles.textGroup}>
                        <h4 className={styles.title}>2026 Internship & Job Calendar</h4>
                        <p className={styles.description}>
                            Track 35+ verified tech, finance & remote internships with deadline reminders.
                        </p>
                    </div>
                </div>

                {/* Action Row */}
                <div className={styles.actionRow}>
                    <Link 
                        href="/internships/calendar" 
                        onClick={handleNavigate}
                        className={styles.ctaBtn}
                    >
                        <span>Explore Calendar</span>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>

                    <span className={styles.timerHint}>
                        {isPaused ? 'Paused' : `Auto-closes in ${Math.ceil(remainingMs / 1000)}s`}
                    </span>
                </div>

                {/* 3-Second Shrinking Progress Line */}
                <div className={styles.progressBarTrack}>
                    <div 
                        className={styles.progressBarFill} 
                        style={{ 
                            transform: `scaleX(${progressScale})`,
                            animation: 'none' // Controlled via state for smooth pausing
                        }} 
                    />
                </div>
            </div>
        </aside>
    );
}
