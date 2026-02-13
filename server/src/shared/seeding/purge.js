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

        const operations = [
            { name: "User", op: User.deleteMany({}) },
            { name: "Team", op: Team.deleteMany({}) },
            { name: "Organizer", op: Organizer.deleteMany({}) },
            { name: "Event", op: Event.deleteMany({}) },
            { name: "JoinRequest", op: JoinRequest.deleteMany({}) },
            { name: "Invitation", op: Invitation.deleteMany({}) },
            { name: "Notification", op: Notification.deleteMany({}) },
            { name: "Redis", op: redis.flushall() },
        ];

        const results = await Promise.allSettled(operations.map(o => o.op));

        let anyFailed = false;
        results.forEach((result, index) => {
            if (result.status === "rejected") {
                logger.error(`❌ Failed to purge ${operations[index].name}:`, result.reason);
                anyFailed = true;
            } else {
                logger.info(`✅ Purged ${operations[index].name}`);
            }
        });

        if (anyFailed) {
            logger.warn("⚠️  Some purge operations failed.");
            process.exit(1);
        }

        logger.info("✅ All collections purged. Redis cache cleared.");

        // Graceful shutdown
        await mongoose.disconnect();
        // Upstash Redis is stateless (HTTP), no need to quit/disconnect

        process.exit(0);
    } catch (error) {
        logger.error("❌ Error during purge:", error);
        process.exit(1);
    }
};

purgeDatabase();
