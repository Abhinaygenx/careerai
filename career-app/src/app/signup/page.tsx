'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from '../login/page.module.css';

export default function SignupPage() {
    const { signupWithEmail, signInWithGoogle, user, loading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!acceptTerms) {
            setError('Please accept the terms and conditions');
            return;
        }

        setIsLoading(true);

        try {
            await signupWithEmail(formData.email, formData.password);
            // In a real app, we would update the user profile with the name here
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to sign up with Google');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Left Side - Form */}
                <div className={styles.formSection}>
                    <Link href="/" className={styles.logo}>
                        <span>🎯</span>
                        <span>Career<span className={styles.logoAi}>.ai</span></span>
                    </Link>

                    <div className={styles.formContainer}>
                        <h1 className={styles.title}>Create your account</h1>
                        <p className={styles.subtitle}>Start your journey to landing your dream job</p>

                        {error && <div className={styles.error}>{error}</div>}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Full name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter your email"
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Create a password"
                                    className={styles.input}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm password</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Confirm your password"
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        style={{ marginTop: '3px' }}
                                    />
                                    <span>
                                        I agree to the{' '}
                                        <Link href="/terms" style={{ color: 'var(--primary)' }}>Terms of Service</Link>
                                        {' '}and{' '}
                                        <Link href="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>
                                    </span>
                                </label>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        Creating account...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </button>
                        </form>

                        <div className={styles.divider}>
                            <span>or continue with</span>
                        </div>

                        <div className={styles.socialButtons}>
                            <button className={styles.socialBtn} onClick={handleGoogleSignIn} type="button">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button className={styles.socialBtn} type="button" onClick={() => { }}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="#0A66C2">
                                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                                </svg>
                                LinkedIn
                            </button>
                        </div>

                        <p className={styles.switchText}>
                            Already have an account?{' '}
                            <Link href="/login" className={styles.switchLink}>Sign in</Link>
                        </p>
                    </div>
                </div>

                {/* Right Side - Illustration */}
                <div className={styles.illustrationSection}>
                    <div className={styles.illustrationContent}>
                        <div className={styles.statsCard}>
                            <div className={styles.statsHeader}>
                                <span>🚀</span>
                                <span>Get Started Today</span>
                            </div>
                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>Free</span>
                                    <span className={styles.statLabel}>To Start</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>5</span>
                                    <span className={styles.statLabel}>ATS Scans</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>∞</span>
                                    <span className={styles.statLabel}>Possibilities</span>
                                </div>
                            </div>
                        </div>

                        <h2 className={styles.illustrationTitle}>
                            Join 50,000+ job seekers
                        </h2>
                        <p className={styles.illustrationText}>
                            Get AI-powered tools to optimize your resume and land interviews faster
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
