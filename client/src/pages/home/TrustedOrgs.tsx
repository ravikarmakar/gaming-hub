import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import svg from "../../../public/logos/PROPLAYZFF_1.svg";

interface Organization {
  name: string;
  logo: string;
}

const organizations: Organization[] = [
  { name: "ESL Gaming", logo: svg },
  { name: "Riot Games", logo: "/logos/riot.svg" },
  { name: "FACEIT", logo: "/logos/faceit.svg" },
  { name: "DreamHack", logo: "/logos/dreamhack.svg" },
  { name: "BLAST", logo: "/logos/blast.svg" },
  { name: "PGL", logo: "/logos/pgl.svg" },
  { name: "Riot Games", logo: "/logos/riot.svg" },
  { name: "FACEIT", logo: "/logos/faceit.svg" },
  { name: "DreamHack", logo: "/logos/dreamhack.svg" },
  { name: "BLAST", logo: "/logos/blast.svg" },
  { name: "PGL", logo: "/logos/pgl.svg" },
];

const TrustedOrgs = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const controls = useAnimation();
  const [clonedOrgs, setClonedOrgs] = useState<Organization[]>([]);

  useEffect(() => {
    if (isMobile) {
      // Clone organizations for seamless loop
      setClonedOrgs([...organizations, ...organizations]);
      controls.start({
        x: [0, -1920], // Start from 0 and scroll to -1920px
        transition: {
          x: {
            repeat: Infinity, // Infinite scrolling
            repeatType: "loop", // Continuous loop
            duration: 30, // Animation duration
            ease: "linear", // Smooth movement
          },
        },
      });
    } else {
      // Stop animation for non-mobile
      controls.stop();
      controls.set({ x: 0 });
      setClonedOrgs(organizations);
    }
  }, [isMobile, controls]);

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4"
      >
        <h5 className="text-center text-sm font-semibold opacity-50 mb-8 text-gray-200">
          Trusted by Leading Organizations
        </h5>

        <motion.div
          className={`flex ${
            isMobile ? "justify-start" : "justify-center flex-wrap gap-8"
          } items-center`}
          animate={controls}
          style={{
            width: isMobile ? "calc(200% + 2rem)" : "100%",
          }}
        >
          {clonedOrgs.map((org, index) => (
            <motion.div
              key={`${org.name}-${index}`}
              className={`flex flex-col items-center ${
                isMobile ? "mx-8" : "mx-4"
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-20 h-20 mb-2 flex items-center justify-center">
                <img
                  src={org.logo}
                  alt={`${org.name} logo`}
                  className="max-w-full max-h-full object-contain filter brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-sm text-gray-400 text-center">{org.name}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TrustedOrgs;
