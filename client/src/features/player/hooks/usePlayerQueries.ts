import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData, keepPreviousData } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { playerApi, PlayerFilters } from "../api/playerApi";
import { playerKeys } from "./playerKeys";

// --- LIST PLAYERS ---
export const usePlayersQuery = (
    filters: PlayerFilters = {},
    options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof playerApi.fetchPlayers>>, AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: playerKeys.list(filters),
        queryFn: () => playerApi.fetchPlayers(filters),
        ...options,
    });
};

// --- INFINITE LIST PLAYERS ---
export const useInfinitePlayersQuery = (
    filters: Omit<PlayerFilters, 'page'> = {},
    options?: Omit<UseInfiniteQueryOptions<Awaited<ReturnType<typeof playerApi.fetchPlayers>>, AxiosError, InfiniteData<Awaited<ReturnType<typeof playerApi.fetchPlayers>>, number>, readonly unknown[], number>, "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam">
) => {
    const { limit = 20, ...restFilters } = filters;
    return useInfiniteQuery({
        queryKey: [...playerKeys.lists(), 'infinite', { ...restFilters, limit }],
        queryFn: ({ pageParam }) => playerApi.fetchPlayers({ ...restFilters, page: pageParam as number, limit }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { pagination } = lastPage;
            // Server returns currentPage and hasMore
            if (pagination && pagination.hasMore && pagination.currentPage !== undefined) {
                return pagination.currentPage + 1;
            }
            return undefined;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,

        staleTime: 1000 * 60 * 30,   // 30 min
        gcTime: 1000 * 60 * 60,      // 1 hour

        placeholderData: keepPreviousData,
        ...options,
    });

};

// --- PLAYER BY ID ---
export const usePlayerByIdQuery = (
    id: string,
    options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof playerApi.fetchPlayerById>>, AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        ...options,
        queryKey: playerKeys.detail(id),
        queryFn: () => playerApi.fetchPlayerById(id),
        enabled: (options?.enabled !== false) && !!id,
    });
};

// --- SEARCH PLAYERS ---
export const useSearchPlayersQuery = (
    query: string,
    page: number = 1,
    limit: number = 20,
    options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof playerApi.searchPlayers>>, AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery({
        ...options,
        queryKey: [...playerKeys.lists(), 'search', query, page, limit],
        queryFn: () => playerApi.searchPlayers(query, page, limit),
        enabled: (options?.enabled !== false) && query.length > 0,
    });
};
