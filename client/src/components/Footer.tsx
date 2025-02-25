import { motion } from "framer-motion";
import { Logo } from "./Logo";
import {
  Twitter,
  Twitch,
  Youtube,
  MessageSquare,
  Gamepad2,
  Trophy,
  Users,
  HelpCircle,
} from "lucide-react";

const navigationLinks = {
  games: {
    title: "Games",
    icon: Gamepad2,
    links: [
      { label: "Action Games", href: "#" },
      { label: "Adventure", href: "#" },
      { label: "Strategy", href: "#" },
      { label: "Sports", href: "#" },
    ],
  },
  esports: {
    title: "Esports",
    icon: Trophy,
    links: [
      { label: "Tournaments", href: "#" },
      { label: "Live Events", href: "#" },
      { label: "Rankings", href: "#" },
      { label: "Teams", href: "#" },
    ],
  },
  community: {
    title: "Community",
    icon: Users,
    links: [
      { label: "Forums", href: "#" },
      { label: "Discord", href: "#" },
      { label: "Find Players", href: "#" },
      { label: "Clans", href: "#" },
    ],
  },
  resources: {
    title: "Resources",
    icon: HelpCircle,
    links: [
      { label: "Support", href: "#" },
      { label: "News", href: "#" },
      { label: "Guides", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
};

const socials = [
  { icon: Twitter, label: "Twitter", color: "#1DA1F2" },
  { icon: Twitch, label: "Twitch", color: "#9146FF" },
  { icon: Youtube, label: "YouTube", color: "#FF0000" },
  { icon: MessageSquare, label: "Discord", color: "#5865F2" },
];

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-purple-900/5 via-[#0c1015] to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo & Social Section */}
          <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 flex flex-col items-center lg:items-start"
            >
              <Logo />
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                {socials.map(({ icon: Icon, label, color }) => (
                  <motion.a
                    key={label}
                    href="#"
                    className="group relative"
                    whileHover={{ y: -2 }}
                    style={{ "--social-color": color } as React.CSSProperties}
                  >
                    <div
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"
                      style={{ backgroundColor: color }}
                    />
                    <div className="relative w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-400 group-hover:text-[var(--social-color)] transition-all border border-gray-700/50 group-hover:border-[var(--social-color)]/50">
                      <Icon size={20} />
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.values(navigationLinks).map(
              ({ title, icon: Icon, links }) => (
                <motion.div
                  key={title}
                  className="space-y-4 flex flex-col items-center sm:items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <h3>{title}</h3>
                  </div>
                  <ul className="space-y-2 text-center sm:text-left">
                    {links.map(({ label, href }) => (
                      <motion.li key={label}>
                        <a
                          href={href}
                          className="text-sm text-gray-400 hover:text-white transition-colors relative group block py-1"
                        >
                          <span className="relative">
                            {label}
                            <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-[#5eead4] via-[#8b5cf6] to-[#5eead4] transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                          </span>
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-800/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-sm text-gray-500">
              {new Date().getFullYear()} GamerX. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Contact"].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  className="text-sm text-gray-500 hover:text-[#5eead4] transition-colors"
                  whileHover={{ x: 2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
