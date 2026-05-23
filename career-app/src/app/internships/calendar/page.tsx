import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CalendarClient from './CalendarClient';
import { getInternshipsForMonth } from '@/lib/internships';
import { Suspense } from 'react';

export const revalidate = 0; // Force SSR

interface PageProps {
  searchParams: Promise<{ month?: string; india?: string }>;
}

export default async function InternshipCalendarPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const month = resolvedParams.month || defaultMonth;
  const isIndia = resolvedParams.india === 'true';

  // Server-side fetch (SSR)
  const initialInternships = await getInternshipsForMonth(month, isIndia);

  return (
    <>
      <Header />
      <main className="dot-grid-light min-h-screen bg-[var(--background)]">
        <Suspense fallback={<div className="container py-12 text-center text-[var(--text-muted)]">Loading calendar...</div>}>
          <CalendarClient initialInternships={initialInternships} initialMonth={month} isIndia={isIndia} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
