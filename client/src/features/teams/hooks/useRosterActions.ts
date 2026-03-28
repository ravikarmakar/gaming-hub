import { useCallback } from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  useHandleJoinRequestMutation,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
  useManageStaffMutation,
  useTransferOwnershipMutation
} from "./useTeamMutations";

export const useRosterActions = (teamId: string) => {
  const handleRequestMutation = useHandleJoinRequestMutation();
  const removeMemberMutation = useRemoveMemberMutation();
  const updateRoleMutation = useUpdateMemberRoleMutation();
  const manageStaffMutation = useManageStaffMutation();
  const transferOwnershipMutation = useTransferOwnershipMutation();

  const handleJoinRequest = useCallback(async (requestId: string, action: "accepted" | "rejected") => {
    if (!teamId) {
      console.error("teamId is missing in handleJoinRequest");
      return Promise.reject("teamId is missing");
    }
    return handleRequestMutation.mutateAsync({ teamId, requestId, action }, {
      onSuccess: (data) => toast.success(data.message || `Request ${action} successfully`),
      onError: (error: AxiosError<any>) => toast.error((error.response?.data as any)?.message || `Failed to ${action} request`)
    });
  }, [teamId]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!teamId) {
      console.error("teamId is missing in removeMember");
      return Promise.reject("teamId is missing");
    }
    return removeMemberMutation.mutateAsync({ teamId, memberId }, {
      onSuccess: () => toast.success("Member removed from team"),
      onError: (error: AxiosError<any>) => toast.error((error.response?.data as any)?.message || "Failed to remove member")
    });
  }, [teamId]);

  const updateRole = useCallback(async (memberId: string, role: string) => {
    if (!teamId) {
      console.error("teamId is missing in updateRole");
      return Promise.reject("teamId is missing");
    }
    return updateRoleMutation.mutateAsync({ teamId, memberId, role }, {
      onSuccess: () => toast.success("Member role updated"),
      onError: (error: AxiosError<any>) => toast.error((error.response?.data as any)?.message || "Failed to update role")
    });
  }, [teamId]);

  const promoteToStaff = useCallback(async (memberId: string) => {
    if (!teamId) {
      console.error("teamId is missing in promoteToStaff");
      return Promise.reject("teamId is missing");
    }
    return manageStaffMutation.mutateAsync({ teamId, memberId, action: "promote" }, {
      onSuccess: () => toast.success("Member promoted to staff"),
      onError: (error: any) => toast.error(error.response?.data?.message || "Failed to promote member")
    });
  }, [teamId]);

  const demoteFromStaff = useCallback(async (memberId: string) => {
    if (!teamId) {
      console.error("teamId is missing in demoteFromStaff");
      return Promise.reject("teamId is missing");
    }
    return manageStaffMutation.mutateAsync({ teamId, memberId, action: "demote" }, {
      onSuccess: () => toast.success("Member demoted from staff"),
      onError: (error: any) => toast.error(error.response?.data?.message || "Failed to demote member")
    });
  }, [teamId]);

  const transferOwnership = useCallback(async (memberId: string) => {
    if (!teamId) {
      console.error("teamId is missing in transferOwnership");
      return Promise.reject("teamId is missing");
    }
    return transferOwnershipMutation.mutateAsync({ teamId, memberId }, {
      onSuccess: () => toast.success("Team ownership transferred successfully"),
      onError: (error: AxiosError<any>) => toast.error((error.response?.data as any)?.message || "Failed to transfer ownership")
    });
  }, [teamId]);

  return {
    handleJoinRequest,
    removeMember,
    updateRole,
    promoteToStaff,
    demoteFromStaff,
    transferOwnership,
    loading: {
      removeMember: removeMemberMutation.isPending,
      updateRole: updateRoleMutation.isPending,
      handleRequest: handleRequestMutation.isPending ? handleRequestMutation.variables : null,
      manageStaff: manageStaffMutation.isPending,
      transferOwnership: transferOwnershipMutation.isPending,
    }
  };
};
