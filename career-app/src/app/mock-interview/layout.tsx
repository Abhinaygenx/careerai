import { Metadata } from 'next';
import { getSiteUrl } from '@/lib/siteConfig';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'AI Mock Interview — Real-Time Practice & Feedback | careerstart.in',
  description: 'Practice real job interview questions with our interactive AI Mock Interviewer. Get instant analysis on your answers, communication, and confidence.',
  keywords: 'AI mock interview, practice interview questions, interview preparation, AI interview coach, mock interview online',
  alternates: {
    canonical: `${siteUrl}/mock-interview`,
  },
  openGraph: {
    title: 'AI Mock Interview — Real-Time Practice & Feedback | careerstart.in',
    description: 'Practice interview questions with AI and get instant feedback to ace your next job interview.',
    url: `${siteUrl}/mock-interview`,
    siteName: 'careerstart.in',
    type: 'website',
  },
};

export default function MockInterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
