import { Gamepad2 } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center space-x-2">
      <Gamepad2 size={28} className="text-cyan-500" />
      <span className="font-orbitron text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
        GameVerse
      </span>
    </div>
  );
};
