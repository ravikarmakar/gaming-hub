import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData, keepPreviousData } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { organizerApi } from "../api/organizerApi";
import { organizerKeys } from "./organizerKeys";
import { Organizer, DashboardStats, Invite, Pagination, JoinRequest } from "../types";
import { User } from "@/features/auth";
import { Notification } from "@/features/notifications/types";


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

// --- INFINITE LIST ORGANIZERS ---
export const useInfiniteOrganizersQuery = (
    limit: number = 20,
    search: string = "",
    options?: Omit<UseInfiniteQueryOptions<{ success: boolean; data: Organizer[]; pagination: Pagination }, AxiosError, InfiniteData<{ success: boolean; data: Organizer[]; pagination: Pagination }>>, "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam">
) => {
    return useInfiniteQuery({
        queryKey: [...organizerKeys.lists(), 'infinite', limit, search],
        queryFn: ({ pageParam = 1 }) => organizerApi.fetchOrganizers(pageParam as number, limit, search),
        getNextPageParam: (lastPage) => {
            const { pagination } = lastPage;
            if (pagination && pagination.hasMore) {
                return pagination.currentPage + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: 1000 * 60 * 30, // 30 min
        gcTime: 1000 * 60 * 60,    // 1 hour
        placeholderData: keepPreviousData,
        ...options,
    });
};

// --- DASHBOARD STATS ---
export const useOrgDashboardStatsQuery = (
    orgId: string,
    options?: Omit<UseQueryOptions<DashboardStats, AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: organizerKeys.dashboard(orgId),
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
        queryKey: [...organizerKeys.requests(orgId), page, limit],
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
        queryKey: organizerKeys.invites(orgId),
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
        queryKey: organizerKeys.notifications(orgId),
        queryFn: () => organizerApi.fetchNotifications(orgId),
        enabled: !!orgId,
        retry: (failureCount, error: any) => {
            // Don't retry on authorization errors
            if (error?.response?.status === 403) return false;
            return failureCount < 2;
        },
        ...options,
    });
};
