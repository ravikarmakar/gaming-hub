import GameSection from "../components/GameSection";
import { HeroSection } from "../components/HeroSection";
import FeaturedEvents from "@/features/events/ui/components/FeaturedEvents";
import { PlatformFeatures } from "../components/PlatformFeatures";
import { UniqueFeatures } from "../components/UniqueFeatures";
import { StatsSection } from "../components/StatsSection";
import { TopTeamsSection } from "../components/TopTeamsSection";
import { CommunitySection } from "../components/CommunitySection";
import { SponsorsSection } from "../components/SponsorsSection";
import { NewsletterSection } from "../components/NewsletterSection";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <PlatformFeatures />
      <StatsSection />
      <GameSection />
      <UniqueFeatures />
      <TopTeamsSection />
      <FeaturedEvents />
      <CommunitySection />
      <SponsorsSection />
      <NewsletterSection />
    </>
  );
};

export default HomePage;
