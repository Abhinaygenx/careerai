import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/features/HeroSection';
import StatsSection from '@/components/features/StatsSection';
import FeaturesSection from '@/components/features/FeaturesSection';
import HowItWorks from '@/components/features/HowItWorks';
import Testimonials from '@/components/features/Testimonials';
import PricingSection from '@/components/features/PricingSection';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorks />
        <Testimonials />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
