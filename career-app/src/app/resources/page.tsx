import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Career Resources -- Free Guides, Tools and Templates | careerstart.in',
  description:
    'Free career resources for Indian job seekers. ATS optimization guides, resume templates, interview prep, salary guides, and career tips -- all in one place.',
  keywords:
    'career resources India, free resume guide, ATS resume tips, interview preparation guide, career advice freshers, resume templates India',
  openGraph: {
    title: 'Free Career Resources | careerstart.in',
    description: 'Free guides, tools, and templates for job seekers in India.',
    url: 'https://careerstart.in/resources',
    siteName: 'careerstart.in',
    type: 'website',
  },
  alternates: { canonical: 'https://careerstart.in/resources' },
};

const tools = [
  {
    icon: '📊',
    title: 'Free ATS Score Checker',
    description: 'Instantly check how well your resume matches any job description. Get a score, keyword gaps, and fix suggestions in 60 seconds.',
    cta: 'Check My ATS Score',
    href: '/ats-checker',
    badge: 'FREE',
    color: '#8B7CF7',
  },
  {
    icon: '📝',
    title: 'AI Resume Builder',
    description: 'Build a job-specific, ATS-optimized resume using AI. The builder matches keywords from your target company and role.',
    cta: 'Build My Resume',
    href: '/resume-builder',
    badge: 'AI-POWERED',
    color: '#22C55E',
  },
  {
    icon: '🎤',
    title: 'AI Mock Interview',
    description: 'Practice unlimited interviews with our AI interviewer. Get real-time feedback on answers, confidence, and structure.',
    cta: 'Start Practicing',
    href: '/mock-interview',
    badge: 'AI-POWERED',
    color: '#4DA3FF',
  },
  {
    icon: '✉️',
    title: 'AI Cover Letter Generator',
    description: 'Generate personalized, job-specific cover letters in seconds. Tailored to the exact company and role you are applying to.',
    cta: 'Generate Cover Letter',
    href: '/cover-letter',
    badge: 'AI-POWERED',
    color: '#F97316',
  },
  {
    icon: '⚡',
    title: 'AI Auto Apply',
    description: 'Automatically apply to hundreds of matching jobs with the right resume variant. Track deadlines and application status.',
    cta: 'Auto Apply Now',
    href: '/auto-apply',
    badge: 'PREMIUM',
    color: '#8B7CF7',
  },
];

const guides = [
  {
    title: 'What is an ATS Score?',
    description: 'The complete beginner guide to understanding ATS scoring, how it works, and why it matters.',
    readTime: '7 min',
    href: '/blog/what-is-ats-score',
    tag: 'ATS Basics',
  },
  {
    title: 'How to Beat ATS Systems',
    description: '7 proven strategies to pass ATS filtering and get your resume in front of a real recruiter.',
    readTime: '9 min',
    href: '/blog/how-to-beat-ats',
    tag: 'Resume Tips',
  },
  {
    title: 'Free ATS Score Checker Guide',
    description: "How to use careerstart.in's free ATS checker and what each metric means for your job search.",
    readTime: '5 min',
    href: '/blog/free-ats-score-checker',
    tag: 'Tools',
  },
  {
    title: 'Top Resume Keywords for India 2025',
    description: 'The most in-demand keywords for software engineers, MBAs, freshers, data scientists, and more.',
    readTime: '8 min',
    href: '/blog/resume-keywords-india',
    tag: 'Keywords',
  },
  {
    title: 'How AI Resume Builders Work',
    description: 'Why AI resume builders outperform templates -- and what to look for in a good one.',
    readTime: '6 min',
    href: '/blog/ai-resume-builder-guide',
    tag: 'AI Tools',
  },
  {
    title: '10 Mock Interview Tips',
    description: 'Proven techniques to prepare for any job interview -- from STAR method to AI practice.',
    readTime: '7 min',
    href: '/blog/mock-interview-tips',
    tag: 'Interview Prep',
  },
];

const faqs = [
  {
    q: 'What is an ATS score and why does it matter?',
    a: 'An ATS (Applicant Tracking System) score is a numerical rating given to your resume based on how well it matches a job description. Most companies use ATS to automatically filter out resumes with low scores before a human ever reads them. A score above 80% gives you the best chance of being shortlisted.',
  },
  {
    q: 'How do I check my ATS score for free?',
    a: "Use careerstart.in's free ATS Score Checker. Upload your resume (PDF or DOCX) and paste the job description. You will get your score, keyword gaps, format issues, and improvement suggestions in under 60 seconds. No signup required.",
  },
  {
    q: 'What is a good ATS score for Indian companies?',
    a: 'For Indian MNCs and top startups (Infosys, Wipro, Zomato, Flipkart, etc.), aim for 80%+ on ATS. For FAANG India offices, 85%+ is ideal. Scores below 60% are typically auto-rejected by most ATS systems.',
  },
  {
    q: 'Does careerstart.in work for freshers and students?',
    a: "Yes, absolutely. careerstart.in is especially useful for freshers and final-year students preparing for campus placements. Our ATS checker, resume builder, and mock interview tool are all designed to help entry-level candidates compete effectively.",
  },
  {
    q: 'Can I use AI to build a resume for specific companies?',
    a: "Yes. careerstart.in's AI Resume Builder lets you input the job description from any company and generates a resume tailored to that role's specific keyword patterns and requirements. This dramatically increases your ATS score for that application.",
  },
  {
    q: 'How is careerstart.in different from other resume tools?',
    a: "Most resume tools focus on design. careerstart.in focuses on outcomes -- getting you past ATS filters and into interviews. We combine ATS scoring, AI resume building, mock interviews, and auto-apply in one platform, built specifically for the Indian job market.",
  },
];

export default function ResourcesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ padding: '80px 0 64px', background: 'var(--background-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              Free Career Resources
            </span>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Everything You Need to<br />
              <span style={{ color: 'var(--text-accent)' }}>Land Your Dream Job</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 32px', lineHeight: 1.7 }}>
              Free tools, guides, templates, and expert advice -- curated specifically for Indian job seekers and freshers.
            </p>
          </div>
        </section>

        <div className="container" style={{ padding: '64px 24px' }}>

          {/* Tools Section */}
          <section style={{ marginBottom: '80px' }}>
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>AI-Powered Tools</p>
              <h2 style={{ fontSize: '32px', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Our Career Tools</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {tools.map((tool, i) => (
                <div key={i} style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '28px' }}>{tool.icon}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '9999px', background: tool.color + '20', color: tool.color }}>
                      {tool.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>{tool.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>{tool.description}</p>
                  <Link href={tool.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--accent)', color: '#0F0F0F', padding: '10px 20px', borderRadius: '9999px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', width: 'fit-content', marginTop: '4px' }}>
                    {tool.cta}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Guides Section */}
          <section style={{ marginBottom: '80px' }}>
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Expert Guides</p>
              <h2 style={{ fontSize: '32px', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Career Guides and Articles</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {guides.map((guide, i) => (
                <Link key={i} href={guide.href} style={{ textDecoration: 'none' }}>
                  <article style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '9999px', background: 'var(--background-tertiary)', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600, marginBottom: '14px', width: 'fit-content' }}>
                      {guide.tag}
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '10px', flex: 1 }}>{guide.title}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>{guide.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{guide.readTime} read</span>
                      <span style={{ color: 'var(--text-accent)', fontWeight: 600 }}>Read guide</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1.5px solid var(--border)', color: 'var(--text-primary)', padding: '11px 24px', borderRadius: '9999px', fontWeight: 500, fontSize: '14px', textDecoration: 'none' }}>
                View All Articles
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section style={{ marginBottom: '64px' }}>
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Common Questions</p>
              <h2 style={{ fontSize: '32px', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Frequently Asked Questions</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {faqs.map((faq, i) => (
                <details key={i} style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px 26px', cursor: 'pointer' }}>
                  <summary style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', listStyle: 'none', lineHeight: 1.4 }}>
                    {faq.q}
                  </summary>
                  <p style={{ marginTop: '14px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '64px 40px', background: 'var(--background-secondary)', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Start With Your Free ATS Score
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '17px', maxWidth: '480px', margin: '0 auto 28px' }}>
              Find out exactly why you are not getting callbacks -- and fix it in minutes.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/ats-checker" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#0F0F0F', padding: '14px 32px', borderRadius: '9999px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
                Check My ATS Score Free
              </Link>
              <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1.5px solid var(--border)', color: 'var(--text-primary)', padding: '14px 28px', borderRadius: '9999px', fontWeight: 500, fontSize: '15px', textDecoration: 'none' }}>
                Browse All Articles
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
