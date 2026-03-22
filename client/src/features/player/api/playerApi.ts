import { axiosInstance } from "@/lib/axios";
import { PLAYER_ROUTES } from "../lib/routes";
import { User } from "@/features/auth/lib/types";
import { ApiListResponse, ApiSingleResponse } from "@/lib/api-types";

export interface PlayerFilters {
    username?: string;
    esportsRole?: string;
    isAccountVerified?: boolean;
    isPlayerVerified?: boolean;
    hasTeam?: boolean;
    page?: number;
    limit?: number;
}

export const playerApi = {
    fetchPlayers: async (params: PlayerFilters = {}): Promise<ApiListResponse<User>> => {
        const response = await axiosInstance.get(PLAYER_ROUTES.ALL_PLAYERS, { params });
        return response.data;
    },

    fetchPlayerById: async (id: string): Promise<ApiSingleResponse<User>> => {
        const response = await axiosInstance.get(`/players/${id}`);
        return response.data;
    },

    searchPlayers: async (query: string, page = 1, limit = 20): Promise<{ players: User[]; pagination: any }> => {
        const response = await axiosInstance.get(PLAYER_ROUTES.ALL_PLAYERS, {
            params: { username: query, page, limit },
        });
        return response.data;
    },
};
