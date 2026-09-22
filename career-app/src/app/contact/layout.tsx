import { Metadata } from 'next';
import { getSiteUrl } from '@/lib/siteConfig';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Contact Us & Feedback | careerstart.in',
  description: 'Get in touch with the careerstart.in team. Share feedback, submit feature suggestions, or reach out for support.',
  keywords: 'contact careerstart, support careerstart, careerstart in contact',
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'Contact Us & Feedback | careerstart.in',
    description: 'Get in touch with the careerstart.in team for support, questions, or feedback.',
    url: `${siteUrl}/contact`,
    siteName: 'careerstart.in',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
