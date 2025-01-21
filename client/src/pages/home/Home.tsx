import FeaturedEvents from "../events/FeaturedEvents";
import GameStore from "../games/FeaturedGame";
import HeroSection from "./Hero";
import AboutSection from "../../components/AboutSection";
import RankingsSection from "../team/player/ranking/RankingsSection";

// temp

import { TournamentsSection } from "@/components/tournaments-section";
import { ContactSection } from "@/components/contact-section";

import ServicesPage from "../service/Service";

const Home = () => {
  return (
    <>
      <HeroSection />
      <GameStore />
      <FeaturedEvents />
      <RankingsSection />
      <ServicesPage />
      <AboutSection />
      <TournamentsSection />
      <ContactSection />
    </>
  );
};

export default Home;
