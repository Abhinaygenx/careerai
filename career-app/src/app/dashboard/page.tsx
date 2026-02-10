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
                    <span>🎯</span>
                    <span>Career<span className={styles.logoAi}>.ai</span></span>
                </Link>

                <nav className={styles.nav}>
                    <button
                        className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <span>📊</span> Overview
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'resumes' ? styles.active : ''}`}
                        onClick={() => setActiveTab('resumes')}
                    >
                        <span>📄</span> My Resumes
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'applications' ? styles.active : ''}`}
                        onClick={() => setActiveTab('applications')}
                    >
                        <span>📋</span> Applications
                    </button>

                    <div className={styles.navDivider}></div>

                    <Link href="/ats-checker" className={styles.navItem}>
                        <span>🎯</span> ATS Checker
                    </Link>
                    <Link href="/resume-builder" className={styles.navItem}>
                        <span>📝</span> Resume Builder
                    </Link>
                    <Link href="/cover-letter" className={styles.navItem}>
                        <span>✉️</span> Cover Letters
                    </Link>
                    <Link href="/mock-interview" className={styles.navItem}>
                        <span>🎤</span> Mock Interviews
                    </Link>
                    <Link href="/auto-apply" className={styles.navItem}>
                        <span>🚀</span> Auto Apply
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/pricing" className={styles.upgradeBtn}>
                        ⚡ Upgrade to Pro
                    </Link>
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
                            <span>⚡</span>
                            <span>{stats.creditsLeft} credits</span>
                        </div>
                        <div className={styles.userMenu}>
                            <Link href="/profile" className={styles.userProfileLink}>
                                <span className={styles.avatar}>
                                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                                <span>{user.displayName || user.email?.split('@')[0] || 'User'}</span>
                            </Link>
                            {/* Logout is now also in Profile, but keeping here for ease or moving it to dropdown if preferred.
                                For now, I'll keep the direct logout button but styled smaller or rely on the profile link.
                                Let's keep the logout button for convenience but also link the name/avatar to Profile.
                            */}
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
                                    <div className={styles.statIcon}>📄</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.resumes}</span>
                                        <span className={styles.statLabel}>Resumes</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>📋</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.applications}</span>
                                        <span className={styles.statLabel}>Applications</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>🎯</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.interviews}</span>
                                        <span className={styles.statLabel}>Interviews</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>🎉</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.offers}</span>
                                        <span className={styles.statLabel}>Offers</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>📊</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.avgAtsScore}%</span>
                                        <span className={styles.statLabel}>Avg ATS Score</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>⚡</div>
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
                                        <span className={styles.actionIcon}>🎯</span>
                                        <span className={styles.actionTitle}>Check ATS Score</span>
                                        <span className={styles.actionDesc}>Upload resume to analyze</span>
                                    </Link>
                                    <Link href="/resume-builder" className={styles.actionCard}>
                                        <span className={styles.actionIcon}>📝</span>
                                        <span className={styles.actionTitle}>Build Resume</span>
                                        <span className={styles.actionDesc}>Create AI-optimized resume</span>
                                    </Link>
                                    <Link href="/auto-apply" className={styles.actionCard}>
                                        <span className={styles.actionIcon}>🚀</span>
                                        <span className={styles.actionTitle}>Auto Apply</span>
                                        <span className={styles.actionDesc}>Apply to matched jobs</span>
                                    </Link>
                                    <Link href="/mock-interview" className={styles.actionCard}>
                                        <span className={styles.actionIcon}>🎤</span>
                                        <span className={styles.actionTitle}>Practice Interview</span>
                                        <span className={styles.actionDesc}>Prepare with AI coach</span>
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
                                    + Create New Resume
                                </Link>
                            </div>
                            <div className={styles.resumeGrid}>
                                {resumes.map((resume) => (
                                    <div key={resume.id} className={styles.resumeCard}>
                                        <div className={styles.resumePreview}>
                                            <span>📄</span>
                                        </div>
                                        <div className={styles.resumeInfo}>
                                            <h3>{resume.name}</h3>
                                            <p>Target: {resume.targetCompany}</p>
                                            <p className={styles.resumeMeta}>Modified {resume.lastModified}</p>
                                        </div>
                                        <div className={styles.resumeScore}>
                                            <span className={styles.scoreValue}>{resume.atsScore}%</span>
                                            <span className={styles.scoreLabel}>ATS Score</span>
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
