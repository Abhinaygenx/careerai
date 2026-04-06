'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Header.module.css';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Failed to logout', error);
        }
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    // Prevent hydration mismatch
    const showAuth = mounted && user;

    return (
        <>
            <header className={styles.header}>
                <div className={styles.container}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoIcon}>🎯</span>
                        <span className={styles.logoText}>Career<span className={styles.logoAi}>.ai</span></span>
                    </Link>

                    <nav className={styles.nav}>
                        <div className={styles.navLinks}>
                            <div className={styles.dropdown}>
                                <button className={styles.navLink}>
                                    Products
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <div className={styles.dropdownMenu}>
                                    <Link href="/ats-checker" className={styles.dropdownItem}>
                                        <span className={styles.dropdownIcon}>📊</span>
                                        <div>
                                            <span className={styles.dropdownTitle}>ATS Score Checker</span>
                                            <span className={styles.dropdownDesc}>Get your resume score in 60 seconds</span>
                                        </div>
                                    </Link>
                                    <Link href="/resume-builder" className={styles.dropdownItem}>
                                        <span className={styles.dropdownIcon}>📝</span>
                                        <div>
                                            <span className={styles.dropdownTitle}>AI Resume Builder</span>
                                            <span className={styles.dropdownDesc}>Create ATS-optimized resumes</span>
                                        </div>
                                    </Link>
                                    <Link href="/cover-letter" className={styles.dropdownItem}>
                                        <span className={styles.dropdownIcon}>✉️</span>
                                        <div>
                                            <span className={styles.dropdownTitle}>AI Cover Letters</span>
                                            <span className={styles.dropdownDesc}>Generate personalized cover letters</span>
                                        </div>
                                    </Link>
                                    <Link href="/mock-interview" className={styles.dropdownItem}>
                                        <span className={styles.dropdownIcon}>🎤</span>
                                        <div>
                                            <span className={styles.dropdownTitle}>AI Mock Interviews</span>
                                            <span className={styles.dropdownDesc}>Practice with AI interviewer</span>
                                        </div>
                                    </Link>
                                    <Link href="/auto-apply" className={styles.dropdownItem}>
                                        <span className={styles.dropdownIcon}>🚀</span>
                                        <div>
                                            <span className={styles.dropdownTitle}>AI Auto Apply</span>
                                            <span className={styles.dropdownDesc}>Automate job applications</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                            <Link href="/pricing" className={styles.navLink}>Pricing</Link>
                            <Link href="/colleges" className={styles.navLink}>My Colleges</Link>
                            <Link href="/resources" className={styles.navLink}>Resources</Link>
                        </div>
                    </nav>

                    <div className={styles.actions}>
                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className={styles.themeToggle}
                                aria-label="Toggle theme"
                                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>
                        )}

                        {showAuth ? (
                            <div className={styles.userMenu}>
                                <button className={styles.userButton}>
                                    <div className={styles.avatar}>
                                        {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <div className={styles.userMenuDropdown}>
                                    <Link href="/dashboard" className={styles.userMenuItem}>
                                        <span>📊</span> Dashboard
                                    </Link>
                                    <Link href="/profile" className={styles.userMenuItem}>
                                        <span>👤</span> Profile
                                    </Link>
                                    <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }}></div>
                                    <button onClick={handleLogout} className={`${styles.userMenuItem} ${styles.logout}`}>
                                        <span>🚪</span> Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className={styles.signIn}>Sign In</Link>
                                <Link href="/signup" className={styles.getStarted}>Get Started Now</Link>
                            </>
                        )}
                    </div>

                    <button
                        className={styles.mobileMenuBtn}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`${styles.hamburger} ${mobileMenuOpen ? styles.active : ''}`}></span>
                    </button>
                </div>
            </header>

            {/* ─────────────────────────────────────────────────────────────
                Mobile Menu — rendered OUTSIDE <header> so position:fixed
                covers the full viewport (header has height:72px which
                would clip any children using overflow:hidden)
            ───────────────────────────────────────────────────────────── */}
            <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
                <div className={styles.mobileMenuInner}>
                    <nav className={styles.mobileNav}>
                        <Link href="/ats-checker" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                            <span>📊</span> ATS Score Checker
                        </Link>
                        <Link href="/resume-builder" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                            <span>📝</span> AI Resume Builder
                        </Link>
                        <Link href="/cover-letter" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                            <span>✉️</span> AI Cover Letters
                        </Link>
                        <Link href="/mock-interview" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                            <span>🎤</span> AI Mock Interviews
                        </Link>
                        <Link href="/auto-apply" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                            <span>🚀</span> AI Auto Apply
                        </Link>
                        <div className={styles.mobileDivider} />
                        <Link href="/pricing" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                            <span>💎</span> Pricing
                        </Link>
                        <Link href="/colleges" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                            <span>🎓</span> My Colleges
                        </Link>
                        <Link href="/resources" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                            <span>📚</span> Resources
                        </Link>
                    </nav>

                    <div className={styles.mobileActions}>
                        {mounted && (
                            <button
                                onClick={() => { toggleTheme(); }}
                                className={styles.mobileSignIn}
                                style={{ fontFamily: 'inherit' }}
                            >
                                {isDark ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
                            </button>
                        )}
                        {showAuth ? (
                            <>
                                <Link href="/dashboard" className={styles.mobileSignIn} onClick={closeMobileMenu}>Dashboard</Link>
                                <button
                                    onClick={handleLogout}
                                    className={styles.mobileSignIn}
                                    style={{ color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)', fontFamily: 'inherit' }}
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className={styles.mobileSignIn} onClick={closeMobileMenu}>Sign In</Link>
                                <Link href="/signup" className={styles.mobileGetStarted} onClick={closeMobileMenu}>Get Started Now</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
