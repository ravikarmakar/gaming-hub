import { useEffect, useState } from "react";
import { X, Users, Trophy } from "lucide-react";

import { useEventStore } from "@/features/events/store/useEventStore";
import { GlassCard, NeonBadge } from "./ThemedComponents";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TeamListProps {
  eventId: string;
  setIsOpen: (isOpen: boolean) => void;
}

const TeamItem = ({ team, index }: { team: any; index: number }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const teamImageUrl = team.imageUrl?.includes("default-avatar-url.com")
    ? `https://ui-avatars.com/api/?name=${team.teamName}&background=random`
    : (team.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=100");

  return (
    <div
      className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-purple-500/20 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <span className="text-xs font-black text-purple-500/40 group-hover:text-purple-500 transition-colors">
          {(index + 1).toString().padStart(2, "0")}
        </span>
        <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-white/10 group-hover:border-purple-500/30 transition-all bg-white/5">
          {!isLoaded && (
            <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-none bg-white/10 animate-pulse" />
          )}
          <img
            src={teamImageUrl}
            alt=""
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              isLoaded
                ? "opacity-100 blur-0 scale-100"
                : "opacity-0 blur-sm scale-110"
            )}
          />
        </div>
        <div>
          <h4 className="font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors">
            {team.teamName}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <Trophy size={10} className="text-amber-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Active Tier
            </span>
          </div>
        </div>
      </div>
      <NeonBadge
        variant="purple"
        className="opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
      >
        Verified
      </NeonBadge>
    </div>
  );
};

const TeamList = ({ eventId, setIsOpen }: TeamListProps) => {
  const { registerdTeams, fetchRegisteredTeams, isTeamsLoading } =
    useEventStore();

  useEffect(() => {
    fetchRegisteredTeams(eventId);
  }, [eventId, fetchRegisteredTeams]);

  if (isTeamsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GlassCard className="p-8 border-purple-500/10 shadow-2xl relative overflow-visible">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              Registered Battalions
            </h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {registerdTeams?.length || 0} Units Deployed
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {registerdTeams?.length > 0 ? (
          registerdTeams.map((team, index) => (
            <TeamItem key={team._id} team={team} index={index} />
          ))
        ) : (
          <div className="py-12 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              No Combat Units Detected.
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default TeamList;
