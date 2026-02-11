import GameSection from "../components/GameSection";
import { HeroSection } from "../components/HeroSection";
import FeaturedEvents from "@/features/events/ui/components/FeaturedEvents";
import { PlatformFeatures } from "../components/PlatformFeatures";
import { UniqueFeatures } from "../components/UniqueFeatures";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <PlatformFeatures />
      <GameSection />
      <UniqueFeatures />
      <FeaturedEvents />
    </>
  );
};

export default HomePage;
