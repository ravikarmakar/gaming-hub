import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NAV_LINKS } from "@/lib/constants";
import throttle from "lodash.throttle";

// Components
import { Logo } from "./components/Logo";
import { NavLink } from "./components/NavLinks";
import { MobileMenu } from "./components/MobileMenu";
import { ProfileAvatar } from "./components/ProfileAvatar";
import { AuthButtons } from "./components/AuthButton";
import { useUserStore } from "@/store/useUserStore";
// import { AuthButtons } from "./components/AuthButton";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const { scrollY } = useScroll();
  const { user, checkingAuth } = useUserStore();

  // Scroll visibility handler with debounce
  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = scrollY.get();
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY <= 50);
      setLastScrollY(currentScrollY);
    }, 50);

    // const unsubscribe = scrollY.onChange(handleScroll);
    const unsubscribe = scrollY.on("change", handleScroll);
    return () => {
      unsubscribe();
      handleScroll.cancel();
    };
  }, [scrollY, lastScrollY]);

  const closeMenu = () => setIsOpen(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      // transition={{ type: "spring", stiffness: 260, damping: 20 }}
      transition={{ duration: 0.1 }}
      className="fixed backdrop-blur-sm transition-all duration-300 w-full bg-gray-900/95 z-50 shadow-lg"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                href={link.href}
                name={link.name}
                isActive={location.pathname.startsWith(link.href)}
              />
            ))}
          </div>

          {/* Profile Avatar */}
          {/* <div className="hidden md:flex items-center space-x-4">
            {checkingAuth ? <ProfileAvatar /> : <AuthButtons />}
          </div> */}

          {/* Profile Avatar / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {checkingAuth ? (
              <span className="text-gray-300">Loading...</span>
            ) : user ? (
              <ProfileAvatar />
            ) : (
              <AuthButtons />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:bg-gray-800 p-2 rounded-md"
            aria-label="Toggle mobile menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileMenu isOpen={isOpen} onClose={closeMenu} />
    </motion.nav>
  );
};

export default Navbar;
