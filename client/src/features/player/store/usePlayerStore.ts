import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { User } from "@/features/auth/lib/types";

interface PlayerStoreState {
  players: User[] | null;
  selectedPlayer: User | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  fetchPlayers: (params?: {
    username?: string;
    esportsRole?: string;
    isAccountVerified?: boolean;
    hasTeam?: boolean;
    page?: number;
    limit?: number;
    append?: boolean;
  }) => Promise<void>;
  fetchPlayerById: (id: string, forceRefresh?: boolean) => Promise<User | null>;
  searchByUsername: (query: string, page?: number, limit?: number) => Promise<void>;
  clearPlayers: () => void;
}

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  players: [],
  isLoading: false,
  error: null,
  hasMore: true,
  selectedPlayer: null,
  totalCount: 0,
  currentPage: 1,

  fetchPlayers: async (params = {}) => {
    const { append = false, ...queryParams } = params;

    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get("/players", {
        params: queryParams,
      });

      const { players, pagination } = response.data;

      set((state) => ({
        players: append ? [...(state.players || []), ...players] : players,
        hasMore: pagination.hasMore,
        totalCount: pagination.totalCount,
        currentPage: pagination.currentPage,
        isLoading: false,
        error: null,
      }));
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to fetch players",
      });
    }
  },

  fetchPlayerById: async (id: string, forceRefresh = false) => {
    // Check if player is already in store and matches requested id
    const state = get();
    if (!forceRefresh && state.selectedPlayer && state.selectedPlayer._id === id) {
      return state.selectedPlayer;
    }

    set({ isLoading: true, error: null });

    try {
      const { data } = await axiosInstance.get(`/players/${id}`);
      set({ selectedPlayer: data.player, isLoading: false, error: null });
      return data.player;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to fetch player",
      });
      return null;
    }
  },

  searchByUsername: async (query, page = 1, limit = 20) => {
    await get().fetchPlayers({
      username: query,
      page,
      limit,
    });
  },

  clearPlayers: () => {
    set({
      players: [],
      hasMore: true,
      error: null,
      totalCount: 0,
      currentPage: 1,
      isLoading: false
    });
  },
}));
