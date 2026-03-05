import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOrgRoom, useSocketEvent } from "@/hooks/useSocket";
import { organizerKeys } from "./organizerKeys";

export const useOrganizerSync = (orgId?: string) => {
    const queryClient = useQueryClient();

    // 1. Join the Socket.IO room for this Organization
    useOrgRoom(orgId || "");

    // 2. Define stable socket handlers
    // NOTE: We use invalidateQueries (not setQueryData) because the actual query key
    // includes page/limit/search params. invalidateQueries does partial key matching,
    // while setQueryData requires an EXACT key match and would silently fail.

    const handleOrgUpdate = useCallback(() => {
        if (!orgId) return;
        queryClient.invalidateQueries({ queryKey: organizerKeys.detail(orgId) });
    }, [orgId, queryClient]);

    const handleMemberJoined = useCallback((payload: { orgId: string }) => {
        if (!orgId || orgId !== payload.orgId) return;
        queryClient.invalidateQueries({ queryKey: organizerKeys.detail(orgId) });
    }, [orgId, queryClient]);

    const handleMemberLeft = useCallback((payload: { orgId: string }) => {
        if (!orgId || orgId !== payload.orgId) return;
        queryClient.invalidateQueries({ queryKey: organizerKeys.detail(orgId) });
    }, [orgId, queryClient]);

    const handleRoleUpdated = useCallback((payload: { orgId: string }) => {
        if (!orgId || orgId !== payload.orgId) return;
        queryClient.invalidateQueries({ queryKey: organizerKeys.detail(orgId) });
    }, [orgId, queryClient]);

    const handleOwnerTransferred = useCallback((payload: { orgId: string }) => {
        if (!orgId || orgId !== payload.orgId) return;
        queryClient.invalidateQueries({ queryKey: organizerKeys.detail(orgId) });
    }, [orgId, queryClient]);

    const handleOrgDeleted = useCallback((payload: { orgId: string }) => {
        if (!orgId || orgId !== payload.orgId) return;
        queryClient.invalidateQueries({ queryKey: organizerKeys.detail(orgId) });
    }, [orgId, queryClient]);

    // 3. Listen to incoming Socket events pushed by backend
    useSocketEvent("org:updated", handleOrgUpdate);
    useSocketEvent("org:member:joined", handleMemberJoined);
    useSocketEvent("org:member:left", handleMemberLeft);
    useSocketEvent("org:role:updated", handleRoleUpdated);
    useSocketEvent("org:owner:transferred", handleOwnerTransferred);
    useSocketEvent("org:deleted", handleOrgDeleted);
};
