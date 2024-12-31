import { motion, useScroll, useTransform } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { NavLinks } from "./nav-links";
import { MobileMenu } from "./mobile-menu";
import { AuthButtons } from "./auth-buttons";

export function Navbar() {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.95)"]
  );

  return (
    <motion.header
      style={{ backgroundColor }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.a
            href="#"
            className="flex items-center space-x-2 text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Gamepad2 className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-bold font-orbitron">GameHub</span>
          </motion.a>

          <NavLinks className="hidden lg:flex" />
          <div className="hidden lg:block">
            <AuthButtons />
          </div>
          <MobileMenu />
        </div>
      </div>
    </motion.header>
  );
}
