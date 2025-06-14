import { Settings } from "lucide-react";

export const Empty = () => {
  return (
    <div className="p-12 text-center border bg-gray-800/40 backdrop-blur-sm rounded-xl border-gray-700/50">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
        <Settings className="w-8 h-8" />
      </div>
      <h3 className="mb-2 text-xl font-bold">Coming Soon</h3>
      <p className="text-gray-400">
        This section is under development. Stay tuned for awesome features!
      </p>
    </div>
  );
};
