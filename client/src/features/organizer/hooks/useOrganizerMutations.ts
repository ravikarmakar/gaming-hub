import { AxiosError } from "axios";
import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";

import { organizerApi } from "../api/organizerApi";
import { organizerKeys } from "./organizerKeys";
import { Organizer } from "../types";

// --- HELPERS ---
const useInvalidateOrg = () => {
    const queryClient = useQueryClient();
    return async (orgId?: string, additionalKeys: ReadonlyArray<ReadonlyArray<any>> = []) => {
        const promises: Promise<void>[] = [
            queryClient.invalidateQueries({ queryKey: organizerKeys.lists() })
        ];

        if (orgId) {
            promises.push(queryClient.invalidateQueries({ queryKey: organizerKeys.detail(orgId) }));
        }

        additionalKeys.forEach(key => {
            promises.push(queryClient.invalidateQueries({ queryKey: key }));
        });

        await Promise.all(promises);
    };
};

// --- CREATE ORG ---
export const useCreateOrgMutation = (
    options?: UseMutationOptions<Organizer, AxiosError, FormData>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizerApi.createOrg,
        ...options,
        onSuccess: async (...args) => {
            await queryClient.invalidateQueries({ queryKey: organizerKeys.all });
            if (options?.onSuccess) options.onSuccess(...args);
        }
    });
};

// --- UPDATE ORG ---
export const useUpdateOrgMutation = (
    options?: UseMutationOptions<Organizer, AxiosError, { orgId: string, data: FormData | Partial<Organizer> }>
) => {
    const invalidate = useInvalidateOrg();

    return useMutation({
        mutationFn: organizerApi.updateOrg,
        ...options,
        onSuccess: async (data, variables, context) => {
            await invalidate(variables.orgId);
            if (options?.onSuccess) (options.onSuccess as any)(data, variables, context);
        }
    });
};

// --- DELETE ORG ---
export const useDeleteOrgMutation = (
    options?: UseMutationOptions<boolean, AxiosError, string>
) => {
    const queryClient = useQueryClient();
    const invalidate = useInvalidateOrg();

    return useMutation({
        mutationFn: organizerApi.deleteOrg,
        ...options,
        onSuccess: async (data, orgId, context) => {
            await invalidate();
            queryClient.removeQueries({ queryKey: organizerKeys.detail(orgId) });
            if (options?.onSuccess) (options.onSuccess as any)(data, orgId, context);
        }
    });
};

// --- LEAVE ORG ---
export const useLeaveOrgMutation = (
    options?: UseMutationOptions<boolean, AxiosError, string>
) => {
    const queryClient = useQueryClient();
    const invalidate = useInvalidateOrg();

    return useMutation({
        mutationFn: organizerApi.leaveOrg,
        ...options,
        onSuccess: async (data, orgId, context) => {
            await invalidate();
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            if (options?.onSuccess) (options.onSuccess as any)(data, orgId, context);
        }
    });
};

// --- ADD STAFF ---
export const useAddStaffMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { orgId: string, data: { staff: string[] } }>
) => {
    const invalidate = useInvalidateOrg();

    return useMutation({
        mutationFn: organizerApi.addStaffs,
        ...options,
        onSuccess: async (data, variables, context) => {
            await invalidate(variables.orgId);
            if (options?.onSuccess) (options.onSuccess as any)(data, variables, context);
        }
    });
};

// --- UPDATE STAFF ROLE ---
export const useUpdateStaffRoleMutation = (
    options?: UseMutationOptions<Organizer, AxiosError, { orgId: string, userId: string, role: string }>
) => {
    const invalidate = useInvalidateOrg();

    return useMutation({
        mutationFn: organizerApi.updateStaffRole,
        ...options,
        onSuccess: async (data, variables, context) => {
            await invalidate(variables.orgId);
            if (options?.onSuccess) (options.onSuccess as any)(data, variables, context);
        }
    });
};

// --- TRANSFER OWNERSHIP ---
export const useTransferOwnershipMutation = (
    options?: UseMutationOptions<Organizer, AxiosError, { orgId: string, userId: string }>
) => {
    const invalidate = useInvalidateOrg();

    return useMutation({
        mutationFn: organizerApi.transferOwnership,
        ...options,
        onSuccess: async (data, variables, context) => {
            await invalidate(variables.orgId);
            if (options?.onSuccess) (options.onSuccess as any)(data, variables, context);
        }
    });
};

// --- REMOVE STAFF ---
export const useRemoveStaffMutation = (
    options?: UseMutationOptions<Organizer, AxiosError, { orgId: string, id: string }>
) => {
    const invalidate = useInvalidateOrg();

    return useMutation({
        mutationFn: organizerApi.removeStaff,
        ...options,
        onSuccess: async (data, variables, context) => {
            await invalidate(variables.orgId);
            if (options?.onSuccess) (options.onSuccess as any)(data, variables, context);
        }
    });
};

// --- JOIN ORG ---
export const useJoinOrgMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { orgId: string, message?: string }>
) => {
    const invalidate = useInvalidateOrg();
    return useMutation({
        mutationFn: organizerApi.joinOrg,
        ...options,
        onSuccess: async (data, variables, context) => {
            await invalidate(variables.orgId, [organizerKeys.requests(variables.orgId)]);
            if (options?.onSuccess) (options.onSuccess as any)(data, variables, context);
        }
    });
};

// --- MANAGE JOIN REQUEST ---
export const useManageJoinRequestMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { orgId: string, requestId: string, action: "accepted" | "rejected" }>
) => {
    const invalidate = useInvalidateOrg();

    return useMutation({
        mutationFn: organizerApi.manageJoinRequest,
        ...options,
        onSuccess: async (data, variables, context) => {
            await invalidate(variables.orgId, [organizerKeys.requests(variables.orgId)]);
            if (options?.onSuccess) (options.onSuccess as any)(data, variables, context);
        }
    });
};

// --- INVITE STAFF ---
export const useInviteStaffMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { orgId: string, userId: string, role: string, message?: string }>
) => {
    const invalidate = useInvalidateOrg();
    return useMutation({
        mutationFn: organizerApi.inviteStaff,
        ...options,
        onSuccess: async (data, variables, context) => {
            await invalidate(variables.orgId, [organizerKeys.invites(variables.orgId)]);
            if (options?.onSuccess) (options.onSuccess as any)(data, variables, context);
        }
    });
};

// --- CANCEL INVITE ---
export const useCancelInviteMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { orgId: string, inviteId: string }>
) => {
    const invalidate = useInvalidateOrg();

    return useMutation({
        mutationFn: organizerApi.cancelInvite,
        ...options,
        onSuccess: async (data, variables, context) => {
            await invalidate(variables.orgId, [organizerKeys.invites(variables.orgId)]);
            if (options?.onSuccess) (options.onSuccess as any)(data, variables, context);
        }
    });
};

// --- MARK NOTIFICATION READ ---
export const useMarkNotificationReadMutation = (
    options?: UseMutationOptions<boolean, AxiosError, { notificationId: string, orgId: string }>
) => {
    const invalidate = useInvalidateOrg();

    return useMutation({
        mutationFn: ({ notificationId }) => organizerApi.markNotificationAsRead(notificationId),
        ...options,
        onSuccess: async (data, variables, context) => {
            await invalidate(variables.orgId, [organizerKeys.notifications(variables.orgId)]);
            if (options?.onSuccess) (options.onSuccess as any)(data, variables, context);
        }
    });
};