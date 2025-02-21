import { FooterNewsletter } from "./components/FooterNewsletter";
import { FooterLinks } from "./components/FooterLinks";
import { FooterSocial } from "./components/FooterSocial";
import { Logo } from "../Logo";
import { motion } from "framer-motion";

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <footer className="relative py-12 bg-gradient-to-b from-black to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent)] opacity-50" />

      <motion.div
        className="container mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Main Content */}
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Section - Takes 4 columns on md+ */}
          <motion.div
            className="md:col-span-4 space-y-4"
            variants={itemVariants}
          >
            <Logo />
            <p className="text-gray-400 text-sm max-w-md">
              Join millions of gamers and compete in the most exciting
              tournaments across the globe.
            </p>
            <FooterSocial />
          </motion.div>

          {/* Links Sections - Takes 6 columns on md+, with nested grid */}
          <motion.div
            className="md:col-span-5 grid grid-cols-2 gap-4 sm:gap-8"
            variants={itemVariants}
          >
            <div>
              <FooterLinks
                title="Quick Links"
                links={[
                  { label: "Games", href: "#games" },
                  { label: "Tournaments", href: "#tournaments" },
                  { label: "Leaderboard", href: "#leaderboard" },
                  { label: "About Us", href: "#about" },
                ]}
              />
            </div>
            <div>
              <FooterLinks
                title="Support"
                links={[
                  { label: "Help Center", href: "#help" },
                  { label: "Terms", href: "#terms" },
                  { label: "Privacy", href: "#privacy" },
                  { label: "Contact", href: "#contact" },
                ]}
              />
            </div>
          </motion.div>

          {/* Newsletter Section - Takes 3 columns on md+ */}
          <motion.div className="md:col-span-3" variants={itemVariants}>
            <FooterNewsletter />
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="mt-12 pt-6 border-t border-gray-800"
          variants={itemVariants}
        >
          <div className="text-center text-gray-400 text-sm">
            <p> {new Date().getFullYear()} GamerX. All rights reserved.</p>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
