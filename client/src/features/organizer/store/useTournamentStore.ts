
import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { handleApiError } from "@/lib/api-helper";

// Types
export interface Team {
    _id: string;
    teamName: string;
    teamLogo?: string;
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
    status?: 'pending' | 'ongoing' | 'completed';
}

export interface Round {
    _id: string;
    roundName: string;
    roundNumber: number;
    status: "pending" | "ongoing" | "completed";
    eventId: string;
    groups?: Group[];
    startTime?: string;
    gapMinutes?: number;
    matchesPerGroup?: number;
    qualifyingTeams?: number;
}

interface TournamentState {
    rounds: Round[];
    groups: Group[];

    // Group Pagination
    totalGroups: number;
    currentPage: number;
    totalPages: number;

    // Leaderboard
    leaderboard: Leaderboard | null;

    isLoading: boolean;
    isCreating: boolean;
    error: string | null;

    // Actions
    fetchRounds: (eventId: string) => Promise<void>;
    createRound: (eventId: string, params: { roundName?: string; startTime?: string; gapMinutes?: number; matchesPerGroup?: number; qualifyingTeams?: number }) => Promise<boolean>;
    updateRound: (roundId: string, roundName: string) => Promise<boolean>;
    updateRoundStatus: (roundId: string, status: "pending" | "ongoing" | "completed") => Promise<boolean>;
    deleteRound: (roundId: string) => Promise<boolean>;

    fetchGroups: (roundId: string, page?: number, limit?: number) => Promise<void>;
    createGroups: (roundId: string, totalMatch?: number, matchTime?: string) => Promise<boolean>;
    updateGroup: (groupId: string, data: { groupName?: string; totalMatch?: number; roomId?: number; roomPassword?: number; totalSelectedTeam?: number; matchTime?: string }) => Promise<boolean>;
    startEvent: (eventId: string) => Promise<boolean>;
    finishEvent: (eventId: string) => Promise<boolean>;

    fetchLeaderboard: (groupId: string) => Promise<void>;
    updateTeamScore: (groupId: string, teamId: string, stats: { kills?: number; position?: number; wins?: number; matchesPlayed?: number; score?: number; isQualified?: boolean }) => Promise<boolean>;
    updateGroupResults: (groupId: string, results: { teamId: string, rank: number, kills: number }[]) => Promise<boolean>;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
    rounds: [],
    groups: [],
    totalGroups: 0,
    currentPage: 1,
    totalPages: 1,

    isLoading: false,
    isCreating: false,
    error: null,

    fetchRounds: async (eventId) => {
        set({ isLoading: true, error: null });
        try {
            // Assuming getRounds can filter by eventId via query param or backend returns all rounds
            // Based on controller, getRounds returns all. Needs update in backend if it returns ALL rounds in DB.
            // But looking at round.controller.js implementation of getRounds usually just does .find({}). 
            // Wait, getRounds in controller currently does `Round.find({})`. This is BAD. It returns rounds for ALL events.
            // I should FIX the backend getRounds to accept eventId query param.

            const res = await axiosInstance.get(`/rounds?eventId=${eventId}`);
            // I will assume I will fix backend to support this query param.

            set({ rounds: res.data.data, isLoading: false });
        } catch (err) {
            const message = handleApiError(err, "Failed to fetch rounds");
            set({ isLoading: false, error: message });
        }
    },

    createRound: async (eventId, params) => {
        set({ isCreating: true, error: null });
        try {
            const res = await axiosInstance.post("/rounds/create", {
                eventId,
                ...params
            });
            const newRound = res.data.rounds; // Controller returns { rounds: newRound } confusingly named
            set((state) => ({
                rounds: [...state.rounds, newRound],
                isCreating: false
            }));
            return true;
        } catch (err) {
            const message = handleApiError(err, "Failed to create round");
            set({ isCreating: false, error: message });
            return false;
        }
    },

    updateRound: async (roundId, roundName) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.put(`/rounds/${roundId}`, { roundName });
            set((state) => ({
                rounds: state.rounds.map(r => r._id === roundId ? { ...r, roundName } : r),
                isLoading: false
            }));
            return true;
        } catch (err) {
            const message = handleApiError(err, "Failed to update round");
            set({ isLoading: false, error: message });
            return false;
        }
    },
    updateRoundStatus: async (roundId, status) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.put(`/rounds/${roundId}`, { status });
            set((state) => ({
                rounds: state.rounds.map(r => r._id === roundId ? { ...r, status } : r),
                isLoading: false
            }));
            return true;
        } catch (err) {
            const message = handleApiError(err, "Failed to update round status");
            set({ isLoading: false, error: message });
            return false;
        }
    },

    deleteRound: async (roundId) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/rounds/${roundId}`);
            set((state) => ({
                rounds: state.rounds.filter(r => r._id !== roundId),
                groups: [], // Clear groups as they belong to the deleted round (if it was selected)
                totalGroups: 0,
                isLoading: false
            }));
            return true;
        } catch (err) {
            const message = handleApiError(err, "Failed to delete round");
            set({ isLoading: false, error: message });
            return false;
        }
    },

    fetchGroups: async (roundId, page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get("/groups", {
                params: { roundId, page, limit }
            });

            set({
                groups: res.data.data,
                totalGroups: res.data.pagination.totalGroups,
                totalPages: res.data.pagination.totalPages,
                currentPage: res.data.pagination.currentPage,
                isLoading: false
            });
        } catch (err) {
            const message = handleApiError(err, "Failed to fetch groups");
            set({ isLoading: false, error: message });
        }
    },

    createGroups: async (roundId, totalMatch = 1, matchTime) => {
        set({ isCreating: true, error: null });
        try {
            const res = await axiosInstance.post("/groups/create", {
                roundId,
                totalMatch,
                matchTime
            });

            // Update rounds state to reflect the new groups count immediately
            set((state) => ({
                isCreating: false,
                rounds: state.rounds.map(r =>
                    r._id === roundId
                        ? { ...r, groups: res.data.groups }
                        : r
                )
            }));

            // Refresh groups for the current round grid
            await get().fetchGroups(roundId, 1);
            return true;
        } catch (err) {
            // Log error but don't crash
            console.error(err);
            const message = handleApiError(err, "Failed to create groups");
            set({ isCreating: false, error: message });
            return false;
        }
    },

    updateGroup: async (groupId, data) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.put(`/groups/${groupId}`, data);
            set((state) => ({
                groups: state.groups.map(g => g._id === groupId ? { ...g, ...data } : g),
                isLoading: false
            }));
            return true;
        } catch (err) {
            const message = handleApiError(err, "Failed to update group");
            set({ isLoading: false, error: message });
            return false;
        }
    },

    // Leaderboard State
    leaderboard: null,

    fetchLeaderboard: async (groupId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get(`/leaderboards/${groupId}`);
            set({ leaderboard: res.data, isLoading: false });
        } catch (err) {
            const message = handleApiError(err, "Failed to fetch leaderboard");
            set({ isLoading: false, error: message });
        }
    },

    updateTeamScore: async (groupId, teamId, stats) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.put(`/leaderboards/${groupId}/score`, {
                teamId,
                ...stats,
            });
            // Update local leaderboard state
            set((state) => ({
                leaderboard: state.leaderboard ? {
                    ...state.leaderboard,
                    teamScore: state.leaderboard.teamScore.map(t =>
                        t.teamId._id === teamId ? { ...t, ...stats, ...res.data.leaderboard?.teamScore?.find((TS: any) => TS.teamId === teamId) } : t
                    )
                } : null,
                isLoading: false
            }));
            return true;
        } catch (err) {
            const message = handleApiError(err, "Failed to update score");
            set({ isLoading: false, error: message });
            return false;
        }
    },

    updateGroupResults: async (groupId, results) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.put(`/leaderboards/${groupId}/results`, { results });

            // Update local state
            set((state) => ({
                isLoading: false,
                leaderboard: res.data.leaderboard,
                // Use actual group data from server which contains updated matchesPlayed and status
                groups: state.groups.map(g => g._id === groupId ? res.data.group : g),
                rounds: state.rounds.map(r => ({
                    ...r,
                    groups: r.groups?.map(g => g._id === groupId ? res.data.group : g)
                }))
            }));
            return true;
        } catch (err) {
            const message = handleApiError(err, "Failed to submit results");
            set({ isLoading: false, error: message });
            return false;
        }
    },

    startEvent: async (eventId) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.post(`/events/${eventId}/start`);
            set({ isLoading: false });
            return true;
        } catch (err) {
            const message = handleApiError(err, "Failed to start event");
            set({ isLoading: false, error: message });
            return false;
        }
    },
    finishEvent: async (eventId: string) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.post(`/events/${eventId}/finish`);
            set({ isLoading: false });
            return true;
        } catch (err) {
            const message = handleApiError(err, "Failed to finish event");
            set({ isLoading: false, error: message });
            return false;
        }
    }
}));
