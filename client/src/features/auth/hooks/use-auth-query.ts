import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "../../../lib/query-client";
import { authApi } from "../api/auth-api";
import { authKeys } from "./auth-keys";
import type { User } from "../types";

// ─── Notification Cache Sync ────────────────────────────────────────────────

const updateUnreadCountCache = async (unreadCount?: number) => {
  if (typeof unreadCount === "number") {
    try {
      const { NOTIFICATIONS_KEYS } = await import(
        "../../notifications/hooks/notificationKeys"
      );
      queryClient.setQueryData(NOTIFICATIONS_KEYS.unreadCount(), unreadCount);
    } catch (error) {
      console.error("Failed to update unread count cache:", error);
    }
  }
};

// ─── Core Auth Query ────────────────────────────────────────────────────────

/**
 * The core auth query that replaces `checkAuth` from Zustand.
 *
 * - Fetches the user profile on mount via session cookie
 * - Returns `null` for unauthenticated users (401)
 * - Syncs notification unread count on each successful fetch
 * - Never auto-refetches — profile updates are pushed via socket events
 *
 * @returns Standard useQuery result with `data` typed as `User | null`
 */
export const useAuthQuery = () => {
  return useQuery<User | null>({
    queryKey: authKeys.profile(false),
    queryFn: async () => {
      try {
        const response = await authApi.getProfile(false);
        updateUnreadCountCache(response.unreadCount);
        return response.user ?? null;
      } catch {
        // 401 = guest user (normal, not an error)
        return null;
      }
    },
    staleTime: Infinity, // Profile doesn't auto-refetch; socket handles updates
    gcTime: Infinity, // Never garbage-collected (always available)
    retry: false, // 401 means "not logged in", not a transient error
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

/**
 * Imperatively refetch the auth profile.
 * Used in non-React contexts (socket, interceptors, mutation callbacks).
 *
 * @param skipCache If true, adds ?skipCache=true to bypass Redis cache
 */
export const refetchAuthProfile = async (skipCache = false) => {
  if (skipCache) {
    // Force a fresh fetch from DB, bypassing any cached data
    try {
      const response = await authApi.getProfile(true);
      const user = response.user ?? null;
      queryClient.setQueryData(authKeys.profile(true), user);
      // We also update the standard profile cache to keep them in sync
      queryClient.setQueryData(authKeys.profile(false), user);
      updateUnreadCountCache(response.unreadCount);
    } catch {
      queryClient.setQueryData(authKeys.profile(true), null);
      queryClient.setQueryData(authKeys.profile(false), null);
    }
  } else {
    // Standard invalidation — triggers the queryFn
    await queryClient.invalidateQueries({ queryKey: authKeys.profile(false) });
  }
};

/**
 * Hook to get a refetch function that can be called from React components.
 * Wraps `queryClient.invalidateQueries` for the auth profile.
 */
export const useRefetchAuth = () => {
  const queryClient = useQueryClient();

  return async (skipCache = false) => {
    if (skipCache) {
      try {
        const response = await authApi.getProfile(true);
        const user = response.user ?? null;
        queryClient.setQueryData(authKeys.profile(true), user);
        queryClient.setQueryData(authKeys.profile(false), user);
        updateUnreadCountCache(response.unreadCount);
      } catch {
        queryClient.setQueryData(authKeys.profile(true), null);
        queryClient.setQueryData(authKeys.profile(false), null);
      }
    } else {
      await queryClient.invalidateQueries({ queryKey: authKeys.profile(false) });
    }
  };
};

/**
 * Imperative utility to GET the current auth profile from the query cache.
 * Replaces `useAuthStore.getState().user` for non-React contexts.
 * 
 * @returns The current User object or null
 */
export const getAuthProfile = (): User | null => {
  try {
    return queryClient.getQueryData<User | null>(authKeys.profile(false)) ?? null;
  } catch {
    return null;
  }
};
