import { useAuthStore } from "./useAuthStore";

// Selective store hooks to prevent unnecessary re-renders
// Only subscribe to specific slices of state

export const useUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useCheckingAuth = () => useAuthStore((state) => state.checkingAuth);
export const useIsVerifying = () => useAuthStore((state) => state.isVerifying);