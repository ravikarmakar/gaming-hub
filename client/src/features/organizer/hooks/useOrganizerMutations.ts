import { AxiosError } from "axios";
import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";

import { organizerApi } from "../api/organizerApi";
import { organizerKeys } from "./organizerKeys";
import { Organizer } from "../lib/types";

// --- CREATE ORG ---
export const useCreateOrgMutation = (
    options?: UseMutationOptions<Organizer, AxiosError, FormData>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizerApi.createOrg,
        ...options,
        onSuccess: async (...args) => {
            // Await the invalidation to ensure the mutation stays pending until refetch completes
            await queryClient.invalidateQueries({ queryKey: organizerKeys.all });

            if (options?.onSuccess) {
                options.onSuccess(...args);
            }
        }
    });
};

// --- UPDATE ORG ---
export const useUpdateOrgMutation = (
    options?: UseMutationOptions<Organizer, AxiosError, { orgId: string, data: FormData | Partial<Organizer> }, unknown>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizerApi.updateOrg,
        ...options,
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: organizerKeys.detail(variables.orgId) }),
                queryClient.invalidateQueries({ queryKey: organizerKeys.lists() }),
            ]);
            if (options?.onSuccess) {
                (options.onSuccess as any)(data, variables, context);
            }
        }
    });
};

// --- DELETE ORG ---
export const useDeleteOrgMutation = (
    options?: UseMutationOptions<boolean, AxiosError, string, unknown>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizerApi.deleteOrg,
        ...options,
        onSuccess: async (data, orgId, context) => {
            await queryClient.invalidateQueries({ queryKey: organizerKeys.lists() });
            queryClient.removeQueries({ queryKey: organizerKeys.detail(orgId) });
            if (options?.onSuccess) {
                (options.onSuccess as any)(data, orgId, context);
            }
        }
    });
};

// --- ADD STAFF ---
export const useAddStaffMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { orgId: string, data: { staff: string[] } }, unknown>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizerApi.addStaffs,
        ...options,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: organizerKeys.detail(variables.orgId) });
            if (options?.onSuccess) {
                (options.onSuccess as any)(data, variables, context);
            }
        }
    });
};

// --- UPDATE STAFF ROLE ---
export const useUpdateStaffRoleMutation = (
    options?: UseMutationOptions<Organizer, AxiosError, { orgId: string, userId: string, role: string }, unknown>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizerApi.updateStaffRole,
        ...options,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: organizerKeys.detail(variables.orgId) });
            if (options?.onSuccess) {
                (options.onSuccess as any)(data, variables, context);
            }
        }
    });
};

// --- TRANSFER OWNERSHIP ---
export const useTransferOwnershipMutation = (
    options?: UseMutationOptions<Organizer, AxiosError, { orgId: string, userId: string }, unknown>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizerApi.transferOwnership,
        ...options,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: organizerKeys.detail(variables.orgId) });
            if (options?.onSuccess) {
                (options.onSuccess as any)(data, variables, context);
            }
        }
    });
};

// --- REMOVE STAFF ---
export const useRemoveStaffMutation = (
    options?: UseMutationOptions<Organizer, AxiosError, { orgId: string, id: string }, unknown>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizerApi.removeStaff,
        ...options,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: organizerKeys.detail(variables.orgId) });
            if (options?.onSuccess) {
                (options.onSuccess as any)(data, variables, context);
            }
        }
    });
};

// --- JOIN ORG ---
export const useJoinOrgMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { orgId: string, message?: string }, unknown>
) => {
    return useMutation({
        mutationFn: organizerApi.joinOrg,
        ...options,
    });
};

// --- MANAGE JOIN REQUEST ---
export const useManageJoinRequestMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { orgId: string, requestId: string, action: "accepted" | "rejected" }, unknown>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizerApi.manageJoinRequest,
        ...options,
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [...organizerKeys.detail(variables.orgId), 'join-requests'] }),
                queryClient.invalidateQueries({ queryKey: organizerKeys.detail(variables.orgId) }) // Invalidate org to refresh members
            ]);
            if (options?.onSuccess) {
                (options.onSuccess as any)(data, variables, context);
            }
        }
    });
};

// --- INVITE STAFF ---
export const useInviteStaffMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { orgId: string, userId: string, role: string, message?: string }, unknown>
) => {
    return useMutation({
        mutationFn: organizerApi.inviteStaff,
        ...options,
    });
};

// --- CANCEL INVITE ---
export const useCancelInviteMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { orgId: string, inviteId: string }, unknown>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizerApi.cancelInvite,
        ...options,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: [...organizerKeys.detail(variables.orgId), 'invites'] });
            if (options?.onSuccess) {
                (options.onSuccess as any)(data, variables, context);
            }
        }
    });
};

// --- MARK NOTIFICATION READ ---
export const useMarkNotificationReadMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { notificationId: string, orgId: string }, unknown>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ notificationId }) => organizerApi.markNotificationAsRead(notificationId),
        ...options,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: [...organizerKeys.detail(variables.orgId), 'notifications'] });
            if (options?.onSuccess) {
                (options.onSuccess as any)(data, variables, context);
            }
        }
    });
};