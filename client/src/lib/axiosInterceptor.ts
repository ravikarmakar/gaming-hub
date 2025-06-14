import { axiosInstance } from "./axios";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { AxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<void> | null = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !(originalRequest.url && originalRequest.url.includes("/auth/login")) &&
      !(
        originalRequest.url &&
        originalRequest.url.includes("/auth/refresh-token")
      )
    ) {
      originalRequest._retry = true;

      try {
        if (refreshPromise) {
          await refreshPromise;
          return axiosInstance(originalRequest);
        }

        refreshPromise = useAuthStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
