'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

interface Question {
    id: number;
    question: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    tips: string[];
    sampleAnswer: string;
}

const interviewQuestions: Record<string, Question[]> = {
    'Software Engineer': [
        {
            id: 1,
            question: 'Tell me about yourself and your experience as a software engineer.',
            category: 'Behavioral',
            difficulty: 'Easy',
            tips: [
                'Keep it under 2 minutes',
                'Focus on relevant technical experience',
                'Mention key projects and technologies'
            ],
            sampleAnswer: 'I am a software engineer with 4 years of experience specializing in full-stack development. I have worked extensively with React, Node.js, and cloud technologies. In my previous role at [Company], I led the development of a microservices architecture that reduced system latency by 40%. I am passionate about building scalable solutions and mentoring junior developers.'
        },
        {
            id: 2,
            question: 'Explain the difference between REST and GraphQL APIs.',
            category: 'Technical',
            difficulty: 'Medium',
            tips: [
                'Explain core concepts of both',
                'Discuss pros and cons',
                'Give real-world use cases'
            ],
            sampleAnswer: 'REST is an architectural style that uses standard HTTP methods and returns fixed data structures. GraphQL is a query language that allows clients to request exactly the data they need. REST is simpler and better for caching, while GraphQL reduces over-fetching and is ideal for complex, interconnected data. I typically use REST for simple CRUD operations and GraphQL for complex front-end requirements.'
        },
        {
            id: 3,
            question: 'How would you design a URL shortener like bit.ly?',
            category: 'System Design',
            difficulty: 'Hard',
            tips: [
                'Start with requirements clarification',
                'Discuss scale and constraints',
                'Cover database design and caching'
            ],
            sampleAnswer: 'I would start by clarifying requirements: expected QPS, URL length, analytics needs. For the architecture, I would use a hash function to generate short codes, store mappings in a distributed database like Cassandra for horizontal scaling, use Redis for caching hot URLs, and implement a CDN for global access. For collision handling, I would use a counter-based approach with base62 encoding.'
        },
        {
            id: 4,
            question: 'Describe a challenging bug you fixed and how you approached it.',
            category: 'Behavioral',
            difficulty: 'Medium',
            tips: [
                'Use STAR method',
                'Highlight debugging process',
                'Show learning outcome'
            ],
            sampleAnswer: 'In a production system, we had intermittent failures that were hard to reproduce. I systematically added logging, analyzed patterns, and discovered a race condition in our async queue processing. I implemented proper mutex locks and added comprehensive integration tests. This experience taught me the importance of observability and defensive programming.'
        },
        {
            id: 5,
            question: 'What is your approach to code reviews?',
            category: 'Behavioral',
            difficulty: 'Easy',
            tips: [
                'Focus on constructive feedback',
                'Mention what you look for',
                'Discuss learning aspect'
            ],
            sampleAnswer: 'I view code reviews as collaborative learning opportunities. I focus on code correctness, readability, performance implications, and adherence to team standards. I always provide specific, constructive feedback with suggestions. When reviewing, I also consider edge cases and security implications. I believe in respectful communication and explaining the "why" behind suggestions.'
        }
    ],
    'Product Manager': [
        {
            id: 1,
            question: 'How would you prioritize features for a new product launch?',
            category: 'Product Sense',
            difficulty: 'Medium',
            tips: [
                'Mention frameworks like RICE or MoSCoW',
                'Consider business impact and effort',
                'Discuss stakeholder alignment'
            ],
            sampleAnswer: 'I use a combination of the RICE framework (Reach, Impact, Confidence, Effort) and stakeholder input. First, I gather data on user needs through research and analytics. Then I score features based on business impact, technical feasibility, and strategic alignment. I involve engineering for effort estimates and present prioritized roadmap to leadership for buy-in.'
        },
        {
            id: 2,
            question: 'Tell me about a product you love and how you would improve it.',
            category: 'Product Sense',
            difficulty: 'Medium',
            tips: [
                'Show analytical thinking',
                'Consider user segments',
                'Propose measurable improvements'
            ],
            sampleAnswer: 'I love Spotify for its personalization. To improve it, I would add a collaborative playlist feature where friends can vote on songs in real-time, targeting the social listening segment. Success metrics would be DAU for the feature, playlist creation rate, and social shares. This addresses the gap in social music experiences while leveraging Spotify\'s recommendation engine.'
        }
    ],
    'Data Scientist': [
        {
            id: 1,
            question: 'Explain the bias-variance tradeoff.',
            category: 'Technical',
            difficulty: 'Medium',
            tips: [
                'Define both terms clearly',
                'Explain the tradeoff',
                'Give practical examples'
            ],
            sampleAnswer: 'Bias is error from oversimplifying assumptions - high bias models underfit. Variance is error from sensitivity to training data - high variance models overfit. The tradeoff means reducing one often increases the other. For example, decision trees have low bias but high variance. We balance this through techniques like regularization, cross-validation, and ensemble methods like Random Forest.'
        }
    ]
};

export default function MockInterviewPage() {
    const [selectedRole, setSelectedRole] = useState('Software Engineer');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [mode, setMode] = useState<'practice' | 'timed'>('practice');
    const [isRecording, setIsRecording] = useState(false);

    const questions = interviewQuestions[selectedRole] || [];
    const currentQuestion = questions[currentQuestionIndex];

    const nextQuestion = () => {
        setShowAnswer(false);
        setUserAnswer('');
        setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
    };

    const prevQuestion = () => {
        setShowAnswer(false);
        setUserAnswer('');
        setCurrentQuestionIndex((prev) => (prev - 1 + questions.length) % questions.length);
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.hero}>
                        <span className={styles.badge}>
                            <span>🎤</span> AI Mock Interview
                        </span>
                        <h1 className={styles.title}>
                            Practice Your <span className={styles.highlight}>Interview Skills</span>
                        </h1>
                        <p className={styles.subtitle}>
                            Prepare with real interview questions from top companies. Get AI-powered feedback.
                        </p>
                    </div>

                    {/* Controls */}
                    <div className={styles.controls}>
                        <div className={styles.roleSelect}>
                            <label>Select Role:</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => {
                                    setSelectedRole(e.target.value);
                                    setCurrentQuestionIndex(0);
                                    setShowAnswer(false);
                                }}
                                className={styles.select}
                            >
                                <option value="Software Engineer">Software Engineer</option>
                                <option value="Product Manager">Product Manager</option>
                                <option value="Data Scientist">Data Scientist</option>
                            </select>
                        </div>

                        <div className={styles.modeToggle}>
                            <button
                                className={`${styles.modeBtn} ${mode === 'practice' ? styles.active : ''}`}
                                onClick={() => setMode('practice')}
                            >
                                📝 Practice Mode
                            </button>
                            <button
                                className={`${styles.modeBtn} ${mode === 'timed' ? styles.active : ''}`}
                                onClick={() => setMode('timed')}
                            >
                                ⏱️ Timed Mode
                            </button>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className={styles.questionCard}>
                        <div className={styles.questionHeader}>
                            <div className={styles.questionMeta}>
                                <span className={styles.category}>{currentQuestion?.category}</span>
                                <span className={`${styles.difficulty} ${styles[currentQuestion?.difficulty.toLowerCase() || 'easy']}`}>
                                    {currentQuestion?.difficulty}
                                </span>
                            </div>
                            <span className={styles.questionNumber}>
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                        </div>

                        <h2 className={styles.question}>{currentQuestion?.question}</h2>

                        {/* Tips */}
                        <div className={styles.tipsSection}>
                            <h4>💡 Tips</h4>
                            <ul>
                                {currentQuestion?.tips.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Answer Input */}
                        <div className={styles.answerSection}>
                            <div className={styles.answerHeader}>
                                <h4>Your Answer</h4>
                                <button
                                    className={`${styles.recordBtn} ${isRecording ? styles.recording : ''}`}
                                    onClick={() => setIsRecording(!isRecording)}
                                >
                                    {isRecording ? '⏹️ Stop Recording' : '🎙️ Record Answer'}
                                </button>
                            </div>
                            <textarea
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Type your answer here or use voice recording..."
                                className={styles.answerInput}
                                rows={6}
                            />

                            <div className={styles.answerActions}>
                                <button
                                    onClick={() => setShowAnswer(true)}
                                    className={styles.showAnswerBtn}
                                >
                                    👀 Show Sample Answer
                                </button>
                                <button className={styles.feedbackBtn}>
                                    ✨ Get AI Feedback
                                </button>
                            </div>
                        </div>

                        {/* Sample Answer */}
                        {showAnswer && (
                            <div className={styles.sampleAnswer}>
                                <h4>📌 Sample Answer</h4>
                                <p>{currentQuestion?.sampleAnswer}</p>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className={styles.navigation}>
                            <button onClick={prevQuestion} className={styles.navBtn}>
                                ← Previous
                            </button>
                            <div className={styles.progress}>
                                {questions.map((_, index) => (
                                    <span
                                        key={index}
                                        className={`${styles.dot} ${index === currentQuestionIndex ? styles.activeDot : ''}`}
                                        onClick={() => {
                                            setCurrentQuestionIndex(index);
                                            setShowAnswer(false);
                                        }}
                                    />
                                ))}
                            </div>
                            <button onClick={nextQuestion} className={styles.navBtn}>
                                Next →
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>📊</span>
                            <div>
                                <span className={styles.statValue}>0</span>
                                <span className={styles.statLabel}>Questions Practiced</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>⏱️</span>
                            <div>
                                <span className={styles.statValue}>0 min</span>
                                <span className={styles.statLabel}>Practice Time</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>🎯</span>
                            <div>
                                <span className={styles.statValue}>-</span>
                                <span className={styles.statLabel}>Avg. Score</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
