'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

interface Job {
    id: string;
    company: string;
    position: string;
    location: string;
    salary: string;
    deadline: string;
    daysLeft: number;
    matchScore: number;
    status: 'pending' | 'applied' | 'interview' | 'rejected' | 'tailoring';
    source: string;
    skills: string[];
    description?: string;
    url?: string;
}

const mockJobs: Job[] = [
    {
        id: '1',
        company: 'Google',
        position: 'Software Engineer L4',
        location: 'Bangalore',
        salary: '₹35-50 LPA',
        deadline: '2024-02-15',
        daysLeft: 5,
        matchScore: 92,
        status: 'pending',
        source: 'LinkedIn',
        skills: ['Python', 'Distributed Systems', 'Machine Learning']
    },
    {
        id: '2',
        company: 'Microsoft',
        position: 'Full Stack Developer',
        location: 'Hyderabad',
        salary: '₹28-40 LPA',
        deadline: '2024-02-18',
        daysLeft: 8,
        matchScore: 88,
        status: 'pending',
        source: 'Company Website',
        skills: ['React', 'Node.js', 'Azure']
    },
    {
        id: '3',
        company: 'Amazon',
        position: 'SDE-2',
        location: 'Bangalore',
        salary: '₹32-45 LPA',
        deadline: '2024-02-20',
        daysLeft: 10,
        matchScore: 85,
        status: 'applied',
        source: 'LinkedIn',
        skills: ['Java', 'AWS', 'System Design']
    },
    {
        id: '4',
        company: 'Flipkart',
        position: 'Backend Engineer',
        location: 'Bangalore',
        salary: '₹25-35 LPA',
        deadline: '2024-02-12',
        daysLeft: 2,
        matchScore: 90,
        status: 'pending',
        source: 'Naukri',
        skills: ['Java', 'Microservices', 'Kafka']
    },
    {
        id: '5',
        company: 'Razorpay',
        position: 'Senior Software Engineer',
        location: 'Bangalore',
        salary: '₹30-42 LPA',
        deadline: '2024-02-25',
        daysLeft: 15,
        matchScore: 78,
        status: 'interview',
        source: 'LinkedIn',
        skills: ['Go', 'PostgreSQL', 'Redis']
    }
];

export default function AutoApplyPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'applied' | 'interview'>('all');
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [isApplying, setIsApplying] = useState(false);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [credits, setCredits] = useState(45);

    useEffect(() => {
        // Fetch jobs from python backend
        const fetchJobs = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/discover?search_term=Software Engineer&location=India');
                if (res.ok) {
                    const data = await res.json();
                    if (data.jobs && data.jobs.length > 0) {
                        setJobs(data.jobs);
                    } else {
                        setJobs(mockJobs); // fallback
                    }
                } else {
                    setJobs(mockJobs);
                }
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
                setJobs(mockJobs);
            } finally {
                setIsLoadingJobs(false);
            }
        };
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(job => {
        if (filter === 'all') return true;
        return job.status === filter;
    });

    const toggleJobSelection = (jobId: string) => {
        setSelectedJobs(prev =>
            prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        );
    };

    const selectAllPending = () => {
        const pendingIds = jobs.filter(j => j.status === 'pending').map(j => j.id);
        setSelectedJobs(pendingIds);
    };

    const applyToSelected = async () => {
        if (selectedJobs.length === 0) return;
        if (selectedJobs.length > credits) {
            alert('Not enough credits! Please upgrade your plan.');
            return;
        }

        setIsApplying(true);

        // Mark as tailoring first
        setJobs(prev => prev.map(job =>
            selectedJobs.includes(job.id) ? { ...job, status: 'tailoring' as Job['status'] } : job
        ));

        for (const jobId of selectedJobs) {
            const job = jobs.find(j => j.id === jobId);
            if (job) {
                try {
                    // Enrich JD first to get full description
                    let jdText = job.description || '';
                    if (job.url && jdText.length < 100) {
                        const enrichRes = await fetch('http://localhost:5000/api/enrich', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: job.url })
                        });
                        if (enrichRes.ok) {
                            const data = await enrichRes.json();
                            jdText = data.description;
                        }
                    }

                    // Call Tailor
                    await fetch('http://localhost:5000/api/tailor', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resume_text: "Software Engineer with React experience.", jd_text: jdText })
                    });
                    
                    // Call Cover Letter
                    await fetch('http://localhost:5000/api/cover-letter', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resume_text: "Software Engineer with React experience.", jd_text: jdText })
                    });
                } catch (e) {
                    console.error("Apply flow error", e);
                }
            }
        }

        setJobs(prev => prev.map(job =>
            selectedJobs.includes(job.id) ? { ...job, status: 'applied' as const } : job
        ));

        setCredits(prev => prev - selectedJobs.length);
        setSelectedJobs([]);
        setIsApplying(false);
    };

    const getStatusBadge = (status: Job['status']) => {
        const badges = {
            pending: { label: 'Pending', className: styles.pending },
            tailoring: { label: 'Tailoring AI', className: styles.interview },
            applied: { label: 'Applied', className: styles.applied },
            interview: { label: 'Interview', className: styles.interview },
            rejected: { label: 'Rejected', className: styles.rejected }
        };
        return badges[status];
    };

    const stats = {
        totalJobs: jobs.length,
        applied: jobs.filter(j => j.status === 'applied').length,
        interviews: jobs.filter(j => j.status === 'interview').length,
        pending: jobs.filter(j => j.status === 'pending').length
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.hero}>
                        <span className={styles.badge}>
                            <span>🚀</span> AI Auto Apply
                        </span>
                        <h1 className={styles.title}>
                            <span className={styles.highlight}>Automate</span> Your Job Applications
                        </h1>
                        <p className={styles.subtitle}>
                            We find the best matches and apply with your optimized resume. Never miss a deadline.
                        </p>
                    </div>

                    {/* Stats Dashboard */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>📋</span>
                            <div>
                                <span className={styles.statValue}>{stats.totalJobs}</span>
                                <span className={styles.statLabel}>Matched Jobs</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>✅</span>
                            <div>
                                <span className={styles.statValue}>{stats.applied}</span>
                                <span className={styles.statLabel}>Applied</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>🎯</span>
                            <div>
                                <span className={styles.statValue}>{stats.interviews}</span>
                                <span className={styles.statLabel}>Interviews</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>⚡</span>
                            <div>
                                <span className={styles.statValue}>{credits}</span>
                                <span className={styles.statLabel}>Credits Left</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className={styles.actionBar}>
                        <div className={styles.filters}>
                            {(['all', 'pending', 'applied', 'interview'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                    {f !== 'all' && (
                                        <span className={styles.filterCount}>
                                            {jobs.filter(j => j.status === f).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className={styles.actions}>
                            <button onClick={selectAllPending} className={styles.selectAllBtn}>
                                Select All Pending
                            </button>
                            <button
                                onClick={applyToSelected}
                                disabled={selectedJobs.length === 0 || isApplying}
                                className={styles.applyBtn}
                            >
                                {isApplying ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        🚀 Apply to Selected ({selectedJobs.length})
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Job List */}
                    {isLoadingJobs ? (
                        <div className={styles.loadingState}>
                            <span className={styles.spinnerLarge}></span>
                            <p>Discovering jobs for your profile...</p>
                        </div>
                    ) : (
                    <div className={styles.jobList}>
                        {filteredJobs.map((job) => {
                            const statusBadge = getStatusBadge(job.status);
                            const isSelected = selectedJobs.includes(job.id);

                            return (
                                <div
                                    key={job.id}
                                    className={`${styles.jobCard} ${isSelected ? styles.selected : ''}`}
                                >
                                    <div className={styles.jobCheckbox}>
                                        {job.status === 'pending' && (
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleJobSelection(job.id)}
                                                className={styles.checkbox}
                                            />
                                        )}
                                    </div>

                                    <div className={styles.jobMain}>
                                        <div className={styles.jobHeader}>
                                            <div>
                                                <h3 className={styles.jobTitle}>{job.position}</h3>
                                                <div className={styles.jobCompany}>
                                                    <span className={styles.companyLogo}>
                                                        {job.company.charAt(0)}
                                                    </span>
                                                    {job.company} • {job.location}
                                                </div>
                                            </div>
                                            <div className={styles.jobMeta}>
                                                <span className={`${styles.statusBadge} ${statusBadge.className}`}>
                                                    {statusBadge.label}
                                                </span>
                                                <div className={styles.matchScore}>
                                                    <span className={styles.scoreValue}>{job.matchScore}%</span>
                                                    <span className={styles.scoreLabel}>Match</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.jobDetails}>
                                            <span className={styles.salary}>💰 {job.salary}</span>
                                            <span className={styles.source}>📍 {job.source}</span>
                                            <span className={`${styles.deadline} ${job.daysLeft <= 3 ? styles.urgent : ''}`}>
                                                ⏰ {job.daysLeft} days left
                                            </span>
                                        </div>

                                        <div className={styles.jobSkills}>
                                            {job.skills.map((skill, index) => (
                                                <span key={index} className={styles.skillTag}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.jobActions}>
                                        <button className={styles.viewBtn}>View Job</button>
                                        {job.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedJobs([job.id]);
                                                    applyToSelected();
                                                }}
                                                className={styles.quickApplyBtn}
                                            >
                                                Quick Apply
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    )}

                    {filteredJobs.length === 0 && (
                        <div className={styles.emptyState}>
                            <span>📭</span>
                            <p>No jobs found in this category</p>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className={styles.infoBox}>
                        <h4>💡 How Auto Apply Works</h4>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span>1️⃣</span>
                                <p>We scan 50+ job boards daily for matches</p>
                            </div>
                            <div className={styles.infoItem}>
                                <span>2️⃣</span>
                                <p>AI selects the best resume version for each job</p>
                            </div>
                            <div className={styles.infoItem}>
                                <span>3️⃣</span>
                                <p>One-click apply with personalized cover letters</p>
                            </div>
                            <div className={styles.infoItem}>
                                <span>4️⃣</span>
                                <p>Get notified on application status & interviews</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
