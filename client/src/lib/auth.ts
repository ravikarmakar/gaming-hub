export const AUTH_CONFIG = {
  BASE_URL: import.meta.env.VITE_APP_BASE_URL || "http://localhost:5173",
  DISCORD_CLIENT_ID: import.meta.env.VITE_DISCORD_CLIENT_ID,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
};

export const SOCIAL_AUTH_REDIRECT_URIS = {
  DISCORD: `${AUTH_CONFIG.BASE_URL}/auth/discord/callback`,
  GOOGLE: `${AUTH_CONFIG.BASE_URL}/auth/google/callback`,
};

export const TOAST_OPTIONS = {
  icon: "🎮",
  style: {
    borderRadius: "10px",
    background: "#202020",
    color: "#fff",
  },
  duration: 3000,
};

export const ERROR_TOAST_OPTIONS = {
  icon: "⚠️",
  style: {
    borderRadius: "10px",
    background: "#202020",
    color: "#fff",
  },
  duration: 4000,
};
