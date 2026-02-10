import Link from 'next/link';
import styles from './PricingSection.module.css';

const plans = [
    {
        name: 'Free',
        price: '₹0',
        period: 'forever',
        description: 'Perfect for getting started',
        features: [
            '5 ATS Score Checks',
            'Basic Resume Analysis',
            'Standard Templates',
            'Email Support'
        ],
        cta: 'Start Free',
        href: '/signup',
        popular: false
    },
    {
        name: 'Pro',
        price: '₹499',
        period: '/month',
        description: 'For serious job seekers',
        features: [
            'Unlimited ATS Checks',
            'AI Resume Builder',
            'AI Cover Letter Generator',
            'AI Mock Interviews',
            'Auto-Apply (50/month)',
            'Priority Support',
            'Company-specific Optimization'
        ],
        cta: 'Start Pro Trial',
        href: '/signup?plan=pro',
        popular: true
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For universities & colleges',
        features: [
            'Unlimited Everything',
            'Bulk Student Onboarding',
            'Placement Cell Dashboard',
            'Custom Branding',
            'Analytics & Reports',
            'Dedicated Account Manager',
            'API Access'
        ],
        cta: 'Contact Sales',
        href: '/contact',
        popular: false
    }
];

export default function PricingSection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Simple, <span className={styles.highlight}>Transparent</span> Pricing</h2>
                    <p className={styles.subtitle}>
                        Start free, upgrade when you&apos;re ready
                    </p>
                </div>

                <div className={styles.grid}>
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`${styles.card} ${plan.popular ? styles.popular : ''} ${styles.cardAnimate}`}
                            style={{ animationDelay: `${index * 0.2}s` }}
                        >
                            {plan.popular && (
                                <div className={styles.popularBadge}>MOST POPULAR</div>
                            )}

                            <div className={styles.cardHeader}>
                                <h3 className={styles.planName}>{plan.name}</h3>
                                <div className={styles.price}>
                                    <span className={styles.priceValue}>{plan.price}</span>
                                    {plan.period && <span className={styles.pricePeriod}>{plan.period}</span>}
                                </div>
                                <p className={styles.planDesc}>{plan.description}</p>
                            </div>

                            <ul className={styles.features}>
                                {plan.features.map((feature, idx) => (
                                    <li key={idx}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={`${styles.cta} ${plan.popular ? styles.ctaPopular : ''}`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                <p className={styles.note}>
                    All prices are in INR. Cancel anytime. No hidden fees.
                </p>
            </div>
        </section>
    );
}
