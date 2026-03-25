import { BackgroundEffects } from "@/components/landing/BackgroundEffects";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { USSDSection } from "@/components/landing/USSDSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-white selection:bg-[var(--color-orange)] selection:text-indigo-200">
      <BackgroundEffects />
      <LandingNavbar />
      
      <div className="relative z-10">
        <Hero />
        <Stats />
        <Features />
        <USSDSection />
        <DashboardPreview />
        <HowItWorks />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
