import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://careerstart.in').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: "careerstart.in — Free ATS Score Checker & AI Career Tools",
  description: "Check your ATS score instantly with our free ATS score checker. India's #1 AI career platform — resume builder, mock interviews, auto apply & more. Used by 50,000+ students.",
  keywords: "ATS score checker, free ATS score checker, ATS resume checker India, resume score checker, AI resume builder, ATS score, how to improve ATS score, careerstart, career start, resume builder India, mock interview AI, auto apply jobs India",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'careerstart.in — Free ATS Score Checker & AI Career Tools',
    description: "India's #1 AI career platform. Free ATS score checker, AI resume builder, mock interviews & auto apply. Used by 50,000+ students.",
    url: siteUrl,
    siteName: 'careerstart.in',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'careerstart.in — Free ATS Score Checker',
    description: "Check your ATS score free. AI resume builder, mock interviews & auto apply. India's top career platform.",
    site: '@careerstartIN',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: {
    canonical: siteUrl,
  },
};

import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
