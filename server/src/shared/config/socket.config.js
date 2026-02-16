import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import mongoose from "mongoose";
import { createAdapter } from "@socket.io/redis-adapter";
import Team from "../../modules/team/team.model.js";
import { logger } from "../utils/logger.js";
import { initializeIORedis } from "./ioredis.js";

let io;

/**
 * Mask PII (IDs) for logs to balance security and debuggability.
 * Masks short strings entirely and shows only start/end for standard IDs.
 */
const maskId = (id) => {
    if (!id) return "unknown";
    const str = id.toString();
    // For very short IDs, mask entirely to prevent accidental exposure
    if (str.length < 8) return "****";
    return `${str.substring(0, 4)}...${str.substring(str.length - 4)}`;
};

/**
 * Initialize Socket.IO server with authentication
 */
export const initializeSocket = async (httpServer) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        logger.error("CRITICAL: ACCESS_TOKEN_SECRET is not defined in environment variables");
        throw new Error("ACCESS_TOKEN_SECRET is required for Socket.IO authentication");
    }

    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST"],
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Attach Redis adapter for horizontal scaling (multi-process)
    const { pubClient, subClient } = await initializeIORedis();
    if (pubClient && subClient) {
        io.adapter(createAdapter(pubClient, subClient));
        logger.info("Socket.IO Redis adapter attached — horizontal scaling enabled.");
    } else {
        logger.warn("Socket.IO running without Redis adapter — single-process mode only.");
    }

    // Authentication middleware - use cookies like the rest of the app
    io.use((socket, next) => {
        try {
            // Extract cookies from handshake
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");
            const accessToken = cookies.accessToken;

            if (!accessToken) {
                return next(new Error("Authentication required"));
            }

            // Verify JWT token
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

            // Attach user data to socket
            socket.userId = decoded.userId;
            socket.roles = decoded.roles || [];

            logger.info(`Socket authenticated: ${maskId(socket.userId)}`);
            next();
        } catch (error) {
            logger.error("Socket authentication failed:", error.message);
            next(new Error("Invalid authentication"));
        }
    });

    // Connection handler
    io.on("connection", (socket) => {
        logger.info(`Client connected: ${socket.id} (User: ${maskId(socket.userId)})`);

        // Join team room
        socket.on("join:team", async (teamId) => {
            if (!teamId) return;

            // 1. Validate teamId format to prevent room name injection
            if (!mongoose.Types.ObjectId.isValid(teamId)) {
                logger.warn(`Invalid teamId format for join:team: ${maskId(teamId)} from user ${maskId(socket.userId)}`);
                return;
            }

            try {
                // 2. Authorization check: User must be a member of the team
                const isMember = await Team.exists({
                    _id: teamId,
                    "teamMembers.user": socket.userId,
                    isDeleted: false
                });

                if (!isMember) {
                    logger.warn(`Unauthorized join:team attempt: User ${maskId(socket.userId)} tried to join team ${maskId(teamId)}`);
                    socket.emit("error", { message: "Unauthorized to join this team room" });
                    return;
                }

                socket.join(`team:${teamId}`);
                logger.info(`User ${maskId(socket.userId)} joined team room: ${maskId(teamId)}`);
            } catch (error) {
                logger.error(`Error in join:team for team ${maskId(teamId)}:`, error.message);
            }
        });

        // Leave team room
        socket.on("leave:team", (teamId) => {
            if (!teamId) return;

            // Validate teamId format
            if (!mongoose.Types.ObjectId.isValid(teamId)) return;

            socket.leave(`team:${teamId}`);
            logger.info(`User ${maskId(socket.userId)} left team room: ${maskId(teamId)}`);
        });

        // Disconnect handler
        socket.on("disconnect", (reason) => {
            logger.info(`Client disconnected: ${socket.id} (Reason: ${reason})`);
        });

        // Error handler
        socket.on("error", (error) => {
            logger.error(`Socket error for ${socket.id}:`, error);
        });
    });

    logger.info("Socket.IO server initialized");
    return io;
};

/**
 * Get the Socket.IO instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized. Call initializeSocket first.");
    }
    return io;
};

/**
 * Emit event to a specific team room
 */
export const emitToTeam = (teamId, event, data) => {
    if (!io) {
        logger.warn("Socket.IO not initialized. Cannot emit event.");
        return;
    }

    // Validate teamId format before emitting
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        logger.warn(`Invalid teamId for emitToTeam: ${maskId(teamId)}`);
        return;
    }

    io.to(`team:${teamId}`).emit(event, data);
    logger.info(`Emitted ${event} to team:${maskId(teamId)}`);
};
