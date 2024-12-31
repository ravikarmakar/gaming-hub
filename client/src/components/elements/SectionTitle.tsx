import React from "react";

interface SectionTitleProps {
  title: string;
  subtitle: string;
}

export const SectionTitle = ({ title, subtitle }: SectionTitleProps) => {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-4xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
        {title}
      </h2>
      <p className="text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
};
