import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { teamApi } from "../api/teamApi";
import { Team } from "../lib/types";
import { teamKeys } from "./teamKeys";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

/**
 * Custom hook to encapsulate common team invalidation logic.
 */
const useInvalidateTeam = () => {
  const queryClient = useQueryClient();
  return async (teamId?: string, additionalKeys: (readonly any[])[] = []) => {
    if (teamId) {
      await queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
    }
    await queryClient.invalidateQueries({ queryKey: teamKeys.all });
    for (const key of additionalKeys) {
      await queryClient.invalidateQueries({ queryKey: key });
    }
  };
};

// --- CREATE TEAM ---
export const useCreateTeamMutation = (
  options?: UseMutationOptions<Team & { success?: boolean }, AxiosError, FormData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: teamApi.createTeam,
    onSuccess: async (data, variables, context) => {
      if ((data as any).success !== false) {
        await queryClient.invalidateQueries({ queryKey: teamKeys.all });
        if (options?.onSuccess) await (options.onSuccess as any)(data, variables, context);
      }
    }
  });
};

// --- UPDATE TEAM ---
export const useUpdateTeamMutation = (
  options?: UseMutationOptions<Team & { success?: boolean }, AxiosError, { teamId: string, data: FormData }>
) => {
  const invalidate = useInvalidateTeam();

  return useMutation({
    ...options,
    mutationFn: teamApi.updateTeam,
    onSuccess: async (data, variables, context) => {
      if ((data as any).success !== false) {
        await invalidate(variables.teamId);
        if (options?.onSuccess) await (options.onSuccess as any)(data, variables, context);
      }
    }
  });
};

// --- DELETE TEAM ---
export const useDeleteTeamMutation = (
  options?: UseMutationOptions<{ success: boolean; message: string }, AxiosError, string>
) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTeam();

  return useMutation({
    ...options,
    mutationFn: teamApi.deleteTeam,
    onSuccess: async (data, teamId, context) => {
      if (data.success) {
        const checkAuth = useAuthStore.getState().checkAuth;
        await checkAuth(true);
        await invalidate();
        queryClient.removeQueries({ queryKey: teamKeys.detail(teamId) });
        if (options?.onSuccess) await (options.onSuccess as any)(data, teamId, context);
      }
    }
  });
};

// --- MEMBER MANAGEMENT ---
export const useRemoveMemberMutation = (
  options?: UseMutationOptions<any, AxiosError, { teamId: string, memberId: string }>
) => {
  const invalidate = useInvalidateTeam();

  return useMutation({
    ...options,
    mutationFn: teamApi.removeMember,
    onSuccess: async (data, variables, context) => {
      if (data.success !== false) {
        await invalidate(variables.teamId);
        if (options?.onSuccess) await (options.onSuccess as any)(data, variables, context);
      }
    }
  });
};

export const useLeaveTeamMutation = (
  options?: UseMutationOptions<any, AxiosError, string>
) => {
  const invalidate = useInvalidateTeam();

  return useMutation({
    ...options,
    mutationFn: teamApi.leaveTeam,
    onSuccess: async (data, teamId, context) => {
      if (data.success !== false) {
        const checkAuth = useAuthStore.getState().checkAuth;
        await checkAuth(true);
        await invalidate(teamId);
        if (options?.onSuccess) await (options.onSuccess as any)(data, teamId, context);
      }
    }
  });
};

export const useUpdateMemberRoleMutation = (
  options?: UseMutationOptions<Team, AxiosError, { teamId: string, memberId: string, role: string }>
) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTeam();

  return useMutation({
    ...options,
    mutationFn: teamApi.updateMemberRole,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.detail(variables.teamId) });
      const previousTeam = queryClient.getQueryData<Team>(teamKeys.detail(variables.teamId));

      if (previousTeam) {
        queryClient.setQueryData<Team>(teamKeys.detail(variables.teamId), {
          ...previousTeam,
          teamMembers: previousTeam.teamMembers.map(m => {
            const mId = typeof m.user === 'string' ? m.user : m.user?._id;
            if (mId === variables.memberId) {
              return { ...m, roleInTeam: variables.role as any };
            }
            return m;
          })
        });
      }

      const userContext = await options?.onMutate?.(variables, {
        client: queryClient,
        meta: options?.meta,
        mutationKey: options?.mutationKey
      });
      return { ...(userContext as any), previousTeam };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousTeam) {
        queryClient.setQueryData(teamKeys.detail(variables.teamId), context.previousTeam);
      }
      if (options?.onError) (options.onError as any)(err, variables, context);
    },
    onSuccess: async (data, variables, context) => {
      if ((data as any).success !== false) {
        await invalidate(variables.teamId);
        if (options?.onSuccess) await (options.onSuccess as any)(data, variables, context);
      }
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
      if (options?.onSettled) (options.onSettled as any)(data, error, variables, context);
    }
  });
};

export const useManageStaffMutation = (
  options?: UseMutationOptions<any, AxiosError, { teamId: string, memberId: string, action: "promote" | "demote" }>
) => {
  const invalidate = useInvalidateTeam();

  return useMutation({
    ...options,
    mutationFn: teamApi.manageStaff,
    onSuccess: async (data, variables, context) => {
      if (data.success !== false) {
        await invalidate(variables.teamId);
        if (options?.onSuccess) await (options.onSuccess as any)(data, variables, context);
      }
    }
  });
};

export const useTransferOwnershipMutation = (
  options?: UseMutationOptions<any, AxiosError, { teamId: string, memberId: string }>
) => {
  const invalidate = useInvalidateTeam();

  return useMutation({
    ...options,
    mutationFn: teamApi.transferOwnership,
    onSuccess: async (data, variables, context) => {
      if (data.success !== false) {
        const checkAuth = useAuthStore.getState().checkAuth;
        await checkAuth(true);
        await invalidate(variables.teamId);
        if (options?.onSuccess) await (options.onSuccess as any)(data, variables, context);
      }
    }
  });
};

// --- JOIN REQUESTS ---
export const useHandleJoinRequestMutation = (
  options?: UseMutationOptions<any, AxiosError, { teamId: string, requestId: string, action: "accepted" | "rejected" }>
) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTeam();

  return useMutation({
    ...options,
    mutationFn: teamApi.handleJoinRequest,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.requests(variables.teamId) });
      const previousRequests = queryClient.getQueryData<any[]>(teamKeys.requests(variables.teamId));

      if (previousRequests) {
        queryClient.setQueryData<any[]>(teamKeys.requests(variables.teamId),
          previousRequests.filter(req => req._id !== variables.requestId)
        );
      }

      const userContext = await options?.onMutate?.(variables, {
        client: queryClient,
        meta: options?.meta,
        mutationKey: options?.mutationKey
      });
      return { ...(userContext as any), previousRequests };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(teamKeys.requests(variables.teamId), context.previousRequests);
      }
      if (options?.onError) (options.onError as any)(err, variables, context);
    },
    onSuccess: async (data, variables, context) => {
      if (data.success !== false) {
        await invalidate(variables.teamId, [teamKeys.requests(variables.teamId)]);
        if (options?.onSuccess) await (options.onSuccess as any)(data, variables, context);
      }
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.requests(variables.teamId) });
      if (options?.onSettled) (options.onSettled as any)(data, error, variables, context);
    }
  });
};

export const useClearAllJoinRequestsMutation = (
  options?: UseMutationOptions<any, AxiosError, string>
) => {
  const invalidate = useInvalidateTeam();

  return useMutation({
    ...options,
    mutationFn: teamApi.clearAllJoinRequests,
    onSuccess: async (data, teamId, context) => {
      if (data.success !== false) {
        await invalidate(teamId, [teamKeys.requests(teamId)]);
        if (options?.onSuccess) await (options.onSuccess as any)(data, teamId, context);
      }
    }
  });
};

export const useSendJoinRequestMutation = (
  options?: UseMutationOptions<any, AxiosError, { teamId: string, message?: string }>
) => {
  const invalidate = useInvalidateTeam();

  return useMutation({
    ...options,
    mutationFn: teamApi.sendJoinRequest,
    onSuccess: async (data, variables, context) => {
      if (data.success !== false) {
        await invalidate(variables.teamId, [teamKeys.requests(variables.teamId)]);
        if (options?.onSuccess) await (options.onSuccess as any)(data, variables, context);
      }
    }
  });
};

// --- INVITATIONS ---
export const useInviteMemberMutation = (
  options?: UseMutationOptions<any, AxiosError, { playerId: string, teamId: string, message?: string }>
) => {
  const invalidate = useInvalidateTeam();

  return useMutation({
    ...options,
    mutationFn: teamApi.inviteMember,
    onSuccess: async (data, variables, context) => {
      if (data.success !== false) {
        await invalidate(variables.teamId, [teamKeys.invites(variables.teamId)]);
        if (options?.onSuccess) await (options.onSuccess as any)(data, variables, context);
      }
    }
  });
};
