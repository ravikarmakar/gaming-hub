import React from "react";

interface Props {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export const EmptyState = ({ title, description, children }: Props) => {
  return (
    <div className="flex items-center justify-center flex-1 w-full text-center">
      <div className="w-full max-w-md px-4 py-8 rounded-lg">
        <h2 className="mb-2 text-2xl font-semibold text-gray-300">{title}</h2>
        <p className="mb-6 text-sm text-gray-600">{description}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
};
