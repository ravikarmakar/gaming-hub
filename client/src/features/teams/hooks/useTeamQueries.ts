import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData, keepPreviousData } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { teamApi } from "../api/teamApi";
import { teamKeys } from "./teamKeys";
import { Team, JoinRequest, TeamInvitation, Pagination, TeamTournament } from "../lib/types";

// --- LIST TEAMS ---
export const useTeamsQuery = (
    params: {
        page?: number;
        limit?: number;
        search?: string;
        region?: string;
        isRecruiting?: boolean;
        isVerified?: boolean;
    },
    options?: Omit<UseQueryOptions<{ data: Team[]; pagination: Pagination }, AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: teamKeys.list(params),
        queryFn: () => teamApi.fetchTeams(params),
        ...options,
    });
};

// --- INFINITE LIST TEAMS ---
export const useInfiniteTeamsQuery = (
    params: {
        limit?: number;
        search?: string;
        region?: string;
        isRecruiting?: boolean;
        isVerified?: boolean;
    },
    options?: Omit<UseInfiniteQueryOptions<{ data: Team[]; pagination: Pagination }, AxiosError, InfiniteData<{ data: Team[]; pagination: Pagination }>>, "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam">
) => {
    return useInfiniteQuery({
        queryKey: [...teamKeys.lists(), 'infinite', params],
        queryFn: ({ pageParam = 1 }) => teamApi.fetchTeams({ ...params, page: pageParam as number }),
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

// --- GET TEAM BY ID ---
export const useGetTeamByIdQuery = (
    id: string,
    skipCache: boolean = false,
    options?: Omit<UseQueryOptions<Team, AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: teamKeys.detail(id),
        queryFn: () => teamApi.getTeamById(id, skipCache),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        ...options,
    });
};

// --- TEAM JOIN REQUESTS ---
export const useTeamJoinRequestsQuery = (
    teamId: string,
    options?: Omit<UseQueryOptions<JoinRequest[], AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: teamKeys.requests(teamId),
        queryFn: () => teamApi.fetchJoinRequests(teamId),
        enabled: !!teamId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: false,
        ...options,
    });
};

// --- TEAM PENDING INVITES ---
export const useTeamPendingInvitesQuery = (
    teamId: string,
    options?: Omit<UseQueryOptions<TeamInvitation[], AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: teamKeys.invites(teamId),
        queryFn: () => teamApi.fetchPendingInvites(teamId),
        enabled: !!teamId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: false,
        ...options,
    });
};

// --- TEAM TOURNAMENTS ---
export const useTeamTournamentsQuery = (
    teamId: string,
    options?: Omit<UseQueryOptions<TeamTournament[], AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: teamKeys.tournaments(teamId),
        queryFn: () => teamApi.fetchTeamTournaments(teamId),
        enabled: !!teamId,
        ...options,
    });
};
