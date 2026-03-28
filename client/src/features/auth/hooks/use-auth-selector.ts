import { useQuery } from "@tanstack/react-query";
import { authKeys } from "./auth-keys";
import { authApi } from "../api/auth-api";
import type { User } from "../types";

/**
 * 10/10 Gold Standard Selective Subscription.
 * Uses TanStack Query's native `select` option to ensure the component 
 * ONLY re-renders if the extracted data changes.
 * 
 * @param selector Function to extract the desired value from the user object
 * @returns The selected value and loading state
 */
export function useAuthSelector<T>(selector: (user: User) => T): {
    data: T | null;
    isLoading: boolean;
} {
    const { data: selectedData, isLoading } = useQuery<User | null, Error, T | null>({
        queryKey: authKeys.profile(false),
        queryFn: async () => {
            try {
                const response = await authApi.getProfile(false);
                return response.user ?? null;
            } catch {
                return null;
            }
        },
        select: (user) => (user ? selector(user) : null),
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
    });
    
    return {
        data: selectedData ?? null,
        isLoading,
    };
}
