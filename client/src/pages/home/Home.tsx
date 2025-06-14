import GameStore from "../games/FeaturedGame";
import WhatsNew from "./WhatsNew";
import FeaturedEvents from "../events/FeaturedEvents";
import TrendingEvents from "../events/trending/TrendingEvents";
import { eventData } from "@/lib/constants";
import EsportsRankings from "@/ui/esports-rankings/EsportsRankings";
import PremiumServices from "@/ui/premium/PremiumServices";
import Hero from "./Hero";

const Home = () => {
  return (
    <>
      <Hero />
      <WhatsNew />
      <TrendingEvents events={eventData} />
      <GameStore />
      <FeaturedEvents />
      <EsportsRankings />
      <PremiumServices />
    </>
  );
};

export default Home;
