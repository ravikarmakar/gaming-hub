import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./shared/config/db.js";

const PORT = process.env.PORT || 4000;

import { logger } from "./shared/utils/logger.js";

// Connect to database before starting server
const startServer = async () => {
  try {
    await connectDB();
    logger.info("Database connected successfully");

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      logger.error("Server startup error:", error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
