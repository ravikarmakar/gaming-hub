import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupAxiosInterceptors } from "./lib/axiosInterceptor";
import { useAuthStore } from "./features/auth/store/useAuthStore";

// Initialize Axios Interceptors via Dependency Injection
setupAxiosInterceptors(() => useAuthStore.getState().refreshToken());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 60000, // 1 minute
      gcTime: 300000,   // 5 minutes
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
