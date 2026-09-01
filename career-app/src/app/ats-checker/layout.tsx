import { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://careerstart.in').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'ATS Score Checker — Free Resume Checker Online | careerstart.in',
  description: 'Use our free ATS score checker to test if your resume will pass applicant tracking systems. Instant analysis, keyword matching, formatting score, and actionable improvements.',
  keywords: 'ATS score checker, free resume checker online, applicant tracking system check, ATS resume test, ATS scanner, ATS score India',
  alternates: {
    canonical: `${siteUrl}/ats-checker`,
  },
  openGraph: {
    title: 'ATS Score Checker — Free Resume Checker Online | careerstart.in',
    description: 'Test your resume against applicant tracking systems in 60 seconds with our free ATS score checker.',
    url: `${siteUrl}/ats-checker`,
    siteName: 'careerstart.in',
    type: 'website',
  },
};

export default function ATSCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
