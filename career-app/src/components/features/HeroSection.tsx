'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HeroSection.module.css';
import confetti from 'canvas-confetti';

export default function HeroSection() {
    const [isHovered, setIsHovered] = useState(false);

    const handleInteractionStart = () => {
        setIsHovered(true);
        const rect = document.getElementById('score-card')?.getBoundingClientRect();
        if (rect) {
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { x, y },
                colors: ['#C4F82A', '#059669', '#ffffff'],
                disableForReducedMotion: true,
                zIndex: 1000,
            });
        }
    };

    const handleInteractionEnd = () => {
        setIsHovered(false);
    };

    return (
        <section className={styles.hero}>
            {/* Dot Grid Background */}
            <div className={styles.dotGrid}></div>

            <div className={styles.container}>
                {/* Left Content */}
                <div className={styles.content}>
                    {/* Section Label */}
                    <div className={`${styles.label} ${styles.animateFadeUp}`} style={{ animationDelay: '0.1s' }}>
                        <span className={styles.dot}></span>
                        <span>CAREER INTELLIGENCE PLATFORM</span>
                    </div>

                    {/* Headline */}
                    <h1 className={styles.title}>
                        <span className={styles.animateFadeUp} style={{ animationDelay: '0.2s', display: 'inline-block' }}>Get Hired Faster with </span>{' '}
                        <span className={`${styles.highlight} ${styles.animateFadeUp}`} style={{ animationDelay: '0.3s', display: 'inline-block' }}>AI-Powered</span><br />
                        <span className={styles.animateFadeUp} style={{ animationDelay: '0.4s', display: 'inline-block' }}>Career Tools</span>
                    </h1>

                    {/* Subtitle */}
                    <p className={`${styles.subtitle} ${styles.animateFadeUp}`} style={{ animationDelay: '0.5s' }}>
                        We&apos;ve helped over 50,000 students land their dream jobs.
                        Beat ATS systems, build winning resumes, and auto-apply
                        to hundreds of opportunities.
                    </p>

                    {/* CTA Buttons */}
                    <div className={`${styles.cta} ${styles.animateFadeUp}`} style={{ animationDelay: '0.6s' }}>
                        <Link href="/ats-checker" className={styles.primaryBtn}>
                            Check Your ATS Score
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <Link href="/demo" className={styles.secondaryBtn}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M3 2L14 8L3 14V2Z" fill="currentColor" />
                            </svg>
                            Watch Demo
                        </Link>
                    </div>

                    {/* Trust Badge */}
                    <div className={`${styles.trust} ${styles.animateFadeUp}`} style={{ animationDelay: '0.7s' }}>
                        <div className={styles.avatars}>
                            <div className={styles.avatar}>👨‍💼</div>
                            <div className={styles.avatar}>👩‍💻</div>
                            <div className={styles.avatar}>👨‍🎓</div>
                        </div>
                        <span className={styles.trustText}>
                            <strong>50,000+</strong> students across India trust us
                        </span>
                    </div>
                </div>

                {/* Right Side - Floating Preview Cards */}
                <div className={styles.preview}>
                    {/* Main Score Card */}
                    <div
                        id="score-card"
                        className={`${styles.scoreCard} ${isHovered ? styles.hovered : ''}`}
                        onMouseEnter={handleInteractionStart}
                        onMouseLeave={handleInteractionEnd}
                        onTouchStart={handleInteractionStart}
                        onTouchEnd={handleInteractionEnd}
                        onTouchCancel={handleInteractionEnd}
                    >
                        <div className={styles.scoreHeader}>
                            <span className={styles.scoreLabel}>Your ATS Score</span>
                            <span className={`${styles.scoreBadge} ${isHovered ? styles.excellentBadge : ''}`}>
                                {isHovered ? 'Excellent' : 'Good'}
                            </span>
                        </div>

                        <div className={styles.scoreCircle}>
                            <svg viewBox="0 0 120 120" className={styles.circleSvg}>
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    stroke="#F0F2F5"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray="339.3"
                                    strokeDashoffset={isHovered ? "0" : "50.9"}
                                    className={styles.progressCircle}
                                />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#C4F82A" />
                                        <stop offset="100%" stopColor="#9EE01A" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className={styles.scoreValue}>
                                <span className={styles.scoreNumber}>
                                    {isHovered ? '100' : '85'}
                                </span>
                                <span className={styles.scorePercent}>%</span>
                            </div>
                        </div>

                        <div className={styles.scoreMetrics}>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>Keyword Match</span>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricFill} style={{ width: isHovered ? '100%' : '78%' }}></div>
                                </div>
                                <span className={styles.metricValue}>{isHovered ? '100%' : '78%'}</span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>Format Score</span>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricFill} style={{ width: isHovered ? '100%' : '92%' }}></div>
                                </div>
                                <span className={styles.metricValue}>{isHovered ? '100%' : '92%'}</span>
                            </div>
                        </div>

                        <Link href="/ats-checker" className={styles.scoreBtn}>
                            Get Full Analysis →
                        </Link>
                    </div>


                    {/* Floating Badge 1 */}
                    <div className={styles.floatingCard1}>
                        <span className={styles.floatingIcon}>📊</span>
                        <span>ATS Optimized</span>
                    </div>

                    {/* Floating Badge 2 */}
                    <div className={styles.floatingCard2}>
                        <span className={styles.floatingIcon}>✓</span>
                        <span>85% Match Rate</span>
                    </div>
                </div>
            </div>

            {/* Trusted Companies Ticker */}
            <div className={styles.trustedWrapper}>
                <p className={styles.trustedLabel}>Trusted by students placed at top companies</p>
                <div className={styles.tickerWrapper}>
                    <div className={styles.tickerContent}>
                        {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Adobe', 'Spotify', 'Airbnb', 'CRED', 'Zoom', 'Salesforce', 'Oracle', 'Intuit', 'Swiggy', 'Zomato'].map((company) => (
                            <span key={company} className={styles.companyLogo}>
                                {company}
                            </span>
                        ))}
                        {/* Duplicate for seamless scrolling */}
                        {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Adobe', 'Spotify', 'Airbnb', 'CRED', 'Zoom', 'Salesforce', 'Oracle', 'Intuit', 'Swiggy', 'Zomato'].map((company) => (
                            <span key={`${company}-dup`} className={styles.companyLogo}>
                                {company}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section >
    );
}
