import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { organizerApi } from "../api/organizerApi";
import { organizerKeys } from "./organizerKeys";
import { Organizer, DashboardStats, Invite, Pagination } from "../lib/types";
import { User } from "@/features/auth/lib/types";
import { Notification } from "@/features/notifications/store/useNotificationStore";
import { JoinRequest } from "../store/useOrganizerStore";

// --- GET ORG DETAILS BY ID ---
export const useGetOrgByIdQuery = (
    id: string,
    page: number = 1,
    limit: number = 20,
    search: string = "",
    options?: Omit<UseQueryOptions<{ success: boolean; data: Organizer; pagination?: Pagination }, AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [...organizerKeys.detail(id), page, limit, search],
        queryFn: () => organizerApi.getOrgById(id, page, limit, search),
        enabled: !!id,
        ...options,
    });
};

// --- LIST ORGANIZERS ---
export const useOrganizersQuery = (
    page: number = 1,
    limit: number = 20,
    search: string = "",
    options?: Omit<UseQueryOptions<{ success: boolean; data: Organizer[]; pagination: Pagination }, AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [...organizerKeys.lists(), page, limit, search],
        queryFn: () => organizerApi.fetchOrganizers(page, limit, search),
        ...options,
    });
};

// --- DASHBOARD STATS ---
export const useOrgDashboardStatsQuery = (
    orgId: string,
    options?: Omit<UseQueryOptions<DashboardStats, AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [...organizerKeys.detail(orgId), 'dashboard'],
        queryFn: () => organizerApi.getDashboardStats(orgId),
        enabled: !!orgId,
        ...options,
    });
};

// --- SEARCH AVAILABLE USERS ---
export const useSearchAvailableUsersQuery = (
    query: string,
    page: number = 1,
    limit: number = 20,
    options?: Omit<UseQueryOptions<User[], AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: ['users', 'search', query, page, limit],
        queryFn: () => organizerApi.searchAvailableUsers(query, page, limit),
        enabled: !!query,
        ...options,
    });
};

// --- JOIN REQUESTS ---
export const useOrgJoinRequestsQuery = (
    orgId: string,
    page: number = 1,
    limit: number = 20,
    options?: Omit<UseQueryOptions<{ success: boolean; data: JoinRequest[]; pagination: Pagination }, AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [...organizerKeys.detail(orgId), 'join-requests', page, limit],
        queryFn: () => organizerApi.fetchJoinRequests(orgId, page, limit),
        enabled: !!orgId,
        ...options,
    });
};

// --- PENDING INVITES ---
export const useOrgPendingInvitesQuery = (
    orgId: string,
    options?: Omit<UseQueryOptions<Invite[], AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [...organizerKeys.detail(orgId), 'invites'],
        queryFn: () => organizerApi.fetchPendingInvites(orgId),
        enabled: !!orgId,
        ...options,
    });
};

// --- NOTIFICATIONS ---
export const useOrgNotificationsQuery = (
    orgId: string,
    options?: Omit<UseQueryOptions<Notification[], AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: [...organizerKeys.detail(orgId), 'notifications'],
        queryFn: () => organizerApi.fetchNotifications(orgId),
        enabled: !!orgId,
        ...options,
    });
};
