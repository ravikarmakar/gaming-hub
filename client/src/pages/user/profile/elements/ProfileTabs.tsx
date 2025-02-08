import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";

interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
}

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  show: boolean;
}

// Custom Tabs Components
export const Tabs = ({ children, defaultValue, className = "" }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={`tabs ${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement<any>, {
          activeTab,
          setActiveTab,
        })
      )}
    </div>
  );
};

export const TabsList = ({
  children,
  activeTab,
  setActiveTab,
}: TabsListProps) => {
  return (
    <div className="flex border-b border-gray-700">
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement<any>, {
          isActive: child.props.value === activeTab,
          onClick: () => setActiveTab && setActiveTab(child.props.value),
        })
      )}
    </div>
  );
};

export const TabsTrigger = ({
  children,
  value,
  isActive,
  onClick,
}: TabsTriggerProps) => {
  return (
    <button
      className={`px-4 py-2 -mb-px font-medium transition-colors duration-300 ${
        isActive ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ children, value }: TabsContentProps) => {
  return <div>{children}</div>;
};

// Animated Section Component
export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  show,
}) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};
