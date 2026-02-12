import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/user.model.js";
import Team from "../models/team.model.js";
import Organizer from "../models/organizer.model.js";
import Event from "../models/event.model.js";
import JoinRequest from "../models/join-request.model.js";
import Invitation from "../models/invitation.model.js";
import { Notification } from "../models/notification.model.js";
import { redis } from "../config/redis.js";

import { logger } from "../utils/logger.js";

const purgeDatabase = async () => {
    await connectDB();
    logger.info("🚀 Purging KRM Esports Database...");

    try {
        await Promise.all([
            User.deleteMany({}),
            Team.deleteMany({}),
            Organizer.deleteMany({}),
            Event.deleteMany({}),
            JoinRequest.deleteMany({}),
            Invitation.deleteMany({}),
            Notification.deleteMany({}),
            redis.flushall(), // Optional: Clear cache too
        ]);

        logger.info("✅ All collections purged. Redis cache cleared.");
        process.exit(0);
    } catch (error) {
        logger.error("❌ Error during purge:", error);
        process.exit(1);
    }
};

purgeDatabase();
