import { axiosInstance } from "@/lib/axios";
import { AUTH_ENDPOINTS } from "../lib/endpoints";
import type { User } from "../types";

// ─── Response Types ─────────────────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  unreadCount?: number;
}

// ─── Pure API Layer ─────────────────────────────────────────────────────────
// No state management, no side effects. Just HTTP calls with typed returns.

export const authApi = {
  /** Fetch the authenticated user's profile via session cookie. */
  getProfile: async (skipCache = false): Promise<AuthResponse> => {
    const url = skipCache
      ? `${AUTH_ENDPOINTS.GET_PROFILE}?skipCache=true`
      : AUTH_ENDPOINTS.GET_PROFILE;
    const { data } = await axiosInstance.get<AuthResponse>(url);
    return data;
  },

  /** Email + password login. */
  login: async (identifier: string, password: string): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, {
      identifier,
      password,
    });
    return data;
  },

  /** Register a new account. */
  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, {
      username,
      email,
      password,
    });
    return data;
  },

  /** Logout — clears session cookie on the server. */
  logout: async (): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.LOGOUT);
    return data;
  },

  /** Refresh the access token using the refresh cookie. */
  refreshToken: async (): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.REFRESH_TOKEN);
    return data;
  },

  /** Google OAuth callback. */
  googleAuth: async (code: string): Promise<AuthResponse> => {
    const { data } = await axiosInstance.get<AuthResponse>(
      `${AUTH_ENDPOINTS.GOOGLE}?code=${encodeURIComponent(code)}`
    );
    return data;
  },

  /** Discord OAuth callback. */
  discordAuth: async (code: string): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(
      `${AUTH_ENDPOINTS.DISCORD}?code=${encodeURIComponent(code)}`
    );
    return data;
  },

  /** Send email verification OTP to the current user. */
  sendVerifyOtp: async (): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.SEND_VERIFY_OTP);
    return data;
  },

  /** Verify email with OTP. */
  verifyEmail: async (otp: string): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.VERIFY_ACCOUNT, {
      otp,
    });
    return data;
  },

  /** Send password reset OTP. */
  sendPassResetOtp: async (email: string): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.SEND_RESET_OTP, {
      email,
    });
    return data;
  },

  /** Verify the password reset OTP. */
  verifyPassResetOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.VERIFY_RESET_OTP, {
      email,
      otp,
    });
    return data;
  },

  /** Reset password using email + verified OTP + new password. */
  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.RESET_PASSWORD, {
      email,
      otp,
      newPassword,
    });
    return data;
  },

  /** Update user profile (multipart form data for avatar/cover upload). */
  updateProfile: async (formData: FormData): Promise<AuthResponse> => {
    const { data } = await axiosInstance.put<AuthResponse>(AUTH_ENDPOINTS.UPDATE_PROFILE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /** Update user settings (privacy, notifications). */
  updateSettings: async (settings: {
    allowChallenges?: boolean;
    allowMessages?: boolean;
  }): Promise<AuthResponse> => {
    const { data } = await axiosInstance.put<AuthResponse>(AUTH_ENDPOINTS.UPDATE_SETTINGS, settings);
    return data;
  },

  /** Permanently delete the current user's account. */
  deleteAccount: async (): Promise<AuthResponse> => {
    const { data } = await axiosInstance.delete<AuthResponse>(AUTH_ENDPOINTS.DELETE_ACCOUNT);
    return data;
  },
};
