// import React, { useState } from "react";

// interface TabsProps {
//   children: React.ReactNode;
//   defaultValue: string;
//   className?: string;
// }

// interface TabsListProps {
//   children: React.ReactNode;
//   activeTab?: string;
//   setActiveTab?: (value: string) => void;
// }

// interface TabsContentProps {
//   children: React.ReactNode;
//   value: string;
// }

// interface TabsTriggerProps {
//   children: React.ReactNode;
//   value: string;
//   isActive?: boolean;
//   onClick?: () => void;
// }

// // Custom Tabs Components
// export const Tabs = ({ children, defaultValue, className = "" }: TabsProps) => {
//   const [activeTab, setActiveTab] = useState(defaultValue);

//   const content = React.Children.toArray(children).find(
//     (child) => child.props.value === activeTab
//   );

//   return (
//     <div className={className}>
//       {React.Children.map(children, (child) => {
//         if (child.type === TabsList) {
//           return React.cloneElement(child, { activeTab, setActiveTab });
//         }
//         if (child.type === TabsContent && child.props.value === activeTab) {
//           return child;
//         }
//         return null;
//       })}
//     </div>
//   );
// };

// export const TabsList = ({
//   children,
//   activeTab,
//   setActiveTab,
// }: TabsListProps) => (
//   <div className="flex space-x-2">
//     {React.Children.map(children, (child) =>
//       React.isValidElement(child) // Use React.isValidElement instead of null check
//         ? React.cloneElement(child, {
//             isActive: activeTab === child.props.value,
//             onClick: () => setActiveTab(child.props.value),
//           })
//         : null
//     )}
//   </div>
// );

// export const TabsTrigger = ({
//   children,
//   value,
//   isActive,
//   onClick,
// }: TabsTriggerProps) => (
//   <button
//     className={`px-4 py-2 rounded text-sm font-medium transition-colors
//       ${
//         isActive
//           ? "bg-gray-700 text-white"
//           : "text-gray-400 hover:text-white hover:bg-gray-700/50"
//       }`}
//     onClick={onClick}
//     key={value}
//   >
//     {children}
//   </button>
// );

// export const TabsContent = ({ children, value }: TabsContentProps) => (
//   <div className="mt-4" key={value}>
//     {children}
//   </div>
// );
