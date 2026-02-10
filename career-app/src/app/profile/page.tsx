'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import styles from './page.module.css';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    if (loading || !user) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className={styles.profilePage}>
            <header className={styles.header}>
                <Link href="/dashboard" className={styles.backLink}>
                    <span>←</span> Back to Dashboard
                </Link>
                <div className={styles.logo}>
                    <span>🎯</span>
                    <span>Career.ai</span>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.profileCard}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarLarge}>
                            {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h1 className={styles.userName}>{user.displayName || 'User'}</h1>
                        <p className={styles.userEmail}>{user.email}</p>
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.infoGroup}>
                            <label>User ID</label>
                            <div className={styles.infoValue}>{user.uid}</div>
                        </div>
                        <div className={styles.infoGroup}>
                            <label>Account Type</label>
                            <div className={styles.infoValue}>Free Plan <Link href="/pricing" className={styles.upgradeLink}>Upgrade</Link></div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            Log Out
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
