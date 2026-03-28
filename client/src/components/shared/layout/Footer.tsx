import { brand } from "@/config/brand";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
  Twitter,
  Instagram,
  Youtube,
  MessageSquare,
} from "lucide-react";

const navigationLinks = [
  {
    title: "Platform",
    links: [
      { label: "Play", href: "/play" },
      { label: "Tournaments", href: "/tournaments" },
      { label: "Teams", href: "/teams" },
      { label: "Premium", href: "/premium" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Rules & Guidelines", href: "/rules" },
      { label: "Contact Us", href: "/contact" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Partners", href: "/partners" },
    ],
  },
];

const socials = [
  { icon: Twitter, label: "Twitter", href: "https://x.com/krmesports", color: "#1DA1F2" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/krmesports", color: "#E4405F" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@krmesports", color: "#FF0000" },
  { icon: MessageSquare, label: "Discord", href: "https://discord.gg/krmesports", color: "#5865F2" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#05020a] border-t border-purple-500/10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-8">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="relative">
                <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-10 h-10 relative z-10 transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-2xl font-bold font-orbitron text-white tracking-wider group-hover:text-purple-400 transition-colors">
                {brand.name}
              </span>
            </Link>

            <p className="text-gray-400 max-w-sm leading-relaxed text-base">
              The ultimate destination for competitive gaming. Join thousands of
              players, compete in daily tournaments, and rise through the ranks to
              become a legend.
            </p>

            <div className="flex items-center gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon
                    size={20}
                    className="text-gray-400 group-hover:text-white transition-colors"
                    style={{
                      filter: `drop-shadow(0 0 0 transparent)`,
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    style={{ backgroundColor: social.color }}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {navigationLinks.map((section) => (
              <div key={section.title} className="space-y-6">
                <h3 className="text-lg font-bold text-white font-orbitron tracking-wide">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="group flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm font-medium"
                      >
                        <span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-500 transition-all duration-300" />
                        <span className="relative">
                          {link.label}
                          <span className="absolute -bottom-1 left-0 w-0 h-px bg-purple-400 transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-12 bg-white/5" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-sm">
            © {currentYear} {brand.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-8">
            <Link
              to="/privacy-policy"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookie-policy"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
