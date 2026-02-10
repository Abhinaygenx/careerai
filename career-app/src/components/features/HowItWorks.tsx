import styles from './HowItWorks.module.css';

const steps = [
    {
        number: 1,
        icon: '📄',
        title: 'Upload Resume',
        description: 'Simply upload your resume or paste your LinkedIn profile URL. We support PDF, DOCX formats.'
    },
    {
        number: 2,
        icon: '🤖',
        title: 'Get AI Analysis',
        description: 'Our AI analyzes your profile and suggests improvements based on thousands of successful resumes.'
    },
    {
        number: 3,
        icon: '✨',
        title: 'Apply Suggestions',
        description: 'Make improvements with one-click fixes. Our AI rewrites sections to boost your ATS score.'
    },
    {
        number: 4,
        icon: '🎯',
        title: 'Get Hired',
        description: 'Apply to jobs with confidence. Track applications and get interview prep assistance.'
    }
];

export default function HowItWorks() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>How Career.ai Works</h2>
                    <p className={styles.subtitle}>
                        Get hired in 4 simple steps. No complexity, just results.
                    </p>
                </div>

                <div className={styles.steps}>
                    {steps.map((step, index) => (
                        <div key={index} className={styles.step}>
                            <div className={styles.stepNumber}>{step.number}</div>
                            <div className={styles.stepIcon}>{step.icon}</div>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDesc}>{step.description}</p>
                            {index < steps.length - 1 && (
                                <div className={styles.connector}>
                                    <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
                                        <path d="M0 6H36M36 6L30 1M36 6L30 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
