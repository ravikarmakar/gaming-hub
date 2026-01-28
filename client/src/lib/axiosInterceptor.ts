import { axiosInstance } from "./axios";
import type { AxiosRequestConfig } from "axios";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { AUTH_ENDPOINTS } from "@/features/auth/lib/endpoints";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<void> | null = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Only intercept 401s, skip auth endpoints that handle their own errors
    const shouldIntercept =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !(originalRequest.url && originalRequest.url.includes(AUTH_ENDPOINTS.LOGIN)) &&
      !(originalRequest.url && originalRequest.url.includes(AUTH_ENDPOINTS.LOGOUT)) &&
      !(originalRequest.url && originalRequest.url.includes(AUTH_ENDPOINTS.REFRESH_TOKEN));

    if (shouldIntercept) {
      originalRequest._retry = true;

      try {
        // Wait for existing refresh if in progress
        if (refreshPromise) {
          await refreshPromise;
          return axiosInstance(originalRequest);
        }

        // Try to refresh token
        refreshPromise = useAuthStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        // Retry original request with new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
