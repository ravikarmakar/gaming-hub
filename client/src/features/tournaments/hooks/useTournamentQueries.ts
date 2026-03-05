import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

// Tournament keys factor
export const tournamentKeys = {
    all: ['tournaments'] as const,
    rounds: (eventId: string) => [...tournamentKeys.all, 'rounds', eventId] as const,
    groups: (roundId: string, page: number, limit: number) => [...tournamentKeys.all, 'groups', roundId, page, limit] as const,
    groupDetails: (groupId: string) => [...tournamentKeys.all, 'groupDetails', groupId] as const,
    leaderboard: (groupId: string) => [...tournamentKeys.all, 'leaderboard', groupId] as const,
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
