import GameStore from "@/pages/games/FeaturedGame";
import { HeroSection } from "../components/HeroSection";
import FeaturedEvents from "@/features/events/ui/components/FeaturedEvents";
import { PlatformFeatures } from "../components/PlatformFeatures";
import { UniqueFeatures } from "../components/UniqueFeatures";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <PlatformFeatures />
      <UniqueFeatures />
      <FeaturedEvents />
      <GameStore />
    </>
  );
};

export default HomePage;
