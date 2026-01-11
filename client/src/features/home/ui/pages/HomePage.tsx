import GameStore from "@/pages/games/FeaturedGame";
import { HeroSection } from "../components/HeroSection";
import FeaturedEvents from "@/pages/events/FeaturedEvents";
import TrustedOrgs from "@/pages/home/TrustedOrgs";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <TrustedOrgs />
      <GameStore />
      <FeaturedEvents />
    </>
  );
};

export default HomePage;
