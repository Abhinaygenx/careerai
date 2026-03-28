'use client';

import { useState, useRef, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

interface ScoreBreakdown {
    semantic: number;
    keyword: number;
    format: number;
}

interface BulletPointRewrite {
    original: string;
    suggested: string;
}

interface ATSResult {
    overall_score: number;
    breakdown: ScoreBreakdown;
    matched_keywords: string[];
    missing_keywords: string[];
    sections_detected: Record<string, boolean>;
    word_count: number;
    
    // Phase 2 Antigravity Logic
    top_improvement: string;
    missing_critical_skills: string[];
    bullet_point_rewrite: BulletPointRewrite;
    formatting_tip: string;
    
    star_analysis: string;
    ai_powered: boolean;
    model_used: string;
}

function ScoreGauge({ score, size = 180 }: { score: number; size?: number }) {
    const radius = (size - 20) / 2;
    const circumference = radius * Math.PI;
    const progress = (score / 100) * circumference;
    const color =
        score >= 80 ? '#C4F82A' : score >= 60 ? '#4DA3FF' : score >= 40 ? '#FF9F43' : '#FF6B9D';

    return (
        <div className={styles.gauge} style={{ width: size, height: size / 2 + 30 }}>
            <svg width={size} height={size / 2 + 10} overflow="visible">
                <path
                    d={`M 10,${size / 2} A ${radius},${radius} 0 0,1 ${size - 10},${size / 2}`}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                <path
                    d={`M 10,${size / 2} A ${radius},${radius} 0 0,1 ${size - 10},${size / 2}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${progress} ${circumference}`}
                    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${color}66)` }}
                />
                <text
                    x={size / 2}
                    y={size / 2 - 4}
                    textAnchor="middle"
                    fill={color}
                    fontSize="42"
                    fontWeight="700"
                    fontFamily="var(--font-body)"
                >
                    {score}
                </text>
                <text
                    x={size / 2}
                    y={size / 2 + 18}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize="13"
                    fontFamily="var(--font-body)"
                >
                    ATS SCORE
                </text>
            </svg>
        </div>
    );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
    const grade =
        value >= 80 ? 'Excellent' : value >= 65 ? 'Good' : value >= 45 ? 'Fair' : 'Poor';
    return (
        <div className={styles.scoreBar}>
            <div className={styles.scoreBarHeader}>
                <span className={styles.scoreBarLabel}>{label}</span>
                <span className={styles.scoreBarValue} style={{ color }}>
                    {value}% <span className={styles.scoreGrade}>{grade}</span>
                </span>
            </div>
            <div className={styles.scoreBarTrack}>
                <div
                    className={styles.scoreBarFill}
                    style={{
                        width: `${value}%`,
                        background: color,
                        boxShadow: `0 0 10px ${color}55`,
                    }}
                />
            </div>
        </div>
    );
}

export default function ATSCheckerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ATSResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((f: File) => {
        if (!f.name.toLowerCase().endsWith('.pdf')) {
            setError('Please upload a PDF file.');
            return;
        }
        setFile(f);
        setError(null);
        setResult(null);
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
        },
        [handleFile]
    );

    const analyze = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const form = new FormData();
            form.append('resume', file);
            form.append('job_description', jobDescription);

            const res = await fetch('/api/analyze-resume', { method: 'POST', body: form });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Analysis failed');
                if (data.hint) setError(`${data.error}\n\nHint: ${data.hint}`);
            } else {
                setResult(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Network error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const scoreColor = result
        ? result.overall_score >= 80
            ? '#C4F82A'
            : result.overall_score >= 60
              ? '#4DA3FF'
              : result.overall_score >= 40
                ? '#FF9F43'
                : '#FF6B9D'
        : '#C4F82A';

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.heroSection}>
                    <div className={styles.heroBadge}>
                        <span>⚡</span> Powered by Docling + Llama-3
                    </div>
                    <h1 className={styles.heroTitle}>
                        ATS Resume <span className={styles.heroAccent}>Intelligence</span>
                    </h1>
                    <p className={styles.heroSub}>
                        Advanced Antigravity Logic. Zero cloud bills. Local inference, enterprise results.
                    </p>
                </div>

                <div className={styles.layout}>
                    {/* ── Left Panel ── */}
                    <div className={styles.leftPanel}>
                        <div
                            className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                style={{ display: 'none' }}
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                key={file?.name}
                            />
                            {file ? (
                                <div className={styles.fileInfo}>
                                    <span className={styles.fileIcon}>📄</span>
                                    <div>
                                        <div className={styles.fileName}>{file.name}</div>
                                        <div className={styles.fileSize}>
                                            {(file.size / 1024).toFixed(1)} KB — Click to change
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.uploadIcon}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </div>
                                    <p className={styles.uploadTitle}>Drop your resume here</p>
                                    <p className={styles.uploadSub}>PDF files only · Max 10MB</p>
                                </>
                            )}
                        </div>

                        <div className={styles.jdSection}>
                            <label className={styles.jdLabel}>
                                <span>📋</span> Job Description
                                <span className={styles.optionalBadge}>Optional — boosts accuracy</span>
                            </label>
                            <textarea
                                className={styles.jdTextarea}
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here for keyword matching and targeted feedback..."
                                rows={7}
                            />
                        </div>

                        <button
                            className={styles.analyzeBtn}
                            onClick={analyze}
                            disabled={!file || isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <>
                                    <span className={styles.btnSpinner} />
                                    Analyzing with AI...
                                </>
                            ) : (
                                <>
                                    <span>🔍</span> Analyze Resume
                                </>
                            )}
                        </button>

                        <div className={styles.stackInfo}>
                            <div className={styles.stackItem}><span>🧠</span> Docling / BGE-small-en</div>
                            <div className={styles.stackItem}><span>⚡</span> Llama-3-8B via Groq</div>
                            <div className={styles.stackItem}><span>🗄️</span> ChromaDB Persistent</div>
                        </div>
                    </div>

                    {/* ── Right Panel ── */}
                    <div className={styles.rightPanel}>
                        {error && (
                            <div className={styles.errorCard}>
                                <span>⚠️</span>
                                <div>
                                    {error.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className={styles.loadingState}>
                                <div className={styles.loadingOrb} />
                                <div className={styles.loadingText}>
                                    <p className={styles.loadingTitle}>Analyzing Your Resume</p>
                                    <p className={styles.loadingSteps}>Docling Extraction → Embeddings → Groq JSON Validation</p>
                                </div>
                                <div className={styles.loadingSkeleton}>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={styles.skeletonItem}>
                                            <div className={styles.skeletonLabel} style={{ width: `${60 + i * 15}%` }} />
                                            <div className={styles.skeletonBar} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!result && !isAnalyzing && !error && (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 8v4l3 3" />
                                    </svg>
                                </div>
                                <h3>Your analysis will appear here</h3>
                                <p>Upload a PDF resume and click Analyze for a detailed ATS breakdown</p>
                                <div className={styles.emptyFeatures}>
                                    <div className={styles.emptyFeature}><span>✦</span> Skill Gap Analysis</div>
                                    <div className={styles.emptyFeature}><span>✦</span> Impact Auditor (STAR Method)</div>
                                    <div className={styles.emptyFeature}><span>✦</span> Semantic Keyword Injector</div>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className={styles.results}>
                                {/* Score Header */}
                                <div className={styles.scoreHeader} style={{ borderColor: `${scoreColor}33` }}>
                                    <ScoreGauge score={result.overall_score} size={200} />
                                    <div className={styles.scoreMetaRight}>
                                        <div className={styles.scoreBadge} style={{ background: `${scoreColor}22`, color: scoreColor, borderColor: `${scoreColor}44` }}>
                                            {result.overall_score >= 80 ? '🏆 Excellent' :
                                                result.overall_score >= 65 ? '✅ Good' :
                                                result.overall_score >= 45 ? '⚡ Needs Work' : '🔴 Poor'}
                                        </div>
                                        <div className={styles.metaStat}><span>📝</span> {result.word_count} words</div>
                                        <div className={styles.metaStat}>
                                            <span>{result.ai_powered ? '🤖' : '📐'}</span>
                                            {result.ai_powered ? `AI: ${result.model_used}` : 'Rule-based analysis'}
                                        </div>
                                    </div>
                                </div>

                                {/* Score Breakdown */}
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}><span>📊</span> Score Breakdown</h3>
                                    <ScoreBar label="Semantic Match" value={result.breakdown.semantic} color="#C4F82A" />
                                    <ScoreBar label="Keyword Coverage" value={result.breakdown.keyword} color="#4DA3FF" />
                                    <ScoreBar label="Format & Structure" value={result.breakdown.format} color="#8B7CF7" />
                                </div>

                                {/* 1. The Skill Gap Analysis */}
                                {result.top_improvement && (
                                    <div className={`${styles.card} ${styles.topImprovementCard}`}>
                                        <h3 className={styles.cardTitle}><span>🎯</span> Skill Gap Analysis & Top Improvement</h3>
                                        <p className={styles.topImprovementText}>{result.top_improvement}</p>
                                        
                                        {result.missing_critical_skills?.length > 0 && (
                                            <div className={styles.missingSkillsGroup}>
                                                <span className={styles.kwGroupLabel}>CRITICAL MISSING SKILLS</span>
                                                <div className={styles.keywordChips}>
                                                    {result.missing_critical_skills.map((skill) => (
                                                        <span key={skill} className={`${styles.chip} ${styles.chipRed}`}>{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 2. The Impact Auditor (Quantification) */}
                                {result.bullet_point_rewrite?.original && (
                                    <div className={styles.card}>
                                        <h3 className={styles.cardTitle}><span>📈</span> Impact Auditor (Rewrite)</h3>
                                        <p className={styles.impactAuditorSub}>We scanned for bullet points lacking numbers or metrics (%, $, #). Here&apos;s a suggested STAR-method improvement:</p>
                                        
                                        <div className={styles.rewriteBlock}>
                                            <div className={styles.rewriteOriginal}>
                                                <div className={styles.rewriteLabel}>ORIGINAL (WEAK)</div>
                                                <p>&quot;{result.bullet_point_rewrite.original}&quot;</p>
                                            </div>
                                            <div className={styles.rewriteIcon}>↓</div>
                                            <div className={styles.rewriteSuggested}>
                                                <div className={`${styles.rewriteLabel} ${styles.rewriteLabelGreen}`}>SUGGESTED (STRONG)</div>
                                                <p>&quot;{result.bullet_point_rewrite.suggested}&quot;</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Semantic Keyword Injector */}
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}><span>🔑</span> Semantic Keyword Injector</h3>
                                    {result.matched_keywords.length > 0 && (
                                        <div className={styles.keywordGroup}>
                                            <span className={styles.kwGroupLabel}>✅ Exact Matches Found</span>
                                            <div className={styles.keywordChips}>
                                                {result.matched_keywords.map((kw) => (
                                                    <span key={kw} className={`${styles.chip} ${styles.chipGreen}`}>{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {result.missing_keywords.length > 0 && (
                                        <div className={styles.keywordGroup}>
                                            <span className={styles.kwGroupLabel}>❌ Missing JD Terms (Consider aligning phrasing)</span>
                                            <div className={styles.keywordChips}>
                                                {result.missing_keywords.map((kw) => (
                                                    <span key={kw} className={`${styles.chip} ${styles.chipRed}`}>{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Formatting & STAR Analysis */}
                                {(result.formatting_tip || result.star_analysis) && (
                                    <div className={`${styles.card} ${styles.starCard}`}>
                                        <h3 className={styles.cardTitle}><span>⭐</span> Final Thoughts</h3>
                                        {result.formatting_tip && (
                                            <div className={styles.formattingTip}>
                                                <strong>Formatting Tip:</strong> {result.formatting_tip}
                                            </div>
                                        )}
                                        {result.star_analysis && (
                                            <p className={styles.starText}>{result.star_analysis}</p>
                                        )}
                                    </div>
                                )}

                                {/* Sections Detected */}
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}><span>🗂️</span> Sections Detected</h3>
                                    <div className={styles.sections}>
                                        {Object.entries(result.sections_detected).map(([section, found]) => (
                                            <div key={section} className={`${styles.sectionItem} ${found ? styles.sectionFound : styles.sectionMissing}`}>
                                                <span>{found ? '✓' : '✗'}</span>
                                                <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
