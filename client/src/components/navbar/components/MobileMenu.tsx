import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "./NavLinks";
import { NAV_LINKS } from "@/lib/constants";

export const MobileMenu = memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden mobile-menu"
        >
          <div className="flex flex-col px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900/95 border-gray-800/50 backdrop-blur-0">
            {NAV_LINKS.map((link) => (
              <NavLink
                className="flex flex-col space-y-4 px-6"
                key={link.name}
                href={link.href}
                name={link.name}
                isActive={false} // Mobile menu won't highlight active route
                onClick={onClose}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
);
