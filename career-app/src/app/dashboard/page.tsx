'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './page.module.css';

interface Resume {
    id: string;
    name: string;
    atsScore: number;
    lastModified: string;
    targetCompany: string;
}

interface Application {
    id: string;
    company: string;
    position: string;
    status: 'pending' | 'applied' | 'interview' | 'rejected' | 'offer';
    appliedDate: string;
}

const DEFAULT_RESUMES: Resume[] = [
    { id: '1', name: 'Software Engineer Resume', atsScore: 85, lastModified: '2 hours ago', targetCompany: 'Google' },
    { id: '2', name: 'Full Stack Developer Resume', atsScore: 78, lastModified: '1 day ago', targetCompany: 'Microsoft' },
    { id: '3', name: 'Frontend Developer Resume', atsScore: 92, lastModified: '3 days ago', targetCompany: 'Meta' }
];

const DEFAULT_APPLICATIONS: Application[] = [
    { id: '1', company: 'Google', position: 'Software Engineer L4', status: 'interview', appliedDate: '5 days ago' },
    { id: '2', company: 'Microsoft', position: 'Full Stack Developer', status: 'applied', appliedDate: '3 days ago' },
    { id: '3', company: 'Amazon', position: 'SDE-2', status: 'pending', appliedDate: '1 day ago' },
    { id: '4', company: 'Flipkart', position: 'Backend Engineer', status: 'rejected', appliedDate: '1 week ago' },
    { id: '5', company: 'Razorpay', position: 'Senior Frontend', status: 'offer', appliedDate: '2 weeks ago' }
];

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'resumes' | 'applications'>('overview');
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Auth Protection
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Data Persistence
    useEffect(() => {
        if (user) {
            const storageKey = `career_ai_data_${user.uid}`;
            const storedData = localStorage.getItem(storageKey);

            if (storedData) {
                const parsed = JSON.parse(storedData);
                setResumes(parsed.resumes || DEFAULT_RESUMES);
                setApplications(parsed.applications || DEFAULT_APPLICATIONS);
            } else {
                setResumes(DEFAULT_RESUMES);
                setApplications(DEFAULT_APPLICATIONS);
                // Initialize storage
                localStorage.setItem(storageKey, JSON.stringify({
                    resumes: DEFAULT_RESUMES,
                    applications: DEFAULT_APPLICATIONS
                }));
            }
            setDataLoaded(true);
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    if (loading || !user || !dataLoaded) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading your career workspace...</p>
            </div>
        );
    }

    const stats = {
        resumes: resumes.length,
        applications: applications.length,
        interviews: applications.filter(a => a.status === 'interview').length,
        offers: applications.filter(a => a.status === 'offer').length,
        avgAtsScore: resumes.length > 0
            ? Math.round(resumes.reduce((sum, r) => sum + r.atsScore, 0) / resumes.length)
            : 0,
        creditsLeft: 42
    };

    const getStatusBadge = (status: Application['status']) => {
        const badges = {
            pending: 'Pending',
            applied: 'Applied',
            interview: 'Interview',
            rejected: 'Rejected',
            offer: 'Offer 🎉'
        };
        return badges[status];
    };

    return (
        <div className={styles.dashboard}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>🎯</span>
                    <span>Career<span className={styles.logoAi}>.ai</span></span>
                </Link>

                <nav className={styles.nav}>
                    <button
                        className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
                        <span>Overview</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'resumes' ? styles.active : ''}`}
                        onClick={() => setActiveTab('resumes')}
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                        <span>My Resumes</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'applications' ? styles.active : ''}`}
                        onClick={() => setActiveTab('applications')}
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                        <span>Applications</span>
                    </button>

                    <div className={styles.navDivider}></div>

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
                    <Link href="/dashboard/meetings" className={styles.navItem}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <span>Meeting Tracker</span>
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.upgradeCard}>
                        <h4 className={styles.upgradeTitle}>Upgrade to Pro</h4>
                        <p className={styles.upgradeText}>Get unlimited ATS scans, mock interviews & advanced resume reviews.</p>
                        <Link href="/pricing" className={styles.upgradeBtn}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                            Upgrade Now
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.pageTitle}>
                            {activeTab === 'overview' && 'Dashboard'}
                            {activeTab === 'resumes' && 'My Resumes'}
                            {activeTab === 'applications' && 'Job Applications'}
                        </h1>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.credits}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                            <span>{stats.creditsLeft} credits</span>
                        </div>
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
                <div className={styles.content}>
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statIconContainer}>
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.purpleIcon}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.resumes}</span>
                                        <span className={styles.statLabel}>Resumes</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIconContainer}>
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.blueIcon}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.applications}</span>
                                        <span className={styles.statLabel}>Applications</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIconContainer}>
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.accentIcon}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.interviews}</span>
                                        <span className={styles.statLabel}>Interviews</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIconContainer}>
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.pinkIcon}><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.offers}</span>
                                        <span className={styles.statLabel}>Offers</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIconContainer}>
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.purpleIcon}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.avgAtsScore}%</span>
                                        <span className={styles.statLabel}>Avg ATS Score</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIconContainer}>
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.accentIcon}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.creditsLeft}</span>
                                        <span className={styles.statLabel}>Credits Left</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                                <div className={styles.quickActions}>
                                    <Link href="/ats-checker" className={styles.actionCard}>
                                        <div className={styles.actionIconContainer}>
                                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                                        </div>
                                        <span className={styles.actionTitle}>Check ATS Score</span>
                                        <span className={styles.actionDesc}>Upload resume to analyze</span>
                                    </Link>
                                    <Link href="/resume-builder" className={styles.actionCard}>
                                        <div className={styles.actionIconContainer}>
                                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                        </div>
                                        <span className={styles.actionTitle}>Build Resume</span>
                                        <span className={styles.actionDesc}>Create AI-optimized resume</span>
                                    </Link>
                                    <Link href="/auto-apply" className={styles.actionCard}>
                                        <div className={styles.actionIconContainer}>
                                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                        </div>
                                        <span className={styles.actionTitle}>Auto Apply</span>
                                        <span className={styles.actionDesc}>Apply to matched jobs</span>
                                    </Link>
                                    <Link href="/mock-interview" className={styles.actionCard}>
                                        <div className={styles.actionIconContainer}>
                                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                                        </div>
                                        <span className={styles.actionTitle}>Practice Interview</span>
                                        <span className={styles.actionDesc}>Prepare with AI coach</span>
                                    </Link>
                                    <Link href="/dashboard/meetings" className={styles.actionCard}>
                                        <div className={styles.actionIconContainer}>
                                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                        </div>
                                        <span className={styles.actionTitle}>Meeting Tracker</span>
                                        <span className={styles.actionDesc}>Manage meetings & track health</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Recent Applications</h2>
                                <div className={styles.recentList}>
                                    {applications.slice(0, 3).map((app) => (
                                        <div key={app.id} className={styles.recentItem}>
                                            <div className={styles.recentLogo}>{app.company.charAt(0)}</div>
                                            <div className={styles.recentInfo}>
                                                <span className={styles.recentTitle}>{app.position}</span>
                                                <span className={styles.recentSub}>{app.company} • {app.appliedDate}</span>
                                            </div>
                                            <span className={`${styles.statusBadge} ${styles[app.status]}`}>
                                                {getStatusBadge(app.status)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'resumes' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>My Resumes</h2>
                                <Link href="/resume-builder" className={styles.createBtn}>
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                    Create New Resume
                                </Link>
                            </div>
                            <div className={styles.resumeGrid}>
                                {resumes.map((resume) => (
                                    <div key={resume.id} className={styles.resumeCard}>
                                        <div className={styles.resumePreview}>
                                            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                                        </div>
                                        <div className={styles.resumeInfo}>
                                            <h3>{resume.name}</h3>
                                            <p className={styles.resumeTarget}>Target: <strong>{resume.targetCompany}</strong></p>
                                            <p className={styles.resumeMeta}>Modified {resume.lastModified}</p>
                                        </div>
                                        <div className={styles.resumeScore}>
                                            <span className={styles.scoreValue}>{resume.atsScore}%</span>
                                            <span className={styles.scoreLabel}>ATS Match</span>
                                        </div>
                                        <div className={styles.resumeActions}>
                                            <button className={styles.resumeBtn}>Edit</button>
                                            <button className={styles.resumeBtn}>Download</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Job Applications</h2>
                                <Link href="/auto-apply" className={styles.createBtn}>
                                    Find Jobs to Apply
                                </Link>
                            </div>
                            <div className={styles.applicationsTable}>
                                <div className={styles.tableHeader}>
                                    <span>Position</span>
                                    <span>Company</span>
                                    <span>Applied</span>
                                    <span>Status</span>
                                </div>
                                {applications.map((app) => (
                                    <div key={app.id} className={styles.tableRow}>
                                        <span className={styles.cellPosition}>{app.position}</span>
                                        <span className={styles.cellCompany}>
                                            <span className={styles.companyLogo}>{app.company.charAt(0)}</span>
                                            {app.company}
                                        </span>
                                        <span className={styles.cellDate}>{app.appliedDate}</span>
                                        <span className={`${styles.statusBadge} ${styles[app.status]}`}>
                                            {getStatusBadge(app.status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
