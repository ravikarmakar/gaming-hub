import GameStore from "../games/FeaturedGame";
import HeroSection from "./HeroSection";
import WhatsNew from "./WhatsNew";
import FeaturedEvents from "../events/FeaturedEvents";
import TrendingEvents from "../events/trending/TrendingEvents";
import { eventData } from "@/lib/constants";
import EsportsRankings from "@/components/esports-rankings/EsportsRankings";
import PremiumServices from "@/components/premium/PremiumServices";

const Home = () => {
  return (
    <>
      <HeroSection />
      <WhatsNew />
      <TrendingEvents events={eventData} />
      <GameStore />
      <FeaturedEvents />
      <EsportsRankings />
      {/* <CommunitySection /> */}
      <PremiumServices />
    </>
  );
};

export default Home;
