import { useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NAV_LINKS } from "@/lib/constants";
import throttle from "lodash.throttle";

// Components
import { Logo } from "./components/Logo";
import { NavLink } from "./components/NavLinks";
import { MobileMenu } from "./components/MobileMenu";
import { ProfileAvatar, UnknowProfile } from "./components/ProfileAvatar";
import { useAuthStore } from "@/store/useAuthStore";
import { MenuProvider, useMenu } from "./context/MenuContext";

const iconVariants = {
  closed: { rotate: 0 },
  open: { rotate: 90 },
};

const NavbarContent = () => {
  const location = useLocation();
  const { scrollY } = useScroll();
  const { user, checkingAuth } = useAuthStore();
  const { activeMenu, setActiveMenu, closeAllMenus } = useMenu();

  const isMobileMenuOpen = activeMenu === "mobile";

  // Handle menu close on outside click or scroll
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      event.preventDefault();
      const mobileMenu = document.querySelector(".mobile-menu");
      const mobileMenuButton = document.querySelector(".mobile-menu-button");
      const profileMenu = document.querySelector(".profile-menu");
      const target = event.target as HTMLElement;

      // Check if click is inside the mobile menu button
      if (mobileMenuButton?.contains(target)) {
        event.stopPropagation();
        setActiveMenu(isMobileMenuOpen ? null : "mobile");
        return;
      }

      // Only close menus if clicking outside both menus
      if (!mobileMenu?.contains(target) && !profileMenu?.contains(target)) {
        closeAllMenus();
      }
    };

    const handleScroll = throttle(() => {
      // Close all menus on scroll
      closeAllMenus();
    }, 50);

    document.addEventListener("click", handleOutsideClick);
    const unsubscribe = scrollY.on("change", handleScroll);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      unsubscribe();
      handleScroll.cancel();
    };
  }, [scrollY, closeAllMenus, isMobileMenuOpen, setActiveMenu]);

  return (
    <header className="relative z-50">
      <nav
        className={`
          fixed w-full top-0 left-0 right-0 h-16 bg-[#0a0a0a]/95
          border-b border-purple-900/30 backdrop-blur-md shadow-lg z-50
          transition-all duration-300
        `}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center">
              <motion.button
                className="mobile-menu-button md:hidden p-2 rounded-lg hover:text-purple-500 transition-colors duration-200"
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={isMobileMenuOpen ? "open" : "closed"}
                  variants={iconVariants}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-purple-500 z-100" />
                  ) : (
                    <Menu className="w-6 h-6 text-purple-700" />
                  )}
                </motion.div>
              </motion.button>
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2 justify-center flex-1 px-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  name={link.name}
                  isActive={location.pathname === link.href}
                />
              ))}
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-4">
              {checkingAuth ? null : user ? (
                <ProfileAvatar />
              ) : (
                <UnknowProfile />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => closeAllMenus()} />
      </nav>
    </header>
  );
};

const Navbar = () => (
  <MenuProvider>
    <NavbarContent />
  </MenuProvider>
);

export default Navbar;
