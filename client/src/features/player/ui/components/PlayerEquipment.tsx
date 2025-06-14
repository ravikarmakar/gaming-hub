import { Cpu, Headphones, Keyboard, Monitor, Mouse } from "lucide-react";

export const PlayerEquipment = () => {
  const player = {
    equipment: {
      mouse: "Logitech G Pro X Superlight",
      keyboard: "SteelSeries Apex Pro",
      headset: "HyperX Cloud II",
      monitor: "ASUS ROG Swift 240Hz",
      mousepad: "Zowie G-SR",
      chair: "Secretlab Titan Evo",
    },
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col gap-3 p-6 border bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 rounded-2xl">
        <Mouse className="w-6 h-6 text-blue-400" />
        <span className="text-sm text-gray-400">Mouse</span>
        <span className="font-bold text-white">{player.equipment.mouse}</span>
      </div>
      <div className="flex flex-col gap-3 p-6 border bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 rounded-2xl">
        <Keyboard className="w-6 h-6 text-purple-400" />
        <span className="text-sm text-gray-400">Keyboard</span>
        <span className="font-bold text-white">
          {player.equipment.keyboard}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-6 border bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 rounded-2xl">
        <Headphones className="w-6 h-6 text-pink-400" />
        <span className="text-sm text-gray-400">Headset</span>
        <span className="font-bold text-white">{player.equipment.headset}</span>
      </div>
      <div className="flex flex-col gap-3 p-6 border bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 rounded-2xl">
        <Monitor className="w-6 h-6 text-green-400" />
        <span className="text-sm text-gray-400">Monitor</span>
        <span className="font-bold text-white">{player.equipment.monitor}</span>
      </div>
      <div className="flex flex-col gap-3 p-6 border bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 rounded-2xl">
        <Cpu className="w-6 h-6 text-yellow-400" />
        <span className="text-sm text-gray-400">Chair</span>
        <span className="font-bold text-white">{player.equipment.chair}</span>
      </div>
      <div className="flex flex-col gap-3 p-6 border bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 rounded-2xl">
        <Mouse className="w-6 h-6 text-blue-300" />
        <span className="text-sm text-gray-400">Mousepad</span>
        <span className="font-bold text-white">
          {player.equipment.mousepad}
        </span>
      </div>
    </div>
  );
};
