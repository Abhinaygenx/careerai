import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            {/* CTA Section */}
            <div className={styles.cta}>
                <div className={styles.ctaContent}>
                    <h2 className={styles.ctaTitle}>Ready to Land Your Dream Job?</h2>
                    <p className={styles.ctaSubtitle}>
                        Join 50,000+ students who are getting hired faster with Career.ai
                    </p>
                    <div className={styles.ctaActions}>
                        <Link href="/signup" className={styles.ctaButton}>
                            Check Your ATS Score Free
                        </Link>
                        <Link href="/demo" className={styles.ctaSecondary}>
                            Book a Demo
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        {/* Brand Column */}
                        <div className={styles.brand}>
                            <Link href="/" className={styles.logo}>
                                <span className={styles.logoIcon}>🎯</span>
                                <span className={styles.logoText}>Career<span className={styles.logoAi}>.ai</span></span>
                            </Link>
                            <p className={styles.brandDesc}>
                                India&apos;s #1 AI-powered hiring platform. Get hired faster with intelligent resume optimization and career tools.
                            </p>
                            <div className={styles.social}>
                                <a href="#" className={styles.socialLink} aria-label="Twitter">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                                    </svg>
                                </a>
                                <a href="#" className={styles.socialLink} aria-label="Instagram">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
                                    </svg>
                                </a>
                                <a href="#" className={styles.socialLink} aria-label="YouTube">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Products */}
                        <div className={styles.column}>
                            <h3 className={styles.columnTitle}>Products</h3>
                            <ul className={styles.columnLinks}>
                                <li><Link href="/ats-checker">ATS Score Checker</Link></li>
                                <li><Link href="/resume-builder">AI Resume Builder</Link></li>
                                <li><Link href="/cover-letter">AI Cover Letters</Link></li>
                                <li><Link href="/mock-interview">AI Mock Interviews</Link></li>
                                <li><Link href="/auto-apply">AI Auto Apply</Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div className={styles.column}>
                            <h3 className={styles.columnTitle}>Resources</h3>
                            <ul className={styles.columnLinks}>
                                <li><Link href="/blog">Blog</Link></li>
                                <li><Link href="/guides">Career Guides</Link></li>
                                <li><Link href="/resume-examples">Resume Examples</Link></li>
                                <li><Link href="/interview-tips">Interview Tips</Link></li>
                                <li><Link href="/salary-guide">Salary Guide</Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div className={styles.column}>
                            <h3 className={styles.columnTitle}>Company</h3>
                            <ul className={styles.columnLinks}>
                                <li><Link href="/about">About Us</Link></li>
                                <li><Link href="/colleges">For Colleges</Link></li>
                                <li><Link href="/enterprise">Enterprise</Link></li>
                                <li><Link href="/careers">Careers</Link></li>
                                <li><Link href="/contact">Contact</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className={styles.column}>
                            <h3 className={styles.columnTitle}>Legal</h3>
                            <ul className={styles.columnLinks}>
                                <li><Link href="/privacy">Privacy Policy</Link></li>
                                <li><Link href="/terms">Terms of Service</Link></li>
                                <li><Link href="/refund">Refund Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className={styles.bottom}>
                <div className={styles.container}>
                    <p className={styles.copyright}>
                        © 2024 Career.ai. All rights reserved. Made with ❤️ in India
                    </p>
                </div>
            </div>
        </footer>
    );
}
