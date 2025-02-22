// import { axiosInstance } from "@/lib/axios";
// import { User } from "@/types";
// import { create } from "zustand";

// interface UserStoreTypes {
//   players: User[];
//   selectedUser: User | null;
//   isLoading: boolean;
//   hasMore: boolean;
//   cursor: null | string;
//   fetchPlayers: () => Promise<void>;
//   getOneUser: (id: string) => Promise<User>;
//   clearSelectedUser: () => void;
// }

// const usePlayerStore = create<UserStoreTypes>((set, get) => ({
//   players: [],
//   selectedUser: null,
//   isLoading: false,
//   hasMore: true,
//   cursor: null,

//   fetchPlayers: async () => {
//     if (!get().hasMore || get().isLoading) return;

//     set({ isLoading: true });

//     try {
//       const { data } = await axiosInstance.get("/users", {
//         params: { cursor: get().cursor, limit: 2 },
//       });

//       set((state) => ({
//         players: [...state.players, ...data.users],
//         cursor: data.nextCursor || null,
//         hasMore: data.hasMore,
//         isLoading: false,
//       }));
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       set({ isLoading: false });
//     }
//   },

//   getOneUser: async (id) => {
//     try {
//       const res = await axiosInstance.get(`/users/${id}`);

//       set({ selectedUser: res.data });
//       return res.data;
//     } catch (error) {
//       console.error("Error fetching user:", error);
//       throw error;
//     }
//   },

//   clearSelectedUser: () => set({ selectedUser: null }),
// }));

// export default usePlayerStore;
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
  setSearchTerm: (term: string) => void;
  fetchPlayers: (reset?: boolean) => Promise<void>;
  getOneUser: (id: string) => Promise<User>;
  clearSelectedUser: () => void;
}

const usePlayerStore = create<UserStoreTypes>((set, get) => ({
  players: [],
  selectedUser: null,
  isLoading: false,
  hasMore: true,
  cursor: null,
  searchTerm: "",

  setSearchTerm: (term) => {
    if (term === get().searchTerm) return; // अगर पहले से same search term है तो कुछ मत करो
    set({ searchTerm: term, cursor: null, players: [], hasMore: true });
    get().fetchPlayers(true);
  },

  fetchPlayers: async (reset = false) => {
    const { hasMore, isLoading, cursor, searchTerm, players } = get();

    if (!hasMore || isLoading) return; // Stop extra API calls

    set({ isLoading: true });

    try {
      const { data } = await axiosInstance.get("/users", {
        params: {
          cursor: reset ? null : cursor,
          limit: 2,
          search: searchTerm,
        },
      });

      const existingIds = new Set(players.map((p) => p._id));
      const newPlayers = data.users.filter(
        (p: User) => !existingIds.has(p._id)
      );

      set({
        players: reset ? data.users : [...players, ...newPlayers],
        cursor: data.nextCursor || null,
        hasMore: data.hasMore,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ isLoading: false });
    }
  },

  getOneUser: async (id) => {
    try {
      const res = await axiosInstance.get(`/users/${id}`);
      set({ selectedUser: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  clearSelectedUser: () => set({ selectedUser: null }),
}));

export default usePlayerStore;
