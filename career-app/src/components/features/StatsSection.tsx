import styles from './StatsSection.module.css';

const stats = [
    {
        value: '50,000+',
        label: 'Active Users',
        description: 'Students & professionals'
    },
    {
        value: '2.5M+',
        label: 'Resumes Analyzed',
        description: 'And counting daily'
    },
    {
        value: '85%',
        label: 'Success Rate',
        description: 'Interview callbacks'
    },
    {
        value: '500+',
        label: 'Partner Companies',
        description: 'Hiring through us'
    },
    {
        value: '4.8/5',
        label: 'User Rating',
        description: 'Average score'
    }
];

export default function StatsSection() {
    return (
        <section className={styles.stats}>
            <div className={styles.container}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statItem}>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={styles.statLabel}>{stat.label}</div>
                        <div className={styles.statDesc}>{stat.description}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
