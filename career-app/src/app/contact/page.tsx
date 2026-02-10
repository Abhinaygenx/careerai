'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'general',
        message: ''
    });
    const [suggestionData, setSuggestionData] = useState({
        category: 'feature',
        suggestion: '',
        priority: 'medium'
    });
    const [activeTab, setActiveTab] = useState<'contact' | 'suggestion'>('contact');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleContactSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'contact', data: formData }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send message');
            }

            setSubmitted(true);
            // Reset form after 4 seconds
            setTimeout(() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', subject: 'general', message: '' });
            }, 4000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuggestionSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'suggestion', data: suggestionData }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit suggestion');
            }

            setSubmitted(true);
            // Reset form after 4 seconds
            setTimeout(() => {
                setSubmitted(false);
                setSuggestionData({ category: 'feature', suggestion: '', priority: 'medium' });
            }, 4000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Hero Section */}
                    <div className={styles.hero}>
                        <div className={styles.heroBadge}>
                            <span>💬</span> We'd Love to Hear From You
                        </div>
                        <h1 className={styles.title}>
                            Get in <span className={styles.highlight}>Touch</span>
                        </h1>
                        <p className={styles.subtitle}>
                            Have questions, feedback, or suggestions? We're here to help you succeed in your career journey.
                        </p>
                    </div>

                    <div className={styles.contentGrid}>
                        {/* Contact Info Card */}
                        <div className={styles.infoSection}>
                            <div className={styles.infoCard}>
                                <div className={styles.infoIcon}>📧</div>
                                <h3>Email Us</h3>
                                <p>Reach out directly to our founder</p>
                                <a href="mailto:abhinaykumar5432@gmail.com" className={styles.emailLink}>
                                    abhinaykumar5432@gmail.com
                                </a>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.infoIcon}>⏰</div>
                                <h3>Response Time</h3>
                                <p>We typically respond within</p>
                                <span className={styles.responseTime}>24-48 hours</span>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.infoIcon}>🚀</div>
                                <h3>Early Startup</h3>
                                <p>We're growing and value your input!</p>
                                <span className={styles.startupBadge}>Your feedback shapes our future</span>
                            </div>

                            <div className={styles.socialSection}>
                                <h4>Connect With Us</h4>
                                <div className={styles.socialLinks}>
                                    <a href="#" className={styles.socialLink} aria-label="Twitter">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </a>
                                    <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                                        </svg>
                                    </a>
                                    <a href="#" className={styles.socialLink} aria-label="Instagram">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className={styles.formSection}>
                            {/* Tab Switcher */}
                            <div className={styles.tabSwitcher}>
                                <button
                                    className={`${styles.tab} ${activeTab === 'contact' ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab('contact')}
                                >
                                    <span>✉️</span> Contact Us
                                </button>
                                <button
                                    className={`${styles.tab} ${activeTab === 'suggestion' ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab('suggestion')}
                                >
                                    <span>💡</span> Share Suggestion
                                </button>
                            </div>

                            {error && (
                                <div className={styles.errorMessage}>
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            {submitted ? (
                                <div className={styles.successMessage}>
                                    <div className={styles.successIcon}>✅</div>
                                    <h3>Thank You!</h3>
                                    <p>
                                        {activeTab === 'contact'
                                            ? "We've received your message and will get back to you soon!"
                                            : "Your suggestion has been submitted. We appreciate your feedback!"}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Contact Form */}
                                    {activeTab === 'contact' && (
                                        <form onSubmit={handleContactSubmit} className={styles.form}>
                                            <div className={styles.formGroup}>
                                                <label htmlFor="name">Your Name</label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label htmlFor="email">Email Address</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label htmlFor="subject">Subject</label>
                                                <select
                                                    id="subject"
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                >
                                                    <option value="general">General Inquiry</option>
                                                    <option value="support">Technical Support</option>
                                                    <option value="billing">Billing Question</option>
                                                    <option value="partnership">Partnership Opportunity</option>
                                                    <option value="feedback">Product Feedback</option>
                                                </select>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label htmlFor="message">Message</label>
                                                <textarea
                                                    id="message"
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    placeholder="Tell us how we can help you..."
                                                    rows={5}
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className={styles.submitBtn}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className={styles.spinner}></span>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    'Send Message'
                                                )}
                                            </button>
                                        </form>
                                    )}

                                    {/* Suggestion Form */}
                                    {activeTab === 'suggestion' && (
                                        <form onSubmit={handleSuggestionSubmit} className={styles.form}>
                                            <div className={styles.suggestionIntro}>
                                                <p>🌟 As an early-stage startup, your suggestions help us build the best career platform for you!</p>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label htmlFor="category">Suggestion Category</label>
                                                <select
                                                    id="category"
                                                    value={suggestionData.category}
                                                    onChange={(e) => setSuggestionData({ ...suggestionData, category: e.target.value })}
                                                >
                                                    <option value="feature">New Feature Request</option>
                                                    <option value="improvement">Improve Existing Feature</option>
                                                    <option value="ui">User Interface / Design</option>
                                                    <option value="performance">Performance / Speed</option>
                                                    <option value="content">Content / Resources</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label htmlFor="priority">How important is this to you?</label>
                                                <div className={styles.priorityOptions}>
                                                    {['low', 'medium', 'high'].map((priority) => (
                                                        <button
                                                            key={priority}
                                                            type="button"
                                                            className={`${styles.priorityBtn} ${suggestionData.priority === priority ? styles.activePriority : ''} ${styles[priority]}`}
                                                            onClick={() => setSuggestionData({ ...suggestionData, priority })}
                                                        >
                                                            {priority === 'low' && '😊 Nice to Have'}
                                                            {priority === 'medium' && '👍 Would Help'}
                                                            {priority === 'high' && '🔥 Really Need This'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label htmlFor="suggestion">Your Suggestion</label>
                                                <textarea
                                                    id="suggestion"
                                                    value={suggestionData.suggestion}
                                                    onChange={(e) => setSuggestionData({ ...suggestionData, suggestion: e.target.value })}
                                                    placeholder="Tell us what would make Career.ai even better for you. Be as detailed as you'd like!"
                                                    rows={6}
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className={styles.submitBtn}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className={styles.spinner}></span>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    'Submit Suggestion'
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* FAQ Preview */}
                    <div className={styles.faqPreview}>
                        <h2>Quick Help</h2>
                        <div className={styles.faqGrid}>
                            <div className={styles.faqItem}>
                                <h4>How do I reset my password?</h4>
                                <p>Click on "Forgot Password" on the login page and follow the email instructions.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h4>Can I get a refund?</h4>
                                <p>Yes! We offer a 7-day money-back guarantee on all paid plans.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h4>Is my data secure?</h4>
                                <p>Absolutely. We use industry-standard encryption and never share your information.</p>
                            </div>
                        </div>
                        <Link href="/pricing" className={styles.faqLink}>
                            View All FAQs →
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
