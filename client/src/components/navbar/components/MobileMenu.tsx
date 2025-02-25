import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "./NavLinks";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "@/components/navbar/components/Logo";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export const MobileMenu = memo(
  ({
    isOpen,
    onClose,
    isAuthenticated,
  }: {
    isAuthenticated: boolean;
    isOpen: boolean;
    onClose: () => void;
  }) => (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[8px] md:hidden z-40"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed left-0 top-0 w-72 h-[calc(100vh)] md:hidden mobile-menu z-50"
          >
            <div className="h-full bg-[#0a0a0a]/40 backdrop-blur-xl border-r border-purple-900/20 flex flex-col">
              {/* Header with Logo and Close */}
              <div className="flex items-center justify-between p-4 border-b border-purple-900/20">
                <Logo />
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-purple-500" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 flex flex-col py-4">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.name}
                    href={link.href}
                    name={link.name}
                    isActive={false}
                    onClick={onClose}
                    className="w-full px-6 py-3 hover:bg-purple-500/10 transition-colors duration-200"
                  />
                ))}
              </nav>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                ""
              ) : (
                <div className="p-4 border-t border-purple-900/20">
                  <Link to="/signup" onClick={onClose}>
                    <button className="w-full py-2.5 px-4 bg-purple-600/50 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 mb-4">
                      Sign Up
                    </button>
                  </Link>
                  <Link to="/login" onClick={onClose}>
                    <button className="w-full py-2.5 px-4 border border-purple-600/50 hover:bg-purple-500/10 text-purple-500 rounded-lg font-medium transition-colors duration-200">
                      Login
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
);
