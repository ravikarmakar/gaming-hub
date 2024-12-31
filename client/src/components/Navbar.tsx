import { useState, useEffect } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { Menu, X, Gamepad2 } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle Scroll Direction and Visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = scrollY.get();
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling Down
        setIsVisible(false);
      } else {
        // Scrolling Up
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    const unsubscribe = scrollY.onChange(handleScroll);
    return () => unsubscribe();
  }, [scrollY, lastScrollY]);

  const navLinks = [
    { name: "Featured Events", href: "/events" },
    { name: "Blogs", href: "/blogs" },
    { name: "Community", href: "/community" },
    { name: "Contact", href: "/contact" },
  ];

  // const backgroundColor = useTransform(
  //   scrollY,
  //   [0, 100],
  //   ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.95)"]
  // );

  return (
    <motion.nav
      initial={{ y: -100 }}
      // style={{ backgroundColor }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.2 }}
      className="fixed backdrop-blur-sm transition-all duration-200 w-full bg-gray-900 z-50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <motion.a
              href="/"
              className="flex items-center space-x-2 text-white"
            >
              <Gamepad2 className="w-8 h-8 text-cyan-400" />
              <span className="text-xl font-bold font-orbitron">GameHub</span>
            </motion.a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-audiowide font-medium transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Profile Avatar */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.a
              href="/profile"
              className="flex items-center space-x-2 text-white"
            >
              <img
                src="https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFufGVufDB8fDB8fHww"
                alt="Profile Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            </motion.a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-gray-800"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <div className="md:hidden">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#1d1e1e] border-gray-800/50 backdrop-blur-sm"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[#008e8e] hover:text-[#007171]  block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
