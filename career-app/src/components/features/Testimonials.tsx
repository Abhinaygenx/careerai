'use client';

import { useState } from 'react';
import styles from './Testimonials.module.css';

const testimonials = [
    {
        name: 'Rahul Sharma',
        role: 'SDE at Microsoft',
        college: 'IIT Bombay',
        avatar: '👨‍💻',
        rating: 5,
        text: 'This is by far the best ATS tool I\'ve used. My score went from 45 to 89 in just 3 days. Got 6 interview calls within a week. Worth every rupee!'
    },
    {
        name: 'Priya Patel',
        role: 'Product Manager at Google',
        college: 'IIM Ahmedabad',
        avatar: '👩‍💼',
        rating: 5,
        text: 'The resume builder is magical. It analyzed my target company and gave specific suggestions. I landed a PM role at Google within 2 months.'
    },
    {
        name: 'Arjun Reddy',
        role: 'Data Scientist at Amazon',
        college: 'BITS Pilani',
        avatar: '👨‍🔬',
        rating: 5,
        text: 'Was skeptical at first, but the AI suggestions are genuinely helpful. Not random fluff. Each recommendation is backed by real data.'
    },
    {
        name: 'Sneha Kumar',
        role: 'Frontend Developer at Flipkart',
        college: 'NIT Trichy',
        avatar: '👩‍💻',
        rating: 5,
        text: 'The auto-apply feature saved me 20+ hours per week. Applied to 100+ companies with tailored resumes. Game changer for freshers!'
    },
    {
        name: 'Vikram Singh',
        role: 'Consultant at McKinsey',
        college: 'ISB Hyderabad',
        avatar: '👔',
        rating: 5,
        text: 'Finally a product made for India. Understands our job market, our colleges, our hiring patterns. The mock interviews helped me crack MBB.'
    }
];

export default function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0);

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Loved by Students Across India</h2>
                    <p className={styles.subtitle}>
                        Real stories from real users who got hired
                    </p>
                </div>

                <div className={styles.carousel}>
                    <button onClick={prevSlide} className={styles.navBtn} aria-label="Previous">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className={styles.track}>
                        {testimonials.map((testimonial, index) => {
                            const offset = index - activeIndex;
                            const isActive = index === activeIndex;

                            return (
                                <div
                                    key={index}
                                    className={`${styles.card} ${isActive ? styles.active : ''}`}
                                    style={{
                                        transform: `translateX(${offset * 100}%) scale(${isActive ? 1 : 0.9})`,
                                        opacity: Math.abs(offset) > 1 ? 0 : 1,
                                        zIndex: isActive ? 2 : 1
                                    }}
                                >
                                    <div className={styles.rating}>
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} className={styles.star}>⭐</span>
                                        ))}
                                    </div>

                                    <p className={styles.text}>&ldquo;{testimonial.text}&rdquo;</p>

                                    <div className={styles.author}>
                                        <div className={styles.avatar}>{testimonial.avatar}</div>
                                        <div className={styles.authorInfo}>
                                            <span className={styles.authorName}>{testimonial.name}</span>
                                            <span className={styles.authorRole}>{testimonial.role}</span>
                                            <span className={styles.authorCollege}>{testimonial.college}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button onClick={nextSlide} className={styles.navBtn} aria-label="Next">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className={styles.dots}>
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.dot} ${index === activeIndex ? styles.activeDot : ''}`}
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
