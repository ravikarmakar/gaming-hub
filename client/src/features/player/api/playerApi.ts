import { axiosInstance } from "@/lib/axios";
import { PLAYER_ROUTES } from "../lib/routes";
import { User } from "@/features/auth";

import { Pagination } from "@/features/organizer/types";

export interface PlayerFilters {
    username?: string;
    esportsRole?: string;
    isAccountVerified?: boolean;
    isPlayerVerified?: boolean;
    hasTeam?: boolean;
    page?: number;
    limit?: number;
    [key: string]: any;
}

export const playerApi = {
    fetchPlayers: async (params: PlayerFilters = {}): Promise<{ players: User[]; pagination: Pagination }> => {
        const response = await axiosInstance.get(PLAYER_ROUTES.ALL_PLAYERS, { params });
        return response.data;
    },

    fetchPlayerById: async (id: string): Promise<{ player: User }> => {
        const response = await axiosInstance.get(`/players/${encodeURIComponent(id)}`);
        return response.data;
    },

    searchPlayers: async (query: string, page = 1, limit = 20): Promise<{ players: User[]; pagination: Pagination }> => {
        const response = await axiosInstance.get(PLAYER_ROUTES.ALL_PLAYERS, {
            params: { username: query, page, limit },
        });
        return response.data;
    },
};
