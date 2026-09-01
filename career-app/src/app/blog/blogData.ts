export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string;
  readTime: number;
  category: string;
  categoryColor: string;
  author: string;
  authorRole: string;
  content: BlogSection[];
  relatedSlugs: string[];
}

export interface BlogSection {
  type: 'intro' | 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'callout' | 'cta' | 'faq';
  text?: string;
  items?: string[];
  ctaText?: string;
  ctaHref?: string;
  faqs?: { q: string; a: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'what-is-ats-score',
    title: 'What is an ATS Score? Complete Guide for Job Seekers in 2025',
    description: 'Understand what an ATS score is, how Applicant Tracking Systems rank resumes, and why your score matters more than you think for getting interviews in 2025.',
    keywords: ['ATS score', 'what is ATS score', 'applicant tracking system score', 'ATS resume checker', 'ATS meaning', 'ATS score checker free'],
    publishedAt: '2025-08-01',
    readTime: 7,
    category: 'ATS Basics',
    categoryColor: 'purple',
    author: 'Careerstart Team',
    authorRole: 'Career Intelligence Platform',
    content: [
      { type: 'intro', text: 'Over 99% of Fortune 500 companies use an Applicant Tracking System (ATS) to filter resumes before a human ever reads them. If your ATS score is too low, your resume goes into the digital trash - no matter how qualified you are. This guide explains everything you need to know about ATS scores and how to improve yours instantly.' },
      { type: 'h2', text: 'What is an ATS Score?' },
      { type: 'p', text: "An ATS score (also called an ATS resume score or applicant tracking system score) is a numerical rating that an ATS software gives to your resume based on how well it matches a specific job description. The score typically ranges from 0-100%, where a higher score means your resume is more likely to be seen by a recruiter." },
      { type: 'p', text: "Think of it like a compatibility score. The ATS reads your resume, extracts keywords, checks formatting, and compares your profile against the job requirements. If your resume doesn't contain the right keywords in the right places, it scores low - and you never get called." },
      { type: 'h2', text: 'How Does an ATS Calculate Your Score?' },
      { type: 'ul', items: ['Keyword Matching: Does your resume include the exact keywords from the job description? Terms like "Python", "project management", or "B2B sales" must appear verbatim.', 'Skills Alignment: How many of the required and preferred skills does your resume mention?', 'Work Experience: Does your job title, years of experience, and industry match what the employer wants?', 'Education Requirements: Does your degree, field of study, or certification match the requirements?', 'Formatting Compliance: Are there tables, images, or unusual fonts that confuse the ATS parser?'] },
      { type: 'h2', text: 'Why Your ATS Score Matters More Than Ever in India' },
      { type: 'p', text: "Indian job portals like Naukri, LinkedIn, and Instahyre all use ATS-based filtering. With 1 lakh+ applicants competing for top roles at companies like Zomato, CRED, and Microsoft India, a low ATS score means zero visibility. Studies show that resumes with an ATS score above 80% are 3x more likely to get shortlisted." },
      { type: 'callout', text: '?? Pro Tip: A resume that looks beautiful in PDF but scores 40% on ATS will not get you interviews. Always optimize for the ATS first, then design.' },
      { type: 'h2', text: 'What is a Good ATS Score?' },
      { type: 'ul', items: ['90-100%: Excellent. Very high chance of passing ATS and being reviewed by a recruiter.', '70-89%: Good. Likely to pass, but tweak keywords for better results.', '50-69%: Average. You may get filtered out - needs significant improvement.', 'Below 50%: Poor. Very unlikely to pass ATS screening. Major overhaul needed.'] },
      { type: 'h2', text: 'How to Check Your ATS Score for Free' },
      { type: 'p', text: "The fastest way to check your ATS score is to use careerstart.in's free ATS Score Checker. Upload your resume and paste the job description - you'll get your exact ATS compatibility score in 60 seconds, along with keyword gaps, formatting issues, and one-click suggestions to improve it." },
      { type: 'cta', text: 'Check Your ATS Score Free - Takes 60 Seconds', ctaHref: '/ats-checker' },
      { type: 'faq', faqs: [{ q: 'Is a free ATS score checker accurate?', a: "careerstart.in's free ATS score checker uses the same keyword extraction and matching algorithms as enterprise ATS systems like Taleo and Workday. It's highly accurate for most common use cases." }, { q: 'Do all companies use ATS systems?', a: 'Most companies with more than 50 employees use some form of ATS. Startups may use simpler systems, but any company that posts jobs on Naukri, LinkedIn, or Indeed typically has ATS filtering enabled.' }, { q: 'Can I improve my ATS score without lying on my resume?', a: "Absolutely. Most ATS score improvements come from adding legitimate keywords that describe your real skills in a different way - or ensuring your existing skills are stated in the exact terminology the employer uses." }] },
    ],
    relatedSlugs: ['how-to-beat-ats', 'free-ats-score-checker', 'resume-keywords-india'],
  },
  {
    slug: 'how-to-beat-ats',
    title: 'How to Beat ATS Systems and Get More Interviews in 2025',
    description: 'Learn proven strategies to beat ATS systems, pass automated resume screening, and get your resume in front of real recruiters. Practical tips for freshers and experienced professionals.',
    keywords: ['how to beat ATS', 'pass ATS screening', 'ATS friendly resume tips', 'beat applicant tracking system', 'ATS resume optimization', 'how to pass ATS'],
    publishedAt: '2025-08-10',
    readTime: 9,
    category: 'Resume Tips',
    categoryColor: 'green',
    author: 'Careerstart Team',
    authorRole: 'Career Intelligence Platform',
    content: [
      { type: 'intro', text: "75% of qualified candidates are rejected by ATS before a human even sees their resume. Here's the complete, step-by-step guide to make your resume ATS-proof - used by 50,000+ students who landed jobs at top Indian and global companies." },
      { type: 'h2', text: '1. Use the Right File Format' },
      { type: 'p', text: 'Always submit your resume as a .docx or a simple PDF (text-based, not image-scanned). Scanned PDFs, image-only resumes, and creative formats with graphics or tables confuse ATS parsers and result in a near-zero score.' },
      { type: 'h2', text: '2. Mirror the Job Description Keywords Exactly' },
      { type: 'p', text: "If the job description says 'Machine Learning', don't write 'ML' or 'deep learning' (unless the JD uses those too). ATS systems match exact phrases. Copy the job description into our free ATS checker - it will instantly show you which keywords you're missing." },
      { type: 'h2', text: '3. Use a Simple, Clean Resume Layout' },
      { type: 'ul', items: ['Use standard section headings: "Work Experience", "Education", "Skills", "Certifications"', 'Avoid tables, columns, text boxes, headers/footers - they break ATS parsing', 'Use standard fonts: Arial, Calibri, or Times New Roman at 10-12pt', 'No images, logos, or graphics - they are invisible to ATS', 'Keep it to 1-2 pages for freshers, 2-3 for experienced professionals'] },
      { type: 'h2', text: '4. Customize Your Resume for Every Application' },
      { type: 'p', text: "One resume for all jobs is the biggest ATS mistake. Each job has a different keyword set. Use careerstart.in's AI Resume Builder to generate a tailored resume for each application in minutes - it automatically matches keywords from the job description." },
      { type: 'h2', text: '5. Include Both Abbreviations and Full Forms' },
      { type: 'p', text: "Write 'Search Engine Optimization (SEO)' or 'Application Programming Interface (API)' - not just the abbreviation or just the full form. Different ATS systems search for different versions." },
      { type: 'h2', text: '6. Quantify Your Achievements' },
      { type: 'p', text: "Numbers stand out to both ATS and humans. Instead of 'Managed social media accounts', write 'Grew Instagram following by 45% (12K to 17.4K) in 6 months, resulting in 30% more leads'." },
      { type: 'h2', text: '7. Check Your Score Before You Apply' },
      { type: 'p', text: "Never submit a resume without checking its ATS score first. It takes 60 seconds. Paste the job description, upload your resume to careerstart.in, and get your exact score with actionable suggestions." },
      { type: 'cta', text: 'Beat ATS - Check Your Resume Score Now (Free)', ctaHref: '/ats-checker' },
      { type: 'faq', faqs: [{ q: 'Does ATS reject resumes automatically?', a: 'Yes. ATS systems are programmed to filter out resumes below a certain score threshold (often 60-70%). Only resumes above the threshold are passed to human reviewers.' }, { q: 'Is keyword stuffing a good strategy for ATS?', a: "No. Modern ATS systems (and recruiters) penalize keyword stuffing. Add keywords naturally in the context of your real experience." }, { q: 'Should freshers worry about ATS optimization?', a: 'Absolutely. Entry-level roles in India receive thousands of applications. A fresher with a 90% ATS score will rank far above a fresher with a 50% score, even with similar qualifications.' }] },
    ],
    relatedSlugs: ['what-is-ats-score', 'free-ats-score-checker', 'ai-resume-builder-guide'],
  },
  {
    slug: 'free-ats-score-checker',
    title: 'Free ATS Score Checker - Check Your Resume in 60 Seconds',
    description: 'Check your resume ATS score for free at careerstart.in. Get instant keyword analysis, format check, and actionable tips to improve your ATS compatibility score right now.',
    keywords: ['free ATS score checker', 'ATS score checker online', 'check ATS score', 'ATS resume checker free', 'resume ATS score online', 'free resume ATS test'],
    publishedAt: '2025-08-15',
    readTime: 5,
    category: 'Tools',
    categoryColor: 'blue',
    author: 'Careerstart Team',
    authorRole: 'Career Intelligence Platform',
    content: [
      { type: 'intro', text: "Most ATS checkers either cost money or give you vague feedback. careerstart.in's free ATS score checker gives you a real, database-driven score in 60 seconds - based on thousands of successful resumes." },
      { type: 'h2', text: 'How Our Free ATS Score Checker Works' },
      { type: 'ol', items: ['Upload your resume (PDF or DOCX format)', 'Paste the job description you want to apply for', 'Click "Check Score" - our AI analyzes your resume in real-time', 'Get your ATS compatibility score, keyword gaps, formatting issues, and improvement suggestions', 'Fix the issues and re-check until your score is above 80%'] },
      { type: 'h2', text: 'What You Get With Our Free ATS Checker' },
      { type: 'ul', items: ['? Real ATS Compatibility Score (0-100%)', '? Missing Keyword Analysis - exact words/phrases you need to add', '? Format & Structure Check - tables, fonts, layout issues flagged', '? Skills Gap Report - required vs. present skills', '? One-click suggestions to fix each issue', '? Completely free - no credit card, no signup required'] },
      { type: 'h2', text: 'Why Our ATS Checker Is Different' },
      { type: 'p', text: "Unlike generic ATS checkers that just count keywords, careerstart.in's ATS checker is trained on real hiring data from India's top tech companies and MNCs. We understand the context, not just the keywords." },
      { type: 'callout', text: '?? Users who improve their ATS score from below 60% to above 80% report a 3x increase in interview callback rates within 2 weeks.' },
      { type: 'h2', text: 'Who Should Use This Tool?' },
      { type: 'ul', items: ['College students and freshers applying for campus placements or first jobs', 'Professionals switching industries or roles', 'Anyone who has been applying but not getting interview calls', 'Job seekers targeting MNCs, FAANG, or top Indian startups'] },
      { type: 'cta', text: 'Check Your ATS Score - 100% Free', ctaHref: '/ats-checker' },
      { type: 'faq', faqs: [{ q: 'Is the ATS score checker really free?', a: 'Yes, completely free. No credit card, no signup required. Upload your resume, paste the job description, and get your score instantly.' }, { q: 'How many times can I check my ATS score?', a: 'Free users can check their ATS score multiple times. We recommend checking after every major edit to see how your score changes.' }, { q: 'Does this work for all industries?', a: 'Yes. Our ATS checker works for software engineering, marketing, finance, operations, HR, product management, and all other industries commonly hiring in India.' }] },
    ],
    relatedSlugs: ['what-is-ats-score', 'how-to-beat-ats', 'resume-keywords-india'],
  },
  {
    slug: 'resume-keywords-india',
    title: 'Top Resume Keywords for Indian Job Seekers in 2025',
    description: 'The most powerful resume keywords for Indian job seekers in 2025. Keywords for software engineers, MBAs, freshers, product managers, data scientists, and more.',
    keywords: ['resume keywords India', 'resume keywords for freshers', 'keywords for software engineer resume', 'ATS keywords India', 'top resume keywords 2025', 'resume keywords for MBA'],
    publishedAt: '2025-08-20',
    readTime: 8,
    category: 'Keywords',
    categoryColor: 'orange',
    author: 'Careerstart Team',
    authorRole: 'Career Intelligence Platform',
    content: [
      { type: 'intro', text: 'The right keywords can be the difference between getting shortlisted and being ghosted. This guide covers the highest-impact resume keywords for the most in-demand roles in India.' },
      { type: 'h2', text: 'Software Engineering Resume Keywords' },
      { type: 'ul', items: ['Programming Languages: Python, Java, JavaScript, TypeScript, Go, Rust, C++', 'Frameworks: React, Next.js, Node.js, Spring Boot, FastAPI, Django, Flutter', 'Cloud & DevOps: AWS, GCP, Azure, Docker, Kubernetes, CI/CD, Terraform', 'Databases: PostgreSQL, MongoDB, Redis, MySQL, Elasticsearch', 'Concepts: Microservices, REST API, GraphQL, System Design, Agile, Scrum'] },
      { type: 'h2', text: 'Product Management Resume Keywords' },
      { type: 'ul', items: ['Product Roadmap, Go-to-Market Strategy, Product-Market Fit', 'A/B Testing, Data-Driven Decision Making, User Research, UX', 'OKRs, KPIs, Sprint Planning, Backlog Grooming, Stakeholder Management', 'SQL, Mixpanel, Amplitude, Figma, JIRA', 'North Star Metric, Retention, MAU/DAU, LTV, CAC'] },
      { type: 'h2', text: 'Data Science & Analytics Resume Keywords' },
      { type: 'ul', items: ['Machine Learning, Deep Learning, NLP, Computer Vision', 'Python, R, SQL, Pandas, NumPy, Scikit-learn, TensorFlow, PyTorch', 'Statistical Modeling, Regression Analysis, Hypothesis Testing', 'Data Visualization, Tableau, Power BI, Matplotlib', 'Feature Engineering, Model Deployment, MLOps'] },
      { type: 'h2', text: 'MBA & Business Resume Keywords' },
      { type: 'ul', items: ['Financial Modeling, DCF, Valuation, P&L Management', 'Business Development, Revenue Growth, Market Expansion', 'Strategy Consulting, Process Optimization, Change Management', 'B2B Sales, B2C Marketing, Performance Marketing, SEO/SEM', 'Cross-functional Leadership, Team Management, Executive Presentation'] },
      { type: 'h2', text: 'Fresher / Campus Placement Resume Keywords' },
      { type: 'ul', items: ['Internship Experience, Academic Projects, Open Source Contributions', 'Leadership, Team Collaboration, Communication Skills, Problem Solving', 'GPA/CGPA, Competitive Programming, Hackathons, Research Papers', 'Certifications: AWS Certified, Google Analytics, HubSpot, Coursera', 'Extra-curriculars: E-cell, Coding Clubs, Technical Fests'] },
      { type: 'callout', text: "?? Use these keywords naturally in context - don't just list them." },
      { type: 'cta', text: 'Scan Your Resume for Missing Keywords (Free)', ctaHref: '/ats-checker' },
      { type: 'faq', faqs: [{ q: 'How do I find the right keywords for my specific job?', a: "The best source is the actual job description. Copy it into careerstart.in's ATS checker with your resume - it will automatically identify every keyword you're missing." }, { q: 'Should I include keywords even if I am a beginner at that skill?', a: "Only include skills you can speak to in an interview. However, if you've done even a small project using a technology, it's legitimate to include it with appropriate context." }, { q: 'Are soft skills keywords worth including?', a: "Yes, especially for management and non-technical roles. Keywords like 'cross-functional collaboration', 'stakeholder management', and 'data-driven' appear in many ATS filters." }] },
    ],
    relatedSlugs: ['what-is-ats-score', 'how-to-beat-ats', 'ai-resume-builder-guide'],
  },
  {
    slug: 'ai-resume-builder-guide',
    title: 'How AI Resume Builders Actually Work - And Why You Need One in 2025',
    description: 'Discover how AI resume builders work, what makes them different from templates, and why using an AI resume builder can dramatically increase your interview callback rate.',
    keywords: ['AI resume builder', 'best AI resume builder India', 'AI resume builder free', 'how AI resume builders work', 'resume builder AI', 'AI resume writer'],
    publishedAt: '2025-08-25',
    readTime: 6,
    category: 'AI Tools',
    categoryColor: 'purple',
    author: 'Careerstart Team',
    authorRole: 'Career Intelligence Platform',
    content: [
      { type: 'intro', text: "Everyone has tried a resume template. Most look the same, and worse - they don't beat ATS. AI resume builders are fundamentally different. They analyze the job you're targeting, understand what top candidates look like, and help you craft a resume that speaks the language of both ATS systems and human recruiters." },
      { type: 'h2', text: 'What is an AI Resume Builder?' },
      { type: 'p', text: 'An AI resume builder is a tool that uses artificial intelligence - specifically large language models and machine learning - to help you create, optimize, and tailor your resume for specific job descriptions. It goes far beyond choosing a font and layout.' },
      { type: 'h2', text: 'How AI Resume Builders Work (Step by Step)' },
      { type: 'ol', items: ['You input your work experience, skills, education, and achievements', "You paste the job description you're targeting", 'The AI analyzes thousands of successful resumes for that role type', 'It identifies which keywords, phrases, and achievement formats work best', 'It rewrites your bullet points to match high-performing patterns', 'It arranges sections in the optimal order for that specific job', 'You review, edit, and export - ATS-ready in minutes'] },
      { type: 'h2', text: 'AI Resume Builder vs. Traditional Template: Key Differences' },
      { type: 'ul', items: ['Templates are static. AI builders dynamically adapt to each job.', 'Templates require you to know the right keywords. AI identifies them automatically.', "Templates look the same for everyone. AI personalizes your unique story.", "Templates don't improve over time. AI learns from what works.", "Templates don't check ATS compatibility. AI optimizes for it."] },
      { type: 'h2', text: 'Why Indian Job Seekers Especially Benefit' },
      { type: 'p', text: "India's job market is hyper-competitive. A data science role at Razorpay gets 800+ applications in 24 hours. An AI resume builder helps you stand out by using company-specific keyword patterns." },
      { type: 'callout', text: "?? Resumes created with careerstart.in's AI Resume Builder score 15-20 percentage points higher on ATS tests compared to self-made resumes." },
      { type: 'cta', text: 'Build Your AI Resume - Free to Start', ctaHref: '/resume-builder' },
      { type: 'faq', faqs: [{ q: 'Is an AI resume builder really better than doing it manually?', a: "For most people, yes - especially for optimizing keywords and phrasing. You still need to provide accurate information about your real experience." }, { q: 'Can an AI resume builder help with gaps in my career?', a: "Yes. AI resume builders help you frame your experience positively, highlight transferable skills, and use language that de-emphasizes gaps while emphasizing your value." }, { q: 'Will my resume look AI-generated?', a: "Not if you personalize it. careerstart.in's AI builder gives you a strong foundation that you edit and make your own." }] },
    ],
    relatedSlugs: ['how-to-beat-ats', 'what-is-ats-score', 'mock-interview-tips'],
  },
  {
    slug: 'mock-interview-tips',
    title: '10 Mock Interview Tips to Ace Your Next Job Interview in India',
    description: 'Prepare for your next job interview with these 10 proven mock interview tips. From STAR method to AI interview practice, learn how to get more job offers.',
    keywords: ['mock interview tips', 'interview preparation India', 'how to prepare for job interview', 'AI mock interview', 'interview tips freshers', 'job interview practice'],
    publishedAt: '2025-09-01',
    readTime: 7,
    category: 'Interview Prep',
    categoryColor: 'green',
    author: 'Careerstart Team',
    authorRole: 'Career Intelligence Platform',
    content: [
      { type: 'intro', text: "Getting an interview call is step one. Converting it to an offer is where most candidates fall short. Mock interviews are scientifically proven to improve real interview performance by 40-60%. Here are 10 tips to make your mock interview practice as effective as possible." },
      { type: 'h2', text: '1. Practice Out Loud, Not Just in Your Head' },
      { type: 'p', text: "Thinking through an answer is very different from verbalizing it. Many candidates are surprised to find they stumble, ramble, or lose their train of thought when speaking. Practice every answer out loud - ideally recorded." },
      { type: 'h2', text: '2. Use the STAR Method for Behavioral Questions' },
      { type: 'p', text: "STAR stands for Situation, Task, Action, Result. It's the gold standard for answering behavioral interview questions. Structure every story with these four elements." },
      { type: 'h2', text: '3. Research the Company Deeply Before the Mock' },
      { type: 'p', text: "Mock interviews are most valuable when they mirror the real interview. Research the company's products, recent news, competitors, and culture before your mock session." },
      { type: 'h2', text: '4. Practice Technical Questions Under Time Pressure' },
      { type: 'p', text: "For technical roles, set a 45-minute timer and try to solve coding problems as if in a real interview. Speaking your thought process aloud while coding is a skill that must be practiced." },
      { type: 'h2', text: '5. Record Yourself and Review' },
      { type: 'p', text: "Watching yourself answer interview questions is uncomfortable - which is exactly why it's effective. You'll catch filler words, poor posture, and unclear explanations." },
      { type: 'h2', text: '6. Use AI Mock Interview Tools for 24/7 Practice' },
      { type: 'p', text: "careerstart.in's AI Mock Interview tool lets you practice unlimited interviews at any time. The AI asks role-specific questions, evaluates your answers, and gives you detailed feedback." },
      { type: 'h2', text: '7. Prepare 5 Strong Stories You Can Adapt' },
      { type: 'p', text: "Prepare 5 versatile STAR stories: one about leadership, one about failure/learning, one about collaboration, one about innovation, and one about handling pressure." },
      { type: 'h2', text: '8. Practice Your Introduction Every Day' },
      { type: 'p', text: "'Tell me about yourself' is asked in nearly every interview. Prepare a 90-second, confident, chronological narrative of your career that ends with why you're excited about this specific role." },
      { type: 'h2', text: '9. Prepare Smart Questions to Ask the Interviewer' },
      { type: 'ul', items: ["What does success look like in the first 90 days for this role?", "What are the biggest challenges the team is currently facing?", "How would you describe the engineering/work culture here?", "What are the growth opportunities for someone in this position?"] },
      { type: 'h2', text: '10. Do at Least 3 Full Mock Interviews Before the Real One' },
      { type: 'p', text: "Research shows that performance plateaus after 3-5 mock interview sessions. Your first mock will feel rough. By the third, you'll have found your natural interview rhythm." },
      { type: 'cta', text: 'Practice with AI Mock Interviews - Start Free', ctaHref: '/mock-interview' },
      { type: 'faq', faqs: [{ q: 'How many mock interviews should I do before the real thing?', a: "At minimum 3, ideally 5+. The first couple are about learning what you don't know. The later ones build confidence and consistency." }, { q: 'Are AI mock interviews as good as human mock interviews?', a: "AI mock interviews are excellent for volume practice and getting structured feedback. For high-stakes interviews, complement AI practice with at least one human mock interview." }, { q: 'What types of interviews can I practice on careerstart.in?', a: "Software engineering (DSA, system design, behavioral), product management, data science, marketing, and general HR interviews." }] },
    ],
    relatedSlugs: ['ai-resume-builder-guide', 'what-is-ats-score', 'free-ats-score-checker'],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slugs: string[]): BlogPost[] {
  return blogPosts.filter((p) => slugs.includes(p.slug));
}
