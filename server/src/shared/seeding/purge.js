import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../../modules/user/user.model.js";
import Team from "../../modules/team/team.model.js";
import Organizer from "../../modules/organizer/organizer.model.js";
import Event from "../../modules/event/event.model.js";
import JoinRequest from "../../modules/join-request/join-request.model.js";
import Invitation from "../../modules/invitation/invitation.model.js";
import { Notification } from "../../modules/notification/notification.model.js";
import { redis } from "../config/redis.js";

import { logger } from "../utils/logger.js";

const purgeDatabase = async () => {
    const allowedEnvironments = ["development", "test"];
    const currentEnv = process.env.NODE_ENV;

    if (!currentEnv || !allowedEnvironments.includes(currentEnv)) {
        logger.error(`❌ Purge operation is NOT allowed in '${currentEnv}' environment!`);
        logger.error("   Strictly limited to 'development' and 'test' environments.");
        process.exit(1);
    }

    logger.warn(`⚠️  WARNING: You are about to purge the database in ${currentEnv} environment!`);
    logger.info("🚀 Purging KRM Esports Database...");

    try {
        await connectDB();

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
