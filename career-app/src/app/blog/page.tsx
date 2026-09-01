import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { blogPosts } from './blogData';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://careerstart.in').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Career Blog — ATS Tips, Resume Guides & Interview Advice | careerstart.in',
  description: "Free career guides, ATS score tips, resume writing advice, and interview preparation articles. India's best career resource for job seekers and freshers.",
  keywords: 'ATS score checker tips, resume tips India, career advice freshers, interview preparation, AI resume builder guide, how to beat ATS',
  openGraph: {
    title: 'Career Blog | careerstart.in',
    description: "Free career guides, ATS tips, and resume advice from India's #1 career platform.",
    url: `${siteUrl}/blog`,
    siteName: 'careerstart.in',
    type: 'website',
  },
  alternates: { canonical: `${siteUrl}/blog` },
};

const categoryColors: Record<string, string> = {
  purple: '#8B7CF7',
  green: '#22C55E',
  blue: '#4DA3FF',
  orange: '#F97316',
};

export default function BlogPage() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <>
      <Header />
      <main style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ padding: '80px 0 60px', background: 'var(--background-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              Resources and Guides
            </span>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Career Blog by <span style={{ color: 'var(--text-accent)' }}>careerstart.in</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 32px', lineHeight: 1.7 }}>
              Free guides on ATS optimization, resume writing, interview prep, and everything you need to land your dream job in India.
            </p>
            <Link href="/ats-checker" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#0F0F0F', padding: '12px 28px', borderRadius: '9999px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
              Check Your ATS Score Free
            </Link>
          </div>
        </section>

        <div className="container" style={{ padding: '60px 24px' }}>
          {/* Featured Post */}
          <div style={{ marginBottom: '64px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '20px' }}>Featured Article</p>
            <Link href={'/blog/' + featured.slug} style={{ textDecoration: 'none' }}>
              <article style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', background: 'var(--background-secondary)', border: '1px solid var(--border)', borderRadius: '20px', padding: '48px', cursor: 'pointer' }}>
                <div>
                  <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', background: categoryColors[featured.categoryColor] + '20', color: categoryColors[featured.categoryColor], fontSize: '12px', fontWeight: 600, marginBottom: '20px' }}>
                    {featured.category}
                  </span>
                  <h2 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)', marginBottom: '16px' }}>{featured.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>{featured.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span>{featured.publishedAt}</span>
                    <span>|</span>
                    <span>{featured.readTime} min read</span>
                  </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', padding: '32px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', fontWeight: 700, color: '#C4F82A', letterSpacing: '-2px', lineHeight: 1 }}>85%</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginTop: '8px' }}>ATS Score</div>
                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', height: '6px', marginTop: '16px' }}>
                      <div style={{ width: '85%', background: '#C4F82A', borderRadius: '9999px', height: '6px' }} />
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </div>

          {/* All Other Posts */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '24px' }}>All Articles</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {rest.map((post) => (
                <Link key={post.slug} href={'/blog/' + post.slug} style={{ textDecoration: 'none' }}>
                  <article style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '9999px', background: categoryColors[post.categoryColor] + '20', color: categoryColors[post.categoryColor], fontSize: '11px', fontWeight: 600, marginBottom: '16px', width: 'fit-content' }}>
                      {post.category}
                    </span>
                    <h3 style={{ fontSize: '17px', fontWeight: 500, lineHeight: 1.3, color: 'var(--text-primary)', marginBottom: '12px', flex: 1 }}>{post.title}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>{post.description.slice(0, 120)}...</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>{post.readTime} min read</span>
                      <span style={{ color: 'var(--text-accent)', fontWeight: 500 }}>Read</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: '80px', textAlign: 'center', padding: '60px 40px', background: 'var(--background-secondary)', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '12px' }}>Ready to Put These Tips to Work?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '16px' }}>Check your ATS score for free -- no signup required.</p>
            <Link href="/ats-checker" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#0F0F0F', padding: '14px 32px', borderRadius: '9999px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
              Check Your ATS Score Now -- Free
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}