import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { blogPosts, getBlogPost, getRelatedPosts } from '../blogData';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | careerstart.in`,
    description: post.description,
    keywords: post.keywords.join(', '),
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://careerstart.in/blog/${post.slug}`,
      siteName: 'careerstart.in',
      type: 'article',
      publishedTime: post.publishedAt,
    },
    alternates: { canonical: `https://careerstart.in/blog/${post.slug}` },
  };
}

const categoryColors: Record<string, string> = {
  purple: '#8B7CF7',
  green: '#22C55E',
  blue: '#4DA3FF',
  orange: '#F97316',
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.relatedSlugs);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { '@type': 'Organization', name: 'careerstart.in' },
    publisher: { '@type': 'Organization', name: 'careerstart.in', url: 'https://careerstart.in' },
    url: `https://careerstart.in/blog/${post.slug}`,
    keywords: post.keywords.join(', '),
  };

  const faqSections = post.content.filter((s) => s.type === 'faq' && s.faqs);
  const allFaqs = faqSections.flatMap((s) => s.faqs!);
  const faqJsonLd = allFaqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <Header />
      <main style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '80px' }}>

        {/* Article Header */}
        <section style={{ padding: '64px 0 48px', background: 'var(--background-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: '760px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/blog" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>
                &larr; Blog
              </Link>
              <span style={{ color: 'var(--border)' }}>/</span>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: categoryColors[post.categoryColor] + '20',
                color: categoryColors[post.categoryColor],
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {post.category}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 500,
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}>
              {post.title}
            </h1>

            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '28px' }}>
              {post.description}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              fontSize: '13px',
              color: 'var(--text-muted)',
              paddingBottom: '28px',
              borderBottom: '1px solid var(--border)',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C4F82A, #9EE01A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700, color: '#0F0F0F',
                }}>C</div>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{post.author}</div>
                  <div style={{ fontSize: '12px' }}>{post.authorRole}</div>
                </div>
              </div>
              <span>&middot;</span>
              <span>{post.publishedAt}</span>
              <span>&middot;</span>
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </section>

        {/* Article Body */}
        <div className="container" style={{ maxWidth: '760px', padding: '48px 24px' }}>
          <article>
            {post.content.map((section, i) => {
              switch (section.type) {
                case 'intro':
                  return (
                    <p key={i} style={{
                      fontSize: '18px',
                      lineHeight: 1.8,
                      color: 'var(--text-secondary)',
                      marginBottom: '36px',
                      borderLeft: '3px solid var(--accent)',
                      paddingLeft: '20px',
                    }}>
                      {section.text}
                    </p>
                  );
                case 'h2':
                  return (
                    <h2 key={i} style={{
                      fontSize: '26px',
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                      color: 'var(--text-primary)',
                      marginTop: '48px',
                      marginBottom: '16px',
                      lineHeight: 1.2,
                    }}>
                      {section.text}
                    </h2>
                  );
                case 'h3':
                  return (
                    <h3 key={i} style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>
                      {section.text}
                    </h3>
                  );
                case 'p':
                  return (
                    <p key={i} style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      {section.text}
                    </p>
                  );
                case 'ul':
                  return (
                    <ul key={i} style={{ marginBottom: '24px', paddingLeft: '0', listStyle: 'none' }}>
                      {section.items?.map((item, j) => (
                        <li key={j} style={{ display: 'flex', gap: '12px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '12px' }}>
                          <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '4px' }}>&#9658;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                case 'ol':
                  return (
                    <ol key={i} style={{ marginBottom: '24px', paddingLeft: '0', listStyle: 'none' }}>
                      {section.items?.map((item, j) => (
                        <li key={j} style={{ display: 'flex', gap: '16px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px', alignItems: 'flex-start' }}>
                          <span style={{
                            minWidth: '28px', height: '28px', borderRadius: '50%',
                            background: 'var(--accent)', color: '#0F0F0F',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 700, flexShrink: 0,
                          }}>
                            {j + 1}
                          </span>
                          <span style={{ paddingTop: '4px' }}>{item}</span>
                        </li>
                      ))}
                    </ol>
                  );
                case 'callout':
                  return (
                    <div key={i} style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '20px 24px',
                      margin: '32px 0',
                      fontSize: '15px',
                      lineHeight: 1.7,
                      color: 'var(--text-primary)',
                    }}>
                      {section.text}
                    </div>
                  );
                case 'cta':
                  return (
                    <div key={i} style={{
                      margin: '40px 0',
                      textAlign: 'center',
                      padding: '40px',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      borderRadius: '16px',
                      border: '1px solid #86efac',
                    }}>
                      <Link href={section.ctaHref || '/ats-checker'} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#0F0F0F',
                        color: '#C4F82A',
                        padding: '14px 32px',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        fontSize: '15px',
                        textDecoration: 'none',
                      }}>
                        {section.text} &#8594;
                      </Link>
                    </div>
                  );
                case 'faq':
                  return (
                    <div key={i} style={{ marginTop: '48px' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '24px' }}>
                        Frequently Asked Questions
                      </h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {section.faqs?.map((faq, j) => (
                          <details key={j} style={{
                            background: 'var(--background-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '20px 24px',
                          }}>
                            <summary style={{
                              fontSize: '16px',
                              fontWeight: 500,
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              listStyle: 'none',
                            }}>
                              {faq.q}
                            </summary>
                            <p style={{ marginTop: '12px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                              {faq.a}
                            </p>
                          </details>
                        ))}
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </article>

          {/* Related Posts */}
          {related.length > 0 && (
            <div style={{ marginTop: '72px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '24px' }}>Related Articles</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {related.map((rel) => (
                  <Link key={rel.slug} href={`/blog/${rel.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '20px',
                      height: '100%',
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: categoryColors[rel.categoryColor] + '20',
                        color: categoryColors[rel.categoryColor],
                        fontSize: '11px',
                        fontWeight: 600,
                        marginBottom: '10px',
                      }}>
                        {rel.category}
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '8px' }}>
                        {rel.title}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-accent)', fontWeight: 500 }}>Read article &#8594;</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div style={{
            marginTop: '64px',
            textAlign: 'center',
            padding: '48px',
            background: 'var(--background-secondary)',
            borderRadius: '20px',
            border: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: '26px', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Put This Into Practice
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
              Check your resume ATS score for free &mdash; takes 60 seconds.
            </p>
            <Link href="/ats-checker" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--accent)',
              color: '#0F0F0F',
              padding: '13px 28px',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
            }}>
              Check My ATS Score Free &#8594;
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
