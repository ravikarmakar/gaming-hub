import { Trophy } from "lucide-react";
import type { PrizeTier as PrizeTierType } from "./types";

interface PrizeTierProps {
  tiers: PrizeTierType[];
}

export const PrizeTier = ({ tiers }: PrizeTierProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center text-yellow-500">
        <Trophy size={18} className="mr-2" />
        <span className="font-semibold">Prize Pool</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {tiers.map((tier, index) => (
          <div
            key={index}
            className="text-center p-2 rounded-lg bg-gray-800/50 border border-gray-700"
          >
            <div className="text-xs text-gray-400 mb-1">{tier.position}</div>
            <div className="font-semibold text-yellow-400">{tier.prize}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
