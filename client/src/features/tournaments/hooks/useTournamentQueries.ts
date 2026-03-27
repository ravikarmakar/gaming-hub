import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { tournamentApi } from '../api/tournamentApi';
import { Tournament, Round, Group, Leaderboard, TournamentListResponse } from '../types';

const TOURNAMENT_QUERY_CONFIG = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
} as const;

// Tournament keys factor
export const tournamentKeys = {
    all: ['tournaments'] as const,
    orgTournaments: (orgId: string) => [...tournamentKeys.all, 'org', orgId] as const,
    details: (eventId: string) => [...tournamentKeys.all, 'details', eventId] as const,
    rounds: (eventId: string) => [...tournamentKeys.all, 'rounds', eventId] as const,
    groups: (roundId: string, page: number, limit: number, search = "", status = "", sortBy = "") => 
        [...tournamentKeys.all, 'groups', roundId, page, limit, search, status, sortBy] as const,
    groupDetails: (groupId: string) => [...tournamentKeys.all, 'groupDetails', groupId] as const,
    leaderboard: (groupId: string) => [...tournamentKeys.all, 'leaderboard', groupId] as const,
    registeredTeams: (eventId: string, search: string, type: 'infinite' | 'standard' = 'standard') => [...tournamentKeys.all, 'registered-teams', type, eventId, search] as const,
    invitedTeams: (eventId: string, search: string, type: 'infinite' | 'standard' = 'standard') => [...tournamentKeys.all, 'invited-teams', type, eventId, search] as const,
    t1SpecialTeams: (eventId: string, search: string, type: 'infinite' | 'standard' = 'standard') => [...tournamentKeys.all, 't1-special-teams', type, eventId, search] as const,
    registrationStatus: (eventId: string, teamId: string) => [...tournamentKeys.all, 'registration-status', eventId, teamId] as const,
};

// Helper to check if an ID is a valid backend ID (not a roadmap placeholder)
const isValidId = (id: string | null | undefined): boolean => {
    if (!id) return false;
    return !id.startsWith('placeholder-');
};

// Queries
export const useGetRegistrationStatusQuery = (eventId: string, teamId: string, options: any = {}) => {
    return useQuery<any>({
        ...TOURNAMENT_QUERY_CONFIG,
        ...options,
        queryKey: tournamentKeys.registrationStatus(eventId, teamId),
        queryFn: () => tournamentApi.getRegistrationStatus(eventId, teamId),
        enabled: (options.enabled ?? true) && !!eventId && !!teamId,
    });
};

export const useGetRoundsQuery = (eventId: string, options: any = {}) => {
    return useQuery<Round[]>({
        ...TOURNAMENT_QUERY_CONFIG,
        ...options,
        queryKey: tournamentKeys.rounds(eventId),
        queryFn: () => tournamentApi.getRounds(eventId),
        enabled: (options.enabled ?? true) && !!eventId,
    });
};

export const useGetGroupsQuery = (roundId: string, page = 1, limit = 20, search = "", status = "", sortBy = "", options: any = {}) => {
    return useQuery<{ groups: Group[]; pagination: any }>({
        ...TOURNAMENT_QUERY_CONFIG,
        staleTime: 60 * 1000, // 1 minute for groups
        ...options,
        queryKey: tournamentKeys.groups(roundId, page, limit, search, status, sortBy),
        queryFn: () => tournamentApi.getGroups({ roundId, page, limit, search, status, sortBy }),
        enabled: (options.enabled ?? true) && isValidId(roundId),
    });
};

export const useGetGroupDetailsQuery = (groupId: string, options: any = {}) => {
    return useQuery<Group>({
        ...TOURNAMENT_QUERY_CONFIG,
        staleTime: 60 * 1000, // 1 minute
        ...options,
        queryKey: tournamentKeys.groupDetails(groupId),
        queryFn: () => tournamentApi.getGroupDetails(groupId),
        enabled: (options.enabled ?? true) && isValidId(groupId),
    });
};

export const useGetLeaderboardQuery = (groupId: string, options: any = {}) => {
    return useQuery<Leaderboard>({
        ...TOURNAMENT_QUERY_CONFIG,
        staleTime: 60 * 1000, // 1 minute for leaderboard
        ...options,
        queryKey: tournamentKeys.leaderboard(groupId),
        queryFn: () => tournamentApi.getLeaderboard(groupId),
        enabled: (options.enabled ?? true) && isValidId(groupId),
    });
};

export const useGetTournamentDetailsQuery = (eventId: string, options: any = {}) => {
    return useQuery<Tournament>({
        ...TOURNAMENT_QUERY_CONFIG,
        ...options,
        queryKey: tournamentKeys.details(eventId),
        queryFn: () => tournamentApi.getTournamentDetails(eventId),
        enabled: (options.enabled ?? true) && !!eventId,
    });
};

export const useGetOrgTournamentsQuery = (orgId: string, options: any = {}) => {
    return useQuery<Tournament[]>({
        ...TOURNAMENT_QUERY_CONFIG,
        ...options,
        queryKey: tournamentKeys.orgTournaments(orgId),
        queryFn: () => tournamentApi.getOrgTournaments(orgId),
        enabled: (options.enabled ?? true) && !!orgId,
    });
};

export const useGetInfiniteRegisteredTeamsQuery = (eventId: string, search = "", options: any = {}) => {
    return useInfiniteQuery({
        ...TOURNAMENT_QUERY_CONFIG,
        ...options,
        queryKey: tournamentKeys.registeredTeams(eventId, search, 'infinite'),
        queryFn: ({ pageParam = null }) => tournamentApi.getRegisteredTeams(eventId, { cursor: pageParam, limit: 20, search }),
        initialPageParam: null,
        getNextPageParam: (lastPage: any) => lastPage?.nextCursor,
        enabled: (options.enabled ?? true) && !!eventId,
    });
};

export const useGetInfiniteInvitedTeamsQuery = (eventId: string, search = "", options: any = {}) => {
    return useInfiniteQuery({
        ...TOURNAMENT_QUERY_CONFIG,
        ...options,
        queryKey: tournamentKeys.invitedTeams(eventId, search, 'infinite'),
        queryFn: ({ pageParam = null }) => tournamentApi.getInvitedTeams(eventId, { cursor: pageParam, limit: 20, search }),
        initialPageParam: null,
        getNextPageParam: (lastPage: any) => lastPage?.nextCursor,
        enabled: (options.enabled ?? true) && !!eventId,
    });
};

export const useSearchTeamsQuery = (search: string, options: any = {}) => {
    return useQuery<any[]>({
        ...TOURNAMENT_QUERY_CONFIG,
        ...options,
        queryKey: ['teams', 'search', search],
        queryFn: () => tournamentApi.searchTeams({ search, limit: 10 }),
        enabled: (options.enabled ?? true) && search.length >= 2,
    });
};

export const useGetInfiniteT1SpecialTeamsQuery = (eventId: string, search = "", options: any = {}) => {
    return useInfiniteQuery({
        ...TOURNAMENT_QUERY_CONFIG,
        ...options,
        queryKey: tournamentKeys.t1SpecialTeams(eventId, search, 'infinite'),
        queryFn: ({ pageParam = null }) => tournamentApi.getT1SpecialTeams(eventId, { cursor: pageParam, limit: 20, search }),
        initialPageParam: null,
        getNextPageParam: (lastPage: any) => lastPage?.nextCursor,
        enabled: (options.enabled ?? true) && !!eventId,
    });
};

export const useGetT1SpecialTeamsQuery = (eventId: string, search = "", options: any = {}) => {
    return useQuery<any[]>({
        ...TOURNAMENT_QUERY_CONFIG,
        ...options,
        queryKey: tournamentKeys.t1SpecialTeams(eventId, search),
        queryFn: async () => {
            const data = await tournamentApi.getT1SpecialTeams(eventId, { search, limit: 100 });
            return data?.teams || [];
        },
        enabled: (options.enabled ?? true) && !!eventId,
    });
};

export const useGetTournamentsQuery = (params: { search?: string; game?: string; category?: string; cursor?: string | null; limit?: number }, options: any = {}) => {
    return useQuery<TournamentListResponse>({
        ...TOURNAMENT_QUERY_CONFIG,
        ...options,
        queryKey: [...tournamentKeys.all, 'list', params],
        queryFn: () => tournamentApi.getTournaments(params),
        enabled: (options.enabled ?? true),
    });
};

export const useGetInfiniteTournamentsQuery = (params: { search?: string; game?: string; category?: string; limit?: number }, options: any = {}) => {
    return useInfiniteQuery<TournamentListResponse>({
        ...TOURNAMENT_QUERY_CONFIG,
        ...options,
        queryKey: [...tournamentKeys.all, 'infinite-list', params],
        queryFn: ({ pageParam = null }: { pageParam?: any }) => 
            tournamentApi.getTournaments({ ...params, cursor: pageParam }),
        initialPageParam: null,
        getNextPageParam: (lastPage: any) => lastPage?.pagination?.nextCursor,
        enabled: (options.enabled ?? true),
    });
};

