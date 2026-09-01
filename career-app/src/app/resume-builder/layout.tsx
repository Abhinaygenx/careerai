import { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://careerstart.in').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'AI Resume Builder — ATS-Optimized Resumes | careerstart.in',
  description: 'Create tailored, ATS-friendly resumes in minutes with our AI Resume Builder. Matched against real hiring patterns at top companies.',
  keywords: 'AI resume builder, ATS resume builder, resume maker online, resume builder India, free resume creator',
  alternates: {
    canonical: `${siteUrl}/resume-builder`,
  },
  openGraph: {
    title: 'AI Resume Builder — ATS-Optimized Resumes | careerstart.in',
    description: 'Build job-winning, ATS-optimized resumes with AI in minutes.',
    url: `${siteUrl}/resume-builder`,
    siteName: 'careerstart.in',
    type: 'website',
  },
};

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
