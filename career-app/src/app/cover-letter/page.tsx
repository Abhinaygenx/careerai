'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

interface CoverLetterData {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    hiringManager: string;
    yourExperience: string;
    keyAchievements: string;
    whyCompany: string;
}

const initialData: CoverLetterData = {
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    hiringManager: '',
    yourExperience: '',
    keyAchievements: '',
    whyCompany: ''
};

export default function CoverLetterPage() {
    const [formData, setFormData] = useState<CoverLetterData>(initialData);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'creative'>('professional');

    const updateField = (field: keyof CoverLetterData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generateCoverLetter = async () => {
        setIsGenerating(true);

        // Simulate AI generation
        await new Promise(resolve => setTimeout(resolve, 2500));

        const managerGreeting = formData.hiringManager
            ? `Dear ${formData.hiringManager},`
            : 'Dear Hiring Manager,';

        const letter = `${managerGreeting}

I am writing to express my strong interest in the ${formData.jobTitle} position at ${formData.companyName}. With my background in ${formData.yourExperience}, I am confident in my ability to contribute meaningfully to your team and drive impactful results.

Throughout my career, I have consistently demonstrated ${formData.keyAchievements}. These experiences have equipped me with the skills and perspective necessary to excel in this role and add immediate value to ${formData.companyName}.

What excites me most about this opportunity is ${formData.whyCompany}. I am particularly drawn to ${formData.companyName}'s commitment to innovation and excellence, and I am eager to bring my passion and expertise to support your mission.

I would welcome the opportunity to discuss how my background and skills align with the needs of your team. Thank you for considering my application. I look forward to the possibility of contributing to ${formData.companyName}'s continued success.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`;

        setGeneratedLetter(letter);
        setIsGenerating(false);
    };

    const isFormValid = formData.jobTitle && formData.companyName && formData.yourExperience;

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.hero}>
                        <span className={styles.badge}>
                            <span>✉️</span> AI Cover Letter Generator
                        </span>
                        <h1 className={styles.title}>
                            Generate <span className={styles.highlight}>Personalized</span> Cover Letters
                        </h1>
                        <p className={styles.subtitle}>
                            Create compelling cover letters tailored to each job application in seconds
                        </p>
                    </div>

                    <div className={styles.layout}>
                        {/* Form Section */}
                        <div className={styles.formSection}>
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>📋 Job Details</h3>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Job Title *</label>
                                    <input
                                        type="text"
                                        value={formData.jobTitle}
                                        onChange={(e) => updateField('jobTitle', e.target.value)}
                                        placeholder="e.g., Senior Software Engineer"
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Company Name *</label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => updateField('companyName', e.target.value)}
                                        placeholder="e.g., Google India"
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Hiring Manager (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.hiringManager}
                                        onChange={(e) => updateField('hiringManager', e.target.value)}
                                        placeholder="e.g., Mr. Sundar Pichai"
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Job Description (Optional)</label>
                                    <textarea
                                        value={formData.jobDescription}
                                        onChange={(e) => updateField('jobDescription', e.target.value)}
                                        placeholder="Paste the job description here for better personalization..."
                                        className={styles.textarea}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>👤 About You</h3>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Your Experience/Background *</label>
                                    <textarea
                                        value={formData.yourExperience}
                                        onChange={(e) => updateField('yourExperience', e.target.value)}
                                        placeholder="e.g., 5+ years of full-stack development, expertise in React and Node.js..."
                                        className={styles.textarea}
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Key Achievements</label>
                                    <textarea
                                        value={formData.keyAchievements}
                                        onChange={(e) => updateField('keyAchievements', e.target.value)}
                                        placeholder="e.g., Led a team of 8 engineers, increased system performance by 40%..."
                                        className={styles.textarea}
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Why This Company?</label>
                                    <textarea
                                        value={formData.whyCompany}
                                        onChange={(e) => updateField('whyCompany', e.target.value)}
                                        placeholder="e.g., the company's innovative approach to solving complex problems..."
                                        className={styles.textarea}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>🎨 Tone</h3>
                                <div className={styles.toneOptions}>
                                    {(['professional', 'enthusiastic', 'creative'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTone(t)}
                                            className={`${styles.toneBtn} ${tone === t ? styles.selected : ''}`}
                                        >
                                            {t === 'professional' && '👔'}
                                            {t === 'enthusiastic' && '🚀'}
                                            {t === 'creative' && '🎨'}
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={generateCoverLetter}
                                disabled={!isFormValid || isGenerating}
                                className={styles.generateBtn}
                            >
                                {isGenerating ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        ✨ Generate Cover Letter
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Preview Section */}
                        <div className={styles.previewSection}>
                            <div className={styles.previewCard}>
                                <div className={styles.previewHeader}>
                                    <h3>📄 Cover Letter Preview</h3>
                                    {generatedLetter && (
                                        <div className={styles.previewActions}>
                                            <button className={styles.copyBtn}>📋 Copy</button>
                                            <button className={styles.downloadBtn}>📥 Download</button>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.previewContent}>
                                    {generatedLetter ? (
                                        <pre className={styles.letterContent}>{generatedLetter}</pre>
                                    ) : (
                                        <div className={styles.emptyState}>
                                            <span>✉️</span>
                                            <p>Your cover letter will appear here</p>
                                            <span className={styles.hint}>Fill in the form and click Generate</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {generatedLetter && (
                                <div className={styles.tipCard}>
                                    <h4>💡 Pro Tips</h4>
                                    <ul>
                                        <li>Customize the opening to reflect the specific role</li>
                                        <li>Add 1-2 specific examples from your experience</li>
                                        <li>Research the company&apos;s recent news or achievements</li>
                                        <li>Keep it under 400 words for best results</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
