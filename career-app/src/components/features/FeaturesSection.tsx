'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './FeaturesSection.module.css';

const mainFeatures = [
    {
        icon: '📊',
        iconBg: 'purple',
        badge: 'FREE',
        title: 'ATS Score Checker',
        description: 'Get your real ATS score in 60 seconds. No fake numbers, only database-driven analysis based on thousands of successful resumes.',
        features: [
            'Instant ATS compatibility score',
            'Keyword match analysis',
            'Format & structure check',
            'One-click improvements'
        ],
        cta: 'Check Your Score Now',
        href: '/ats-checker',
        highlight: true
    },
    {
        icon: '📝',
        iconBg: 'green',
        badge: 'CORE',
        title: 'AI Resume Builder',
        description: 'Target company-specific resume creation. We analyze thousands of successful resumes to build yours.',
        features: [
            'Company-specific keywords',
            'Real success pattern matching',
            'Live editor & preview',
            'Export to PDF/DOCX'
        ],
        cta: 'Build Your Resume',
        href: '/resume-builder',
        highlight: false
    }
];

const secondaryFeatures = [
    {
        icon: '🚀',
        iconBg: 'orange',
        title: 'AI Auto Apply',
        description: 'Smart job application automation with deadline tracking and best-match resume selection.',
        href: '/auto-apply'
    },
    {
        icon: '🎤',
        iconBg: 'purple',
        title: 'AI Mock Interviews',
        description: 'Practice with our AI interviewer. Get feedback on your answers and improve.',
        href: '/mock-interview'
    },
    {
        icon: '✉️',
        iconBg: 'green',
        title: 'AI Cover Letters',
        description: 'Generate personalized cover letters tailored to each job description.',
        href: '/cover-letter'
    }
];

const HEADING_TEXT = 'Everything You Need to Get Hired';

export default function FeaturesSection() {
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const el = headingRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add(styles.revealed);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.8 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section className={styles.features}>
            <div className={styles.container}>
                {/* Section Header */}
                <div className={styles.header}>
                    <span className={styles.badge}>
                        <span>⚡</span> AI-Powered Tools
                    </span>
                    <h2 ref={headingRef} className={styles.title}>
                        {HEADING_TEXT.split(' ').map((word, i) => (
                            <span
                                key={i}
                                className={styles.wordReveal}
                                style={{ '--word-index': i } as React.CSSProperties}
                            >
                                {word}
                                {i < HEADING_TEXT.split(' ').length - 1 ? '\u00a0' : ''}
                            </span>
                        ))}
                    </h2>
                    <p className={styles.subtitle}>
                        From ATS optimization to auto-apply automation, we&apos;ve built the complete AI hiring toolkit for India
                    </p>
                </div>

                {/* Main Feature Cards */}
                <div className={styles.mainGrid}>
                    {mainFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className={`${styles.mainCard} ${feature.highlight ? styles.highlighted : ''}`}
                        >
                            <div className={styles.cardHeader}>
                                <div className={`${styles.icon} ${styles[feature.iconBg]}`}>
                                    {feature.icon}
                                </div>
                                <span className={`${styles.cardBadge} ${feature.badge === 'FREE' ? styles.free : ''}`}>
                                    {feature.badge}
                                </span>
                            </div>

                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDesc}>{feature.description}</p>

                            <ul className={styles.cardFeatures}>
                                {feature.features.map((item, idx) => (
                                    <li key={idx}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link href={feature.href} className={styles.cardCta}>
                                {feature.cta}
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Secondary Features */}
                <div className={styles.secondaryGrid}>
                    {secondaryFeatures.map((feature, index) => (
                        <Link key={index} href={feature.href} className={styles.secondaryCard}>
                            <div className={`${styles.icon} ${styles[feature.iconBg]}`}>
                                {feature.icon}
                            </div>
                            <div className={styles.secondaryContent}>
                                <h4 className={styles.secondaryTitle}>{feature.title}</h4>
                                <p className={styles.secondaryDesc}>{feature.description}</p>
                                <span className={styles.learnMore}>
                                    Learn More
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
