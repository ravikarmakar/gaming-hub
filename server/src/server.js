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

    app.listen(PORT, () => {
      logger.info(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();
