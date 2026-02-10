'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

interface AnalysisResult {
    total_score: number;
    mode: 'jd_match' | 'general_quality';
    breakdown: {
        // JD Match Fields
        keyword_match?: number;
        semantic_match?: number;
        format_score?: number;

        // General Quality Fields
        impact_score?: number;
        section_score?: number;
        skill_score?: number;
    };
    missing_keywords: string[];
    text?: string;
}

export default function ATSCheckerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [jdText, setJdText] = useState('');

    useEffect(() => {
        return () => {
            if (fileUrl) URL.revokeObjectURL(fileUrl);
        };
    }, [fileUrl]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setFileUrl(URL.createObjectURL(droppedFile));
                setError(null);
            } else {
                setError('Please upload a PDF file.');
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setFileUrl(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const useSampleJD = () => {
        setJdText(`We are looking for a Software Engineer with experience in Python, React, and Cloud technologies (AWS or Azure).
        
Responsibilities:
- Build scalable web applications using React and Node.js.
- Design RESTful APIs and microservices.
- Optimize database queries (SQL/NoSQL).
- Collaborate with cross-functional teams.

Requirements:
- 3+ years of experience in full-stack development.
- Strong knowledge of JavaScript/TypeScript and Python.
- Experience with infinite scroll, virtual lists, and performance optimization.
- Familiarity with Docker and CI/CD pipelines.
- Bachelor's degree in Computer Science or related field.`);
    };

    const analyzeFile = async () => {
        if (!file) return;
        // JD is now optional

        setAnalyzing(true);
        setProgress(0);
        setError(null);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev;
                return prev + 5;
            });
        }, 200);

        try {
            const formData = new FormData();
            formData.append('resume', file);
            if (jdText.trim()) {
                formData.append('jd_text', jdText);
            }
            formData.append('file', file);

            const response = await fetch('/api/analyze-resume', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to analyze resume (Server Error)');
            }

            const data = await response.json();

            clearInterval(progressInterval);
            setProgress(100);

            setTimeout(() => {
                setResult(data);
                setAnalyzing(false);
            }, 500);

        } catch (err: any) {
            clearInterval(progressInterval);
            console.error(err);
            setError(err.message || 'Something went wrong. Please try again.');
            setAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setFile(null);
        if (fileUrl) URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
        setResult(null);
        setProgress(0);
        setError(null);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#C4F82A'; // Lime Green
        if (score >= 60) return '#4DA3FF'; // Blue
        if (score >= 40) return '#FFD93D'; // Yellow
        return '#FF6B6B'; // Red
    };

    // Helper to render score bars dynamically
    const renderScoreBar = (label: string, icon: string, score: number | undefined) => {
        const val = score || 0;
        return (
            <div className={styles.sectionItem}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionIcon}>{icon}</span>
                    <span className={styles.sectionName}>{label}</span>
                    <span className={styles.sectionScore}>{val}%</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full"
                        style={{
                            width: `${val}%`,
                            backgroundColor: getScoreColor(val)
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    {!result && (
                        <div className={styles.hero}>
                            <span className={styles.badge}>
                                <span>📊</span> AI Resume Audit
                            </span>
                            <h1 className={styles.title}>
                                Check Your Resume&apos;s <span className={styles.highlight}>ATS Score</span>
                            </h1>
                            <p className={styles.subtitle}>
                                Get instant expert feedback. Paste a job description for a targeted match, or leave empty for a general quality audit.
                            </p>
                        </div>
                    )}

                    {!result && (
                        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '2rem', flexDirection: 'column' }}>

                            {/* JD Input */}
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                    <label style={{ display: 'block', color: '#ccc', fontWeight: 500 }}>
                                        1. Job Description (Optional)
                                    </label>
                                    <button
                                        onClick={useSampleJD}
                                        style={{ background: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                    >
                                        Use Sample
                                    </button>
                                </div>
                                <textarea
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                    placeholder="Paste job description here for a targeted match... (Leave empty for general audit)"
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            {/* Upload Section */}
                            <div className={styles.uploadSection} style={{ width: '100%', maxWidth: '100%' }}>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    2. Upload Resume (PDF)
                                </label>
                                <div
                                    className={`${styles.dropzone} ${dragActive ? styles.active : ''} ${file ? styles.hasFile : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => !file && document.getElementById('fileInput')?.click()}
                                >
                                    {!file ? (
                                        <>
                                            <div className={styles.dropzoneIcon}>📄</div>
                                            <h3 className={styles.dropzoneTitle}>Drop your resume here</h3>
                                            <p className={styles.dropzoneText}>or click to browse</p>
                                            <input
                                                id="fileInput"
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                onClick={(e) => (e.target as HTMLInputElement).value = ''}
                                                className={styles.fileInput}
                                            />
                                        </>
                                    ) : (
                                        <div className={styles.filePreview}>
                                            <div className={styles.fileIcon}>📑</div>
                                            <div className={styles.fileInfo}>
                                                <span className={styles.fileName}>{file.name}</span>
                                                <span className={styles.fileSize}>
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setFile(null); setFileUrl(null); }}
                                                className={styles.removeFile}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {error && <div style={{ color: '#ff4757', textAlign: 'center', fontWeight: 500, marginTop: '1rem' }}>{error}</div>}

                                {file && !analyzing && (
                                    <button onClick={analyzeFile} className={styles.analyzeBtn}>
                                        <span>🔍</span> {jdText ? 'Check Compliance' : 'Audit Quality'}
                                    </button>
                                )}

                                {analyzing && (
                                    <div className={styles.progressSection} style={{ marginTop: '2rem' }}>
                                        <div style={{ height: '6px', width: '100%', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div
                                                style={{ width: `${progress}%`, height: '100%', background: '#C4F82A', transition: 'width 0.2s ease' }}
                                            ></div>
                                        </div>
                                        <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                            Scanning resume...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {result && fileUrl && (
                        /* Split View Layout */
                        <div className={styles.splitLayout}>
                            {/* Left: Resume Preview - PDF Iframe */}
                            <div className={styles.resumePreviewContainer}>
                                <div className={styles.previewHeader}>
                                    <span>DOCUMENT PREVIEW</span>
                                    <span>{file?.name}</span>
                                </div>
                                <iframe
                                    src={fileUrl}
                                    className={styles.pdfFrame}
                                    title="Resume Preview"
                                />
                            </div>

                            {/* Right: Analysis Panel */}
                            <div className={styles.analysisPanel}>
                                {/* Score Card */}
                                <div className={styles.scoreCard}>
                                    <div className={styles.scoreHeader}>
                                        <div>
                                            <h2 className={styles.scoreTitle}>
                                                {result.mode === 'jd_match' ? 'Match Score' : 'Quality Score'}
                                            </h2>
                                            <p className={styles.scoreRating} style={{ color: getScoreColor(result.total_score) }}>
                                                {result.total_score >= 80 ? 'Top Tier' : result.total_score >= 60 ? 'Competitive' : 'Needs Optimization'}
                                            </p>
                                        </div>
                                        <button onClick={resetAnalysis} className={styles.newScan}>
                                            📄 New Scan
                                        </button>
                                    </div>

                                    <div className={styles.scoreCircleContainer}>
                                        <div className={styles.scoreCircle}>
                                            <svg viewBox="0 0 120 120" className={styles.circleSvg}>
                                                <circle
                                                    cx="60"
                                                    cy="60"
                                                    r="54"
                                                    fill="none"
                                                    stroke="#374151" /* Darker track */
                                                    strokeWidth="8"
                                                />
                                                <circle
                                                    cx="60"
                                                    cy="60"
                                                    r="54"
                                                    fill="none"
                                                    stroke={getScoreColor(result.total_score)}
                                                    strokeWidth="8"
                                                    strokeLinecap="round"
                                                    strokeDasharray="339.3"
                                                    strokeDashoffset={339.3 - (339.3 * result.total_score) / 100}
                                                />
                                            </svg>
                                            <div className={styles.scoreValue}>
                                                <span className={styles.scoreNumber}>{Math.round(result.total_score)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section Breakdown */}
                                <div className={styles.breakdownCard}>
                                    <h3 className={styles.cardTitle}>📋 Detailed Breakdown</h3>
                                    <div className={styles.sectionsList}>
                                        {result.mode === 'jd_match' ? (
                                            <>
                                                {renderScoreBar("Keyword Matches", "🔑", result.breakdown.keyword_match)}
                                                {renderScoreBar("Context Accuracy", "🧠", result.breakdown.semantic_match)}
                                                {renderScoreBar("Formatting", "📄", result.breakdown.format_score)}
                                            </>
                                        ) : (
                                            <>
                                                {renderScoreBar("Impact & Metrics", "📈", result.breakdown.impact_score)}
                                                {renderScoreBar("Section Completeness", "📝", result.breakdown.section_score)}
                                                {renderScoreBar("Skill Density", "🛠️", result.breakdown.skill_score)}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Missing Keywords (Only for Match Mode) */}
                                {result.mode === 'jd_match' && (
                                    <div className={styles.keywordsCard}>
                                        <h3 className={styles.cardTitle}>❌ Missing Critical Skills</h3>
                                        <p className="text-sm text-gray-400 mb-3">Your resume is missing these key requirements found in the job description:</p>
                                        <div className={styles.keywordTags}>
                                            {result.missing_keywords && result.missing_keywords.length > 0 ? (
                                                result.missing_keywords.map((keyword, index) => (
                                                    <span key={index} className={`${styles.keywordTag} ${styles.missing}`}>
                                                        {keyword}
                                                    </span>
                                                ))
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#C4F82A' }}>
                                                    <span>✅</span>
                                                    <span>All key skills present!</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* CTA */}
                                <div className={styles.ctaCard}>
                                    <h3 style={{ marginBottom: '1rem', color: 'white' }}>Want to reach 100%?</h3>
                                    <div className={styles.ctaButtons}>
                                        <Link href="/resume-builder" className={styles.primaryCta}>
                                            🎯 Optimize with AI Builder
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
