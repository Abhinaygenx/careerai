import { Metadata } from 'next';
import { getSiteUrl } from '@/lib/siteConfig';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'AI Auto Apply — Automate Job Applications | careerstart.in',
  description: 'Automate your job search and apply to hundreds of relevant jobs automatically with customized resume matching on careerstart.in.',
  keywords: 'AI auto apply, automatic job application, auto apply bot, job search automation, auto apply India',
  alternates: {
    canonical: `${siteUrl}/auto-apply`,
  },
  openGraph: {
    title: 'AI Auto Apply — Automate Job Applications | careerstart.in',
    description: 'Automate your job search and apply to hundreds of relevant jobs automatically.',
    url: `${siteUrl}/auto-apply`,
    siteName: 'careerstart.in',
    type: 'website',
  },
};

export default function AutoApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
