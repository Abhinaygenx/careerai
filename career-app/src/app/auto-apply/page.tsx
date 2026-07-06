'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Job {
    id: string;
    company: string;
    position: string;
    location: string;
    salary: string;
    deadline: string;
    daysLeft: number;
    matchScore: number;
    status: 'pending' | 'applied' | 'interview' | 'rejected' | 'tailoring' | 'writing_cl' | 'submitting';
    source: string;
    skills: string[];
    description?: string;
    url?: string;
    isRemote?: boolean;
    jobType?: string;
}

interface ApplyEvent {
    type: 'start' | 'progress' | 'applied' | 'complete' | 'error';
    data: Record<string, unknown>;
}

interface SearchConfig {
    searchTerm: string;
    location: string;
    platforms: string[];
    resultsWanted: number;
    minMatchScore: number;
    isRemote: boolean;
    experienceLevel: string;
}

interface ApplyConfig {
    coverLetterTone: 'professional' | 'enthusiastic' | 'concise';
    includeCoverLetter: boolean;
}

// ─── Wizard Steps ─────────────────────────────────────────────────────────────

type WizardStep = 'discover' | 'review' | 'configure' | 'applying' | 'done';

const PLATFORMS = [
    { id: 'linkedin', label: 'LinkedIn', color: '#0077B5', icon: '💼', note: '(may be slow)' },
    { id: 'indeed', label: 'Indeed', color: '#2557A7', icon: '🔍', note: '' },
    { id: 'glassdoor', label: 'Glassdoor', color: '#0CAA41', icon: '🏢', note: '' },
    { id: 'google', label: 'Google Jobs', color: '#EA4335', icon: '🔎', note: '' },
    { id: 'zip_recruiter', label: 'ZipRecruiter', color: '#44D62C', icon: '⚡', note: '' },
];

const EXPERIENCE_LEVELS = ['', 'internship', 'entry level', 'associate', 'mid-senior level', 'director', 'executive'];

// Client-side fallback job generator (shown when live scraping fails/times out)
function getDemoJobs(searchTerm: string, location: string): Job[] {
    const companies = [
        { company: 'Google', role: 'SDE-III', score: 92, salary: '₹42–60 LPA', skills: ['Python', 'Kubernetes', 'System Design'], source: 'LinkedIn' },
        { company: 'Microsoft', role: 'Software Engineer 2', score: 88, salary: '₹35–50 LPA', skills: ['TypeScript', 'Azure', 'React'], source: 'Indeed' },
        { company: 'Amazon', role: 'SDE-2', score: 86, salary: '₹38–55 LPA', skills: ['Java', 'AWS', 'DynamoDB'], source: 'Glassdoor' },
        { company: 'Flipkart', role: 'Backend Engineer', score: 90, salary: '₹28–40 LPA', skills: ['Java', 'Kafka', 'Microservices'], source: 'LinkedIn' },
        { company: 'Razorpay', role: 'Senior SWE', score: 78, salary: '₹30–45 LPA', skills: ['Go', 'PostgreSQL', 'Redis'], source: 'Indeed' },
        { company: 'PhonePe', role: 'Platform Engineer', score: 84, salary: '₹32–48 LPA', skills: ['Java', 'Spring', 'Kafka'], source: 'Google Jobs' },
        { company: 'Swiggy', role: 'SDE-2', score: 81, salary: '₹30–42 LPA', skills: ['Python', 'React', 'AWS'], source: 'Glassdoor' },
        { company: 'Atlassian', role: 'Software Engineer', score: 87, salary: '₹40–58 LPA', skills: ['Java', 'AWS', 'Kubernetes'], source: 'LinkedIn' },
        { company: 'Salesforce', role: 'MTS', score: 83, salary: '₹45–65 LPA', skills: ['Java', 'Apex', 'React'], source: 'Indeed' },
        { company: 'Zomato', role: 'Software Engineer', score: 76, salary: '₹25–38 LPA', skills: ['Python', 'Node.js', 'MySQL'], source: 'Google Jobs' },
    ];
    return companies.map((c, i) => ({
        id: `demo-${i}`,
        company: c.company,
        position: `${searchTerm} / ${c.role}`,
        location,
        salary: c.salary,
        deadline: '',
        daysLeft: 5 + (i * 4 % 22),
        matchScore: c.score,
        status: 'pending',
        source: c.source,
        skills: c.skills,
        description: `${c.company} is hiring a ${searchTerm} to join our world-class engineering team. You will work on large-scale distributed systems with millions of users.`,
        url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchTerm)}`,
        isRemote: i % 3 === 0,
        jobType: 'Full-time',
    }));
}


// ─── Component ────────────────────────────────────────────────────────────────


export default function AutoApplyPage() {
    const [step, setStep] = useState<WizardStep>('discover');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [previewJob, setPreviewJob] = useState<Job | null>(null);
    const [liveLog, setLiveLog] = useState<string[]>([]);
    const [applyResults, setApplyResults] = useState<Record<string, string>>({});
    const [totalApplied, setTotalApplied] = useState(0);
    const [searchError, setSearchError] = useState<string | null>(null);
    const logRef = useRef<HTMLDivElement>(null);

    const [searchConfig, setSearchConfig] = useState<SearchConfig>({
        searchTerm: 'Software Engineer',
        location: 'India',
        platforms: ['indeed', 'glassdoor', 'google'],  // LinkedIn excluded by default (TLS issues)
        resultsWanted: 20,
        minMatchScore: 60,
        isRemote: false,
        experienceLevel: '',
    });

    const [applyConfig, setApplyConfig] = useState<ApplyConfig>({
        coverLetterTone: 'professional',
        includeCoverLetter: true,
    });

    // Resume text from session/localStorage
    const [resumeText, setResumeText] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('career_ai_resume_text') || '';
        setResumeText(stored);
    }, []);

    // Auto-scroll log
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [liveLog]);

    // ─── Stats ─────────────────────────────────────────────────────────────

    const stats = {
        total: jobs.length,
        pending: jobs.filter(j => j.status === 'pending').length,
        applied: jobs.filter(j => j.status === 'applied').length,
        highMatch: jobs.filter(j => j.matchScore >= 80).length,
        selected: selectedJobs.size,
    };

    // ─── Job Discovery ─────────────────────────────────────────────────────

    const discoverJobs = async () => {
        setIsLoadingJobs(true);
        setHasSearched(true);
        setJobs([]);
        setSelectedJobs(new Set());
        setSearchError(null);

        const params = new URLSearchParams({
            search_term: searchConfig.searchTerm,
            location: searchConfig.location,
            results_wanted: String(searchConfig.resultsWanted),
            resume_text: resumeText,
            platforms: searchConfig.platforms.join(','),
            is_remote: String(searchConfig.isRemote),
            experience_level: searchConfig.experienceLevel,
            min_match_score: String(searchConfig.minMatchScore),
        });

        try {
            const res = await fetch(`/api/auto-apply/search?${params}`);
            const data = await res.json();
            if (data.jobs && Array.isArray(data.jobs) && data.jobs.length > 0) {
                setJobs(data.jobs);
            } else if (data.fallback || res.status === 503) {
                setSearchError('Live scraping timed out. Showing demo jobs — add your Groq API key or try again.');
                // Show demo fallback jobs locally so the UI isn\'t empty
                setJobs(getDemoJobs(searchConfig.searchTerm, searchConfig.location));
            } else {
                setJobs(data.jobs || []);
            }
        } catch (err) {
            console.error('Job discovery failed:', err);
            setSearchError('Could not reach the auto-apply service. Make sure it is running on port 5000.');
            setJobs(getDemoJobs(searchConfig.searchTerm, searchConfig.location));
        } finally {
            setIsLoadingJobs(false);
        }
    };

    // ─── Selection ─────────────────────────────────────────────────────────

    const toggleJob = (id: string) => {
        setSelectedJobs(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectHighMatch = () => {
        const highMatch = jobs.filter(j => j.matchScore >= 80 && j.status === 'pending').map(j => j.id);
        setSelectedJobs(new Set(highMatch));
    };

    const selectAll = () => {
        const all = jobs.filter(j => j.status === 'pending').map(j => j.id);
        setSelectedJobs(new Set(all));
    };

    const clearSelection = () => setSelectedJobs(new Set());

    // ─── Score Color ───────────────────────────────────────────────────────

    const scoreColor = (score: number) => {
        if (score >= 85) return '#00D9A5';
        if (score >= 70) return '#6C5CE7';
        if (score >= 55) return '#FDCB6E';
        return '#FF7675';
    };

    // ─── Batch Apply (SSE) ─────────────────────────────────────────────────

    const startBatchApply = async () => {
        const selectedJobsList = jobs.filter(j => selectedJobs.has(j.id));
        if (selectedJobsList.length === 0) return;

        setStep('applying');
        setLiveLog([]);
        setApplyResults({});
        setTotalApplied(0);

        // Mark selected as tailoring
        setJobs(prev => prev.map(j =>
            selectedJobs.has(j.id) ? { ...j, status: 'tailoring' } : j
        ));

        try {
            const response = await fetch('/api/auto-apply/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobs: selectedJobsList.map(j => ({
                        id: j.id,
                        company: j.company,
                        position: j.position,
                        location: j.location,
                        url: j.url || '',
                        description: j.description || '',
                    })),
                    resume_text: resumeText || 'Software Engineer with experience in React, Node.js, Python, and cloud infrastructure.',
                    cover_letter_tone: applyConfig.coverLetterTone,
                    include_cover_letter: applyConfig.includeCoverLetter,
                }),
            });

            if (!response.body) throw new Error('No stream body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                let eventType = '';
                for (const line of lines) {
                    if (line.startsWith('event: ')) {
                        eventType = line.slice(7).trim();
                    } else if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            handleSSEEvent(eventType, data);
                        } catch { /* ignore parse errors */ }
                    }
                }
            }
        } catch (err) {
            setLiveLog(prev => [...prev, `❌ Error: ${String(err)}`]);
        }
    };

    const handleSSEEvent = (type: string, data: Record<string, unknown>) => {
        switch (type) {
            case 'start':
                setLiveLog(prev => [...prev, `🚀 Starting batch apply for ${data.total} jobs...`]);
                break;

            case 'progress': {
                const step = data.step as string;
                const msg = data.message as string;
                setLiveLog(prev => [...prev, msg]);

                const jobId = data.jobId as string;
                const stepStatus: Job['status'] =
                    step === 'tailoring' ? 'tailoring' :
                    step === 'cover_letter' ? 'writing_cl' : 'submitting';

                setJobs(prev => prev.map(j =>
                    j.id === jobId ? { ...j, status: stepStatus } : j
                ));
                break;
            }

            case 'applied': {
                const jobId = data.jobId as string;
                const company = data.company as string;
                const position = data.position as string;
                const url = data.job_url as string;

                setLiveLog(prev => [...prev, data.message as string]);
                setApplyResults(prev => ({ ...prev, [jobId]: 'applied' }));
                setTotalApplied(prev => prev + 1);
                setJobs(prev => prev.map(j =>
                    j.id === jobId ? { ...j, status: 'applied' } : j
                ));
                break;
            }

            case 'complete':
                setLiveLog(prev => [...prev, `🎉 Done! Applied to ${data.total_applied} jobs successfully.`]);
                setTimeout(() => setStep('done'), 1000);
                break;

            case 'error':
                setLiveLog(prev => [...prev, `❌ Error: ${data.message}`]);
                break;
        }
    };

    // ─── Status Badge ──────────────────────────────────────────────────────

    const statusInfo = (status: Job['status']) => {
        const map: Record<Job['status'], { label: string; cls: string }> = {
            pending: { label: 'Pending', cls: styles.statusPending },
            tailoring: { label: '🎯 Tailoring', cls: styles.statusTailoring },
            writing_cl: { label: '✍️ Cover Letter', cls: styles.statusWriting },
            submitting: { label: '🚀 Submitting', cls: styles.statusSubmitting },
            applied: { label: '✅ Applied', cls: styles.statusApplied },
            interview: { label: '🎤 Interview', cls: styles.statusInterview },
            rejected: { label: '❌ Rejected', cls: styles.statusRejected },
        };
        return map[status] || map.pending;
    };

    // ─── Render ────────────────────────────────────────────────────────────

    return (
        <>
            <Header />
            <main className={styles.main}>
                {/* ── Hero ── */}
                <div className={styles.heroBanner}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroBadge}>
                            <span>⚡</span>
                            <span>Powered by SpeedyApply + JobSpy</span>
                        </div>
                        <h1 className={styles.heroTitle}>
                            <span className={styles.heroGradient}>Mass Auto-Apply</span>
                            <br />to Every Open Role
                        </h1>
                        <p className={styles.heroSub}>
                            Scrape real jobs from LinkedIn, Indeed & Glassdoor. AI-tailor your resume. Apply to dozens with one click.
                        </p>

                        {/* Platform Icons */}
                        <div className={styles.platformRow}>
                            {PLATFORMS.map(p => (
                                <div key={p.id} className={styles.platformPill} style={{ borderColor: p.color + '40', background: p.color + '15' }}>
                                    <span>{p.icon}</span>
                                    <span style={{ color: p.color }}>{p.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.container}>
                    {/* ── Wizard Steps ── */}
                    <div className={styles.wizardNav}>
                        {(['discover', 'review', 'configure', 'applying'] as WizardStep[]).map((s, i) => {
                            const labels = ['1. Discover', '2. Review', '3. Configure', '4. Apply'];
                            const isActive = step === s;
                            const isDone = ['discover', 'review', 'configure', 'applying', 'done'].indexOf(step) > i;
                            return (
                                <div key={s} className={`${styles.wizardStep} ${isActive ? styles.wizardActive : ''} ${isDone ? styles.wizardDone : ''}`}>
                                    <span className={styles.wizardDot}>{isDone && !isActive ? '✓' : i + 1}</span>
                                    <span className={styles.wizardLabel}>{labels[i]}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* ══════════════════════════════════════════════
                        STEP 1: DISCOVER JOBS
                    ══════════════════════════════════════════════ */}
                    {(step === 'discover' || step === 'review') && (
                        <>
                            {/* Search Panel */}
                            <div className={styles.searchPanel}>
                                <h2 className={styles.sectionTitle}>🔍 Discover Jobs</h2>

                                <div className={styles.searchGrid}>
                                    <div className={styles.searchField}>
                                        <label>Job Title / Role</label>
                                        <input
                                            type="text"
                                            value={searchConfig.searchTerm}
                                            onChange={e => setSearchConfig(p => ({ ...p, searchTerm: e.target.value }))}
                                            placeholder="e.g. Software Engineer, Data Scientist"
                                            className={styles.searchInput}
                                            onKeyDown={e => e.key === 'Enter' && discoverJobs()}
                                        />
                                    </div>
                                    <div className={styles.searchField}>
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            value={searchConfig.location}
                                            onChange={e => setSearchConfig(p => ({ ...p, location: e.target.value }))}
                                            placeholder="e.g. India, Bangalore, Remote"
                                            className={styles.searchInput}
                                        />
                                    </div>
                                    <div className={styles.searchField}>
                                        <label>Experience Level</label>
                                        <select
                                            value={searchConfig.experienceLevel}
                                            onChange={e => setSearchConfig(p => ({ ...p, experienceLevel: e.target.value }))}
                                            className={styles.searchSelect}
                                        >
                                            {EXPERIENCE_LEVELS.map(l => (
                                                <option key={l} value={l}>{l || 'Any Level'}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.searchField}>
                                        <label>Min Match Score: {searchConfig.minMatchScore}%</label>
                                        <input
                                            type="range"
                                            min={0} max={90} step={5}
                                            value={searchConfig.minMatchScore}
                                            onChange={e => setSearchConfig(p => ({ ...p, minMatchScore: +e.target.value }))}
                                            className={styles.rangeInput}
                                        />
                                    </div>
                                </div>

                                {/* Platform Toggles */}
                                <div className={styles.platformToggles}>
                                    <span className={styles.toggleLabel}>Platforms:</span>
                                    {PLATFORMS.map(p => {
                                        const active = searchConfig.platforms.includes(p.id);
                                        return (
                                            <button
                                                key={p.id}
                                                className={`${styles.platformBtn} ${active ? styles.platformBtnActive : ''}`}
                                                style={active ? { borderColor: p.color, background: p.color + '20', color: p.color } : {}}
                                                onClick={() => setSearchConfig(prev => ({
                                                    ...prev,
                                                    platforms: active
                                                        ? prev.platforms.filter(x => x !== p.id)
                                                        : [...prev.platforms, p.id],
                                                }))}
                                            >
                                                {p.icon} {p.label}
                                            </button>
                                        );
                                    })}
                                    <label className={styles.remoteToggle}>
                                        <input
                                            type="checkbox"
                                            checked={searchConfig.isRemote}
                                            onChange={e => setSearchConfig(p => ({ ...p, isRemote: e.target.checked }))}
                                        />
                                        <span>Remote Only</span>
                                    </label>
                                </div>

                                <button
                                    onClick={discoverJobs}
                                    disabled={isLoadingJobs}
                                    className={styles.discoverBtn}
                                >
                                    {isLoadingJobs ? (
                                        <><span className={styles.btnSpinner} /> Scanning {searchConfig.platforms.length} platforms...</>
                                    ) : (
                                        <>⚡ Discover Jobs</>
                                    )}
                                </button>
                            </div>

                            {searchError && (
                                <div className={styles.searchErrorBanner}>
                                    <span>⚠️</span>
                                    <p>{searchError}</p>
                                </div>
                            )}

                            {/* Stats Row */}
                            {jobs.length > 0 && (
                                <div className={styles.statsRow}>
                                    {[
                                        { label: 'Discovered', value: stats.total, icon: '📋', color: '#6C5CE7' },
                                        { label: 'High Match (80%+)', value: stats.highMatch, icon: '🎯', color: '#00D9A5' },
                                        { label: 'Selected', value: stats.selected, icon: '✅', color: '#FDCB6E' },
                                        { label: 'Applied', value: stats.applied, icon: '🚀', color: '#0984E3' },
                                    ].map(s => (
                                        <div key={s.label} className={styles.statCard} style={{ borderTop: `3px solid ${s.color}` }}>
                                            <span className={styles.statIcon}>{s.icon}</span>
                                            <div>
                                                <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
                                                <div className={styles.statLabel}>{s.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Job List */}
                            {isLoadingJobs && (
                                <div className={styles.loadingState}>
                                    <div className={styles.loadingOrbit}>
                                        <div className={styles.orbitRing} />
                                        <div className={styles.orbitCore}>⚡</div>
                                    </div>
                                    <p>Scanning LinkedIn, Indeed, Glassdoor for the best matches...</p>
                                    <p className={styles.loadingHint}>This may take 15-30 seconds for live results</p>
                                </div>
                            )}

                            {!isLoadingJobs && hasSearched && jobs.length === 0 && (
                                <div className={styles.emptyState}>
                                    <span>🔍</span>
                                    <p>No jobs found. Try a broader search term or lower the match score filter.</p>
                                </div>
                            )}

                            {jobs.length > 0 && (
                                <>
                                    {/* Selection Controls */}
                                    <div className={styles.selectionBar}>
                                        <div className={styles.selectionLeft}>
                                            <span className={styles.selectionCount}>{selectedJobs.size} selected</span>
                                            <button onClick={selectHighMatch} className={styles.selBtn}>⭐ Select High Match</button>
                                            <button onClick={selectAll} className={styles.selBtn}>Select All</button>
                                            <button onClick={clearSelection} className={styles.selBtn}>Clear</button>
                                        </div>
                                        <button
                                            onClick={() => { if (selectedJobs.size > 0) setStep('review'); }}
                                            disabled={selectedJobs.size === 0}
                                            className={styles.nextBtn}
                                        >
                                            Review {selectedJobs.size} Jobs →
                                        </button>
                                    </div>

                                    {/* Job Cards */}
                                    <div className={styles.jobGrid}>
                                        {jobs.map(job => {
                                            const isSelected = selectedJobs.has(job.id);
                                            const { label, cls } = statusInfo(job.status);
                                            const isPreviewing = previewJob?.id === job.id;

                                            return (
                                                <div
                                                    key={job.id}
                                                    className={`${styles.jobCard} ${isSelected ? styles.jobCardSelected : ''}`}
                                                    onClick={() => job.status === 'pending' && toggleJob(job.id)}
                                                >
                                                    {/* Score Ring */}
                                                    <div className={styles.scoreRing}>
                                                        <svg viewBox="0 0 40 40" className={styles.scoreCircle}>
                                                            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                                                            <circle
                                                                cx="20" cy="20" r="16" fill="none"
                                                                stroke={scoreColor(job.matchScore)}
                                                                strokeWidth="3"
                                                                strokeDasharray={`${(job.matchScore / 100) * 100.5} 100.5`}
                                                                strokeLinecap="round"
                                                                transform="rotate(-90 20 20)"
                                                            />
                                                        </svg>
                                                        <span className={styles.scoreText} style={{ color: scoreColor(job.matchScore) }}>
                                                            {job.matchScore}%
                                                        </span>
                                                    </div>

                                                    <div className={styles.jobCardBody}>
                                                        <div className={styles.jobCardTop}>
                                                            <div>
                                                                <h3 className={styles.jobCardTitle}>{job.position}</h3>
                                                                <div className={styles.jobCardCompany}>
                                                                    <span className={styles.companyAvatar}>{job.company[0]}</span>
                                                                    <span>{job.company}</span>
                                                                    <span className={styles.dot}>•</span>
                                                                    <span>{job.location}</span>
                                                                    {job.isRemote && <span className={styles.remotePill}>Remote</span>}
                                                                </div>
                                                            </div>
                                                            <span className={`${styles.statusBadge} ${cls}`}>{label}</span>
                                                        </div>

                                                        <div className={styles.jobCardMeta}>
                                                            <span>💰 {job.salary}</span>
                                                            <span>📍 {job.source}</span>
                                                            <span className={job.daysLeft <= 3 ? styles.urgentDeadline : ''}>
                                                                ⏰ {job.daysLeft}d left
                                                            </span>
                                                        </div>

                                                        <div className={styles.skillPills}>
                                                            {job.skills.slice(0, 5).map((skill, i) => (
                                                                <span key={i} className={styles.skillPill}>{skill}</span>
                                                            ))}
                                                        </div>

                                                        <div className={styles.jobCardFooter}>
                                                            <button
                                                                className={styles.previewBtn}
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    setPreviewJob(isPreviewing ? null : job);
                                                                }}
                                                            >
                                                                {isPreviewing ? 'Hide' : 'Preview'}
                                                            </button>
                                                            {job.url && (
                                                                <a
                                                                    href={job.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={styles.viewJobLink}
                                                                    onClick={e => e.stopPropagation()}
                                                                >
                                                                    View Job ↗
                                                                </a>
                                                            )}
                                                            {job.status === 'pending' && (
                                                                <button
                                                                    className={`${styles.selectBtn} ${isSelected ? styles.selectBtnActive : ''}`}
                                                                    onClick={e => { e.stopPropagation(); toggleJob(job.id); }}
                                                                >
                                                                    {isSelected ? '✓ Selected' : '+ Select'}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {isPreviewing && job.description && (
                                                            <div className={styles.previewPanel}>
                                                                <p>{job.description.slice(0, 500)}...</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Bottom CTA */}
                                    {step === 'review' && (
                                        <div className={styles.reviewCTA}>
                                            <div>
                                                <p className={styles.reviewTitle}>{selectedJobs.size} jobs selected for application</p>
                                                <p className={styles.reviewSub}>AI will tailor your resume and write a cover letter for each</p>
                                            </div>
                                            <button onClick={() => setStep('configure')} className={styles.ctaBtn}>
                                                Configure & Apply →
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* ══════════════════════════════════════════════
                        STEP 3: CONFIGURE
                    ══════════════════════════════════════════════ */}
                    {step === 'configure' && (
                        <div className={styles.configPanel}>
                            <h2 className={styles.sectionTitle}>⚙️ Application Configuration</h2>

                            <div className={styles.configGrid}>
                                {/* Resume Section */}
                                <div className={styles.configCard}>
                                    <h3>📄 Resume Text</h3>
                                    <p className={styles.configHint}>Paste your resume text. AI will use this to tailor applications.</p>
                                    <textarea
                                        className={styles.resumeTextarea}
                                        value={resumeText}
                                        onChange={e => {
                                            setResumeText(e.target.value);
                                            localStorage.setItem('career_ai_resume_text', e.target.value);
                                        }}
                                        placeholder="Paste your full resume text here..."
                                        rows={10}
                                    />
                                    {resumeText && (
                                        <p className={styles.charCount}>{resumeText.length} characters · AI match scoring active</p>
                                    )}
                                </div>

                                {/* Application Settings */}
                                <div className={styles.configCard}>
                                    <h3>🎨 Application Settings</h3>

                                    <div className={styles.configSection}>
                                        <label className={styles.configLabel}>Cover Letter Tone</label>
                                        <div className={styles.toneGrid}>
                                            {([
                                                { val: 'professional', icon: '👔', label: 'Professional', desc: 'Formal & results-driven' },
                                                { val: 'enthusiastic', icon: '🔥', label: 'Enthusiastic', desc: 'Energetic & passionate' },
                                                { val: 'concise', icon: '⚡', label: 'Concise', desc: 'Brief & punchy' },
                                            ] as const).map(t => (
                                                <button
                                                    key={t.val}
                                                    className={`${styles.toneBtn} ${applyConfig.coverLetterTone === t.val ? styles.toneBtnActive : ''}`}
                                                    onClick={() => setApplyConfig(p => ({ ...p, coverLetterTone: t.val }))}
                                                >
                                                    <span>{t.icon}</span>
                                                    <span>{t.label}</span>
                                                    <span className={styles.toneDesc}>{t.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <label className={styles.checkboxRow}>
                                        <input
                                            type="checkbox"
                                            checked={applyConfig.includeCoverLetter}
                                            onChange={e => setApplyConfig(p => ({ ...p, includeCoverLetter: e.target.checked }))}
                                        />
                                        <span>Generate cover letter for each application</span>
                                    </label>

                                    <div className={styles.summaryBox}>
                                        <div className={styles.summaryRow}>
                                            <span>Jobs to apply</span>
                                            <strong>{selectedJobs.size}</strong>
                                        </div>
                                        <div className={styles.summaryRow}>
                                            <span>AI tailoring</span>
                                            <strong>✅ Enabled</strong>
                                        </div>
                                        <div className={styles.summaryRow}>
                                            <span>Cover letters</span>
                                            <strong>{applyConfig.includeCoverLetter ? '✅ Yes' : '❌ No'}</strong>
                                        </div>
                                        <div className={styles.summaryRow}>
                                            <span>Estimated time</span>
                                            <strong>~{Math.ceil(selectedJobs.size * 2.5)} minutes</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.configActions}>
                                <button onClick={() => setStep('review')} className={styles.backBtn}>← Back</button>
                                <button onClick={startBatchApply} className={styles.launchBtn}>
                                    🚀 Launch Auto-Apply ({selectedJobs.size} jobs)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════
                        STEP 4: APPLYING (Live Monitor)
                    ══════════════════════════════════════════════ */}
                    {(step === 'applying' || step === 'done') && (
                        <div className={styles.applyingPanel}>
                            <div className={styles.applyingHeader}>
                                {step === 'applying' ? (
                                    <>
                                        <div className={styles.applyingPulse} />
                                        <h2>🚀 Applying to Jobs...</h2>
                                        <p>Sit back while AI tailors your applications</p>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.successIcon}>🎉</div>
                                        <h2>Application Blitz Complete!</h2>
                                        <p>Successfully applied to <strong>{totalApplied}</strong> jobs</p>
                                    </>
                                )}
                            </div>

                            {/* Live Progress */}
                            <div className={styles.progressGrid}>
                                <div className={styles.progressCard}>
                                    <div className={styles.progressMeta}>
                                        <span>Applied</span>
                                        <strong className={styles.progressCount}>{totalApplied} / {selectedJobs.size}</strong>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFill}
                                            style={{ width: `${selectedJobs.size > 0 ? (totalApplied / selectedJobs.size) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Live Log */}
                                <div className={styles.logPanel} ref={logRef}>
                                    {liveLog.map((line, i) => (
                                        <div key={i} className={styles.logLine}>{line}</div>
                                    ))}
                                    {step === 'applying' && <div className={styles.logCursor}>▌</div>}
                                </div>
                            </div>

                            {/* Job Status Cards */}
                            <div className={styles.applyJobList}>
                                {jobs.filter(j => selectedJobs.has(j.id)).map(job => {
                                    const { label, cls } = statusInfo(job.status);
                                    return (
                                        <div key={job.id} className={`${styles.applyJobCard} ${job.status === 'applied' ? styles.applyJobDone : ''}`}>
                                            <div className={styles.applyJobCompany}>{job.company[0]}</div>
                                            <div className={styles.applyJobInfo}>
                                                <strong>{job.position}</strong>
                                                <span>{job.company}</span>
                                            </div>
                                            <div className={styles.applyJobScore} style={{ color: scoreColor(job.matchScore) }}>
                                                {job.matchScore}%
                                            </div>
                                            <span className={`${styles.applyJobStatus} ${cls}`}>{label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {step === 'done' && (
                                <div className={styles.doneActions}>
                                    <button onClick={() => { setStep('discover'); setSelectedJobs(new Set()); }} className={styles.backBtn}>
                                        ← New Search
                                    </button>
                                    <button onClick={() => window.location.href = '/dashboard'} className={styles.dashBtn}>
                                        View Dashboard →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
