import { useMemo } from "react";
import { Users, UserCheck, UserX } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { TeamMembersTypes, useTeamStore } from "@/features/teams/store/useTeamStore";
import { MemberCard } from "./MemberCard";

interface TeamMembersProps {
  members: TeamMembersTypes[];
  owner: boolean;
  currentUserId: string;
  onRemove: (id: string) => void;
  onEditRole: (role: string, id: string) => void;
  onTransferOwnership: (id: string) => void;
  isLoading?: boolean;
}

export const TeamMembers = ({
  members,
  owner,
  currentUserId,
  onRemove,
  onEditRole,
  onTransferOwnership,
  isLoading,
}: TeamMembersProps) => {
  const { currentTeam } = useTeamStore();

  // Memoize filtered and sorted member lists for performance
  const { activeMembers, inactiveMembers } = useMemo(() => {
    const captainId = currentTeam?.captain?.toString();

    // Sort function: captain first
    const sortedMembers = [...members].sort((a, b) => {
      if (a.user.toString() === captainId) return -1;
      if (b.user.toString() === captainId) return 1;
      return 0;
    });

    const active = sortedMembers.filter((m) => m.isActive);
    const inactive = sortedMembers.filter((m) => !m.isActive);
    return { activeMembers: active, inactiveMembers: inactive };
  }, [members, currentTeam?.captain]);

  if (isLoading && members.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-[240px] bg-white/5 border border-white/10 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  const renderMemberGrid = (memberList: TeamMembersTypes[]) => {
    if (memberList.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-gray-400 text-sm">No members found</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {memberList.map((member) => (
          <MemberCard
            key={member.user}
            member={member}
            isOwner={owner}
            currentUserId={currentUserId}
            onRemove={onRemove}
            onEditRole={onEditRole}
            onTransferOwnership={onTransferOwnership}
            isLoading={isLoading || false}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          variant="outline"
          className="bg-white/5 border-white/10 text-gray-300 px-3 py-1.5"
        >
          <Users className="w-3.5 h-3.5 mr-1.5" />
          {members.length} Total
        </Badge>
        <Badge
          variant="outline"
          className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 px-3 py-1.5"
        >
          <UserCheck className="w-3.5 h-3.5 mr-1.5" />
          {activeMembers.length} Active
        </Badge>
        {inactiveMembers.length > 0 && (
          <Badge
            variant="outline"
            className="bg-gray-500/10 border-gray-500/20 text-gray-400 px-3 py-1.5"
          >
            <UserX className="w-3.5 h-3.5 mr-1.5" />
            {inactiveMembers.length} Inactive
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400"
          >
            All Members
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400"
          >
            Active
          </TabsTrigger>
          {inactiveMembers.length > 0 && (
            <TabsTrigger
              value="inactive"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400"
            >
              Inactive
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderMemberGrid(members)}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {renderMemberGrid(activeMembers)}
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          {renderMemberGrid(inactiveMembers)}
        </TabsContent>
      </Tabs>
    </div>
  );
};
