import { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://careerstart.in').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'AI Cover Letter Generator — Custom Cover Letters in Seconds | careerstart.in',
  description: 'Generate personalized, job-specific cover letters tailored to each job description using AI on careerstart.in.',
  keywords: 'AI cover letter generator, free cover letter builder, cover letter AI, tailored cover letters',
  alternates: {
    canonical: `${siteUrl}/cover-letter`,
  },
  openGraph: {
    title: 'AI Cover Letter Generator — Custom Cover Letters in Seconds | careerstart.in',
    description: 'Generate tailored cover letters for any job application in seconds.',
    url: `${siteUrl}/cover-letter`,
    siteName: 'careerstart.in',
    type: 'website',
  },
};

export default function CoverLetterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
