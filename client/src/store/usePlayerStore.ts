import { axiosInstance } from "@/lib/axios";
import { User } from "@/types";
import { create } from "zustand";

interface UserStoreTypes {
  players: User[];
  selectedUser: User | null;
  isLoading: boolean;
  hasMore: boolean;
  cursor: null | string;
  searchTerm: string;
  error: string | null;
  setSearchTerm: (term: string) => void;
  fetchPlayers: (reset?: boolean) => Promise<void>;
  getOneUser: (id: string) => Promise<User>;
  clearSelectedUser: () => void;
  clearError: () => void;
}

const usePlayerStore = create<UserStoreTypes>((set, get) => ({
  players: [],
  selectedUser: null,
  isLoading: false,
  hasMore: true,
  cursor: null,
  searchTerm: "",
  error: null,

  setSearchTerm: (term) => {
    const currentState = get();
    if (term === currentState.searchTerm) return;

    set({
      searchTerm: term,
      cursor: null,
      players: [],
      hasMore: true,
      error: null,
    });
    get().fetchPlayers(true);
  },

  fetchPlayers: async (reset = false) => {
    const { hasMore, isLoading, cursor, searchTerm, players } = get();

    if (!hasMore || isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const { data } = await axiosInstance.get("/users", {
        params: {
          cursor: reset ? null : cursor,
          limit: 10,
          search: searchTerm.trim(),
        },
      });

      const newUsers = data.users.filter(
        (user: User) => !players.some((p) => p._id === user._id)
      );

      set({
        players: reset ? data.users : [...players, ...newUsers],
        cursor: data.nextCursor || null,
        hasMore: data.hasMore,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({
        isLoading: false,
        error: "Failed to fetch players. Please try again later.",
        hasMore: false,
      });
    }
  },

  getOneUser: async (id) => {
    set({ error: null });
    try {
      const res = await axiosInstance.get(`/users/${id}`);
      set({ selectedUser: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      set({ error: "Failed to fetch user details." });
      throw error;
    }
  },

  clearSelectedUser: () => set({ selectedUser: null }),
  clearError: () => set({ error: null }),
}));

export default usePlayerStore;
