import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, User, X, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

interface SidebarProps {
  links: {
    id: string;
    name: string;
    icon: JSX.Element;
    href: string;
  }[];
  title: string;
}

const Sidebar: React.FC<SidebarProps> = ({ links, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed z-50 p-2 text-white bg-gray-800 rounded-full md:hidden top-4 left-4"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed z-50 flex flex-col w-64 h-full p-4 bg-gray-900 border-r border-gray-800 md:relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className="mr-2 text-purple-500"
                  >
                    <Zap size={24} />
                  </motion.div>
                  <h1 className="text-xl font-bold text-white">{title}</h1>
                </div>
                <button
                  className="text-gray-400 hover:text-white md:hidden"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav Links */}
              <div className="flex-1">
                <nav>
                  <ul className="relative space-y-2">
                    {links.map((link) => (
                      <li
                        key={link.id}
                        onClick={() => {
                          navigate(link.href);
                          setIsOpen(false); // Close on mobile click
                        }}
                      >
                        <button
                          className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors relative ${
                            location.pathname === link.href
                              ? "bg-purple-900 bg-opacity-50 text-purple-400"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          <span className="mr-3">{link.icon}</span>
                          <span>{link.name}</span>
                          {location.pathname === link.href && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute right-0 w-1 h-8 bg-purple-500 rounded-l"
                            />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Footer */}
              <div className="pt-4 mt-auto border-t border-gray-800">
                <div className="flex items-center p-4 bg-gray-800 rounded-lg bg-opacity-40">
                  <div className="flex items-center justify-center w-8 h-8 mr-3 text-white bg-purple-600 rounded-full">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Admin User</p>
                    <p className="text-xs text-gray-400">Super Admin</p>
                  </div>
                  <button
                    onClick={() => navigate("/")}
                    className="ml-auto text-gray-400 hover:text-purple-500"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - always visible */}
      <div className="flex-col hidden w-64 h-screen p-4 bg-gray-900 border-r border-gray-800 md:flex">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="mr-2 text-purple-500">
              <Zap size={24} />
            </div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1">
          <nav>
            <ul className="relative space-y-2">
              {links.map((link) => (
                <li key={link.id} onClick={() => navigate(link.href)}>
                  <button
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors relative ${
                      location.pathname === link.href
                        ? "bg-purple-900 bg-opacity-50 text-purple-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span className="mr-3">{link.icon}</span>
                    <span>{link.name}</span>
                    {location.pathname === link.href && (
                      <div className="absolute right-0 w-1 h-8 bg-purple-500 rounded-l" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-auto border-t border-gray-800">
          <div className="flex items-center p-4 bg-gray-800 rounded-lg bg-opacity-40">
            <div className="flex items-center justify-center w-8 h-8 mr-3 text-white bg-purple-600 rounded-full">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="ml-auto text-gray-400 hover:text-purple-500"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
