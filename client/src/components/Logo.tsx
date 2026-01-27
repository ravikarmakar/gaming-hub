import { Gamepad2 } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center space-x-2">
      <Gamepad2 size={28} className="text-cyan-500" />
      <span className="text-xl font-bold text-transparent font-orbitron bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text">
        GamerX
      </span>
    </div>
  );
};
