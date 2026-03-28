import { useMemo } from "react";
import { useAuthQuery } from "./use-auth-query";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGoogleAuthMutation,
  useDiscordAuthMutation,
} from "./use-auth-mutations";
import { useAuthSelector } from "./use-auth-selector";

/**
 * useAuth - The Master Hook for Authentication
 * 
 * Aggregates all auth state, indicators, and actions into a single 10/10 API.
 * This is the primary point of entry for secondary developers adding auth features.
 */
export const useAuth = () => {
  // 1. Data & Status (using the optimized query)
  const { data: user, status, isLoading, isError, isFetched } = useAuthQuery();
  
  // 2. High-performance selectors (re-render only on specific changes)
  const { data: isAuthenticated } = useAuthSelector((user) => !!user);
  const { data: isVerified } = useAuthSelector((user) => user.isAccountVerified ?? false);
  const { data: userRole } = useAuthSelector((user) => user.esportsRole ?? "player");

  // 3. Mutations
  const login = useLoginMutation();
  const logout = useLogoutMutation();
  const register = useRegisterMutation();
  const google = useGoogleAuthMutation();
  const discord = useDiscordAuthMutation();

  // 4. Combined UI States
  const isAuthenticating = 
    login.isPending || 
    register.isPending || 
    google.isPending || 
    discord.isPending;

  // 5. Memoized Result for 10/10 Performance
  return useMemo(
    () => ({
      // State
      user,
      isAuthenticated,
      isVerified,
      userRole,
      status,
      
      // Indicators
      isLoading,
      isAuthenticating,
      isError,
      isFetched,
      
      // Actions
      actions: {
        login: login.mutateAsync,
        logout: logout.mutateAsync,
        register: register.mutateAsync,
        google: google.mutateAsync,
        discord: discord.mutateAsync,
      },
      
      // Raw Mutation Objects (for error/pending access)
      mutations: {
        login,
        register,
        logout,
        google,
        discord
      }
    }),
    [
      user, 
      isAuthenticated, 
      isVerified, 
      userRole, 
      status, 
      isLoading, 
      isAuthenticating, 
      isError, 
      isFetched,
      login, register, logout, google, discord
    ]
  );
};
