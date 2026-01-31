import { useEffect, useState, useRef } from "react";
import { Users, Trophy, Loader2 } from "lucide-react";

import { useEventStore } from "@/features/events/store/useEventStore";
import { GlassCard, NeonBadge } from "./ThemedComponents";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TeamListProps {
  eventId: string;
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
        className="opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 hidden sm:block"
      >
        Verified
      </NeonBadge>
    </div>
  );
};

const TeamList = ({ eventId }: TeamListProps) => {
  const {
    registerdTeams,
    fetchRegisteredTeams,
    isTeamsLoading,
    hasMoreTeams,
    resetRegisteredTeams
  } = useEventStore();
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resetRegisteredTeams();
    fetchRegisteredTeams(eventId);
  }, [eventId, fetchRegisteredTeams, resetRegisteredTeams]);

  useEffect(() => {
    if (!observerTarget.current || !hasMoreTeams || isTeamsLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isTeamsLoading && hasMoreTeams) {
          fetchRegisteredTeams(eventId, { append: true });
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [eventId, hasMoreTeams, isTeamsLoading, fetchRegisteredTeams]);

  // Initial loading state (only for first page)
  if (isTeamsLoading && registerdTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Scanning Arena for Battalions...</p>
      </div>
    );
  }

  return (
    <GlassCard className="p-4 sm:p-8 border-purple-500/10 shadow-2xl relative overflow-visible">
      <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              Registered Battalions
            </h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {registerdTeams?.length || 0} Units Deployed
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
        {registerdTeams?.length > 0 ? (
          <>
            {registerdTeams.map((team, index) => (
              <TeamItem key={`${team._id}-${index}`} team={team} index={index} />
            ))}

            {/* Observer Target & Loader */}
            <div ref={observerTarget} className="py-6 flex flex-col items-center justify-center gap-3">
              {hasMoreTeams ? (
                <>
                  <Loader2 className="w-5 h-5 text-purple-500/50 animate-spin" />
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Awaiting More Units...</p>
                </>
              ) : (
                <div className="flex items-center gap-3 w-full opacity-30">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">All Personnel Accounted For</p>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
              No Combat Units Detected in Sector.
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default TeamList;
