import React from "react";
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
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  className = "",
}) => {
  return (
    <nav className={`flex space-x-4 sm:space-x-8 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === tab.id
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export const TabContent: React.FC<
  React.PropsWithChildren<{ className?: string; key?: string }>
> = ({ children, className = "", key }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
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
