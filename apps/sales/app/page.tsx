import HeroSection from "@/components/landing/hero-section";
import ProblemSection from "@/components/landing/problem-section";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works";
import ClientSection from "@/components/landing/client-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import ROICalculatorSection from "@/components/landing/roi-calculator";
import PricingSection from "@/components/landing/pricing-section";
import FAQSection from "@/components/landing/faq-section";
import UrgencySection from "@/components/landing/urgency-section";
import CallToActionSection from "@/components/landing/cta-section";
import Particles from "@/components/magicui/particles";

export default function Page() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ClientSection />
      <TestimonialsSection />
      <ROICalculatorSection />
      <PricingSection />
      <FAQSection />
      <UrgencySection />
      <CallToActionSection />
      <Particles
        className="absolute inset-0 -z-10"
        quantity={50}
        ease={70}
        size={0.05}
        staticity={40}
        color={"#ffffff"}
      />
    </>
  );
} 