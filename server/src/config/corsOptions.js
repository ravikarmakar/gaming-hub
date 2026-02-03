export const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_PRODUCTION_URL
      : process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], //"OPTIONS"
  // allowedHeaders: ["Content-Type", "Authorization"],
};
