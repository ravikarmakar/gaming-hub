import { Suspense, lazy } from "react";
import GameSection from "../components/GameSection";
import { HeroSection } from "../components/HeroSection";
import { PlatformFeatures } from "../components/PlatformFeatures";

// Lazy-loaded components for below-the-fold content to improve initial load time
const FeaturedEvents = lazy(() => import("@/features/events/ui/components/FeaturedEvents"));
const UniqueFeatures = lazy(() => import("../components/UniqueFeatures").then(module => ({ default: module.UniqueFeatures })));
const StatsSection = lazy(() => import("../components/StatsSection").then(module => ({ default: module.StatsSection })));
const WhyChooseUsSection = lazy(() => import("../components/WhyChooseUsSection").then(module => ({ default: module.WhyChooseUsSection })));
const HowItWorksSection = lazy(() => import("../components/HowItWorksSection").then(module => ({ default: module.HowItWorksSection })));
const TestimonialsSection = lazy(() => import("../components/TestimonialsSection").then(module => ({ default: module.TestimonialsSection })));

const HomePage = () => {
  return (
    <>
      {/* 1. Cinematic hook + CTA (Critical - Loads Immediately) */}
      <HeroSection />

      {/* 2. Scrolling feature marquee (trust signals) (Critical - Loads Immediately) */}
      <PlatformFeatures />

      {/* 3. Choose Your Battlefield (High Priority - Loads Immediately) */}
      <GameSection />

      {/* Lazy-loaded sections below the fold */}
      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center bg-[#02000a] text-purple-500/50">Loading...</div>}>
        {/* 4. Social proof numbers */}
        <StatsSection />

        {/* 5. Problem → Solution narrative */}
        <WhyChooseUsSection />

        {/* 6. 4-step user journey */}
        <HowItWorksSection />

        {/* 7. Core Suite deep-dive */}
        <UniqueFeatures />

        {/* 8. Live tournaments */}
        <FeaturedEvents />

        {/* 9. Player reviews */}
        <TestimonialsSection />
      </Suspense>
    </>
  );
};

export default HomePage;
