import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_MODE === "production"
      ? import.meta.env.VITE_PRODUCTION_BASE_URL
      : import.meta.env.VITE_DEVELOPMENT_BASE_URL,
  withCredentials: true,
});
