import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import { Team } from "../lib/types";
import { TEAM_ENDPOINTS } from "../lib/endpoints";

interface TeamListState {
    teamsById: Record<string, Team>;
    paginatedTeamIds: string[];
    pagination: {
        totalCount: number;
        currentPage: number;
        limit: number;
        hasMore: boolean;
    };
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTeams: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        region?: string;
        isRecruiting?: boolean;
        isVerified?: boolean;
        append?: boolean;
    }) => Promise<void>;
    fetchAllTeams: () => Promise<void>;
    updateTeamInList: (team: Team) => void;
    removeTeamFromList: (teamId: string) => void;
    clearError: () => void;
}

export const useTeamListStore = create<TeamListState>((set, get) => ({
    teamsById: {},
    paginatedTeamIds: [],
    pagination: {
        totalCount: 0,
        currentPage: 1,
        limit: 20,
        hasMore: false,
    },
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    updateTeamInList: (team) => {
        set((state) => ({
            teamsById: { ...state.teamsById, [team._id]: team },
        }));
    },

    removeTeamFromList: (teamId) => {
        set((state) => {
            const { [teamId]: removed, ...rest } = state.teamsById;
            return {
                teamsById: rest,
                paginatedTeamIds: state.paginatedTeamIds.filter(id => id !== teamId),
            };
        });
    },

    fetchAllTeams: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(TEAM_ENDPOINTS.GET_ALL);
            const teams: Team[] = response.data.data;

            const teamsById = teams.reduce((acc, team) => {
                acc[team._id] = team;
                return acc;
            }, {} as Record<string, Team>);

            set({
                teamsById: { ...get().teamsById, ...teamsById },
                isLoading: false
            });
        } catch (error) {
            set({ error: getErrorMessage(error, "Error fetching all teams"), isLoading: false });
        }
    },

    fetchTeams: async (params = {}) => {
        const { page = 1, limit = 20, search, region, isRecruiting, isVerified, append = false } = params;
        set({ isLoading: true, error: null });
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (search) queryParams.append("search", search);
            if (region) queryParams.append("region", region);
            if (isRecruiting !== undefined) queryParams.append("isRecruiting", isRecruiting.toString());
            if (isVerified !== undefined) queryParams.append("isVerified", isVerified.toString());

            const response = await axiosInstance.get(`${TEAM_ENDPOINTS.GET_ALL}?${queryParams.toString()}`);
            const teams: Team[] = response.data.data || [];
            const pagination = response.data.pagination;

            const newTeamsById = teams.reduce((acc, team) => {
                acc[team._id] = team;
                return acc;
            }, {} as Record<string, Team>);

            const newIds = teams.map(t => t._id);

            set((state) => ({
                teamsById: { ...state.teamsById, ...newTeamsById },
                paginatedTeamIds: append ? [...state.paginatedTeamIds, ...newIds] : newIds,
                pagination,
                isLoading: false,
            }));
        } catch (error) {
            set({ error: getErrorMessage(error, "Error fetching teams"), isLoading: false });
        }
    },
}));
