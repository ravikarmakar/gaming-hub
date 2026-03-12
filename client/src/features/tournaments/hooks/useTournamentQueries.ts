import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { tournamentApi } from '../api/tournamentApi';

// Tournament keys factor
export const tournamentKeys = {
    all: ['tournaments'] as const,
    orgTournaments: (orgId: string) => [...tournamentKeys.all, 'org', orgId] as const,
    details: (eventId: string) => [...tournamentKeys.all, 'details', eventId] as const,
    rounds: (eventId: string) => [...tournamentKeys.all, 'rounds', eventId] as const,
    groups: (roundId: string, page: number, limit: number) => [...tournamentKeys.all, 'groups', roundId, page, limit] as const,
    groupDetails: (groupId: string) => [...tournamentKeys.all, 'groupDetails', groupId] as const,
    leaderboard: (groupId: string) => [...tournamentKeys.all, 'leaderboard', groupId] as const,
    registeredTeams: (eventId: string, search: string) => [...tournamentKeys.all, 'registered-teams', eventId, search] as const,
    invitedTeams: (eventId: string, search: string) => [...tournamentKeys.all, 'invited-teams', eventId, search] as const,
};

// Types from the store
export interface Team {
    _id: string;
    teamName: string;
    teamLogo?: string;
    isQualified?: boolean;
}

export interface LeaderboardEntry {
    _id: string;
    teamId: Team; // Populated
    score: number;
    position: number;
    kills: number;
    wins: number;
    totalPoints: number;
    matchesPlayed: number;
    isQualified: boolean;
}

export interface Leaderboard {
    _id: string;
    groupId: string;
    teamScore: LeaderboardEntry[];
}

export interface Group {
    _id: string;
    groupName: string;
    totalMatch: number;
    matchTime: string;
    teams: Team[];
    roundId: string;
    matchesPlayed?: number;
    totalSelectedTeam?: number;
    status?: 'pending' | 'ongoing' | 'completed' | 'cancelled';
    roomId?: number;
    roomPassword?: number;
}

export interface Round {
    _id: string;
    roundName: string;
    roundNumber: number;
    status: "pending" | "ongoing" | "completed";
    eventId: string;
    groups?: Group[];
    startTime?: string;
    dailyStartTime?: string;
    dailyEndTime?: string;
    gapMinutes?: number;
    matchesPerGroup?: number;
    qualifyingTeams?: number;
}

// Queries
export const useGetRoundsQuery = (eventId: string) => {
    return useQuery({
        queryKey: tournamentKeys.rounds(eventId),
        queryFn: async () => {
            const res = await axiosInstance.get(`/rounds?eventId=${eventId}`);
            return res.data.data as Round[];
        },
        enabled: !!eventId,
    });
};

export const useGetGroupsQuery = (roundId: string, page = 1, limit = 20) => {
    return useQuery({
        queryKey: tournamentKeys.groups(roundId, page, limit),
        queryFn: async () => {
            const res = await axiosInstance.get("/groups", {
                params: { roundId, page, limit }
            });
            return {
                groups: res.data.data as Group[],
                pagination: res.data.pagination as {
                    totalGroups: number;
                    totalPages: number;
                    currentPage: number;
                }
            };
        },
        enabled: !!roundId,
    });
};

export const useGetGroupDetailsQuery = (groupId: string) => {
    return useQuery({
        queryKey: tournamentKeys.groupDetails(groupId),
        queryFn: async () => {
            const res = await axiosInstance.get(`/groups/${groupId}`);
            return res.data.group as Group;
        },
        enabled: !!groupId,
    });
};

export const useGetLeaderboardQuery = (groupId: string) => {
    return useQuery({
        queryKey: tournamentKeys.leaderboard(groupId),
        queryFn: async () => {
            const res = await axiosInstance.get(`/leaderboards/${groupId}`);
            return res.data as Leaderboard;
        },
        enabled: !!groupId,
    });
};

export const useGetTournamentDetailsQuery = (eventId: string) => {
    return useQuery({
        queryKey: tournamentKeys.details(eventId),
        queryFn: () => tournamentApi.getTournamentDetails(eventId),
        enabled: !!eventId,
    });
};

export const useGetOrgTournamentsQuery = (orgId: string) => {
    return useQuery({
        queryKey: tournamentKeys.orgTournaments(orgId),
        queryFn: () => tournamentApi.getOrgTournaments(orgId),
        enabled: !!orgId,
    });
};

export const useGetInfiniteRegisteredTeamsQuery = (eventId: string, search = "") => {
    return useInfiniteQuery({
        queryKey: tournamentKeys.registeredTeams(eventId, search),
        queryFn: async ({ pageParam = null }) => {
            const res = await axiosInstance.get(`/events/registered-teams/${eventId}`, {
                params: { cursor: pageParam, limit: 20, search, skipCache: true }
            });
            return res.data;
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!eventId,
    });
};

export const useGetInfiniteInvitedTeamsQuery = (eventId: string, search = "") => {
    return useInfiniteQuery({
        queryKey: tournamentKeys.invitedTeams(eventId, search),
        queryFn: async ({ pageParam = null }) => {
            const res = await axiosInstance.get(`/events/invited-teams/${eventId}`, {
                params: { cursor: pageParam, limit: 20, search, skipCache: true }
            });
            return res.data;
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!eventId,
    });
};
