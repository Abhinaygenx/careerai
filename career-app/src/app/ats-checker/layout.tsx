import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ATS Score Checker - Free Resume Checker Online | Career.AI',
  description: 'Use our free ATS score checker to test if your resume will pass applicant tracking systems. Instant analysis, keyword matching, formatting score, and actionable improvements.',
  keywords: 'ATS score checker, free resume checker online, applicant tracking system check, ATS resume test, ATS scanner',
};

export default function ATSCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
