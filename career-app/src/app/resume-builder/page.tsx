'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
}

interface Experience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
}

interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
    gpa: string;
}

interface ResumeData {
    personal: PersonalInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    targetCompany: string;
    targetRole: string;
}

const initialResumeData: ResumeData = {
    personal: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    targetCompany: '',
    targetRole: ''
};

const popularCompanies = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix',
    'Flipkart', 'Swiggy', 'Zomato', 'Razorpay', 'PhonePe', 'CRED',
    'TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant',
    'Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Deloitte', 'McKinsey', 'BCG'
];

const skillSuggestions: Record<string, string[]> = {
    'Software Engineer': ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git', 'Agile'],
    'Data Scientist': ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics', 'Data Visualization', 'R', 'NLP'],
    'Product Manager': ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'Roadmapping', 'A/B Testing', 'SQL'],
    'Frontend Developer': ['React', 'TypeScript', 'CSS', 'JavaScript', 'HTML', 'Redux', 'Tailwind CSS', 'Next.js'],
    'Backend Developer': ['Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS'],
    'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Jenkins', 'Linux', 'Python', 'Ansible'],
    'Business Analyst': ['SQL', 'Excel', 'Tableau', 'Power BI', 'Requirements Gathering', 'Process Mapping', 'Agile']
};

export default function ResumeBuilderPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
    const [isGenerating, setIsGenerating] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const steps = [
        { number: 1, title: 'Target', icon: '🎯' },
        { number: 2, title: 'Personal', icon: '👤' },
        { number: 3, title: 'Experience', icon: '💼' },
        { number: 4, title: 'Education', icon: '🎓' },
        { number: 5, title: 'Skills', icon: '⚡' },
        { number: 6, title: 'Generate', icon: '✨' }
    ];

    const updatePersonal = (field: keyof PersonalInfo, value: string) => {
        setResumeData(prev => ({
            ...prev,
            personal: { ...prev.personal, [field]: value }
        }));
    };

    const addExperience = () => {
        const newExp: Experience = {
            id: Date.now().toString(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
            achievements: ['']
        };
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, newExp]
        }));
    };

    const updateExperience = (id: string, field: keyof Experience, value: string | boolean | string[]) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const removeExperience = (id: string) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }));
    };

    const addEducation = () => {
        const newEdu: Education = {
            id: Date.now().toString(),
            institution: '',
            degree: '',
            field: '',
            graduationYear: '',
            gpa: ''
        };
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, newEdu]
        }));
    };

    const updateEducation = (id: string, field: keyof Education, value: string) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        }));
    };

    const removeEducation = (id: string) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    };

    const addSkill = (skill: string) => {
        if (skill && !resumeData.skills.includes(skill)) {
            setResumeData(prev => ({
                ...prev,
                skills: [...prev.skills, skill]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setResumeData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    const generateResume = async () => {
        setIsGenerating(true);
        // Simulate AI generation
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Generate AI summary based on target company and role
        const generatedSummary = `Results-driven ${resumeData.targetRole} with a proven track record of delivering impactful solutions. Passionate about leveraging technology to solve complex problems, with expertise aligned to ${resumeData.targetCompany}'s mission. Strong communicator with experience in cross-functional collaboration and a commitment to continuous learning and excellence.`;

        setResumeData(prev => ({ ...prev, summary: generatedSummary }));
        setIsGenerating(false);
        setShowPreview(true);
    };

    const suggestedSkills = skillSuggestions[resumeData.targetRole] || [];

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Hero */}
                    <div className={styles.hero}>
                        <span className={styles.badge}>
                            <span>📝</span> AI Resume Builder
                        </span>
                        <h1 className={styles.title}>
                            Build an <span className={styles.highlight}>ATS-Optimized</span> Resume
                        </h1>
                        <p className={styles.subtitle}>
                            Powered by analysis of 2.5M+ successful resumes. Get company-specific optimization for your target role.
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className={styles.stepsContainer}>
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className={`${styles.step} ${currentStep === step.number ? styles.active : ''} ${currentStep > step.number ? styles.completed : ''}`}
                                onClick={() => currentStep > step.number && setCurrentStep(step.number)}
                            >
                                <div className={styles.stepIcon}>
                                    {currentStep > step.number ? '✓' : step.icon}
                                </div>
                                <span className={styles.stepTitle}>{step.title}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.content}>
                        {/* Step 1: Target Company & Role */}
                        {currentStep === 1 && (
                            <div className={styles.stepContent}>
                                <h2 className={styles.stepHeading}>🎯 Target Your Dream Company</h2>
                                <p className={styles.stepDesc}>
                                    We&apos;ll optimize your resume based on successful candidates at your target company
                                </p>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Target Company</label>
                                    <input
                                        type="text"
                                        value={resumeData.targetCompany}
                                        onChange={(e) => setResumeData(prev => ({ ...prev, targetCompany: e.target.value }))}
                                        placeholder="e.g., Google, Microsoft, Flipkart..."
                                        className={styles.input}
                                        list="companies"
                                    />
                                    <datalist id="companies">
                                        {popularCompanies.map(company => (
                                            <option key={company} value={company} />
                                        ))}
                                    </datalist>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Target Role</label>
                                    <select
                                        value={resumeData.targetRole}
                                        onChange={(e) => setResumeData(prev => ({ ...prev, targetRole: e.target.value }))}
                                        className={styles.select}
                                    >
                                        <option value="">Select a role...</option>
                                        <option value="Software Engineer">Software Engineer</option>
                                        <option value="Frontend Developer">Frontend Developer</option>
                                        <option value="Backend Developer">Backend Developer</option>
                                        <option value="Full Stack Developer">Full Stack Developer</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                        <option value="Data Analyst">Data Analyst</option>
                                        <option value="Product Manager">Product Manager</option>
                                        <option value="DevOps Engineer">DevOps Engineer</option>
                                        <option value="Business Analyst">Business Analyst</option>
                                        <option value="UI/UX Designer">UI/UX Designer</option>
                                    </select>
                                </div>

                                {resumeData.targetCompany && resumeData.targetRole && (
                                    <div className={styles.insightBox}>
                                        <h4>💡 AI Insight</h4>
                                        <p>
                                            Based on 1,200+ successful {resumeData.targetRole} resumes at {resumeData.targetCompany}:
                                        </p>
                                        <ul>
                                            <li>Average resume length: 1 page</li>
                                            <li>Top skills: {suggestedSkills.slice(0, 4).join(', ')}</li>
                                            <li>Most common certifications: AWS, Google Cloud</li>
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!resumeData.targetCompany || !resumeData.targetRole}
                                    className={styles.nextBtn}
                                >
                                    Continue →
                                </button>
                            </div>
                        )}

                        {/* Step 2: Personal Information */}
                        {currentStep === 2 && (
                            <div className={styles.stepContent}>
                                <h2 className={styles.stepHeading}>👤 Personal Information</h2>
                                <p className={styles.stepDesc}>Your contact details for the resume header</p>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Full Name *</label>
                                        <input
                                            type="text"
                                            value={resumeData.personal.fullName}
                                            onChange={(e) => updatePersonal('fullName', e.target.value)}
                                            placeholder="John Doe"
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email *</label>
                                        <input
                                            type="email"
                                            value={resumeData.personal.email}
                                            onChange={(e) => updatePersonal('email', e.target.value)}
                                            placeholder="john@email.com"
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Phone *</label>
                                        <input
                                            type="tel"
                                            value={resumeData.personal.phone}
                                            onChange={(e) => updatePersonal('phone', e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Location *</label>
                                        <input
                                            type="text"
                                            value={resumeData.personal.location}
                                            onChange={(e) => updatePersonal('location', e.target.value)}
                                            placeholder="Mumbai, India"
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>LinkedIn URL</label>
                                        <input
                                            type="url"
                                            value={resumeData.personal.linkedin}
                                            onChange={(e) => updatePersonal('linkedin', e.target.value)}
                                            placeholder="linkedin.com/in/johndoe"
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Portfolio URL</label>
                                        <input
                                            type="url"
                                            value={resumeData.personal.portfolio}
                                            onChange={(e) => updatePersonal('portfolio', e.target.value)}
                                            placeholder="johndoe.dev"
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                <div className={styles.navButtons}>
                                    <button onClick={() => setCurrentStep(1)} className={styles.backBtn}>
                                        ← Back
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        disabled={!resumeData.personal.fullName || !resumeData.personal.email}
                                        className={styles.nextBtn}
                                    >
                                        Continue →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Work Experience */}
                        {currentStep === 3 && (
                            <div className={styles.stepContent}>
                                <h2 className={styles.stepHeading}>💼 Work Experience</h2>
                                <p className={styles.stepDesc}>Add your relevant work experience (most recent first)</p>

                                {resumeData.experience.map((exp, index) => (
                                    <div key={exp.id} className={styles.experienceCard}>
                                        <div className={styles.cardHeader}>
                                            <span className={styles.cardNumber}>Experience {index + 1}</span>
                                            <button
                                                onClick={() => removeExperience(exp.id)}
                                                className={styles.removeBtn}
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className={styles.formGrid}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Company</label>
                                                <input
                                                    type="text"
                                                    value={exp.company}
                                                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                    placeholder="Company Name"
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Position</label>
                                                <input
                                                    type="text"
                                                    value={exp.position}
                                                    onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                                    placeholder="Job Title"
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Start Date</label>
                                                <input
                                                    type="month"
                                                    value={exp.startDate}
                                                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>End Date</label>
                                                <input
                                                    type="month"
                                                    value={exp.endDate}
                                                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                                    disabled={exp.current}
                                                    className={styles.input}
                                                />
                                                <label className={styles.checkbox}>
                                                    <input
                                                        type="checkbox"
                                                        checked={exp.current}
                                                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                                    />
                                                    I currently work here
                                                </label>
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Description & Achievements</label>
                                            <textarea
                                                value={exp.description}
                                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                                placeholder="Describe your responsibilities and achievements. Use bullet points starting with action verbs..."
                                                className={styles.textarea}
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button onClick={addExperience} className={styles.addBtn}>
                                    + Add Experience
                                </button>

                                <div className={styles.navButtons}>
                                    <button onClick={() => setCurrentStep(2)} className={styles.backBtn}>
                                        ← Back
                                    </button>
                                    <button onClick={() => setCurrentStep(4)} className={styles.nextBtn}>
                                        Continue →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Education */}
                        {currentStep === 4 && (
                            <div className={styles.stepContent}>
                                <h2 className={styles.stepHeading}>🎓 Education</h2>
                                <p className={styles.stepDesc}>Add your educational qualifications</p>

                                {resumeData.education.map((edu, index) => (
                                    <div key={edu.id} className={styles.experienceCard}>
                                        <div className={styles.cardHeader}>
                                            <span className={styles.cardNumber}>Education {index + 1}</span>
                                            <button
                                                onClick={() => removeEducation(edu.id)}
                                                className={styles.removeBtn}
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className={styles.formGrid}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Institution</label>
                                                <input
                                                    type="text"
                                                    value={edu.institution}
                                                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                                    placeholder="University/College Name"
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Degree</label>
                                                <input
                                                    type="text"
                                                    value={edu.degree}
                                                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                    placeholder="B.Tech, M.Tech, MBA..."
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Field of Study</label>
                                                <input
                                                    type="text"
                                                    value={edu.field}
                                                    onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                                    placeholder="Computer Science, Electronics..."
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Graduation Year</label>
                                                <input
                                                    type="text"
                                                    value={edu.graduationYear}
                                                    onChange={(e) => updateEducation(edu.id, 'graduationYear', e.target.value)}
                                                    placeholder="2024"
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>GPA/Percentage (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={edu.gpa}
                                                    onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                                    placeholder="8.5/10 or 85%"
                                                    className={styles.input}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button onClick={addEducation} className={styles.addBtn}>
                                    + Add Education
                                </button>

                                <div className={styles.navButtons}>
                                    <button onClick={() => setCurrentStep(3)} className={styles.backBtn}>
                                        ← Back
                                    </button>
                                    <button onClick={() => setCurrentStep(5)} className={styles.nextBtn}>
                                        Continue →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Skills */}
                        {currentStep === 5 && (
                            <div className={styles.stepContent}>
                                <h2 className={styles.stepHeading}>⚡ Skills</h2>
                                <p className={styles.stepDesc}>
                                    Add skills that are relevant to your target role at {resumeData.targetCompany}
                                </p>

                                {suggestedSkills.length > 0 && (
                                    <div className={styles.suggestedSkills}>
                                        <h4>💡 Recommended for {resumeData.targetRole}:</h4>
                                        <div className={styles.skillTags}>
                                            {suggestedSkills.map(skill => (
                                                <button
                                                    key={skill}
                                                    onClick={() => addSkill(skill)}
                                                    className={`${styles.skillTag} ${resumeData.skills.includes(skill) ? styles.selected : ''}`}
                                                    disabled={resumeData.skills.includes(skill)}
                                                >
                                                    {resumeData.skills.includes(skill) ? '✓' : '+'} {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Add Custom Skill</label>
                                    <div className={styles.skillInput}>
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
                                            placeholder="Type a skill and press Enter..."
                                            className={styles.input}
                                        />
                                        <button onClick={() => addSkill(newSkill)} className={styles.addSkillBtn}>
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {resumeData.skills.length > 0 && (
                                    <div className={styles.selectedSkills}>
                                        <h4>Your Skills ({resumeData.skills.length})</h4>
                                        <div className={styles.skillTags}>
                                            {resumeData.skills.map(skill => (
                                                <span key={skill} className={styles.selectedSkillTag}>
                                                    {skill}
                                                    <button onClick={() => removeSkill(skill)}>✕</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.navButtons}>
                                    <button onClick={() => setCurrentStep(4)} className={styles.backBtn}>
                                        ← Back
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep(6)}
                                        disabled={resumeData.skills.length === 0}
                                        className={styles.nextBtn}
                                    >
                                        Continue →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 6: Generate */}
                        {currentStep === 6 && !showPreview && (
                            <div className={styles.stepContent}>
                                <h2 className={styles.stepHeading}>✨ Generate Your Resume</h2>
                                <p className={styles.stepDesc}>
                                    Our AI will create an optimized resume tailored for {resumeData.targetRole} at {resumeData.targetCompany}
                                </p>

                                <div className={styles.summaryCard}>
                                    <h4>📋 Resume Summary</h4>
                                    <div className={styles.summaryGrid}>
                                        <div className={styles.summaryItem}>
                                            <span>Target</span>
                                            <strong>{resumeData.targetRole} at {resumeData.targetCompany}</strong>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span>Experience</span>
                                            <strong>{resumeData.experience.length} positions</strong>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span>Education</span>
                                            <strong>{resumeData.education.length} entries</strong>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span>Skills</span>
                                            <strong>{resumeData.skills.length} skills</strong>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={generateResume}
                                    disabled={isGenerating}
                                    className={styles.generateBtn}
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className={styles.spinner}></span>
                                            Generating your resume...
                                        </>
                                    ) : (
                                        <>
                                            🚀 Generate AI-Optimized Resume
                                        </>
                                    )}
                                </button>

                                <div className={styles.navButtons}>
                                    <button onClick={() => setCurrentStep(5)} className={styles.backBtn}>
                                        ← Back
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Preview */}
                        {showPreview && (
                            <div className={styles.previewSection}>
                                <div className={styles.previewHeader}>
                                    <h2>✅ Your Resume is Ready!</h2>
                                    <div className={styles.previewActions}>
                                        <button onClick={() => setShowPreview(false)} className={styles.editBtn}>
                                            ✏️ Edit
                                        </button>
                                        <button className={styles.downloadBtn}>
                                            📥 Download PDF
                                        </button>
                                        <button className={styles.downloadBtn}>
                                            📄 Download DOCX
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.resumePreview}>
                                    <div className={styles.resumeHeader}>
                                        <h1>{resumeData.personal.fullName || 'Your Name'}</h1>
                                        <div className={styles.contactInfo}>
                                            {resumeData.personal.email && <span>📧 {resumeData.personal.email}</span>}
                                            {resumeData.personal.phone && <span>📱 {resumeData.personal.phone}</span>}
                                            {resumeData.personal.location && <span>📍 {resumeData.personal.location}</span>}
                                        </div>
                                        {resumeData.personal.linkedin && (
                                            <div className={styles.links}>
                                                <span>🔗 {resumeData.personal.linkedin}</span>
                                                {resumeData.personal.portfolio && <span>🌐 {resumeData.personal.portfolio}</span>}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.resumeSection}>
                                        <h2>Professional Summary</h2>
                                        <p>{resumeData.summary}</p>
                                    </div>

                                    {resumeData.experience.length > 0 && (
                                        <div className={styles.resumeSection}>
                                            <h2>Experience</h2>
                                            {resumeData.experience.map(exp => (
                                                <div key={exp.id} className={styles.experienceItem}>
                                                    <div className={styles.expHeader}>
                                                        <strong>{exp.position}</strong>
                                                        <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                                                    </div>
                                                    <div className={styles.expCompany}>{exp.company}</div>
                                                    <p>{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {resumeData.education.length > 0 && (
                                        <div className={styles.resumeSection}>
                                            <h2>Education</h2>
                                            {resumeData.education.map(edu => (
                                                <div key={edu.id} className={styles.eduItem}>
                                                    <strong>{edu.degree} in {edu.field}</strong>
                                                    <span>{edu.institution} • {edu.graduationYear}</span>
                                                    {edu.gpa && <span className={styles.gpa}>GPA: {edu.gpa}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className={styles.resumeSection}>
                                        <h2>Skills</h2>
                                        <div className={styles.resumeSkills}>
                                            {resumeData.skills.join(' • ')}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.atsScore}>
                                    <div className={styles.atsScoreCircle}>92</div>
                                    <div>
                                        <strong>ATS Score: Excellent</strong>
                                        <p>Optimized for {resumeData.targetCompany}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
