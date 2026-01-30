
import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { handleApiError } from "@/lib/api-helper";

// Types
export interface Team {
    _id: string;
    teamName: string;
    teamLogo?: string;
}

export interface Group {
    _id: string;
    groupName: string;
    totalMatch: number;
    matchTime: string;
    teams: Team[];
    roundId: string;
}

export interface Round {
    _id: string;
    roundName: string;
    roundNumber: number;
    status: "pending" | "ongoing" | "completed";
    eventId: string;
    groups?: Group[];
}

interface TournamentState {
    rounds: Round[];
    groups: Group[];

    // Group Pagination
    totalGroups: number;
    currentPage: number;
    totalPages: number;

    isLoading: boolean;
    isCreating: boolean;
    error: string | null;

    // Actions
    fetchRounds: (eventId: string) => Promise<void>;
    createRound: (eventId: string, roundName?: string) => Promise<boolean>;

    fetchGroups: (roundId: string, page?: number, limit?: number) => Promise<void>;
    createGroups: (roundId: string, totalMatch?: number, matchTime?: string) => Promise<boolean>;
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

    createRound: async (eventId, roundName) => {
        set({ isCreating: true, error: null });
        try {
            const res = await axiosInstance.post("/rounds/create", { eventId, roundName });
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
            await axiosInstance.post("/groups/create", {
                roundId,
                totalMatch,
                matchTime
            });
            set({ isCreating: false });
            // Refresh groups for the current round
            await get().fetchGroups(roundId, 1);
            return true;
        } catch (err) {
            // Log error but don't crash
            console.error(err);
            const message = handleApiError(err, "Failed to create groups");
            set({ isCreating: false, error: message });
            return false;
        }
    }

}));
