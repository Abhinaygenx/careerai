import { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://careerstart.in').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Pricing Plans — Affordable Career Intelligence Tools | careerstart.in',
  description: 'Explore simple, affordable pricing plans for careerstart.in AI tools. Free ATS score checks, unlimited resume enhancements, and interview practice.',
  keywords: 'careerstart pricing, ATS checker price, AI career tools plans',
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
  openGraph: {
    title: 'Pricing Plans | careerstart.in',
    description: 'Affordable plans for ATS checks, resume building, and interview preparation.',
    url: `${siteUrl}/pricing`,
    siteName: 'careerstart.in',
    type: 'website',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
