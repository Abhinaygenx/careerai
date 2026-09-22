import { Metadata } from 'next';
import { getSiteUrl } from '@/lib/siteConfig';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Internship Calendar 2026 — Deadlines & Direct Applications | careerstart.in',
  description: 'Track summer 2026 and off-campus internship deadlines in India and globally. Direct application links, stipend details, and calendar integration.',
  keywords: 'internship calendar 2026, internships India, summer internships, student internships, tech internships, careerstart',
  alternates: {
    canonical: `${siteUrl}/internships/calendar`,
  },
  openGraph: {
    title: 'Internship Calendar 2026 | careerstart.in',
    description: 'Track upcoming internship deadlines with direct apply links on careerstart.in.',
    url: `${siteUrl}/internships/calendar`,
    siteName: 'careerstart.in',
    type: 'website',
  },
};

export default function InternshipCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
