import { useAuthQuery } from "./use-auth-query";
import type { User } from "../types";

/**
 * Convenience hook for the most common auth usage pattern:
 *   `const { user } = useCurrentUser()`
 *
 * Replaces the ubiquitous `const { user } = useAuthStore()` across 20+ files.
 * Provides the authenticated user (or null) plus auth loading state.
 */
export const useCurrentUser = (): {
  user: User | null;
  isLoading: boolean;
} => {
  const { data, isLoading } = useAuthQuery();

  return {
    user: data ?? null,
    isLoading,
  };
};
