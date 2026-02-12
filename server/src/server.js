import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./shared/config/db.js";

const PORT = process.env.PORT || 4000;

import { logger } from "./shared/utils/logger.js";

app.listen(PORT, () => {
  logger.info(`Server is running on port http://localhost:${PORT}`);
  connectDB();
});
