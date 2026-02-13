import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { logger } from "../utils/logger.js";

const connectDB = async () => {
  const DATABASE_URI =
    process.env.NODE_ENV === "production"
      ? process.env.MONGO_PRODUCTION_URI
      : process.env.MONGO_URI;

  if (!DATABASE_URI) {
    throw new Error("DATABASE_URI is not defined in environment variables");
  }
  try {
    const conn = await mongoose.connect(DATABASE_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host} `);
  } catch (error) {
    // Sanitize error message to avoid leaking credentials (e.g., in connection string)
    const sanitizedError = { ...error, message: error.message?.replace(/:[^@]+@/, ":****@") };
    logger.error("MongoDB Connection Error:", sanitizedError);
    throw error;
  }
};

export default connectDB;
