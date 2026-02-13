export const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_PRODUCTION_URL || "https://mysite.com"
      : process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], //"OPTIONS"
  // allowedHeaders: ["Content-Type", "Authorization"],
};
