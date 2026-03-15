import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { tournamentApi } from '../api/tournamentApi';
import { Tournament, Round, Group, Leaderboard } from '../types';

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

// Queries
export const useGetRegistrationStatusQuery = (eventId: string, teamId: string) => {
    return useQuery({
        queryKey: tournamentKeys.registrationStatus(eventId, teamId),
        queryFn: () => tournamentApi.getRegistrationStatus(eventId, teamId),
        enabled: !!eventId && !!teamId,
    });
};
export const useGetRoundsQuery = (eventId: string) => {
    return useQuery<Round[]>({
        queryKey: tournamentKeys.rounds(eventId),
        queryFn: () => tournamentApi.getRounds(eventId),
        enabled: !!eventId,
    });
};

export const useGetGroupsQuery = (roundId: string, page = 1, limit = 20, search = "", status = "", sortBy = "") => {
    return useQuery<{ groups: Group[]; pagination: any }>({
        queryKey: tournamentKeys.groups(roundId, page, limit, search, status, sortBy),
        queryFn: () => tournamentApi.getGroups({ roundId, page, limit, search, status, sortBy }),
        enabled: !!roundId,
    });
};


export const useGetGroupDetailsQuery = (groupId: string) => {
    return useQuery<Group>({
        queryKey: tournamentKeys.groupDetails(groupId),
        queryFn: () => tournamentApi.getGroupDetails(groupId),
        enabled: !!groupId,
    });
};

export const useGetLeaderboardQuery = (groupId: string) => {
    return useQuery<Leaderboard>({
        queryKey: tournamentKeys.leaderboard(groupId),
        queryFn: () => tournamentApi.getLeaderboard(groupId),
        enabled: !!groupId,
    });
};

export const useGetTournamentDetailsQuery = (eventId: string, options: any = {}) => {
    return useQuery<Tournament>({
        queryKey: tournamentKeys.details(eventId),
        queryFn: () => tournamentApi.getTournamentDetails(eventId),
        ...options,
        enabled: (options.enabled !== undefined ? options.enabled : true) && !!eventId,
    });
};

export const useGetOrgTournamentsQuery = (orgId: string) => {
    return useQuery<Tournament[]>({
        queryKey: tournamentKeys.orgTournaments(orgId),
        queryFn: () => tournamentApi.getOrgTournaments(orgId),
        enabled: !!orgId,
    });
};

export const useGetInfiniteRegisteredTeamsQuery = (eventId: string, search = "") => {
    return useInfiniteQuery({
        queryKey: tournamentKeys.registeredTeams(eventId, search, 'infinite'),
        queryFn: ({ pageParam = null }) => tournamentApi.getRegisteredTeams(eventId, { cursor: pageParam, limit: 20, search, skipCache: true }),
        initialPageParam: null,
        getNextPageParam: (lastPage: any) => lastPage?.nextCursor,
        enabled: !!eventId,
    });
};

export const useGetInfiniteInvitedTeamsQuery = (eventId: string, search = "") => {
    return useInfiniteQuery({
        queryKey: tournamentKeys.invitedTeams(eventId, search, 'infinite'),
        queryFn: ({ pageParam = null }) => tournamentApi.getInvitedTeams(eventId, { cursor: pageParam, limit: 20, search, skipCache: true }),
        initialPageParam: null,
        getNextPageParam: (lastPage: any) => lastPage?.nextCursor,
        enabled: !!eventId,
    });
};

export const useSearchTeamsQuery = (search: string) => {
    return useQuery<any[]>({
        queryKey: ['teams', 'search', search],
        queryFn: () => tournamentApi.searchTeams({ search, limit: 10 }),
        enabled: search.length >= 2,
    });
};

export const useGetInfiniteT1SpecialTeamsQuery = (eventId: string, search = "") => {
    return useInfiniteQuery({
        queryKey: tournamentKeys.t1SpecialTeams(eventId, search, 'infinite'),
        queryFn: ({ pageParam = null }) => tournamentApi.getT1SpecialTeams(eventId, { cursor: pageParam, limit: 20, search, skipCache: true }),
        initialPageParam: null,
        getNextPageParam: (lastPage: any) => lastPage?.nextCursor,
        enabled: !!eventId,
    });
};

export const useGetT1SpecialTeamsQuery = (eventId: string, search = "") => {
    return useQuery<any[]>({
        queryKey: tournamentKeys.t1SpecialTeams(eventId, search),
        queryFn: async () => {
            const data = await tournamentApi.getT1SpecialTeams(eventId, { search, limit: 100 });
            return data?.teams || [];
        },
        enabled: !!eventId,
    });
};

export const useGetTournamentsQuery = (params: { search?: string; game?: string; category?: string; cursor?: string | null; limit?: number }) => {
    return useQuery({
        queryKey: [...tournamentKeys.all, 'list', params],
        queryFn: () => tournamentApi.getTournaments(params),
    });
};

