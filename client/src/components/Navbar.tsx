import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Gamepad2,
  Home,
  Trophy,
  Flame,
  Users,
  Bell,
  User,
  Settings,
  LogOut,
  MessageSquare,
  Crown,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout, isLoading } = useUserStore();

  // Check if user has scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
      setShowProfile(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Animation variants
  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.3,
      },
    }),
  } as const;

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -5 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.4,
        stiffness: 150,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -5,
      transition: { duration: 0.2 },
    },
  };

  const glow = {
    rest: {
      boxShadow: "0 0 0px rgba(139, 92, 246, 0)",
    },
    hover: {
      boxShadow: "0 0 15px rgba(139, 92, 246, 0.7)",
    },
  };

  const glowText = {
    rest: { textShadow: "0 0 0px rgba(139, 92, 246, 0)" },
    hover: { textShadow: "0 0 10px rgba(139, 92, 246, 0.7)" },
  };

  const navItems = [
    { name: "Home", icon: <Home className="w-5 h-5" />, href: "/" },
    {
      name: "Games",
      icon: <Gamepad2 className="w-5 h-5" />,
      hasDropdown: true,
      href: "/",
    },
    { name: "Tournaments", icon: <Trophy className="w-5 h-5" />, href: "/" },
    { name: "Trending", icon: <Flame className="w-5 h-5" />, href: "/" },
    { name: "Community", icon: <Users className="w-5 h-5" />, href: "/" },
  ];

  const notifications = [
    {
      id: 1,
      title: "New friend request",
      message: "xXDragonSlayerXx wants to be friends",
      time: "2m ago",
      icon: <Users className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 2,
      title: "Tournament starting",
      message: "Apex Legends tournament begins in 30 minutes",
      time: "30m ago",
      icon: <Trophy className="w-4 h-4 text-yellow-400" />,
    },
    {
      id: 3,
      title: "Achievement unlocked",
      message: "You've reached Level 50!",
      time: "2h ago",
      icon: <Crown className="w-4 h-4 text-purple-400" />,
    },
  ];

  const profileOptions = [
    {
      name: "View Profile",
      icon: <User className="w-4 h-4" />,
      href: "/profile",
    },
    {
      name: "Messages",
      icon: <MessageSquare className="w-4 h-4" />,
      href: "#messages",
    },
    {
      name: "Settings",
      icon: <Settings className="w-4 h-4" />,
      href: "#settings",
    },
    {
      name: "Support",
      icon: <HelpCircle className="w-4 h-4" />,
      href: "#support",
    },
    {
      name: isLoading ? "Logging out..." : "Log Out",
      icon: isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      ),
      onClick: () => logout(),
    },
  ];

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
      className={`fixed w-full z-50 font-sans ${
        scrolled
          ? "bg-gray-900/90 backdrop-blur-md border-b border-purple-900/50 shadow-lg shadow-purple-900/20"
          : "bg-gray-900 border-b border-purple-900/30"
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <motion.div
                initial="rest"
                whileHover="hover"
                animate="rest"
                variants={glow}
                className="flex items-center justify-center p-1 rounded-full bg-gray-800"
              >
                <Gamepad2 className="h-8 w-8 text-purple-400" />
              </motion.div>
              <motion.span
                initial="rest"
                whileHover="hover"
                animate="rest"
                variants={glowText}
                className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300"
              >
                NEXUS
              </motion.span>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item, i) => (
              <motion.ul
                key={item.name}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={menuItemVariants}
                className="relative group"
              >
                <motion.li
                  onClick={() => navigate(item.href)}
                  initial="rest"
                  whileHover="hover"
                  variants={glow}
                  className="flex items-center text-gray-300 cursor-pointer hover:text-purple-300 px-3 py-2 text-sm font-medium rounded-md m-1 transition-colors"
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.name}
                  {item.hasDropdown && <ChevronDown className="ml-1 w-4 h-4" />}
                </motion.li>

                {/* Dropdown Menu */}
                {item.hasDropdown && (
                  <div className="absolute hidden group-hover:block mt-1 w-48 z-10">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={dropdownVariants}
                      className="py-1 bg-gray-800 border border-purple-900/50 rounded-md shadow-lg overflow-hidden shadow-purple-900/20 backdrop-blur-lg"
                    >
                      {["Action", "Adventure", "RPG", "Strategy", "Sports"].map(
                        (genre) => (
                          <motion.a
                            key={genre}
                            href={`#${genre.toLowerCase()}`}
                            initial="rest"
                            whileHover="hover"
                            variants={glow}
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-purple-900/30"
                          >
                            {genre}
                          </motion.a>
                        )
                      )}
                    </motion.div>
                  </div>
                )}
              </motion.ul>
            ))}
          </div>

          {/* Right side - Dashboard, Notifications, Profile and Login */}
          <div className="flex items-center">
            {/* Dashboard Button */}
            {user &&
              (user.role === "organiser" || user.role === "super-admin") && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (user?.role === "super-admin") {
                      navigate("/super-admin");
                    } else if (user?.role === "admin") {
                      navigate("/admin");
                    }
                  }}
                  className="px-4 py-2 mr-4 border border-purple-700/70 bg-gray-900/50 hover:bg-gray-800/50 text-gray-200 font-medium rounded-lg flex items-center"
                >
                  <span>
                    {user?.role === "super-admin" ? "Super Admin" : "Organiser"}
                  </span>
                </motion.button>
              )}

            {/* Notification Icon */}
            {user && (
              <div className="relative mr-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotifications(!showNotifications);
                    setShowProfile(false);
                  }}
                  className="p-2 rounded-full text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 focus:outline-none relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-800"></span>
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="absolute right-0 mt-2 w-80 bg-gray-800 border border-purple-900/50 rounded-lg shadow-lg shadow-purple-900/20 overflow-hidden z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-2 border-b border-gray-700">
                        <p className="text-sm font-medium text-gray-200">
                          Notifications
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <motion.a
                            key={notification.id}
                            href="#"
                            whileHover={{
                              backgroundColor: "rgba(139, 92, 246, 0.1)",
                            }}
                            className="block p-3 border-b border-gray-700 hover:bg-gray-700"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3 mt-1">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700">
                                  {notification.icon}
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-200">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </motion.a>
                        ))}
                      </div>
                      <a
                        href="#all-notifications"
                        className="block p-2 text-center text-sm font-medium text-purple-400 hover:text-purple-300 bg-gray-800 hover:bg-gray-700"
                      >
                        View All Notifications
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile Icon */}
            {user && (
              <div className="relative mr-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfile(!showProfile);
                    setShowNotifications(false);
                  }}
                  className="flex items-center p-1 rounded-full text-gray-300 hover:text-white focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500">
                    <img
                      src="/api/placeholder/32/32"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="absolute right-0 mt-2 w-56 bg-gray-800 border border-purple-900/50 rounded-lg shadow-lg shadow-purple-900/20 overflow-hidden z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-3 border-b border-gray-700">
                        <p className="text-sm font-medium text-gray-200">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-400">
                          Level 42 • Premium
                        </p>
                      </div>
                      <ul>
                        {profileOptions.map((option) => (
                          <motion.li
                            key={option.name}
                            onClick={() => {
                              if (option.onClick) option.onClick();
                              else if (option.href) navigate(option.href);
                            }}
                            whileHover={{
                              backgroundColor: "rgba(139, 92, 246, 0.1)",
                            }}
                            className="flex items-center cursor-pointer px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <span className="mr-3 text-gray-400">
                              {option.icon}
                            </span>
                            {option.name}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Login Button (hidden when authenticated) */}
            {!user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className={`px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-900 shadow-md shadow-purple-900/20`}
              >
                Login
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-900 border-t border-gray-800"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Profile Info (Mobile) */}
              {user && (
                <div className="p-3 mb-2 border-b border-gray-800 flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500 mr-3">
                    <img
                      src="/api/placeholder/40/40"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-400">Level 42 • Premium</p>
                  </div>
                </div>
              )}

              {/* Nav Items */}
              {navItems.map((item, i) => (
                <motion.ul
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-full"
                >
                  <li
                    onClick={() => navigate(item.href)}
                    className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md text-base font-medium"
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </li>
                </motion.ul>
              ))}

              {/* Profile Options (Mobile) */}
              {user && (
                <div className="pt-4 pb-3 border-t border-gray-800">
                  <ul className="space-y-1">
                    {profileOptions.map((option, i) => (
                      <motion.li
                        key={option.name}
                        onClick={() => {
                          if (option.onClick) option.onClick();
                          else if (option.href) navigate(option.href);
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (i + navItems.length) * 0.1 }}
                        className="flex items-center cursor-point px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                      >
                        <span className="mr-3 text-gray-400">
                          {option.icon}
                        </span>
                        {option.name}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
