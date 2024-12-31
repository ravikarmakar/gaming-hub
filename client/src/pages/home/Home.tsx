import FeaturedEvents from "../events/FeaturedEvents";
import GameStore from "../games/FeaturedGame";
import HeroSection from "./Hero";
import AboutSection from "../../components/AboutSection";

// temp

import { TournamentsSection } from "@/components/tournaments-section";
import { ContactSection } from "@/components/contact-section";
import { RankingsSection } from "../player/ranking/RankingsSection";

const Home = () => {
  return (
    <>
      <HeroSection />
      <GameStore />
      <FeaturedEvents />
      <RankingsSection />
      <AboutSection />
      <TournamentsSection />
      <ContactSection />
    </>
  );
};

export default Home;
