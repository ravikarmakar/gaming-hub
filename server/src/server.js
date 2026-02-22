import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app.js";
import connectDB from "./shared/config/db.js";
import { initializeSocket } from "./shared/config/socket.config.js";
import { initializeAdminGateway } from "./modules/admin/admin.gateway.js";

const PORT = process.env.PORT || 4000;

import { logger } from "./shared/utils/logger.js";

// Connect to database before starting server
const startServer = async () => {
  try {
    await connectDB();
    logger.info("Database connected successfully");

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    await initializeSocket(httpServer);
    initializeAdminGateway();

    httpServer.on("error", (error) => {
      logger.error("Server startup error:", error);
      process.exit(1);
    });

    httpServer.listen(PORT, () => {
      logger.info(`Server is running on port http://localhost:${PORT}`);
      logger.info("Socket.IO enabled for real-time updates");
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
