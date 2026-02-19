import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";

interface User {
    _id: string;
    username: string;
    email: string;
    avatar: string;
    isPlayerVerified: boolean;
    isBlocked: boolean;
    createdAt: string;
}

interface Team {
    _id: string;
    teamName: string;
    logo?: string;
    isBlocked: boolean;
    createdAt: string;
}

interface Organizer {
    _id: string;
    name: string;
    logo?: string;
    isBlocked: boolean;
    createdAt: string;
}

type Entity = User | Team | Organizer;

interface AdminState {
    entities: Entity[];
    totalEntities: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    isLoading: boolean;
    error: string | null;
    activeTab: string;
    searchQuery: string;
    entityType: "User" | "Team" | "Organizer";

    // Actions
    fetchEntities: (type: "User" | "Team" | "Organizer", page?: number, filter?: string, search?: string) => Promise<void>;
    updateEntityStatus: (type: "User" | "Team" | "Organizer", id: string, updates: any) => Promise<void>;
    setTab: (tab: string) => void;
    setSearch: (query: string) => void;
    setPage: (page: number) => void;
    setEntityType: (type: "User" | "Team" | "Organizer") => void;
    clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
    entities: [],
    totalEntities: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    isLoading: false,
    error: null,
    activeTab: "all",
    searchQuery: "",
    entityType: "User",

    clearError: () => set({ error: null }),

    setEntityType: (type) => {
        set({ entityType: type, activeTab: "all", searchQuery: "", currentPage: 1 });
        get().fetchEntities(type, 1, "all", "");
    },

    setTab: (tab) => {
        set({ activeTab: tab, currentPage: 1 });
        get().fetchEntities(get().entityType, 1, tab, get().searchQuery);
    },

    setSearch: (query) => {
        set({ searchQuery: query, currentPage: 1 });
        get().fetchEntities(get().entityType, 1, get().activeTab, query);
    },

    setPage: (page) => {
        set({ currentPage: page });
        get().fetchEntities(get().entityType, page, get().activeTab, get().searchQuery);
    },

    fetchEntities: async (type, page = 1, filter = "all", search = "") => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/admin/entities/${type}`, {
                params: {
                    page,
                    limit: get().pageSize,
                    search,
                    filter
                }
            });

            const { data, total, totalPages } = response.data;
            set({
                entities: data,
                totalEntities: total,
                totalPages,
                currentPage: page,
                isLoading: false,
                entityType: type
            });
        } catch (error: any) {
            set({
                error: getErrorMessage(error, `Error fetching ${type}s`),
                isLoading: false
            });
        }
    },

    updateEntityStatus: async (type, id, updates) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.patch(`/admin/entities/${type}/${id}/status`, updates);

            // Refresh current list
            await get().fetchEntities(type, get().currentPage, get().activeTab, get().searchQuery);

            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: getErrorMessage(error, `Error updating ${type} status`),
                isLoading: false
            });
        }
    }
}));
