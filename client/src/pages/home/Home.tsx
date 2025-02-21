import GameStore from "../games/FeaturedGame";
import HeroSection from "./HeroSection";
import ServicesPage from "../service/Service";
import CommunitySection from "../community/CommunitySection";
import WhatsNew from "./WhatsNew";
import FeaturedEvents from "../events/FeaturedEvents";
import RankingsSection from "../team/player/ranking/RankingsSection";
import TrendingEvents from "../events/trending/TrendingEvents";
import { eventData } from "@/lib/constants";

const Home = () => {
  return (
    <>
      <HeroSection />
      <WhatsNew />
      <TrendingEvents events={eventData} />
      <GameStore />
      <FeaturedEvents />
      <RankingsSection />
      <CommunitySection />
      <ServicesPage />
    </>
  );
};

export default Home;
