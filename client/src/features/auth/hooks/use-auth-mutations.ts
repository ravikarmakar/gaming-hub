import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type AuthResponse } from "../api/auth-api";
import { authKeys } from "./auth-keys";
import { broadcastLogout } from "./use-session-sync";

// ─── Notification Cache Sync ────────────────────────────────────────────────

const updateUnreadCountCache = async (unreadCount?: number) => {
  if (typeof unreadCount === "number") {
    try {
      const { queryClient } = await import("../../../lib/query-client");
      const { NOTIFICATIONS_KEYS } = await import(
        "../../notifications/hooks/notificationKeys"
      );
      queryClient.setQueryData(NOTIFICATIONS_KEYS.unreadCount(), unreadCount);
    } catch (error) {
      console.error("Failed to update unread count cache:", error);
    }
  }
};

// ─── Shared Helpers ─────────────────────────────────────────────────────────

/**
 * After a successful login/register/OAuth, set the user in cache
 * and sync the notification unread count.
 */
const onAuthSuccess = (
  queryClient: ReturnType<typeof useQueryClient>,
  response: AuthResponse
) => {
  if (response.user) {
    queryClient.setQueryData(authKeys.profile(false), response.user);
    updateUnreadCountCache(response.unreadCount);
  }
};

// ─── Login ──────────────────────────────────────────────────────────────────

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AuthResponse,
    Error,
    { identifier: string; password: string }
  >({
    mutationFn: ({ identifier, password }) => authApi.login(identifier, password),
    onSuccess: (data) => onAuthSuccess(queryClient, data),
  });
};

// ─── Register ───────────────────────────────────────────────────────────────

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AuthResponse,
    Error,
    { username: string; email: string; password: string }
  >({
    mutationFn: ({ username, email, password }) =>
      authApi.register(username, email, password),
    onSuccess: (data) => onAuthSuccess(queryClient, data),
  });
};

// ─── Logout ─────────────────────────────────────────────────────────────────

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, void>({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Always clear user cache, even on error (server may have destroyed session)
      queryClient.setQueryData(authKeys.profile(false), null);
      queryClient.setQueryData(authKeys.profile(true), null);
      // Clear all cached data for a clean slate
      queryClient.clear();
      // 10/10: Tell all other tabs to logout instantly
      broadcastLogout();
    },
  });
};

// ─── Google OAuth ───────────────────────────────────────────────────────────

export const useGoogleAuthMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, string>({
    mutationFn: (code: string) => authApi.googleAuth(code),
    onSuccess: (data) => onAuthSuccess(queryClient, data),
  });
};

// ─── Discord OAuth ──────────────────────────────────────────────────────────

export const useDiscordAuthMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, string>({
    mutationFn: (code: string) => authApi.discordAuth(code),
    onSuccess: (data) => onAuthSuccess(queryClient, data),
  });
};

// ─── Send Verification OTP ──────────────────────────────────────────────────

export const useSendVerifyOtpMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, void>({
    mutationFn: () => authApi.sendVerifyOtp(),
    onSuccess: (data) => {
      // Update user in cache if returned (may include updated OTP expiry)
      if (data.user) {
        queryClient.setQueryData(authKeys.profile(false), data.user);
      }
    },
  });
};

// ─── Verify Email ───────────────────────────────────────────────────────────

export const useVerifyEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, string>({
    mutationFn: (otp: string) => authApi.verifyEmail(otp),
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(authKeys.profile(false), data.user);
      }
    },
  });
};

// ─── Send Password Reset OTP ────────────────────────────────────────────────

export const useSendPassResetOtpMutation = () => {
  return useMutation<AuthResponse, Error, string>({
    mutationFn: (email: string) => authApi.sendPassResetOtp(email),
  });
};

// ─── Verify Password Reset OTP ──────────────────────────────────────────────

export const useVerifyPassResetOtpMutation = () => {
  return useMutation<AuthResponse, Error, { email: string; otp: string }>({
    mutationFn: ({ email, otp }) => authApi.verifyPassResetOtp(email, otp),
  });
};

// ─── Reset Password ─────────────────────────────────────────────────────────

export const useResetPasswordMutation = () => {
  return useMutation<
    AuthResponse,
    Error,
    { email: string; otp: string; newPassword: string }
  >({
    mutationFn: ({ email, otp, newPassword }) =>
      authApi.resetPassword(email, otp, newPassword),
  });
};

// ─── Update Profile ─────────────────────────────────────────────────────────

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, FormData>({
    mutationFn: (formData: FormData) => authApi.updateProfile(formData),
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.profile(false), data.user);
      }
    },
  });
};

// ─── Update Settings ────────────────────────────────────────────────────────

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AuthResponse,
    Error,
    { allowChallenges?: boolean; allowMessages?: boolean }
  >({
    mutationFn: (settings) => authApi.updateSettings(settings),
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.profile(false), data.user);
      }
    },
  });
};

// ─── Delete Account ─────────────────────────────────────────────────────────

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, void>({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(authKeys.profile(false), null);
        queryClient.setQueryData(authKeys.profile(true), null);
        queryClient.clear();
      }
    },
  });
};

// ─── Refresh Token (imperative, non-React) ──────────────────────────────────

/**
 * Imperative refresh token function for the axios interceptor.
 * Not a hook — called outside React component tree.
 */
export const refreshTokenFn = async (): Promise<void> => {
  try {
    const response = await authApi.refreshToken();
    if (response.user) {
      const { queryClient } = await import("../../../lib/query-client");
      queryClient.setQueryData(authKeys.profile(false), response.user);
      updateUnreadCountCache(response.unreadCount);
    }
  } catch (error) {
    // Clear user on refresh failure
    const { queryClient } = await import("../../../lib/query-client");
    queryClient.setQueryData(authKeys.profile(false), null);
    queryClient.setQueryData(authKeys.profile(true), null);
    throw error; // Re-throw for interceptor retry logic
  }
};
