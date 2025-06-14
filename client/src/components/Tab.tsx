import { startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  className = "",
}) => {
  return (
    <nav className={`relative flex space-x-4 sm:space-x-8 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            startTransition(() => setActiveTab(tab.id));
          }}
          className={`py-3 sm:py-4 px-1 sm:px-2 relative font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === tab.id
              ? "text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            />
          )}
        </button>
      ))}
    </nav>
  );
};

export const TabContent: React.FC<
  React.PropsWithChildren<{ className?: string; motionKey?: string }>
> = ({ children, className = "", motionKey }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={motionKey}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg shadow-lg ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
