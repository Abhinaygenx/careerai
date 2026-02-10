'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: '₹0',
        period: 'forever',
        description: 'Perfect for getting started',
        features: [
            { text: '5 ATS Score Checks', included: true },
            { text: 'Basic Resume Analysis', included: true },
            { text: '3 Standard Templates', included: true },
            { text: 'Email Support', included: true },
            { text: 'AI Resume Builder', included: false },
            { text: 'AI Cover Letters', included: false },
            { text: 'Mock Interviews', included: false },
            { text: 'Auto Apply', included: false }
        ],
        cta: 'Get Started Free',
        popular: false
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '₹499',
        period: '/month',
        description: 'For serious job seekers',
        features: [
            { text: 'Unlimited ATS Checks', included: true },
            { text: 'Advanced Resume Analysis', included: true },
            { text: 'All Premium Templates', included: true },
            { text: 'Priority Support', included: true },
            { text: 'AI Resume Builder', included: true },
            { text: 'AI Cover Letters (Unlimited)', included: true },
            { text: 'Mock Interviews (50/month)', included: true },
            { text: 'Auto Apply (50 credits/month)', included: true }
        ],
        cta: 'Start 7-Day Free Trial',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For universities & colleges',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Unlimited Everything', included: true },
            { text: 'Bulk Student Onboarding', included: true },
            { text: 'Placement Cell Dashboard', included: true },
            { text: 'Custom Branding', included: true },
            { text: 'Analytics & Reports', included: true },
            { text: 'Dedicated Account Manager', included: true },
            { text: 'API Access', included: true }
        ],
        cta: 'Contact Sales',
        popular: false
    }
];

const faqs = [
    {
        question: 'How does the 7-day free trial work?',
        answer: 'You get full access to all Pro features for 7 days. No credit card required to start. You\'ll only be charged if you decide to continue after the trial.'
    },
    {
        question: 'Can I cancel anytime?',
        answer: 'Yes! There are no long-term contracts. You can cancel your subscription anytime from your dashboard. Your access continues until the end of your billing period.'
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay. All payments are secure and encrypted.'
    },
    {
        question: 'What happens to my data if I cancel?',
        answer: 'Your resumes, cover letters, and data are safely stored for 30 days after cancellation. You can export everything before that or reactivate your account to regain access.'
    },
    {
        question: 'Do you offer student discounts?',
        answer: 'Yes! Students with a valid .edu email get 30% off on Pro plans. Contact support with your student ID to claim the discount.'
    },
    {
        question: 'How is Enterprise pricing determined?',
        answer: 'Enterprise pricing is based on the number of students, required features, and support level. Contact our sales team for a custom quote tailored to your institution.'
    }
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const getPrice = (plan: typeof plans[0]) => {
        if (plan.id === 'free' || plan.id === 'enterprise') return plan.price;
        if (billingCycle === 'yearly') {
            return '₹399';
        }
        return plan.price;
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Hero */}
                    <div className={styles.hero}>
                        <h1 className={styles.title}>
                            Simple, <span className={styles.highlight}>Transparent</span> Pricing
                        </h1>
                        <p className={styles.subtitle}>
                            Start free, upgrade when you&apos;re ready. No hidden fees.
                        </p>

                        {/* Billing Toggle */}
                        <div className={styles.billingToggle}>
                            <button
                                className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.active : ''}`}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                Monthly
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${billingCycle === 'yearly' ? styles.active : ''}`}
                                onClick={() => setBillingCycle('yearly')}
                            >
                                Yearly
                                <span className={styles.saveBadge}>Save 20%</span>
                            </button>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className={styles.pricingGrid}>
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''}`}
                            >
                                {plan.popular && (
                                    <div className={styles.popularBadge}>MOST POPULAR</div>
                                )}

                                <div className={styles.cardHeader}>
                                    <h3 className={styles.planName}>{plan.name}</h3>
                                    <div className={styles.price}>
                                        <span className={styles.priceValue}>{getPrice(plan)}</span>
                                        {plan.period && (
                                            <span className={styles.pricePeriod}>
                                                {billingCycle === 'yearly' && plan.id === 'pro' ? '/month' : plan.period}
                                            </span>
                                        )}
                                    </div>
                                    {billingCycle === 'yearly' && plan.id === 'pro' && (
                                        <p className={styles.yearlyNote}>Billed ₹4,788 yearly</p>
                                    )}
                                    <p className={styles.planDesc}>{plan.description}</p>
                                </div>

                                <ul className={styles.featuresList}>
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className={feature.included ? styles.included : styles.excluded}>
                                            {feature.included ? (
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            )}
                                            {feature.text}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.id === 'enterprise' ? '/contact' : '/signup'}
                                    className={`${styles.ctaBtn} ${plan.popular ? styles.ctaPopular : ''}`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Trust Section */}
                    <div className={styles.trustSection}>
                        <div className={styles.trustItem}>
                            <span>🔒</span>
                            <span>Secure Payments via Razorpay</span>
                        </div>
                        <div className={styles.trustItem}>
                            <span>↩️</span>
                            <span>7-Day Money Back Guarantee</span>
                        </div>
                        <div className={styles.trustItem}>
                            <span>🎓</span>
                            <span>30% Student Discount Available</span>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className={styles.faqSection}>
                        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
                        <div className={styles.faqList}>
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className={`${styles.faqItem} ${expandedFaq === index ? styles.expanded : ''}`}
                                >
                                    <button
                                        className={styles.faqQuestion}
                                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    >
                                        {faq.question}
                                        <span className={styles.faqIcon}>
                                            {expandedFaq === index ? '−' : '+'}
                                        </span>
                                    </button>
                                    {expandedFaq === index && (
                                        <div className={styles.faqAnswer}>
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className={styles.ctaSection}>
                        <h2>Still have questions?</h2>
                        <p>Our team is here to help you choose the right plan</p>
                        <div className={styles.ctaButtons}>
                            <Link href="/contact" className={styles.contactBtn}>
                                Contact Sales
                            </Link>
                            <Link href="/demo" className={styles.demoBtn}>
                                Book a Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
