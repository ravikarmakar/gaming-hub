import GameStore from "../games/FeaturedGame";
import HeroSection from "./HeroSection";
import ServicesPage from "../service/Service";
import CommunitySection from "../community/CommunitySection";
import WhatsNew from "./WhatsNew";
import FeaturedEvents from "../events/FeaturedEvents";
import RankingsSection from "../team/player/ranking/RankingsSection";
import TrendingEvents from "../events/trending/TrendingEvents";
import { eventData } from "@/lib/constants";
import EsportsRankings from "@/components/esports-rankings/EsportsRankings";

const Home = () => {
  return (
    <>
      <HeroSection />
      <WhatsNew />
      <TrendingEvents events={eventData} />
      <GameStore />
      <FeaturedEvents />
      <EsportsRankings />
      <RankingsSection />
      <CommunitySection />
      <ServicesPage />
    </>
  );
};

export default Home;
