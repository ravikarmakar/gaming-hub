import React, { useState, memo } from "react";

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
  className?: string;
}

// Tabs Component
export const Tabs = memo(
  ({ children, defaultValue, className = "" }: TabsProps) => {
    const [activeTab, setActiveTab] = useState(defaultValue);

    return (
      <div className={`w-full ${className}`}>
        {React.Children.map(children, (child) => {
          if (child.type === TabsList) {
            return React.cloneElement(child, { activeTab, setActiveTab });
          }
          if (child.type === TabsContent && child.props.value === activeTab) {
            return child;
          }
          return null;
        })}
      </div>
    );
  }
);

// TabsList Component
export const TabsList = memo(
  ({ children, activeTab, setActiveTab }: TabsListProps) => (
    <div className="flex flex-wrap justify-center gap-2 md:gap-6 lg:gap-8">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              isActive: activeTab === child.props.value,
              onClick: () => setActiveTab(child.props.value),
            })
          : null
      )}
    </div>
  )
);

// TabsTrigger Component
export const TabsTrigger = memo(
  ({
    children,
    value,
    isActive,
    onClick,
    className = "",
  }: TabsTriggerProps) => (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-all text-sm md:px-6 md:py-3 lg:px-6 lg:py-2 lg:text-lg
        ${
          isActive
            ? "bg-blue-500/20 text-white shadow-lg"
            : "text-gray-400 hover:bg-blue-400/20 hover:gray-blue-600/50"
        }
        ${className}`}
      onClick={onClick}
      key={value}
    >
      {children}
    </button>
  )
);

// TabsContent Component
export const TabsContent = memo(({ children, value }: TabsContentProps) => (
  <div className="shadow-md rounded-lg mt-4 md:mt-6" key={value}>
    {children}
  </div>
));
