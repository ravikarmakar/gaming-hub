import { motion } from "framer-motion";
import { SocialLinks } from "./components/SocialLinks";
import { GameLinks } from "./components/GameLinks";
import { Newsletter } from "./components/Newsletter";
import { Logo } from "../Logo";
import { ChevronRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-black py-16 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-purple-500/20 to-transparent opacity-30" />
        </div>
      </div>

      {/* Glowing Lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

      <div className="relative container mx-auto px-4">
        {/* Top Section */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Left Column - Brand & Newsletter */}
          <div className="space-y-8">
            <Logo />
            <div className="max-w-md">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-orbitron mb-4">
                Level Up Your Gaming Experience
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Join the elite gaming community. Get exclusive access to
                tournaments, rewards, and connect with gamers worldwide.
              </p>
            </div>
            <Newsletter />
          </div>

          {/* Right Column - Game Categories & Social */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <GameLinks />
            <div className="space-y-8">
              <div>
                <h3 className="text-white font-orbitron font-bold mb-4 flex items-center">
                  <ChevronRight className="w-5 h-5 text-cyan-500" />
                  Connect
                </h3>
                <SocialLinks />
              </div>
              <div>
                <h3 className="text-white font-orbitron font-bold mb-4 flex items-center">
                  <ChevronRight className="w-5 h-5 text-cyan-500" />
                  Support
                </h3>
                <ul className="space-y-2">
                  {["Help Center", "Terms", "Privacy", "Contact"].map(
                    (item) => (
                      <motion.li
                        key={item}
                        whileHover={{ x: 5 }}
                        className="text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        {item}
                      </motion.li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="pt-8 border-t border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} GamerX. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {["About", "Careers", "Blog"].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
