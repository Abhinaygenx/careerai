'use client';

import Link from 'next/link';
import { blogPosts } from '@/app/blog/blogData';

const categoryColors: Record<string, string> = {
  purple: '#8B7CF7',
  green: '#22C55E',
  blue: '#4DA3FF',
  orange: '#F97316',
};

export default function BlogSection() {
  const featured = blogPosts.slice(0, 3);

  return (
    <section style={{ padding: '100px 0', background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              Resources and Blog
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Career Guides and Expert Advice
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.6 }}>
              Free guides on ATS optimization, resume writing, interview prep -- everything you need to get hired faster.
            </p>
          </div>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1.5px solid var(--border)', color: 'var(--text-primary)', padding: '10px 22px', borderRadius: '9999px', fontWeight: 500, fontSize: '13px', textDecoration: 'none', flexShrink: 0 }}>
            View All Articles
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {featured.map((post) => (
            <Link key={post.slug} href={'/blog/' + post.slug} style={{ textDecoration: 'none' }}>
              <article style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: categoryColors[post.categoryColor], borderRadius: '16px 16px 0 0' }} />
                <div style={{ marginTop: '8px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '9999px', background: categoryColors[post.categoryColor] + '18', color: categoryColors[post.categoryColor], fontSize: '11px', fontWeight: 600, marginBottom: '16px' }}>
                    {post.category}
                  </span>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '12px' }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                    {post.description.length > 110 ? post.description.slice(0, 110) + '...' : post.description}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-light)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{post.readTime} min read</span>
                  <span style={{ color: 'var(--text-accent)', fontWeight: 600, fontSize: '13px' }}>Read more</span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', padding: '24px', background: 'var(--background-secondary)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Also explore:</span>
          {[
            { label: 'Career Guides', href: '/resources' },
            { label: 'Resume Tips', href: '/blog/how-to-beat-ats' },
            { label: 'ATS Keywords', href: '/blog/resume-keywords-india' },
            { label: 'Interview Prep', href: '/blog/mock-interview-tips' },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', padding: '6px 14px', borderRadius: '9999px', border: '1px solid var(--border)' }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}