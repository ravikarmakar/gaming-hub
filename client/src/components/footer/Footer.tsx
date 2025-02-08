import { FooterNewsletter } from "./components/FooterNewsletter";
import { FooterLinks } from "./components/FooterLinks";
import { FooterSocial } from "./components/FooterSocial";
import { Logo } from "../Logo";

const Footer = () => {
  return (
    <footer className="relative pt-24 pb-12 overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black md:px-10 sm:px-10 lg:px-20">
      {/* Animated Background Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Logo />
            <p className="text-gray-400 max-w-sm">
              Join millions of gamers and compete in the most exciting
              tournaments across the globe.
            </p>
            <FooterSocial />
          </div>

          {/* Quick Links */}
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

          {/* Support */}
          <div>
            <FooterLinks
              title="Support"
              links={[
                { label: "Help Center", href: "#help" },
                { label: "Terms of Service", href: "#terms" },
                { label: "Privacy Policy", href: "#privacy" },
                { label: "Contact Us", href: "#contact" },
              ]}
            />
          </div>

          {/* Newsletter */}
          <div>
            <FooterNewsletter />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} GameHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
