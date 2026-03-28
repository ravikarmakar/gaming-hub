import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useGetTeamByIdQuery } from "@/features/teams/hooks/useTeamQueries";
import { AxiosError } from "axios";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { TEAM_ACTIONS, TEAM_ACTIONS_ACCESS } from "@/features/teams/lib/access";
import { Team } from "@/features/teams/lib/types";

interface TeamPermissions {
  canManageRoster: boolean;
  canManageStaff: boolean;
  canTransferOwnerShip: boolean;
  accessJoinRequestList: boolean;
  isCaptain: boolean;
  isOwner: boolean;
}

interface TeamDashboardContextType {
  team: Team | undefined;
  teamId: string;
  isLoading: boolean;
  isError: boolean;
  error: AxiosError | null;
  refetch: () => Promise<any>;
  permissions: TeamPermissions;
  userId?: string;
}

export const TeamDashboardContext = createContext<TeamDashboardContextType | undefined>(undefined);

export const useTeamDashboard = () => {
  const context = useContext(TeamDashboardContext);
  if (!context) {
    throw new Error("useTeamDashboard must be used within a TeamDashboardProvider");
  }
  return context;
};

interface TeamDashboardProviderProps {
  children: ReactNode;
  teamId: string;
  userId?: string;
}

export const TeamDashboardProvider: React.FC<TeamDashboardProviderProps> = ({
  children,
  teamId,
  userId,
}) => {
  const { data: team, isLoading, isError, error, refetch } = useGetTeamByIdQuery(teamId, false, {
    enabled: !!teamId,
  });

  const { can } = useAccess();

  const permissions = useMemo(() => {
    if (!team) {
      return {
        canManageRoster: false,
        canManageStaff: false,
        canTransferOwnerShip: false,
        accessJoinRequestList: false,
        isCaptain: false,
        isOwner: false,
      };
    }

    return {
      canManageRoster: can({
        ...TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.manageRoster],
        scopeId: team._id,
      }),
      canManageStaff: can({
        ...TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.manageStaff],
        scopeId: team._id,
      }),
      canTransferOwnerShip: can({
        ...TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.transferTeamOwnerShip],
        scopeId: team._id,
      }),
      accessJoinRequestList: can({
        ...TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.accessJoinRequestList],
        scopeId: team._id,
      }),
      isCaptain: !!userId && team.captain?.toString() === userId.toString(),
      isOwner: !!userId && !!team.teamMembers?.find((m) => {
        const mUserId = (typeof m.user === 'string' ? m.user : m.user?._id || m._id || "").toString();
        return mUserId === userId.toString();
      })?.systemRole?.includes("owner"),
    };
  }, [team, can, userId]);

  const value = useMemo(
    () => ({
      team,
      teamId,
      isLoading,
      isError,
      error,
      refetch,
      permissions,
      userId,
    }),
    [team, teamId, isLoading, isError, error, refetch, permissions, userId]
  );

  return <TeamDashboardContext.Provider value={value}>{children}</TeamDashboardContext.Provider>;
};
